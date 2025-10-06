"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import DailyReport from "./DailyReport";
import BrandInsights from "./BrandInsights";
import OrderStatus from "./OrderStatus";
import Transactionwise from "./Transactionwise";
import LinkReport from "./LinkReport";

interface Report {
  id: number;
  title: string;
}

export default function Reports() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Define reports data
  const reports: Report[] = [
    { id: 1, title: "Daily Report" },
    { id: 2, title: "Brand Insights" },
    { id: 3, title: "Link Report" },
    { id: 4, title: "Transaction wise" },
    { id: 5, title: "Order Status" },
  ];

  // Initialize active tab state
  const [activeTab, setActiveTab] = useState<string>("Daily Report");

  // Set active tab based on URL parameter or default to first tab
  useEffect(() => {
    const nameParam = searchParams.get("name");

    if (nameParam) {
      // Convert URL format (e.g., "Daily-Report") to title format (e.g., "Daily Report")
      const formattedName = nameParam.replace(/-/g, " ");

      // Check if the formatted name matches any report title
      const matchingReport = reports.find(
        (report) => report.title.toLowerCase() === formattedName.toLowerCase()
      );

      if (matchingReport) {
        setActiveTab(matchingReport.title);
      }
    }
  }, [searchParams]);

  // Handle tab click
  const handleTabClick = (title: string) => {
    setActiveTab(title);

    // Update URL with the selected tab (optional)
    const formattedTitle = title.replace(/ /g, "-");
    router.push(`/reports?name=${formattedTitle}`);
  };

  return (
    <div className="min-h-screen  font-inter">
      {/* Grid of posts */}
      <div className="pb-20  flex flex-col items-center justify-start w-full">
        <div className="w-full flex items-center justify-start gap-[14px] py-[18px] border-b-[1px] border-b-[#f0f2f5] px-[15px]">
          <svg
            onClick={() => router.push("/analytics")}
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
            All Reports
          </p>
        </div>

        {/* write the tabs here  */}
        <div className="w-full flex flex-col items-center justify-center gap-3">
          {/* Tabs container */}
          <div className="flex items-center justify-start w-full overflow-x-scroll [&::-webkit-scrollbar]:hidden  scroll-smooth">
            {reports.map((report) => (
              <button
                key={report.id}
                onClick={() => handleTabClick(report.title)}
                className={`px-[12px] py-[13px] text-[12px] w-full font-normal font-inter text-center cursor-pointer transition-all duration-200 whitespace-nowrap ${
                  activeTab === report.title
                    ? "border-b-[3px] border-b-[rgba(222,44,109,1)]"
                    : "border-b-[3px] border-b-[#dadada]"
                }`}
              >
                {report.title}
              </button>
            ))}
          </div>

          <div className="w-full">
            {activeTab === "Daily Report" && <DailyReport />}
            {activeTab === "Brand Insights" && <BrandInsights />}
            {activeTab === "Order Status" && <OrderStatus />}
            {activeTab === "Link Report" && <LinkReport />}
            {activeTab === "Transaction wise" && <Transactionwise />}
          </div>
        </div>
      </div>
    </div>
  );
}
