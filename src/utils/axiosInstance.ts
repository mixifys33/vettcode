import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000",
  withCredentials: true,
});

let isRefreshing = false;
let refreshSubscribers: ((token?: string) => void)[] = [];

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/signup",
  "/products",
  "/product",
  "/search",
  "/become-seller",
  "/about",
  "/contact",
  "/terms",
  "/privacy",
  "/faq",
];

// Check if current route is public
const isPublicRoute = () => {
  const pathname = window.location.pathname;
  return PUBLIC_ROUTES.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
};

// Handle logout - only redirect if on protected route
const handleLogout = () => {
  // Clear any stored tokens
  localStorage.removeItem("accessToken");
  
  // Only redirect to login if user is on a protected route
  if (!isPublicRoute() && window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
};

// Queue requests while refreshing
const subscribeTokenRefresh = (callback: (token?: string) => void) => {
  refreshSubscribers.push(callback);
};

const onRefreshSuccess = (token?: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

// Request interceptor (optional, e.g., attach access token)
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh(() => resolve(axiosInstance(originalRequest)));
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/api/refresh-token`,
          {},
          { withCredentials: true }
        );

        // Save new token if returned
        if (data?.accessToken) {
          localStorage.setItem("accessToken", data.accessToken);
        } else if (data?.token) {
          localStorage.setItem("accessToken", data.token);
        }

        isRefreshing = false;
        onRefreshSuccess(data?.accessToken);

        return axiosInstance(originalRequest);
      } catch (err) {
        isRefreshing = false;
        refreshSubscribers = [];
        handleLogout();
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
