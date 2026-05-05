"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import Link from "next/link";
import GoogleButton from "../../../shared/components/google-button";
import { Eye, EyeOff, Code2, Shield, Zap } from "lucide-react";
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
    <div className="relative min-h-screen w-full overflow-hidden" style={{ background: "linear-gradient(135deg, #0a1628 0%, #0f2744 50%, #1a1f3a 100%)" }}>
      
      {/* Animated code background */}
      <div className="absolute inset-0 opacity-10 overflow-hidden">
        <pre className="text-blue-400 text-xs font-mono leading-relaxed animate-scroll-up">
{`import { NextResponse } from "next/server";
const user = await getAuth(req);
if (!user) return NextResponse.json({ error: "Unauthorized" });
export async function GET(req: NextRequest) {
  const params = searchParams.get("id");
  if (!params) return null;
  const data = await prisma.user.findUnique({
    where: { id: params },
  });
  return data;
}

async function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    return decoded;
  } catch (error) {
    throw new Error("Invalid token");
  }
}

const response = await fetch("/api/data");
const json = await response.json();
console.log(json);`}
        </pre>
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(139,92,246,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.5) 1px, transparent 1px)", backgroundSize: "50px 50px" }} />

      {/* Glowing orbs */}
      <div className="absolute top-20 right-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse" style={{ background: "radial-gradient(circle, #8b5cf6, transparent 70%)" }} />
      <div className="absolute bottom-20 left-1/4 w-80 h-80 rounded-full opacity-15 blur-3xl animate-pulse animation-delay-2000" style={{ background: "radial-gradient(circle, #6366f1, transparent 70%)" }} />

      {/* Content */}
      <div className="relative z-10 w-full min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          
          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg">
                <Code2 className="w-7 h-7 text-white" />
              </div>
              <span className="text-3xl font-black text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                VETT<span className="text-purple-400">CODE</span>
              </span>
            </Link>
            <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-gray-400 text-sm">Sign in to access your verified codebases</p>
          </div>

          {/* Login Card */}
          <div className="backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-8" style={{ background: "rgba(15, 23, 42, 0.8)" }}>
            
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
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm font-medium">{googleError}</p>
              </div>
            )}

            <div className="flex items-center my-6 text-gray-500 text-sm">
              <div className="flex-1 border-t border-white/10" />
              <span className="px-4">or continue with email</span>
              <div className="flex-1 border-t border-white/10" />
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-gray-300 mb-2 text-sm font-semibold">Email Address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                      message: "Invalid email address",
                    },
                  })}
                />
                {errors.email && (
                  <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-red-400" />
                    {String(errors.email.message)}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-gray-300 mb-2 text-sm font-semibold">Password</label>
                <div className="relative">
                  <input
                    type={passwordVisible ? "text" : "password"}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all pr-12"
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
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-400 transition-colors"
                  >
                    {passwordVisible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-red-400" />
                    {String(errors.password.message)}
                  </p>
                )}
              </div>

              {/* Remember Me + Forgot Password */}
              <div className="flex justify-between items-center">
                <label className="flex items-center text-gray-400 text-sm cursor-pointer group">
                  <input
                    type="checkbox"
                    className="mr-2 w-4 h-4 rounded border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500/50"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                  />
                  <span className="group-hover:text-gray-300 transition-colors">Remember me</span>
                </label>

                <Link href="/forgot-password" className="text-purple-400 text-sm font-semibold hover:text-purple-300 transition-colors">
                  Forgot Password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full py-3.5 rounded-xl font-bold text-white text-base shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, #8b5cf6, #6366f1)" }}
              >
                {loginMutation.isPending ? (
                  <>
                    <div className="w-5 h-5 border-3 border-t-transparent border-white rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    <span>Sign In</span>
                  </>
                )}
              </button>

              {/* Success Message */}
              {serverSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                  <p className="text-emerald-400 text-sm font-medium flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    {serverSuccess}
                  </p>
                </div>
              )}

              {/* Error Message */}
              {serverError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-sm font-medium">{serverError}</p>
                </div>
              )}
            </form>

            {/* Sign Up Link */}
            <p className="text-center text-gray-400 text-sm mt-6">
              Don't have an account?{" "}
              <Link href="/signup" className="text-purple-400 font-semibold hover:text-purple-300 transition-colors">
                Sign Up
              </Link>
            </p>
          </div>

          {/* Trust Badges */}
          <div className="mt-8 flex items-center justify-center gap-6 text-gray-500 text-xs">
            <div className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-purple-400" />
              <span>Secure Login</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-gray-600" />
            <div className="flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-purple-400" />
              <span>Verified Platform</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll-up {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-50%);
          }
        }
        .animate-scroll-up {
          animation: scroll-up 20s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Login;
