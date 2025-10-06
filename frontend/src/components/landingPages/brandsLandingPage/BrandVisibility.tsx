// import React from 'react'
"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import DoneIcon from "@mui/icons-material/Done";
const BrandVisibility = () => {
  const router = useRouter();
  return (
    <div className="relative w-full h-auto">
      <svg
        className="absolute right-0 top-20 z-10 hidden lg:block"
        xmlns="http://www.w3.org/2000/svg"
        width="179"
        height="280"
        viewBox="0 0 179 280"
        fill="none"
      >
        <path
          d="M193.376 8C193.376 8 0.375599 193 10.3756 201C20.3756 209 178.376 84 193.376 88C208.376 92 94.3756 260 103.376 269C112.376 278 272.376 196 272.376 196"
          stroke="rgba(222,44,109,1)"
          strokeWidth="10.84"
          strokeMiterlimit="10"
        />
      </svg>
      <div className="relative px-[18px] w-full md:px-0 md:w-[95%] lg:w-[90%] max-w-[1444px] mx-auto py-[70px] z-0">
        <div className="relative bg-[#FFF2F6] rounded-[42px] py-[40px] px-6 md:px-10 z-20 flex flex-col md:flex-row items-center justify-between gap-10">
          {/* <svg
            className="absolute right-0 top-10 z-0  block lg:hidden"
            xmlns="http://www.w3.org/2000/svg"
            width="179"
            height="280"
            viewBox="0 0 179 280"
            fill="none"
          >
            <path
              d="M193.376 8C193.376 8 0.375599 193 10.3756 201C20.3756 209 178.376 84 193.376 88C208.376 92 94.3756 260 103.376 269C112.376 278 272.376 196 272.376 196"
              stroke="#5FCBA5"
              strokeWidth="19.84"
              strokeMiterlimit="10"
            />
          </svg> */}
          <Image
            className="absolute  left-0 top-0 h-full"
            src={"/static/ellipse.png"}
            alt="phone"
            height={400}
            width={350}
          />
          <div className="flex gap-4 h-[420px] max-w-[400px]">
            {/* Left column */}
            <div className="flex flex-col gap-4 flex-1">
              {/* Tall image */}
              <div className="relative group h-[68%]">
                <Image
                  className="w-full h-full object-cover rounded-lg"
                  src={"/static/bpro2.png"}
                  alt="image"
                  height={450}
                  width={180}
                />
              </div>
              {/* Short image */}
              <div className="relative group h-[30%]">
                <Image
                  className="w-full h-full object-cover rounded-lg"
                  src={"/static/bpro1.png"}
                  alt="image"
                  height={140}
                  width={180}
                />
              </div>
            </div>

            {/* Right column */}
            <div className="flex flex-col gap-4 flex-1">
              {/* Short image */}
              <div className="relative group h-[30%]">
                <Image
                  className="w-full h-full object-cover rounded-lg"
                  src={"/static/bpro3.png"}
                  alt="image"
                  height={140}
                  width={180}
                />
              </div>
              {/* Tall image */}
              <div className="relative group h-[68%] md:h-[66%]">
                <Image
                  className="w-full h-full object-cover rounded-lg"
                  src={"/static/bpro4.png"}
                  alt="image"
                  height={450}
                  width={180}
                />
              </div>
            </div>
          </div>
          {/* export default MasonryGrid; */}
          <div className=" w-full h-full md:w-1/2 flex flex-col items-start justify-start gap-[10px] md:gap-5 relative z-50">
            <div className="flex flex-col items-start justify-center gap-3 lg:gap-0 ">
              <h2 className="text-[#000] font-inter text-[26px] md:text-[28px] font-medium leading-[30px] md:leading-[40px] m-0">
                Want To Level Up Your{" "}
                <span className="m-0 font-bold leading-[30px] md:leading-[40px] lg:leading-[63px]">
                  Brand Visibility?
                </span>
              </h2>
              <p className="text-[#000] text-[16px] md:text-[18px] font-normal leading-[25px] lg:leading-[30px] m-0 w-full md:w-[85%] ">
              Explore and find the top tier influencer who fit right for your brand, reach to your audience, and increase your engagement. 
              </p>
            </div>
            <div className="flex flex-col items-start justify-center gap-2 mt-5 md:mt-0">
              <div className="m-0 flex items-center justify-start gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="14"
                  viewBox="0 0 18 14"
                  fill="none"
                >
                  <path
                    d="M5.87803 10.1942L1.76578 6.3448L0 7.99771L5.87803 13.5L18 2.15291L16.2342 0.5L5.87803 10.1942Z"
                    fill="black"
                  />
                </svg>
                <h3 className="text-[#000] font-medium text-[18px] md:text-[20px] leading-normal ">
                  Verified creator listing
                </h3>
              </div>

              <div className="m-0 flex items-center justify-start gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="14"
                  viewBox="0 0 18 14"
                  fill="none"
                >
                  <path
                    d="M5.87803 10.1942L1.76578 6.3448L0 7.99771L5.87803 13.5L18 2.15291L16.2342 0.5L5.87803 10.1942Z"
                    fill="black"
                  />
                </svg>
                <h3 className="text-[#000] font-medium text-[18px] md:text-[20px] leading-normal ">
              Auto DMs & comment replies
                </h3>
              </div>

              <div className="m-0 flex items-center justify-start gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="14"
                  viewBox="0 0 18 14"
                  fill="none"
                >
                  <path
                    d="M5.87803 10.1942L1.76578 6.3448L0 7.99771L5.87803 13.5L18 2.15291L16.2342 0.5L5.87803 10.1942Z"
                    fill="black"
                  />
                </svg>
                <h3 className="text-[#000] font-medium text-[18px] md:text-[20px] leading-normal ">
                 Powerful UGC (User Generated Content)
                </h3>
              </div>

              <div className="m-0 flex items-center justify-start gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="14"
                  viewBox="0 0 18 14"
                  fill="none"
                >
                  <path
                    d="M5.87803 10.1942L1.76578 6.3448L0 7.99771L5.87803 13.5L18 2.15291L16.2342 0.5L5.87803 10.1942Z"
                    fill="black"
                  />
                </svg>
                <h3 className="text-[#000] font-medium text-[18px] md:text-[20px] leading-normal ">
                 Easy onboarding and support
                </h3>
              </div>

              {/* <p className="m-0 flex items-center justify-start gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="14"
                  viewBox="0 0 18 14"
                  fill="none"
                >
                  <path
                    d="M5.87803 10.1942L1.76578 6.3448L0 7.99771L5.87803 13.5L18 2.15291L16.2342 0.5L5.87803 10.1942Z"
                    fill="black"
                  />
                </svg>
                <span className="text-[#000] font-medium text-[18px] md:text-[20px] leading-normal ">
                  Custom affiliate links
                </span>
              </p> */}
            </div>

            <button
              onClick={() => router.push("/login")}
              className="font-inter mb-12 bg-[rgba(222,44,109,1)] cursor-pointer  relative text-white md:text-[14px] lg:text-[16px] xl:text-[18px] px-3 py-[6px] lg:px-4 lg:py-2  xl:py-3 rounded-[8px] font-medium flex items-center justify-center gap-[10px] lg:gap-3 xl:gap-4 mt-5 md:mt-0"
            >
              <p className="m-0 font-[550]">GET STARTED NOW</p>
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
    </div>
  );
};

export default BrandVisibility;
