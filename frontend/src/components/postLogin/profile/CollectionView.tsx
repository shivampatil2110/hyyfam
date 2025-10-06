"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
// Import your other dependencies as needed
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useGetCollectionLinksQuery } from "@/redux/api/collectionApi";
import { copyToClipboard } from "@/utils/common_functions";
import LoadingSpinner from "../LoadingStatesAndModals/LoadingSpinner";

interface ProductDetails {
  storeImg: string;
  productImg: string;
  title: string;
  date: string;
  price: string;
  orderAmount: string;
  orderComission: string;
  clicks: string;
  views: string;
  order: string;
}

export default function CollectionView() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const router = useRouter();

  const {
    data: collectionDetails = [],
    isLoading,
    error,
  } = useGetCollectionLinksQuery(id ?? "", {
    skip: !id,
  });

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!id) {
    return <div>No collection ID provided</div>;
  }

  return (
    <div className="h-screen overflow-x-scroll [&::-webkit-scrollbar]:hidden font-inter">
      {/* Grid of products */}
      <div className="pb-20 flex flex-col items-center justify-start w-full">
        <div className="w-full flex items-center justify-between  py-[18px] border-b-[1px] border-b-[#f0f2f5] px-[15px]">
          <div className="flex items-center justify-start gap-[14px]">
            <svg
              onClick={() => router.push("/profile?type=collections")}
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
              My Collection
            </p>
          </div>
        </div>

        <div className="flex flex-col items-start justify-start gap-[11px] overflow-scroll [&::-webkit-scrollbar]:hidden  scroll-smooth w-full mt-[18px]">
          {collectionDetails.map((product: any, index: number) => (
            <div className="w-full flex items-center justify-between gap-3 px-[15px]" key={product.id}>
              <div
                className="flex flex-col items-center justify-center rounded-[7px] border-[1px] border-[#eaeaea] w-full relative "
              >
                <div className="w-full flex items-center justify-center gap-[10px] px-2 pt-2 pb-1">
                  <div className="flex items-center justify-center mb-[14px] relative h-[100px] w-[100px] ">
                    <Image
                      className="h-full max-h-[90px] min-h-[90px] object-contain"
                      src={product.img_url}
                      alt="product"
                      height={100}
                      width={140}
                    />
                    <Image
                      className="absolute left-[35%] bottom-[-12px]"
                      src={product.store_img}
                      alt="store"
                      height={20}
                      width={30}
                    />
                  </div>

                  <div className="flex flex-col items-start justify-center w-full">
                    <div className="flex flex-col items-start justify-center mb-2">
                      <h2 className="text-[#000] text-[14px] font-semibold font-inter leading-[119%] ellipsis line-clamp-1 overflow-hidden ">
                        {product.name}
                      </h2>
                      <p className="text-[10px] text-[#787878] ">
                        {new Date(product.created_at).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            // hour: "2-digit",
                            // minute: "2-digit",
                            // hour12: true,
                          }
                        )}
                      </p>
                    </div>
                    <div className="flex flex-col items-start justify-center gap-1">

                    </div>
                    <div className="flex items-center justify-start gap-[15px] mt-2 mb-1">
                      <div className="min-w-[60px] flex flex-col items-start justify-center py-0.5 gap-[3px] border-r-[0.5px] border-r-[#000]/50 rounded-[3px]">
                        <h4 className="text-[#6b6565] text-[12px] font-medium font-inter leading-[120%] ">
                          Orders
                        </h4>
                        <p className="text-[#000] text-[14px] font-bold font-inter leading-[120%]">
                          {product.purchased_quantity}
                        </p>
                      </div>

                      <div className="min-w-[90px] flex flex-col items-start justify-center py-0.5 gap-[3px] ">
                        <h4 className="text-[#6b6565] text-[12px] font-medium font-inter leading-[120%] ">
                          Commissions
                        </h4>
                        <p className="text-[#000] text-[14px] font-bold font-inter leading-[120%]">
                          ₹{product.total_earning}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <button className="w-full rounded-b-[7px] bg-[rgba(222,44,109,1)] flex items-center justify-center gap-2 py-1 cursor-pointer" onClick={() => { copyToClipboard(product.aff_link) }}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="13"
                    viewBox="0 0 14 13"
                    fill="none"
                  >
                    <path
                      d="M7.80719 5.69271C7.36123 5.24694 6.75649 4.99652 6.12595 4.99652C5.4954 4.99652 4.89066 5.24694 4.4447 5.69271L2.76291 7.37395C2.31695 7.81992 2.06641 8.42478 2.06641 9.05547C2.06641 9.68616 2.31695 10.291 2.76291 10.737C3.20888 11.183 3.81374 11.4335 4.44443 11.4335C5.07512 11.4335 5.67998 11.183 6.12595 10.737L6.96657 9.89637"
                      stroke="white"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M6.125 7.37396C6.57096 7.81974 7.1757 8.07015 7.80624 8.07015C8.43679 8.07015 9.04153 7.81974 9.48749 7.37396L11.1693 5.69272C11.6152 5.24675 11.8658 4.64189 11.8658 4.0112C11.8658 3.38051 11.6152 2.77565 11.1693 2.32969C10.7233 1.88372 10.1185 1.63318 9.48776 1.63318C8.85707 1.63318 8.25221 1.88372 7.80624 2.32969L6.96562 3.17031"
                      stroke="white"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <p className="m-0 text-[12px] text-[#fff] font-normal font-inter leading-normal">
                    Copy Link
                  </p>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
