"use client";

import React from "react";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface GoogleButtonProps {
  mode?: "login" | "signup";
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const GoogleButton: React.FC<GoogleButtonProps> = ({ 
  mode = "login",
  onSuccess,
  onError 
}) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const googleAuthMutation = useMutation({
    mutationFn: async (data: { access_token: string; user_info: any }) => {
      const endpoint = mode === "login" 
        ? `${process.env.NEXT_PUBLIC_SERVER_URL}/api/google-login`
        : `${process.env.NEXT_PUBLIC_SERVER_URL}/api/google-signup`;
      
      const response = await axios.post(
        endpoint,
        { 
          access_token: data.access_token,
          user_info: data.user_info,
        },
        { withCredentials: true }
      );
      return response.data;
    },
    onSuccess: (data) => {
      // Save token so axiosInstance attaches it on every request
      if (data?.token) {
        localStorage.setItem("accessToken", data.token);
      }

      // Invalidate the cached user query so useUser refetches immediately
      queryClient.invalidateQueries({ queryKey: ["user"] });

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/");
        router.refresh();
      }
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          "Google authentication failed. Please try again.";
      if (onError) {
        onError(errorMessage);
      } else {
        console.error("Google auth error:", errorMessage);
      }
    },
  });

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // Fetch user info from Google using the access token
        const userInfoResponse = await axios.get(
          `https://www.googleapis.com/oauth2/v2/userinfo`,
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          }
        );

        const userInfo = userInfoResponse.data;
        
        // Send user info to backend (backend will verify the access token)
        googleAuthMutation.mutate({
          access_token: tokenResponse.access_token,
          user_info: userInfo,
        });
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 
                           "Failed to authenticate with Google. Please try again.";
        if (onError) {
          onError(errorMessage);
        } else {
          console.error("Google OAuth error:", error);
        }
      }
    },
    onError: (error) => {
      const errorMessage = "Failed to authenticate with Google. Please try again.";
      if (onError) {
        onError(errorMessage);
      } else {
        console.error("Google OAuth error:", error);
      }
    },
  });

  const buttonText = mode === "login" ? "Sign in with Google" : "Sign up with Google";

  return (
    <button
      onClick={() => handleGoogleLogin()}
      disabled={googleAuthMutation.isPending}
      className="flex items-center justify-center w-full h-12 border border-gray-300 rounded shadow hover:shadow-md transition-all bg-white disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {googleAuthMutation.isPending ? (
        <div className="w-6 h-6 border-3 border-t-transparent border-gray-700 rounded-full animate-spin"></div>
      ) : (
        <>
          <svg
            className="w-6 h-6 mr-3"
            viewBox="0 0 533.5 544.3"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M533.5 278.4c0-17.4-1.5-34.1-4.3-50.4H272v95.4h146.9c-6.4 34.7-25.3 64-54 83.8l87 67.9c50.9-46.9 81.6-116 81.6-196.7z"
              fill="#4285F4"
            />
            <path
              d="M272 544.3c73.2 0 134.7-24.2 179.6-65.7l-87-67.9c-24.3 16.4-55.2 26.1-92.6 26.1-71.3 0-131.7-48.1-153.5-112.9l-89.4 69c43.8 86.1 133.4 150.4 242.9 150.4z"
              fill="#34A853"
            />
            <path
              d="M118.4 330.8c-10.4-30.3-10.4-62.8 0-93.1l-89.4-69C2.3 222.7 0 256.3 0 272c0 15.7 2.3 49.3 28.9 103.3l89.5-69.5z"
              fill="#FBBC05"
            />
            <path
              d="M272 107.7c39.8-.6 77.9 14.2 106.8 41l80-80.3C406.3 24.3 345.2 0 272 0 162.5 0 72.9 64.3 29.1 150.4l89.4 69c21.8-64.8 82.2-113.7 153.5-111.7z"
              fill="#EA4335"
            />
          </svg>
          <span className="text-gray-700 font-medium">{buttonText}</span>
        </>
      )}
    </button>
  );
};

export default GoogleButton;

