"use client";
import React, { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useLazyStoresbycatQuery, useGetStoreSchemaMutation, useLazyGetStoreDescriptionQuery } from "@/redux/api/productsApi";
import { useSelector } from 'react-redux';

interface SlideUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  // profileComplete: boolean;
  children: React.ReactNode;
  selectedStore?: any;
}

interface StoresInfo {
  name: string;
  bgColor: string;
  commission: string;
  logo: ReactNode;
}

interface URLInputProps {
  initialValue?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  onClear?: () => void;
  debounceMs?: number;
  value: string;
  // setValue: (value: string) => void;
}

interface StoreType {
  id: number;
  title: string;
}

interface CommisionRates {
  title: string;
  rate: number;
}

interface LoadingDotsProps {
  size?: "sm" | "md" | "lg";
  color?: string;
  className?: string;
}

const LoadingDots: React.FC<LoadingDotsProps> = ({
  size = "md",
  color = "#ff69b4",
  className = "",
}) => {
  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  const gapClasses = {
    sm: "gap-1",
    md: "gap-2",
    lg: "gap-3",
  };

  return (
    <div
      className={`flex items-center justify-center ${gapClasses[size]} ${className}`}
    >
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={`${sizeClasses[size]} rounded-full animate-pulse`}
          style={{
            backgroundColor: color,
            animationDelay: `${index * 0.2}s`,
            animationDuration: "1.4s",
          }}
        />
      ))}
    </div>
  );
};

