"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
// import React from 'react'

const HeroSection = () => {
  const router = useRouter();
  return (
    <div style={{
      background: 'linear-gradient(21deg, #FFF 63.73%, #FFE5EE 114.09%)'
    }} className="w-full relative ">
              <Image
          className="absolute rotate-90 top-[-95px] left-0"
          src={"/static/checks.png"}
          alt="checkss"
          width={220}
          height={300}
        />
      <div className="w-full px-[18px] md:px-0 md:w-[95%] lg:w-[90%] max-w-[1444px] mx-auto relative">

        <div className="flex flex-col items-center justify-center  gap-14  w-[75%] mx-auto pt-28 md:pt-50 pb-28 md:pb-20 ">
          <div className="flex flex-col items-center justify-center w-full gap-4 ">
            <h1 className="text-[#000] font-inter text-[26px] md:text-[34px] lg:text-[44px] font-medium text-center w-full leading-[30px] md:leading-[50px] lg:leading-[70px] ">
              Create More, Engage More,  Earn More!
            </h1>
            <p className="text-[#000] text-[20px] md:text-[22px] font-normal text-center w-full leading-[20px] md:leading-[30px]  ">
              It’s your chance to turn your passion into profits. <br /> Are you ready?
              Because we are!
            </p>
            {/* <h1 className="text-[#000] ext-[16px] md:text-[20px] lg:text-[24px] font-semibold text-center w-full leading-[20px] md:leading-[30px] lg:leading-[40px] ">
              Likes. Check? Followers. Check? Earnings? 
            </h1> */}
          </div>
          <button
            onClick={() => router.push("/login")}
            className="bg-[rgba(222,44,109,1)] cursor-pointer  relative text-white md:text-[14px] lg:text-[16px] xl:text-[18px] px-3 py-[6px] lg:px-4 lg:py-2  xl:py-3 rounded-[8px] font-medium flex items-center justify-center gap-[10px] lg:gap-3 xl:gap-4"
          >
            <p className="m-0 font-inter font-semibold">GET STARTED NOW</p>
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
                stroke="white"
                strokeWidth="2"
              />
              <path
                d="M22.998 13.5006L12.332 24.1667"
                stroke="white"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path
                d="M13.5938 12.8333H23.0064C23.3716 12.8333 23.6678 13.1296 23.6678 13.4949V22.9074"
                stroke="white"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
