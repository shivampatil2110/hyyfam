"use client";

import { useState, useEffect, FC, useRef } from "react";
import { EyeOff, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { forgotpassword } from "@/redux/features/authSlice";
import { setOtpForPassword } from "@/redux/features/authSlice";
import { CircularProgress } from "@mui/material";
import { showToast } from "../Toast/Toast";

import { ArrowLeft } from "lucide-react";
import { useSelector } from "react-redux";
import { selectLoginFlow } from "@/redux/features/authSlice";
import Link from "next/link";

const ForgotPassword = () => {
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [isValid, setIsValid] = useState<boolean>(false);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.auth);
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [seconds, setSeconds] = useState<number>(30);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [passwordError, setPasswordError] = useState<string>("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const loginFlow = useSelector(selectLoginFlow);

  // Add password validation function
  const validatePassword = (password: string): boolean => {
    // Add your password validation logic here
    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
      return false;
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      setPasswordError(
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      );
      return false;
    }
    setPasswordError("");
    return true;
  };

  // Updated handleOtpLogin function
  const handleOtpLogin = async () => {
    try {
      const validOtp = otp.join("");

      // Validate OTP
      if (validOtp.length !== 6) {
        // Handle invalid OTP length
        return;
      }

      // For password reset flow
      if (!validatePassword(newPassword)) {
        return;
      }

      if (newPassword !== confirmPassword) {
        setPasswordError("Passwords do not match");
        return;
      }

      const response = await dispatch(
        forgotpassword({
          phoneNumber: phoneNumber,
          otp: validOtp,
          new_password: newPassword,
        })
      ).unwrap();

      if (response.code === 200) {
        // Password reset successful
        router.push("/login?passwordReset=success");
      } else {
        // Handle error
        router.push("/login?passwordReset=error");
      }
    } catch (error) {
      // Handle error
      router.push("/login?passwordReset=error");
    }
  };

  // Your existing useEffect and other functions remain the same...
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

  useEffect(() => {
    setIsValid(phoneNumber.length === 10 && /^\d+$/.test(phoneNumber));
  }, [phoneNumber]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    // Only allow numbers and limit to 10 digits
    if (/^\d*$/.test(value) && value.length <= 10) {
      setPhoneNumber(value);
    }
  };

  const handleSendOtp = async () => {
    try {
      let isUserLogin = false;

      const response = await dispatch(
        setOtpForPassword({
          phoneNumber,
        })
      ).unwrap();

      // Check response code
      if (response.code === 400) {
        isUserLogin = true;
        const signUpResponse = await dispatch(
          setOtpForPassword({
            phoneNumber,
          })
        ).unwrap();

        if (signUpResponse.code === 200) {
          setPhoneNumber(response.phoneNumber);
          setOtpSent(true);
        }
      } else if (response.code === 200) {
        setPhoneNumber(response.phoneNumber);
        setOtpSent(true);
      }
    } catch (error) {
      showToast({
        message: "Error sending OTP",
        type: "error",
        duration: 3000,
      });
    }
  };
  return (
    <div className="max-w-[448px] h-screen bg-[#fff] mx-auto ">
      {otpSent ? (
        <div className="flex flex-col items-center justify-between w-full h-[92vh] px-[15px] py-4">
          <div className="w-full">
            {/* Header */}
            <div className="w-full flex items-center mb-6">
              <button
                className="text-gray-800 cursor-pointer"
                onClick={() => {
                  setOtpSent(false);
                }}
              >
                <ArrowLeft size={24} />
              </button>
            </div>

            {/* OTP Title */}
            <div className="text-center mb-6 w-full">
              <h1 className="text-xl font-bold mb-1">Reset Your Password</h1>
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
                      boxShadow: digit
                        ? "none"
                        : "0 0 0 1px rgba(0, 0, 0, 0.1)",
                    }}
                    aria-label={`OTP digit ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Password Fields - Only show for password reset flow */}
            <div className="w-full mb-4 space-y-4">
              {/* New Password Field */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-[rgba(222,44,109,1)]"
                    placeholder="Enter new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-[rgba(222,44,109,1)]"
                    placeholder="Confirm new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
              </div>

              {/* Password Error */}
              {passwordError && (
                <p className="text-red-500 text-sm">{passwordError}</p>
              )}
            </div>
          </div>

          <div className="w-full flex flex-col items-start justify-end">
            {/* Verify Button */}
            <button
              className="w-full bg-[rgba(222,44,109,1)] text-white py-3 rounded-md font-medium cursor-pointer font-inter disabled:opacity-50"
              onClick={handleOtpLogin}
              disabled={
                loading ||
                !newPassword ||
                !confirmPassword ||
                newPassword !== confirmPassword
              }
            >
              {loading ? (
                <div className="flex justify-center">
                  <CircularProgress color="inherit" size="24px" />
                </div>
              ) : loginFlow ? (
                "Reset Password"
              ) : (
                "Verify OTP"
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-between w-full h-[95vh]">
          <div className="pt-6 w-[90%] mx-auto flex flex-col items-start justify-center gap-6">
            <div className="w-full flex flex-col items-center justify-center gap-8">
              <svg
                className="scale-70"
                xmlns="http://www.w3.org/2000/svg"
                width="221"
                height="56"
                viewBox="0 0 221 56"
                fill="none"
              >
                <rect width="56" height="56" rx="5" fill="#F1437E" />
                <path
                  d="M50.0542 9.55903C50.054 8.89521 49.9457 8.23584 49.7336 7.60679C49.0466 5.60875 46.8711 4.25192 44.9647 4.65267V23.282C40.2759 18.1294 34.7226 15.41 27.9842 15.4215C26.9232 15.4255 25.8636 15.5 24.8125 15.6448C20.0894 16.3031 15.9959 18.45 12.3892 21.9423L12.3605 21.9709L11.9598 22.366L11.9025 22.4289L11.5018 22.8412L11.4674 22.8755L11.101 23.2763V4.64122H11.0323V4.5897C10.7599 4.56678 10.4861 4.56678 10.2136 4.5897C9.34605 4.66719 8.51914 4.99293 7.8318 5.52798C7.14446 6.06303 6.62578 6.78473 6.33778 7.60679C6.29852 7.70757 6.26601 7.81085 6.24046 7.91595C6.08008 8.44103 5.99904 8.98712 6.00001 9.53615C6.00001 14.6925 6.00001 19.845 6.00001 24.9938V46.0505C6.00001 46.3368 6.00001 46.623 6.00001 46.8921C6.06899 47.5711 6.2838 48.2273 6.62976 48.8157C6.93058 49.3456 7.33336 49.8106 7.81485 50.184C8.29779 50.5757 8.86053 50.8571 9.46366 51.0084C9.90182 51.1305 10.3542 51.194 10.809 51.1973C13.0991 51.2259 15.3891 51.1973 17.6448 51.1973C15.4761 49.2607 13.7232 46.904 12.4922 44.27C10.7903 40.3854 10.6026 36.0048 11.9659 31.9888C13.3293 27.9728 16.1452 24.6119 19.8603 22.5663L19.9806 22.5034L20.1352 22.4175C22.3482 21.2455 24.7952 20.5827 27.2972 20.4777C29.7993 20.3727 32.2932 20.8281 34.5966 21.8106C36.6709 22.6874 38.5504 23.9672 40.1263 25.5759C41.7022 27.1845 42.9431 29.0899 43.7771 31.1818C44.611 33.2736 45.0214 35.5101 44.9845 37.7617C44.9476 40.0134 44.4641 42.2353 43.562 44.2986C42.3311 46.9327 40.5781 49.2893 38.4095 51.2259C40.6995 51.2259 42.9895 51.2259 45.2395 51.2259C45.883 51.2348 46.5216 51.1131 47.1168 50.8683C47.712 50.6234 48.2514 50.2605 48.7025 49.8014C49.1535 49.3424 49.5069 48.7966 49.7412 48.1972C49.9755 47.5978 50.0859 46.9571 50.0657 46.3138C50.0581 34.0584 50.0542 21.8068 50.0542 9.55903Z"
                  fill="white"
                />
                <path
                  d="M22.7688 38.4418V51.2201H18.2231C18.1754 51.0131 18.1448 50.8024 18.1315 50.5904C18.1315 46.5542 18.08 40.0276 18.1659 35.9972C18.1825 33.229 19.1139 30.5439 20.8152 28.3601C22.5165 26.1763 24.8921 24.6163 27.5721 23.9231C32.0033 22.6636 37.7227 24.4326 40.1672 27.7818L36.9383 30.9878C34.4079 28.36 31.3278 27.3638 27.7324 28.818C26.641 29.2517 25.6639 29.9306 24.8767 30.8022C24.0895 31.6738 23.5132 32.7148 23.1925 33.8446H35.1693V38.4246L22.7688 38.4418Z"
                  fill="white"
                />
                <path
                  d="M38.1976 10.6296C40.0283 10.6296 41.5124 9.14552 41.5124 7.31481C41.5124 5.48409 40.0283 4 38.1976 4C36.3669 4 34.8828 5.48409 34.8828 7.31481C34.8828 9.14552 36.3669 10.6296 38.1976 10.6296Z"
                  fill="white"
                />
                <path
                  d="M88.5133 20.9647V25.2081H72.0302V20.9647H88.5133ZM73.3522 8V39.0471H68V8H73.3522ZM92.6287 8V39.0471H87.2978V8H92.6287Z"
                  fill="#F1437E"
                />
                <path
                  d="M105.188 36.5309L111.457 15.975H116.959L107.704 42.5655C107.491 43.1341 107.214 43.7525 106.873 44.4207C106.532 45.0888 106.084 45.7214 105.529 46.3184C104.989 46.9297 104.314 47.4202 103.504 47.7898C102.693 48.1736 101.713 48.3655 100.561 48.3655C100.106 48.3655 99.6655 48.3229 99.239 48.2376C98.8268 48.1665 98.4358 48.0883 98.0662 48.003L98.0449 44.0795C98.1871 44.0937 98.3576 44.1079 98.5567 44.1221C98.7699 44.1363 98.9405 44.1434 99.0684 44.1434C99.9214 44.1434 100.632 44.0368 101.201 43.8236C101.769 43.6246 102.231 43.2976 102.587 42.8427C102.956 42.3878 103.269 41.7765 103.525 41.0089L105.188 36.5309ZM101.649 15.975L107.129 33.2471L108.046 38.6633L104.485 39.5802L96.1045 15.975H101.649Z"
                  fill="#F1437E"
                />
                <path
                  d="M126.597 36.5309L132.866 15.975H138.368L129.113 42.5655C128.9 43.1341 128.623 43.7525 128.282 44.4207C127.941 45.0888 127.493 45.7214 126.938 46.3184C126.398 46.9297 125.723 47.4202 124.913 47.7898C124.102 48.1736 123.121 48.3655 121.97 48.3655C121.515 48.3655 121.074 48.3229 120.648 48.2376C120.236 48.1665 119.845 48.0883 119.475 48.003L119.454 44.0795C119.596 44.0937 119.767 44.1079 119.966 44.1221C120.179 44.1363 120.349 44.1434 120.477 44.1434C121.33 44.1434 122.041 44.0368 122.61 43.8236C123.178 43.6246 123.64 43.2976 123.996 42.8427C124.365 42.3878 124.678 41.7765 124.934 41.0089L126.597 36.5309ZM123.057 15.975L128.538 33.2471L129.455 38.6633L125.893 39.5802L117.513 15.975H123.057Z"
                  fill="#F1437E"
                />
                <path
                  d="M147.174 8V39.0471H141.822V8H147.174ZM159.841 21.5831V25.8265H145.81V21.5831H159.841ZM161.61 8V12.2647H145.81V8H161.61Z"
                  fill="#F1437E"
                />
                <path
                  d="M177.646 34.4199V23.4169C177.646 22.5924 177.497 21.8816 177.198 21.2846C176.899 20.6875 176.445 20.2255 175.833 19.8985C175.236 19.5716 174.483 19.4081 173.573 19.4081C172.734 19.4081 172.009 19.5503 171.398 19.8346C170.787 20.1189 170.31 20.5027 169.969 20.9861C169.628 21.4694 169.458 22.0167 169.458 22.628H164.34C164.34 21.7182 164.56 20.8368 165.001 19.9838C165.442 19.1309 166.081 18.3704 166.92 17.7022C167.759 17.0341 168.761 16.5081 169.927 16.1243C171.092 15.7405 172.4 15.5485 173.85 15.5485C175.585 15.5485 177.12 15.84 178.456 16.4228C179.807 17.0057 180.866 17.887 181.633 19.0669C182.415 20.2326 182.806 21.6968 182.806 23.4596V33.7162C182.806 34.7682 182.877 35.7135 183.019 36.5523C183.176 37.3768 183.396 38.0947 183.68 38.7059V39.0471H178.413C178.172 38.4927 177.98 37.789 177.838 36.9361C177.71 36.0689 177.646 35.2302 177.646 34.4199ZM178.392 25.0162L178.435 28.1934H174.746C173.793 28.1934 172.955 28.2858 172.23 28.4706C171.505 28.6412 170.9 28.8971 170.417 29.2383C169.934 29.5794 169.571 29.9917 169.33 30.475C169.088 30.9584 168.967 31.5057 168.967 32.117C168.967 32.7282 169.109 33.2897 169.394 33.8015C169.678 34.2991 170.09 34.69 170.63 34.9743C171.185 35.2586 171.853 35.4008 172.635 35.4008C173.687 35.4008 174.604 35.1875 175.385 34.7611C176.182 34.3204 176.807 33.7873 177.262 33.1618C177.717 32.5221 177.959 31.9179 177.987 31.3493L179.65 33.6309C179.48 34.2138 179.188 34.8393 178.776 35.5074C178.364 36.1755 177.823 36.8152 177.155 37.4265C176.501 38.0236 175.712 38.514 174.788 38.8978C173.879 39.2817 172.827 39.4736 171.633 39.4736C170.126 39.4736 168.782 39.1751 167.602 38.578C166.422 37.9667 165.498 37.1493 164.83 36.1258C164.162 35.088 163.828 33.9152 163.828 32.6074C163.828 31.3848 164.056 30.3045 164.51 29.3662C164.98 28.4138 165.662 27.6177 166.558 26.978C167.467 26.3383 168.576 25.8549 169.884 25.528C171.192 25.1868 172.684 25.0162 174.362 25.0162H178.392Z"
                  fill="#F1437E"
                />
                <path
                  d="M193.319 20.6662V39.0471H188.18V15.975H193.02L193.319 20.6662ZM192.487 26.6581L190.738 26.6368C190.738 25.0446 190.937 23.5733 191.336 22.2228C191.734 20.8723 192.316 19.6995 193.084 18.7044C193.852 17.6951 194.804 16.9204 195.941 16.3802C197.093 15.8257 198.422 15.5485 199.929 15.5485C200.981 15.5485 201.94 15.7049 202.808 16.0177C203.689 16.3162 204.449 16.7924 205.089 17.4463C205.743 18.1003 206.241 18.939 206.582 19.9625C206.937 20.9861 207.115 22.2228 207.115 23.6728V39.0471H201.976V24.1206C201.976 22.9976 201.805 22.1162 201.464 21.4765C201.137 20.8368 200.661 20.3819 200.036 20.1118C199.424 19.8275 198.692 19.6853 197.839 19.6853C196.873 19.6853 196.048 19.8701 195.366 20.2397C194.698 20.6093 194.15 21.114 193.724 21.7537C193.297 22.3934 192.985 23.1326 192.785 23.9714C192.586 24.8101 192.487 25.7057 192.487 26.6581ZM206.795 25.2934L204.386 25.8265C204.386 24.4334 204.577 23.1184 204.961 21.8816C205.359 20.6307 205.935 19.536 206.688 18.5978C207.456 17.6454 208.401 16.899 209.525 16.3588C210.648 15.8186 211.934 15.5485 213.384 15.5485C214.564 15.5485 215.616 15.712 216.54 16.039C217.478 16.3517 218.274 16.8493 218.928 17.5316C219.582 18.214 220.08 19.1025 220.421 20.1971C220.762 21.2775 220.933 22.5853 220.933 24.1206V39.0471H215.772V24.0993C215.772 22.9336 215.602 22.0309 215.261 21.3912C214.934 20.7515 214.464 20.3108 213.853 20.0691C213.242 19.8133 212.51 19.6853 211.657 19.6853C210.861 19.6853 210.157 19.8346 209.546 20.1331C208.949 20.4174 208.444 20.8226 208.032 21.3486C207.62 21.8603 207.307 22.4503 207.094 23.1184C206.895 23.7865 206.795 24.5115 206.795 25.2934Z"
                  fill="#F1437E"
                />
              </svg>

              <p className="m-0 text-[#000] text-[16px] font-semibold text-center leading-[122%] w-[70%] mx-auto ">
                Hello, Welcome to your Hyyfam Creator account
              </p>
            </div>

            <div className="flex flex-col items-start justify-start gap-3 w-full ">
              <p className="m-0 text-[14px] font-normal leading-[145%]">
                Enter your mobile number to proceed
              </p>

              <div className="flex flex-col w-full max-w-md mx-auto">
                <div className="flex items-center gap-2">
                  <div className="flex items-center w-full border-[#dfe2e8] border-[1px] rounded-[9px] overflow-hidden">
                    <input
                      type="text"
                      value={phoneNumber}
                      onChange={handlePhoneChange}
                      placeholder="Enter mobile number"
                      className={`flex-1 p-3 focus:outline-none text-[#000]`}
                      aria-label="Phone number"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mx-auto w-[90%]">
            <p className="m-0 text-[#7e7e7e] text-[12px] font-normal leading-[145%] pb-5 ">
              By signing up, you agree to{" "}
              <Link href={'/Terms&Conditions'} target="_blank">
              <span className="text-[#0d0d0d] underline cursor-pointer ">
                Hyyfam’s terms of service
              </span>
              </Link>
            </p>
            <button
              disabled={!isValid || loading}
              className={`flex items-center justify-center py-3 w-full  rounded-[7px]  ${
                isValid
                  ? "bg-[rgba(222,44,109,1)] cursor-pointer"
                  : "bg-[#ECECEC] text-[#D1D1D1] cursor-not-allowed"
              }  mb-[18px] text-[18px] font-medium text-[#FFF] font-inter`}
              onClick={handleSendOtp}
            >
              {loading ? (
                <div className="flex justify-center">
                  <CircularProgress color="inherit" size="24px" />
                </div>
              ) : (
                "Get OTP"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForgotPassword;
