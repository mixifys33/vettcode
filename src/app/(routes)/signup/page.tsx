"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import Link from "next/link";
import GoogleButton from "../../../shared/components/google-button";
import { Eye, EyeOff, Code2, Shield, Sparkles, Mail } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";


type FormData = {
  name: string;
  email: string;
  password: string;
};

const Signup = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [timer, setTimer] = useState(60);
  const [otp, setOtp] = useState(["","","","","",""]);
  const [showOtp, setShowOtp] = useState(false);
  const [userData, setUserData] = useState<FormData | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null )[] >([]);
  const [signupButtonText, setSignupButtonText] = useState("Create Account");
  const [showSpinner, setShowSpinner] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [googleSuccess, setGoogleSuccess] = useState<string | null>(null);

  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const startResendTimer = () => {
    const interval = setInterval (() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });

    }, 1000);
  }

    const signupMutation = useMutation({
      mutationFn: async (data:FormData) => {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/api/user-registration`,
          data
        );
        return response.data;
      },
      onSuccess: (data, formData) => {
        const successMessage = data.message || "Registration successful! OTP sent to your email.";
        setUserData(formData);
        setShowOtp(true);
        setCanResend(false);
        setTimer(60);
        startResendTimer();
      },
      onError: (error: AxiosError) => {
        console.error("Signup error:", error);
      }
    });


 const verifyOtpMutation = useMutation({
  mutationFn: async () => {
    if(!userData) return;
    const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/verify-user`,
    {
      ...userData,
      otp: otp.join(""),
    }
    );
    return response.data;
  },

    onSuccess: (data) => {
      const successMessage = data.message || "Account verified successfully! Redirecting to login...";
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    },
    onError: (error: AxiosError) => {
      console.error("OTP verification error:", error);
    }

});


  const onSubmit = (data: FormData) => {
    signupMutation.mutate(data);
  };


  useEffect(() => {
    let interval: NodeJS.Timeout;
    let textIndex = 0;
    let dotIndex = 0;
    let currentText = "";

    const firstMessage = "Creating your account";
    const secondMessage = "Sending OTP to your email";

    if (signupMutation.isPending) {
      setShowSpinner(true);
      setSignupButtonText("");

      const spinnerTimer = setTimeout(() => {
        setShowSpinner(false);
        let message = firstMessage;

        interval = setInterval(() => {
          if (textIndex < message.length) {
            currentText += message[textIndex];
            textIndex++;
          } else {
            dotIndex = (dotIndex + 1) % 4;
            const dots = ".".repeat(dotIndex);
            currentText = message + dots;
          }

          setSignupButtonText(currentText);

          if (textIndex === message.length && dotIndex === 3 && message === firstMessage) {
            message = secondMessage;
            textIndex = 0;
            currentText = "";
            dotIndex = 0;
          }
        }, 150);

      }, 1500);

      return () => {
        clearTimeout(spinnerTimer);
        clearInterval(interval);
      };
    } else {
      setShowSpinner(false);
      setSignupButtonText("Create Account");
    }
  }, [signupMutation.isPending]);


  const handleOtpChange = (index:number, value:string)=> {
      if(!/^[0-9]?$/.test(value)) return;
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value  && index < inputRefs.current.length - 1){
        inputRefs.current[index + 1] ?.focus();
      }
  };

