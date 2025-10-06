"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useParams } from 'next/navigation';
import { useLazyGettaskbyurlQuery } from "@/redux/api/homeApi";
import './styles.css'
import PageNotFound from '@/components/postLogin/LoadingStatesAndModals/PageNotFound';

function HTMLComponent({ htmlString }: { htmlString: string }) {
  return (
    <div className="html-content" dangerouslySetInnerHTML={{ __html: htmlString }}></div>
  );
}


const ParticularCard = () => {
  const router = useRouter();
  const { slug } = useParams();
  const [trigger, { data, isLoading }] = useLazyGettaskbyurlQuery()
  const [card, setCard] = useState<any>({})
  const [isNotFound, setIsNotFound] = useState(false)

  useEffect(() => {
    if (slug) {
      getCardDetail()
    }
  }, [slug])

  const getCardDetail = async () => {
    try {
      let res = await trigger({
        task_url: slug
      }).unwrap()

      if (!res.data || res.data.length === 0) {
        setIsNotFound(true)
        return
      }

      setCard(res.data[0])
    } catch (error: any) {
      console.error('Error fetching card details:', error)
      
      // Check if the error is a 404 or if the response indicates not found
      if (
        error?.status === 404 || 
        error?.originalStatus === 404 ||
        error?.data?.message?.includes('not found') || 
        error?.data?.code === 404
      ) {
        setIsNotFound(true)
      } else {
        // For other errors, you might want to show a different error component
        // or redirect to an error page
        setIsNotFound(true) // For now, treating all errors as not found
      }
    }
  }

  const handleContinue = (taskId: number): void => {
    window.open(`/redirect/task/${taskId}?name=${card.task_short_name}&img_url=${card.url}`, "_blank");
  };

  // Show 404 component if not found
  if (isNotFound) {
    return <PageNotFound />;
  }

  return (
    <div className="min-h-screen font-inter">
      {/* Grid of posts */}
      <div className="pb-30  flex flex-col items-center justify-start w-full">
        <div className="w-full flex items-center justify-start gap-[14px] py-[18px] border-b-[1px] border-b-[#f0f2f5] px-[15px]">
          <svg
            onClick={() => router.push("/bank-offers")}
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
        </div>

        <div className="flex flex-col items-center justify-center gap-1 w-full">
          <div className="bg-[#FAFCFD] w-full pt-6 px-[15px] pb-30 mb-34 flex flex-col items-center justify-center gap-5 relative">
            <div className="flex flex-col items-center justify-center">
              <h1 className="text-[16px] text-[#000] font-bold font-inter text-center uppercase leading-normal m-0">
                {card?.task_short_name}
              </h1>
            </div>

            <div className="flex flex-col items-center justify-center absolute w-full px-[15px] top-[60px]">
              {card?.task_meta?.img && <Image
                src={card?.task_meta?.img}
                alt={card?.alt_text}
                height={200}
                width={300}
                className="w-full h-[180px] object-cover rounded-[9px]"
              />}
            </div>
          </div>
          <HTMLComponent htmlString={card?.html} />
        </div>
      </div>

      {/* Continue button */}
      <div
        style={{
          boxShadow: "0px 2px 12.6px 0px rgba(0, 0, 0, 0.25)",
        }}
        className="w-full fixed bottom-0 max-w-[450px] px-[15px] py-[21px] rounded-t-[14px] bg-[#fff] z-50 "
      >
        <button
          onClick={() => handleContinue(card.task_id)}
          className={
            " py-3 w-full rounded-[7px] text-white text-[16px] font-semibold font-inter leading-normal bg-[rgba(222,44,109,1)] hover:bg-[#e03d73] transition-color cursor-pointer"
          }
          type="button"
        >
          Complete Task
        </button>
      </div>
    </div>
  );
};

export default ParticularCard;