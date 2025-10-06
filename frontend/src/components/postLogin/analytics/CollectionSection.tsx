import React, { useState, useEffect } from "react";
import {
  useGetCollectionReportQuery,
  useLazyGetCollectionReportQuery,
} from "@/redux/api/analyticsApi";
import { useSelector } from "react-redux";
import { WEBSITE_URL } from "@/appConstants/baseURL";
import SlideUpModal from "../reports/SlideUpDateFilter";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { copyToClipboard } from "@/utils/common_functions";
import SlideUpSortModal from "../reports/SlideUpSortingModal";

interface ProductData {
  img_url: string;
  name: string;
  link: string;
  total_purchased_quantity: number;
  total_earning: number;
  total_approved_amount: number;
  aff_link: string;
}

interface CollectionData {
  id: string;
  imgUrl: string;
  created_at: string;
  name: string;
  productCount: number;
  link: string;
  total_clicks: number;
  total_approved_amount: number;
  total_purchased_quantity: number;
  total_earning: number;
  products: ProductData[];
  aff_links_length: number;
  first_img_url: string;
}

const CollectionSection = () => {
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

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const itemsPerPage = 10;

  // Sort states
  const [selectedSort, setSelectedSort] = useState<string>("newest_first");
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);

  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());
  const [collectionData, setCollectionData] = useState<CollectionData[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | null>(() => {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    return sevenDaysAgo;
  });
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [allTime, setAllTime] = useState<boolean>(false);
  const [endDate, setEndDate] = useState<Date | null>(() => new Date());

  const { data, isLoading, isError } = useGetCollectionReportQuery({
    start_date: formatDateForAPI(startDate),
    end_date: formatDateForAPI(endDate),
    alltime: allTime,
    sort_by: selectedSort,
    page: currentPage,
    limit: itemsPerPage,
  });

  const [trigger, { data: product, isFetching }] = useLazyGetCollectionReportQuery();

  const cachedProducts = useSelector((state: any) => state?.analyticsApi);
  const { uid, created_at } = useSelector((state: any) => state?.auth.user);

  // Sort handlers
  const handleSortChange = (sortValue: string) => {
    setSelectedSort(sortValue);
    setCurrentPage(1); // Reset to first page when sorting changes
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setExpandedPosts(new Set()); // Reset expanded posts when page changes
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

  useEffect(() => {
    if (!isLoading && data) {
      setCollectionData(data.report);
      // Only update total count if it's not null (first page response)
      if (data.count !== null) {
        setTotalCount(data.count);
      }
    }
  }, [data, isLoading]);

  useEffect(() => {
    if (startDate && endDate) {
      setCurrentPage(1); // Reset to first page when date changes
      // trigger({
      //   start_date: formatDateForAPI(startDate),
      //   end_date: formatDateForAPI(endDate),
      //   alltime: allTime,
      //   page: 1,
      //   limit: itemsPerPage,
      // });
    }
  }, [startDate, endDate, allTime]);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    // onChange?.(newValue);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // onSearch?.(inputValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      //   onSearch?.(inputValue);
    }
  };

  const toggleProducts = async (collectionId: any) => {
    let obj: any = {};
    obj.post_id = collectionId;
    let data =
      cachedProducts.queries?.[`getCollectionReport({"cid":${collectionId}})`]
        ?.data;

    let res;
    if (data?.length) {
      res = data;
    } else {
      res = await trigger({ cid: collectionId }).unwrap();
    }
    setCollectionData((prev: any) => {
      return prev.map((collection: any) => {
        if (collection.id === collectionId) {
          return {
            ...collection,
            products: res,
          };
        }
        return collection;
      });
    });
    setExpandedPosts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(collectionId)) {
        newSet.delete(collectionId);
      } else {
        newSet.add(collectionId);
      }
      return newSet;
    });
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 w-full px-4">
      {/* <div className="w-full bg-[#f8f9fa] rounded-[5px] py-2 px-2 relative mt-[-2px]">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
          >
            <circle cx="5.16681" cy="5.16663" r="4.16681" stroke="black" />
            <path
              d="M11.0005 11.0002L8.22266 8.22229"
              stroke="black"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={"Search Collection"}
          className="w-full bg-[#f8f9fa] pl-7 text-[#000] placeholder-[#363b4b] text-[12px] font-inter focus:outline-none duration-200"
        />
      </div> */}

      <div className="flex items-center justify-between w-full">
        <p className="text-black text-base font-medium font-inter leading-6">
          Total Collection ({totalCount})
        </p>
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
            onClick={() => setIsModalOpen(true)}
            className=" border border-gray-300 rounded bg-white hover:bg-gray-50 transition-colors p-1"
          >
            <Calendar size={14} className="text-gray-700" />
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

      <div className="flex flex-col items-center justify-center w-full gap-4">
        {collectionData?.map((collection) => {
          const isExpanded = expandedPosts.has(collection.id);

          return (
            <div
              key={collection.id}
              className="flex flex-col items-center justify-center w-full"
            >
              <div className="flex flex-col items-center justify-center p-[6px] gap-2 rounded-sm border-[0.5px] border-[#e2dfdf] w-full">
                <div className="flex items-center justify-center gap-3 w-full sm:pl-2 ">
                  <img
                    src={collection.first_img_url}
                    alt={collection.name}
                    className="w-12 min-h-[65px] max-h-[65px] object-cover rounded-[3px]  "
                  />
                  <div className="flex sm:hidden flex-col items-start justify-center w-full gap-2 ">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex flex-col items-start justify-center w-full">
                        <div className="w-full flex items-center justify-between gap-5">
                          <h3 className="text-[13px] font-medium text-[#000] font-inter text-ellipsis line-clamp-1 w-[67%]">
                            {collection.name} ({collection.aff_links_length})
                          </h3>

                          <button
                            className="text-[11px] text-[rgba(222,44,109,1)] cursor-pointer pr-3 underline"
                            onClick={() =>
                              copyToClipboard(
                                `${WEBSITE_URL}/preview/${uid}/${collection.id}`
                              )
                            }
                          >
                            Copy Link
                          </button>
                        </div>
                        <p className="text-[10px] text-[#787878] font-inter font-medium">
                          {new Date(collection.created_at).toLocaleDateString(
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
                          {collection.total_clicks}
                        </p>
                      </div>

                      <div className="flex flex-col items-start justify-center py-[2px] gap-[3px] border-r-[0.3px] border-r-[#e3e3e3] pr-3 pl-3 ">
                        <p className="text-[13px] text-[#333] font-regular font-inter leading-[120%] ">
                          Orders
                        </p>
                        <p className="text-[13px] text-[#000] font-bold font-inter leading-[120%] ">
                          {collection.total_purchased_quantity}
                        </p>
                      </div>

                      <div className="flex flex-col items-start justify-center py-[2px] gap-[3px] border-r-[0.3px] border-r-[#e3e3e3] pr-3 pl-3 ">
                        <p className="text-[13px] text-[#333] font-regular font-inter leading-[120%] ">
                          Sales
                        </p>
                        <p className="text-[13px] text-[#000] font-bold font-inter leading-[120%] ">
                          {collection.total_earning}
                        </p>
                      </div>

                      <div className="flex flex-col items-start justify-center py-[2px] gap-[3px] pl-3 ">
                        <p className="text-[13px] text-[#333] font-regular font-inter leading-[120%] ">
                          Commission
                        </p>
                        <p className="text-[13px] text-[#000] font-bold font-inter leading-[120%] ">
                          {collection.total_approved_amount}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="sm:flex hidden flex-col items-start justify-center w-full gap-2 pl-3 ">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex flex-col items-start justify-center w-full">
                        <div className="w-full flex items-center justify-between gap-5">
                          <h3 className="text-[13px] font-medium text-[#000] font-inter text-ellipsis line-clamp-1 w-[67%]">
                            {collection.name} ({collection.aff_links_length})
                          </h3>

                          <button
                            className="text-[11px] text-[rgba(222,44,109,1)] cursor-pointer pr-3 underline"
                            onClick={() =>
                              copyToClipboard(
                                `${WEBSITE_URL}/preview/${uid}/${collection.id}`
                              )
                            }
                          >
                            Copy Link
                          </button>
                        </div>
                        <p className="text-[10px] text-[#787878] font-inter font-medium">
                          {new Date(collection.created_at).toLocaleDateString(
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
                          {collection.total_clicks}
                        </p>
                      </div>

                      <div className="flex flex-col items-start justify-center py-[2px] gap-[3px] border-r-[0.3px] border-r-[#e3e3e3] pr-5 ">
                        <p className="text-[13px] text-[#333] font-regular font-inter leading-[120%] ">
                          Orders
                        </p>
                        <p className="text-[13px] text-[#000] font-bold font-inter leading-[120%] ">
                          {collection.total_purchased_quantity}
                        </p>
                      </div>

                      <div className="flex flex-col items-start justify-center py-[2px] gap-[3px] border-r-[0.3px] border-r-[#e3e3e3] pr-5  ">
                        <p className="text-[13px] text-[#333] font-regular font-inter leading-[120%] ">
                          Sales
                        </p>
                        <p className="text-[13px] text-[#000] font-bold font-inter leading-[120%] ">
                          {collection.total_earning}
                        </p>
                      </div>

                      <div className="flex flex-col items-start justify-center py-[2px] gap-[3px]  ">
                        <p className="text-[13px] text-[#333] font-regular font-inter leading-[120%] ">
                          Commission
                        </p>
                        <p className="text-[13px] text-[#000] font-bold font-inter leading-[120%] ">
                          {collection.total_approved_amount}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => toggleProducts(collection.id)}
                  className="flex items-center justify-center gap-1 cursor-pointer"
                >
                  <p className="text-[11px] text-[rgba(222,44,109,1)] text-center font-inter font-normal">
                    View {isExpanded ? "Less" : "Products"}
                  </p>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="9"
                    height="5"
                    viewBox="0 0 9 5"
                    fill="none"
                    className={`transition-transform duration-300 ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  >
                    <path
                      d="M1 0.5L4.68421 3.5L8 0.5"
                      stroke="rgba(222,44,109,1)"
                    />
                  </svg>
                </button>
                {isExpanded && (
                  <div className="flex flex-col items-center justify-center w-full gap-4  py-2">
                    {collection.products.map((product, index) => (
                      <div
                        key={index}
                        className="flex flex-col items-start justify-center w-full bg-gray-50 p-2 rounded-[6px]"
                      >
                        <div className="flex items-center justify-between w-full ">
                          <h5 className="text-[12px] font-medium text-[#000] font-inter leading-[147%] text-ellepsis line-clamp-1  w-[70%]">
                            {product.name}
                          </h5>
                          <button
                            onClick={(e: any) =>
                              copyToClipboard(product.aff_link)
                            }
                            className="text-xs text-pink-500 font-medium pr-5 cursor-pointer"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 16 16"
                              fill="none"
                            >
                              <g clipPath="url(#clip0_1625_7906)">
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M4 2C4 1.46957 4.21071 0.960859 4.58579 0.585786C4.96086 0.210714 5.46957 0 6 0L14 0C14.5304 0 15.0391 0.210714 15.4142 0.585786C15.7893 0.960859 16 1.46957 16 2V10C16 10.5304 15.7893 11.0391 15.4142 11.4142C15.0391 11.7893 14.5304 12 14 12H6C5.46957 12 4.96086 11.7893 4.58579 11.4142C4.21071 11.0391 4 10.5304 4 10V2ZM6 1C5.73478 1 5.48043 1.10536 5.29289 1.29289C5.10536 1.48043 5 1.73478 5 2V10C5 10.2652 5.10536 10.5196 5.29289 10.7071C5.48043 10.8946 5.73478 11 6 11H14C14.2652 11 14.5196 10.8946 14.7071 10.7071C14.8946 10.5196 15 10.2652 15 10V2C15 1.73478 14.8946 1.48043 14.7071 1.29289C14.5196 1.10536 14.2652 1 14 1H6ZM2 5C1.73478 5 1.48043 5.10536 1.29289 5.29289C1.10536 5.48043 1 5.73478 1 6V14C1 14.2652 1.10536 14.5196 1.29289 14.7071C1.48043 14.8946 1.73478 15 2 15H10C10.2652 15 10.5196 14.8946 10.7071 14.7071C10.8946 14.5196 11 14.2652 11 14V13H12V14C12 14.5304 11.7893 15.0391 11.4142 15.4142C11.0391 15.7893 10.5304 16 10 16H2C1.46957 16 0.960859 15.7893 0.585786 15.4142C0.210714 15.0391 0 14.5304 0 14V6C0 5.46957 0.210714 4.96086 0.585786 4.58579C0.960859 4.21071 1.46957 4 2 4H3V5H2Z"
                                  fill="rgba(222,44,109,1)"
                                />
                              </g>
                              <defs>
                                <clipPath id="clip0_1625_7906">
                                  <rect width="16" height="16" fill="white" />
                                </clipPath>
                              </defs>
                            </svg>
                          </button>
                        </div>
                        <div className="flex items-center justify-between w-full py-1">
                          <div className="flex items-center justify-start gap-3">
                            <img
                              src={product.img_url}
                              alt={product.name}
                              className="w-12 h-12 object-contain rounded"
                            />

                            <div className="flex items-center justify-start gap-4">
                              <div className="flex flex-col items-start justify-center px-[6px] py-[2px] gap-[3px] border-r-[0.3px] border-r-[#e3e3e3] pr-3 ">
                                <p className="text-[13px] text-[#6b6565] font-regular font-inter leading-[120%] ">
                                  Clicks
                                </p>
                                <p className="text-[13px] text-[#000] font-bold font-inter leading-[120%] ">
                                  {product.total_earning}
                                </p>
                              </div>
                              <div className="flex flex-col items-start justify-center px-[6px] py-[2px] gap-[3px] border-r-[0.3px] border-r-[#e3e3e3] pr-3 ">
                                <p className="text-[13px] text-[#6b6565] font-regular font-inter leading-[120%] ">
                                  Orders
                                </p>
                                <p className="text-[13px] text-[#000] font-bold font-inter leading-[120%] ">
                                  {product.total_purchased_quantity}
                                </p>
                              </div>

                              <div className="flex flex-col items-start justify-center px-[6px] py-[2px] gap-[3px]  ">
                                <p className="text-[13px] text-[#333] font-regular font-inter leading-[120%] ">
                                  Commission
                                </p>
                                <p className="text-[13px] text-[#000] font-bold font-inter leading-[120%] ">
                                  {product.total_approved_amount}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
        })}
        {!collectionData.length && (
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




export default CollectionSection;
