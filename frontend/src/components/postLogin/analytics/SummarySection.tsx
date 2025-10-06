import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useGetUserSummaryQuery } from "@/redux/api/analyticsApi";
import LoadingSpinner from "../LoadingStatesAndModals/LoadingSpinner";

const SummarySection = () => {
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const reports = [
    { id: 1, title: "Daily Report" },
    { id: 2, title: "Brand Insights" },
    { id: 3, title: "Link Report" },
    { id: 4, title: "Transaction wise" },
    { id: 5, title: "Order Status" },
  ];

  const { data = {}, isLoading } = useGetUserSummaryQuery({})

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="flex flex-col items-center justify-center gap-[30px] w-full relative">
      <div className="h-[150px] w-full bg-[rgba(222,44,109,1)] absolute top-0 z-0 " />
      <div className="px-[15px] pt-[22px] flex flex-col items-start justify-center gap-[11px] w-full relative z-10">
        <h1 className="text-[#fff] text-[12px] font-medium font-inter ">
          OVERALL SUMMARY
        </h1>

        <div
          style={{ boxShadow: "0px 0px 1.7px 0px rgba(0, 0, 0, 0.20)" }}
          className="p-[10px] w-full grid grid-cols-2 items-center justify-start gap-[15px] rounded-[6px] border-[1px] border-[rgba(222,44,109,1)] bg-[#fff]  "
        >
          <div className="flex flex-col items-start justify-center gap-1 border-r-[1px] border-r-[rgba(222,44,109,1)] pr-">
            <h2 className="text-[#000] text-[12px] font-normal font-inter leading-[106%] ">
              Ordered Commission
            </h2>
            <p className="m-0 text-[#000] text-[14px] font-semibold font-inter leading-[106%] ">
              ₹{data?.total_comission || 0}
            </p>
          </div>

          <div className="flex flex-col items-start justify-center gap-1 pl-[10px]">
            <h2 className="text-[#000] text-[12px] font-normal font-inter leading-[106%] ">
              Redeemed Amount
            </h2>
            <p className="m-0 text-[#000] text-[14px] font-semibold font-inter leading-[106%] ">
              ₹{data?.total_redeemed || 0}
            </p>
          </div>
        </div>

        <div
          style={{ boxShadow: "0px 0px 1.7px 0px rgba(0, 0, 0, 0.20)" }}
          className="p-[10px] w-full grid grid-cols-3 items-center justify-start gap-[16px] rounded-[6px] border-[1px] border-[rgba(222,44,109,1)] bg-[#fff]  "
        >
          <div className="flex flex-col items-start justify-center gap-1 border-r-[1px] border-r-[rgba(222,44,109,1)] pr-[40px]">
            <h2 className="text-[#000] text-[12px] font-normal font-inter leading-[106%] ">
              Sales
            </h2>
            <p className="m-0 text-[#000] text-[14px] font-semibold font-inter leading-[106%] ">
              ₹{data?.total_sales || 0}
            </p>
          </div>

          <div className="flex flex-col items-start justify-center gap-1 border-r-[1px] border-r-[rgba(222,44,109,1)] pr-[40px]">
            <h2 className="text-[#000] text-[12px] font-normal font-inter leading-[106%] ">
              Clicks
            </h2>
            <p className="m-0 text-[#000] text-[14px] font-semibold font-inter leading-[106%] ">
              {data?.total_clicks || 0}
            </p>
          </div>

          <div className="flex flex-col items-start justify-center gap-1 ">
            <h2 className="text-[#000] text-[12px] font-normal font-inter leading-[106%] ">
              Total Orders
            </h2>
            <p className="m-0 text-[#000] text-[14px] font-semibold font-inter leading-[106%] ">
              {data?.total_orders || 0}
            </p>
          </div>
        </div>
      </div>

      {/* report section  */}
      <div className="w-full px-[15px]">
        <div
          style={{
            background:
              "linear-gradient(95deg, #FFF9F6 28.82%, #FFECE2 101.03%)",
          }}
          className="rounded-[7px] py-[15px] px-[10px] border-[1px] border-[#F2B6B6] flex flex-col items-center justify-center w-full gap-[15px]"
        >
          <div
            className="flex justify-between items-center w-full cursor-pointer"
            onClick={toggleMenu}
          >
            <div className="flex items-center justify-start gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="33"
                height="32"
                viewBox="0 0 33 32"
                fill="none"
              >
                <g clipPath="url(#clip0_752_7021)">
                  <path
                    d="M31.8715 31.9982H1.14293C0.79751 31.9982 0.517512 31.7182 0.517512 31.3727L0.5 0.626697C0.5 0.28128 0.779998 0.00128174 1.12542 0.00128174C1.47083 0.00128174 1.75083 0.28128 1.75083 0.626697L1.76834 30.748H31.8715C32.2169 30.748 32.4969 31.028 32.4969 31.3734C32.4969 31.7188 32.2169 31.9988 31.8715 31.9988V31.9982Z"
                    fill="black"
                  />
                  <path
                    d="M3.00792 2.50605H1.12542C0.779998 2.50605 0.5 2.22605 0.5 1.88063C0.5 1.53522 0.779998 1.25522 1.12542 1.25522H3.00792C3.35333 1.25522 3.63333 1.53522 3.63333 1.88063C3.63333 2.22605 3.35333 2.50605 3.00792 2.50605Z"
                    fill="black"
                  />
                  <path
                    d="M3.00792 6.54999H1.12542C0.779998 6.54999 0.5 6.27 0.5 5.92458C0.5 5.57916 0.779998 5.29916 1.12542 5.29916H3.00792C3.35333 5.29916 3.63333 5.57916 3.63333 5.92458C3.63333 6.27 3.35333 6.54999 3.00792 6.54999Z"
                    fill="black"
                  />
                  <path
                    d="M3.00792 10.5939H1.12542C0.779998 10.5939 0.5 10.3139 0.5 9.96849C0.5 9.62308 0.779998 9.34308 1.12542 9.34308H3.00792C3.35333 9.34308 3.63333 9.62308 3.63333 9.96849C3.63333 10.3139 3.35333 10.5939 3.00792 10.5939Z"
                    fill="black"
                  />
                  <path
                    d="M3.00792 14.636H1.12542C0.779998 14.636 0.5 14.356 0.5 14.0106C0.5 13.6652 0.779998 13.3852 1.12542 13.3852H3.00792C3.35333 13.3852 3.63333 13.6652 3.63333 14.0106C3.63333 14.356 3.35333 14.636 3.00792 14.636Z"
                    fill="black"
                  />
                  <path
                    d="M3.00792 18.6818H1.12542C0.779998 18.6818 0.5 18.4018 0.5 18.0564C0.5 17.711 0.779998 17.431 1.12542 17.431H3.00792C3.35333 17.431 3.63333 17.711 3.63333 18.0564C3.63333 18.4018 3.35333 18.6818 3.00792 18.6818Z"
                    fill="black"
                  />
                  <path
                    d="M3.00792 22.7257H1.12542C0.779998 22.7257 0.5 22.4457 0.5 22.1003C0.5 21.7549 0.779998 21.4749 1.12542 21.4749H3.00792C3.35333 21.4749 3.63333 21.7549 3.63333 22.1003C3.63333 22.4457 3.35333 22.7257 3.00792 22.7257Z"
                    fill="black"
                  />
                  <path
                    d="M3.00792 26.769H1.12542C0.779998 26.769 0.5 26.4891 0.5 26.1436C0.5 25.7982 0.779998 25.5182 1.12542 25.5182H3.00792C3.35333 25.5182 3.63333 25.7982 3.63333 26.1436C3.63333 26.4891 3.35333 26.769 3.00792 26.769Z"
                    fill="black"
                  />
                  <path
                    d="M4.89104 31.9737C4.54562 31.9737 4.26562 31.6937 4.26562 31.3483V29.4677C4.26562 29.1223 4.54562 28.8423 4.89104 28.8423C5.23646 28.8423 5.51646 29.1223 5.51646 29.4677V31.3483C5.51646 31.6937 5.23646 31.9737 4.89104 31.9737Z"
                    fill="black"
                  />
                  <path
                    d="M9.17815 31.9737C8.83273 31.9737 8.55273 31.6937 8.55273 31.3483V29.4677C8.55273 29.1223 8.83273 28.8423 9.17815 28.8423C9.52357 28.8423 9.80357 29.1223 9.80357 29.4677V31.3483C9.80357 31.6937 9.52357 31.9737 9.17815 31.9737Z"
                    fill="black"
                  />
                  <path
                    d="M13.4653 31.9737C13.1198 31.9737 12.8398 31.6937 12.8398 31.3483V29.4677C12.8398 29.1223 13.1198 28.8423 13.4653 28.8423C13.8107 28.8423 14.0907 29.1223 14.0907 29.4677V31.3483C14.0907 31.6937 13.8107 31.9737 13.4653 31.9737Z"
                    fill="black"
                  />
                  <path
                    d="M17.7524 31.9737C17.407 31.9737 17.127 31.6937 17.127 31.3483V29.4677C17.127 29.1223 17.407 28.8423 17.7524 28.8423C18.0978 28.8423 18.3778 29.1223 18.3778 29.4677V31.3483C18.3778 31.6937 18.0978 31.9737 17.7524 31.9737Z"
                    fill="black"
                  />
                  <path
                    d="M22.0414 31.9737C21.696 31.9737 21.416 31.6937 21.416 31.3483V29.4677C21.416 29.1223 21.696 28.8423 22.0414 28.8423C22.3868 28.8423 22.6668 29.1223 22.6668 29.4677V31.3483C22.6668 31.6937 22.3868 31.9737 22.0414 31.9737Z"
                    fill="black"
                  />
                  <path
                    d="M26.3305 31.9737C25.9851 31.9737 25.7051 31.6937 25.7051 31.3483V29.4677C25.7051 29.1223 25.9851 28.8423 26.3305 28.8423C26.6759 28.8423 26.9559 29.1223 26.9559 29.4677V31.3483C26.9559 31.6937 26.6759 31.9737 26.3305 31.9737Z"
                    fill="black"
                  />
                  <path
                    d="M30.6156 31.9737C30.2702 31.9737 29.9902 31.6937 29.9902 31.3483V29.4677C29.9902 29.1223 30.2702 28.8423 30.6156 28.8423C30.9611 28.8423 31.2411 29.1223 31.2411 29.4677V31.3483C31.2411 31.6937 30.9611 31.9737 30.6156 31.9737Z"
                    fill="black"
                  />
                  <path
                    d="M5.51787 26.3313C5.17245 26.3312 4.89252 26.0511 4.89258 25.7057C4.89258 25.6272 4.9074 25.5494 4.93623 25.4763C4.94937 25.4425 6.28213 22.0403 7.59737 17.1233C8.49985 13.7498 10.3048 11.5777 12.4256 11.3132C13.2711 11.2075 14.1292 11.4232 14.9066 11.9355C15.684 12.4477 16.377 13.2426 16.9705 14.2989C18.2369 16.5642 19.5534 18.79 20.8843 20.9158C21.3448 21.6496 22.3128 21.8712 23.0466 21.4108C23.2912 21.2573 23.4887 21.0392 23.6174 20.7807C24.9795 18.0372 27.7785 16.3022 30.8416 16.3027H31.8747C32.2202 16.3027 32.5002 16.5827 32.5002 16.9281C32.5002 17.2736 32.2202 17.5536 31.8747 17.5536H30.8384C28.2478 17.5435 25.8785 19.0122 24.735 21.3367C24.0418 22.7309 22.3495 23.2992 20.9552 22.606C20.4896 22.3746 20.0971 22.0188 19.8211 21.5781C18.479 19.4354 17.1518 17.1908 15.8754 14.9081C14.9441 13.2407 13.7734 12.4064 12.5807 12.5534C11.0071 12.7497 9.56055 14.6241 8.80568 17.4454C7.47041 22.4362 6.11326 25.8991 6.0995 25.9335C6.00588 26.1731 5.7751 26.3309 5.51787 26.3313Z"
                    fill="black"
                  />
                  <path
                    d="M31.8705 24.45C28.8241 24.45 27.2669 22.4931 25.891 20.7651C24.5776 19.1133 23.3336 17.5529 20.8876 17.5529C18.4416 17.5529 17.2014 19.1165 15.8843 20.7651C14.5084 22.4925 12.9511 24.4494 9.90471 24.4494C9.5593 24.4494 9.2793 24.1694 9.2793 23.824C9.2793 23.4785 9.5593 23.1985 9.90471 23.1985C12.3482 23.1985 13.5909 21.6381 14.908 19.9864C16.2839 18.259 17.8412 16.3021 20.8883 16.3021C23.9353 16.3021 25.4926 18.259 26.8678 19.9864C28.1812 21.6381 29.4252 23.1985 31.8712 23.1985C32.2166 23.1985 32.4966 23.4785 32.4966 23.824C32.4966 24.1694 32.2166 24.4494 31.8712 24.4494L31.8705 24.45Z"
                    fill="black"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_752_7021">
                    <rect
                      width="32"
                      height="32"
                      fill="white"
                      transform="translate(0.5)"
                    />
                  </clipPath>
                </defs>
              </svg>

              <div className="flex flex-col items0start justify-center ">
                <h3 className="font-bold font-inter text-[16px] text-[#000] leading-normal">
                  All Reports
                </h3>
                <p className="font-medium font-inter text-[#000] text-[12px]">
                  Complete Activity & Performance
                </p>
              </div>
            </div>
            <div className="cursor-pointer">
              {isOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="11"
                  viewBox="0 0 20 11"
                  fill="none"
                >
                  <path
                    d="M18.5 9.5L10 1.5L1.5 9.5"
                    stroke="#0E0D0C"
                    strokeWidth="2"
                  />
                </svg>
              ) : (
                <svg
                  className="rotate-180"
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="11"
                  viewBox="0 0 20 11"
                  fill="none"
                >
                  <path
                    d="M18.5 9.5L10 1.5L1.5 9.5"
                    stroke="#0E0D0C"
                    strokeWidth="2"
                  />
                </svg>
              )}
            </div>
          </div>

          {isOpen && (
            <div className="flex flex-col items-center justify-center gap-[10px] w-full">
              {reports.map((report) => (
                <div
                  key={report.id}
                  onClick={() =>
                    router.push(
                      `/reports?name=${report.title.replace(/\s+/g, "-")}`
                    )
                  }
                  className="flex justify-between items-center w-full px-[10px] py-4 rounded-[4px] border-[1px] border-[#f2b6b6] bg-white cursor-pointer "
                >
                  <span className="text-[#000] text-[14px] font-medium font-inter">
                    {report.title}
                  </span>
                             <svg
                             className="mr-2"
                xmlns="http://www.w3.org/2000/svg"
                width="9"
                height="12"
                viewBox="0 0 10 16"
                fill="none"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M0.366117 0.334735C-0.122039 0.781049 -0.122039 1.50467 0.366117 1.95098L6.98223 8L0.366117 14.049C-0.122039 14.4953 -0.122039 15.219 0.366117 15.6653C0.854272 16.1116 1.64573 16.1116 2.13388 15.6653L9.63388 8.80812C10.122 8.36181 10.122 7.63819 9.63388 7.19188L2.13388 0.334735C1.64573 -0.111578 0.854272 -0.111578 0.366117 0.334735Z"
                  fill="#232323"
                />
              </svg>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SummarySection;
