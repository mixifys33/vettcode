"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import Link from "next/link";
import GoogleButton from "../../../shared/components/google-button";
import { Eye, EyeOff } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";


type FormData = {
  email: string;
  password: string;
};

const Login = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverSuccess, setServerSuccess] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const loginMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/login-user`,
        data,
        { withCredentials: true}
      );
        return response.data;
    },
    onSuccess: (data) => {
      setServerError(null);
      const successMessage = data.message || "Login successful! Redirecting...";
      setServerSuccess(successMessage);

      // Save token to localStorage for axiosInstance to use
      if (data?.token) {
        localStorage.setItem("accessToken", data.token);
      }

      // Small delay to show success message before redirect
      setTimeout(() => {
        router.push("/");
      }, 1000);
    },
    onError: (error:AxiosError) => {
      setServerSuccess(null);
      let errorMessage = "An error occurred. Please try again.";

      if (error.response) {
        // Backend responded with error
        const responseData = error.response.data as any;
        errorMessage = responseData?.message ||
                       responseData?.error ||
                       `Error: ${error.response.status} - ${error.response.statusText}`;
      } else if (error.request) {
        // Request made but no response
        errorMessage = "Network error. Please check your connection and try again.";
      } else {
        // Something else happened
        errorMessage = error.message || "Invalid credentials";
      }

      setServerError(errorMessage);
    },
  });


  const onSubmit = (data: FormData) => {
    // Clear previous messages when submitting new form
    setServerError(null);
    setServerSuccess(null);
    loginMutation.mutate(data);
  };

  return (
    <div className="w-full py-10 min-h-[85vh] bg-[#f1f1f1]">
      <h1 className="text-3xl sm:text-3.4xl md:text-3.6xl lg:text-6xl font-Poppins font-semibold text-center bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient bg-[length:200%_200%]">
        Login
      </h1>

      <p className="text-center text-lg font-medium py-3 text-[#00000099]">
        Home . Login
      </p>

      <div className="w-full flex justify-center">
        <div className="md:w-[480px] p-8 bg-white shadow rounded-lg">
          <h3 className="text-[1.3rem] sm:text-2.5xl md:text-[1.7rem] lg:text-3xl font-Poppins font-semibold text-center mb-2 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 bg-clip-text text-transparent animate-gradient bg-[length:200%_200%]">
            Login to vettcode
          </h3>


          <p className="text-center text-gray-500 mb-4">
            Don&apos;t have an account?{" "}
            <Link href={"/signup"} className="text-blue-500">
              Sign Up
            </Link>
          </p>

          <GoogleButton
            mode="login"
            onSuccess={() => {
              setGoogleError(null);
              setServerSuccess("Google login successful! Redirecting...");
              setTimeout(() => {
                router.push("/");
              }, 1000);
            }}
            onError={(error) => {
              setGoogleError(error);
              setServerSuccess(null);
            }}
          />

          {googleError && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm font-medium">{googleError}</p>
            </div>
          )}

          <div className="flex items-center my-5 text-gray-400 text-sm">
            <div className="flex-1 border-t border-gray-300" />
            <span className="px-3">or Sign in with Email</span>
            <div className="flex-1 border-t border-gray-300" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Email */}
            <label className="block text-gray-700 mb-1">Email</label>
            <input
              type="email"
              placeholder="adorablemasereka85@gmail.com"
              className="w-full p-2 border border-gray-300 outline-0 rounded mb-1"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                  message: "Invalid email address",
                },
              })}
            />
            {errors.email && (
              <p className="text-red-500 text-sm">
                {String(errors.email.message)}
              </p>
            )}

            {/* Password */}
            <label className="block text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={passwordVisible ? "text" : "password"}
                placeholder="Min. 6 characters "
                className="w-full p-2 border border-gray-300 outline-0 rounded mb-1"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
              />

              <button
                type="button"
                onClick={() => setPasswordVisible(!passwordVisible)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-400"
              >
                {passwordVisible ? <Eye /> : <EyeOff />}
              </button>

              {errors.password && (
                <p className="text-red-500 text-sm">
                  {String(errors.password.message)}
                </p>
              )}
            </div>

            {/* Remember Me + Forgot Password */}
            <div className="flex justify-between items-center my-4">
              <label className="flex items-center text-gray-600">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                />
                Remember me
              </label>

              <Link href={"/forgot-password"} className="text-blue-500 text-sm">
                Forgot Password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full flex items-center justify-center text-base sm:text-lg md:text-xl lg:text-1.5xl font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white py-1.5 sm:py-2 md:py-2.6 rounded-lg shadow-md transition-all duration-300 ease-in-out hover:from-purple-600 hover:to-blue-500 hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={loginMutation.isPending}
            >
              {loginMutation?.isPending ? (
                <div className="w-6 h-6 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
              ) : (
                "Login"
              )}
            </button>



            {/* Success Message */}
            {serverSuccess && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-700 text-sm font-medium">{serverSuccess}</p>
              </div>
            )}

            {/* Error Message */}
            {serverError && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-700 text-sm font-medium">{serverError}</p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
