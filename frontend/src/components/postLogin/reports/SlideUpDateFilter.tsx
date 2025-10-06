"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SlideUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  startDate: Date | null;
  endDate: Date | null;
  alltime: boolean;
  selectAllTime: () => void;
  onDateChange: (
    startDate: Date | null,
    endDate: Date | null,
    alltime: boolean
  ) => void;
  selectAllTimeInactive: () => void;
}

const SlideUpModal: React.FC<SlideUpModalProps> = ({
  isOpen,
  onClose,
  startDate,
  endDate,
  onDateChange,
  alltime,
  selectAllTime,
  selectAllTimeInactive,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [tempStartDate, setTempStartDate] = useState<Date | null>(startDate);
  const [tempEndDate, setTempEndDate] = useState<Date | null>(endDate);
  const [clickCount, setClickCount] = useState(0);

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day for comparison

  // Quick selection options
  const quickOptions = [
    { label: "All Time", type: "all", value: 1 },
    { label: "Today", type: "day-t", value: 1 },
    { label: "Yesterday", type: "day-y", value: 1 },
    { label: "Last 7 days", type: "days", value: 7 },
    { label: "Last month", type: "month", value: 1 },
    { label: "Last 6 month", type: "months", value: 6 },
  ];

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "2-digit",
    });
  };

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  // Replace the entire getDaysInMonth function:
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevMonthDaysCount = new Date(year, month, 0).getDate();
      const day = prevMonthDaysCount - startingDayOfWeek + i + 1;
      days.push({
        date: new Date(year, month - 1, day),
        isCurrentMonth: false,
        day: day,
      });
    }

    // Add days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        date: new Date(year, month, day),
        isCurrentMonth: true,
        day: day,
      });
    }

    // Calculate if we need to add next month days
    const totalDaysAdded = startingDayOfWeek + daysInMonth;
    const weeksNeeded = Math.ceil(totalDaysAdded / 7);
    const totalCellsNeeded = weeksNeeded * 7;
    const nextMonthDaysToAdd = totalCellsNeeded - totalDaysAdded;

    // Add days from next month only if needed to complete the week
    for (let day = 1; day <= nextMonthDaysToAdd; day++) {
      days.push({
        date: new Date(year, month + 1, day),
        isCurrentMonth: false,
        day: day,
      });
    }

    return days;
  };

  // Replace the date comparison functions:
  const isDateRangeStart = (date: Date) => {
    if (!tempStartDate) return false;
    return date.getTime() === tempStartDate.getTime();
  };

  const isDateRangeEnd = (date: Date) => {
    if (!tempEndDate) return false;
    return date.getTime() === tempEndDate.getTime();
  };

  const isDateSelected = (date: Date) => {
    return isDateRangeStart(date) || isDateRangeEnd(date);
  };

  // Replace the handleDateClick function:
  const handleDateClick = (date: Date) => {
    // Prevent selection of future dates
    if (date > today) return;

    // Create a new date object to avoid reference issues
    const selectedDate = new Date(date.getTime());

    if (clickCount === 0) {
      // First click - set start date
      setTempStartDate(selectedDate);
      setTempEndDate(null);
      setClickCount(1);
    } else if (clickCount === 1) {
      // Second click - set end date
      if (selectedDate.getTime() < tempStartDate!.getTime()) {
        setTempStartDate(selectedDate);
        setTempEndDate(tempStartDate);
      } else {
        setTempEndDate(selectedDate);
      }
      setClickCount(2);
    } else {
      // Third click - reset range to start from this date
      setTempStartDate(selectedDate);
      setTempEndDate(null);
      setClickCount(1);
    }
  };

  const handleQuickSelect = (option: (typeof quickOptions)[0]) => {
    const end = new Date(today);
    let start = new Date();

    if (option.type === "days") {
      // Fix: Create a new date object and set it properly
      selectAllTimeInactive();
      start = new Date(today);
      start.setDate(today.getDate() - option.value + 1); // +1 to include today
    } else if (option.type === "day-t") {
      // Fix: Create a new date object and set it properly
      selectAllTimeInactive();
      start = new Date(today);
      start.setDate(today.getDate() - option.value + 1); // +1 to include today
    } else if (option.type === "day-y") {
      // Fix: Create a new date object and set it properly
      selectAllTimeInactive();
      start = new Date(today);
      start.setDate(today.getDate() - option.value); // +1 to include today
      end.setDate(today.getDate() - option.value);
    } else if (option.type === "all") {
      selectAllTime();
      start = new Date(today);
      start.setDate(today.getDate() - option.value + 1); // +1 to include today
    } else if (option.type === "month") {
      // Get the entire last month
      selectAllTimeInactive();
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
      start = lastMonth;
      end.setTime(lastMonthEnd.getTime());

      // Navigate to last month
      setCurrentMonth(new Date(today.getFullYear(), today.getMonth() - 1, 1));
    } else if (option.type === "months") {
      selectAllTimeInactive();
      start = new Date(today);
      start.setMonth(today.getMonth() - option.value);
    }

    // Reset hours to ensure proper comparison
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    setTempStartDate(start);
    setTempEndDate(end);
    setClickCount(2); // This ensures both dates are considered selected
  };

  const isDateInRange = (date: Date) => {
    if (!tempStartDate || !tempEndDate) return false;
    return date >= tempStartDate && date <= tempEndDate;
  };

  const isFutureDate = (date: Date) => {
    return date > today;
  };

  const handleApply = () => {
    onDateChange(tempStartDate, tempEndDate, alltime);
    onClose();
  };

  const handleClearAll = () => {
    setTempStartDate(null);
    setTempEndDate(null);
    setClickCount(0);
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      if (direction === "prev") {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const days = getDaysInMonth(currentMonth);
  const weekDays = ["M", "T", "W", "T", "F", "S", "S"];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-70 flex flex-col justify-end &::--scrollbar]:hidden shrink scroll-smooth w-[100%]  max-w-[448px] mx-auto">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-[rgba(0,0,0,0.3)] backdrop-blur-[0px] [&::-webkit-scrollbar]:hidden scroll-smooth"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Slide-up Panel */}
          <motion.div
            className="relative bg-white rounded-t-2xl p-6 z-50 w-[100%]   [&::-webkit-scrollbar]:hidden scroll-smooth"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Quick Selection Buttons */}
            <div className="flex gap-4 mb-3">
              <h3 className="text-[12px] font-medium font-inter text-center w-full">
                {alltime
                  ? "All Time"
                  : `${formatDate(tempStartDate)} - ${formatDate(tempEndDate)}`}
              </h3>
            </div>

            <div className="flex w-full justify-start [&::-webkit-scrollbar]:hidden scroll-smooth gap-2 mb-4 overflow-scroll">
              {quickOptions.map((option) => (
                <button
                  key={option.label}
                  onClick={() => handleQuickSelect(option)}
                  className="px-4 py-1.5 rounded-[6px] text-[12px] min-w-fit font-medium font-inter text-[#18181b] bg-[#f4f4f5] hover:bg-gray-50 transition-colors"
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* Date Input Fields */}

            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={() => navigateMonth("prev")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M12 11.3334L8.66667 8.00008L12 4.66675M7.33333 11.3334L4 8.00008L7.33333 4.66675"
                    stroke="#18181B"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <h3 className="text-[14px] text-[#011928] font-medium font-inter leading-6">
                {getMonthName(currentMonth)}
              </h3>
              <button
                onClick={() => navigateMonth("next")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M4 11.3334L7.33333 8.00008L4 4.66675M8.66667 11.3334L12 8.00008L8.66667 4.66675"
                    stroke="#18181B"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="mb-6">
              {/* Week Days Header */}
              <div className="grid grid-cols-7  mb-2">
                {weekDays.map((day, index) => (
                  <div
                    key={index}
                    className="text-center text-[#000] text-[11px] font-normal font-inter leading-5 py-1"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 ">
                {days.map((dayInfo, index) => {
                  const isSelected = isDateSelected(dayInfo.date);
                  const isInRange = isDateInRange(dayInfo.date);
                  const isStart = isDateRangeStart(dayInfo.date);
                  const isEnd = isDateRangeEnd(dayInfo.date);
                  const isSameDate =
                    tempStartDate &&
                    tempEndDate &&
                    tempStartDate.toDateString() ===
                    tempEndDate.toDateString() &&
                    dayInfo.date.toDateString() ===
                    tempStartDate.toDateString();
                  const isFuture = isFutureDate(dayInfo.date);

                  return (
                    <button
                      key={index}
                      onClick={() => handleDateClick(dayInfo.date)}
                      disabled={isFuture}
                      className={`
                        w-full h-8 flex items-center text-center text-[11px] justify-center  relative
                        ${!dayInfo.isCurrentMonth ? "text-gray-300" : ""}
                        ${isFuture ? "text-gray-300 cursor-not-allowed" : ""}
                        ${isSelected || isSameDate
                          ? "bg-[rgba(222,44,109,1)] rounded-lg text-white"
                          : ""
                        }
                        ${isInRange && !isSelected ? "bg-[#F8F9FA] text-[rgba(222,44,109,1)]" : ""}
                        ${!isSelected && !isInRange && !isFuture ? "hover:bg-gray-100" : ""}
                        transition-colors
                       `}
                    >
                      {dayInfo.day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleClearAll}
                style={{
                  boxShadow: "0px 1px 2px 0px rgba(0, 0, 0, 0.05)",
                }}
                className="flex-1 px-5 py-1.5 bg-[#fff] rounded-[8px] border-[1px] border-[#e4e4e7] text-[12px] text-[#18181b] font-inter font-medium leading-6 transition-colors"
              >
                Clear all
              </button>
              <button
                onClick={handleApply}
                disabled={!tempStartDate || !tempEndDate} 
                className={`flex-1 px-5 py-1.5 ${!tempStartDate || !tempEndDate ? "bg-gray-500 cursor-not-allowed" : "bg-[rgba(222,44,109,1)] cursor-pointer"} rounded-[8px]  text-[12px] text-[#fff] font-inter font-medium leading-6 transition-colors`}
              >
                Apply
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SlideUpModal;
