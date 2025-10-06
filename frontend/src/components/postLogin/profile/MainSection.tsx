"use client";

import React, { useEffect, useRef, useState } from "react";
import PostsSection from "./PostsSection";
import CollectionsSection from "./CollectionSection";
import ProductSection from "./ProductsSection";
import { useRouter } from "next/navigation";
import { useLazyGetProfileSummaryQuery } from "@/redux/api/postsApi";
import { useSelector } from "react-redux";
import { CDN_URL, WEBSITE_URL } from "@/appConstants/baseURL";
import { useSearchParams } from "next/navigation";
import { handleShare } from "@/utils/common_functions";
import { ProgressBarLoading } from "../LoadingStatesAndModals/CommonLoading";

const Profile: React.FC<any> = ({
  setLoading,
  changeTab,
  changeTabCollection,
}: any) => {
  const [activeTab, setActiveTab] = useState<any>("posts");
  const [isSticky, setIsSticky] = useState(false);
  const user = useSelector((state: any) => state.auth.user);
  // const [loader, setLoader] = useState<boolean>(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("type")) {
      setActiveTab(searchParams.get("type"));
    }
  }, [searchParams]);

  const {
    isInstaAuthenticated,
    isInstagramFollowersSatisfied,
    isInstagramPermissionsSatisfied,
  } = useSelector((s: any) => s.auth);

  const tabsRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

  const [getProfileSummary, { data = {}, isLoading }] =
    useLazyGetProfileSummaryQuery();

  const [stats, setStats] = useState({
    post_count: 0,
    collection_count: 0,
    product_count: 0,
  });

  // Initial data fetch
  useEffect(() => {
    getProfileSummary();
  }, []);

  useEffect(() => {
    if (Object.keys(data)?.length) {
      setStats(data);
    }
  }, [data]);

  useEffect(() => {
    // Create the Intersection Observer
    const observer = new IntersectionObserver(
      ([entry]) => {
        // When the tabs element is not intersecting (scrolled past),
        // we want the tabs to be sticky
        setIsSticky(!entry.isIntersecting);
      },
      {
        // This is the root viewport
        root: null,
        // When the element is about to leave the viewport
        rootMargin: "0px",
        // Trigger when the element is completely out of view
        threshold: 0,
      }
    );

    // Start observing our tabs element directly
    if (tabsRef.current) {
      observer.observe(tabsRef.current);
    }

    // Clean up the observer when component unmounts
    return () => {
      if (tabsRef.current) {
        observer.unobserve(tabsRef.current);
      }
    };
  }, []);

  return (
    <div className=" bg-white">
      {isLoading && (
        <div className="absolute inset-0 z-[90] flex items-center justify-center bg-white/80">
          <ProgressBarLoading isLoading={isLoading} />
        </div>
      )}
      {/* Profile Header */}
      <div className="flex flex-col items-center pt-6 pb-4 gap-[24px] px-[15px]">
        <div className="flex flex-row justify-between gap-[20px] w-full ">
          <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg">
            <img
              src={
                !user.profile_image
                  ? "/images/profileImage.webp"
                  : `${CDN_URL + "/images" + user.profile_image}`
              }
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Stats */}
          <div className="flex justify-start items-center gap-[25px] w-[70%]">
            <div className="flex flex-col items-center justify-center">
              <div className="text-[#000] text-[14px] leading-6 font-bold">
                {stats.post_count}
              </div>
              <div className="text-[#000] text-[14px] leading-6 font-normal">
                Posts
              </div>
            </div>
            <div className="flex flex-col items-center justify-center">
              <div className="text-[#000] text-[14px] leading-6 font-bold">
                {stats.collection_count}
              </div>
              <div className="text-[#000] text-[14px] leading-6 font-normal">
                Collections
              </div>
            </div>
            <div className="flex flex-col items-center justify-center">
              <div className="text-[#000] text-[14px] leading-6 font-bold">
                {stats.product_count}
              </div>
              <div className="text-[#000] text-[14px] leading-6 font-normal">
                Products
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center w-full gap-[6px] ">
          {/* Action Buttons */}
          <div className="flex items-center jusdtify-between w-full gap-3 mb-2">
            <button
              onClick={() => router.push("/verification")}
              className=" rounded-[8px] bg-gray-100 py-2 px-2 flex items-center justify-center text-[#000] text-[12px] font-semibold font-inter leading-normal w-full cursor-pointer"
              disabled={
                isInstaAuthenticated &&
                isInstagramFollowersSatisfied &&
                isInstagramPermissionsSatisfied
              }
            >
              {isInstaAuthenticated &&
              isInstagramFollowersSatisfied &&
              isInstagramPermissionsSatisfied ? (
                <div className="flex items-center gap-2">
                  <span>Insta Connected</span>
                  {/* <img src="/static/greentick.gif" alt="Connected" width={24} height={24} /> */}
                </div>
              ) : (
                <span>Connect Social</span>
              )}
            </button>
            <button
              className="rounded-[8px] bg-gray-100 py-2 px-2 flex items-center justify-center text-[#000] text-[12px] font-semibold font-inter leading-normal w-full cursor-pointer"
              onClick={() => {
                handleShare(`${WEBSITE_URL}/preview/${user.uid}`);
              }}
            >
              Share Profile
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div ref={tabsRef} className="flex w-full">
        <TabButton
          label="Posts"
          tabName="post"
          isActive={activeTab === "posts"}
          onClick={() => setActiveTab("posts")}
        />
        <TabButton
          label="My Collections"
          tabName="collection"
          isActive={activeTab === "collections"}
          onClick={() => setActiveTab("collections")}
        />
        <TabButton
          label="Products"
          tabName="product"
          isActive={activeTab === "products"}
          onClick={() => setActiveTab("products")}
        />
      </div>

      {/* Sticky tabs that appear when original tabs are scrolled out of view */}
      {isSticky && (
        <div className="fixed top-0 left-0 right-0 bg-white z-10 flex max-w-[448px] mx-auto">
          <TabButton
            label="Posts"
            tabName="post"
            isActive={activeTab === "posts"}
            onClick={() => setActiveTab("posts")}
          />
          <TabButton
            label="My Collections"
            tabName="collection"
            isActive={activeTab === "collections"}
            onClick={() => setActiveTab("collections")}
          />
          <TabButton
            label="Products"
            tabName="product"
            isActive={activeTab === "products"}
            onClick={() => setActiveTab("products")}
          />
        </div>
      )}

      {/* Content Area */}
      <div className="">
        {activeTab === "posts" && (
          <PostsSection changeTab={changeTab} setLoading={setLoading} />
        )}
        {activeTab === "collections" && (
          <CollectionsSection changeTabCollection={changeTabCollection} />
        )}
        {activeTab === "products" && <ProductSection />}
      </div>
    </div>
  );
};

