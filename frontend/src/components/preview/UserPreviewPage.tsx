"use client";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
} from "react";
import {
  useGetCollectionPreviewQuery,
} from "@/redux/api/collectionApi";
import ReplyIcon from "@mui/icons-material/Reply";
import { CDN_URL, WEBSITE_URL } from "@/appConstants/baseURL";
import LoadingSpinner from "../postLogin/LoadingStatesAndModals/LoadingSpinner";
import { handleShare } from "@/utils/common_functions";

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

interface Collection {
  id: string;
  name: string;
  aff_link_order: number[]; // Array of indices from productDetails
  updated_at: string;
}

const UserPReviewPage: React.FC<any> = ({ userData }: any) => {
  const router = useRouter();
  const [collections, setCollections] = useState<any[]>([]);
  const params = useParams();
  const uid = params?.uid;
  const limit = 10;
  const isInitialLoad = useRef(true);
  const reachedEnd = useRef(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const lastItemRef = useRef<HTMLDivElement | null>(null);
  const [userDetails, setUserDetails] = useState<any>({})

  const queryParams = useMemo(() => {
    const params: any = { page };
    params.uid = uid;
    return params;
  }, [page]);

  const { data, isLoading, error, isFetching } = useGetCollectionPreviewQuery(queryParams);

  useEffect(() => {
    if (!data) return;

    setUserDetails(data.userDetails[0])
    setCollections((prev: any) => {
      // If it's page 1, replace the data (new search or initial load)
      if (page === 1) {
        return data.collectionData;
      }

      // For subsequent pages, append new unique items
      const existingIds = new Set(prev.map((item: any) => item.id));
      const newUniqueItems = data.collectionData.filter(
        (item: any) => !existingIds.has(item.id)
      );
      return [...prev, ...newUniqueItems];
    });

    // Update pagination state
    if (data?.collectionData?.length < limit) {
      setHasMore(false);
      reachedEnd.current = true;
    } else {
      setHasMore(true);
      reachedEnd.current = false;
    }

    isInitialLoad.current = false;
  }, [data, page, limit]);

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

  if (isLoading) {
    return <LoadingSpinner isOpen={true} />
  }

  if (error && page == 1) {
    return (
      <div className="bg-[#fff] max-w-[448px] mx-auto overflow-scroll h-screen [&::-webkit-scrollbar]:hidden scroll-smooth flex flex-col items-center justify-center">
        <h1>No collection found of this user.</h1>
      </div>
    )
  }


  return (
    <div className="bg-[#fff] max-w-[448px] mx-auto overflow-scroll h-screen [&::-webkit-scrollbar]:hidden scroll-smooth flex flex-col items-center justify-start">
      <div className="flex flex-col items-center justify-center w-full ">
        <div className="flex items-center justify-between w-full px-[15px] py-2 border-b-[1px] border-b-[#f0f2f5]">
          <div className="flex items-center justify-start gap-2">
            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg">
              <img
                src={!userDetails.profile_image ? "/images/profileImage.webp" : `${CDN_URL + "/images" + userDetails.profile_image}`}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-[14px] font-semibold font-inter text-[#000] ">
              {userDetails.name}
            </h1>
          </div>
        </div>

        <div className="flex flex-col w-full items-center justify-center gap-5 px-[15px] py-[26px]">
          <div className="flex flex-col items-start justify-center w-full ">
            <h3 className="text-[14px] text-[#000] font-bold font-inter mb-1">
              Shop Products Curated Just for You
            </h3>
            <p className="txet-[10px] text-[#000] font-medim font-inter">
              Handpicked recommendations you’ll love.
            </p>
          </div>
          <div className="flex flex-col items-start justify-start gap-[24px] overflow-scroll [&::-webkit-scrollbar]:hidden  scroll-smooth w-full pb-10">
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
                        {/* {collection.name} */}
                        {collection.name}
                      </h2>
                      <p className="text-[10px] text-[#a4a4a4] ">
                        {new Date(collection.updated_at).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour12: true,
                          }
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Product Scroll Area */}
                  <div className="flex overflow-x-auto gap-2.5 pb-1 [&::-webkit-scrollbar]:hidden scroll-smooth max-w-full pl-[15px]">
                    {/* {products.map((product: any, index: number) => {                      */}
                    {collection.products.map((image: any, index: any) => {
                      return (
                        <Image
                          key={image.id}
                          className={`h-full max-h-[90px] min-h-[90px] w-fit max-w-[110px] min-w-[110px]  object-contain bg-[#fff] rounded-[5px] ${index === collection.products.length - 1 && "mr-[15px]"}`}
                          src={image.img_url}
                          alt="product"
                          height={120}
                          width={160}
                        />
                      );
                    })}
                  </div>
                </div>

                <ReplyIcon
                  sx={{
                    transform: "scale(-1, 1)",
                    position: "absolute",
                    right: "10px",
                    top: "7px",
                    cursor: "pointer",
                    color: "#222 !important",
                  }}
                  onClick={() => handleShare(`${WEBSITE_URL}/preview/${uid}/${collection.id}`)}
                />

                {/* View Collection Button */}
                <button
                  onClick={() =>
                    // router.push(`/profile/collection_view?id=${collection.id}`)
                    router.push(`/preview/${uid}/${collection.id}`)
                  }
                  className="w-full cursor-pointer bg-[rgba(222,44,109,1)] text-white py-1.5 rounded-b-[7px] text-[10px] font-medium mt-2"
                >
                  View Collection
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPReviewPage;
