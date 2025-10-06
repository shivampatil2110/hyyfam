"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, ReactNode, useRef, useMemo } from "react";
import {
  useGetAutoPostsQuery,
  useDeleteAutoPostMutation,
} from "@/redux/api/postsApi";
import { Modal, Box } from "@mui/material";
import LoadingSpinner from "../LoadingStatesAndModals/LoadingSpinner";
import { showToast } from "@/components/Toast/Toast";
import SlideUpConfirmationModal from "../LoadingStatesAndModals/SlideUpConfirmationModal";
import { handleShare } from "@/utils/common_functions";
import { useAppSelector } from "@/redux/store";
import SlideUpModal from "../home/SlideUpModal";
import { useLazyGetProfileSummaryQuery } from "@/redux/api/postsApi";

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

const PostsContent: React.FC<any> = ({ changeTab, setLoading }: any) => {
  // const [posts, setPosts] = useState<Boolean>(false);
  const router = useRouter();
  const images = Array.from({ length: 10 }, (_, i) => ({
    id: i,
    src: "/images/samplePost.png",
  }));

  const visibleImages = images.slice(0, 3);
  const extraCount = images.length - visibleImages.length;
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [imgUrl, setImgUrl] = useState<string>("");
  const [id, setId] = useState<string>("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string>("");
  const lastItemRef = useRef<HTMLDivElement | null>(null);
  const limit = 10;
  const isInitialLoad = useRef(true);
  const reachedEnd = useRef(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [posts, setPosts] = useState([])
  const [deleteModal, setDeleteModal] = useState<boolean>(false);

  const [deleteAutoPost, deleteAutoPostState] = useDeleteAutoPostMutation();

  const [isModalOpenInsta, setIsModalOpenInsta] = useState<boolean>(false);

const [getProfileSummary] = useLazyGetProfileSummaryQuery();

  const {
    isInstaAuthenticated,
    isInstagramFollowersSatisfied,
    isInstagramPermissionsSatisfied,
  } = useAppSelector((state) => state.auth);

  const queryParams = useMemo(() => {
    const params: any = { page };
    return params;
  }, [page]);


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

  let { data, isError, isLoading, isFetching, isSuccess, isUninitialized } = useGetAutoPostsQuery(queryParams);

  useEffect(() => {
    if (!data) return;

    setPosts((prev: any) => {
      // If it's page 1, replace the data (new search or initial load)
      if (page === 1) {
        return data;
      }

      // For subsequent pages, append new unique items
      const existingIds = new Set(prev.map((item: any) => item.post_id));
      const newUniqueItems = data.filter(
        (item: any) => !existingIds.has(item.post_id)
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
      posts.length === 0
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
  }, [isFetching, hasMore, posts.length, reachedEnd.current]);

  // Handle initial load trigger for short lists
  useEffect(() => {
    if (isInitialLoad.current || !posts.length || isFetching || !hasMore)
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
  }, [posts.length, isFetching, hasMore]);

    const refreshStats = async () => {
    try {
      const result = await getProfileSummary();
    } catch (error) {
      console.error('Failed to refresh stats:', error);
    }
  };

  const handleToggleDropdown = (id: string, img: string) => {
    if (openDropdownId === id) {
      setOpenDropdownId("");
      setImgUrl("");
    } else {
      setOpenDropdownId(id);
      setImgUrl(encodeURIComponent(img));
    }
  };

  const handleEditPost = () => {
    // router.push(`/profile/edit_post?id=${openDropdownId}&imgurl=${imgUrl}`);
    changeTab("Edit Post", openDropdownId, imgUrl);
    setOpenDropdownId("");
  };

  const handleDelete = () => {
    setIsModalOpen(false);
    setDeleteModal(true);
    setOpenDropdownId(openDropdownId)
  };

  const handleCloseDelete = () => {
    setDeleteModal(false);
  };

  const handleDeleteConfirmation = async () => {
    let obj: any = {}
    obj.post_id = openDropdownId
    await deleteAutoPost(obj).unwrap().then(() => {
      showToast({
        message: "Auto Post deleted successfully",
        type: 'success'
      })
      setDeleteModal(false)
      setPage(1)
    })
      .catch(() => {
        showToast({
          message: "Error deleting Auto Post",
          type: 'error'
        })
      })

       await refreshStats();

    setDeleteModal(false)
  }

  if (isLoading) {
    return <LoadingSpinner isOpen={true} />
  }

  const handleOpen = (id: string, img: string) => {
    setIsModalOpen(true);
    setImgUrl(encodeURIComponent(img));
    setId(id);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setId("");
    setImgUrl("");
  };

  if (deleteAutoPostState.isLoading) {
    return <LoadingSpinner isOpen={true} />
  }

  return (
    <div className="w-full min-h-[95vh] px-0.5 ">
      {posts.length > 0 && (
        <div className="grid grid-cols-3 gap-[3px] items-end justify-center pt-[15px] ">
          {posts.map((post: any, index: any) => (
            <div
              key={post.post_id}
              ref={index === posts.length - 1 ? lastItemRef : null}
              className={`h-[170px] w-full relative flex items-end justify-center`}
              style={{
                backgroundImage: `url('${post.img_url}')`,
                backgroundRepeat: "round",
              }}
            >
              <button
                className="bg-[#fff] px-2 py-1.5 rounded-full absolute top-1 right-1 cursor-pointer hover:scale-105"
                onClick={() =>
                  handleToggleDropdown(post?.post_id, post.img_url)
                }
              >
                <svg
                  className=""
                  xmlns="http://www.w3.org/2000/svg"
                  width="4"
                  height="8"
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
                </svg>
              </button>

              {openDropdownId === post.post_id && (
                <div
                  ref={dropdownRef}
                  className="absolute top-[25px] right-1 w-[80px] bg-white rounded-[4px] shadow-lg border border-[#e5e4e4] z-50"
                >
                  <div
                    onClick={() => handleShare(`${post.permalink}`)}
                    className="flex items-center justify-center py-1 px-3 rounded-t-[4px] border-b border-[#e5e4e4] w-full bg-[#fff] cursor-pointer hover:bg-gray-50"
                  >
                    <p className="text-[#000] text-[11px] font-medium font-inter">
                      Share
                    </p>
                  </div>

                  <div
                    onClick={handleEditPost}
                    className="flex items-center justify-center py-1 px-3 border-b border-[#e5e4e4] w-full bg-[#fff] cursor-pointer hover:bg-gray-50"
                  >
                    <p className="text-[#000] text-[11px] font-medium font-inter">
                      Edit Post
                    </p>
                  </div>

                  <div
                    onClick={handleDelete}
                    className="flex items-center justify-center py-1 px-3 rounded-b-[4px] w-full bg-[#fff] cursor-pointer hover:bg-gray-50"
                  >
                    <p className="text-[#f52d2d] text-[11px] font-medium font-inter">
                      Delete
                    </p>
                  </div>
                </div>
              )}
              <div className=" flex items-center justify-evenly w-full mb-2">
                {post.products.map((product: any, idx: number) => (
                  <div key={product.id} className="relative">
                    <div className="bg-[#fff] h-10 w-10 flex items-center justify-center rounded-[3px]">
                      <Image
                        src={product.img_url}
                        alt={`Post ${idx}`}
                        height={30}
                        width={32}
                        className="rounded-[3px] max-h-9 object-contain bg-white"
                      />
                    </div>
                    {idx === 2 && extraCount > 0 && post.total_products > 3 && (
                      <div className="absolute inset-0 bg-black/45 bg-opacity-10 rounded-[3px] flex items-center justify-center">
                        <span className="text-white text-xs font-semibold">
                          +{post.total_products - 3}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      {!posts.length && (
        <div className="w-full flex flex-col items-center justify-center gap-0 pt-50 ">
          <h2 className="m-0 font-inter text-[20px] font-medium text-[#000]/45 text-center leading-normal ">
            No post added yet!
          </h2>
          <h3
            // onClick={() => router.push("/profile/select_post")}
            onClick={() =>
              isInstaAuthenticated
                ? isInstagramFollowersSatisfied &&
                  isInstagramPermissionsSatisfied
                  ? router.push("/profile/select_post")
                  : setIsModalOpenInsta(true)
                : router.push("/verification")
            }

            className="m-0 font-inter text-[16px] font-medium text-[rgba(222,44,109,1)] text-center leading-normal underline cursor-pointer hover:scale-105 transition-normal"
          >
            Add Instagram Post
          </h3>
        </div>
      )}
      <SlideUpConfirmationModal
        isOpen={deleteModal}
        type="post_del"
        onClose={handleCloseDelete}
        onDeleteOrDiscard={handleDeleteConfirmation}
      />
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

export default PostsContent;
