"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import SummarySection from "./SummarySection";
import EarningsChart from "./GraphSection";
import ContentSection from "./ContentSection";
import { useGetUserSummaryQuery } from "@/redux/api/analyticsApi";

export default function index() {
  const router = useRouter();
  const { data = {}, isLoading } = useGetUserSummaryQuery({})

  return (
    <div className="min-h-screen font-inter">
      <div className="pb-25 flex flex-col items-center justify-start w-full">
        <div className="w-full flex items-center justify-between gap-[14px] py-[18px] border-b-[1px] border-b-[#f0f2f5] px-[15px]">
          <div className="flex items-center justify-start gap-[14px]">
            <svg
              onClick={() => router.push("/home")}
              className="cursor-pointer"
              xmlns="http://www.w3.org/2000/svg"
              width="21"
              height="21"
              viewBox="0 0 21 21"
              fill="none"
            >
              <path
                d="M2.17678 10.5L20.999 10.5"
                stroke="black"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path
                d="M9.88867 19.3888L1.58351 11.0836C1.2612 10.7613 1.26126 10.2386 1.58364 9.91622L9.88867 1.61118"
                stroke="black"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>
            <p className="m-0 text-[#000] text-[18px] font-semibold leading-normal font-inter ">
              Analytics
            </p>
          </div>

          <div style={{
            background: 'linear-gradient(147deg, #FFFDFC 28.17%, #FFF2EB 80.11%)'
          }} className="flex items-ccenter justify-center gap-1 rounded-[22px] border-[1px] border-[#f2b6b6] pl-[10px] pr-[7px] py-1">
            <p className="font-inter font-semibold text-[#000] text-[14px] text-center mt-0.5">₹{data?.total_cashback || 0}</p>
            <Image
              src={'/images/Money.png'}
              alt="noe-img"
              width={30}
              height={30}
            />
          </div>


        </div>

        {/* write all the components here  */}
        <div className="flex flex-col  items-center justify-enter gap-[30px] w-full">
          <SummarySection />
          <EarningsChart />
          <ContentSection />
        </div>
      </div>
    </div>
  );
}
