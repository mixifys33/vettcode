
"use client";


import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import Link from "next/link";
import GoogleButton from "../../../shared/components/google-button";
import { Eye, EyeOff } from "lucide-react";

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
  const [signupButtonText, setSignupButtonText] = useState("Sign up");
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
        // Error handling is done in the UI below
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
      // Small delay to show success message
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    },
    onError: (error: AxiosError) => {
      // Error handling is done in the UI below
      console.error("OTP verification error:", error);
    }

});


  const onSubmit = (data: FormData) => {
    signupMutation.mutate(data);
    // handle Signup logic here
  };


  useEffect(() => {
    let interval: NodeJS.Timeout;
    let textIndex = 0;
    let dotIndex = 0;
    let currentText = "";

    const firstMessage = "Creating your vettcode account";
    const secondMessage = "Sending your OTP to your email";

    if (signupMutation.isPending) {
      // Step 1: show spinner for 1.5 seconds
      setShowSpinner(true);
      setSignupButtonText(""); // hide text while spinner shows

      const spinnerTimer = setTimeout(() => {
        setShowSpinner(false);
        let message = firstMessage;

        interval = setInterval(() => {
          // Typewriter logic
          if (textIndex < message.length) {
            currentText += message[textIndex];
            textIndex++;
          } else {
            // Blink dots after typing full message
            dotIndex = (dotIndex + 1) % 4;
            const dots = ".".repeat(dotIndex);
            currentText = message + dots;
          }

          setSignupButtonText(currentText);

          // Switch to second message after finishing first message + 3 cycles of dots
          if (textIndex === message.length && dotIndex === 3 && message === firstMessage) {
            message = secondMessage;
            textIndex = 0;
            currentText = "";
            dotIndex = 0;
          }
        }, 150);

      }, 1500); // spinner duration

      return () => {
        clearTimeout(spinnerTimer);
        clearInterval(interval);
      };
    } else {
      setShowSpinner(false);
      setSignupButtonText("Sign up");
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
    <div className="w-full py-10 min-h-[85vh] bg-[#f1f1f1]">
     <h1
            className="text-3xl sm:text-3.4xl md:text-3.6xl lg:text-6xl font-Poppins font-semibold text-center
                      bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500
                      bg-clip-text text-transparent
                      animate-gradient bg-[length:200%_200%]"
          >
            Sign Up
      </h1>

      <p className="text-center text-lg font-medium py-3 text-[#00000099]">
        Home . Sign Up
      </p>

      <div className="w-full flex justify-center">
        <div className="md:w-[480px] p-8 bg-white shadow rounded-lg">
        <h3
            className="text-[1.3rem] sm:text-2.5xl md:text-[1.7rem] lg:text-3xl font-Poppins font-semibold text-center mb-2
                      bg-gradient-to-r from-purple-500 via-pink-500 to-red-500
                      bg-clip-text text-transparent
                      animate-gradient bg-[length:200%_200%]"
          >
            Sign Up for vettcode

          </h3>


          <p className="text-center text-gray-500 mb-4">
          Or already a member? {" "}
            <Link href={"/login"} className="text-blue-500">
            Sign In
            </Link>
          </p>

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
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm font-medium">{googleError}</p>
            </div>
          )}

          {googleSuccess && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-700 text-sm font-medium">{googleSuccess}</p>
            </div>
          )}

          <div className="flex items-center my-5 text-gray-400 text-sm">
            <div className="flex-1 border-t border-gray-300" />
            <span className="px-3">or Sign in with Email</span>
            <div className="flex-1 border-t border-gray-300" />
          </div>


              {!showOtp  ? (

                  <form onSubmit={handleSubmit(onSubmit)}>
           {/* name */}
           <label className="block text-gray-700 mb-1">Name</label>
            <input
              type="text"
              placeholder="eg. Masereka Adorable"
              className="w-full p-2 border border-gray-300 outline-0 rounded mb-1"
              {...register("name", {
                required: "Name is required",

              })}
            />
            {errors.name && (
              <p className="text-red-500 text-sm">
                {String(errors.name.message)}
              </p>
            )}





            {/* Email */}
            <label className="block text-gray-700 mb-1">Email</label>
            <input
              type="email"
              placeholder="eg. adorablemasereka85@gmail.com"
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



            {/* Submit */}
            <button
            type="submit"
            disabled={signupMutation.isPending}
            className="
              w-full
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
              flex justify-center items-center
              gap-2
            "
          >
            {showSpinner ? (
              // Gradient spinner
              <span className="w-6 h-6 border-4 border-t-transparent border-white rounded-full animate-spin
                bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500"></span>
            ) : (
              signupButtonText
            )}
          </button>

          {/* Signup Error Message */}
          {signupMutation.isError && signupMutation.error instanceof AxiosError && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm font-medium">
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
              ) : (
                <div>
                  <h3 className="text-xl font-semibold text-center mb-4">
                      Enter OTP
                    </h3>
                    <div className="flex justify-center gap-6"   >
                      {otp?.map((digit, index)  => (
                        <input
                        key={index}
                        type="text"
                        ref={(el) =>{
                          if (el) inputRefs.current[index] = el;
                        }}
                          maxLength={1}
                          className="w-12 h-12 text-center border border-gray-300 outline-none !rounded"
                          value={digit}
                          onChange={(e) => handleOtpChange(index,e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index,e)}


                          />
                      )) }


                    </div>
                          <button
                          className="w-full mt-4 text-lg cursor-pointer bg-blue-500 text-white py-2 rounded-lg"
                          disabled={verifyOtpMutation.isPending}
                          onClick={() => verifyOtpMutation.mutate()}
                          >
                            {verifyOtpMutation.isPending ? "Verifying..." : "Verify OTP"}
                          </button>
                          <p
                          className="text-center text-sm mt-4"
                          >
                            {canResend ? (
                              <button
                              onClick={resendOtp}
                              className=" text-blue-500 cursor-pointer"
                              >
                                  Resend OTP
                              </button>
                            ) :(
                              `Resend OTP in ${timer}s`
                            )
                          }
                          </p>

                            {/* Signup Error Message */}
                            {signupMutation.isError && signupMutation.error instanceof AxiosError && (
                              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                                <p className="text-red-700 text-sm font-medium">
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

                            {/* OTP Verification Error Message */}
                            {verifyOtpMutation?.isError &&
                              verifyOtpMutation.error instanceof AxiosError && (
                                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                                  <p className="text-red-700 text-sm font-medium text-center">
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
                              )
                            }

                </div>

              )};

        </div>
      </div>
    </div>
  );
};

export default Signup;
