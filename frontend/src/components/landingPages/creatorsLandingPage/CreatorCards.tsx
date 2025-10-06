// import React from 'react'
"use client";
import Image from "next/image";
import ScrollingCards from "./CreatorCardAnimation";
import { useRouter } from "next/navigation";

const borderOptions: React.CSSProperties = {
  width: "100%",
  maxWidth: "1440px",
  marginInline: "auto",
  height: "100%",
  alignItems: "center",
  justifyContent: "center",
};

const CreatorCards = () => {
  const router = useRouter();
  return (
    <div className="px-[18px] w-full md:px-0 lg:w-[90%] max-w-[1444px] mx-auto flex flex-col items-center justify-center gap-10 pt-[100px] pb-0 md:pt-[40px] md:pb-[80px]">
      <div className="flex flex-col items-center justify-center gap-7 w-[100%] mx-auto">
        <div className="flex flex-col items-center justify-center gap-3 w-full">
          <h2 className="text-[#000] font-inter hidden md:block text-[22px] md:text-[28px] text-center font-medium leading-normal m-0">
            Loved by{" "}
            <span className="text-[rgba(222,44,109,1)] font-bold">
              Creators
            </span>
            , Are you one of them?
          </h2>
          <h2 className="text-[#000] font-inter block md:hidden text-[22px] md:text-[28px] text-center font-medium leading-normal m-0">
            Loved by{" "}
            <span className="text-[rgba(222,44,109,1)] font-bold">
              Creators
            </span>
            , <br />
            Are you one of them?
          </h2>
          <p className="m-0 text-[16px] md:text-[18px] md:w-[90%] lg:w-[70%]  text-center text-[#000] font-normal">
            Creators love HyyFam! And for all the right reasons. With us, it’s
            not about how many followers you have but how much passion you
            bring. Whether you want to <b>earn money from Instagram</b> or grow your
            content with a brand, Hyyfam is here for everything. Our <b>Instagram
            automated tools</b> offer features like instant replies, and real-time
            tracking to boost your engagement. From <a className="text-blue-700 underline font-semibold" href="/brands">brand collab</a> to Instagram
            earnings, we support every creator’s journey. And the best part? We
            are not just a platform, we are your team behind the scenes. So what
            are you waiting for? Start your earnings with us now!
          </p>
        </div>
        <button
          onClick={() => router.push("/login")}
          className="bg-[rgba(222,44,109,1)] mt-4 mb-10 cursor-pointer  relative text-white md:text-[14px] lg:text-[16px] xl:text-[18px] px-3 py-[6px] lg:px-4 lg:py-2  xl:py-3 rounded-[8px] font-medium flex items-center justify-center gap-[10px] lg:gap-3 xl:gap-4"
        >
          <p className="m-0 font-[550] font-inter">GET STARTED NOW</p>
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

      {/* <div className="w-full h-auto">
        <ScrollingCards />
      </div> */}
    </div>
  );
};

export default CreatorCards;
