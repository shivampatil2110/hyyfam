import Image from "next/image";
import React from "react";
import { useRouter } from "next/navigation";
import { useGetTotalComissionQuery } from "@/redux/api/homeApi";

const Earnings = () => {
  const router = useRouter()
  const { data = [] } = useGetTotalComissionQuery()
  return (
    <div className="px-[15px] pt-2 w-full flex flex-col items-center justify-center gap-[20px] bg-transparent  ">
      <div
        className="rounded-[20px] bg-[#fff] flex items-start justify-between w-full px-3 pb-3 pt-2 border-[1px] border-[#ffd1ea]  m-0  relative z-50"
      >
        <div className="flex items-center justify-start gap-3">
          <Image
            className="mt-0.5"
            src={"/static/coins.png"}
            alt="wallet"
            height={40}
            width={50}
          />

          <div className="flex flex-col items-start justify-center">
            <h5 className=" rounded-[2px] text-[#000] text-[20px] font-medium font-inter m-0 leading-normal">
              ₹{data[0]?.points || 0}
            </h5>
            <p className="m-0 text-[#919090] font-raleway text-[12px] font-normal leading-[106%]">
              Total Commission
            </p>
          </div>
        </div>
        <div onClick={() => router.push('/analytics')} className="flex items-center justify-end mt-3 gap-2 mr-3 cursor-pointer">
          <p className="text-[14px] text-[#f1437e] font-raleway font-semibold underline mt-1">
            View Detail
          </p>
        </div>
      </div>

     <div className="h-[1px] w-full bg-[#000]/20 mt-[6px]" />
    </div>
  );
};

export default Earnings;
