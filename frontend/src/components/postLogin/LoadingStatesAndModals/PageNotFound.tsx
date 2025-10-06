import Image from "next/image";
import React from "react";
import Link from "next/link";


const PageNotFound = () => {
  return (
    <div className="h-screen relative overflow-x-scroll [&::-webkit-scrollbar]:hidden font-inter bg-[#FFF3F7] w-full flex flex-col items-center justify-center gap-5">
      <Image
        src={"/static/rabbit4.png"}
        alt="image-rabbit"
        width={220}
        height={300}
      />

      <div className="flex flex-col items-center justify-center gap-2 w-[60%] mx-auto">
        <h2 className="text-[18px] font-bold leading-6 text-center font-inter">
          Sorry Page not found...
        </h2>
        <h3 className="text-[14px] font-medium leading-6 text-center font-inter mb-7">
          but you are still a 10/10. <br />
          <Link href="/home" className="text-pink-600 underline font-semibold">
            Click here
          </Link>{" "} now and find your way back to us!
        </h3>
      </div>
    </div>
  );
};

export default PageNotFound;
