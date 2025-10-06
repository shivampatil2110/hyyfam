import React, { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Calendar, Circle } from "lucide-react";
import {
  useGetAmountStatusQuery,
  useGetOrderStatusQuery,
  useGetUserSummaryQuery,
} from "@/redux/api/analyticsApi";
import Image from "next/image";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import SlideUpModal from "./SlideUpDateFilter";
import { useSelector } from "react-redux";
interface SalesData {
  date: string;
  totalSales: string;
  orders: number;
  commission: string;
  status: string;
}

const CustomTableContainer = ({ children, className, ...props }: any) => (
  <div className={`font-inter ${className || ""}`}>
    <TableContainer
      {...props}
      className="[&::-webkit-scrollbar]:hidden scroll-smooth"
    >
      {children}
    </TableContainer>
  </div>
);

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  "&.MuiTableCell-head": {
    backgroundColor: "#f4f6f8",
    color: "#000",
    fontWeight: "500",
    fontSize: "12px",
  },
}));

const StyledTableBody = styled(TableBody)({
  backgroundColor: "#ffffff", // White background for table body
});

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: "#fff",
    borderBottom: "1px solid #eaddff",
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    backgroundColor: "#fff",
    borderBottom: "1px solid #eaddff",
  },
}));

const StyledBodyCell = styled(TableCell)(({ theme }) => ({
  color: "#000",
  fontWeight: "400",
  fontSize: "10px",
}));

