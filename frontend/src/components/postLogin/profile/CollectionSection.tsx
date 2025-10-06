"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, {
  useEffect,
  useState,
  ReactNode,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { Modal, Box } from "@mui/material";
import {
  useGetCollectionsQuery,
  useLazyGetCollectionsQuery,
  useDeleteCollectionMutation
} from "@/redux/api/collectionApi";
import { useAppSelector } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";
import { toggleModal } from "@/redux/features/authSlice";
import LoadingSpinner from "../LoadingStatesAndModals/LoadingSpinner";
import { showToast } from "@/components/Toast/Toast";
import { WEBSITE_URL } from "@/appConstants/baseURL";
import SlideUpConfirmationModal from "../LoadingStatesAndModals/SlideUpConfirmationModal";
import { handleShare } from "@/utils/common_functions";
import SlideUpModal from "../home/SlideUpModal";
import { useLazyGetProfileSummaryQuery } from "@/redux/api/postsApi";


interface URLInputProps {
  initialValue?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  onClear?: () => void;
  debounceMs?: number;
  value: string;
  setValue: (value: string) => void;
}

interface FixedWidthModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  hideCloseButton?: boolean;
}

const FixedWidthModal: React.FC<FixedWidthModalProps> = ({
  open,
  onClose,
  title,
  children,
  hideCloseButton = false,
}) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="fixed-width-modal-title"
      aria-describedby="fixed-width-modal-description"
      className="flex items-center justify-center"
    >
      <Box
        className="rounded-[4px] shadow-lg outline-none w-[130px] max-h-[90vh] bg-[#fff] overflow-y-auto "
        sx={{ maxWidth: "250px" }} // Ensure MUI also respects the fixed width
      >
        <div id="fixed-width-modal-description">{children}</div>
      </Box>
    </Modal>
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
    <div className="flex items-center w-full h-[30px] px-[7px] py-2 bg-[#f8f9fa] rounded-[5px] ">
      {/* Link Icon */}
      <div className="flex-shrink-0 mr-2">
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
        className="flex-grow outline-none text-sm text-[#000] bg-transparent"
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

