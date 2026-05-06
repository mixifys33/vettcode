import axiosInstance from "@/utils/axiosInstance";
import { useQuery } from "@tanstack/react-query";

// Fetch user data from API
const fetchUser = async () => {
  try {
    const res = await axiosInstance.get("/api/logged-in-user");
    // Return null instead of undefined if user doesn't exist
    return res.data?.user ?? null;
  } catch (error: any) {
    // Return null for auth errors (user not logged in)
    if (error?.response?.status === 401 || error?.response?.status === 403) {
      return null;
    }
    throw error;
  }
};

const useUser = () => {
  const {
    data: user,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["user"],
    queryFn: fetchUser,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false, // Don't retry auth requests
  });

  return { user, isLoading, isError, refetch };
};

export default useUser;

