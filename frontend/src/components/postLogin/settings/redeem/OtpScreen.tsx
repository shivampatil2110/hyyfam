import React, { useState, useEffect, useRef } from 'react'
import { ArrowLeft } from "lucide-react";
import { useSelector } from "react-redux";
import { selectLoginFlow, selectPhoneNumber } from "@/redux/features/authSlice";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { requestOtp } from "@/redux/features/authSlice";
import { BASE_URL } from '@/appConstants/baseURL';
import axios from 'axios';
import { showToast } from '@/components/Toast/Toast';


const OtpScreen = ({ setShowOtpScreen, selectedAccount, transferAmount }: any) => {
    const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
    const [seconds, setSeconds] = useState<number>(30);
    const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);
    const phoneNumber = useSelector(selectPhoneNumber);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const dispatch = useAppDispatch();

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

    const handleResendOtp = async () => {
        try {
            await axios.post(`${BASE_URL}/user/auth/sendloginotp`, {
                mobile: phoneNumber
            })
                .then(() => {
                    showToast({
                        message: "OTP sent. Please verfiy.",
                        type: 'success'
                    })
                })
            setSeconds(30);
            setIsTimerRunning(true);
        } catch (error) {
        }
    };

    const handleOtpLogin = async () => {
        try {
            const validOtp = otp.join("");
            let res = await axios.post(BASE_URL + "/user/auth/verifymobile", {
                mobile: phoneNumber,
                otp: validOtp
            })
            if (res?.data?.code) {
                await axios.post(BASE_URL + "/user/auth/redeemrequest", {
                    points: transferAmount,
                    r_id: selectedAccount
                })
                    .then(() => {
                        showToast({
                            message: "Amount requested.",
                            type: "success"
                        })
                    })
                    .catch(() => {
                        showToast({
                            message: "Error redeeming amount.",
                            type: "error"
                        })
                    })
            }
            else {
                showToast({
                    message: "OTP not valid. Please try again.",
                    type: "error"
                })
            }
        } catch (error) {
            showToast({
                message: "Something went wrong. Please try again.",
                type: "error"
            })
        }
    };

    return (
        <div className="max-w-[448px] h-screen flex flex-col items-center mx-auto p-6 bg-white justify-between">
            <div className="w-full">
                {/* Header */}
                <div className="w-full flex items-center mb-6">
                    <button
                        className="text-gray-800 cursor-pointer"
                        onClick={() => {
                            setShowOtpScreen(false)
                        }}
                    >
                        <ArrowLeft size={24} />
                    </button>
                    {/* <p className="flex-grow text-center text-[#F1437E] font-medium">
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
                                className={`w-12 h-12 text-center text-xl border ${digit ? "border-[#F1437E]" : "border-gray-300"
                                    } rounded-md focus:outline-none focus:border-[#F1437E]`}
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
                            className={`ml-1 ${isTimerRunning
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
            </div>

            <div className="w-full flex flex-col items-start justify-end">
                {/* Verify Button */}
                <button
                    className="w-full bg-[#F1437E] text-white py-3 rounded-md font-medium cursor-pointer font-inter"
                    onClick={handleOtpLogin}
                >
                    Verify OTP
                </button>
            </div>
        </div>
    )
}

export default OtpScreen
