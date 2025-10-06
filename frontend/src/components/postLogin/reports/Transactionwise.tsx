import Image from "next/image";
import React, { useEffect, useState } from "react";
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
  Pagination,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useGetTransactionReportQuery, useGetUserSummaryQuery } from "@/redux/api/analyticsApi";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import SlideUpModal from "./SlideUpDateFilter";
import SlideUpCombinedFilterModal from "./SlideUpFiltersModal";
import { useSelector } from "react-redux";

// Create styled table cells with custom styling for header
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  "&.MuiTableCell-head": {
    backgroundColor: "#f4f6f8",
    color: "#000",
    fontWeight: "500",
    fontSize: "12px",
  },
}));

// Create styled table cells with custom styling for body
const StyledBodyCell = styled(TableCell)(({ theme }) => ({
  color: "#000",
  fontWeight: "400",
  fontSize: "10px",
}));

// Create styled table rows with alternating colors
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

// Styled TableBody component with white background
const StyledTableBody = styled(TableBody)({
  backgroundColor: "#ffffff", // White background for table body
});

// Custom component that wraps MUI TableContainer with a div that has the Tailwind class
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

const Transactionwise = () => {
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
  const [limit] = useState<number>(10); // Records per page
  const [totalRecords, setTotalRecords] = useState<number>(0);

  // Combined filter states
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Store options state
  const [storeOptions, setStoreOptions] = useState<
    { store_name: string; store_id: string }[]
  >([]);

  // Static status options
  const statusOptions = [
    { status_name: "Approved", status_id: "paid" },
    { status_name: "Cancelled", status_id: "cancelled" },
    { status_name: "Pending", status_id: "pending" },
  ];

  const [salesData, setSalesData] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [allTime, setAllTime] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<Date | null>(() => {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    return sevenDaysAgo;
  });

  const [endDate, setEndDate] = useState<Date | null>(() => new Date());

  // API call with pagination parameters
  let { data, isLoading } = useGetTransactionReportQuery({
    start_date: formatDateForAPI(startDate),
    end_date: formatDateForAPI(endDate),
    alltime: allTime,
    store_arr: selectedStores,
    status: selectedStatuses,
    page: currentPage,
    limit: limit,
  });

  useEffect(() => {
    if (Object.keys(data ? data : {}).length) {
      setSalesData(data.cashback_activity);
      setTotalRecords(data.total_records || 0);

      // ✅ Ensure storeOptions is always an array
      const storeFilters = data.store_filters;
      if (Array.isArray(storeFilters)) {
        setStoreOptions(storeFilters);
      } else {
        setStoreOptions([]); // Fallback to empty array
      }
    }
  }, [data]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStores, selectedStatuses, startDate, endDate, allTime]);

  const handleOpenFilterModal = () => {
    setIsFilterModalOpen(true);
  };

  // Combined filter handlers
  const handleFiltersChange = (
    storeValues: string[],
    statusValues: string[]
  ) => {
    const validStoreValues = Array.isArray(storeValues) ? storeValues : [];
    const validStatusValues = Array.isArray(statusValues) ? statusValues : [];


    setSelectedStores(validStoreValues);
    setSelectedStatuses(validStatusValues);
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

  // Pagination handlers
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  const { data: summary = {} } = useGetUserSummaryQuery({
    start_date: formatDateForAPI(startDate),
    end_date: formatDateForAPI(endDate),
    alltime: allTime
  })

  // Calculate total pages
  const totalPages = Math.ceil(totalRecords / limit);

  return (
    <div>
      <div className="relative w-full font-inter">
        <div className="h-[80px] w-full bg-[rgba(222,44,109,1)] absolute top-0 z-0 " />
        <div className="px-[15px] pt-[22px] flex flex-col items-start justify-center gap-[11px] w-full relative z-10">
          <h1 className="text-[#fff] text-[12px] font-medium font-inter ">
            TRANSACTION WISE
          </h1>
          <div
            style={{ boxShadow: "0px 0px 1.7px 0px rgba(0, 0, 0, 0.20)" }}
            className="p-[10px] w-full grid grid-cols-4 items-center  gap-[10px] rounded-[6px] border-[1px] border-[rgba(222,44,109,1)] bg-[#fff]  "
          >
            <div className="flex flex-col items-start justify-center gap-1 border-r-[1px] border-r-[rgba(222,44,109,1)] pr-[20px] ">
              <h2 className="text-[#333] text-[12px] font-normal font-inter leading-[156%] ">
                Clicks
              </h2>
              <p className="m-0 text-[#000] text-[14px] font-medium font-inter leading-[106%] ">
                {summary?.total_clicks ?? 0}
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
                Sales
              </h2>
              <p className="m-0 text-[#000] text-[14px] font-medium font-inter leading-[106%] ">
                ₹{summary?.total_sales ?? 0}
              </p>
            </div>

            <div className="flex flex-col items-start justify-center gap-1 ">
              <h2 className="text-[#333] text-[12px] font-normal font-inter leading-[156%] ">
                Commission
              </h2>
              <p className="m-0 text-[#000] text-[14px] font-medium font-inter leading-[106%] ">
                ₹{summary?.total_comission}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          px: "15px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            width: "100%",
            gap: "10px",
            mt: "20px",
            marginBottom: "12px",
          }}
        >
          <div className="flex items-center justify-end ">
            <div className="flex items-center gap-2">
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
          </div>

          <div
            onClick={handleOpenFilterModal}
            className="px-2 py-[8px] flex items-center justify-center gap-[5px] rounded-sm border-[0.5px] border-[#dcdcdc] bg-[#fff]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="11"
              viewBox="0 0 14 11"
              fill="none"
            >
              <path
                d="M13.3953 2.25871H4.50951C4.31929 2.25871 4.15625 2.08271 4.15625 1.87737C4.15625 1.67204 4.31929 1.49603 4.50951 1.49603H13.3953C13.5855 1.49603 13.7485 1.67204 13.7485 1.87737C13.7485 2.08271 13.5855 2.25871 13.3953 2.25871Z"
                fill="black"
              />
              <path
                d="M1.73911 2.25859H0.353257C0.163042 2.25859 0 2.08259 0 1.87725C0 1.67191 0.163042 1.49591 0.353257 1.49591H1.73911C1.92933 1.49591 2.09237 1.67191 2.09237 1.87725C2.09237 2.08259 1.9565 2.25859 1.73911 2.25859Z"
                fill="black"
              />
              <path
                d="M13.3972 5.86668H11.0603C10.8701 5.86668 10.707 5.69068 10.707 5.48534C10.707 5.28001 10.8701 5.104 11.0603 5.104H13.3972C13.5874 5.104 13.7505 5.28001 13.7505 5.48534C13.7505 5.69068 13.5874 5.86668 13.3972 5.86668Z"
                fill="black"
              />
              <path
                d="M8.28796 5.86668H0.353257C0.163042 5.86668 0 5.69068 0 5.48534C0 5.28001 0.163042 5.104 0.353257 5.104H8.28796C8.47817 5.104 8.64121 5.28001 8.64121 5.48534C8.64121 5.69068 8.47817 5.86668 8.28796 5.86668Z"
                fill="black"
              />
              <path
                d="M13.3953 9.50426H4.50951C4.31929 9.50426 4.15625 9.32826 4.15625 9.12292C4.15625 8.91758 4.31929 8.74158 4.50951 8.74158H13.3953C13.5855 8.74158 13.7485 8.91758 13.7485 9.12292C13.7485 9.32826 13.5855 9.50426 13.3953 9.50426Z"
                fill="black"
              />
              <path
                d="M1.73911 9.50411H0.353257C0.163042 9.50411 0 9.32811 0 9.12277C0 8.8881 0.163042 8.7121 0.353257 8.7121H1.73911C1.92933 8.7121 2.09237 8.8881 2.09237 9.09344C2.11954 9.32811 1.9565 9.50411 1.73911 9.50411Z"
                fill="black"
              />
              <path
                d="M3.12583 3.75468C2.17475 3.75468 1.38672 2.90399 1.38672 1.87731C1.38672 0.850622 2.17475 -6.10352e-05 3.12583 -6.10352e-05C4.07691 -6.10352e-05 4.86494 0.850622 4.86494 1.87731C4.86494 2.90399 4.10408 3.75468 3.12583 3.75468ZM3.12583 0.76262C2.55518 0.76262 2.09323 1.2613 2.09323 1.87731C2.09323 2.49332 2.55518 2.992 3.12583 2.992C3.69648 2.992 4.15843 2.49332 4.15843 1.87731C4.15843 1.2613 3.69648 0.76262 3.12583 0.76262Z"
                fill="black"
              />
              <path
                d="M9.67271 7.36289C8.72163 7.36289 7.93359 6.51221 7.93359 5.48552C7.93359 4.45884 8.72163 3.60815 9.67271 3.60815C10.6238 3.60815 11.4118 4.45884 11.4118 5.48552C11.4118 6.51221 10.651 7.36289 9.67271 7.36289ZM9.67271 4.37084C9.10206 4.37084 8.64011 4.86951 8.64011 5.48552C8.64011 6.10153 9.10206 6.60021 9.67271 6.60021C10.2434 6.60021 10.7053 6.10153 10.7053 5.48552C10.7053 4.86951 10.2434 4.37084 9.67271 4.37084Z"
                fill="black"
              />
              <path
                d="M3.12583 11C2.17475 11 1.38672 10.1493 1.38672 9.12261C1.38672 8.06659 2.17475 7.24524 3.12583 7.24524C4.07691 7.24524 4.86494 8.09592 4.86494 9.12261C4.89212 10.1493 4.10408 11 3.12583 11ZM3.12583 8.00792C2.55518 8.00792 2.09323 8.5066 2.09323 9.12261C2.09323 9.73862 2.55518 10.2373 3.12583 10.2373C3.69648 10.2373 4.15843 9.73862 4.15843 9.12261C4.15843 8.5066 3.69648 8.00792 3.12583 8.00792Z"
                fill="black"
              />
            </svg>

            <p className="text-[#000] text-[12px] font-medium font-inter leading-5 ">
              Filters
            </p>

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
        </Box>

        {/* Loading state */}
        {isLoading && (
          <div className="h-[50vh] flex items-center justify-center w-full">
            <p className="text-[#000]/45 text-center font-inter text-[16px] font-medium leading-normal">
              Loading...
            </p>
          </div>
        )}

        {/* Data table */}
        {!isLoading && salesData?.length > 0 ? (
          <Box
            sx={{
              width: "100%",
              maxWidth: 600,
              mx: "auto",
            }}
            className="[&::-webkit-scrollbar]:hidden scroll-smooth"
          >
            {/* Records info */}
            <div className="flex items-center justify-between mb-3">
              <p className="text-[#6e6e6e] text-[12px] font-normal font-inter">
                Showing {(currentPage - 1) * limit + 1}-{Math.min(currentPage * limit, totalRecords)} of {totalRecords} records
              </p>
            </div>

            <CustomTableContainer
              sx={{
                overflow: "scroll",
                borderRadius: "9px",
                border: "2px solid #eaddff",
              }}
              className="overflow-scroll [&::-webkit-scrollbar]:hidden scroll-smooth"
            >
              <Table
                aria-label="sales data table"
                className="font-inter [&::-webkit-scrollbar]:hidden scroll-smooth"
              >
                <StyledTableBody>
                  {salesData.map((row, index) => (
                    <StyledTableRow key={index}>
                      <StyledBodyCell>
                        <img
                          className="min-w-[60px]"
                          src={row.store_imgurl}
                          alt={row.store_name}
                        />
                      </StyledBodyCell>
                      <StyledBodyCell>
                        <div className="flex flex-col items-start justify-center gap-1 min-w-[100px]">
                          <p className="font-inter font-semibold text-[#333] text-[12px]">
                            {row.order_date}
                          </p>
                          <p className="font-inter text-[#333] text-[10px]">
                            Order ID: {row.order_id}
                          </p>
                        </div>
                      </StyledBodyCell>

                      <StyledBodyCell>
                        <div className="flex flex-col items-start justify-center gap-1">
                          <p className="font-inter font-semibold text-[12px] pl-1 ">
                            {row.cashback}
                          </p>
                          <div
                            className={`flex items-center justify-center gap-1 ${row.status === "Cancelled"
                              ? "bg-[#FFEDE9]"
                              : row.status === "Pending"
                                ? "bg-[#F7F5F5]"
                                : "bg-[#E6F9D9]"
                              } px-[6px] py-0.5 rounded-[29px]`}
                          >
                            <p
                              className={`font-inter font-medium text-[12px] ${row.status === "Cancelled"
                                ? "text-[#F21B1B]"
                                : row.status === "Pending"
                                  ? "text-[#73A6DD]"
                                  : "text-[#00BA00]"
                                }`}
                            >
                              {row.status}
                            </p>
                          </div>
                        </div>
                      </StyledBodyCell>
                    </StyledTableRow>
                  ))}
                </StyledTableBody>
              </Table>
            </CustomTableContainer>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  mt: 3,
                  mb: 2,
                }}
              >
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                  size="small"
                  // showFirstButton
                  // showLastButton
                  sx={{
                    '& .MuiPaginationItem-root': {
                      fontSize: '12px',
                      fontFamily: 'Inter',
                    },
                    '& .Mui-selected': {
                      backgroundColor: 'rgba(222,44,109,1) !important',
                      color: 'white',
                    },
                  }}
                />
              </Box>
            )}
          </Box>
        ) : (
          !isLoading && (
            <div className="h-[70vh] flex items-center justify-center w-full">
              <p className="text-[#000]/45 text-center font-inter text-[20px] font-medium leading-normal ">
                No Activity Yet!
              </p>
            </div>
          )
        )}
      </Box>

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

      <SlideUpCombinedFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        storeOptions={storeOptions}
        statusOptions={statusOptions}
        selectedStores={selectedStores}
        selectedStatuses={selectedStatuses}
        onFiltersChange={handleFiltersChange}
        isLoadingStores={isLoading}
      />
    </div>
  );
};

export default Transactionwise;