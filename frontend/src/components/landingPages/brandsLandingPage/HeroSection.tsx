"use client";
import Image from "next/image";
// import React from 'react'
import { useRouter } from "next/navigation";

const HeroSection = () => {
  const router = useRouter();
  return (
    <div className="w-full relative bg-[linear-gradient(90deg,_#fff_40%,_#FFE5EE_90%)]">
              <Image
          className="absolute rotate-90 left-4 md:left-16 -top-52 md:-top-40 scale-50 md:scale-100"
          src={"/static/checks.png"}
          alt="checkss"
          width={250}
          height={300}
        />
      <div className="w-full px-[18px] md:px-0 md:w-[95%] lg:w-[90%] max-w-[1444px] mx-auto relative">

        <div className="flex flex-col md:flex-row items-center justify-center md:justify-between gap-2 lg:gap-10  w-full pt-12 md:pt-40 pb-18  overflow-x-hidden">
          <div className="flex flex-col items-center md:items-start justify-center gap-3 md:gap-5 lg:gap-8">
            <h1 className="text-[#000] font-inter text-[26px] md:text-[34px] lg:text-[44px] font-medium text-center md:text-left w-full leading-[30px] md:leading-[50px] lg:leading-[60px] ">
              Think Your Brand <br /> Deserves More Reach?
            </h1>
              <p className="text-[#000] text-center md:text-left font-normal font-inter lg:text-[20px] xl:text-[22px] md:w-[92%] lg:w-[75%] ">
           The Right creators can take your brand to the right place. 
       
            </p>
            <button
              onClick={() => router.push("/login")}
              className="bg-[rgba(222,44,109,1)] cursor-pointer mt-1  relative text-white text-[16px] lg:text-[18px] px-3 py-[6px] lg:px-4 lg:py-2  xl:py-3 rounded-[8px] font-medium flex items-center justify-center gap-[10px] lg:gap-3 xl:gap-4"
            >
              <p className="m-0 font-inter font-semibold">LET'S START</p>
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
          <Image
            className="md:w-[70%] lg:w-[50%] "
            src={"/static/InfluencersCollection.png"}
            alt="imagee"
            width={500}
            height={500}
          />
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