const OrderStatusChart = () => {
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
  // const [selectedDate, setSelectedDate] = useState(new Date());
  const [startDate, setStartDate] = useState<Date | null>(() => {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    return sevenDaysAgo;
  });
  const [allTime, setAllTime] = useState<boolean>(false);

  const [endDate, setEndDate] = useState<Date | null>(() => new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [activeTab, setActiveTab] = useState("orders"); // 'orders' or 'amount'
  const { data: amountData = [] } = useGetAmountStatusQuery({
    start_date: formatDateForAPI(startDate),
    end_date: formatDateForAPI(endDate),
    alltime: allTime,
  });
  const { data: orderData = [] } = useGetOrderStatusQuery({
    start_date: formatDateForAPI(startDate),
    end_date: formatDateForAPI(endDate),
    alltime: allTime,
  });
  // const formatDate = (date: any) => {
  //   return date.toLocaleDateString("en-GB", {
  //     day: "2-digit",
  //     month: "short",
  //     year: "2-digit",
  //   });
  // };

  const { created_at } = useSelector((state: any) => state.auth.user)

  const handleDateChangeModal = (
    start: Date | null,
    end: Date | null,
    alltime: boolean
  ) => {
    setStartDate(allTime ? new Date(created_at) : start);
    setEndDate(end);
  };

  const handleSelectAllTimeActive = () => {
    setAllTime(true);
  };

  const handleSelectAllTimeInActive = () => {
    setAllTime(false);
  };

  // const handleDateChange = (direction: any) => {
  //   const newDate = new Date(selectedDate);
  //   if (direction === "prev") {
  //     newDate.setDate(newDate.getDate() - 1);
  //   } else {
  //     newDate.setDate(newDate.getDate() + 1);
  //   }
  //   setSelectedDate(newDate);
  // };

  const formatNumber = (num: any) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  // Get current data based on active tab
  const currentData = activeTab === "orders" ? orderData : amountData;
  const [pending, cancelled, confirmed] = currentData;
  const total = pending + confirmed + cancelled;

  // Calculate percentages
  const pendingPercentage = total > 0 ? (pending / total) * 100 : 0;
  const confirmedPercentage = total > 0 ? (confirmed / total) * 100 : 0;
  const cancelledPercentage = total > 0 ? (cancelled / total) * 100 : 0;

  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const [centerX, setCenterX] = useState(160); // default fallback

  const radius = 70;
  const strokeWidth = 25;
  const circumference = 2 * Math.PI * radius;
  const centerY = 140;

  useEffect(() => {
    const updateCenterX = () => {
      if (chartContainerRef.current) {
        const width = chartContainerRef.current.offsetWidth;
        setCenterX(width / 2);
      }
    };

    updateCenterX(); // set initially
    window.addEventListener("resize", updateCenterX);
    return () => window.removeEventListener("resize", updateCenterX);
  }, []);

  const colors = {
    pending: "#D1D5DB", // Light gray
    confirmed: "#EC4899", // Pink
    cancelled: "#6366F1", // Blue
  };

  // Calculate line positions for each segment
  const getSegmentPosition = (startPercentage: any, segmentPercentage: any) => {
    const midPercentage = startPercentage + segmentPercentage / 2;
    const angle = (midPercentage / 100) * 360 - 90; // -90 to start from top
    const radians = (angle * Math.PI) / 180;

    const innerRadius = radius + strokeWidth / 2 + 5;
    const outerRadius = innerRadius + 25;

    const x1 = centerX + Math.cos(radians) * innerRadius;
    const y1 = centerY + Math.sin(radians) * innerRadius;
    const x2 = centerX + Math.cos(radians) * outerRadius;
    const y2 = centerY + Math.sin(radians) * outerRadius;

    const isRightSide = Math.cos(radians) > 0;
    const lineEndX = isRightSide ? x2 + 70 : x2 - 70;
    const labelX = isRightSide ? x2 + 25 : x2 - 25;

    return { x1, y1, x2, y2, lineEndX, labelX, labelY: y2, isRightSide };
  };

  // Get segment data with positions
  const segments = [
    {
      name: "Pending",
      value: pending,
      percentage: pendingPercentage,
      color: colors.pending,
      position:
        pendingPercentage > 0 ? getSegmentPosition(0, pendingPercentage) : null,
    },

    {
      name: "Cancelled",
      value: cancelled,
      percentage: cancelledPercentage,
      color: colors.cancelled,
      position:
        cancelledPercentage > 0
          ? getSegmentPosition(
            pendingPercentage + confirmedPercentage,
            cancelledPercentage
          )
          : null,
    },

    {
      name: "Confirmed",
      value: confirmed,
      percentage: confirmedPercentage,
      color: colors.confirmed,
      position:
        confirmedPercentage > 0
          ? getSegmentPosition(pendingPercentage, confirmedPercentage)
          : null,
    },
  ];

  const salesData: SalesData[] = [
    {
      date: "Jan 3, 25",
      totalSales: "₹2500.00",
      orders: 100,
      commission: "₹2500.00",
      status: "Cancelled",
    },
    {
      date: "Jan 3, 25",
      totalSales: "₹2500.00",
      orders: 100,
      commission: "₹2500.00",
      status: "Pending",
    },
    {
      date: "Jan 3, 25",
      totalSales: "₹2500.00",
      orders: 100,
      commission: "₹2500.00",
      status: "Approved",
    },
    {
      date: "Jan 3, 25",
      totalSales: "₹2500.00",
      orders: 100,
      commission: "₹2500.00",
      status: "Cancelled",
    },
    {
      date: "Jan 3, 25",
      totalSales: "₹2500.00",
      orders: 100,
      commission: "₹2500.00",
      status: "Cancelled",
    },
  ];

  const { data: summary = {} } = useGetUserSummaryQuery({
    start_date: formatDateForAPI(startDate),
    end_date: formatDateForAPI(endDate),
    alltime: allTime
  })

  return (
    <div>
      <div className="relative w-full font-inter">
        <div className="h-[80px] w-full bg-[rgba(222,44,109,1)] absolute top-0 z-0 " />
        <div className="px-[15px] pt-[22px] flex flex-col items-start justify-center gap-[11px] w-full relative z-10">
          <h1 className="text-[#fff] text-[12px] font-medium font-inter ">
            ORDER STATUS
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
                ₹{summary?.total_sales ?? 0}
              </p>
            </div>

            <div className="flex flex-col items-start justify-center gap-1 border-r-[1px] border-r-[rgba(222,44,109,1)] pr-[20px]">
              <h2 className="text-[#333] text-[12px] font-normal font-inter leading-[156%] ">
                Orders
              </h2>
              <p className="m-0 text-[#000] text-[14px] font-medium font-inter leading-[106%] ">
                {summary?.total_orders ?? 0}
              </p>
            </div>

            <div className="flex flex-col items-start justify-center gap-1 border-r-[1px] border-r-[rgba(222,44,109,1)] pr-[20px]">
              <h2 className="text-[#333] text-[12px] font-normal font-inter leading-[156%] ">
                Commission
              </h2>
              <p className="m-0 text-[#000] text-[14px] font-medium font-inter leading-[106%] ">
                ₹{summary?.total_comission ?? 0}
              </p>
            </div>

            <div className="flex flex-col items-start justify-center gap-1 ">
              <h2 className="text-[#333] text-[12px] font-normal font-inter leading-[156%] ">
                Clicks
              </h2>
              <p className="m-0 text-[#000] text-[14px] font-medium font-inter leading-[106%] ">
                {summary?.total_clicks ?? 0}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="p-4 bg-white rounded-lg shadow-sm w-full max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Order Status</h2>

          <div className="flex items-center gap-2">
            <div className="flex items-center">

              <span className="text-[12px] font-medium text-gray-700 mx-2">
                {/* {formatDate(selectedDate)} */}
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
              onClick={() => setShowCalendar(true)}
              className=" border border-gray-300 rounded bg-white hover:bg-gray-50 transition-colors p-1"
            >
              <Calendar size={14} className="text-gray-700" />
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-2 mb-4 items-center justify-center w-full">
          <div className="flex flex-col items-center justify-center w-full">
            <button
              onClick={() => setActiveTab("orders")}
              className={`w-full cursor-pointer flex items-center justify-center gap-2 px-2.5 py-1.5 bg-white rounded-sm text-gray-800 text-base font-bold ${activeTab === "orders"
                ? "border border-[rgba(222,44,109,1)]"
                : ""
                }`}
            >
              <Circle
                className={`w-3 h-3 ${activeTab === "orders"
                  ? "fill-[rgba(222,44,109,1)]"
                  : "fill-[#A8BEAB]"
                  } stroke-none`}
              />
              Order Status
            </button>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="9"
              viewBox="0 0 14 9"
              fill="none"
            >
              <path
                d="M7 9L0.5 0H13.5L7 9Z"
                fill={activeTab === "orders" ? "rgba(222,44,109,1)" : "#A8BEAB"}
              />
            </svg>
          </div>

          <div className="flex flex-col items-center justify-center w-full">
            <button
              onClick={() => setActiveTab("amount")}
              className={`w-full cursor-pointer flex items-center justify-center gap-2 px-2.5 py-1.5 bg-white rounded-sm text-gray-800 text-base font-bold ${activeTab === "amount"
                ? "border border-[rgba(222,44,109,1)]"
                : ""
                }`}
            >
              <Circle
                className={`w-3 h-3 ${activeTab === "amount"
                  ? "fill-[rgba(222,44,109,1)]"
                  : "fill-[#A8BEAB]"
                  } stroke-none`}
              />
              Amount Status
            </button>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="9"
              viewBox="0 0 14 9"
              fill="none"
            >
              <path
                d="M7 9L0.5 0H13.5L7 9Z"
                fill={activeTab === "amount" ? "rgba(222,44,109,1)" : "#A8BEAB"}
              />
            </svg>
          </div>
        </div>

        {/* Donut Chart */}
        <div ref={chartContainerRef} className="relative flex justify-center mb-8 w-[100%]">
          <svg height="280" className="drop-shadow-sm w-[100%]">
            {/* Background circle */}
            <circle

              cx={centerX}
              cy={centerY}
              r={radius}
              fill="none"
              stroke="#f3f4f6"
              strokeWidth={strokeWidth}
            />

            {/* Pending segment */}
            {pendingPercentage > 0 && (
              <circle
                cx={centerX}
                cy={centerY}
                r={radius}
                fill="none"
                stroke={colors.pending}
                strokeWidth={strokeWidth}
                strokeDasharray={`${(pendingPercentage / 100) * circumference
                  } ${circumference}`}
                strokeDashoffset={0}
                transform={`rotate(-90 ${centerX} ${centerY})`}
                className="transition-all duration-500 ease-in-out"
              />
            )}

            {/* Confirmed segment */}
            {confirmedPercentage > 0 && (
              <circle
                cx={centerX}
                cy={centerY}
                r={radius}
                fill="none"
                stroke={colors.confirmed}
                strokeWidth={strokeWidth}
                strokeDasharray={`${(confirmedPercentage / 100) * circumference
                  } ${circumference}`}
                strokeDashoffset={-((pendingPercentage / 100) * circumference)}
                transform={`rotate(-90 ${centerX} ${centerY})`}
                className="transition-all duration-500 ease-in-out"
              />
            )}

            {/* Cancelled segment */}
            {cancelledPercentage > 0 && (
              <circle
                cx={centerX}
                cy={centerY}
                r={radius}
                fill="none"
                stroke={colors.cancelled}
                strokeWidth={strokeWidth}
                strokeDasharray={`${(cancelledPercentage / 100) * circumference
                  } ${circumference}`}
                strokeDashoffset={
                  -(
                    ((pendingPercentage + confirmedPercentage) / 100) *
                    circumference
                  )
                }
                transform={`rotate(-90 ${centerX} ${centerY})`}
                className="transition-all duration-500 ease-in-out"
              />
            )}

            {/* Leader lines and labels */}
            {segments.map((segment, index) => {
              if (!segment.position || segment.percentage === 0) return null;

              const pos = segment.position;

              return (
                <g key={index}>
                  {/* Line from pie to elbow */}
                  <line
                    x1={pos.x1}
                    y1={pos.y1}
                    x2={pos.x2}
                    y2={pos.y2}
                    stroke={segment.color}
                    strokeWidth="2"
                    className="transition-all duration-500"
                  />
                  {/* Horizontal line to label */}
                  <line
                    x1={pos.x2}
                    y1={pos.y2}
                    x2={pos.lineEndX}
                    y2={pos.y2}
                    stroke={segment.color}
                    strokeWidth="2"
                    className="transition-all duration-500"
                  />
                  {/* Label */}
                  <text
                    x={pos.isRightSide ? pos.labelX - 30 : pos.labelX + 30}
                    y={pos.labelY - 8}
                    textAnchor={pos.isRightSide ? "start" : "end"}
                    className="text-xs font-medium "
                  >
                    {segment.name}
                  </text>
                  {/* Value */}
                  <text
                    x={pos.labelX + 10}
                    y={pos.labelY + 18}
                    textAnchor={pos.isRightSide ? "start" : "end"}
                    className="text-lg font-bold"
                    fill={segment.color}
                  >
                    {activeTab === "amount"
                      ? formatNumber(segment.value)
                      : segment.value}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex justify-center items-center flex-wrap gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
            <span className="text-gray-700">Confirmed Orders</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-gray-700">Cancelled Orders</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            <span className="text-gray-700">Pending Orders</span>
          </div>
        </div>

        {/* Calendar Modal */}
        {/* {showCalendar && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Select Date</h3>
                <button
                  onClick={() => setShowCalendar(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ×
                </button>
              </div>

              <div className="text-center py-4">
                <p className="text-gray-600 mb-4">
                  Calendar picker would be implemented here
                </p>
                <p className="font-medium">
                  Current: {formatDate(selectedDate)}
                </p>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setShowCalendar(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setSelectedDate(new Date());
                    setShowCalendar(false);
                  }}
                  className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Today
                </button>
              </div>
            </div>
          </div>
        )} */}
      </div>
      <SlideUpModal
        isOpen={showCalendar}
        onClose={() => setShowCalendar(false)}
        startDate={startDate}
        endDate={endDate}
        alltime={allTime}
        selectAllTime={handleSelectAllTimeActive}
        selectAllTimeInactive={handleSelectAllTimeInActive}
        onDateChange={handleDateChangeModal}
      />
    </div>
  );
};

export default OrderStatusChart;
