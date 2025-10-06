"use client";

import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { selectLoginFlow, selectPhoneNumber } from "@/redux/features/authSlice";
import { verifyOtp } from "@/redux/features/authSlice";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { requestOtp } from "@/redux/features/authSlice";
import { setLoginFlow } from "@/redux/features/authSlice";
import { setMobile } from "@/redux/features/authSlice";
import CircularProgress from "@mui/material/CircularProgress";
import Link from "next/link";
import { showToast } from "../Toast/Toast";

const OtpPage: React.FC = () => {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [seconds, setSeconds] = useState<number>(30);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);
  const router = useRouter();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const loginFlow = useSelector(selectLoginFlow);
  const phoneNumber = useSelector(selectPhoneNumber);
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isTimerRunning && seconds > 0) {
      interval = setInterval(() => {
        setSeconds(seconds - 1);
      }, 1000);
    } else if (seconds === 0) {
      setIsTimerRunning(false);
    }

    return () => clearInterval(interval);
  }, [isTimerRunning, seconds]);

  const handleResendOtp = async () => {
    // Add logic to resend OTP
    try {
      let isUserLogin = false;

      const response = await dispatch(
        requestOtp({
          phoneNumber,
          isLogin: isUserLogin,
        })
      ).unwrap();

      // Check response code
      if (response.code === 400) {
        isUserLogin = true;
        // setIsLogin(true);
        dispatch(setLoginFlow(true));

        const signUpResponse = await dispatch(
          requestOtp({
            phoneNumber,
            isLogin: isUserLogin,
          })
        ).unwrap();

        if (signUpResponse.code === 200) {
          // Handle successful login OTP request
          dispatch(setMobile(response.phoneNumber));
          router.push(`/login/otpVerification`);
        }
      } else if (response.code === 200) {
        dispatch(setLoginFlow(false));
        dispatch(setMobile(response.phoneNumber));
        router.push(`/login/otpVerification`);
      }
      setSeconds(30);
      setIsTimerRunning(true);
    } catch (error) {}
  };

  const handleChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const value = e.target.value;

    // Only allow numbers
    if (value && !/^\d*$/.test(value)) {
      return;
    }

    // Update the OTP array with the new value
    const newOtp = [...otp];
    // Take only the last character if multiple are pasted
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input if current input is filled
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ): void => {
    // Handle backspace to move to previous input
    if (
      e.key === "Backspace" &&
      !otp[index] &&
      index > 0 &&
      inputRefs.current[index - 1]
    ) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>): void => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").trim();

    // Check if pasted content is all digits
    if (/^\d+$/.test(pastedData)) {
      const digits = pastedData.split("").slice(0, 6);
      const newOtp = [...otp];

      digits.forEach((digit, index) => {
        if (index < 6) {
          newOtp[index] = digit;
        }
      });

      setOtp(newOtp);

      // Focus the next empty input or the last one
      const nextEmptyIndex = newOtp.findIndex((val) => val === "");
      if (
        nextEmptyIndex !== -1 &&
        nextEmptyIndex < 6 &&
        inputRefs.current[nextEmptyIndex]
      ) {
        inputRefs.current[nextEmptyIndex]?.focus();
      } else if (digits.length < 6 && inputRefs.current[digits.length]) {
        inputRefs.current[digits.length]?.focus();
      } else if (inputRefs.current[5]) {
        inputRefs.current[5]?.focus();
      }
    }
  };

  const handleOtpLogin = async () => {
    try {
      const validOtp = otp.join("");
      if (loginFlow) {
        // call verifymobile api for that isLogin is true
        // payload will take mobile and otp

        let isUserLogin = true;

        const response = await dispatch(
          verifyOtp({
            phoneNumber: phoneNumber,
            otp: validOtp,
            isLogin: isUserLogin,
          })
        ).unwrap();

        if (response.code == 200) {
          // dispatch(setAuthenticated(true));
          router.push("/login/details?isLoggedIn=true");
        } else {
          showToast({
            type: "error",
            message: "some error occured",
          });
        }
      } else {
        // call otlogin api for that isLogin is false
        // same will go in this payload

        let isUserLogin = false;

        const response = await dispatch(
          verifyOtp({
            phoneNumber: phoneNumber,
            otp: validOtp,
            isLogin: isUserLogin,
          })
        ).unwrap();

        if (response.code == 200) {
          router.push("/home");
        } else {
          showToast({
            type: "error",
            message: "some error occured",
          });
        }
      }
    } catch (error) {
      showToast({
        type: "error",
        message: "some error occured",
      });
    }
  };

  return (
    <div className="max-w-[448px] h-screen  mx-auto p-6 bg-white ">
      <div className="flex flex-col items-center justify-between w-full h-[92vh]">
        <div className="w-full">
          {/* Header */}
          <div className="w-full flex items-center mb-6">
            <button
              className="text-gray-800 cursor-pointer"
              onClick={() => {
                router.push("/login");
              }}
            >
              <ArrowLeft size={24} />
            </button>
            {/* <p className="flex-grow text-center text-[rgba(222,44,109,1)] font-medium">
            Login/Signup
          </p> */}
          </div>

          {/* OTP Title */}
          <div className="text-center mb-6 w-full">
            <h1 className="text-xl font-bold mb-1">We've sent you an OTP</h1>
            <p className="text-gray-500">Enter 6-digit OTP sent to</p>
            <p className="font-medium">{phoneNumber}</p>
          </div>

          {/* Custom OTP Input */}
          <div className="w-full mb-4">
            <div className="flex justify-between w-full">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className={`w-12 h-12 text-center text-xl border ${
                    digit ? "border-[rgba(222,44,109,1)]" : "border-gray-300"
                  } rounded-md focus:outline-none focus:border-[rgba(222,44,109,1)]`}
                  style={{
                    boxShadow: digit ? "none" : "0 0 0 1px rgba(0, 0, 0, 0.1)",
                  }}
                  aria-label={`OTP digit ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Resend Text */}
          <div className="text-center mb-6">
            <p className="text-gray-700 text-sm">
              Didn't get OTP ?
              <button
                onClick={handleResendOtp}
                disabled={isTimerRunning}
                className={`ml-1 ${
                  isTimerRunning
                    ? "text-gray-400"
                    : "text-blue-600 cursor-pointer"
                }`}
                aria-live="polite"
              >
                Resend OTP{isTimerRunning ? ` in ${seconds}s` : ""}
              </button>
            </p>
          </div>

          {/* Progress Dots */}
          <div className="flex justify-center space-x-2 mb-8">
            <div className="w-2 h-2 rounded-full bg-pink-500"></div>
            <div className="w-2 h-2 rounded-full bg-gray-300"></div>
            <div className="w-2 h-2 rounded-full bg-gray-300"></div>
          </div>
        </div>

        <div className="w-full flex flex-col items-start justify-end">
          {/* Terms and Conditions */}
          <div className="text-center mb-6">
            <p className="text-xs text-gray-500">
              By signing up, you agree to{" "}
              <Link href={"/Terms&Conditions"} target="_blank">
                <span className="text-black font-medium underline cursor-pointer">
                  Hyyfam’s terms of service
                </span>
              </Link>
            </p>
          </div>

          {/* Verify Button */}
          <button
            className="w-full bg-[rgba(222,44,109,1)] text-white py-3 rounded-md font-medium cursor-pointer font-inter"
            onClick={handleOtpLogin}
            disabled={loading}
          >
            {loading ? (
              <div className="flex justify-center">
                <CircularProgress color="inherit" size="24px" />
              </div>
            ) : (
              "Verify OTP"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OtpPage;
