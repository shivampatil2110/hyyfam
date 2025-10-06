import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar, Circle } from "lucide-react";
import { current } from "@reduxjs/toolkit";

interface ChannelData {
  totalComission: number;
  totalSales: number;
  totalOrders: number;
  //   totalSales: number;
  //   totalOrders: number;
  //   totalCommission: number;
}

const ChannelChart = () => {
  const [activeTab, setActiveTab] = useState<"orders" | "amount">("orders");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);

  // Mock data - replace with your actual data
  const channelData: ChannelData = {
    totalComission: 30,
    totalSales: 50,
    totalOrders: 20,
    // totalSales: 15420,
    // totalOrders: 100,
    // totalCommission: 2310,
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "2-digit",
    });
  };

  const handleDateChange = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate);
    if (direction === "prev") {
      newDate.setDate(newDate.getDate() - 1);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setSelectedDate(newDate);
  };

  const handleCalendarDateSelect = (date: Date) => {
    setSelectedDate(date);
    setShowCalendar(false);
  };

  // Calculate percentages for the donut chart
  const total =
    channelData.totalComission +
    channelData.totalSales +
    channelData.totalOrders;
  const pendingPercentage = (channelData.totalComission / total) * 100;
  const confirmedPercentage = (channelData.totalSales / total) * 100;
  const cancelledPercentage = (channelData.totalOrders / total) * 100;

  // SVG donut chart calculations
  const radius = 70;
  const strokeWidth = 35;
  const circumference = 2 * Math.PI * radius;

  const pendingOffset = 0;
  const confirmedOffset = (pendingPercentage / 100) * circumference;
  const cancelledOffset =
    ((pendingPercentage + confirmedPercentage) / 100) * circumference;

  const createDonutSegment = (
    percentage: number,
    offset: number,
    color: string
  ) => {
    const strokeDasharray = `${
      (percentage / 100) * circumference
    } ${circumference}`;
    const strokeDashoffset = -offset;

    return {
      strokeDasharray,
      strokeDashoffset,
      stroke: color,
      strokeWidth,
      fill: "none",
      r: radius,
      cx: 100,
      cy: 100,
    };
  };

  return (
    <div className="px-[9px] pt-3  bg-[#fcfcfc] pb-10 rounded-sm flex flex-col items-center justify-center gap-5 w-full ">
      <div className="flex items-center justify-end gap-7 w-full">
        {/* <h2 className="text-[15px] font-bold text-[#000] font-inter">
            Order Status
          </h2> */}

        <div className="flex items-center justify-end gap-2">
          <div className="flex items-center justify-between">
            <button
              onClick={() => handleDateChange("prev")}
              className="p-2 rounded-full transition-colors"
            >
              <ChevronLeft size={16} className="text-[#000]" />
            </button>

            <span className="text-[12px] font-inter font-medium text-[#000]">
              {formatDate(selectedDate)}
            </span>

            <button
              onClick={() => handleDateChange("next")}
              className="p-2 rounded-full transition-colors"
            >
              <ChevronRight
                size={16}
                className={` ${
                  formatDate(selectedDate) == formatDate(new Date())
                    ? "text-[#000]/25"
                    : "text-[#000]"
                } `}
              />
            </button>
          </div>
          <button
            onClick={() => setShowCalendar(true)}
            className="p-2 border-[0.5px] border-[#dcdcdc] rounded-sm  transition-colors bg-[#fff]"
          >
            <Calendar size={16} className="text-[#000]" />
          </button>
        </div>
      </div>

      {/* Donut Chart */}
      <div className="relative w-full px-[9px]">
        <svg width="240" height="240" className="mx-auto">
          {/* Background circle */}
          <circle
            cx="120"
            cy="120"
            r={radius}
            fill="none"
            stroke="#f3f4f6"
            strokeWidth={strokeWidth}
          />

          {/* Pending orders segment */}
          <circle
            cx="120"
            cy="120"
            r={radius}
            fill="none"
            stroke="#687BDC"
            strokeWidth={strokeWidth}
            strokeDasharray={`${
              (pendingPercentage / 100) * circumference
            } ${circumference}`}
            strokeDashoffset={0}
            className="transition-all duration-500"
            transform="rotate(-90 120 120)"
          />

          {/* Confirmed orders segment */}
          <circle
            cx="120"
            cy="120"
            r={radius}
            fill="none"
            stroke="rgba(222,44,109,1)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${
              (confirmedPercentage / 100) * circumference
            } ${circumference}`}
            strokeDashoffset={-((pendingPercentage / 100) * circumference)}
            className="transition-all duration-500"
            transform="rotate(-90 120 120)"
          />

          {/* Cancelled orders segment */}
          <circle
            cx="120"
            cy="120"
            r={radius}
            fill="none"
            stroke="#d5e2ee"
            strokeWidth={strokeWidth}
            strokeDasharray={`${
              (cancelledPercentage / 100) * circumference
            } ${circumference}`}
            strokeDashoffset={
              -(
                ((pendingPercentage + confirmedPercentage) / 100) *
                circumference
              )
            }
            className="transition-all duration-500"
            transform="rotate(-90 120 120)"
          />

          {/* Lines pointing to segments */}
          {/* Pending Orders Line */}
          <g>
            <line
              x1="60"
              y1="80"
              x2="30"
              y2="50"
              stroke="#d5e2ee"
              strokeWidth="2"
              className="transition-all duration-500"
            />
            <line
              x1="30"
              y1="50"
              x2="5"
              y2="50"
              stroke="#d5e2ee"
              strokeWidth="2"
              className="transition-all duration-500"
            />
          </g>

          {/* Confirmed Orders Line */}
          <g>
            <line
              x1="180"
              y1="160"
              x2="210"
              y2="190"
              stroke="rgba(222,44,109,1)"
              strokeWidth="2"
              className="transition-all duration-500"
            />
            <line
              x1="210"
              y1="190"
              x2="235"
              y2="190"
              stroke="rgba(222,44,109,1)"
              strokeWidth="2"
              className="transition-all duration-500"
            />
          </g>

          {/* Cancelled Orders Line */}
          <g>
            <line
              x1="180"
              y1="80"
              x2="210"
              y2="50"
              stroke="#687BDC"
              strokeWidth="2"
              className="transition-all duration-500"
            />
            <line
              x1="210"
              y1="50"
              x2="235"
              y2="50"
              stroke="#687BDC"
              strokeWidth="2"
              className="transition-all duration-500"
            />
          </g>
        </svg>

        {/* Labels positioned next to lines */}
        <div className="absolute top-6 left-1 text-[12px] text-[#000] font-medium font-inter">
          Total Comission
        </div>
        <div className="absolute top-6 right-1 text-[12px] text-[#000] font-medium font-inter">
          Total Sales
        </div>
        <div className="absolute bottom-6 right-1 text-[12px] text-[#000] font-medium font-inter">
          Total Orders
        </div>

        {/* Numbers positioned below labels */}
        <div className="absolute top-10 left-1 text-[15px] font-inter font-semibold text-[#d5e2ee]">
          {channelData.totalComission}
        </div>
        <div className="absolute top-10 right-1 text-[15px] font-inter font-semibold text-[#687bdc]">
          {channelData.totalOrders}
        </div>
        <div className="absolute bottom-10 right-1 text-[15px] font-inter font-semibold text-[rgba(222,44,109,1)]">
          {channelData.totalSales}
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
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-4">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                  <div
                    key={day}
                    className="text-center text-xs font-medium text-gray-500 py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 35 }, (_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() - 15 + i);
                  const isSelected =
                    date.toDateString() === selectedDate.toDateString();
                  const isToday =
                    date.toDateString() === new Date().toDateString();

                  return (
                    <button
                      key={i}
                      onClick={() => handleCalendarDateSelect(date)}
                      className={`p-2 text-sm rounded hover:bg-gray-100 transition-colors ${
                        isSelected
                          ? "bg-pink-500 text-white"
                          : isToday
                          ? "bg-blue-100 text-blue-600"
                          : "text-gray-700"
                      }`}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setShowCalendar(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleCalendarDateSelect(new Date())}
                  className="px-4 py-2 text-sm bg-pink-500 text-white rounded hover:bg-pink-600"
                >
                  Today
                </button>
              </div>
            </div>
          </div>
        )} */}
    </div>
  );
};

export default ChannelChart;