const CollectionsContent = ({ changeTabCollection }: any) => {
  const [id, setId] = useState<string>("");
  const [collectionName, setCollectionName] = useState<string>("");
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [collections, setCollections] = useState<any[]>([]);
  const [value, setValue] = useState("");
  const [isModalOpenInsta, setIsModalOpenInsta] = useState<boolean>(false);

  const [getCollections, { data: collectionsData = [] }] = useLazyGetCollectionsQuery();
  const limit = 10;
  const isInitialLoad = useRef(true);
  const reachedEnd = useRef(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const lastItemRef = useRef<HTMLDivElement | null>(null);
  const [currentSearchTerm, setCurrentSearchTerm] = useState("");

  const queryParams = useMemo(() => {
    const params: any = { page };
    if (currentSearchTerm.trim()) {
      params.search = currentSearchTerm.trim();
    }
    return params;
  }, [page, currentSearchTerm]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { uid } = useSelector((state: any) => state.auth.user);
  const { data, isLoading, error, isFetching } = useGetCollectionsQuery(queryParams);
  const [deleteCollection, deleteCollectionState] = useDeleteCollectionMutation()
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [deleteModal, setDeleteModal] = useState<boolean>(false);
  const [openDropdownId, setOpenDropdownId] = useState<string>("");
const [getProfileSummary] = useLazyGetProfileSummaryQuery();

  const {
    isInstaAuthenticated,
    isInstagramFollowersSatisfied,
    isInstagramPermissionsSatisfied,
  } = useAppSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        // setOpenDropdownId("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Main effect to handle data updates
  useEffect(() => {
    if (!data) return;

    setCollections((prev: any) => {
      // If it's page 1, replace the data (new search or initial load)
      if (page === 1) {
        return data;
      }

      // For subsequent pages, append new unique items
      const existingIds = new Set(prev.map((item: any) => item.id));
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

    isInitialLoad.current = false;
  }, [data, page, limit]);

  // Intersection Observer for infinite loading
  useEffect(() => {
    if (
      !hasMore ||
      isFetching ||
      reachedEnd.current ||
      collections.length === 0
    )
      return;

    const options = {
      root: null,
      rootMargin: "100px",
      threshold: 0.1,
    };

    const handleObserver = (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (
        target.isIntersecting &&
        !isFetching &&
        !reachedEnd.current &&
        hasMore
      ) {
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
  }, [isFetching, hasMore, collections.length, reachedEnd.current]);

  // Handle initial load trigger for short lists
  useEffect(() => {
    if (isInitialLoad.current || !collections.length || isFetching || !hasMore)
      return;

    const timeoutId = setTimeout(() => {
      if (lastItemRef.current) {
        const rect = lastItemRef.current.getBoundingClientRect();
        const windowHeight =
          window.innerHeight || document.documentElement.clientHeight;
        const isNearOrInViewport = rect.top <= windowHeight + 300;

        if (isNearOrInViewport) {
          setPage((prev) => prev + 1);
        }
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [collections.length, isFetching, hasMore]);

  // Handle search term changes
  useEffect(() => {
    if (value.trim() === "") {
      setCurrentSearchTerm("");
      setPage(1);
      reachedEnd.current = false;
      setHasMore(true);
    }
  }, [value]);

  const handleSearch = useCallback((searchValue: string) => {
    const trimmedValue = searchValue.trim();

    setCurrentSearchTerm(trimmedValue);
    setPage(1);
    reachedEnd.current = false;
    setHasMore(true);
  }, []);

  const handleOpenDelete = (id: string) => {
    // setIsModalOpen(false);
    setDeleteModal(true);
    setOpenDropdownId("");
  };

  const handleCloseDelete = () => {
    setDeleteModal(false);
  };

  const handleOpen = (id: string, name: string) => {
    // setIsModalOpen(true);
    // setId(id);
    // setCollectionName(name);

    if (openDropdownId === id) {
      setOpenDropdownId("");
      setId("");
      setCollectionName("");
      // setImgUrl("");
    } else {
      setOpenDropdownId(id);
      setId(id);
      setCollectionName(name);
      // setImgUrl(encodeURIComponent(img));
    }
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setId("");
    setCollectionName("");
  };

  const handleURLClear = () => {
    setSearchTerm("");
    setValue("");
    setCurrentSearchTerm("");
    setPage(1);
    reachedEnd.current = false;
    setHasMore(true);
  };

          const refreshStats = async () => {
    try {
      const result = await getProfileSummary();
    } catch (error) {
      console.error('Failed to refresh stats:', error);
    }
  };

  const handleDelete = async () => {
    let obj: any = {}
    obj.cid = id
    await deleteCollection(obj).unwrap().then(() => {
      showToast({
        message: "Collection deleted successfully",
        type: 'success'
      })
      setDeleteModal(false)
      setPage(1)
    })
      .catch(() => {
        showToast({
          message: "Error deleting collection",
          type: 'error'
        })
      })

       await refreshStats();
    setDeleteModal(false)
  }

  if (isLoading) {
    return <LoadingSpinner isOpen={true} />
  }

  return (
    <div className="w-full min-h-[95vh] px-[15px]">
      {(collections.length || value != "") && (
        <div className="flex flex-col items-center justify-center w-full pb-25">
          <div className="bg-[#fff] w-full py-4  sticky top-[31px] z-50 flex items-center justify center gap-3">
            <URLInput
              initialValue=""
              placeholder="Search Collection..."
              onChange={handleSearch}
              onClear={handleURLClear}
              debounceMs={500}
              value={value}
              setValue={setValue}
            />

            {/* <div className="px-2 flex items-center justify-center gap-[5px] border-[0.5px] border-[#000] rounded-[19px] cursor-pointer">
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

          <div className="flex flex-col items-start justify-start gap-[24px] overflow-scroll [&::-webkit-scrollbar]:hidden  scroll-smooth w-full">
            {collections.map((collection: any, index: number) => (
              <div
                style={{
                  // boxShadow: '-1px 2px 4px 2px rgba(0, 0, 0, 0.25)'
                  boxShadow: "rgba(0, 0, 0, 0.1) 0px 4px 12px",
                }}
                key={collection.id}
                ref={index === collections.length - 1 ? lastItemRef : null}
                className=" relative bg-gray-100/80 rounded-[7px]  pt-[7px]  w-full [&::-webkit-scrollbar]:hidden scroll-smooth"
              >
                <div className=" flex flex-col items-start jusyify-center w-full">
                  {/* Collection Header */}
                  <div className="flex justify-between items-center w-full mb-2.5 px-[15px]">
                    <div className="flex flex-col items-start">
                      <h2 className="text-[14px] text-[#000] font-inter font-semibold">
                        {collection.name}
                      </h2>
                      <p className="text-[10px] text-[#787878] ">
                        {new Date(collection.updated_at).toLocaleDateString(
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
                    <button
                      onClick={() =>
                        handleOpen(collection?.id, collection.name)
                      }
                      className=" rotate-90 cursor-pointer "
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="1"></circle>
                        <circle cx="19" cy="12" r="1"></circle>
                        <circle cx="5" cy="12" r="1"></circle>
                      </svg>
                    </button>
                  </div>

                  {/* Product Scroll Area */}
                  <div className="flex overflow-x-auto gap-4 pb-1 [&::-webkit-scrollbar]:hidden scroll-smooth max-w-full pl-[15px]">
                    {collection.products.map((product: any, index: number) => {
                      return (
                        <div
                          key={product.id}
                          style={{
                            // boxShadow: 'rgba(99, 99, 99, 0.2) 0px 2px 2px 0px'
                            boxShadow: "rgba(0, 0, 0, 0.16) 0px 1px 4px",
                          }}
                          className={`flex flex-col items-center justify-center rounded-[7px]  bg-[#fff]  w-full relative max-w-[280px] min-w-[280px] ${collection.products.length - 1 == index
                            ? "mr-[15px]"
                            : ""
                            }`}
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

                              <div className="flex items-center justify-start gap-[15px] mt-2 mb-1">
                                <div className="min-w-[60px] flex flex-col items-start justify-center py-0.5 gap-[3px] border-r-[0.5px] border-r-[#000]/50 rounded-[3px]">
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
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* View Collection Button */}
                <button
                  onClick={() =>
                    router.push(`/profile/collection_view?id=${collection.id}`)
                  }
                  className="w-full cursor-pointer bg-[rgba(222,44,109,1)] text-white py-1.5 rounded-b-[7px] text-[10px] font-medium mt-2"
                >
                  View Collection
                </button>

                {openDropdownId === collection.id && (
                  <div
                    ref={dropdownRef}
                    className="absolute top-[40px] right-4 w-[130px] bg-white rounded-[4px] shadow-lg border border-[#e5e4e4] z-50"
                  >
                    <div className="w-full flex flex-col items-center justify-center gap-[-1px]">
                      <div className="flex items-center justify-center py-2 px-3 rounded-t-[4px] border-[1px] border-solid border-[#e5e4e4] w-full bg-[#fff] cursor-pointer" onClick={() => {
                        handleShare(`${WEBSITE_URL}/preview/${uid}/${id}`)
                      }}>
                        <p className="text-[#000] text-[12px] font-medium font-inter">
                          Share
                        </p>
                      </div>

                      <div
                        onClick={() => changeTabCollection("Edit Collection", id, collectionName)}
                        className="flex items-center justify-center py-2 px-3 border-[1px] border-solid border-[#e5e4e4] w-full bg-[#fff] cursor-pointer"
                      >
                        <p className="text-[#000] text-[12px] font-medium font-inter">
                          Edit Collection
                        </p>
                      </div>

                      <div
                        onClick={() => handleOpenDelete(id)}
                        className="flex items-center justify-center py-2 px-3 rounded-b-[4px] border-[1px] border-solid border-[#e5e4e4] w-full bg-[#fff] cursor-pointer"
                      >
                        <p className="text-[#f52d2d] text-[12px] font-medium font-inter">
                          Delete Collection
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* <FixedWidthModal
            open={isModalOpen}
            onClose={handleClose}
          // title="Subscribe"
          >
            <div className="w-full flex flex-col items-center justify-center gap-[-1px]">
              <div className="flex items-center justify-center py-2 px-3 rounded-t-[4px] border-[1px] border-solid border-[#e5e4e4] w-full bg-[#fff] cursor-pointer" onClick={() => {
                handleShare(`${WEBSITE_URL}/preview/${uid}/${id}`)
              }}>
                <p className="text-[#000] text-[12px] font-medium font-inter">
                  Share
                </p>
              </div>

              <div
                onClick={() =>
                  router.push(
                    `/profile/edit_collection?id=${id}&name=${collectionName}`
                  )
                }
                className="flex items-center justify-center py-2 px-3 border-[1px] border-solid border-[#e5e4e4] w-full bg-[#fff] cursor-pointer"
              >
                <p className="text-[#000] text-[12px] font-medium font-inter">
                  Edit Collection
                </p>
              </div>

              <div
                onClick={() => handleOpenDelete(id)}
                className="flex items-center justify-center py-2 px-3 rounded-b-[4px] border-[1px] border-solid border-[#e5e4e4] w-full bg-[#fff] cursor-pointer"
              >
                <p className="text-[#f52d2d] text-[12px] font-medium font-inter">
                  Delete Collection
                </p>
              </div>
            </div>
          </FixedWidthModal> */}

          <SlideUpConfirmationModal isOpen={deleteModal} type="collection_del" onClose={handleCloseDelete} collectionName={collectionName} onDeleteOrDiscard={handleDelete} />
        </div>
      )}
      {!collections.length && value == "" && (
        <div className="w-full flex flex-col items-center justify-center gap-0 pt-50 ">
          <h2 className="m-0 font-inter text-[20px] font-medium text-[#000]/45 text-center leading-normal ">
            No Collection yet!
          </h2>
          <h3
            onClick={() =>
              isInstaAuthenticated ?
                isInstagramFollowersSatisfied &&
                  isInstagramPermissionsSatisfied
                  ? router.push("/create/collection_generator")
                  : setIsModalOpenInsta(true) : router.push("/verification")
            }
            className="m-0 font-inter text-[16px] font-medium text-[rgba(222,44,109,1)] text-center leading-normal underline cursor-pointer hover:scale-105 transition-normal"
          >
            Create your first Collection
          </h3>
        </div>
      )}
      {value != "" && (
        <div className="w-full flex flex-col items-center justify-center gap-0 pt-50 ">
          <h2 className="m-0 font-inter text-[20px] font-medium text-[#000]/45 text-center leading-normal ">
            No Collection found!
          </h2>
        </div>
      )}
      <SlideUpModal
        isOpen={isModalOpenInsta}
        onClose={() => setIsModalOpenInsta(false)}
        profileComplete={true}
      >
        <div className="bg-[rgba(222,44,109,1)] pt-[4px] rounded-t-[14px]">
          <div className="w-full mx-auto bg-white rounded-t-[14px] shadow-lg overflow-hidden px-[15px] pb-[30px] pt-11 relative flex flex-col items-center justify-center gap-4 ">
            <button
              onClick={(e) => {
                setIsModalOpenInsta(false);
              }}
              className="absolute right-6 top-7 cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
              >
                <path
                  d="M0.999295 14.7257L14.3086 1.41641"
                  stroke="black"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path
                  d="M1.16406 1.00003L14.4734 14.3093"
                  stroke="black"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <div className="flex flex-col items-center justify-center gap-2.5">
              <Image
                src={"/images/alert.png"}
                alt="alert"
                height={30}
                width={20}
              />
              <h2 className="text-[16px] font-inter font-bold text-[#000] leading-normal text-center ">
                Oh no! Setup Incomplete
              </h2>
              <p className="text-[12px] font-inter font-normal text-[#000] leading-normal text-center">
                Your account is connected, but some permissions are missing.
              </p>
            </div>

            <div className="flex flex-col items-center justify-center gap-3 w-full">
              <div
                className={`flex items-center justify-start py-3 px-[10px] gap-[10px] w-full rounded-[4px] ${isInstagramPermissionsSatisfied
                  ? "bg-[#edffdf]"
                  : "bg-[#ffefe8]"
                  }  `}
              >
                {isInstagramPermissionsSatisfied ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="19"
                    height="19"
                    viewBox="0 0 19 19"
                    fill="none"
                  >
                    <g clipPath="url(#clip0_1036_13582)">
                      <path
                        d="M9.29348 0C7.45541 0 5.65861 0.545053 4.1303 1.56623C2.602 2.58741 1.41083 4.03886 0.707428 5.73702C0.00402672 7.43518 -0.180015 9.30379 0.178576 11.1065C0.537167 12.9093 1.42228 14.5652 2.722 15.865C4.02172 17.1647 5.67766 18.0498 7.48042 18.4084C9.28317 18.767 11.1518 18.5829 12.8499 17.8795C14.5481 17.1761 15.9995 15.985 17.0207 14.4567C18.0419 12.9284 18.587 11.1316 18.587 9.29348C18.587 8.07304 18.3466 6.86455 17.8795 5.73702C17.4125 4.60948 16.7279 3.58498 15.865 2.722C15.002 1.85902 13.9775 1.17446 12.8499 0.707424C11.7224 0.240383 10.5139 0 9.29348 0ZM9.29348 16.7283C7.82302 16.7283 6.38558 16.2922 5.16294 15.4753C3.94029 14.6583 2.98736 13.4972 2.42464 12.1386C1.86192 10.7801 1.71468 9.28523 2.00156 7.84302C2.28843 6.40082 2.99652 5.07607 4.0363 4.03629C5.07607 2.99652 6.40082 2.28843 7.84303 2.00155C9.28524 1.71468 10.7801 1.86191 12.1387 2.42463C13.4972 2.98736 14.6583 3.94029 15.4753 5.16293C16.2922 6.38558 16.7283 7.82302 16.7283 9.29348C16.7283 11.2653 15.945 13.1564 14.5507 14.5507C13.1564 15.945 11.2653 16.7283 9.29348 16.7283Z"
                        fill="#00BA00"
                      />
                      <path
                        d="M12.4209 6.14503L8.90797 10.7918L7.39313 8.83085C7.24155 8.63613 7.01882 8.5096 6.77395 8.4791C6.52908 8.4486 6.28212 8.51663 6.0874 8.66821C5.89268 8.8198 5.76615 9.04252 5.73565 9.2874C5.70515 9.53227 5.77318 9.77923 5.92476 9.97395L8.18308 12.8642C8.2706 12.975 8.3822 13.0643 8.50941 13.1255C8.63662 13.1867 8.7761 13.2181 8.91726 13.2174C9.05919 13.217 9.19916 13.1842 9.32642 13.1214C9.45369 13.0585 9.56487 12.9674 9.65145 12.8549L13.8986 7.27884C14.0489 7.08165 14.1148 6.83282 14.0817 6.58708C14.0486 6.34133 13.9192 6.11881 13.722 5.96846C13.5248 5.8181 13.276 5.75224 13.0302 5.78536C12.7845 5.81847 12.562 5.94785 12.4116 6.14503H12.4209Z"
                        fill="#00BA00"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_1036_13582">
                        <rect width="19" height="19" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="19"
                    height="19"
                    viewBox="0 0 19 19"
                    fill="none"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M9.5 1.72727C5.20724 1.72727 1.72727 5.20724 1.72727 9.5C1.72727 13.7928 5.20724 17.2727 9.5 17.2727C13.7928 17.2727 17.2727 13.7928 17.2727 9.5C17.2727 5.20724 13.7928 1.72727 9.5 1.72727ZM0 9.5C0 4.25329 4.25329 0 9.5 0C14.7467 0 19 4.25329 19 9.5C19 14.7467 14.7467 19 9.5 19C4.25329 19 0 14.7467 0 9.5Z"
                      fill="#F54A4A"
                    />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12.7016 6.29841C13.0389 6.63568 13.0389 7.1825 12.7016 7.51977L7.51977 12.7016C7.1825 13.0389 6.63568 13.0389 6.29841 12.7016C5.96114 12.3643 5.96114 11.8175 6.29841 11.4802L11.4802 6.29841C11.8175 5.96114 12.3643 5.96114 12.7016 6.29841Z"
                      fill="#F54A4A"
                    />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M6.29841 6.29841C6.63568 5.96114 7.1825 5.96114 7.51977 6.29841L12.7016 11.4802C13.0389 11.8175 13.0389 12.3643 12.7016 12.7016C12.3643 13.0389 11.8175 13.0389 11.4802 12.7016L6.29841 7.51977C5.96114 7.1825 5.96114 6.63568 6.29841 6.29841Z"
                      fill="#F54A4A"
                    />
                  </svg>
                )}
                <p className="text-[12px] font-medium font-inter text-[#000] leading-[14px] ">
                  <span className="font-bold">Instagram Permissions:</span>{" "}
                  {isInstagramPermissionsSatisfied
                    ? "Active"
                    : "Not allowed all Permissions"}
                </p>
              </div>

              <div
                className={`flex items-center justify-start py-3 px-[10px] gap-[10px] w-full rounded-[4px] ${isInstagramFollowersSatisfied
                  ? "bg-[#edffdf]"
                  : "bg-[#ffefe8]"
                  }  `}
              >
                {isInstagramFollowersSatisfied ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="19"
                    height="19"
                    viewBox="0 0 19 19"
                    fill="none"
                  >
                    <g clipPath="url(#clip0_1036_13582)">
                      <path
                        d="M9.29348 0C7.45541 0 5.65861 0.545053 4.1303 1.56623C2.602 2.58741 1.41083 4.03886 0.707428 5.73702C0.00402672 7.43518 -0.180015 9.30379 0.178576 11.1065C0.537167 12.9093 1.42228 14.5652 2.722 15.865C4.02172 17.1647 5.67766 18.0498 7.48042 18.4084C9.28317 18.767 11.1518 18.5829 12.8499 17.8795C14.5481 17.1761 15.9995 15.985 17.0207 14.4567C18.0419 12.9284 18.587 11.1316 18.587 9.29348C18.587 8.07304 18.3466 6.86455 17.8795 5.73702C17.4125 4.60948 16.7279 3.58498 15.865 2.722C15.002 1.85902 13.9775 1.17446 12.8499 0.707424C11.7224 0.240383 10.5139 0 9.29348 0ZM9.29348 16.7283C7.82302 16.7283 6.38558 16.2922 5.16294 15.4753C3.94029 14.6583 2.98736 13.4972 2.42464 12.1386C1.86192 10.7801 1.71468 9.28523 2.00156 7.84302C2.28843 6.40082 2.99652 5.07607 4.0363 4.03629C5.07607 2.99652 6.40082 2.28843 7.84303 2.00155C9.28524 1.71468 10.7801 1.86191 12.1387 2.42463C13.4972 2.98736 14.6583 3.94029 15.4753 5.16293C16.2922 6.38558 16.7283 7.82302 16.7283 9.29348C16.7283 11.2653 15.945 13.1564 14.5507 14.5507C13.1564 15.945 11.2653 16.7283 9.29348 16.7283Z"
                        fill="#00BA00"
                      />
                      <path
                        d="M12.4209 6.14503L8.90797 10.7918L7.39313 8.83085C7.24155 8.63613 7.01882 8.5096 6.77395 8.4791C6.52908 8.4486 6.28212 8.51663 6.0874 8.66821C5.89268 8.8198 5.76615 9.04252 5.73565 9.2874C5.70515 9.53227 5.77318 9.77923 5.92476 9.97395L8.18308 12.8642C8.2706 12.975 8.3822 13.0643 8.50941 13.1255C8.63662 13.1867 8.7761 13.2181 8.91726 13.2174C9.05919 13.217 9.19916 13.1842 9.32642 13.1214C9.45369 13.0585 9.56487 12.9674 9.65145 12.8549L13.8986 7.27884C14.0489 7.08165 14.1148 6.83282 14.0817 6.58708C14.0486 6.34133 13.9192 6.11881 13.722 5.96846C13.5248 5.8181 13.276 5.75224 13.0302 5.78536C12.7845 5.81847 12.562 5.94785 12.4116 6.14503H12.4209Z"
                        fill="#00BA00"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_1036_13582">
                        <rect width="19" height="19" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="19"
                    height="19"
                    viewBox="0 0 19 19"
                    fill="none"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M9.5 1.72727C5.20724 1.72727 1.72727 5.20724 1.72727 9.5C1.72727 13.7928 5.20724 17.2727 9.5 17.2727C13.7928 17.2727 17.2727 13.7928 17.2727 9.5C17.2727 5.20724 13.7928 1.72727 9.5 1.72727ZM0 9.5C0 4.25329 4.25329 0 9.5 0C14.7467 0 19 4.25329 19 9.5C19 14.7467 14.7467 19 9.5 19C4.25329 19 0 14.7467 0 9.5Z"
                      fill="#F54A4A"
                    />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12.7016 6.29841C13.0389 6.63568 13.0389 7.1825 12.7016 7.51977L7.51977 12.7016C7.1825 13.0389 6.63568 13.0389 6.29841 12.7016C5.96114 12.3643 5.96114 11.8175 6.29841 11.4802L11.4802 6.29841C11.8175 5.96114 12.3643 5.96114 12.7016 6.29841Z"
                      fill="#F54A4A"
                    />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M6.29841 6.29841C6.63568 5.96114 7.1825 5.96114 7.51977 6.29841L12.7016 11.4802C13.0389 11.8175 13.0389 12.3643 12.7016 12.7016C12.3643 13.0389 11.8175 13.0389 11.4802 12.7016L6.29841 7.51977C5.96114 7.1825 5.96114 6.63568 6.29841 6.29841Z"
                      fill="#F54A4A"
                    />
                  </svg>
                )}
                <p className="text-[12px] font-medium font-inter text-[#000] leading-[14px] ">
                  <span className="font-bold">1000 Instagram Followers:</span>{" "}
                  {isInstagramFollowersSatisfied
                    ? "Completed"
                    : "Increase your followers to 1000"}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-start justify-center w-full">
              <div className="flex flex-col items-start justify-center mb-2">
                <h3 className="text-[12px] font-bold font-inter text-[#000] leading-6 ">
                  To enable Auto-replies:
                </h3>
                <p className="text-[12px] font-medium font-inter text-[#000] leading-4">
                  Grant all permissions:
                </p>
              </div>

              <ul className="list-disc pl-4 text-[#000] text-[12px] leading-4 font-inter font-normal space-y-1">
                <li>View profile & access media (required)</li>
                <li>Access & manage comments</li>
                <li>Access & manage messages</li>
              </ul>
            </div>

            <button
              className="mt-4 w-full bg-[rgba(222,44,109,1)] hover:bg-pink-600 text-white font-medium font-inter text-[16px] py-3 rounded-[7px] transition duration-200"
              onClick={() => {
                setIsModalOpenInsta(false);
                router.push("/verification");
              }}
            >
              Complete Setup & Activate Engage
            </button>
          </div>
        </div>
      </SlideUpModal>
    </div>
  );
};

export default CollectionsContent;
