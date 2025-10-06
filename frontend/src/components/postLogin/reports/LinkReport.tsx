"use client";
import React, { useRef, useState } from "react";
import PostSection from "../analytics/PostSection";
import CollectionSection from "../analytics/CollectionSection";
import ProductSection from "../analytics/ProductSection";
import Image from "next/image";

type TabOption = "posts" | "collections" | "products";

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
      className={`flex items-center justify-center gap-2 px-2 py-3 w-full cursor-pointer  ${isActive
        ? "border-b-[2px] border-[rgba(222,44,109,1)]"
        : "border-[#dfe2e8] border-b-[1px]"
        }`}
      onClick={onClick}
    >
      <span className="text-[14px] text-[#000] font-inter font-medium leading-[10px] w-fit">
        {label}
      </span>
    </button>
  );
};

const LinkReport = () => {
  const [activeTab, setActiveTab] = useState<TabOption>("posts");
  const tabsRef = useRef<HTMLDivElement>(null);
  return (
    <div>
      <div className="flex flex-col items-center justify-center gap-4 bg-[#fff] w-full ">
        <div className="flex flex-col items-center justify-center gap-[14px] w-full mt-5">
          {/* <h3 className='px-[15px] m-0 text-[16px] font-bold text-[#000] font-inter w-full'>Content</h3> */}
          <div className="bg-[#f9f8f4] w-full flex items-center justify-center ">
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
        </div>

        <div className="mt-[6px] w-full">
          {activeTab === "posts" && <PostSection />}
          {activeTab === "collections" && <CollectionSection />}
          {activeTab === "products" && <ProductSection />}
        </div>
      </div>
    </div>
  );
};

export default LinkReport;
