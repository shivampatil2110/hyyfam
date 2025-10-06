"use client";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  useLazyGetStoreDescriptionQuery,
  useStoresbycatQuery,
} from "@/redux/api/productsApi";
import { motion, AnimatePresence } from "framer-motion";
import XIcon from "@mui/icons-material/X";

interface SlideUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  selectedStore?: any;
}

const SlideUpModal: React.FC<SlideUpModalProps> = ({
  isOpen,
  onClose,
  children,
  selectedStore, // Add this prop
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-70 flex flex-col justify-end  [&::-webkit-scrollbar]:hidden scroll-smooth max-w-[448px] mx-auto">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/30 backdrop-blur-[0px] [&::-webkit-scrollbar]:hidden scroll-smooth"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Slide-up Panel */}
          <motion.div
            className={`relative bg-white rounded-t-2xl pt-10 z-50 max-w-[448px] min-w-full mx-auto overflow-scroll h-[70vh] [&::-webkit-scrollbar]:hidden scroll-smooth`}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const PartnersCarousel: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [commissionRates, setCommissionRates] = useState([]);
  const [terms, setTerms] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedStore, setSelectedStore] = useState<any>(null);
  const [activeDescription, setActiveDescription] =
    useState<string>("Commission Rate");
  const { data = [], isLoading } = useStoresbycatQuery({
    cat: "trend_stores",
  });
  const [storeDescTrigger, storeDescTriggerState] =
    useLazyGetStoreDescriptionQuery();

  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        setShowLeftArrow(scrollLeft > 0);
        setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
      }
    };

    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener("scroll", handleScroll);
      handleScroll(); // Initial check
    }

    return () => {
      if (scrollElement) {
        scrollElement.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  const colors = [
    "#F0F0F0",
    "#EDD3DE",
    "#F0F0F0",
    "#FFE8E8",
    "#e8e8e8",
    "#efae279c",
  ];

  const handleStoreClick = async (store: any) => {
    let obj: any = {};
    obj.store_page_url = store.store_page_url;
    const res = await storeDescTrigger(obj);
    const data = res.data[0];
    let { tips, description } = data;
    tips = JSON.parse(tips);
    description = JSON.parse(description);
    setCommissionRates(description);
    setTerms(tips);
    setSelectedStore(store);
    setIsModalOpen(true);
  };

  interface LoadingDotsProps {
    size?: "sm" | "md" | "lg";
    color?: string;
    className?: string;
  }

  interface StoreType {
    id: number;
    title: string;
  }

  const handleTabClickDescription = (title: string) => {
    setActiveDescription(title);
  };

  const descriptionType: StoreType[] = [
    { id: 1, title: "Commission Rate" },
    { id: 2, title: "Terms & Conditions" },
  ];

  const redirectToStore = async (store: any) => {
    window.open(
      `/redirect/seller/${store.store_page_url}?name=${store.store_name}&img_url=${store.img_url}`,
      "_blank"
    );
  };

  return (
    <>
      <div className="w-full max-w-screen-xl mx-auto pl-4 py-6">
        <div className="flex justify-between items-center pr-4 mb-6">
          <h2 className="text-[20px] font-inter font-medium">
            Earn with our Partners
          </h2>
          <Link
            href="/partner-brands"
            className="text-[#f1437e] hover:text-[#f14373] font-raleway text-[14px] font-semibold underline"
          >
            View All
          </Link>
        </div>

        <div className="relative">
          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto  scrollbar-hide snap-x"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch", // Smooth scrolling on iOS
            }}
          >
            {Array.isArray(data) &&
              data.slice(0, 6)?.map((partner: any, index: number) => (
                <div
                  key={partner.store_id}
                  className={`flex-shrink-0 h-[110px] w-[152px] rounded-[18px] snap-start  cursor-pointer ${
                    index === 5 ? "mr-5" : ""
                  }`}
                  onClick={() => handleStoreClick(partner)}
                >
                  <div
                    className="rounded-[15px] h-[110px] overflow-hidden  relative flex flex-col items-center justify-end px-[5px] pb-[5px] gap-[15px]"
                    style={{ backgroundColor: colors[index] }}
                    >
                      <Image
                        src={partner?.img_url}
                        alt={partner?.alt_text}
                        height={100}
                        width={100}
                        className="object-contain"
                        loading="lazy"
                      />

                    <div className="bg-[#fff] py-2.5 px-[9px] flex items-center justify-center w-full rounded-[10px]">
                      <p className="text-[#000] font-raleway text-[10px] font-semibold leading-[14px] text-center">
                        {partner.cashback_upto}
                      </p>
                    </div>

                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      <footer className="w-full pb-2 pt-2.5 px-4">
        <div className="w-full rounded-[15px] bg-[#ffe9f5] pt-4.5 pb-6 px-10 flex flex-col items-center justify-center gap-[17px]">
          <p className="text-[14px] text-[#000] font-normal font-inter leading-[150%] ">
            Show us some love <span className="text-[#f35188]">❤</span> on
            social media
          </p>
          <div className="flex items-center justify-center w-full gap-5">
            <Link target="_blank" href={"https://www.instagram.com/hyy_fam/"}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="19"
                height="20"
                viewBox="0 0 19 20"
                fill="none"
              >
                <path
                  d="M9.53917 1.7394C12.0208 1.7394 12.3147 1.74906 13.295 1.79548C13.8845 1.80297 14.4683 1.91538 15.0212 2.12783C15.4221 2.28841 15.7862 2.5344 16.09 2.84997C16.3939 3.16554 16.6307 3.54369 16.7854 3.96008C16.9899 4.53427 17.0982 5.14063 17.1054 5.75281C17.1496 6.77098 17.1594 7.07621 17.1594 9.65359C17.1594 12.231 17.1501 12.5362 17.1054 13.5544C17.0982 14.1666 16.9899 14.7729 16.7854 15.3471C16.6307 15.7635 16.3939 16.1416 16.09 16.4572C15.7862 16.7728 15.4221 17.0188 15.0212 17.1794C14.4683 17.3918 13.8845 17.5042 13.295 17.5117C12.3151 17.5577 12.0213 17.5678 9.53917 17.5678C7.05708 17.5678 6.7632 17.5581 5.78329 17.5117C5.19385 17.5042 4.61001 17.3918 4.05716 17.1794C3.65624 17.0188 3.29213 16.7728 2.98829 16.4572C2.68444 16.1416 2.44759 15.7635 2.29297 15.3471C2.08842 14.7729 1.98018 14.1666 1.97297 13.5544C1.92871 12.5362 1.91897 12.231 1.91897 9.65359C1.91897 7.07621 1.92827 6.77098 1.97297 5.75281C1.98018 5.14063 2.08842 4.53427 2.29297 3.96008C2.44759 3.54369 2.68444 3.16554 2.98829 2.84997C3.29213 2.5344 3.65624 2.28841 4.05716 2.12783C4.61001 1.91538 5.19385 1.80297 5.78329 1.79548C6.76364 1.74952 7.05753 1.7394 9.53917 1.7394ZM9.53917 0C7.01636 0 6.69858 0.0110321 5.70716 0.0579188C4.93574 0.0738547 4.1725 0.225553 3.44992 0.50656C2.83006 0.749114 2.26862 1.12922 1.80478 1.62035C1.33147 2.10226 0.965174 2.68568 0.731486 3.32987C0.460917 4.08033 0.314855 4.87302 0.299511 5.6742C0.255251 6.70295 0.244629 7.033 0.244629 9.65313C0.244629 12.2733 0.255251 12.6033 0.300396 13.633C0.31574 14.4342 0.461803 15.2269 0.732371 15.9773C0.9658 16.6214 1.33179 17.2048 1.80478 17.6868C2.26888 18.1781 2.83063 18.5582 3.4508 18.8006C4.17338 19.0816 4.93662 19.2333 5.70805 19.2493C6.69946 19.2952 7.01592 19.3072 9.54005 19.3072C12.0642 19.3072 12.3806 19.2962 13.3721 19.2493C14.1435 19.2333 14.9067 19.0816 15.6293 18.8006C16.2465 18.5521 16.807 18.1726 17.275 17.6863C17.7429 17.2 18.108 16.6176 18.3468 15.9764C18.6174 15.2259 18.7635 14.4333 18.7788 13.6321C18.8231 12.6033 18.8337 12.2733 18.8337 9.65313C18.8337 7.033 18.8231 6.70295 18.7779 5.67329C18.7626 4.8721 18.6165 4.07941 18.346 3.32895C18.1125 2.68485 17.7465 2.10143 17.2735 1.61943C16.8095 1.12819 16.2477 0.748076 15.6275 0.50564C14.9049 0.224633 14.1417 0.0729354 13.3703 0.0569995C12.3798 0.0110322 12.062 0 9.53917 0Z"
                  fill="#27272A"
                />
                <path
                  d="M9.53615 4.69531C8.59215 4.69531 7.66934 4.98604 6.88443 5.53074C6.09952 6.07543 5.48776 6.84963 5.12651 7.75542C4.76525 8.66122 4.67073 9.65793 4.8549 10.6195C5.03906 11.5811 5.49364 12.4644 6.16116 13.1576C6.82867 13.8509 7.67913 14.323 8.60499 14.5143C9.53086 14.7056 10.4905 14.6074 11.3627 14.2322C12.2348 13.857 12.9803 13.2216 13.5047 12.4065C14.0292 11.5913 14.3091 10.6329 14.3091 9.65243C14.3091 8.33772 13.8063 7.07686 12.9111 6.14722C12.016 5.21758 10.802 4.69531 9.53615 4.69531ZM9.53615 12.8701C8.92339 12.8701 8.32439 12.6814 7.8149 12.3279C7.3054 11.9743 6.9083 11.4718 6.67381 10.8838C6.43931 10.2958 6.37796 9.64886 6.4975 9.02468C6.61705 8.40051 6.91212 7.82717 7.34541 7.37716C7.7787 6.92716 8.33074 6.6207 8.93173 6.49654C9.53271 6.37239 10.1557 6.43611 10.7218 6.67965C11.2879 6.92319 11.7718 7.33561 12.1122 7.86476C12.4526 8.39391 12.6343 9.01602 12.6343 9.65243C12.6343 10.5058 12.3079 11.3243 11.7269 11.9277C11.1459 12.5311 10.3578 12.8701 9.53615 12.8701Z"
                  fill="#27272A"
                />
                <path
                  d="M14.5011 5.65855C15.1171 5.65855 15.6164 5.13993 15.6164 4.50017C15.6164 3.86042 15.1171 3.3418 14.5011 3.3418C13.8851 3.3418 13.3857 3.86042 13.3857 4.50017C13.3857 5.13993 13.8851 5.65855 14.5011 5.65855Z"
                  fill="#27272A"
                />
              </svg>
            </Link>

            <Link
              target="_blank"
              href={"https://www.facebook.com/people/Hyyfam/61576204471387/"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="10"
                height="19"
                viewBox="0 0 10 19"
                fill="none"
              >
                <path
                  d="M3.13403 18.3281V10.4144H0.569824V7.33021H3.13403V5.05575C3.13403 2.41626 4.68625 0.979004 6.95339 0.979004C8.03938 0.979004 8.97273 1.06298 9.24473 1.10051V3.85894L7.67234 3.85968C6.43934 3.85968 6.20061 4.46818 6.20061 5.36113V7.33021H9.14119L8.75832 10.4144H6.2006V18.3281H3.13403Z"
                  fill="#18181B"
                />
              </svg>
            </Link>

            <Link target="_blank" href={"https://www.youtube.com/@hyyfam"}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="14"
                viewBox="0 0 20 14"
                fill="none"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M8.42707 9.11169V3.77761C10.3207 4.66864 11.7873 5.5294 13.5218 6.45741C12.0912 7.25081 10.3207 8.14103 8.42707 9.11169ZM18.9802 1.12472C18.6535 0.69437 18.0968 0.359377 17.5041 0.248472C15.762 -0.0823532 4.8936 -0.0832942 3.15242 0.248472C2.67712 0.337572 2.25389 0.552942 1.89032 0.887559C0.358385 2.30943 0.83842 9.93444 1.20767 11.1696C1.36295 11.7042 1.56368 12.0898 1.81648 12.3429C2.14218 12.6775 2.58812 12.9079 3.10034 13.0112C4.53475 13.3079 11.9246 13.4738 17.4738 13.0557C17.9851 12.9666 18.4376 12.7288 18.7946 12.38C20.211 10.9638 20.1144 2.91059 18.9802 1.12472Z"
                  fill="black"
                />
              </svg>
            </Link>

            <Link target="_blank" href={"https://x.com/hyyfam_"}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="14"
                viewBox="0 0 16 14"
                fill="none"
              >
                <path
                  d="M15.57 1.71101C14.995 1.97639 14.3882 2.14225 13.7494 2.24177C14.3882 1.8437 14.8992 1.21343 15.1228 0.450468C14.5159 0.815363 13.8452 1.08074 13.1106 1.2466C12.5357 0.616329 11.7052 0.218262 10.8109 0.218262C9.08615 0.218262 7.68079 1.67784 7.68079 3.46915C7.68079 3.73452 7.71273 3.96673 7.77661 4.19894C5.18947 4.06625 2.85785 2.77253 1.29279 0.782191C1.03727 1.27978 0.877569 1.81053 0.877569 2.40763C0.877569 3.53549 1.42055 4.53066 2.28293 5.12776C1.77189 5.09459 1.29279 4.9619 0.845629 4.72969V4.76287C0.845629 6.35513 1.93159 7.68203 3.36889 7.98058C3.11337 8.04692 2.82591 8.08009 2.53845 8.08009C2.34681 8.08009 2.12323 8.04692 1.93159 8.01375C2.34681 9.30747 3.49665 10.2695 4.87007 10.2695C3.78411 11.1319 2.44263 11.6627 0.973389 11.6627C0.717869 11.6627 0.462349 11.6627 0.23877 11.6295C1.64413 12.5584 3.27307 13.0891 5.06171 13.0891C10.8428 13.0891 14.0049 8.11327 14.0049 3.80087C14.0049 3.66818 14.0049 3.50232 14.0049 3.36963C14.6118 2.93839 15.1547 2.37446 15.57 1.71101Z"
                  fill="#27272A"
                />
              </svg>
            </Link>
          </div>
        </div>
      </footer>
      <SlideUpModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedStore(null); // Clear selected store when closing
        }}
        selectedStore={selectedStore}
      >
        {
          <div className="min-h-[75vh] flex flex-col items-center justify-start px-[15px] overflow-scroll [&::-webkit-scrollbar]:hidden scroll-smooth pb-20">
            <div className="flex flex-col items-center justify-start gap-4 pb-10  ">
              <div
                className="wifull flex items-center justify-center"
              >
                <img
                  src={selectedStore?.img_url}
                  alt={selectedStore?.store_name}
                  className="h-[50px] w-[90%] flex items-center"
                />
              </div>

              <p className="text-center text-[#000] text-[12px] font-regular font-inter leading-[19px] w-full mb-[11px]  px-2">
                Order Date: <span className="font-bold">Today -----</span>{" "}
                Cashback Tracks in:{" "}
                <span className="font-bold">48 Hours -----</span> Estimated
                Payment by: <span className="font-bold">40-45 days</span>
              </p>

              <div className="w-full flex flex-col items-center justify-center gap-7">
                {/* Tabs container */}
                <div className="flex items-center justify-start w-full overflow-x-scroll [&::-webkit-scrollbar]:hidden  scroll-smooth">
                  {Array.isArray(descriptionType) &&
                    descriptionType?.map((description) => (
                      <button
                        key={description.id}
                        onClick={() =>
                          handleTabClickDescription(description.title)
                        }
                        className={`px-[12px] pt-[13px] pb-1.5 text-[12px] w-full font-normal font-inter text-center cursor-pointer transition-all duration-200 whitespace-nowrap ${
                          activeDescription === description.title
                            ? "border-b-[3px] border-b-[rgba(222,44,109,1)] text-[rgba(222,44,109,1)]"
                            : "border-b-[3px] border-b-[#000]"
                        }`}
                      >
                        {description.title}
                      </button>
                    ))}
                </div>

                <div className="w-full">
                  {activeDescription === "Commission Rate" && (
                    <div
                      style={{
                        boxShadow: "-1px 2px 4px 0px rgba(0, 0, 0, 0.25)",
                      }}
                      className="border-[3px] border-[#fff] bg-[#f9f9f9] rounded-[8px] max-h-[200px] overflow-y-scroll w-full "
                    >
                      {Array.isArray(commissionRates) &&
                        commissionRates?.map((commission: any, index) => (
                          <div
                            key={index}
                            className={`${
                              index == 0
                                ? "rounded-t-[8px]"
                                : index === commissionRates.length - 1
                                ? "rounded-b-[8px]"
                                : ""
                            } border-b-[0.5px] border-b-[#c2c2c2] bg-[#f9f9f9] px-[14px] py-[11px] w-full flex items-center justify-between gap-5`}
                          >
                            <p className="w-full text-[10px] font-normal font-inter leading-3 text-[#000]">
                              {commission.description}
                            </p>

                            <p className="text-[rgba(222,44,109,1)] text-right leading-[19px] text-[12px] font-medium font-inter">
                              {commission?.cb_rate
                                .replace(/diamonds/gi, "")
                                .trim()}
                            </p>
                          </div>
                        ))}
                    </div>
                  )}
                  {activeDescription === "Terms & Conditions" && (
                    <div
                      style={{
                        boxShadow: "-1px 2px 4px 0px rgba(0, 0, 0, 0.25)",
                      }}
                      className="border-[3px] border-[#fff] bg-[#f9f9f9] rounded-[8px] max-h-[200px] overflow-y-scroll w-full px-[14px] pl-[30px] py-[11px]"
                    >
                      <ol className="list-decimal text-[12px] text-[#000] font-inter font-normal leading-3.5 space-y-1">
                        {Array.isArray(terms) &&
                          terms?.map((tip: string, index: number) => (
                            <li key={index}>
                              {" "}
                              {tip.replace(/hyyzo/gi, (match) =>
                                match === "Hyyzo" ? "Hyyfam" : "hyyfam"
                              )}
                            </li>
                          ))}
                      </ol>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div
              style={{
                boxShadow: "0px 2px 12.6px 0px rgba(0, 0, 0, 0.25)",
              }}
              className="w-full fixed bottom-0 max-w-[448px] mx-auto px-[15px] py-[21px] rounded-t-[14px] bg-[#fff] z-50 "
            >
              <button
                onClick={() => redirectToStore(selectedStore)}
                className={
                  " py-3 w-full rounded-[7px] text-white text-[16px] font-semibold font-inter leading-normal bg-[rgba(222,44,109,1)] hover:bg-[#e03d73] transition-color cursor-pointer disabled:bg-gray-500"
                }
                type="button"
                disabled={!selectedStore?.active}
              >
                {selectedStore?.active ? (
                  <>Visit {selectedStore?.store_name || "Store"}</>
                ) : (
                  <>Store not active</>
                )}
              </button>
            </div>
          </div>
        }
      </SlideUpModal>
    </>
  );
};

export default PartnersCarousel;
