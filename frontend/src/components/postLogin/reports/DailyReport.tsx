"use client";
import { useEffect, useState } from "react";
import React from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Pagination,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useGetDailyReportQuery, useGetUserSummaryQuery } from "@/redux/api/analyticsApi";
import { Calendar } from "lucide-react";
import SlideUpModal from "./SlideUpDateFilter";
import LoadingSpinner from "../LoadingStatesAndModals/LoadingSpinner";
import { useSelector } from "react-redux";

// Define the data type for our sales data
interface SalesData {
  date: string;
  totalSales: string;
  orders: number;
  commission: string;
  clicks: number;
}

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  "&.MuiTableCell-head": {
    backgroundColor: "#f4f6f8",
    color: "#000",
    fontWeight: "500",
    fontSize: "12px",
  },
}));

const StyledBodyCell = styled(TableCell)(({ theme }) => ({
  color: "#000",
  fontWeight: "400",
  fontSize: "10px",
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: "#fff",
    borderBottom: "1px solid #eaddff",
  },
  "&:last-child td, &:last-child th": {
    backgroundColor: "#fff",
    borderBottom: "1px solid #eaddff",
  },
}));

const StyledTableBody = styled(TableBody)({
  backgroundColor: "#ffffff",
});

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

const DailyReport = () => {
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

  const { created_at } = useSelector((state: any) => state.auth.user)

  const [startDate, setStartDate] = useState<Date | null>(() => {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    return sevenDaysAgo;
  });

  const [endDate, setEndDate] = useState<Date | null>(() => new Date());
  const [salesData, setSalesData] = useState<any[]>([]);
  const [allTime, setAllTime] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentPageStart, setCurrentPageStart] = useState<Date | null>(null);
  const [currentPageEnd, setCurrentPageEnd] = useState<Date | null>(null);

  const DAYS_PER_PAGE = 10;

  // Calculate date ranges for pagination
  const getDateRangeForPage = (page: number, start: Date | null, end: Date | null) => {
    if (!start || !end) return { pageStart: null, pageEnd: null, totalPages: 1 };

    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const totalPagesCalc = Math.ceil(totalDays / DAYS_PER_PAGE);

    // Calculate the start date for the current page (working backwards from end date)
    const daysFromEnd = (page - 1) * DAYS_PER_PAGE;
    const pageEndDate = new Date(end);
    pageEndDate.setDate(end.getDate() - daysFromEnd);

    const pageStartDate = new Date(pageEndDate);
    pageStartDate.setDate(pageEndDate.getDate() - (DAYS_PER_PAGE - 1));

    // Ensure we don't go before the original start date
    if (pageStartDate < start) {
      pageStartDate.setTime(start.getTime());
    }

    return {
      pageStart: pageStartDate,
      pageEnd: pageEndDate,
      totalPages: totalPagesCalc
    };
  };

  // Update page dates when page or date range changes
  useEffect(() => {
    if (startDate && endDate) {
      const { pageStart, pageEnd, totalPages: totalPagesCalc } = getDateRangeForPage(currentPage, startDate, endDate);
      setCurrentPageStart(pageStart);
      setCurrentPageEnd(pageEnd);
      setTotalPages(totalPagesCalc);
    }
  }, [startDate, endDate, currentPage]);

  // Reset to first page when date range changes
  useEffect(() => {
    setCurrentPage(1);
  }, [startDate, endDate]);

  let { data = [], isLoading } = useGetDailyReportQuery({
    start_date: formatDateForAPI(currentPageStart),
    end_date: formatDateForAPI(currentPageEnd),
    alltime: allTime,
  });

  let { data: summary = {}, isLoading: summaryLoading } = useGetUserSummaryQuery({
    start_date: formatDateForAPI(startDate),
    end_date: formatDateForAPI(endDate),
    alltime: allTime
  })

  useEffect(() => {
    if (!isLoading && currentPageStart && currentPageEnd && data) {
      let res = fillMissingDates(data, formatDateForAPI(currentPageStart), formatDateForAPI(currentPageEnd));
      setSalesData(res);
    }
  }, [data, isLoading, currentPageStart, currentPageEnd]);

  const handleDateChangeModal = (
    start: Date | null,
    end: Date | null,
    alltime: boolean
  ) => {
    if (alltime) {
      let createdAtDate = new Date(created_at); // Hardcoded - replace with API's created_at when available
      setStartDate(createdAtDate);
      setEndDate(end);
      setAllTime(true);
    } else {
      setStartDate(start);
      setEndDate(end);
      setAllTime(false);
    }
    // Page reset is handled by useEffect
  };

  const handleSelectAllTimeActive = () => {
    setAllTime(true);
  };

  const handleSelectAllTimeInActive = () => {
    setAllTime(false);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  const fillMissingDates = (data: any, startDate: any, endDate: any) => {
    const dataMap = new Map(
      data.map((item: any) => [
        new Date(item.date).toISOString().split("T")[0],
        item,
      ])
    );

    const result = [];
    let currentDate = new Date(endDate);
    const initialDate = new Date(startDate);

    while (currentDate >= initialDate) {
      const dateKey = currentDate.toISOString().split("T")[0];

      if (dataMap.has(dateKey)) {
        result.push(dataMap.get(dateKey));
      } else {
        result.push({
          date: currentDate.toISOString(),
          earnings: 0,
          approved_amount: 0,
          per_day_purchase: 0,
          clicks: 0,
        });
      }

      currentDate.setDate(currentDate.getDate() - 1);
    }

    return result;
  };

  function convertToDateFormat(isoTimestamp: any) {
    const date = new Date(isoTimestamp);

    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    const day = date.getUTCDate();
    const month = monthNames[date.getUTCMonth()];
    const year = String(date.getUTCFullYear()).slice(-2);

    return `${month} ${day}, ${year}`;
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div>
      <div className="relative w-full font-inter">
        <div className="h-[80px] w-full bg-[rgba(222,44,109,1)] absolute top-0 z-0 " />
        <div className="px-[15px] pt-[22px] flex flex-col items-start justify-center gap-[11px] w-full relative z-10">
          <h1 className="text-[#fff] text-[12px] font-medium font-inter ">
            DAILY REPORT
          </h1>
          <div
            style={{ boxShadow: "0px 0px 1.7px 0px rgba(0, 0, 0, 0.20)" }}
            className="p-[10px] w-full grid grid-cols-4 items-center gap-[10px] rounded-[6px] border-[1px] border-[rgba(222,44,109,1)] bg-[#fff]"
          >
            <div className="flex flex-col items-start justify-center gap-1 border-r-[1px] border-r-[rgba(222,44,109,1)] pr-[20px]">
              <h2 className="text-[#333] text-[12px] font-normal font-inter leading-[156%]">
                Clicks
              </h2>
              <p className="m-0 text-[#000] text-[14px] font-medium font-inter leading-[106%]">
                {summary?.total_clicks ?? 0}
              </p>
            </div>

            <div className="flex flex-col items-start justify-center gap-1 border-r-[1px] border-r-[rgba(222,44,109,1)] pr-[20px]">
              <h2 className="text-[#333] text-[12px] font-normal font-inter leading-[156%]">
                Orders
              </h2>
              <p className="m-0 text-[#000] text-[14px] font-medium font-inter leading-[106%]">
                {summary?.total_orders ?? 0}
              </p>
            </div>

            <div className="flex flex-col items-start justify-center gap-1 border-r-[1px] border-r-[rgba(222,44,109,1)] pr-[20px]">
              <h2 className="text-[#333] text-[12px] font-normal font-inter leading-[156%]">
                Sales
              </h2>
              <p className="m-0 text-[#000] text-[14px] font-medium font-inter leading-[106%]">
                ₹{summary?.total_sales ?? 0}
              </p>
            </div>

            <div className="flex flex-col items-start justify-center gap-1">
              <h2 className="text-[#333] text-[12px] font-normal font-inter leading-[156%]">
                Commission
              </h2>
              <p className="m-0 text-[#000] text-[14px] font-medium font-inter leading-[106%]">
                ₹{summary?.total_comission ?? 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {salesData.length > 0 ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <div className="flex items-center justify-between w-full mt-5 mb-3 px-[15px]">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
            </div>

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

          <Box
            sx={{
              width: "100%",
              maxWidth: 600,
              mx: "auto",
              px: "15px",
            }}
            className="scroll-smooth"
          >
            <CustomTableContainer
              sx={{
                borderRadius: "9px",
                border: "2px solid #eaddff",
                overflowX: "auto",
                overflowY: "hidden",
                willChange: "scroll-position",
                transform: "translateZ(0)",
                scrollBehavior: "smooth",
                WebkitOverflowScrolling: "touch",
                "&::-webkit-scrollbar": {
                  display: "none",
                },
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
              className="overflow-x-scroll [&::-webkit-scrollbar]:hidden scroll-smooth"
            >
              <Table aria-label="sales data table" className="font-inter ">
                <TableHead className=" border-[0px]">
                  <TableRow
                    sx={{ backgroundColor: "#f4f6f8", borderBottom: "0px" }}
                  >
                    <StyledTableCell>
                      <p className="font-inter text-[14px] min-w-[70px]">
                        Date
                      </p>
                    </StyledTableCell>
                    <StyledTableCell>
                      <p className="font-inter text-[14px] min-w-[60px]">
                        Sales
                      </p>
                    </StyledTableCell>
                    <StyledTableCell>
                      <p className="font-inter text-[14px] min-w-[60px]">
                        Orders
                      </p>
                    </StyledTableCell>
                    <StyledTableCell>
                      <p className="font-inter text-[14px] min-w-[60px]">
                        Commission
                      </p>
                    </StyledTableCell>
                    <StyledTableCell>
                      <p className="font-inter text-[14px] min-w-[60px]">
                        Clicks
                      </p>
                    </StyledTableCell>
                  </TableRow>
                </TableHead>
                <StyledTableBody>
                  {salesData.map((row: any, index: number) => (
                    <StyledTableRow key={index}>
                      <StyledBodyCell>
                        <p className="font-inter text-[#333] text-[12px] min-w-[70px]">
                          {convertToDateFormat(row.date)}
                        </p>
                      </StyledBodyCell>
                      <StyledBodyCell>
                        <p className="font-inter font-medium text-[12px] min-w-[60px]">
                          ₹{row.earnings}
                        </p>
                      </StyledBodyCell>
                      <StyledBodyCell>
                        <p className="font-inter text-[#333] text-[12px] min-w-[60px]">
                          {row.per_day_purchase}
                        </p>
                      </StyledBodyCell>
                      <StyledBodyCell>
                        <p className="font-inter font-bold text-[12px] min-w-[60px]">
                          ₹{row.approved_amount}
                        </p>
                      </StyledBodyCell>
                      <StyledBodyCell>
                        <p className="font-inter font-medium text-[#333] text-[12px] min-w-[60px]">
                          {row.clicks}
                        </p>
                      </StyledBodyCell>
                    </StyledTableRow>
                  ))}
                </StyledTableBody>
              </Table>
            </CustomTableContainer>

            {/* Pagination Component */}
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
                  sx={{
                    "& .MuiPaginationItem-root": {
                      fontSize: "12px",
                      minWidth: "28px",
                      height: "28px",
                    },
                    "& .Mui-selected": {
                      backgroundColor: "rgba(222,44,109,1) !important",
                      color: "white",
                    },
                  }}
                />
              </Box>
            )}
          </Box>
        </Box>
      ) : (
        <div className="h-[70vh] flex items-center justify-center w-full">
          <p className="text-[#000]/45 text-center font-inter text-[20px] font-medium leading-normal">
            No Activity Yet!
          </p>
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
    </div>
  );
};

export default DailyReport;