"use client";
import { useState, useEffect } from "react";
import {
  ChevronLeft,
  Calendar,
  Plus,
  Minus,
  RotateCcw,
  Circle,
} from "lucide-react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData,
  TooltipItem,
} from "chart.js";
import { useSelector } from "react-redux";
import {
  useGetEarningsGraphQuery,
  useLazyGetEarningsGraphQuery,
} from "@/redux/api/analyticsApi";
import SlideUpModal from "../reports/SlideUpDateFilter";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Type definitions
type GraphType = "Orders" | "Commission";
type DataPoint = {
  date: string;
  value: number;
};

interface ChartDataset {
  Orders: DataPoint[];
  Commission: DataPoint[];
}

interface EarningsChartProps {
  //   title?: string;
  dateRange?: string;
  data?: ChartDataset;
  onDateChange?: (range: string) => void;
}

const EarningsChart = ({
  //   title = "My Earnings",
  dateRange = "4 May, 2025 - 10 May, 2025",
  onDateChange,
}: EarningsChartProps) => {
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
  const [graphType, setGraphType] = useState<GraphType>("Orders");
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [data, setData] = useState<any>({
    Orders: [],
    Commission: [],
  });
  const [startDate, setStartDate] = useState<Date | null>(() => {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    return sevenDaysAgo;
  });
  const [allTime, setAllTime] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const [endDate, setEndDate] = useState<Date | null>(() => new Date());
  const { data: graphData, isLoading } = useGetEarningsGraphQuery({
    start_date: formatDateForAPI(startDate),
    end_date: formatDateForAPI(endDate),
    alltime: allTime,
    // alltime: allTime,
  });

  const [trigger] = useLazyGetEarningsGraphQuery();

  useEffect(() => {
    if (graphData?.length) {
      setData((prev: any) => ({
        ...prev,
        Orders: graphData,
      }));
    }
  }, [graphData]);

  // useEffect(() => {
  //   if (startDate && endDate) {
  //     trigger({
  //       start_date:
  //         startDate instanceof Date ? startDate.toISOString() : startDate,
  //       end_date: endDate instanceof Date ? endDate.toISOString() : endDate,
  //       alltime: allTime,
  //     });
  //   }
  // }, [startDate, endDate, allTime]);

  const { created_at } = useSelector((state: any) => state.auth.user)

  const handleDateChangeModal = (
    start: Date | null,
    end: Date | null,
    alltime: boolean
  ) => {
    setStartDate(allTime ? created_at : start);
    setEndDate(end);
  };

  const handleSelectAllTimeActive = () => {
    setAllTime(true);
  };

  const handleSelectAllTimeInActive = () => {
    setAllTime(false);
  };

  // Get dates and values for the chart
  const dates = data.Orders.map((item: any) => item.date);
  const OrdersValues = data.Orders.map((item: any) => item.value);
  const CommissionValues = data.Commission.map((item: any) => item.value);

  const cachedProducts = useSelector((state: any) => state?.analyticsApi);

  // Reset function
  const reset = () => {
    setZoomLevel(1);
    setStartDate(() => {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    return sevenDaysAgo;
  });
  setEndDate(() => new Date());
  };

  const changeGraphType = async (type: string) => {
    const queryKeyObj: any = {
      start_date: formatDateForAPI(startDate),
      end_date: formatDateForAPI(endDate),
      ...(type === "Commission" ? { type: "Commission" } : {}),
    };

    const key = `getEarningsGraph(${JSON.stringify(queryKeyObj)})`;

    const earningsData = cachedProducts.queries?.[key]?.data;

    if (type == "Commission") {
      if (earningsData?.length) {
        setData((prev: any) => ({
          ...prev,
          Commission: earningsData,
        }));
        setGraphType("Commission");
      } else {
        let res = await trigger({
          start_date: formatDateForAPI(startDate),
          end_date: formatDateForAPI(endDate),
          type: "Commission",
        }).unwrap();

        setData((prev: any) => ({
          ...prev,
          Commission: res,
        }));
        setGraphType("Commission");
      }
    } else {
      if (earningsData?.length) {
        setData((prev: any) => ({
          ...prev,
          Orders: earningsData,
        }));
        setGraphType("Orders");
      } else {
        let res = await trigger({
          start_date: formatDateForAPI(startDate),
          end_date: formatDateForAPI(endDate),
        }).unwrap();
        setData((prev: any) => ({
          ...prev,
          Orders: res,
        }));
        setGraphType("Orders");
      }
    }
  };

  // Chart configuration with proper typing
  const chartData: ChartData<"line"> = {
    labels: dates,
    datasets: [
      {
        label: "Orders",
        data: graphType === "Orders" ? OrdersValues : [],
        borderColor: "rgba(222,44,109,1)",
        backgroundColor: "rgba(137, 121, 255, 0.5)",
        borderWidth: 1.5,
        pointBackgroundColor: "rgba(222,44,109,1)",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 1,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.1,
        hidden: graphType !== "Orders",
      },
      {
        label: "Commission",
        data: graphType === "Commission" ? CommissionValues : [],
        borderColor: "rgba(222,44,109,1)",
        backgroundColor: "rgba(255, 133, 34, 0.5)",
        borderWidth: 1.5,
        pointBackgroundColor: "rgba(222,44,109,1)",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 1,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.1,
        hidden: graphType !== "Commission",
      },
    ],
  };

  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          display: true,
          //   drawBorder: true,
          color: "rgba(200, 200, 200, 0.3)",
        },
        ticks: {
          font: {
            size: 10,
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          //   drawBorder: true,
          color: "rgba(200, 200, 200, 0.3)",
        },
        ticks: {
          maxTicksLimit: 8,
          callback: function (value) {
            return graphType == "Orders" ? value : "₹" + value;
          },
          font: {
            size: 12,
          },
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context: TooltipItem<"line">) {
            return graphType == "Orders" ? "" + context.parsed.y : "₹" + context.parsed.y;
          },
        },
      },
    },
    animation: {
      duration: 500,
    },
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
  };

  const handleDateAdd = () => {
    setStartDate((prevDate: any) => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() - 1);
      return newDate;
    });
  }

  const handleDateRemove = () => {
    if (dayDifference(startDate, endDate)) {
      setStartDate((prevDate: any) => {
        const newDate = new Date(prevDate);
        newDate.setDate(newDate.getDate() + 1);
        return newDate;
      })
    }
  }

  const dayDifference = (startDate: any, endDate: any) => {
    const start: any = new Date(startDate);
    const end: any = new Date(endDate);
    const differenceInMilliseconds = end - start;
    const differenceInDays = differenceInMilliseconds / (1000 * 60 * 60 * 24);

    return differenceInDays >= 7;
  };

  return (
    <div className="bg-[#fcfcfc] rounded-[6px] px-[15px]  flex flex-col items-center justify-center w-full ">
      {/* Header */}
      <div className="flex items-center justify-between w-full mb-5">
        <div className="flex items-center justify-start">
          <h2 className="text-[16px] font-bold font-inter text-[#000]">
            My Earnings
          </h2>
        </div>
      </div>

      {/* Controls Section - Matching the structure of the pasted code */}
      <div className="flex flex-col items-center justify-center w-full gap-[14px]">
        {/* Graph Type Selection */}
        <div className="flex items-center justify-center gap-3 w-full">
          <div className="flex flex-col items-center justify-center w-full">
            <button
              onClick={() => changeGraphType("Orders")}
              className={`w-full cursor-pointer flex items-center justify-center gap-2 px-2.5 py-1.5 bg-[#fff] rounded-[3px] text-gray-800 text-base font-semibold ${graphType === "Orders"
                ? "border-[1px] border-[rgba(222,44,109,1)]"
                : ""
                }`}
            >
              <Circle
                className={`w-3 h-3 ${graphType === "Orders"
                  ? "fill-[rgba(222,44,109,1)]"
                  : "fill-[#a8beab]"
                  } stroke-none`}
              />
              Orders
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
                fill={graphType === "Orders" ? "rgba(222,44,109,1)" : "#A8BEAB"}
              />
            </svg>
          </div>

          <div className="flex flex-col items-center justify-center w-full">
            <button
              onClick={() => {
                changeGraphType("Commission");
              }}
              className={`w-full cursor-pointer flex items-center justify-center gap-2 px-2.5 py-1.5 bg-[#fff] rounded-[3px] text-gray-800 text-base font-semibold ${graphType === "Commission"
                ? "border-[1px] border-[rgba(222,44,109,1)]"
                : ""
                }`}
            >
              <Circle
                className={`w-3 h-3 ${graphType === "Commission"
                  ? "fill-[rgba(222,44,109,1)]"
                  : "fill-[#a8beab]"
                  } stroke-none`}
              />
              Commission
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
                fill={
                  graphType === "Commission" ? "rgba(222,44,109,1)" : "#A8BEAB"
                }
              />
            </svg>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-5 w-full">
          <div
            onClick={() => setIsModalOpen(true)}
            className="flex items-center cursor-pointer justify-end gap-1 rounded-[8px] bg-[#fff] border-[0.5px] border-[#dcdcdc] px-[10px] py-1"
          >
            {/* <div className=" "> */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="15"
              viewBox="0 0 14 15"
              fill="none"
            >
              <path
                d="M0.559999 1.76H3.5V0.64C3.5 0.563 3.563 0.5 3.64 0.5H4.62C4.697 0.5 4.76 0.563 4.76 0.64V1.76H9.24V0.64C9.24 0.563 9.303 0.5 9.38 0.5H10.36C10.437 0.5 10.5 0.563 10.5 0.64V1.76H13.44C13.7498 1.76 14 2.01025 14 2.32V13.94C14 14.2498 13.7498 14.5 13.44 14.5H0.559999C0.25025 14.5 0 14.2498 0 13.94V2.32C0 2.01025 0.25025 1.76 0.559999 1.76ZM1.26 13.24H12.74V6.59H1.26V13.24ZM12.74 5.4V3.02H10.5V3.86C10.5 3.937 10.437 4 10.36 4H9.38C9.303 4 9.24 3.937 9.24 3.86V3.02H4.76V3.86C4.76 3.937 4.697 4 4.62 4H3.64C3.563 4 3.5 3.937 3.5 3.86V3.02H1.26V5.4H12.74Z"
                fill="black"
              />
            </svg>
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
            {/* <KeyboardArrowDownIcon sx={{fontSize:'1.1rem'}} /> */}
            {/* </div> */}
          </div>
          <div className="flex items-center justify-end gap-3  ">
            <button
              onClick={handleDateAdd}
              className="w-fit h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="17"
                height="16"
                viewBox="0 0 17 16"
                fill="none"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12.8337 7.39858H8.96081V3.52565C8.96081 3.23375 8.72497 2.99685 8.43201 2.99685C8.14011 2.99685 7.90321 3.23375 7.90321 3.52565V7.39858H4.03133C3.73838 7.39858 3.50253 7.63549 3.50253 7.92738C3.50253 8.21928 3.73838 8.45619 4.03133 8.45619H7.90321V12.3291C7.90321 12.621 8.14011 12.8579 8.43201 12.8579C8.72497 12.8579 8.96081 12.621 8.96081 12.3291V8.45619H12.8337C13.1256 8.45619 13.3625 8.21928 13.3625 7.92738C13.3625 7.63549 13.1256 7.39858 12.8337 7.39858ZM13.2938 12.7881C11.9951 14.0869 10.268 14.8018 8.43201 14.8018C6.59602 14.8018 4.87001 14.0869 3.57127 12.7881C2.2736 11.4904 1.5576 9.76338 1.5576 7.92738C1.5576 6.09139 2.2736 4.36538 3.57127 3.06665C4.91126 1.72667 6.67216 1.05615 8.43201 1.05615C10.1929 1.05615 11.9528 1.72667 13.2938 3.06665C14.5915 4.36538 15.3064 6.09139 15.3064 7.92738C15.3064 9.76338 14.5915 11.4904 13.2938 12.7881ZM14.0415 2.31892C10.948 -0.773503 5.91598 -0.772446 2.82355 2.31892C1.32599 3.81649 0.5 5.80901 0.5 7.92738C0.5 10.0458 1.32599 12.0383 2.82355 13.5358C4.32217 15.0345 6.31364 15.8594 8.43201 15.8594C10.5504 15.8594 12.5429 15.0345 14.0415 13.5358C15.5391 12.0383 16.364 10.0458 16.364 7.92738C16.364 5.80901 15.5391 3.81649 14.0415 2.31892Z"
                  fill="rgba(222,44,109,1)"
                />
              </svg>
            </button>

            <button
              onClick={handleDateRemove}
              className="w-fit h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
              >
                <path
                  d="M8.10644 0.186523C3.83664 0.186523 0.363281 3.65988 0.363281 7.92968C0.363281 12.1995 3.83664 15.6728 8.10644 15.6728C12.3762 15.6728 15.8496 12.1995 15.8496 7.92968C15.8496 3.65988 12.3762 0.186523 8.10644 0.186523ZM8.10644 14.5667C4.4465 14.5667 1.46945 11.5896 1.46945 7.92968C1.46945 4.26975 4.4465 1.29269 8.10644 1.29269C11.7664 1.29269 14.7434 4.26975 14.7434 7.92968C14.7434 11.5896 11.7664 14.5667 8.10644 14.5667Z"
                  fill="rgba(222,44,109,1)"
                />
                <path
                  d="M11.8288 7.37708H4.723C4.41693 7.37708 4.16992 7.62408 4.16992 7.93016C4.16992 8.23623 4.41693 8.48324 4.723 8.48324H11.8281C12.1342 8.48324 12.3812 8.23623 12.3812 7.93016C12.3812 7.62408 12.1342 7.37708 11.8281 7.37708H11.8288Z"
                  fill="rgba(222,44,109,1)"
                />
              </svg>
            </button>

            <button
              onClick={reset}
              className="w-fit h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="17"
                height="18"
                viewBox="0 0 20 20"
                fill="none"
              >
                <path
                  d="M0.851443 16.8093L5.72646 16.825L5.72828 16.2575M5.72828 16.2575C4.12953 15.605 2.7924 14.4405 1.92646 12.9464C1.06052 11.4523 0.714709 9.71308 0.943213 8.00133C1.17172 6.28957 1.96162 4.70201 3.18914 3.48745C4.41666 2.27288 6.01242 1.49996 7.72632 1.2898M5.72828 16.2575L5.7421 11.9494M16.5015 1.2575L11.6265 1.24186L11.6247 1.8084M11.6247 1.8084C13.2225 2.46179 14.5586 3.62664 15.4237 5.12058C16.2889 6.61452 16.6343 8.35321 16.4059 10.0644C16.1775 11.7757 15.3881 13.3629 14.1614 14.5775C12.9347 15.7922 11.3399 16.5657 9.62666 16.777M11.6247 1.8084L11.6109 6.11744"
                  stroke="black"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center gap-[9px] w-full bg-[#fff] px-2 py-3 rounded-[7px] ">
        {/* Chart */}
        <div className="w-full h-84 ">
          <Line data={chartData} options={chartOptions} />
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center w-full py-1 border-t-[1px] border-t-[#000] ">
          <div className="flex items-center gap-2">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                backgroundColor: "rgba(222,44,109,1)",
              }}
            ></span>
            <span className="text-[12px] text-[#000] font-semibold font-inter ">
              Last 7 days
            </span>
          </div>
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
    </div>
  );
};

export default EarningsChart;
