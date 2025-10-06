import React, { useEffect, useState } from "react";
import { useGetProductReportQuery } from "@/redux/api/analyticsApi";
import { showToast } from "@/components/Toast/Toast";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import SlideUpModal from "../reports/SlideUpDateFilter";
import { copyToClipboard } from "@/utils/common_functions";
import SlideUpSortModal from "../reports/SlideUpSortingModal";
import { useSelector } from "react-redux";
interface ProductData {
  img_url: string;
  name: string;
  link: string;
  purchased_quantity: number;
  approved_amount: number;
  total_earning: number;
  clicks: number;
  created_at: string;
  aff_link: string;
}

const ProductSection = () => {
  const formatDateForAPI = (date: Date | string | null): string => {
    if (!date) return "";

    let d: Date;
    if (typeof date === "string") {
      // Parse safely as local date
      const parts = date.split('-');
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


  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const itemsPerPage = 10;

  // Sort states
  const [selectedSort, setSelectedSort] = useState<string>("newest_first");
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);

  const [startDate, setStartDate] = useState<Date | null>(() => {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    return sevenDaysAgo;
  });
  const [allTime, setAllTime] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const [endDate, setEndDate] = useState<Date | null>(() => new Date());
  let { data: { report: productData = [], count } = {}, isLoading } = useGetProductReportQuery({
    start_date: formatDateForAPI(startDate),
    end_date: formatDateForAPI(endDate),
    sort_by: selectedSort,
    alltime: allTime,
    page: currentPage,
  }) as {
    data: any;
    isLoading: boolean;
  };

  useEffect(() => {

    if (count !== null) {
      setTotalCount(count);
    }
  }, [count, isLoading]);

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // setExpandedPosts(new Set()); // Reset expanded posts when page changes
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(1, currentPage - 2);
      const end = Math.min(totalPages, start + maxVisiblePages - 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  // Sort handlers
  const handleSortChange = (sortValue: string) => {
    setSelectedSort(sortValue);
    setCurrentPage(1);
  };

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

  return (
    <div className="flex flex-col items-center justify-center gap-4 w-full px-4">
      <div className="flex items-center justify-between w-full">
        <p className="text-black text-base font-medium w-fit font-inter leading-6">
          Total Products ({totalCount})
        </p>

        <div className="flex items-center w-fit justify-end gap-1">
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
            onClick={() => setIsModalOpen(true)}
            className="p-1 border border-gray-300 rounded bg-white hover:bg-gray-50 transition-colors"
          >
            <Calendar size={12} className="text-gray-700" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-end w-full gap-3">
        <div
          onClick={() => setIsSortModalOpen(true)}
          className="flex items-center justify-center px-2 py-2 cursor-pointer rounded-sm border border-gray-300 bg-white gap-1"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="7"
            height="9"
            viewBox="0 0 7 9"
            fill="none"
          >
            <path
              d="M1.3125 9H2.1875V2.25H3.5L1.75 0L0 2.25H1.3125V9ZM7 6.75H5.6875V0H4.8125V6.75H3.5L5.25 9L7 6.75Z"
              fill="black"
            />
          </svg>
          <p className="text-xs text-black font-medium font-inter">Sort</p>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="11"
            height="7"
            viewBox="0 0 11 7"
            fill="none"
          >
            <path d="M1 1.25L6 5.75L10.5 1.25" stroke="black" />
          </svg>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center w-full gap-4  py-2">
        {productData.map((product: any, index: number) => (
          <div
            key={index}
            className="flex flex-col items-center justify-center w-full"
          >
            <div className="flex flex-col items-center justify-center p-[6px] gap-2 rounded-sm border-[0.5px] border-[#e2dfdf] w-full">
              <div className="flex items-center justify-center gap-3 w-full sm:pl-2 ">
                <img
                  src={product.img_url}
                  alt={product.name}
                  className="w-12 min-h-[65px] max-h-[65px] object-cover rounded-[3px]  "
                />
                <div className="flex sm:hidden flex-col items-start justify-center w-full gap-2 ">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex flex-col items-start justify-center w-full">
                      <div className="w-full flex items-center justify-between gap-5">
                        <h3 className="text-[13px] font-medium text-[#000] font-inter text-ellipsis line-clamp-1 w-[67%]">
                          {product.name}
                        </h3>

                        <button
                          className="text-[11px] text-[rgba(222,44,109,1)] cursor-pointer pr-3 underline"
                          onClick={() => copyToClipboard(product.aff_link)}
                        >
                          Copy Link
                        </button>
                      </div>
                      <p className="text-[10px] text-[#787878] font-inter font-medium">
                        {new Date(product.created_at).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour12: true,
                          }
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-start ">
                    <div className="flex flex-col items-start justify-center py-[2px] gap-[3px] border-r-[0.3px] border-r-[#e3e3e3] pr-3 ">
                      <p className="text-[13px] text-[#333] font-regular font-inter leading-[120%] ">
                        Clicks
                      </p>
                      <p className="text-[13px] text-[#000] font-bold font-inter leading-[120%] ">
                        {product.clicks}
                      </p>
                    </div>

                    <div className="flex flex-col items-start justify-center py-[2px] gap-[3px] border-r-[0.3px] border-r-[#e3e3e3] pr-3 pl-3 ">
                      <p className="text-[13px] text-[#333] font-regular font-inter leading-[120%] ">
                        Orders
                      </p>
                      <p className="text-[13px] text-[#000] font-bold font-inter leading-[120%] ">
                        {product.purchased_quantity}
                      </p>
                    </div>

                    <div className="flex flex-col items-start justify-center py-[2px] gap-[3px] border-r-[0.3px] border-r-[#e3e3e3] pr-3 pl-3 ">
                      <p className="text-[13px] text-[#333] font-regular font-inter leading-[120%] ">
                        Sales
                      </p>
                      <p className="text-[13px] text-[#000] font-bold font-inter leading-[120%] ">
                        {product.total_earning}
                      </p>
                    </div>

                    <div className="flex flex-col items-start justify-center py-[2px] gap-[3px] pl-3 ">
                      <p className="text-[13px] text-[#333] font-regular font-inter leading-[120%] ">
                        Commission
                      </p>
                      <p className="text-[13px] text-[#000] font-bold font-inter leading-[120%] ">
                        {product.approved_amount}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="sm:flex hidden flex-col items-start justify-center w-full gap-2 pl-3 ">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex flex-col items-start justify-center w-full">
                      <div className="w-full flex items-center justify-between gap-5">
                        <h3 className="text-[13px] font-medium text-[#000] font-inter text-ellipsis line-clamp-1 w-[67%]">
                          {product.name}
                        </h3>

                        <button
                          className="text-[11px] text-[rgba(222,44,109,1)] cursor-pointer pr-3 underline "
                          onClick={() => copyToClipboard(product.aff_link)}
                        >
                          Copy Link
                        </button>
                      </div>
                      <p className="text-[10px] text-[#787878] font-inter font-medium">
                        {new Date(product.created_at).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour12: true,
                          }
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-start gap-3 ">
                    <div className="flex flex-col items-start justify-center py-[2px] gap-[3px] border-r-[0.3px] border-r-[#e3e3e3] pr-5 ">
                      <p className="text-[13px] text-[#333] font-regular font-inter leading-[120%] ">
                        Clicks
                      </p>
                      <p className="text-[13px] text-[#000] font-bold font-inter leading-[120%] ">
                        {product.clicks}
                      </p>
                    </div>

                    <div className="flex flex-col items-start justify-center py-[2px] gap-[3px] border-r-[0.3px] border-r-[#e3e3e3] pr-5 ">
                      <p className="text-[13px] text-[#333] font-regular font-inter leading-[120%] ">
                        Orders
                      </p>
                      <p className="text-[13px] text-[#000] font-bold font-inter leading-[120%] ">
                        {product.purchased_quantity}
                      </p>
                    </div>

                    <div className="flex flex-col items-start justify-center py-[2px] gap-[3px] border-r-[0.3px] border-r-[#e3e3e3] pr-5  ">
                      <p className="text-[13px] text-[#333] font-regular font-inter leading-[120%] ">
                        Sales
                      </p>
                      <p className="text-[13px] text-[#000] font-bold font-inter leading-[120%] ">
                        {product.total_earning}
                      </p>
                    </div>

                    <div className="flex flex-col items-start justify-center py-[2px] gap-[3px]  ">
                      <p className="text-[13px] text-[#333] font-regular font-inter leading-[120%] ">
                        Commission
                      </p>
                      <p className="text-[13px] text-[#000] font-bold font-inter leading-[120%] ">
                        {product.approved_amount}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Products List */}
          </div>
        ))}
        {!productData.length && (
          <h3 className="text-[16px] text-gray-500 font-inter py-20">
            No data to show in the selected date range.
          </h3>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4 w-full">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="flex items-center justify-center p-2  rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={16} className="text-gray-700" />
          </button>

          <div className="flex items-center gap-1">
            {getPageNumbers().map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${
                  currentPage === pageNum
                    ? "bg-[rgba(222,44,109,1)] text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {pageNum}
              </button>
            ))}
          </div>

          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={`flex items-center justify-center cursor-pointer p-2 rounded-md  ${
              currentPage === totalPages
                ? " text-gray-400 cursor-not-allowed"
                : " text-gray-700 hover:bg-gray-50"
            }`}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

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

      <SlideUpSortModal
        isOpen={isSortModalOpen}
        onClose={() => setIsSortModalOpen(false)}
        selectedSort={selectedSort}
        onSortChange={handleSortChange}
      />
    </div>
  );
};

export default ProductSection;
