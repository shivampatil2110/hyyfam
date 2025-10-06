import React, { useState, useMemo, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { useGetBrandReportQuery } from "@/redux/api/analyticsApi";
import SlideUpModal from "./SlideUpDateFilter";
import SlideUpBrandFilterModal from "./SlideUpBrandModal";
import LoadingSpinner from "../LoadingStatesAndModals/LoadingSpinner";
import { useSelector } from "react-redux";

const colors = [
  "#687BDC", // Blue
  "#FFA136", // Orange
  "#FF6B9D", // Pink
  "#4ECDC4", // Teal
  "#95E1D3", // Light Green
  "#D4A5A5", // Light Pink
];

const BrandChart = ({ startDate, setStartDate, endDate, setEndDate, allTime, setAllTime }: any) => {
  const { created_at } = useSelector((state: any) => state.auth.user)

  const formatDateForAPI = (date: Date | string | null): string => {
    if (!date) return "";

    let d: Date;
    if (typeof date === "string") {
      // Parse safely as local date
      const parts = date.split("-");
      if (parts.length === 3) {
        d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      } else {
        d = new Date(date);
      }
    } else {
      d = date;
    }

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const [activeMetric, setActiveMetric] = useState("purchase");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Brand/Store selection states
  const [selectedStore, setSelectedStore] = useState<string>("0a925cdb"); // Default store_id
  const [selectedStoreName, setSelectedStoreName] = useState<string>("Flipkart");
  const [showStoreFilter, setShowStoreFilter] = useState<boolean>(false);
  // const [storeLiat, setStoreList] = useState<any>()

  // API call for getting store list when dropdown is opened
  const { data: storeList = [], isLoading: storeListLoading } = useGetBrandReportQuery({
    start_date: formatDateForAPI(startDate),
    end_date: formatDateForAPI(endDate),
    alltime: allTime,
    store_id: selectedStore,
    store: showStoreFilter, // This will be true when dropdown is opened
  });

  // API call for getting brand report data for selected store
  const { data: reportData = [], isLoading: reportLoading } = useGetBrandReportQuery({
    start_date: formatDateForAPI(startDate),
    end_date: formatDateForAPI(endDate),
    alltime: allTime,
    store_id: selectedStore,
    store: false, // This will be false when getting actual report data
  });

  const handleDateChangeModal = (
    start: Date | null,
    end: Date | null,
    alltime: boolean
  ) => {
    setStartDate(allTime ? new Date(created_at) : start);
    setEndDate(end);
    setAllTime(alltime);
  };

  const handleSelectAllTimeActive = () => {
    setAllTime(true);
  };

  const handleSelectAllTimeInActive = () => {
    setAllTime(false);
  };

  const handleStoreSelection = (store: any, name: any) => {
    setSelectedStore(store);
    setSelectedStoreName(name);
    setShowStoreFilter(false);
  };

  // Process data for chart - Updated to handle the new API structure
  const chartData = useMemo(() => {
    if (!reportData || reportData.length === 0) return [];

    // Since your API returns cancelled_amount, paid_amount, pending_amount
    // We need to create chart data based on these values
    const processedData = [
      {
        brandName: "Cancelled",
        color: colors[0],
        value: reportData[0]?.cancelled_amount || 0,
      },
      {
        brandName: "Paid",
        color: colors[2],
        value: reportData[0]?.paid_amount || 0,
      },
      {
        brandName: "Pending",
        color: colors[1],
        value: reportData[0]?.pending_amount || 0,
      },
    ].filter(item => item.value > 0); // Only show segments with values

    const total = processedData.reduce((sum, item) => sum + item.value, 0);

    return processedData.map((item) => ({
      ...item,
      percentage: total > 0 ? (item.value / total) * 100 : 0,
    }));
  }, [reportData]);

  const formatNumber = (num: any) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  // SVG Donut Chart
  const radius = 70;
  const strokeWidth = 35;
  const circumference = 2 * Math.PI * radius;
  const centerX = 160;
  const centerY = 140;

  let cumulativePercentage = 0;

  const totalValue = chartData.reduce((sum, item) => sum + item.value, 0);

  useEffect(() => {
  }, [startDate, endDate, allTime, selectedStore]);

  if (reportLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="px-4 pb-4 pt-2.5 bg-white rounded-lg shadow-sm w-full max-w-lg mx-auto">
      {/* Header with Date Controls */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[16px] font-bold text-gray-800">{selectedStoreName}</h2>

        <div className="flex items-center justify-end gap-2">
          {/* Store Selection Dropdown */}
          <div className="relative">
            <div
              className="rounded-sm border-[0.5px] border-[#dcdcdc] flex items-center justify-center gap-[5px] bg-[#fff] px-2 py-2 cursor-pointer"
              onClick={() => setShowStoreFilter(!showStoreFilter)}
            >
              <p className="text-[11px] font-medium font-inter leading-4 text-[#000]">
                Select Brand
              </p>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="11"
                height="7"
                viewBox="0 0 11 7"
                fill="none"
                className={`transform transition-transform ${showStoreFilter ? 'rotate-180' : ''}`}
              >
                <path d="M1 1.25L6 5.75L10.5 1.25" stroke="black" />
              </svg>
            </div>

            {/* Dropdown Menu */}
            {/* {showStoreDropdown && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                {storeListLoading ? (
                  <div className="px-3 py-2 text-xs text-gray-500">Loading stores...</div>
                ) : storeList.length > 0 ? (
                  storeList.map((store: any, index: number) => (
                    <div
                      key={store.store_id || index}
                      className="px-3 py-2 text-xs hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                      onClick={() => handleStoreSelection(store.store_id, store.store_name)}
                    >
                      {store.store_name}
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-2 text-xs text-gray-500">No stores available</div>
                )}
              </div>
            )} */}
          </div>

          {/* Date Range Display and Calendar Button */}

        </div>
      </div>

      <div className="flex items-center w-full justify-end gap-1">
        <div className="flex items-center">
          <span className="text-[12px] font-medium text-gray-700 mx-2">
            {startDate
              ? startDate
                ?.toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "short",
                  year: "2-digit",
                })
                .replace(/(\d+)\/(\w+)\/(\d+)/, "$1/$2/$3")
              : ""}{" "}
            -{" "}
            {endDate
              ? endDate
                ?.toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "short",
                  year: "2-digit",
                })
                .replace(/(\d+)\/(\w+)\/(\d+)/, "$1/$2/$3")
              : ""}
          </span>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="p-1 border border-gray-300 rounded bg-white hover:bg-gray-50 transition-colors"
        >
          <Calendar size={12} className="text-gray-700" />
        </button>
      </div>

      {/* Loading State */}
      {reportLoading && (
        <div className="flex justify-center items-center h-64">
          <div className="text-sm text-gray-500">Loading chart data...</div>
        </div>
      )}

      {/* Donut Chart */}
      {!reportLoading && chartData.length > 0 && (
        <div className="relative flex justify-center mb-6">
          <svg width="320" height="280" className="drop-shadow-sm">
            {/* Background circle */}
            <circle
              cx={160}
              cy={140}
              r={radius}
              fill="none"
              stroke="#f3f4f6"
              strokeWidth={strokeWidth}
            />

            {/* Data segments */}
            {chartData.map((data: any, index: any) => {
              if (data.percentage === 0) return null;

              const offset = (cumulativePercentage / 100) * circumference;
              const strokeDasharray = `${(data.percentage / 100) * circumference
                } ${circumference}`;
              const strokeDashoffset = -offset;

              cumulativePercentage += data.percentage;

              return (
                <circle
                  key={index}
                  cx={160}
                  cy={140}
                  r={radius}
                  fill="none"
                  stroke={data.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  transform={`rotate(-90 160 140)`}
                  className="transition-all duration-500 ease-in-out"
                />
              );
            })}

            {/* Leader lines and labels */}
            {(() => {
              let tempCumulative = 0;
              return chartData.map((data: any, index: any) => {
                if (data.percentage === 0) return null;

                // Calculate the middle angle of this segment
                const startAngle = (tempCumulative / 100) * 360 - 90;
                const midAngle = startAngle + ((data.percentage / 100) * 360) / 2;
                const radians = (midAngle * Math.PI) / 180;

                // Calculate positions
                const innerRadius = radius + strokeWidth / 2 + 5;
                const outerRadius = innerRadius + 25;
                const labelRadius = outerRadius + 5;

                const x1 = 160 + Math.cos(radians) * innerRadius;
                const y1 = 140 + Math.sin(radians) * innerRadius;
                const x2 = 160 + Math.cos(radians) * outerRadius;
                const y2 = 140 + Math.sin(radians) * outerRadius;

                // Determine label position (left or right side)
                const isRightSide = Math.cos(radians) > 0;
                const labelX = isRightSide ? x2 + 25 : x2 - 25;
                const labelY = y2;

                // Horizontal line to label
                const lineEndX = isRightSide ? x2 + 20 : x2 - 20;

                tempCumulative += data.percentage;

                return (
                  <g key={`line-${index}`}>
                    {/* Line from pie to elbow */}
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={data.color}
                      strokeWidth="2"
                      className="transition-all duration-500"
                    />
                    {/* Horizontal line to label */}
                    <line
                      x1={x2}
                      y1={y2}
                      x2={lineEndX}
                      y2={y2}
                      stroke={data.color}
                      strokeWidth="2"
                      className="transition-all duration-500"
                    />
                    {/* Brand label */}
                    <text
                      x={labelX}
                      y={labelY - 8}
                      textAnchor={isRightSide ? "start" : "end"}
                      className="text-xs font-medium fill-gray-700"
                    >
                      {data.brandName}
                    </text>
                    {/* Value label */}
                    <text
                      x={labelX}
                      y={labelY + 8}
                      textAnchor={isRightSide ? "start" : "end"}
                      className="text-xs font-semibold"
                      fill={data.color}
                    >
                      {formatNumber(data.value)}
                    </text>
                  </g>
                );
              });
            })()}
          </svg>
        </div>
      )}

      {/* No Data State */}
      {!reportLoading && chartData.length === 0 && (
        <div className="flex justify-center items-center h-64">
          <div className="text-[18px] text-center text-gray-500">No data available for the selected period</div>
        </div>
      )}

      {/* Date Filter Modal */}
      <SlideUpModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        startDate={startDate}
        endDate={endDate}
        alltime={allTime}
        selectAllTime={handleSelectAllTimeActive}
        selectAllTimeInactive={handleSelectAllTimeInActive}
        onDateChange={handleDateChangeModal}
      />

      <SlideUpBrandFilterModal
        isOpen={showStoreFilter}
        onClose={() => setShowStoreFilter(false)}
        selectedName={selectedStoreName}
        selectedStore={selectedStore}
        storeOptions={storeList}
        onFilterChange={handleStoreSelection}
        isLoadingStores={storeListLoading}
      />

      {/* Click outside to close dropdown */}
      {/* {showStoreDropdown && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowStoreDropdown(false)}
        />
      )} */}
    </div>
  );
};

export default BrandChart;