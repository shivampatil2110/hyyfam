"use client";
import React, { useEffect, useRef, useState } from "react";
import SalesBanner from "./SalesBanner";
import Image from "next/image";
import { useLazyGetUpcomingSalesQuery } from "@/redux/api/homeApi";
import { useRouter } from "next/navigation";

const monthNames: string[] = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];


const MonthSwitcher: React.FC<any> = ({ date, setDate }: any) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Generate months to display (6 months before current + current + 11 months after)
  const generateMonths = () => {
    const months = [];
    const startDate = new Date(currentYear, currentMonth - 6); // Start 6 months before current
    
    for (let i = 0; i < 18; i++) { // Total 18 months (6 before + current + 11 after)
      const monthDate = new Date(startDate);
      monthDate.setMonth(startDate.getMonth() + i);
      
      // Check if month is before current month (not allowed to navigate)
      const isBeforeCurrent = monthDate.getFullYear() < currentYear || 
                             (monthDate.getFullYear() === currentYear && monthDate.getMonth() < currentMonth);
      
      // Check if it's the previous month of the SELECTED date
      const selectedPrevMonth = new Date(date.getFullYear(), date.getMonth() - 1);
      const isPrevOfSelected = monthDate.getFullYear() === selectedPrevMonth.getFullYear() && 
                              monthDate.getMonth() === selectedPrevMonth.getMonth();
      
      // Check if it's the next month of the SELECTED date  
      const selectedNextMonth = new Date(date.getFullYear(), date.getMonth() + 1);
      const isNextOfSelected = monthDate.getFullYear() === selectedNextMonth.getFullYear() && 
                              monthDate.getMonth() === selectedNextMonth.getMonth();
      
      months.push({
        date: monthDate,
        name: monthNames[monthDate.getMonth()],
        year: monthDate.getFullYear(),
        isSelected: monthDate.getMonth() === date.getMonth() && monthDate.getFullYear() === date.getFullYear(),
        isCurrent: monthDate.getMonth() === currentMonth && monthDate.getFullYear() === currentYear,
        isBeforeCurrent,
        isPrevOfSelected,
        isNextOfSelected
      });
    }
    return months;
  };

  const months = generateMonths();

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (containerRef.current?.offsetLeft || 0));
    setScrollLeft(containerRef.current?.scrollLeft || 0);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - (containerRef.current.offsetLeft || 0);
    const walk = (x - startX) * 2;
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX - (containerRef.current?.offsetLeft || 0));
    setScrollLeft(containerRef.current?.scrollLeft || 0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !containerRef.current) return;
    const x = e.touches[0].pageX - (containerRef.current.offsetLeft || 0);
    const walk = (x - startX) * 2;
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleMonthClick = (month: any) => {
    // Don't allow navigation to months before current month
    if (month.isBeforeCurrent) return;
    setDate(new Date(month.date));
  };

  // Helper function to center a month
  const centerMonth = (monthIndex: number) => {
    if (monthIndex !== -1 && containerRef.current) {
      // Wait for the next tick to ensure DOM is updated
      setTimeout(() => {
        const container = containerRef.current;
        if (!container) return;
        
        const monthElement = container.children[monthIndex] as HTMLElement;
        if (!monthElement) return;
        
        const containerWidth = container.clientWidth;
        const elementWidth = monthElement.offsetWidth;
        const elementLeft = monthElement.offsetLeft;
        
        // Calculate the scroll position to center the element properly
        const scrollPosition = elementLeft - (containerWidth / 2) + (elementWidth / 2);
      
        container.scrollTo({
          left: Math.max(0, scrollPosition),
          behavior: 'smooth'
        });
      }, 100); // Increased timeout to ensure proper rendering
    }
  };

  useEffect(() => {
    // Scroll to center the current month on mount
    const currentIndex = months.findIndex(month => month.isCurrent);
    centerMonth(currentIndex);
  }, []);

  useEffect(() => {
    // Scroll to selected month when date changes
    const selectedIndex = months.findIndex(month => month.isSelected);
    centerMonth(selectedIndex);
  }, [date]);

  const getMonthClassName = (month: any) => {
    let baseClass = 'flex-shrink-0 text-[13px] font-inter font-semibold transition-all duration-200 whitespace-nowrap ';
    
    if (month.isSelected) {
      baseClass += 'text-black font-semibold';
    } else if (month.isCurrent) {
      baseClass += 'text-gray-400 hover:text-gray-600'; // Current month should not be black when not selected
    } else if (month.isBeforeCurrent) {
      // Not allowed to navigate - cursor not allowed and very faded
      baseClass += 'text-gray-300 opacity-40 cursor-not-allowed';
    } else if (month.isPrevOfSelected || month.isNextOfSelected) {
      // Adjacent months to SELECTED month - faded with opacity
      baseClass += 'text-gray-800 opacity-50 hover:text-gray-600 hover:opacity-70 cursor-pointer';
    } else {
      baseClass += 'text-gray-400 hover:text-gray-600 cursor-pointer';
    }
    
    return baseClass;
  };

  return (
    <div className="w-full ">
      <div
        ref={containerRef}
        className="flex items-center gap-8 px-4 py-2 overflow-x-auto scrollbar-hide cursor-grab select-none"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {months.map((month, index) => (
          <button
            key={`${month.year}-${month.date.getMonth()}`}
            onClick={() => !isDragging && handleMonthClick(month)}
            className={getMonthClassName(month)}
            style={{ userSelect: 'none' }}
            disabled={month.isBeforeCurrent}
          >
            {month.name} {month.year}
          </button>
        ))}
      </div>
      
      {/* Hide scrollbar with CSS */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};


const SalesInfo = () => {
  const router = useRouter();
  const [date, setDate] = useState<Date>(new Date());
  const [sales, setSales] = useState<any>([]);
  const [trigger, triggerState] = useLazyGetUpcomingSalesQuery()
  const [isSales, setIsSales] = useState<Boolean>(false);

  useEffect(() => {
    getSales();
  }, [date]);

  const getSales = async () => {
    const isoDate = date.toISOString();
    let res = await trigger({
      start_date: isoDate
    }).unwrap()
    if(res.length > 0) {
      setIsSales(true);
    }
    setSales(res)
  }


  function extractMonthDay(dateString: string): string {
    const date = new Date(dateString);

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      timeZone: "UTC", // optional: ensure consistency across environments
    });
  }

  const redirectToCategory = (cat: string) => {
    router.push(`/deals&offers?category=${cat}`)
  }

  const handleStoreClick = async (store: any) => {
    let obj: any = {};
    obj.store_page_url = store.store_page_url;
    // console.log(store.active, store.url, store.store_name, store.store_page_url, store.img_url, "checking inside hanfdle click");
    if (store.active) {
      window.open(
        `/redirect/seller/${store.store_page_url}?name=${store.store_name}&img_url=${store.img_url}`,
        "_blank"
      );
    } else {
      window.open(store.url, "_blank");
    }
  };

  return (
    <div>
      <div className="flex flex-col w-full items-center justify-center">
        <SalesBanner />
        <div className="w-[90%] mx-auto rounded-[29px] border-[1px] border-[#e6e6e6] py-[5px] px-[5px] flex items-center justify-start  mt-[-28px] relative z-10 bg-[#fff]">
          <button
            onClick={() => setIsSales(!isSales)}
            style={{
              background: isSales
                ? "linear-gradient(180deg, #F1437E 0%, #F86DA0 100%)"
                : "#fff",
            }}
            className={`w-full rounded-[29px] py-[14px] ${
              isSales ? " text-[#fff]" : "text-[#656565]"
            } font-inter text-[12px] font-semibold cursor-pointer leading-[19px] py-1 `}
          >
            Upcoming Sale
          </button>
          <button
            onClick={() => setIsSales(!isSales)}
            style={{
              background: !isSales
                ? "linear-gradient(180deg, #F1437E 0%, #F86DA0 100%)"
                : "#fff",
            }}
            className={`w-full rounded-[29px] py-[14px] ${
              !isSales ? " text-[#fff]" : "text-[#656565]"
            } font-inter text-[12px] font-semibold cursor-pointer leading-[19px] py-1 `}
          >
            Deals & Offers
          </button>
        </div>
        {!isSales && (
          <div className="flex flex-col w-full items-center justify-center px-4">
            <div className="flex flex-col items-center justify-center gap-4 py-4 bg-[#fff] w-full">
              <p className="w-full text-left text-[#000] text-[20px] font-medium leading-normal font-inter">
                Shop by categories
              </p>

              <div className="grid grid-cols-2 gap-3 bg-white w-full ">
                {/* CLOTHING */}
                <div
                  className="bg-[#f3f3f3] rounded-[15px] pt-2 flex flex-col items-center justify-between text-center col-span-1 row-span-4 cursor-pointer"
                  onClick={() => {
                    redirectToCategory("clothing");
                  }}
                >
                  <h3 className="font-raleway text-center text-[#000] uppercase text-[16px] font-bold">
                    Clothing
                  </h3>
                  <Image
                    className="rounded-b-[15px] object-cover"
                    src={"/static/clothing.png"}
                    alt="clothing"
                    width={210}
                    height={80}
                  />
                </div>

                {/* FASHION */}
                <div
                  className="bg-[#f3f3f3] rounded-[15px] pt-2 flex flex-col items-center justify-between text-center col-span-1 row-span-3 cursor-pointer"
                  onClick={() => {
                    redirectToCategory("fashion");
                  }}
                >
                  <h3 className="font-raleway text-center text-[#000] uppercase text-[16px] font-bold">
                    Fashion
                  </h3>
                  <Image
                    className="rounded-b-[15px] object-cover"
                    src={"/static/fashion.png"}
                    alt="fashion"
                    width={200}
                    height={60}
                  />
                </div>

                {/* BEAUTY */}
                <div
                  className="bg-[#f3f3f3] rounded-[15px] pt-2 flex flex-col items-center justify-between text-center col-span-1 row-span-4 cursor-pointer"
                  onClick={() => {
                    redirectToCategory("beauty");
                  }}
                >
                  <h3 className="font-raleway text-center text-[#000] uppercase text-[16px] font-bold">
                    Beauty
                  </h3>
                  <Image
                    className="rounded-b-[15px] object-cover"
                    src={"/static/beauty.png"}
                    alt="beauty"
                    width={200}
                    height={80}
                  />
                </div>

                {/* ELECTRONICS */}
                <div
                  className="bg-[#f3f3f3] rounded-[15px] pt-2 flex flex-col items-center justify-between text-center col-span-1 row-span-4 cursor-pointer"
                  onClick={() => {
                    redirectToCategory("electronics");
                  }}
                >
                  <h3 className="font-raleway text-center text-[#000] uppercase text-[16px] font-bold mb-3">
                    Electronics
                  </h3>
                  <Image
                    className="rounded-b-[15px] object-cover"
                    src={"/static/electronics.png"}
                    alt="electronics"
                    width={200}
                    height={80}
                  />
                </div>

                {/* VIEW ALL */}
                <div
                  style={{
                    background:
                      "linear-gradient(180deg, #F1437E 0%, #F86A9D 100%)",
                  }}
                  className="rounded-[15px] p-2 flex items-center justify-center h-[50px] text-center col-span-1 row-span-1 cursor-pointer"
                  onClick={() => {
                    redirectToCategory("all");
                  }}
                >
                  <h3 className="font-raleway text-center text-[#fff] uppercase text-[14px] font-semibold">
                    View All
                  </h3>
                </div>
              </div>
            </div>
          </div>
        )}

        {isSales && (
          <div className="w-full flex flex-col items-center justify-center mt-[10px] gap-3.5">
            <MonthSwitcher date={date} setDate={setDate} />
            <div
              className="relative max-h-[220px] overflow-y-auto  custom-scroll-left bg-white rounded-[4px]  py-[9px] px-4 w-full"
            >
              <div className="space-y-4">
                {Array.isArray(sales) &&
                  sales?.map((sale: any, index: number) => (
                    <div
                    onClick={() => handleStoreClick(sale)}
                      key={index}
                      className="flex flex-col items-center justify-center gap-7 bg-[#f7f7f7]  hover:border-[rgba(222,44,109,1)] pl-8 pr-4 pb-3 pt-5 cursor-pointer p-[6px] rounded-[15px]"
                    >
                      <div className="flex  items-center justify-between gap-3 w-full">
                        <div className="flex items-center justify-start gap-8 w-full">
                          <Image
                            src={sale?.img_url}
                            alt="store"
                            height={45}
                            width={100}
                          />
                          <div className="w-full">
                            <p className="font-semibold text-[12px] font-inter leading-[8px] text-[#444]">
                              {sale?.sale_name}
                            </p>
                            <p className="m-0 text-[20px] text-[#f1437e] pt-1 font-inter font-semibold text-left leading-normal  ">
                              {sale?.discount_percentage}
                            </p>
                            <div className="flex  items-center justify-between gap-1 text-right pb-1  w-full">
                              <span className="font-normal text-[9px] font-inter leading-[8px] text-[#000] flex items-center gap-1">
                                <svg
                                  className="scale-120 mb-0.5"
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="9"
                                  height="9"
                                  viewBox="0 0 9 9"
                                  fill="none"
                                >
                                  <path
                                    d="M8.14191 1.54068H6.46191V0.900679C6.46191 0.856679 6.42591 0.820679 6.38191 0.820679H5.82191C5.77791 0.820679 5.74191 0.856679 5.74191 0.900679V1.54068H3.18191V0.900679C3.18191 0.856679 3.14591 0.820679 3.10191 0.820679H2.54191C2.49791 0.820679 2.46191 0.856679 2.46191 0.900679V1.54068H0.781914C0.604914 1.54068 0.461914 1.68368 0.461914 1.86068V8.50068C0.461914 8.67768 0.604914 8.82068 0.781914 8.82068H8.14191C8.31891 8.82068 8.46191 8.67768 8.46191 8.50068V1.86068C8.46191 1.68368 8.31891 1.54068 8.14191 1.54068ZM7.74191 8.10068H1.18191V4.30068H7.74191V8.10068ZM1.18191 3.62068V2.26068H2.46191V2.74068C2.46191 2.78468 2.49791 2.82068 2.54191 2.82068H3.10191C3.14591 2.82068 3.18191 2.78468 3.18191 2.74068V2.26068H5.74191V2.74068C5.74191 2.78468 5.77791 2.82068 5.82191 2.82068H6.38191C6.42591 2.82068 6.46191 2.78468 6.46191 2.74068V2.26068H7.74191V3.62068H1.18191Z"
                                    fill="black"
                                  />
                                </svg>
                                {extractMonthDay(sale.start_date)}-
                                {extractMonthDay(sale.end_date)}
                              </span>
                              {/* <span className="text-[#a1a0a0] font-normal font-inter text-[10px]">
                                ~{sale.time}
                              </span> */}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                {!sales.length && (
                  <div className="flex justify-center font-raleway">
                    <p>No sales in this month</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesInfo;