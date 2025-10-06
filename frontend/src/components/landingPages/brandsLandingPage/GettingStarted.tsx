"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
// import { ArrowUpRight } from 'lucide-react';

const GettingStartedSection = () => {
  const router = useRouter();
  return (
    <div className="px-[18px] w-full md:px-0  h-fit ">
      <div className="bg-[#FFD9DA] rounded-3xl w-full md:w-[95%] lg:w-[90%] max-w-[1444px] mx-auto pb-0 lg:pt-0 px-8 lg:px-10 relative overflow-hidden my-15 md:my-20">
        <div className="flex flex-col-reverse md:flex-row items-center lg:items-end">
          {/* Left side with image */}
          <div className="w-full sm:w-[70%] md:w-1/2 relative z-10 mt-15 md:mt-0 ">
            <div className=" rounded-full  w-full aspect-video relative flex items-center justify-center ">
              {/* <div className="w-[55%] h-[95%] bg-[#fff] absolute bottom-[60%] md:bottom-0 lg:bottom-[45%] xl:bottom-[40%] right-[10%] md:right-[15%] lg:right-[15%] xl:right-[35%] z-0 rounded-full " /> */}
              <div className="absolute bottom-0 md:bottom-[-160px] lg:bottom-[-50px] xl:bottom-0 left-[20px]  ">
                <Image
                  src="/images/creatorLandingPage/peopleUsingPhone.png"
                  alt="People using phones"
                  width={450}
                  height={220}
                />
              </div>
            </div>
          </div>

          {/* Right side with content */}
          <div className="w-full md:w-1/2 flex flex-col items-start justify-center gap-6 md:gap-10 lg:gap-12 py-10 mb-25 md:mb-0 relative z-50 ">
            {/* <div className="mb-14"> */}
            <h2 className="text-[26px] font-inter md:text-[28px] leading-[35px]  font-bold text-black">
              Getting on board{" "}
              <span className="font-normal">with Hyyfam is easy. Follow these simple steps</span>
            </h2>
            {/* </div> */}

            <div className="space-y-5 lg:space-y-10 w-full">
              {/* Step 1 */}
              <div className="flex items-center ">
                <div className="flex-shrink-0 mr-4">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-gray-200 relative z-20">
                    <span className="font-bold">1.</span>
                    {/* Dotted line connector */}
                    <div className="absolute h-14 border-l border-dashed border-gray-400 left-1/2 transform -translate-x-1/2 top-full z-0"></div>
                  </div>
                </div>
                <div className="">
                  <h3 className="text-[16px] md:text-[18px]  font-semibold">
                    Sign up with Hyyfam
                  </h3>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-4">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center border border-gray-200 relative z-20">
                    <span className="font-bold">2.</span>
                    {/* Dotted line connector */}
                    <div className="absolute h-14 border-l border-dashed border-gray-400 left-1/2 transform -translate-x-1/2 top-full z-0"></div>
                  </div>
                </div>
                <div className="mt-2">
                  <h3 className="text-[16px] md:text-[18px]  font-semibold">
                    Link your social media account
                  </h3>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-4">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center border border-gray-200 relative z-20">
                    <span className="font-bold">3.</span>
                  </div>
                </div>
                <div className="pt-1">
                  <h3 className="text-[16px] md:text-[18px]  font-semibold">

                    Create your post and start earning with us

                  </h3>
                </div>
              </div>

              {/* CTA Button */}
              <div
                onClick={() => router.push("/login")}
                className="relative z-10 flex w-full items-center justify-center lg:items-start lg:justify-start"
              >
                <button className="bg-[rgba(222,44,109,1)] mt-3 cursor-pointer  relative text-white md:text-[14px] lg:text-[16px] xl:text-[18px] px-3 py-[6px] lg:px-4 lg:py-2  xl:py-3 rounded-[8px] font-medium flex items-center justify-center gap-[10px] lg:gap-3 xl:gap-4">
                  <p className="m-0 font-inter font-bold">GET STARTED NOW</p>
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

        {/* Decorative elements - pink squiggles */}
        <div className="absolute hidden md:block md:bottom-32 md:right-[-30px] lg:right-0 lg:bottom-38 right-0 w-32 h-32 transform top z-0 md:scale-70 lg:scale-100">
          <Image
            className="w-full relative max-w-full overflow-hidden h-[280.5px]"
            width={262}
            height={281}
            alt=""
            src="/images/creatorLandingPage/Vector (1).png"
          />
          ;
        </div>
      </div>
    </div>
  );
};

export default GettingStartedSection;
