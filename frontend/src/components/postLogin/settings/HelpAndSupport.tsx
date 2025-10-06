"use client";
import React from "react";
import { useRouter } from "next/navigation";

const HelpSupport = ({changeTab}: any) => {
  const router = useRouter();

  return (
    <div className="min-h-screen font-inter bg-white">
      {/* Header */}
      <div className="bg-[rgba(222,44,109,1)] text-white p-[15px] flex items-center justify-start gap-[14px] border-b-[1px] border-b-[#f0f2f5] ">
        <button
          onClick={() => changeTab("Settings")}
          className=" cursor-pointer"
        >
          <svg
            width="21"
            height="21"
            viewBox="0 0 21 21"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2.17678 10.5L20.999 10.5"
              stroke="white"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="M9.88867 19.3888L1.58351 11.0836C1.2612 10.7613 1.26126 10.2386 1.58364 9.91622L9.88867 1.61118"
              stroke="white"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <h1 className="text-[18px] font-bold">Help & Support</h1>
      </div>

      {/* Support Options */}
      <div className="bg-[rgba(222,44,109,1)] px-[15px] pt-5 pb-[108px] relative">
        <p className="text-white text-sm">We’re here to assist you!</p>
        <h2 className="text-white text-lg font-semibold mt-1">
          How would you like to contact us?
        </h2>
      </div>

      <div className="px-[15px] mt-[-85px] relative z-50 ">
        <div className="bg-[#fff] rounded-[10px] border-[0.5px] border-[#c2c2c2] py-4 px-4.5 ">
          {/* Call Option */}
          <div
            className="flex items-center justify-between border-b-[1px] border-b-[#c2c2c2]  bg-white cursor-pointer"
            onClick={() => window.open("tel:+919116572332")}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-[21px] bg-[#f9f8f4] p-[6px]">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20.0002 10.999H22.0002C22.0002 5.869 18.1272 2 12.9902 2V4C17.0522 4 20.0002 6.943 20.0002 10.999Z"
                    fill="black"
                  />
                  <path
                    d="M13.0003 7.99999C15.1033 7.99999 16.0003 8.89699 16.0003 11H18.0003C18.0003 7.77499 16.2253 5.99999 13.0003 5.99999V7.99999ZM16.4223 13.443C16.2301 13.2683 15.9776 13.1752 15.7181 13.1832C15.4585 13.1912 15.2123 13.2998 15.0313 13.486L12.6383 15.947C12.0623 15.837 10.9043 15.476 9.71228 14.287C8.52028 13.094 8.15928 11.933 8.05228 11.361L10.5113 8.96699C10.6977 8.78612 10.8064 8.53982 10.8144 8.2802C10.8225 8.02059 10.7292 7.76804 10.5543 7.57599L6.85928 3.51299C6.68432 3.32035 6.44116 3.2035 6.18143 3.18725C5.92171 3.17101 5.66588 3.25665 5.46828 3.42599L3.29828 5.28699C3.12539 5.46051 3.0222 5.69145 3.00828 5.93599C2.99328 6.18599 2.70728 12.108 7.29928 16.702C11.3053 20.707 16.3233 21 17.7053 21C17.9073 21 18.0313 20.994 18.0643 20.992C18.3088 20.9783 18.5396 20.8747 18.7123 20.701L20.5723 18.53C20.7417 18.3325 20.8276 18.0768 20.8115 17.817C20.7954 17.5573 20.6788 17.3141 20.4863 17.139L16.4223 13.443Z"
                    fill="black"
                  />
                </svg>
              </div>

              <div className="flex flex-col items-start justify-center gap-1.5">
                <h3 className="font-medium text-[14px] text-black leading-2.5">
                  Call Us
                </h3>
                <p className="text-[10px] text-[#000] font-normal leading-2.5">
                  +91 91165 72332
                </p>
              </div>
            </div>
            {/* <ChevronRight className="text-gray-400" /> */}
          </div>

          {/* WhatsApp Option */}
          <div
            className="flex items-center justify-between bg-white cursor-pointer"
            onClick={() => window.open("https://wa.me/9116572332", "_blank")}
          >
            <div className="flex items-center gap-3 mt-2">
                        <div className="rounded-[21px] bg-[#f9f8f4] p-[6px]">
              <svg
                width="22"
                height="22"
                viewBox="0 0 22 22"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_1269_14349)">
                  <path
                    d="M0.469375 10.8684C0.468859 12.7168 0.955609 14.5216 1.88116 16.1125L0.380859 21.5478L5.98673 20.0893C7.53724 20.9269 9.27448 21.3657 11.0399 21.3658H11.0445C16.8724 21.3658 21.6164 16.6603 21.6189 10.8766C21.62 8.07401 20.521 5.43862 18.5243 3.45589C16.528 1.47333 13.873 0.380918 11.0441 0.379639C5.21553 0.379639 0.471867 5.08491 0.469461 10.8684"
                    fill="url(#paint0_linear_1269_14349)"
                  />
                  <path
                    d="M0.0919531 10.8649C0.0913516 12.7799 0.595547 14.6493 1.55409 16.2971L0 21.9273L5.80688 20.4165C7.40687 21.2821 9.20829 21.7385 11.0413 21.7392H11.0461C17.083 21.7392 21.9974 16.8644 22 10.8736C22.001 7.97031 20.8625 5.24018 18.7945 3.18642C16.7263 1.13291 13.9763 0.0011938 11.0461 0C5.00809 0 0.0943594 4.87411 0.0919531 10.8649ZM3.55016 16.0133L3.33334 15.6718C2.42189 14.2337 1.94081 12.572 1.9415 10.8656C1.94339 5.88619 6.02748 1.83504 11.0495 1.83504C13.4815 1.83606 15.7671 2.77678 17.4862 4.48357C19.2052 6.19053 20.1511 8.4596 20.1505 10.8729C20.1483 15.8524 16.0641 19.904 11.0461 19.904H11.0425C9.40852 19.9032 7.80605 19.4678 6.40853 18.645L6.07595 18.4493L2.63003 19.3458L3.55016 16.0133Z"
                    fill="url(#paint1_linear_1269_14349)"
                  />
                  <path
                    d="M8.30867 6.3227C8.10363 5.87051 7.88784 5.86139 7.69284 5.85346C7.53317 5.84663 7.35064 5.84715 7.16828 5.84715C6.98575 5.84715 6.68918 5.91528 6.4385 6.18687C6.18756 6.45871 5.48047 7.11564 5.48047 8.45176C5.48047 9.78796 6.46127 11.0792 6.598 11.2606C6.7349 11.4416 8.49146 14.2713 11.2734 15.3598C13.5855 16.2645 14.056 16.0846 14.5578 16.0392C15.0597 15.994 16.1772 15.3824 16.4052 14.7483C16.6334 14.1142 16.6334 13.5707 16.5649 13.4571C16.4965 13.3439 16.314 13.276 16.0403 13.1402C15.7665 13.0044 14.4209 12.3474 14.17 12.2567C13.9191 12.1662 13.7367 12.121 13.5541 12.3929C13.3716 12.6644 12.8475 13.276 12.6877 13.4571C12.5281 13.6386 12.3684 13.6612 12.0947 13.5254C11.8209 13.3891 10.9394 13.1027 9.89362 12.1776C9.07996 11.4577 8.53065 10.5688 8.37098 10.2969C8.2113 10.0254 8.35388 9.87818 8.49112 9.74285C8.61409 9.62117 8.76491 9.42573 8.9019 9.26721C9.03837 9.1086 9.08391 8.99545 9.17518 8.81433C9.26653 8.63305 9.22081 8.47444 9.15249 8.3386C9.08391 8.20277 8.55205 6.85966 8.30867 6.3227Z"
                    fill="white"
                  />
                </g>
                <defs>
                  <linearGradient
                    id="paint0_linear_1269_14349"
                    x1="1062.28"
                    y1="2117.2"
                    x2="1062.28"
                    y2="0.379639"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#1FAF38" />
                    <stop offset="1" stopColor="#60D669" />
                  </linearGradient>
                  <linearGradient
                    id="paint1_linear_1269_14349"
                    x1="1100"
                    y1="2192.73"
                    x2="1100"
                    y2="0"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#F9F9F9" />
                    <stop offset="1" stopColor="white" />
                  </linearGradient>
                  <clipPath id="clip0_1269_14349">
                    <rect width="22" height="22" fill="white" />
                  </clipPath>
                </defs>
              </svg>
</div>
              <div className="flex flex-col items-start justify-center gap-1.5">
                <h3 className="font-medium text-[14px] text-black leading-2.5">WhatsApp</h3>
                <p className="text-[10px] text-[#000] font-normal leading-2.5">
                  Chat with us instantly on WhatsApp.
                </p>
              </div>
            </div>
            {/* <ChevronRight className="text-gray-400" /> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpSupport;
