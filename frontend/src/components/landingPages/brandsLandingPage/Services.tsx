import Image from "next/image";
import React from "react";

interface ServiceCards {
  title: string;
  description: string;
}

const Services = () => {
  const serviceCards: ServiceCards[] = [
    {
      title: 'Partner up with the creators',
      description: 'Connect with the creators who align with your vision and already have your audience’s attention.'
    },
    {
      title: 'Boost Sales And Maximize Earnings',
      description: 'Hyyfam uses performance-driven strategies to turn creators’ content into wider reach, higher sales, and better ROI.'
    },
    {
      title: 'Increase Your Brand Visibility',
      description: 'We don’t just help you get seen. We help you get remembered. With eye-catching content from top creators, your brand gets the attention it deserves.'
    },
    {
      title: 'Track Results In Real Time',
      description: 'Hyyfam shows you real-time data, so you can see what content drives results and make smarter decisions moving forward.'
    },
  ]
  return (
    <div className="relative w-full h-auto bg-[linear-gradient(0deg,rgba(255,255,255,0.40)_53.12%,rgba(255,214,228,0.40)_100%)]">
      <svg
        className="absolute right-0 top-16 hidden md:block"
        xmlns="http://www.w3.org/2000/svg"
        width="129"
        height="207"
        viewBox="0 0 129 287"
        fill="none"
      >
        <path
          d="M193.376 8C193.376 8 0.375599 197.739 10.3756 205.944C20.3756 214.149 178.376 85.9467 193.376 90.0492C208.376 94.1516 94.3756 266.455 103.376 275.685C112.376 284.916 272.376 200.816 272.376 200.816"
          stroke="rgba(222,44,109,1)"
          strokeWidth="10.84"
          strokeMiterlimit="10"
        />
      </svg>
      <Image
        className="absolute right-0 top-0"
        src={"/static/checks.png"}
        alt="checkss"
        width={220}
        height={300}
      />
      <div className="px-[18px] w-full md:px-0 md:w-[95%] lg:w-[90%] max-w-[1444px] mx-auto py-[70px] md:py-[110px] flex flex-col items-center justify-center gap-8 md:gap-12 lg:gap-16 relative">

        <div className="flex flex-col md:flex-row items-center md:items-start justify-center w-full gap-5 md:gap-28 z-20">
          <h2 className="m-0 text-[#000] font-inter text-[22px] md:text-[35px] lg:text-[48px] font-medium leading-[5px] md:leading-[35px] lg:leading-[45px] w-full md:w-2/5">
            Bonjour <br />
            <span className="text-[rgba(222,44,109,1)] font-bold leading-[63px] ">
              Fam!
            </span>
          </h2>
          <div className="flex flex-col items-start justify-center gap-3 w-full md:w-3/5 md:px-10">
            <h2 className="text-[#000] font-inter text-[22px] md:text-[26px] font-medium md:leading-[35px] ">
              Unlock the finest services for your brand.            </h2>
            <p className="text-[#000] font-inter text-[16px] md:text-[18px] font-medium leading-normal ">
              Let the top-tier creators do the talking for you. 
            </p>

          </div>
        </div>

        <div className="grid grid-cols-1 grid-rows-1 md:grid-cols-2 md:grid-rows-2 gap-6">
          {serviceCards.map((serviceCard, index) => (
            <div
              key={index}
              className="border border-black rounded-[25px] bg-white px-[24px] py-6 flex flex-col items-start justify-start gap-[10px]"
            >
              <h3 className="m-0 text-[#151515] font-inter text-[18px] md:text-[20px]  font-bold leading-normal">
                {serviceCard.title}
              </h3>
              <p className="m-0 text-black text-[14px] md:text-[16px] font-normal leading-[23.565px]">
                {serviceCard.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;
