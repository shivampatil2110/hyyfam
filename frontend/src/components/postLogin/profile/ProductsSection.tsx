"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  useGetRecentLinksQuery,
  useLazyGetRecentLinksQuery,
} from "@/redux/api/collectionApi";
import { toggleModal } from "@/redux/features/authSlice";
import { useDispatch } from "react-redux";
import { useAppSelector } from "@/redux/store";
import LoadingSpinner from "../LoadingStatesAndModals/LoadingSpinner";
import { copyToClipboard } from "@/utils/common_functions";
interface ProductDetails {
  storeImg: string;
  productImg: string;
  title: string;
  date: string;
  price: string;
  orderAmount: string;
  orderComission: string;
  clicks: string;
  views: string;
  order: string;
}

interface URLInputProps {
  initialValue?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  onClear?: () => void;
  debounceMs?: number;
  value: string;
  setValue: (value: string) => void;
}

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

const URLInput = ({
  initialValue = "",
  placeholder = "https://",
  onChange,
  onClear,
  debounceMs = 500,
  value,
  setValue,
}: URLInputProps) => {
  const debouncedValue = useDebounce(value, debounceMs);

  // Trigger onChange when debounced value changes
  useEffect(() => {
    if (onChange) {
      onChange(debouncedValue);
    }
  }, [debouncedValue, onChange, initialValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const handleClear = () => {
    setValue("");
    onClear?.();
  };

  return (
    <div className="flex items-center w-full h-[38px] px-[7px] py-3 bg-[#f8f9fa] rounded-[5px] ">
      {/* Link Icon */}
      <div className="flex-shrink-0 mr-2 ">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
        >
          <circle cx="5.16681" cy="5.16663" r="4.16681" stroke="black" />
          <path
            d="M10.9986 11.0002L8.2207 8.22229"
            stroke="black"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Input Field */}
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="flex-grow outline-none text-sm text-[#000] bg-transparent "
      />

      {/* Clear button - only show when there's text */}
      {value && (
        <button
          onClick={handleClear}
          className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600"
          type="button"
        >
          ×
        </button>
      )}
    </div>
  );
};

const ProductsContent: React.FC = () => {
  const router = useRouter();
  const limit = 10;
  const reachedEnd = useRef(false);
  const [value, setValue] = useState("");
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<any>([]);
  const [hasMore, setHasMore] = useState(false);
  const [currentSearchTerm, setCurrentSearchTerm] = useState("");
  const [isNewSearch, setIsNewSearch] = useState(false);
  const isInitialLoad = useRef(true);
  const isFirstRender = useRef(true);

  const lastItemRef = useRef<HTMLDivElement | null>(null);

  const queryParams = useMemo(() => {
    const params: any = { page };
    if (currentSearchTerm.trim()) {
      params.search = currentSearchTerm.trim();
    }
    return params;
  }, [page, currentSearchTerm]);

  const {
    data = [],
    error,
    isLoading,
    isFetching,
  } = useGetRecentLinksQuery(queryParams);

  const [getRecentProducts] = useLazyGetRecentLinksQuery();

  const {
    isInstaAuthenticated,
    isInstagramFollowersSatisfied,
    isInstagramPermissionsSatisfied,
  } = useAppSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!data) return;

    // Handle empty results
    if (data.length === 0 && value == "") {
      setHasMore(false);
      reachedEnd.current = true;
      return;
    }

    // Handle data with results
    setProducts((prev: any) => {
      // If it's a new search, replace all products
      if (value != "" && data.length && page == 1) {
        setIsNewSearch(false);
        return data;
      }

      if (value != "" && !data.length && page == 1) {
        setIsNewSearch(false);
        return [];
      }

      if (value == "" && data.length && !isNewSearch) {
        return data;
      }

      // Otherwise, append new products (infinite loading)
      const existingIds = new Map(prev.map((item: any) => [item.id, true]));
      const newUniqueItems = data.filter(
        (item: any) => !existingIds.has(item.id)
      );
      return [...prev, ...newUniqueItems];
    });

    // Update pagination state
    if (data.length < limit) {
      setHasMore(false);
      reachedEnd.current = true;
    } else {
      setHasMore(true);
      reachedEnd.current = false;
    }

    // Mark initial load complete
    isInitialLoad.current = false;
  }, [data, limit, isNewSearch]);

  useEffect(() => {
    if (isFetching || reachedEnd.current) return;

    const options = {
      root: null,
      rootMargin: "100px",
      threshold: 0.1,
    };

    const handleObserver = (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && !isFetching && !reachedEnd.current) {
        setPage((prev) => prev + 1);
      }
    };

    const observerInstance = new IntersectionObserver(handleObserver, options);
    if (lastItemRef.current) {
      observerInstance.observe(lastItemRef.current);
    }

    return () => {
      if (lastItemRef.current) {
        observerInstance.unobserve(lastItemRef.current);
      }
    };
  }, [isFetching, hasMore, page, products.length]);

  useEffect(() => {
    if (isFirstRender.current) {
      setTimeout(() => {
        if (
          products.length > 0 &&
          !isFetching &&
          !reachedEnd.current &&
          lastItemRef.current
        ) {
          const rect = lastItemRef.current.getBoundingClientRect();
          const windowHeight =
            window.innerHeight || document.documentElement.clientHeight;

          const isNearOrInViewport = rect.top <= windowHeight + 300;

          if (isNearOrInViewport) {
            setPage((prev) => prev + 1);
          }
        }
        isFirstRender.current = false;
      }, 100);
    }
  }, [products.length, isFetching]);

  useEffect(() => {
    if (value.trim() === "") {
      handleURLClear();
    }
  }, [value]);

  const handleURLClear = () => {
    // Reset to normal mode (no search)
    setCurrentSearchTerm("");
    setPage(1);
    setIsNewSearch(false);
    reachedEnd.current = false;
    setHasMore(true);
  };

  const handleSearch = useCallback(async (searchValue: string) => {
    const trimmedValue = searchValue.trim();

    if (trimmedValue == "") {
      setCurrentSearchTerm("");
      setPage(1);
      setIsNewSearch(true);
      reachedEnd.current = false;
      setHasMore(true);
      return;
    }

    setCurrentSearchTerm(trimmedValue);
    setPage(1);
    setIsNewSearch(true);
    reachedEnd.current = false;
    setHasMore(true);
  }, []);

  if (isLoading) {
    return <LoadingSpinner isOpen={true} />
  }

  return (
    <div className="w-full min-h-[95vh] px-[15px]">
      {(products.length || value != "") && (
        <div className="flex flex-col items-center justify-center w-full pb-25">
          <div className="bg-[#fff] w-full py-5  sticky top-[31px] z-50 flex items-center justify-center gap-3">
            <URLInput
              initialValue=""
              placeholder="Search Product..."
              onChange={handleSearch}
              onClear={handleURLClear}
              debounceMs={500}
              value={value}
              setValue={setValue}
            />

            {/* <div className="px-2 flex items-center justify-center gap-[5px] border-[0.5px] border-[#000] rounded-[7px] h-[35px] cursor-pointer">
              <div className="flex items-center justify-center gap-[5px]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="7"
                  height="10"
                  viewBox="0 0 7 10"
                  fill="none"
                >
                  <path
                    d="M1.3125 9.5H2.1875V2.75H3.5L1.75 0.5L0 2.75H1.3125V9.5ZM7 7.25H5.6875V0.5H4.8125V7.25H3.5L5.25 9.5L7 7.25Z"
                    fill="black"
                  />
                </svg>

                <p className="text-[12px] text-[#000] font-medium font-inter leading-[20px]">
                  {" "}
                  Sort
                </p>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="11"
                height="6"
                viewBox="0 0 11 6"
                fill="none"
              >
                <path d="M1 0.75L6 5.25L10.5 0.75" stroke="black" />
              </svg>
            </div> */}
          </div>
          <div className="flex flex-col items-start justify-start gap-[11px] overflow-scroll [&::-webkit-scrollbar]:hidden  scroll-smooth w-full">
            {products.map((product: any, index: number) => (
              <div
                key={product.id}
                ref={index === products.length - 1 ? lastItemRef : null}
                className="flex flex-col items-center justify-center rounded-[7px] border-[1px] border-[#eaeaea] w-full relative "
              >
                <div className="w-full flex items-center justify-center gap-[10px] px-2 pt-2 pb-1">
                  <div className="flex items-center justify-center mb-[14px] relative h-[100px] w-[100px] ">
                    <Image
                      className="h-full max-h-[90px] min-h-[90px] object-contain"
                      src={product.img_url}
                      alt="product"
                      height={100}
                      width={140}
                    />
                    <Image
                      className="absolute left-[35%] bottom-[-12px]"
                      src={product.store_img}
                      alt="store"
                      height={20}
                      width={30}
                    />
                  </div>

                  <div className="flex flex-col items-start justify-center w-full">
                    <div className="flex flex-col items-start justify-center mb-2">
                      <h2 className="text-[#000] text-[14px] font-semibold font-inter leading-[119%] ellipsis line-clamp-1 overflow-hidden ">
                        {product.name}
                      </h2>
                      <p className="text-[10px] text-[#787878] ">
                        {new Date(product.created_at).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            // hour: "2-digit",
                            // minute: "2-digit",
                            // hour12: true,
                          }
                        )}
                      </p>
                    </div>
                    <div className="flex flex-col items-start justify-center gap-1">
                      {/* <p className="m-0 text-[#000] text-[12px] font-medium font-inter leading-[120%]">
                        ₹{"N/A"}
                      </p> */}
                      {/* <div className="flex items-center justify-start gap-[7px]">
                        <div className="border-[0.5px] border-[#000] px-[6px] py-1 rounded-[3px] flex flex-col items-start justify-center gap-1 min-w-[55px]">
                          <div className="flex items-center justify-start gap-1">
                            <p className="text-[10px] text-[#6b6565] font-regular font-inter leading-[120%] ">
                              Clicks
                            </p>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="10"
                              height="10"
                              viewBox="0 0 6 6"
                              fill="none"
                            >
                              <path
                                d="M2.45596 0C2.50312 0 2.54834 0.0200135 2.58169 0.0556377C2.61504 0.0912619 2.63377 0.139579 2.63377 0.189959V0.949794C2.63377 1.00017 2.61504 1.04849 2.58169 1.08412C2.54834 1.11974 2.50312 1.13975 2.45596 1.13975C2.4088 1.13975 2.36357 1.11974 2.33022 1.08412C2.29688 1.04849 2.27814 1.00017 2.27814 0.949794V0.189959C2.27814 0.139579 2.29688 0.0912619 2.33022 0.0556377C2.36357 0.0200135 2.4088 0 2.45596 0ZM1.07256 0.611667C1.08908 0.593977 1.1087 0.579942 1.1303 0.570366C1.15191 0.560789 1.17507 0.55586 1.19845 0.55586C1.22184 0.55586 1.245 0.560789 1.2666 0.570366C1.28821 0.579942 1.30783 0.593977 1.32435 0.611667L1.82721 1.14925C1.84419 1.16677 1.85773 1.18774 1.86705 1.21091C1.87637 1.23409 1.88128 1.25901 1.88148 1.28424C1.88169 1.30946 1.87719 1.33447 1.86825 1.35782C1.85931 1.38116 1.8461 1.40237 1.82941 1.42021C1.81271 1.43804 1.79286 1.45215 1.77101 1.4617C1.74916 1.47125 1.72574 1.47606 1.70213 1.47584C1.67852 1.47562 1.65519 1.47038 1.63349 1.46042C1.6118 1.45047 1.59218 1.436 1.57578 1.41785L1.07292 0.880649C1.03958 0.845027 1.02086 0.796719 1.02086 0.746348C1.02086 0.695978 1.03958 0.64767 1.07292 0.612047M3.83971 0.612047C3.85627 0.629693 3.8694 0.650655 3.87837 0.673733C3.88733 0.696811 3.89195 0.721552 3.89195 0.746538C3.89195 0.771524 3.88733 0.796265 3.87837 0.819343C3.8694 0.842421 3.85627 0.863383 3.83971 0.881029L3.33578 1.41785C3.31938 1.436 3.29976 1.45047 3.27806 1.46042C3.25637 1.47038 3.23304 1.47562 3.20943 1.47584C3.18582 1.47606 3.1624 1.47125 3.14055 1.4617C3.1187 1.45215 3.09884 1.43804 3.08215 1.42021C3.06545 1.40237 3.05225 1.38116 3.04331 1.35782C3.03437 1.33447 3.02987 1.30946 3.03007 1.28424C3.03028 1.25901 3.03518 1.23409 3.0445 1.21091C3.05382 1.18774 3.06737 1.16677 3.08435 1.14925L3.58721 0.612047C3.62056 0.576436 3.66577 0.55643 3.71292 0.55643C3.76007 0.55643 3.80529 0.576436 3.83864 0.612047M0.5 2.08955C0.5 2.03917 0.518734 1.99085 0.552081 1.95523C0.585427 1.9196 0.630655 1.89959 0.677814 1.89959H1.38907C1.43623 1.89959 1.48146 1.9196 1.5148 1.95523C1.54815 1.99085 1.56689 2.03917 1.56689 2.08955C1.56689 2.13993 1.54815 2.18824 1.5148 2.22387C1.48146 2.25949 1.43623 2.27951 1.38907 2.27951H0.677814C0.630655 2.27951 0.585427 2.25949 0.552081 2.22387C0.518734 2.18824 0.5 2.13993 0.5 2.08955ZM2.45596 2.29166V5.8097C2.45589 5.84732 2.46629 5.88411 2.48582 5.91541C2.50536 5.94672 2.53315 5.97112 2.56568 5.98552C2.59821 5.99993 2.63401 6.00369 2.66855 5.99633C2.70308 5.98897 2.73479 5.97083 2.75966 5.94419L3.67007 4.9716C3.80343 4.8291 3.98431 4.74901 4.17293 4.74897H5.32232C5.35923 4.74894 5.39522 4.73664 5.42529 4.71378C5.45536 4.69091 5.47803 4.65862 5.49015 4.62137C5.50226 4.58412 5.50323 4.54377 5.49291 4.50591C5.48259 4.46805 5.4615 4.43456 5.43257 4.41008L2.74402 2.14236C2.71779 2.12022 2.68625 2.10642 2.65303 2.10256C2.6198 2.09869 2.58622 2.10491 2.55615 2.12049C2.52608 2.13608 2.50073 2.16041 2.48301 2.19068C2.46528 2.22096 2.45591 2.25596 2.45596 2.29166Z"
                                fill="black"
                              />
                            </svg>
                          </div>
                          <p className="m-0 text-[12px] text-[#000] font-bold font-inter leading-[120%] ">
                            {product.clicks}
                          </p>
                        </div>

                        <div className="border-[0.5px] border-[#000] px-[6px] py-1 rounded-[3px] flex flex-col items-start justify-center gap-1 min-w-[55px]">
                          <div className="flex items-center justify-start gap-1">
                            <p className="text-[10px] text-[#6b6565] font-regular font-inter leading-[120%] ">
                              Earnings
                            </p>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="11"
                              height="8"
                              viewBox="0 0 11 8"
                              fill="none"
                            >
                              <path
                                d="M9.75423 3.55514C9.98669 3.82086 9.98669 4.17957 9.75423 4.44486C9.02202 5.28014 7.26532 7 5.21436 7C3.1634 7 1.4067 5.28014 0.674495 4.44486C0.561395 4.31763 0.5 4.16111 0.5 4C0.5 3.83889 0.561395 3.68237 0.674495 3.55514C1.4067 2.71986 3.1634 1 5.21436 1C7.26532 1 9.02202 2.71986 9.75423 3.55514Z"
                                stroke="black"
                                strokeWidth="0.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M5.21345 5.28572C5.92353 5.28572 6.49916 4.71009 6.49916 4.00001C6.49916 3.28993 5.92353 2.71429 5.21345 2.71429C4.50337 2.71429 3.92773 3.28993 3.92773 4.00001C3.92773 4.71009 4.50337 5.28572 5.21345 5.28572Z"
                                stroke="black"
                                strokeWidth="0.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                          <p className="m-0 text-[12px] text-[#000] font-bold font-inter leading-[120%] ">
                            {product.approved_amount}
                          </p>
                        </div>

                        <div className="border-[0.5px] border-[#000] px-[6px] py-1 rounded-[3px] flex flex-col items-start justify-center gap-1 min-w-[55px]">
                          <div className="flex items-center justify-start gap-1">
                            <p className="text-[10px] text-[#6b6565] font-regular font-inter leading-[120%] ">
                              Orders
                            </p>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="9"
                              height="9"
                              viewBox="0 0 9 9"
                              fill="none"
                            >
                              <g clipPath="url(#clip0_652_135)">
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M5.92732 4.57296C5.9506 4.59618 5.96907 4.62377 5.98167 4.65414C5.99428 4.68451 6.00076 4.71707 6.00076 4.74996C6.00076 4.78284 5.99428 4.8154 5.98167 4.84578C5.96907 4.87615 5.9506 4.90374 5.92732 4.92696L4.42732 6.42696C4.40409 6.45024 4.37651 6.46871 4.34613 6.48131C4.31576 6.49392 4.2832 6.50041 4.25032 6.50041C4.21743 6.50041 4.18487 6.49392 4.1545 6.48131C4.12413 6.46871 4.09654 6.45024 4.07332 6.42696L3.32332 5.67696C3.30007 5.65371 3.28163 5.62612 3.26905 5.59575C3.25647 5.56538 3.25 5.53283 3.25 5.49996C3.25 5.46709 3.25647 5.43454 3.26905 5.40417C3.28163 5.3738 3.30007 5.3462 3.32332 5.32296C3.37026 5.27602 3.43393 5.24964 3.50032 5.24964C3.53319 5.24964 3.56574 5.25612 3.59611 5.2687C3.62648 5.28128 3.65407 5.29971 3.67732 5.32296L4.25032 5.89646L5.57332 4.57296C5.59654 4.54968 5.62413 4.53121 5.6545 4.5186C5.68487 4.506 5.71743 4.49951 5.75032 4.49951C5.7832 4.49951 5.81576 4.506 5.84613 4.5186C5.87651 4.53121 5.90409 4.54968 5.92732 4.57296Z"
                                  fill="black"
                                />
                                <path
                                  d="M4.5 1C4.83152 1 5.14946 1.1317 5.38388 1.36612C5.6183 1.60054 5.75 1.91848 5.75 2.25V2.5H3.25V2.25C3.25 1.91848 3.3817 1.60054 3.61612 1.36612C3.85054 1.1317 4.16848 1 4.5 1ZM6.25 2.5V2.25C6.25 1.78587 6.06563 1.34075 5.73744 1.01256C5.40925 0.684374 4.96413 0.5 4.5 0.5C4.03587 0.5 3.59075 0.684374 3.26256 1.01256C2.93437 1.34075 2.75 1.78587 2.75 2.25V2.5H1V7.5C1 7.76522 1.10536 8.01957 1.29289 8.20711C1.48043 8.39464 1.73478 8.5 2 8.5H7C7.26522 8.5 7.51957 8.39464 7.70711 8.20711C7.89464 8.01957 8 7.76522 8 7.5V2.5H6.25ZM1.5 3H7.5V7.5C7.5 7.63261 7.44732 7.75979 7.35355 7.85355C7.25979 7.94732 7.13261 8 7 8H2C1.86739 8 1.74021 7.94732 1.64645 7.85355C1.55268 7.75979 1.5 7.63261 1.5 7.5V3Z"
                                  fill="black"
                                />
                              </g>
                              <defs>
                                <clipPath id="clip0_652_135">
                                  <rect
                                    width="8"
                                    height="8"
                                    fill="white"
                                    transform="translate(0.5 0.5)"
                                  />
                                </clipPath>
                              </defs>
                            </svg>
                          </div>
                          <p className="m-0 text-[12px] text-[#000] font-bold font-inter leading-[120%] ">
                            {product.purchased_quantity}
                          </p>
                        </div>
                      </div> */}
                    </div>
                    <div className="flex items-center justify-start gap-[15px] mt-2 mb-1">
                      <div className="min-w-[60px] flex flex-col items-start justify-center py-0.5 gap-[3px] border-r-[0.5px] border-r-[#000]">
                        <h4 className="text-[#6b6565] text-[12px] font-medium font-inter leading-[120%] ">
                          Orders
                        </h4>
                        <p className="text-[#000] text-[14px] font-bold font-inter leading-[120%]">
                          {product.purchased_quantity}
                        </p>
                      </div>

                      <div className="min-w-[90px] flex flex-col items-start justify-center py-0.5 gap-[3px] ">
                        <h4 className="text-[#6b6565] text-[12px] font-medium font-inter leading-[120%] ">
                          Commissions
                        </h4>
                        <p className="text-[#000] text-[14px] font-bold font-inter leading-[120%]">
                          ₹{product.total_earning}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                {/* <svg
                  className="absolute top-3 right-3 cursor-pointer hover:scale-105"
                  xmlns="http://www.w3.org/2000/svg"
                  width="4"
                  height="12"
                  viewBox="0 0 4 12"
                  fill="none"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M3.53906 10.6154C3.53906 11.3801 2.91915 12 2.15445 12C1.38975 12 0.769833 11.3801 0.769833 10.6154C0.769833 9.85068 1.38975 9.23077 2.15445 9.23077C2.91915 9.23077 3.53906 9.85068 3.53906 10.6154Z"
                    fill="#000"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M3.53906 5.99997C3.53906 6.76467 2.91915 7.38458 2.15445 7.38458C1.38975 7.38458 0.769833 6.76467 0.769833 5.99997C0.769833 5.23527 1.38975 4.61535 2.15445 4.61535C2.91915 4.61535 3.53906 5.23527 3.53906 5.99997Z"
                    fill="#000"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M3.53906 1.38464C3.53906 2.14934 2.91915 2.76926 2.15445 2.76926C1.38975 2.76926 0.769833 2.14934 0.769833 1.38464C0.769833 0.61994 1.38975 2.67534e-05 2.15445 2.68203e-05C2.91915 2.68871e-05 3.53906 0.61994 3.53906 1.38464Z"
                    fill="#000"
                  />
                </svg> */}
                <button
                  className="w-full rounded-b-[7px] bg-[rgba(222,44,109,1)] flex items-center justify-center gap-2 py-1 cursor-pointer"
                  onClick={() => copyToClipboard(product.aff_link)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="13"
                    viewBox="0 0 14 13"
                    fill="none"
                  >
                    <path
                      d="M7.80719 5.69271C7.36123 5.24694 6.75649 4.99652 6.12595 4.99652C5.4954 4.99652 4.89066 5.24694 4.4447 5.69271L2.76291 7.37395C2.31695 7.81992 2.06641 8.42478 2.06641 9.05547C2.06641 9.68616 2.31695 10.291 2.76291 10.737C3.20888 11.183 3.81374 11.4335 4.44443 11.4335C5.07512 11.4335 5.67998 11.183 6.12595 10.737L6.96657 9.89637"
                      stroke="white"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M6.125 7.37396C6.57096 7.81974 7.1757 8.07015 7.80624 8.07015C8.43679 8.07015 9.04153 7.81974 9.48749 7.37396L11.1693 5.69272C11.6152 5.24675 11.8658 4.64189 11.8658 4.0112C11.8658 3.38051 11.6152 2.77565 11.1693 2.32969C10.7233 1.88372 10.1185 1.63318 9.48776 1.63318C8.85707 1.63318 8.25221 1.88372 7.80624 2.32969L6.96562 3.17031"
                      stroke="white"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <p className="m-0 text-[12px] text-[#fff] font-normal font-inter leading-normal">
                    Copy Link
                  </p>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      {!products.length && value == "" && (
        <div className="w-full flex flex-col items-center justify-center gap-0 pt-50 ">
          <h2 className="m-0 font-inter text-[20px] font-medium text-[#000]/45 text-center leading-normal ">
            No single product added yet!
          </h2>
          <h3
            onClick={() =>
              isInstaAuthenticated &&
                isInstagramFollowersSatisfied &&
                isInstagramPermissionsSatisfied
                ? router.push("/create/link_generator")
                : dispatch(toggleModal(true))
            }
            className="m-0 font-inter text-[16px] font-medium text-[rgba(222,44,109,1)] text-center leading-normal underline cursor-pointer hover:scale-105 transition-normal"
          >
            Generate your first product link
          </h3>
        </div>
      )}
      {value != "" && (
        <div className="w-full flex flex-col items-center justify-center gap-0 pt-50 ">
          <h2 className="m-0 font-inter text-[20px] font-medium text-[#000]/45 text-center leading-normal ">
            No Products found!
          </h2>
        </div>
      )}
    </div>
  );
};

export default ProductsContent;