const SlideUpModal: React.FC<SlideUpModalProps> = ({
  isOpen,
  onClose,
  children,
  selectedStore, // Add this prop
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="absolute inset-0 z-70 flex flex-col justify-end  [&::-webkit-scrollbar]:hidden scroll-smooth max-w-[448px] mx-auto">
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

const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const index = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("All");
  const [value, setValue] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedStore, setSelectedStore] = useState<any>(null);
  const [activeDescription, setActiveDescription] = useState<string>("Commission Rate");
  const [redirectionActive, setRedirectionActive] = useState<boolean>(false);
  const [stores, setStores] = useState([])
  const [savedStores, setSavedStores] = useState([])
  const [commissionRates, setCommissionRates] = useState([])
  const [terms, setTerms] = useState([])
  const [query, setQuery] = useState('');

  const [trigger, { data, isLoading }] = useLazyStoresbycatQuery();
  const [getStoreSchema, getStoreSchemaState] = useGetStoreSchemaMutation()
  const [storeDescTrigger, storeDescTriggerState] = useLazyGetStoreDescriptionQuery()

  const cachedData = useSelector((state: any) =>
    state.products
  );

  useEffect(() => {
    getStores()
  }, [])

  const getStores = async () => {
    const res: any = await trigger({ cat: "all" })
    setStores(res.data)
    setSavedStores(res.data)
  }

  const storeType: StoreType[] = [
    { id: 1, title: "All" },
    { id: 2, title: "Popular" },
  ];

  const descriptionType: StoreType[] = [
    { id: 1, title: "Commission Rate" },
    { id: 2, title: "Terms & Conditions" },
  ];

  useEffect(() => {
    if (!query) {
      setStores(savedStores);
    } else {
      setStores(
        savedStores.filter((item: any) =>
          item.store_name.toLowerCase().includes(query.toLowerCase())
        )
      );
    }
  }, [query, savedStores]);



  const handleTabClick = async (title: string) => {
    setActiveTab(title);
    if (title == "Popular") {
      if (!cachedData?.queries['storesbycat({"cat":"trend_stores"})']?.data?.length) {
        const res: any = await trigger({ cat: "trend_stores" })
        setStores(res.data)
        setSavedStores(res.data)
      }
      else {
        setStores(cachedData?.queries['storesbycat({"cat":"trend_stores"})']?.data)
        setSavedStores(cachedData?.queries['storesbycat({"cat":"trend_stores"})']?.data)
      }
    }
    else {
      if (!cachedData?.queries['storesbycat({"cat":"all"})']?.data?.length) {
        const res: any = await trigger({ cat: "all" })
        setStores(res.data)
        setSavedStores(res.data)
      }
      else {
        setStores(cachedData?.queries['storesbycat({"cat":"all"})']?.data)
        setSavedStores(cachedData?.queries['storesbycat({"cat":"all"})']?.data)
      }
    }
  };

  const handleTabClickDescription = (title: string) => {
    setActiveDescription(title);
  };

  const handleStoreClick = async (store: any) => {
    const queryKey = `getStoreDescription({"store_page_url":"${store.store_page_url}"})`;
    const cachedEntry = cachedData?.queries?.[queryKey]?.data
    if (cachedEntry?.length) {
      const data = cachedEntry[0];
      const tips = JSON.parse(data.tips || "[]");
      const description = JSON.parse(data.description || "[]");
      setCommissionRates(description);
      setTerms(tips);
      setSelectedStore(store);
      setIsModalOpen(true);
      return;
    }
    const res = await storeDescTrigger({ store_page_url: store.store_page_url });
    const data = res.data[0];
    const tips = JSON.parse(data.tips || "[]");
    const description = JSON.parse(data.description || "[]");
    setCommissionRates(description);
    setTerms(tips);
    setSelectedStore(store);
    setIsModalOpen(true);
};

  const redirectToStore = async (store: any) => {
    window.open(`/redirect/seller/${store.store_page_url}?name=${store.store_name}&img_url=${store.img_url}`, '_blank')
  }

  return (
    <div className="min-h-screen font-inter">
      {/* Grid of products */}
      <div className="pb-20 flex flex-col items-center justify-start w-full">
        <div className="w-full flex items-center justify-start gap-[14px] py-[18px] border-b-[1px] border-b-[#f0f2f5] px-[15px]">
          <svg
            onClick={() => router.push("/home")}
            className="cursor-pointer"
            xmlns="http://www.w3.org/2000/svg"
            width="21"
            height="21"
            viewBox="0 0 21 21"
            fill="none"
          >
            <path
              d="M2.17678 10.5L20.999 10.5"
              stroke="black"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="M9.88867 19.3888L1.58351 11.0836C1.2612 10.7613 1.26126 10.2386 1.58364 9.91622L9.88867 1.61118"
              stroke="black"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>

          <p className="m-0 text-[#000] text-[18px] font-semibold leading-normal font-inter ">
            Brands
          </p>
        </div>

        <div className="px-[15px] py-3 w-full flex flex-col items-center justify-center gap-4.5 ">
          <input
            type="text"
            placeholder="Search stores..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ padding: '0.5rem', width: '100%', }}
          />

          <div className="w-full flex flex-col items-center justify-center gap-6">
            {/* Tabs container */}
            <div className="flex items-center justify-start w-full overflow-x-scroll [&::-webkit-scrollbar]:hidden  scroll-smooth">
              {storeType.map((store) => (
                <button
                  key={store.id}
                  onClick={() => handleTabClick(store.title)}
                  className={`px-[12px] py-[13px] text-[12px] w-full font-normal font-inter text-center cursor-pointer transition-all duration-200 whitespace-nowrap ${activeTab === store.title
                    ? "border-b-[3px] border-b-[rgba(222,44,109,1)] text-[rgba(222,44,109,1)]"
                    : "border-b-[3px] border-b-[#dadada]"
                    }`}
                >
                  {store.title}
                </button>
              ))}
            </div>

            <div className="w-full">
              {activeTab === "All" && (
                <div className="grid grid-cols-2 gap-[14px] items-center justify-center w-full ">
                  {stores.map((store: any, index: number) => (
                    <div
                      key={index}
                      onClick={() => handleStoreClick(store)}
                      style={{
                        background: store.bgColor ? store.bgColor : "#fff",
                        boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.20)",
                      }}
                      className={`w-full h-[90px] cursor-pointer py-3 rounded-sm border-[1px] border-[#f7f7f7] flex flex-col  items-center justify-end gap-1 relative overflow-hidden `}
                    >
                      <img src={store.img_url} alt={store.store_name} className=" object-contain w-[50%] h-[50px] " />
                      <div className="w-[110%]  bg-[#fff]  text-[#000] text-[10px] font-medium font-inter flex items-center justify-center leading-2 py-1">
                        {store.cashback_upto}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === "Popular" && (
                <div className="grid grid-cols-2 gap-[14px] items-center justify-center w-full ">
                  {stores.map((store: any, index: number) => (
                    <div
                      key={index}
                      onClick={() => handleStoreClick(store)}
                      style={{
                        background: store.bgColor ? store.bgColor : "#fff",
                        boxShadow: "0px 0px 2px 0px rgba(0, 0, 0, 0.20)",
                      }}
                      className={`w-full h-[90px] cursor-pointer py-3 rounded-sm border-[1px] border-[#f7f7f7] flex flex-col  items-center justify-end gap-1 relative overflow-hidden`}
                    >
                      <img src={store.img_url} alt={store.store_name} className="object-contain w-[50%] h-[66px]" />
                      <div className="w-[110%]  bg-[#fff]  text-[#000] text-[10px] font-medium font-inter flex items-center justify-center leading-2 py-1">
                        {store.cashback_upto}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <SlideUpModal
          // profileComplete={false}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedStore(null); // Clear selected store when closing
          }}
          selectedStore={selectedStore}
        >
          {!redirectionActive && (
            <div className="min-h-[75vh] flex flex-col items-center justify-end px-[15px] overflow-scroll [&::-webkit-scrollbar]:hidden scroll-smooth pb-20">
              <div className="flex flex-col items-center justify-start gap-4 min-h-[75vh] ">
                <div
                  style={{
                    // background: selectedStore?.bgColor,
                  }}
                  className="wifull flex items-center justify-center"
                >
                  <img src={selectedStore?.img_url} alt={selectedStore?.store_name} className="h-[50px] w-[50%] flex items-center" />
                </div>

                <p className="text-center text-[#000] text-[12px] font-regular font-inter leading-[19px] w-full mb-[11px]  px-2">
                  Order Date: <span className="font-bold">Today -----</span>{" "}
                  Cashback Tracks in:{" "}
                  <span className="font-bold">48 Hours -----</span> Estimated
                  Payment by: <span className="font-bold">40-45 days</span>
                </p>

                <div className="w-full flex flex-col items-center justify-center gap-5">
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
                        {Array.isArray(commissionRates) && commissionRates.map((commission: any, index) => (
                          <div
                            key={index}
                            className={`${index == 0
                              ? "rounded-t-[8px]"
                              : index === commissionRates.length - 1
                                ? "rounded-b-[8px]"
                                : ""
                              } border-b-[0.5px] border-b-[#c2c2c2] bg-[#f9f9f9] px-[14px] py-[11px] w-full flex items-center justify-between gap-2.5`}
                          >
                            <p className="w-full text-[10px] font-normal font-inter leading-3 text-[#000]">
                              {commission.description}
                            </p>

                            <p className="text-[rgba(222,44,109,1)] text-right leading-[19px] text-[12px] font-medium font-inter">
                              {commission.cb_rate}
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
                          {
                            Array.isArray(terms) && terms.map((tip: string, index: number) => (
                              <li key={index}>{tip}</li>
                            ))
                          }
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
                  {
                    selectedStore?.active ? (
                      <>Visit {selectedStore?.store_name || "Store"}</>
                    ) : (
                      <>Store not active</>
                    )
                  }
                </button>
              </div>
            </div>
          )}

          {redirectionActive && (
            <div className="h-[90vh] flex flex-col items-center justify-center px-[15px]">
              <p className="w-[60%] mx-auto text-[18px] font-bold font-inter text-[#000] text-center">
                Hyyfam is taking you to {selectedStore?.name}
              </p>
              <div className="mt-11 flex items-center justify-center w-full gap-2.5">
                <svg
                  className="scale-110"
                  xmlns="http://www.w3.org/2000/svg"
                  width="76"
                  height="76"
                  viewBox="0 0 76 76"
                  fill="none"
                >
                  <circle cx="38" cy="38" r="38" fill="#F1437E" />
                  <path
                    d="M60.1731 22.2624C60.1728 21.588 60.0619 20.9182 59.8447 20.2791C59.141 18.2493 56.9126 16.8708 54.9598 17.278V36.2038C50.157 30.9692 44.4687 28.2065 37.5665 28.2182C36.4797 28.2222 35.3944 28.298 34.3177 28.445C29.4797 29.1139 25.2868 31.2949 21.5923 34.8428L21.563 34.8719L21.1525 35.2732L21.0939 35.3372L20.6834 35.7559L20.6482 35.7908L20.2729 36.198V17.2663H20.2025V17.214C19.9235 17.1907 19.643 17.1907 19.3639 17.214C18.4753 17.2927 17.6282 17.6236 16.9242 18.1672C16.2201 18.7108 15.6888 19.444 15.3938 20.2791C15.3536 20.3815 15.3203 20.4864 15.2942 20.5932C15.1299 21.1266 15.0469 21.6814 15.0479 22.2392C15.0479 27.4776 15.0479 32.7121 15.0479 37.9428V59.3346C15.0479 59.6255 15.0479 59.9163 15.0479 60.1896C15.1185 60.8795 15.3386 61.5461 15.6929 62.1438C16.0011 62.6821 16.4136 63.1546 16.9068 63.5339C17.4015 63.9319 17.9779 64.2177 18.5957 64.3714C19.0445 64.4955 19.5079 64.56 19.9738 64.5634C22.3195 64.5924 24.6652 64.5634 26.9757 64.5634C24.7543 62.5959 22.9588 60.2017 21.6979 57.5258C19.9546 53.5794 19.7623 49.129 21.1588 45.0492C22.5553 40.9693 25.4397 37.5549 29.2452 35.4767L29.3683 35.4128L29.5266 35.3255C31.7935 34.1348 34.3 33.4616 36.8628 33.3549C39.4257 33.2482 41.9802 33.7109 44.3397 34.709C46.4643 35.5997 48.3896 36.8999 50.0038 38.5341C51.618 40.1684 52.8891 42.1042 53.7433 44.2293C54.5975 46.3544 55.018 48.6265 54.9801 50.914C54.9423 53.2014 54.4471 55.4587 53.5231 57.5549C52.2622 60.2308 50.4666 62.625 48.2453 64.5924C50.591 64.5924 52.9367 64.5924 55.2413 64.5924C55.9005 64.6014 56.5546 64.4778 57.1643 64.2291C57.774 63.9803 58.3265 63.6116 58.7885 63.1453C59.2505 62.6789 59.6124 62.1245 59.8524 61.5155C60.0924 60.9066 60.2055 60.2557 60.1848 59.6022C60.177 47.1517 60.1731 34.7051 60.1731 22.2624Z"
                    fill="white"
                  />
                  <path
                    d="M31.5693 52.1003V64.5924H26.4514C26.3977 64.39 26.3632 64.1841 26.3483 63.9768C26.3483 60.031 26.2903 53.6506 26.387 49.7104C26.4057 47.0042 27.4544 44.3792 29.3698 42.2443C31.2852 40.1094 33.9598 38.5844 36.9772 37.9066C41.9662 36.6753 48.4054 38.4048 51.1577 41.6789L47.5224 44.8132C44.6734 42.2442 41.2056 41.2703 37.1577 42.6919C35.9289 43.116 34.8288 43.7797 33.9425 44.6318C33.0562 45.4838 32.4074 46.5015 32.0463 47.606H45.5307V52.0835L31.5693 52.1003Z"
                    fill="white"
                  />
                  <path
                    d="M47.7731 23.9674C49.6429 23.9674 51.1586 22.4517 51.1586 20.582C51.1586 18.7123 49.6429 17.1965 47.7731 17.1965C45.9034 17.1965 44.3877 18.7123 44.3877 20.582C44.3877 22.4517 45.9034 23.9674 47.7731 23.9674Z"
                    fill="white"
                  />
                </svg>

                <LoadingDots size="md" />

                <div
                  style={{
                    background: selectedStore?.bgColor,
                  }}
                  className="max-w-fit p-5 rounded-full"
                >
                  <div className="w-16 h-16 flex items-center">
                    {selectedStore?.logo}
                  </div>
                </div>
              </div>

              <p className="mt-5.5 w-[85%] mx-auto text-center text-[15px] text-[#000] leading-5 font-medium font-inter">
                Hyyfam is opening your {selectedStore?.name} experience...
              </p>

              <p className="mt-[13px] w-[85%] mx-auto text-center text-[14px] text-[#000] leading-5 font-normal font-inter">
                Make your purchase on {selectedStore?.name} through Hyyfam. Commission
                will be credited to your account after order confirmation.
              </p>
            </div>
          )}
        </SlideUpModal>
      </div>
    </div>
  );
};

export default index;