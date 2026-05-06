"use client";

import { toast, Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import React, { useState, useRef, useEffect } from "react";

type FormData = {
  email: string;
  password: string;
};

const ForgotPassword = () => {
  const inputRefs = useRef<(HTMLInputElement | null )[] >([]);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [otp, setOtp] = useState(["","","","","",""]);
  const [step, setStep] = useState<"email" | "otp" | "reset">("email");
  const [serverError, setServerError] = useState<string | null>(null);  const router = useRouter();

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

    const requestOtpMutation = useMutation({
        mutationFn: async ({ email }: { email: string }) => {

          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_SERVER_URL}/api/forgot-password-user`,
            { email }
          );
          return response.data
        },
        onSuccess: (_,{email}) => {
            setUserEmail(email);
            setStep("otp");
            setServerError(null);
            setCanResend(false);
            startResendTimer();
        },
        onError: (error: AxiosError) => {
            const errorMessage =
            (error.response?.data as { message?: string})?.message ||
            "Invalid OTP. Try again!";
            setServerError(errorMessage);
        },
    });

    const verifyOtpMutation = useMutation({
      mutationFn: async () => {
        if (!userEmail) return;

        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/api/verify-forgot-password-user`,
          { email: userEmail, otp: otp.join("") }
        );

        return response.data;
      },
      onSuccess: () => {
        setStep("reset");
        setServerError(null);
      },
      onError: (error: AxiosError) => {
        const errorMessage =
          (error.response?.data as { message?: string })?.message ||
          "Invalid OTP. Try again!";
        setServerError(errorMessage);
      },
    });
    const resendOtp = () => {
      if (!userEmail) return;

      requestOtpMutation.mutate({ email: userEmail });
      setCanResend(false);
      setTimer(60);
      startResendTimer();
    };


    const resetPasswordMutation = useMutation({
      mutationFn: async ({ password }: { password: string }) => {
        if (!password) return;

        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/api/reset-password-user`,
          {
            email: userEmail,
            newPassword: password,
          }
        );

        return response.data;
      },
      onSuccess: () => {
        setStep("email");
        toast.success(
          "Password reset successfully! Please login with your new password."
        );
        setServerError(null);
        router.push("/login");
      },
      onError: (error: AxiosError) => {
        const errorMessage =
          (error.response?.data as { message?: string })?.message;

        setServerError(errorMessage || "Failed to reset password. Try again!");
      },
    });

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

      const onSubmitEmail = ({ email} : { email: string}) =>{
        requestOtpMutation.mutate({ email });
      };

      const onSubmitPassword = ({ password }: { password: string }) => {
        resetPasswordMutation.mutate({ password });
      };

  const onSubmit = (data: FormData) => {
    // handle login logic here

  };

  return (
    <div className="w-full py-10 min-h-[85vh] bg-[#f1f1f1]">
     <h1
            className="text-3xl sm:text-3.4xl md:text-3.6xl lg:text-6xl font-Poppins font-semibold text-center
                      bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500
                      bg-clip-text text-transparent
                      animate-gradient bg-[length:200%_200%]"
          >
            Forgot Password
      </h1>

      <p className="text-center text-lg font-medium py-3 text-[#00000099]">
        Home .  Forgot Password
      </p>

      <div className="w-full flex justify-center">
        <div className="md:w-[480px] p-8 bg-white shadow rounded-lg">
        {step === "email" && (
       <>
                  <h3
            className="text-[1.3rem] sm:text-2.5xl md:text-[1.7rem] lg:text-3xl font-Poppins font-semibold text-center mb-2
                      bg-gradient-to-r from-purple-500 via-pink-500 to-red-500
                      bg-clip-text text-transparent
                      animate-gradient bg-[length:200%_200%]"
          >
            Recover Your vettcode Password
          </h3>


          <p className="text-center text-gray-500 mb-4">
            Go back to?{" "}
            <Link href={"/login"} className="text-blue-500">
              Login page
            </Link>
          </p>

          <form onSubmit={handleSubmit(onSubmitEmail)}>
            {/* Email */}
            <label className="block text-gray-700 mb-1">Email</label>
            <input
              type="email"
              placeholder="adorablemasereka85@gmail.com"
              className="w-full p-2 border border-gray-300 outline-0 !rounded mb-1"
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



         {/* Submit */}
          <button
            type="submit"
            className="
              w-full
              flex items-center justify-center
              text-base sm:text-lg md:text-xl lg:text-1.5xl mt-4
              font-semibold
              bg-gradient-to-r from-blue-500 to-purple-600
              text-white
              py-1.5 sm:py-2 md:py-2.6
              rounded-lg
              shadow-md
              transition-all duration-300 ease-in-out
              hover:from-purple-600 hover:to-blue-500
              hover:scale-105
              disabled:opacity-70 disabled:cursor-not-allowed
            "
            disabled={requestOtpMutation.isPending} // optional
          >
           {requestOtpMutation.isPending ? (
              <div className="w-6 h-6 border-4 border-t-transparent border-white rounded-full animate-spin bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500"></div>
            ) : (
              "Send OTP to email"
            )}
          </button>

            {serverError && (
              <p className="text-red-500 text-sm mt-2">{serverError}</p>
            )}
          </form>

        </>
          )}
          {step === "otp" && (
  <>
    <div>
      <h3 className="text-xl font-semibold text-center mb-4">
        Enter OTP
      </h3>

      <div className="flex justify-center gap-6">
        {otp?.map((digit, index) => (
          <input
            key={index}
            type="text"
            ref={(el) => {
              if (el) inputRefs.current[index] = el;
            }}
            maxLength={1}
            className="w-12 h-12 text-center border border-gray-300 outline-none !rounded"
            value={digit}
            onChange={(e) => handleOtpChange(index, e.target.value)}
            onKeyDown={(e) => handleOtpKeyDown(index, e)}
          />
        ))}
      </div>

      <button
        className="w-full mt-4 text-lg cursor-pointer bg-blue-500 text-white py-2 rounded-lg"
        disabled={verifyOtpMutation.isPending}
        onClick={() => verifyOtpMutation.mutate()}
      >
        {verifyOtpMutation.isPending ? "Verifying..." : "Verify OTP"}
      </button>

      <p className="text-center text-sm mt-4">
        {canResend ? (
          <button
            onClick={resendOtp}
            className="text-blue-500 cursor-pointer"
          >
            Resend OTP
          </button>
        ) : (
          `Resend OTP in ${timer}s`
        )}
      </p>

      {/* Show backend/API errors */}
      {verifyOtpMutation?.isError &&
        verifyOtpMutation.error instanceof AxiosError && (
          <p className="text-red-500 text-sm mt-2">
            {
              (verifyOtpMutation.error.response?.data as { message?: string })
                ?.message || verifyOtpMutation.error.message
            }
          </p>
        )}


      </div>
    </>
      )}

{step === "reset" && (
  <>
    <h3 className="text-xl font-semibold text-center mb-4">
      Reset Password
    </h3>
    <form onSubmit={handleSubmit(onSubmitPassword)}>
      <label className="block text-gray-700 mb-1">
        New Password
      </label>
      <input
        type="password"
        placeholder="Enter new password"
        className="w-full p-2 border border-gray-300 outline-0 rounded mb-1"
        {...register("password", {
          required: "Password is required",
          minLength: {
            value: 6,
            message: "Password must be at least 6 characters",
          },
        })}
      />

      {/* Show validation error */}
      {errors.password && (
        <p className="text-red-500 text-sm">
          {String(errors.password.message)}
        </p>
      )}

      {/* Show backend error */}
      {serverError && (
        <p className="text-red-500 text-sm mt-2">{serverError}</p>
      )}

      <button
        type="submit"
        disabled={resetPasswordMutation.isPending}
        className="w-full text-base sm:text-lg md:text-xl lg:text-1.5xl mt-4
          font-semibold bg-gradient-to-r from-blue-500 to-purple-600
          text-white py-1.5 sm:py-2 md:py-2.6 rounded-lg shadow-md
          transition-all duration-300 ease-in-out
          hover:from-purple-600 hover:to-blue-500 hover:scale-105
          flex justify-center items-center gap-2
          disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {resetPasswordMutation.isPending ? (
          <span className="w-6 h-6 border-4 border-t-transparent border-white rounded-full animate-spin
            bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500"></span>
        ) : (
          "Reset Password"
            )}
          </button>
        </form>
      </>
          )}

        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

