"use client";
import React, { useEffect, useState } from "react";
import { ArrowLeft, Calendar, Filter } from "lucide-react";
import WithdrawScreen from "./WithdrawScreen";
import { useGetRedemptionHistoryQuery } from "@/redux/api/pointsApi";
import { useGetCashbackDetailsMutation, useGetTransactionReportQuery } from "@/redux/api/analyticsApi";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Image from "next/image";
import SlideUpModal from "../../../postLogin/reports/SlideUpDateFilter";
import { Box, Pagination } from "@mui/material";

interface Transaction {
  id: string;
  date: string;
  merchant: string;
  amount: number;
  status: "completed" | "cancelled" | "pending";
  estimatedApproval?: string;
  orderId?: string;
  frameId?: string;
}

const WalletComponent = ({changeTab}: any) => {
  const [activeTab, setActiveTab] = useState<"cashback" | "history">(
    "cashback"
  );
  const [currentScreen, setCurrentScreen] = useState<"wallet" | "withdraw">(
    "wallet"
  );
  const withdrawableBalance = useSelector((state: any) => state.auth.user.balance);
  const [totalBalance] = useState(withdrawableBalance);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [cashback, setCashback] = useState<any[]>([]);
  const { data, isLoading } = useGetRedemptionHistoryQuery({
    page: 1,
  });
  const { } = useGetTransactionReportQuery({

  })
  const [allTime, setAllTime] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<Date | null>(() => {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    return sevenDaysAgo;
  });
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);


  const [endDate, setEndDate] = useState<Date | null>(() => new Date());
  const [currentPage, setCurrentPage] = useState<number>(1);
  const { created_at } = useSelector((state: any) => state.auth.user)

  const handleDateChangeModal = (
    start: Date | null,
    end: Date | null,
    alltime: boolean
  ) => {
    setStartDate(allTime ? new Date(created_at) : start);
    setEndDate(end);
  };

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

  const router = useRouter();

  const handleSelectAllTimeActive = () => {
    setAllTime(true);
  };

  const handleSelectAllTimeInActive = () => {
    setAllTime(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "text-green-600";
      case "Cancelled":
        return "text-red-500";
      case "Pending":
        return "text-orange-500";
      default:
        return "text-gray-600";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "Approved":
        return "Approved";
      case "Cancelled":
        return "Cancelled";
      case "Pending":
        return "Pending";
      default:
        return status;
    }
  };

  useEffect(() => {
    if (data?.data?.length) {
      setTransactions(data.data);
    }
  }, [data]);

  // useEffect(() => {
  //   getCashBack();
  // }, []);

  // const getCashBack = async () => {
  //   try {
  //     let data = await cashbackDetails({
  //       start_date: formatDateForAPI(startDate),
  //       end_date: formatDateForAPI(endDate),
  //       page: currentPage
  //     }).unwrap();
  //     setCashback(data.cashbackData);
  //   } catch (error) {
  //   }
  // };

  const changeToWithdraw = () => {
    setCurrentScreen("withdraw");
  };

  const [totalRecords, setTotalRecords] = useState<number>(0);
  const limit = 10

  const { data: cashbackDetails, isError } = useGetTransactionReportQuery({
    start_date: formatDateForAPI(startDate),
    end_date: formatDateForAPI(endDate),
    alltime: allTime,
    store_arr: [],
    status: [],
    page: currentPage,
    limit: 10,
  })

  useEffect(() => {
    if (cashbackDetails) {
      setCashback(cashbackDetails.cashback_activity)
      setTotalRecords(cashbackDetails.total_records)
    } else if (isError) {
    // Clear data when API fails
    setCashback([])
    setTotalRecords(0)
  }
  }, [cashbackDetails, isError])

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  const totalPages = Math.ceil(totalRecords / limit);

  return currentScreen == "wallet" ? (
    <div className="mx-auto bg-white min-h-screen  scroll-smooth font-inter">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b-2 border-[#F0F2F5]">
        <div className="flex items-center gap-3">
          <ArrowLeft
            className="w-6 h-6 text-gray-700"
            onClick={() => changeTab("Settings")}
          />
          <span className="text-[18px] font-inter text-[#000] font-bold">
            My Wallet
          </span>
        </div>
        <div
          style={{
            background:
              "linear-gradient(147deg, #FFFDFC 28.17%, #FFF2EB 80.11%)",
          }}
          className="flex items-ccenter justify-center gap-1 rounded-[22px] border-[1px] border-[#f2b6b6] pl-[10px] pr-[7px] py-1"
        >
          <p className="font-inter font-semibold text-[#000] text-[14px] text-center mt-0.5">
            ₹{totalBalance}
          </p>
          <Image
            src={"/images/Money.png"}
            alt="noe-img"
            width={30}
            height={30}
          />
        </div>
      </div>

      {/* Withdrawable Balance Card */}
      <div className=" pt-[15px] pb-6">
        <div style={{
          background: 'linear-gradient(90deg, #FFF 40%, #FFEDE4 100%)'
        }} className=" px-[15px] py-[10px] mb-[10px] gap-1">
          <div className="text-[12px] font-inter font-normal text-[#6e6e6e]">
            Withdrawable Balance
          </div>
          <div className="text-[12px] font-inter font-medium text-[#000]">
            ₹{withdrawableBalance}
          </div>
        </div>
        <div className="text-[9px] px-[15px] text-[#000] font-medium mb-3">
          Note: You need a minimum commission of{" "}
          <span className="font-bold">₹600</span> to withdraw.
        </div>
<div className="w-full px-[15px]">
          <button
          className="w-full font-inter bg-[rgba(222,44,109,1)] hover:bg-pink-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          onClick={changeToWithdraw}
        >
          Withdrawn Now
        </button>
</div>
      </div>

      {/* Tabs */}
      <div className="px-4 mb-6">
        <div className="flex justify-center font-extrabold">
          <button
            onClick={() => setActiveTab("cashback")}
            className={`pb-2 font-inter cursor-pointer text-sm font-medium w-[100%] ${activeTab === "cashback"
              ? "text-[rgba(222,44,109,1)] border-b-2 border-[rgba(222,44,109,1)]"
              : "text-[#000000] border-b-2 border-[#DFE2E8]"
              }`}
          >
            Cashback Activity
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`pb-2 font-inter cursor-pointer text-sm font-medium w-[100%] ${activeTab === "history"
              ? "text-[rgba(222,44,109,1)] border-b-2 border-[rgba(222,44,109,1)]"
              : "text-[#000000] border-b-2 border-[#DFE2E8]"
              }`}
          >
            Withdrawn History
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-[15px] w-full">
        {activeTab === "history" && (
          <>
            {/* Section Header */}
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[14px] font-medium text-[#000] font-inter">
                Withdrawn History
              </h3>
            </div>

            {/* Transaction List */}
            <div className="space-y-4">
              {transactions.map((transaction: any) => {
                let details = JSON.parse(transaction.details);
                return (
                  <div
                    key={transaction.id}
                    className="flex items-start gap-3 py-3 border-b-[0.5px] border-b-[#eaeaea]"
                  >
                    {/* Avatar */}
                    <div
                      style={{
                        background:
                          "linear-gradient(95deg, #FFF9F6 28.82%, #FFECE2 101.03%)",
                        boxShadow: "0px 0px 1.6px 0px rgba(0, 0, 0, 0.25)",
                      }}
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 p-[9px]"
                    >
                      <span className="text-[12px] font-medium text-[#000]">
                        {details?.name
                          ?.split(" ")
                          .map((n: any) => n[0])
                          .join("")}
                      </span>
                    </div>

                    {/* Transaction Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] font-normal text-[#818181] mb-2">
                            Transfer to
                          </div>
                          <div className="text-[11px] text-[#000] leading-2.5">
                            {details?.name}
                          </div>
                          <div className="text-[11px] text-[#000] leading-2.5 font-medium">
                            {transaction.type}
                          </div>
                          {/* <div className="text-sm font-medium text-[#000]">
                            {details.name}
                          </div> */}
                          <div className="text-[12px] text-[#000] leading-2.5 font-medium">
                            {transaction.m_id == 2
                              ? details.account_number | details.bank_name
                              : details.upi}
                          </div>
                          <div className="text-[10px] text-[#000] leading-5 font-normal">
                            {transaction.date} | {transaction.time}
                          </div>
                        </div>
                        <div className="flex flex-col items-end ml-4">
                          <div className="text-sm font-bold text-[#000] mb-1">
                            ₹{transaction.points.toFixed(2)}
                          </div>
                          <span className={`text-[11px] font-normal leading-2.5 ${transaction.status.toLowerCase() === "paid" ? " text-[#5EB664]" : "text-[#ef453c]"}`}>
                            {transaction.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {activeTab === "cashback" && (
          <div className="flex items-center justify-center">
            <div className="w-full bg-white min-h-screen">
              {/* Header */}
              <div className="flex items-center justify-between w-full mb-5">
                <h3 className="text-[14px] font-medium text-[#000] font-inter">
                  Transactions
                </h3>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="p-1 border border-gray-300 rounded bg-white hover:bg-gray-50 transition-colors"
                >
                  <Calendar size={12} className="text-gray-700" />
                </button>
              </div>

              {/* Transactions List */}
     {isError ? (
<div className="text-gray-600 text-[14px] font-inter font-medium w-fit mx-auto mt-25">
 <p> No transaction data found</p>
</div>
     ): (
               <div className="divide-y divide-gray-100 p">
                {cashback.map((transaction, index) => (
                  <div className="py-3" key={index}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="text-[10px] text-[#000] mb-1">
                          {transaction.order_date}
                        </p>
                        <div className="flex items-center">
                          <img
                            className="w-[20%]"
                            src={transaction.store_imgurl}
                            alt={transaction.store_name}
                          />
                          {index === 0 && transaction.frameId && (
                            <div className="flex items-center gap-2 bg-purple-100 px-2 py-1 rounded">
                              <div className="w-4 h-4 bg-purple-600 rounded flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-sm"></div>
                              </div>
                            </div>
                          )}
                        </div>
                        {transaction.order_id && (
                          <p className="text-[11px] text-[#8c8c8c] font-normal">
                            Order ID: {transaction.order_id}
                          </p>
                        )}
                        {!transaction.order_id && (
                          <p className="text-[11px] text-[#8c8c8c] font-normal">
                            Bonus
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-[14px] font-bold text-[#000] mb-2`}
                        >
                          ₹{transaction.cashback.toFixed(2)}
                        </p>
                        {transaction.status === "Cancelled" && (
                          <p
                            className={`text-[11px] text-[#EF453C] font-normal`}
                          >
                            {getStatusText(transaction.status)}
                          </p>
                        )}
                        {transaction.status === "Approved" && (
                          <p
                            className={`text-sm ${getStatusColor(
                              transaction.status
                            )}`}
                          >
                            {getStatusText(transaction.status)}
                          </p>
                        )}
                        {transaction.est_approval_date &&
                          transaction.status == "Pending" && (
                            <p className="text-[11px] text-[#000]">
                              Estimated Approval:{" "}
                              {transaction.est_approval_date}
                            </p>
                          )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
     )}
            </div>
          </div>
        )}
        {totalPages > 1 && (activeTab != "history") && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
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
    </div>
  ) : (
    <WithdrawScreen setCurrentScreen={setCurrentScreen} />
  );
};

export default WalletComponent;
