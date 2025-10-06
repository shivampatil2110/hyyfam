// import React from 'react'
import Image from "next/image";

const CreatorCount = () => {
  return (
    <div
      style={{
        background: "linear-gradient(0deg, #FFF 0%, #FFDEE9 50%, #FFF 100%)",
      }}
      className="w-full "
    >
      <div className=" w-full max-w-[1444px] mx-auto  mt-30 h-[200px] relative">
        <Image
          className="absolute top-[-85px] right-0  z-0"
          src={"/static/checks.png"}
          alt="creators"
          width={230}
          height={100}
        />

        <Image
          className="absolute top-[-85px] left-0 z-0"
          src={"/static/checks.png"}
          alt="creators"
          width={230}
          height={100}
        />

        <div className="rounded-[30px] border-[1px] border-[#000] bg-[#fff] p-5 md:p-[28px] lg:py-[30px] lg:px-[50px] w-[90%] grid grid-rows-2 grid-cols-2 items-center justify-center gap-5 sm:flex sm:items-center sm:justify-between sm:w-[85%] relative mx-auto -mt-20 md:-mt-10 z-50">
          <div className="flex flex-col items-center sm:items-start justify-center ">
            <h3 className="text-[#151515] font-inter font-bold text-[30px] md:text-[38px] lg:text-[44px] leading-[50px] text-center m-0">
              1000+
            </h3>
            <h4 className="text-[#000] font-normal text-[15px] md:text-[18px] lg:text-[24px]  m-0">
              Verified Creators
            </h4>
          </div>

          <div className="flex flex-col items-center sm:items-start justify-center ">
            <h3 className="text-[#151515] font-inter font-bold text-[30px] md:text-[38px] lg:text-[44px] leading-[50px] text-center m-0">
              250+
            </h3>
            <h4 className="text-[#000] font-normal text-[15px] md:text-[18px] lg:text-[24px]  m-0">
              Brands & Stores
            </h4>
          </div>

          <div className="flex flex-col items-center sm:items-start justify-center ">
            <h3 className="text-[#151515] font-inter font-bold text-[30px] md:text-[38px] lg:text-[44px] leading-[50px] text-center m-0">
              10M+
            </h3>
            <h4 className="text-[#000] font-normal text-[15px] md:text-[18px] lg:text-[24px]  m-0">
              Social Reach
            </h4>
          </div>

          <div className="flex flex-col items-center sm:items-start justify-center ">
            <h3 className="text-[#151515] font-inter font-bold text-[30px] md:text-[38px] lg:text-[44px] leading-[50px] text-center m-0">
              100K+
            </h3>
            <h4 className="text-[#000] font-normal text-[14px] md:text-[18px] lg:text-[24px]  m-0">
              Clicks Tracked
            </h4>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorCount;