const handleOtpKeyDown  = (index:number, e:React.KeyboardEvent<HTMLInputElement>) => {
   if(e.key=== "Backspace" && !otp[index] && index >0) {
    inputRefs.current[index - 1]?.focus();
   }
};

 const resendOtp = () => {
  if (userData) {
    signupMutation.mutate(userData);
  }
 };

  return (
    <div className="relative min-h-screen w-full overflow-hidden" style={{ background: "linear-gradient(135deg, #0a1628 0%, #0f2744 50%, #1a1f3a 100%)" }}>
      
      {/* Animated code background */}
      <div className="absolute inset-0 opacity-10 overflow-hidden">
        <pre className="text-purple-400 text-xs font-mono leading-relaxed animate-scroll-up">
{`const createUser = async (data) => {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  const user = await User.create({
    name: data.name,
    email: data.email,
    password: hashedPassword,
  });
  return user;
};

async function sendVerificationEmail(email, otp) {
  const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: { user: process.env.EMAIL, pass: process.env.PASSWORD }
  });
  await transporter.sendMail({
    from: 'noreply@vettcode.com',
    to: email,
    subject: 'Verify Your Account',
    html: \`<p>Your OTP is: <strong>\${otp}</strong></p>\`
  });
}`}
        </pre>
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(139,92,246,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.5) 1px, transparent 1px)", backgroundSize: "50px 50px" }} />

      {/* Glowing orbs */}
      <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse" style={{ background: "radial-gradient(circle, #a855f7, transparent 70%)" }} />
      <div className="absolute bottom-20 right-1/4 w-80 h-80 rounded-full opacity-15 blur-3xl animate-pulse animation-delay-2000" style={{ background: "radial-gradient(circle, #6366f1, transparent 70%)" }} />

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
            <h1 className="text-2xl font-bold text-white mb-2">Create Your Account</h1>
            <p className="text-gray-400 text-sm">Join thousands of founders building with verified code</p>
          </div>

          {/* Signup Card */}
          <div className="backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-8" style={{ background: "rgba(15, 23, 42, 0.8)" }}>
            
            {!showOtp ? (
              <>
                <GoogleButton
                  mode="signup"
                  onSuccess={() => {
                    setGoogleError(null);
                    setGoogleSuccess("Google signup successful! Redirecting...");
                    setTimeout(() => {
                      router.push("/");
                    }, 1000);
                  }}
                  onError={(error) => {
                    setGoogleError(error);
                    setGoogleSuccess(null);
                  }}
                />

                {googleError && (
                  <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 text-sm font-medium">{googleError}</p>
                  </div>
                )}

                {googleSuccess && (
                  <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                    <p className="text-emerald-400 text-sm font-medium">{googleSuccess}</p>
                  </div>
                )}

                <div className="flex items-center my-6 text-gray-500 text-sm">
                  <div className="flex-1 border-t border-white/10" />
                  <span className="px-4">or sign up with email</span>
                  <div className="flex-1 border-t border-white/10" />
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  {/* Name */}
                  <div>
                    <label className="block text-gray-300 mb-2 text-sm font-semibold">Full Name</label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
                      {...register("name", {
                        required: "Name is required",
                      })}
                    />
                    {errors.name && (
                      <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-red-400" />
                        {String(errors.name.message)}
                      </p>
                    )}
                  </div>

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
                        placeholder="Min. 6 characters"
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

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={signupMutation.isPending}
                    className="w-full py-3.5 rounded-xl font-bold text-white text-base shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{ background: "linear-gradient(135deg, #8b5cf6, #6366f1)" }}
                  >
                    {showSpinner ? (
                      <div className="w-5 h-5 border-3 border-t-transparent border-white rounded-full animate-spin" />
                    ) : signupMutation.isPending ? (
                      <span>{signupButtonText}</span>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        <span>Create Account</span>
                      </>
                    )}
                  </button>

                  {/* Signup Error Message */}
                  {signupMutation.isError && signupMutation.error instanceof AxiosError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <p className="text-red-400 text-sm font-medium">
                        {(() => {
                          const error = signupMutation.error;
                          if (error.response?.data) {
                            const responseData = error.response.data as any;
                            return responseData?.message ||
                                   responseData?.error ||
                                   `Error: ${error.response.status}`;
                          } else if (error.request) {
                            return "Network error. Please check your connection and try again.";
                          }
                          return error.message || "An error occurred. Please try again.";
                        })()}
                      </p>
                    </div>
                  )}
                </form>

                {/* Sign In Link */}
                <p className="text-center text-gray-400 text-sm mt-6">
                  Already have an account?{" "}
                  <Link href="/login" className="text-purple-400 font-semibold hover:text-purple-300 transition-colors">
                    Sign In
                  </Link>
                </p>
              </>
            ) : (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Verify Your Email</h3>
                  <p className="text-gray-400 text-sm">We've sent a 6-digit code to <span className="text-purple-400 font-semibold">{userData?.email}</span></p>
                </div>

                <div className="flex justify-center gap-3">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      ref={(el) => {
                        if (el) inputRefs.current[index] = el;
                      }}
                      maxLength={1}
                      className="w-12 h-14 text-center text-xl font-bold bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    />
                  ))}
                </div>

                <button
                  className="w-full py-3.5 rounded-xl font-bold text-white text-base shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(135deg, #8b5cf6, #6366f1)" }}
                  disabled={verifyOtpMutation.isPending}
                  onClick={() => verifyOtpMutation.mutate()}
                >
                  {verifyOtpMutation.isPending ? (
                    <>
                      <div className="w-5 h-5 border-3 border-t-transparent border-white rounded-full animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5" />
                      <span>Verify OTP</span>
                    </>
                  )}
                </button>

                <p className="text-center text-sm text-gray-400">
                  {canResend ? (
                    <button
                      onClick={resendOtp}
                      className="text-purple-400 font-semibold hover:text-purple-300 transition-colors"
                    >
                      Resend OTP
                    </button>
                  ) : (
                    `Resend OTP in ${timer}s`
                  )}
                </p>

                {/* OTP Verification Error Message */}
                {verifyOtpMutation.isError && verifyOtpMutation.error instanceof AxiosError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 text-sm font-medium text-center">
                      {(() => {
                        const error = verifyOtpMutation.error;
                        if (error.response?.data) {
                          const responseData = error.response.data as any;
                          return responseData?.message ||
                                 responseData?.error ||
                                 `Error: ${error.response.status}`;
                        } else if (error.request) {
                          return "Network error. Please check your connection and try again.";
                        }
                        return error.message || "OTP verification failed. Please try again.";
                      })()}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Trust Badges */}
          <div className="mt-8 flex items-center justify-center gap-6 text-gray-500 text-xs">
            <div className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-purple-400" />
              <span>Secure Signup</span>
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

export default Signup;
