"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { signUpUser } from "@/redux/features/authSlice";
import { selectLoginFlow, selectPhoneNumber } from "@/redux/features/authSlice";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { CircularProgress } from "@mui/material";
import Link from "next/link";

const SignUpDetails: React.FC = () => {
  const router = useRouter();
  const mobileNumber = useSelector(selectPhoneNumber);
  const dispatch = useAppDispatch();
  const [passwordTouched, setPasswordTouched] = useState<boolean>(false);
  const [typingTimer, setTypingTimer] = useState<NodeJS.Timeout | null>(null);
  const [showPasswordError, setShowPasswordError] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    mobile: mobileNumber,
    name: "",
    email: "",
    password: "",
    password2: "",
  });

  const [errors, setErrors] = useState({
    // mobile: '',
    name: "",
    // email: "",
    password: "",
  });

  const [mobileVerified, setMobileVerified] = useState(false);
  const { loading } = useAppSelector((state) => state.auth);

  const validatePassword = (password: string) => {
    // const hasUpperCase = /[A-Z]/.test(password);
    // const hasLowerCase = /[a-z]/.test(password);
    // const hasNumber = /\d/.test(password);
    // const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasMinLength = password.length >= 8;

    return (
      hasMinLength
    );
  };

  const validateMobileNumber = (number: string) => {
    const regex = /^\+\d{10,15}$/;
    return regex.test(number);
  };
  // const validatePassword = (password: string) => {
  //   // Check if password is empty first
  //   if (!password) return false;

  //   // Password should include a number, a special character, and be minimum 8 characters
  //   const hasNumber = /\d/.test(password);
  //   const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  //   const hasMinLength = password.length >= 8;

  //   // Return true only if all conditions are met
  //   return hasNumber && hasSpecialChar && hasMinLength;
  // };

  // Updated handleInputChange function
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear the error when user starts typing again
    setErrors({
      ...errors,
      [name]: "",
    });

    // Auto-verify mobile number format as the user types
    if (name === "mobile") {
      setMobileVerified(validateMobileNumber(value));
    }

    // Password validation with delay
    if (name === "password") {
      // Clear existing timer
      if (typingTimer) {
        clearTimeout(typingTimer);
      }

      // Hide error while typing
      setShowPasswordError(false);

      // Set new timer for validation check
      const newTimer = setTimeout(() => {
        if (value.length > 0 && passwordTouched) {
          const isValid = validatePassword(value);
          setShowPasswordError(!isValid);
        }
      }, 1500); // 1.5 second delay

      setTypingTimer(newTimer);
    }
  };

  // Handle focus event
  const handlePasswordFocus = () => {
    setPasswordTouched(true);
  };

  // Handle blur event
  const handlePasswordBlur = () => {
    if (formData.password.length > 0) {
      const isValid = validatePassword(formData.password);
      setShowPasswordError(!isValid);
    }
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (typingTimer) {
        clearTimeout(typingTimer);
      }
    };
  }, [typingTimer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = {
      name: !formData.name ? "Name is required" : "",
      // email: !formData.email
      //   ? "Email is required"
      //   : !/\S+@\S+\.\S+/.test(formData.email)
      //   ? "Please enter a valid email"
      //   : "",
      password: !validatePassword(formData.password)
        ? "Password must include at least 8 characters"
        : "",
    };

    // Check if there are any errors
    const hasErrors = Object.values(newErrors).some((error) => error !== "");

    // Update the error state
    setErrors(newErrors);

    // If no errors, proceed with registration
    if (!hasErrors) {
      try {
        const response = await dispatch(signUpUser(formData)).unwrap();
        if (response.code == 200) {
          router.push("/verification?isLoggedIn=true");
        }
      } catch (error) {}
    }
  };
  return (
    <div className="max-w-[448px] h-screen flex flex-col items-center mx-auto  bg-white justify-between">
      <div className="w-full px-[33px] pt-[30px]">
        <div className=" w-full font-inter">
          <h1 className="text-[14px] font-medium mb-3">
            Complete Your Profile
          </h1>
          <p className="text-[16px] font-bold mb-10">
            Please fill in your details to continue.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="mobile"
                className="block text-[14px] font-normal text-[#000] mb-1"
              >
                Mobile number
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="mobile"
                  name="mobile"
                  value={formData.mobile}
                  disabled={true} // Add this to disable the input
                  readOnly={true} // Add this as a fallback for some browsers
                  className={`w-full p-3 rounded-[9px] border border-[#000] text-[#000] placeholder:text-[#000] focus:outline-none focus:ring-2 focus:ring-pink-500 text-[16px] placeholder:text-[16px] bg-gray-100`} // Added bg-gray-100 to visually indicate it's disabled
                  placeholder="+91 9876543210"
                />
                {/* {mobileVerified && (
                <span className="absolute right-3 top-2 text-green-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </span>
              )} */}
              </div>
              {/* {errors.mobile && <p className="mt-1 text-xs text-red-500">{errors.mobile}</p>} */}
            </div>

            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-[14px] font-normal text-[#000] mb-1"
              >
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className={`w-full p-3 rounded-[9px] border border-[#000] text-[#000] placeholder:text-[#000] focus:outline-none focus:ring-2 focus:ring-pink-500 text-[16px] placeholder:text-[16px]`}
                placeholder="Enter Name"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-[14px] font-normal text-[#000] mb-1"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                // required
                className={`w-full p-3 rounded-[9px] border border-[#000] text-[#000] placeholder:text-[#000] focus:outline-none focus:ring-2 focus:ring-pink-500 text-[16px] placeholder:text-[16px]`}
                placeholder="Enter Email"
              />
              {/* {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email}</p>
              )} */}
            </div>

            <div className="mb-20">
              <label
                htmlFor="password"
                className="block text-[14px] font-normal text-[#000] mb-1"
              >
                Set Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                onFocus={handlePasswordFocus}
                onBlur={handlePasswordBlur}
                required
      className={`w-full p-3 rounded-[9px] border text-[#000] placeholder:text-[#000] focus:outline-none focus:ring-2 text-[16px] placeholder:text-[16px] ${
      showPasswordError 
        ? 'border-red-500 focus:ring-red-500' 
        : 'border-[#000] focus:ring-pink-500'
    }`}
                placeholder="Enter Password"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password}</p>
              )}
              {showPasswordError && (
                <p className="mt-1 text-xs text-red-500">
                  Must include minimum 8 characters
                </p>
              )}
            </div>

            <div className="text-[12px] text-[#7e7e7e] mb-5">
              By signing up, you agree to{" "}
              <Link href={"/Terms&Conditions"} target="_blank">
                <span className="text-[12px] text-[#7e7e7e] underline cursor-pointer ">
                  Hyyfam’s terms of service
                </span>
              </Link>
            </div>

            <button
              type="submit"
              className="w-full bg-[rgba(222,44,109,1)] text-white py-3 rounded-[7px] font-bold  hover:bg-pink-600 transition-colors cursor-pointer"
              disabled={loading}
            >
              {loading ? (
                <div className="flex justify-center">
                  <CircularProgress color="inherit" size="24px" />
                </div>
              ) : (
                "Complete Signup"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUpDetails;
