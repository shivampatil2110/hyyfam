"use client";
import React from "react";
import { useRouter } from "next/navigation";
const Promotion = () => {
  const router = useRouter();
  return (
    <div className="w-full mb-20">
      <div className="bg-[rgba(222,44,109,1)] w-full ">
        <div className="px-[18px] md:px-0 md:w-[95%] lg:w-[90%] max-w-[1444px] mx-auto py-10  flex flex-col md:flex-row items-center justify-between gap-10 md:gap-[]">
          <div className="flex flex-col items-center md:items-start justify-center gap-2 w-full md:w-2/3">
            <h2 className="text-[30px] font-inter md:text-[36px]  font-medium text-[#fff] leading-normal text-center md:text-left ">
              Ready to Scale your Journey
            </h2>
            <p className="text-[18px] font-inter md:text-[20px]  font-normal text-[#fff] leading-normal text-center md:text-left ">
              Turn influencer marketing into your #1 revenue generator with
              Hyyfam
            </p>
          </div>

          <div className="flex items-center justify-center md:justify-end w-full md:w-1/3">
            {/* <button
              onClick={() => router.push("/login")}
              className="text-[#000] cursor-pointer  relative bg-white md:text-[14px] lg:text-[16px] xl:text-[18px] px-3 py-[6px] lg:px-4 lg:py-2  xl:py-3 rounded-[8px] font-medium flex items-center justify-center gap-[10px] lg:gap-3 xl:gap-4"
            >
              <p className="m-0 font-semibold font-inter">GET STARTED NOW</p>
              <svg
                className="scale-75 lg:scale-100"
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="33"
                viewBox="0 0 36 37"
                fill="none"
              >
                <path
                  d="M1 18.5C1 4.5005 4.0005 1.5 18 1.5C31.9995 1.5 35 4.5005 35 18.5C35 32.4995 31.9995 35.5 18 35.5C4.0005 35.5 1 32.4995 1 18.5Z"
                  stroke="#000"
                  strokeWidth="2"
                />
                <path
                  d="M22.998 13.5006L12.332 24.1667"
                  stroke="#000"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path
                  d="M13.5938 12.8333H23.0064C23.3716 12.8333 23.6678 13.1296 23.6678 13.4949V22.9074"
                  stroke="#000"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
            </button> */}
                                    <button
          onClick={() => router.push("/login")}
          className="bg-white cursor-pointer  relative text-[#000] text-[14px] md:text-[16px] px-3 py-[6px] lg:px-2.5 lg:py-2 rounded-[8px] font-medium flex items-center justify-center gap-[10px] lg:gap-3 xl:gap-4"
        >
          <p className="m-0 font-[550] font-inter">LET'S START</p>
          <svg
            className="scale-75 lg:scale-100"
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 36 37"
            fill="none"
          >
            <path
              d="M1 18.5C1 4.5005 4.0005 1.5 18 1.5C31.9995 1.5 35 4.5005 35 18.5C35 32.4995 31.9995 35.5 18 35.5C4.0005 35.5 1 32.4995 1 18.5Z"
              stroke="#000"
              strokeWidth="2"
            />
            <path
              d="M22.998 13.5006L12.332 24.1667"
              stroke="#000"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="M13.5938 12.8333H23.0064C23.3716 12.8333 23.6678 13.1296 23.6678 13.4949V22.9074"
              stroke="#000"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
        </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Promotion;