// Tab Button Component
interface TabButtonProps {
  label: string;
  tabName: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({
  label,
  tabName,
  isActive,
  onClick,
}) => {
  return (
    <button
      className={`flex items-center justify-center gap-2 py-2 w-full cursor-pointer  ${
        isActive
          ? "border-b-[2px] border-[rgba(222,44,109,1)]"
          : "border-[#dfe2e8] border-b-[1px]"
      }`}
      onClick={onClick}
    >
      {tabName === "post" && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="15"
          height="14"
          viewBox="0 0 15 14"
          fill="none"
        >
          <path
            d="M13.2188 10.3304H12.1634V11.3059C12.1634 12.4748 11.5733 13.0646 10.3821 13.0646H1.78125C0.60134 13.0646 0 12.4745 0 11.3059V5.27535C0 4.11232 0.60134 3.52223 1.78125 3.52223H2.83661V2.60348C2.83661 1.43455 3.43232 0.844727 4.6125 0.844727H13.2188C14.404 0.844727 15 1.43455 15 2.60321V8.57723C15 9.74589 14.4043 10.3304 13.2188 10.3304ZM13.2016 9.41669C13.7689 9.41669 14.0866 9.11589 14.0866 8.5258V2.65437C14.0866 2.06428 13.7689 1.75785 13.2016 1.75785H4.62938C4.06768 1.75785 3.75 2.06428 3.75 2.65437V3.52223H10.3821C11.5733 3.52223 12.1634 4.10669 12.1634 5.27535V9.41696L13.2016 9.41669ZM11.25 5.32624C11.25 4.73616 10.9379 4.43535 10.3706 4.43535H1.79839C1.2367 4.43535 0.913393 4.73616 0.913393 5.32624V10.0633L2.99545 8.10044C3.22319 7.87862 3.52851 7.75445 3.84643 7.75437C4.16411 7.75437 4.43652 7.86205 4.70304 8.09455L7.25036 10.3526L8.2658 9.43357C8.5042 9.22357 8.76509 9.11026 9.03723 9.11026C9.28714 9.11026 9.51964 9.21232 9.76366 9.42794L11.25 10.7214V5.32624ZM8.175 8.24214C7.44321 8.24214 6.84188 7.6408 6.84188 6.89749C6.84188 6.1716 7.44321 5.55874 8.175 5.55874C8.91268 5.55874 9.51402 6.1716 9.51402 6.89776C9.51402 7.6408 8.91268 8.24214 8.175 8.24214Z"
            fill="black"
          />
        </svg>
      )}
      {tabName === "collection" && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="13"
          viewBox="0 0 14 13"
          fill="none"
        >
          <path
            d="M6.39252 3.90231L6.51213 3.89906H11.3874C11.9269 3.89902 12.446 4.1054 12.8382 4.47587C13.2304 4.84635 13.466 5.35286 13.4968 5.89152L13.5 6.01178V10.8873C13.5 11.4269 13.2936 11.9461 12.923 12.3384C12.5524 12.7306 12.0457 12.9662 11.507 12.9967L11.3874 13H6.51213C5.97251 13 5.45334 12.7936 5.0611 12.423C4.66887 12.0523 4.43332 11.5457 4.40277 11.0069L4.39952 10.8879V6.01243C4.39948 5.47279 4.60594 4.95358 4.97654 4.56133C5.34713 4.16908 5.85377 3.93352 6.39252 3.90297M11.3874 4.87481H6.51213C6.22664 4.87483 5.95159 4.98219 5.74159 5.17559C5.53158 5.36899 5.40196 5.63429 5.37847 5.91882L5.37457 6.01243V10.8879C5.3746 11.1735 5.48204 11.4487 5.67557 11.6587C5.86909 11.8688 6.13454 11.9983 6.41918 12.0216L6.51213 12.0255H11.3874C11.673 12.0255 11.9481 11.9181 12.1581 11.7245C12.3682 11.531 12.4977 11.2655 12.521 10.9809L12.5249 10.8879V6.01243C12.5249 5.71072 12.4051 5.42136 12.1918 5.20801C11.9784 4.99467 11.6891 4.87481 11.3874 4.87481ZM8.94976 5.84992C9.07906 5.84992 9.20306 5.90128 9.29449 5.99272C9.38592 6.08415 9.43729 6.20816 9.43729 6.33746V7.96133H11.0624C11.1917 7.96133 11.3157 8.0127 11.4071 8.10413C11.4985 8.19557 11.5499 8.31958 11.5499 8.44888C11.5499 8.57819 11.4985 8.7022 11.4071 8.79363C11.3157 8.88507 11.1917 8.93643 11.0624 8.93643H9.43729V10.5629C9.43729 10.6922 9.38592 10.8162 9.29449 10.9076C9.20306 10.9991 9.07906 11.0504 8.94976 11.0504C8.82046 11.0504 8.69646 10.9991 8.60503 10.9076C8.5136 10.8162 8.46223 10.6922 8.46223 10.5629V8.93643H6.83715C6.70785 8.93643 6.58384 8.88507 6.49242 8.79363C6.40099 8.7022 6.34962 8.57819 6.34962 8.44888C6.34962 8.31958 6.40099 8.19557 6.49242 8.10413C6.58384 8.0127 6.70785 7.96133 6.83715 7.96133H8.46223V6.33746C8.46223 6.20816 8.5136 6.08415 8.60503 5.99272C8.69646 5.90128 8.82046 5.84992 8.94976 5.84992ZM9.32808 1.45091L9.36188 1.56597L9.81236 3.24835H8.80285L8.42063 1.8182C8.38201 1.67382 8.31532 1.53846 8.22436 1.41986C8.13341 1.30126 8.01997 1.20175 7.89055 1.12701C7.76112 1.05227 7.61823 1.00377 7.47005 0.98428C7.32188 0.96479 7.17131 0.974691 7.02696 1.01342L2.31811 2.27585C2.04323 2.34956 1.80596 2.52364 1.65313 2.76373C1.5003 3.00382 1.44301 3.29247 1.49257 3.57273L1.51337 3.66894L2.77573 8.37802C2.83495 8.59931 2.95958 8.79756 3.13332 8.94684C3.30706 9.09611 3.52182 9.18946 3.74949 9.21466V10.1937C3.3268 10.1686 2.92138 10.0172 2.58582 9.75892C2.25026 9.50066 2.00005 9.14752 1.86764 8.74531L1.83383 8.6309L0.572118 3.92117C0.432362 3.40006 0.497257 2.84522 0.753495 2.37043C1.00973 1.89564 1.4379 1.53688 1.95019 1.3677L2.0659 1.3339L6.77474 0.0721215C7.29583 -0.0676409 7.85064 -0.00274284 8.3254 0.253508C8.80017 0.509759 9.15892 0.938595 9.32808 1.45091Z"
            fill="black"
          />
        </svg>
      )}
      {tabName === "product" && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="17"
          height="13"
          viewBox="0 0 17 13"
          fill="none"
        >
          <path
            d="M16.9894 2.19853C17.0197 2.30941 16.9815 2.43176 16.9175 2.52735L14.876 5.59382C14.8003 5.71235 14.6412 5.77735 14.5083 5.77735C14.4704 5.77735 14.3644 5.76971 14.3231 5.75823L12.6869 5.35294V12.6176C12.6869 12.8394 12.5316 13 12.3082 13H4.35451C4.13105 13 3.97577 12.8394 3.97577 12.6176V5.35294L2.50624 5.76206C2.3358 5.81559 2.18809 5.74676 2.09341 5.59765L0.0671211 2.53882C0.00273445 2.43941 -0.0162028 2.32853 0.0140968 2.21765C0.0406089 2.10294 0.120145 2.02647 0.222406 1.97294L4.35451 0H6.24824C6.4717 0 6.62698 0.156765 6.62698 0.382353C6.62698 1.17 7.72155 1.72824 8.50177 1.72824C9.28198 1.72824 10.4144 1.17382 10.4144 0.382353C10.4144 0.160588 10.5697 0 10.7932 0H12.6869L16.7773 1.93471C16.8834 1.98824 16.9591 2.08382 16.9894 2.19853Z"
            fill="black"
          />
        </svg>
      )}
      <span className="text-[12px] text-[#000] font-inter font-medium leading-[10px] w-fit">
        {label}
      </span>
    </button>
  );
};

export default Profile;

// in this code the tab button component is already in the file so no need to add that to response.
// now as you can see in the code i am getting the stats for the profile and displaying the same in the ui. The issue is in the sections of post collcection and product if i am removing any product or adding any products. It is not instantly updated in these stats can you suggest some solution for the same
