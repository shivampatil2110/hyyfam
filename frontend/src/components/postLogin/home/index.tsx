"use client";
import React, { useEffect, useState } from "react";
import NameSection from "./NameSection";
import StorySection from "./StorySection";
import Earnings from "./Earnings";
import Task from "./Task";
import SalesInfo from "./SalesInfo";
import PartnerBrandsCarousel from "./PartnerBrandsCarousel";
import BrandsCarousel from "./BrandsCarousel";
import { ProgressBarLoading } from "../LoadingStatesAndModals/CommonLoading";
import SlideUpModal from "./SlideUpModal";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

interface CardBenefit {
  text: string;
}
interface CardData {
  id: string;
  title: string;
  image: string;
  backgroundColor: string;
  benefits: CardBenefit[];
  earnPoints?: number;
}

interface HomeProps {
  partnerCards: CardData[];
}

const Home = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  // Open modal if there's an error parameter
  useEffect(() => {
    if (error) {
      setIsModalOpen(true);
    }
  }, [error]);

  const getErrorConfig = () => {
    switch (error) {
      case "account_exists":
        return {
          title: "Account Already Exists",
          subtitle: "We can’t move forward with you! ",
          buttonText: "Try Different Account",
          items: [
            "You can only connect one Instagram account at a time with Hyyfam. ",

            "If you want to add another Instagram account, please create an additional Hyyfam account.",
          ],
        };

      case "insta_exists":
        return {
          title: "Instagram Account Taken",
          subtitle:
            "This Instagram account is already connected to somebody else.",
          buttonText: "Try Different Account",
          items: [
            "This account is already taken by somebody else! Can you connect another Instagram account to your Hyyfam account?",
          ],
        };

      case "follower_count_permission":
        return {
          title: "Setup Required",
          subtitle:
            "Oppssie! You cannot connect with us for the following reasons: ",
          buttonText: "Complete Setup & Activate Engage",
          items: [
            "Your Instagram follower count should be 1000",
            "You need to permit us to access your Insta DMs and comments",
          ],
        };

      case "follower_count":
        return {
          title: "Insufficient Followers",
          subtitle:
            "Your account doesn't meet the minimum follower requirement.",
          buttonText: "Complete Setup & Activate Engage",
          items: [
            "Oh No! You’re not eligible to access Hyyfam. You need at least 1000 followers to get started! ",
          ],
        };

      case "permissions":
        return {
          title: "Permissions Required",
          subtitle:
            "Some required permissions are missing from your Instagram account.",
          buttonText: "Complete Setup & Activate Engage",
          items: [
            "You have not permitted us to access your Instagram DMs and comments",
          ],
        };

      default:
        return {
          title: "Setup Required",
          subtitle: "Your account setup needs to be completed.",
          buttonText: "Complete Setup & Activate Engage",
          items: [
            "Please complete the required setup steps",
            "All permissions must be granted for proper functionality",
          ],
        };
    }
  };

  const errorConfig = getErrorConfig();

  const handleModalClose = () => {
    setIsModalOpen(false);
    const url = new URL(window.location.href);
    url.searchParams.delete("error");
    router.replace(url.pathname);
  };

  return (
    <div className="relative min-h-screen font-inter pb-[90px]">
      {loading && (
        <div className="absolute inset-0 z-[90] flex items-center justify-center bg-white/80">
          <ProgressBarLoading isLoading={loading} />
        </div>
      )}
      <NameSection />
      <StorySection setLoading={setLoading} />
      <Earnings />
      <Task />
      <SalesInfo />
      <PartnerBrandsCarousel />
      <BrandsCarousel />

      <SlideUpModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        profileComplete={true}
      >
        <div className="bg-[rgba(222,44,109,1)] pt-[4px] rounded-t-[14px]">
          <div className="w-full mx-auto bg-white rounded-t-[14px] shadow-lg overflow-hidden px-[15px] pb-[30px] pt-11 relative flex flex-col items-center justify-center gap-4 ">
            <button
              onClick={handleModalClose}
              className="absolute right-6 top-7 cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
              >
                <path
                  d="M0.999295 14.7257L14.3086 1.41641"
                  stroke="black"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path
                  d="M1.16406 1.00003L14.4734 14.3093"
                  stroke="black"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <div className="flex flex-col items-center justify-center gap-2.5">
              <Image
                src={"/images/alert.png"}
                alt="alert"
                height={30}
                width={20}
              />
              <h2 className="text-[16px] font-inter font-bold text-[#000] leading-normal text-center ">
                {errorConfig.title}
              </h2>
              <p className="text-[12px] font-inter font-normal text-[#000] leading-normal text-center">
                {errorConfig.subtitle}
              </p>
            </div>

            <div className="flex flex-col items-center justify-center gap-3 w-full">
              {errorConfig.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-start py-3 px-[10px] gap-[10px] w-full rounded-[4px] bg-[#ffefe8]"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="19"
                    height="19"
                    viewBox="0 0 19 19"
                    fill="none"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M9.5 1.72727C5.20724 1.72727 1.72727 5.20724 1.72727 9.5C1.72727 13.7928 5.20724 17.2727 9.5 17.2727C13.7928 17.2727 17.2727 13.7928 17.2727 9.5C17.2727 5.20724 13.7928 1.72727 9.5 1.72727ZM0 9.5C0 4.25329 4.25329 0 9.5 0C14.7467 0 19 4.25329 19 9.5C19 14.7467 14.7467 19 9.5 19C4.25329 19 0 14.7467 0 9.5Z"
                      fill="#F54A4A"
                    />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12.7016 6.29841C13.0389 6.63568 13.0389 7.1825 12.7016 7.51977L7.51977 12.7016C7.1825 13.0389 6.63568 13.0389 6.29841 12.7016C5.96114 12.3643 5.96114 11.8175 6.29841 11.4802L11.4802 6.29841C11.8175 5.96114 12.3643 5.96114 12.7016 6.29841Z"
                      fill="#F54A4A"
                    />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M6.29841 6.29841C6.63568 5.96114 7.1825 5.96114 7.51977 6.29841L12.7016 11.4802C13.0389 11.8175 13.0389 12.3643 12.7016 12.7016C12.3643 13.0389 11.8175 13.0389 11.4802 12.7016L6.29841 7.51977C5.96114 7.1825 5.96114 6.63568 6.29841 6.29841Z"
                      fill="#F54A4A"
                    />
                  </svg>
                  <p className="text-[12px] font-medium font-inter text-[#000] leading-[14px]">
                    {item}
                  </p>
                </div>
              ))}
            </div>

            {error === "account_exists" ? (
              <></>
            ) : (
              <button
                className="mt-4 w-full bg-[rgba(222,44,109,1)] hover:bg-pink-600 text-white cursor-pointer font-medium font-inter text-[16px] py-3 rounded-[7px] transition duration-200"
                onClick={() => {
                  handleModalClose();
                  router.push("/verification");
                }}
              >
                {errorConfig.buttonText}
              </button>
            )}
          </div>
        </div>
      </SlideUpModal>
    </div>
  );
};

export default Home;
