import Image from "next/image";
import React, { useState } from "react";
import BrandChart from "./BrandChart";
import { useGetUserSummaryQuery } from "@/redux/api/analyticsApi";
import LoadingSpinner from "../LoadingStatesAndModals/LoadingSpinner";
import { formatDateForAPI } from "@/utils/dateFormat";

const BrandInsights = () => {
  const [startDate, setStartDate] = useState<Date | null>(() => {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    return sevenDaysAgo;
  });

  const [endDate, setEndDate] = useState<Date | null>(() => new Date());
  const [allTime, setAllTime] = useState<boolean>(false);
  const { data = {}, isLoading } = useGetUserSummaryQuery({
    start_date: formatDateForAPI(startDate),
    end_date: formatDateForAPI(endDate),
    alltime: allTime
  })

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="flex flex-col items-center justify-center w-full gap-9">
      <div className="relative w-full font-inter">
        <div className="h-[80px] w-full bg-[rgba(222,44,109,1)] absolute top-0 z-0 " />
        <div className="px-[15px] pt-[22px] flex flex-col items-start justify-center gap-[11px] w-full relative z-10">
          <h1 className="text-[#fff] text-[12px] font-medium font-inter ">
            BRAND INSIGHTS
          </h1>
          <div
            style={{ boxShadow: "0px 0px 1.7px 0px rgba(0, 0, 0, 0.20)" }}
            className="p-[10px] w-full grid grid-cols-4 items-center gap-[10px] rounded-[6px] border-[1px] border-[rgba(222,44,109,1)] bg-[#fff]"
          >
            <div className="flex flex-col items-start justify-center gap-1 border-r-[1px] border-r-[rgba(222,44,109,1)] pr-[20px] ">
              <h2 className="text-[#333] text-[12px] font-normal font-inter leading-[156%] ">
                Total Sales
              </h2>
              <p className="m-0 text-[#000] text-[14px] font-medium font-inter leading-[106%] ">
                ₹{data?.total_sales ?? 0}
              </p>
            </div>

            <div className="flex flex-col items-start justify-center gap-1 border-r-[1px] border-r-[rgba(222,44,109,1)] pr-[20px]">
              <h2 className="text-[#333] text-[12px] font-normal font-inter leading-[156%] ">
                Orders
              </h2>
              <p className="m-0 text-[#000] text-[14px] font-medium font-inter leading-[106%] ">
                {data?.total_orders ?? 0}
              </p>
            </div>

            <div className="flex flex-col items-start justify-center gap-1 border-r-[1px] border-r-[rgba(222,44,109,1)] pr-[20px]">
              <h2 className="text-[#333] text-[12px] font-normal font-inter leading-[156%] ">
                Commission
              </h2>
              <p className="m-0 text-[#000] text-[14px] font-medium font-inter leading-[106%] ">
                ₹{data?.total_comission ?? 0}
              </p>
            </div>

            <div className="flex flex-col items-start justify-center gap-1 ">
              <h2 className="text-[#333] text-[12px] font-normal font-inter leading-[156%] ">
                Clicks
              </h2>
              <p className="m-0 text-[#000] text-[14px] font-medium font-inter leading-[106%] ">
                {data?.total_clicks ?? 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center gap-[10px] w-full px-[15px]">
        <p className="text-[#000] text-[15px] font-bold font-inter w-full">
          Brand Performance
        </p>
        <BrandChart startDate={startDate} setStartDate={setStartDate} endDate={endDate} setEndDate={setEndDate}
          allTime={allTime} setAllTime={setAllTime} />
      </div>

      {/* <div className="flex flex-col items-center justify-center gap-[10px] w-full px-[15px]">
        <p className="text-[#000] text-[15px] font-bold font-inter w-full">
          Channel Wise
        </p>
        <ChannelChart />
      </div> */}
    </div>
  );
};

export default BrandInsights;
