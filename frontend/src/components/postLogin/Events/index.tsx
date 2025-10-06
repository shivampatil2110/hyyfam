"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Individual button component
interface EarnButtonProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  route: string;
}

const Events: React.FC = () => {
  const router = useRouter();

  // Function to handle button clicks and navigate to specified route
  const handleNavigate = (route: string) => {
    router.push(route);
  };

  // Common button componen

  return (
    <div className="bg-[#FFF3F7] h-screen">
      <div className=" ">
        <h1 className="text-[16px] font-bold px-[15px] py-4  border-b-[1px] border-b-[#f0f2f5] text-[#000]">
          Events
        </h1>

        <div className="flex flex-col items-center justify-center ">
          <Image
            className="ml-4"
            src={'/static/ComingSoonRabbit.png'}
            alt="rabbit-hyyfam"
            width={260}
            height={250}
          />
          <p className=" text-[15px] text-[#000] font-medium font-inter leading-5 ">
            Coming Soon: New Experiences Await
          </p>
        </div>

      </div>
    </div>
  );
};

export default Events;
