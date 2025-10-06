"use client";
import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";

const AnimatedOverlay = () => {
  const boxes = Array.from({ length: 5 }); // Number of boxes

  return (
    <div className="w-full absolute h-[350px] flex overflow-hidden pointer-events-none">
      {/* White and Black Base Overlay */}
      <div className="relative bg-white w-3/4 h-[350px] overflow-hidden">
        {/* Animated Black Boxes */}
        {boxes.map((_, i) => (
          <motion.div
            key={i}
            className="absolute top-0 bottom-0 w-8 bg-black opacity-0"
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: "-100%", opacity: [0, 1, 0] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeInOut",
            }}
            style={{
              height: `${100 - i * 10}%`,
              top: `${i * 5}%`,
              zIndex: 1,
            }}
          />
        ))}
      </div>
      <div className="bg-black w-1/4 h-[350px]" />
    </div>
  );
};

const HeroSection = () => {
  const router = useRouter();
  return (
    <div className="relative bg-cover bg-center text-white flex items-center justify-center bg-[#f9f8fa] ">
      <Image
        // onClick={() => router.push('/')}
        className="absolute scale-100 right-0 top-0 z-0 w-[90%] md:w-[50%] 2xl:w-[40%] "
        src={"/images/creatorLandingPage/HeroShade.png"}
        alt="logo"
        height={400}
        width={650}
      />

      {/* <div className="h-full w-full flex flex-col md:flex-row items-center justify-between"> */}
      <div className="mt-4 md:mt-44 px-[18px] w-full md:px-0 md:w-[95%] lg:w-[90%] max-w-[1444px] mx-auto text-start flex flex-col md:flex-row  rela  tive z-50">
        <div className="w-full md:w-1/2 flex flex-col items-center md:items-start justify-start pt-10 pb-14 md:pb-24">
          <div className="flex flex-col justify-center md:justify-start gap-5 md:gap-[27px] md:pr-[40px] w-full">
            <h1 className=" relative font-inter text-center md:text-left text-[26px] md:text-[30px] lg:text-[36px] xl:text-[42px]  leading-[114%] font-medium text-black ">
              Collab with brands &<br /> effortlessly start your Instagram monetization 
            </h1>
            <p className="text-[#000] text-center md:text-left font-normal font-inter lg:text-[20px] xl:text-[22px] md:w-[92%] lg:w-[75%] ">
              Post your content with our affiliate link and let your earnings rise beyond the limit.
            </p>{" "}
          </div>
          <button
            onClick={() => router.push("/login")}
            className="bg-[rgba(222,44,109,1)] cursor-pointer  relative text-white text-[14px] lg:text-[16px] xl:text-[18px] px-3 py-[6px] lg:px-4 lg:py-2  xl:py-3 rounded-[8px] font-medium flex items-center justify-center gap-[10px] lg:gap-3 xl:gap-4 mt-5 md:mt-8.5 w-fit"
          >
            <p className="m-0 font-[550] font-inter">LET'S START</p>
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
        <div className="w-full md:w-1/2  flex flex-col items-center md:justify-end" >
          <Image
            // className="w-[140%]"
            src={'/images/creatorLandingPage/HeroImage2.png'}
            alt="hero-image"
            width={550}
            height={100}
          />
        </div>

        {/* </div> */}


      </div>
    </div>
  );
};

export default HeroSection;
