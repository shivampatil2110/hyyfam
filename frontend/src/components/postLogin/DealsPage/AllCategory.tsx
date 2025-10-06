"use client";
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import Image from "next/image";
import { ProductGrid } from "./ProductsMapping";
import { useGetDealsMutation } from "@/redux/api/productsApi";
import { useGetBannersQuery } from "@/redux/api/homeApi";

interface CarouselSlide {
  id: number;
  image: string;
}

interface Stores {
  brandImg: string;
  helperImg: string;
  storeId: number;
}

interface Products {
  storeIcon: string;
  image: string;
  commission: string;
  title: string;
  actualPrice: number;
  discountedPrice: number;
  discount: string;
}

const AllCategory = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [deals, setDeals] = useState<any[]>([]);
  const [sidArr, setSidArr] = useState<any[]>([]);
  const { data: banners } = useGetBannersQuery();
  const [getDeals, { isLoading }] = useGetDealsMutation();
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  // const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement | null>(null);

  // Touch/scroll handling states
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const observerRef = useRef<HTMLDivElement | null>(null);
  const wheelTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const minSwipeDistance = 50;

  const slides: CarouselSlide[] =
    banners?.map((banner: any, index: number) => ({
      id: banner.img_id || index,
      image: banner.image,
    })) || [];

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToNext = () => {
    setCurrentSlide((prevIndex) =>
      prevIndex === slides.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToPrev = () => {
    setCurrentSlide((prevIndex) =>
      prevIndex === 0 ? slides.length - 1 : prevIndex - 1
    );
  };

  // Touch event handlers
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsDragging(false);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
    if (touchStart && Math.abs(e.targetTouches[0].clientX - touchStart) > 10) {
      setIsDragging(true);
    }
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrev();
    }

    // Reset dragging state after short delay
    setTimeout(() => {
      setIsDragging(false);
    }, 100);
  };

  // Mouse event handlers
  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsMouseDown(true);
    setTouchStart(e.clientX);
    setTouchEnd(null);
    setIsDragging(false);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown || !touchStart) return;

    e.preventDefault();
    setTouchEnd(e.clientX);

    const distance = Math.abs(e.clientX - touchStart);
    if (distance > 10) {
      setIsDragging(true);
    }
  };

  const onMouseUp = () => {
    if (!isMouseDown) return;

    setIsMouseDown(false);

    if (touchStart && touchEnd) {
      const distance = touchStart - touchEnd;
      const isLeftSwipe = distance > minSwipeDistance;
      const isRightSwipe = distance < -minSwipeDistance;

      if (isLeftSwipe) {
        goToNext();
      } else if (isRightSwipe) {
        goToPrev();
      }
    }

    // Reset states
    setTouchStart(null);
    setTouchEnd(null);

    setTimeout(() => {
      setIsDragging(false);
    }, 150);
  };

  const onMouseLeave = () => {
    if (isMouseDown) {
      setIsMouseDown(false);
      setTouchStart(null);
      setTouchEnd(null);
      setTimeout(() => {
        setIsDragging(false);
      }, 150);
    }
  };

  const onWheel = (e: React.WheelEvent) => {
    if (wheelTimeoutRef.current) return;

    const deltaX = e.deltaX || e.deltaY;

    if (Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        goToNext();
      } else {
        goToPrev();
      }

      wheelTimeoutRef.current = setTimeout(() => {
        wheelTimeoutRef.current = null;
      }, 300);
    }
  };

  // Cleanup wheel timeout
  useEffect(() => {
    return () => {
      if (wheelTimeoutRef.current) {
        clearTimeout(wheelTimeoutRef.current);
      }
    };
  }, []);

  // Auto slide
  useEffect(() => {
    const autoSlide = setInterval(() => {
      setCurrentSlide((prevIndex) =>
        prevIndex === slides.length - 1 ? 0 : prevIndex + 1
      );
    }, 6000);

    return () => clearInterval(autoSlide);
  }, [slides.length]);

  const handleStoreClick = (prodId: number): any => {
    setSidArr([prodId]);
    setPage(0);
    // getDealsData();
  };

    const getDealsData = useCallback(
    async (customSidArr?: number[]) => {
      try {
        const currentSidArr = customSidArr || sidArr;
        const data = await getDeals({
          page,
          sid_arr: currentSidArr,
        }).unwrap();
        if (data.data.length === 0) {
          setHasMore(false);
        } else {
          if (currentSidArr?.length > 0 && page === 0) {
            setDeals(data.data);
          } else {
            setDeals((prev) => [...prev, ...data.data]);
          }
        }
      } catch (err) {
        setHasMore(false);
      }
    },
    [page, sidArr, getDeals]
  );

    useEffect(() => {
    getDealsData();
    // console.log(sidArr, "checking if sid is set every time on click")
  }, [getDealsData]);

  // Infinite Scroll
  useEffect(() => {
    if (!hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1.0 }
    );

    const currentRef = observerRef.current;
    if (currentRef) observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [hasMore, isLoading]);

  const stores: Stores[] = [
    {
      brandImg: "/storeimages/Store22.png",
      helperImg: "/storeimages/Store2.png",
      storeId: 1,
    },
    {
      brandImg: "/storeimages/Store33.png",
      helperImg: "/storeimages/Store3.png",
      storeId: 9,
    },
    {
      brandImg: "/storeimages/Store44.png",
      helperImg: "/storeimages/Store4.png",
      storeId: 7,
    },
    {
      brandImg: "/storeimages/Store55.png",
      helperImg: "/storeimages/Store5.png",
      storeId: 13,
    },
    {
      brandImg: "/storeimages/Store66.png",
      helperImg: "/storeimages/Store6.png",
      storeId: 10,
    },
    {
      brandImg: "/storeimages/Store77.png",
      helperImg: "/storeimages/Store7.png",
      storeId: 15,
    },
  ];

  // const nextSlide = () => {
  //   setCurrentSlide((prev) => (prev + 1) % slides.length);
  // };

  // const prevSlide = () => {
  //   setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  // };

  // useEffect(() => {
  //   if (!isAutoPlaying) return;

  //   const interval = setInterval(nextSlide, 5000);
  //   return () => clearInterval(interval);
  // }, [isAutoPlaying]);

  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  return (
    <div className="w-full pt-[30px] flex flex-col items-center justify-center gap-[33px]">
      <div className="flex flex-col items-center justify-center w-full rounded-sm overflow-hidden px-[15px]">
        <div
           className="relative flex w-full h-46 rounded-sm"
           onMouseEnter={handleMouseEnter}
           onMouseLeave={handleMouseLeave}
           >
          {/* Main Carousel */}
            <div
              className="relative h-full w-full rounded-sm overflow-hidden"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseLeave}
              onWheel={onWheel}
    style={{
      cursor: isMouseDown ? "grabbing" : "grab",
      touchAction: "pan-y",
      userSelect: "none",
      WebkitUserSelect: "none",
      MozUserSelect: "none",
    }}
  >
    {/* Slides Container */}
    <div
      ref={carouselRef}
      className="flex transition-transform duration-300 ease-in-out h-full"
      style={{
        transform: `translateX(-${currentSlide * 100}%)`,
      }}
    >
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          style={{
            minWidth: "100%",
            maxWidth: "100%",
          }}
          className="flex-shrink-0 flex items-center justify-center h-full w-full rounded-sm"
        >
          {/* Image Container */}
          <div className="relative w-full h-full rounded-sm">
            <Image
              src={slide.image}
              // src={'/static/BannerImage2.jpg'}
              alt={`Slide ${slide.id}`}
              height={140}
              width={250}
              className="object-cover w-full h-full rounded-sm"
              priority={index === 0}
            />
          </div>
        </div>
      ))}
    </div>
  </div>
</div>
        {/* Dot Indicators - Below the image */}
        <div className="flex justify-center space-x-1 mt-4 w-full">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={` rounded-[11px] transition-all duration-300 ${
                index === currentSlide
                  ? "bg-[#878787] scale-125 w-[22px] h-[3px]"
                  : "bg-[#d2cac9] hover:bg-gray-600 w-[7px] h-[3px]"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col items-start justify-start gap-1.5 w-full ">
        <h2 className="text-[#000] text-[21px] font-inter font-medium leading-4.5 px-[15px]">
          Spot Light <span className="text-[rgba(222,44,109,1)]">BRANDS</span>
        </h2>
        <p className="leading-[19px] text-[#000] text-[10px] font-inter font-medium px-[15px] ">
          Brands you absolutely can't miss
        </p>
        <div className="mt-1.5 pl-[15px] w-full flex items-center justify-start gap-3 overflow-x-auto [&::-webkit-scrollbar]:hidden scroll-smooth">
          {stores.map((store, index) => (
            <div
              key={index}
              onClick={() => handleStoreClick(store.storeId)}
              style={{
                boxShadow: "0px 1px 2.7px 0px rgba(0, 0, 0, 0.18)",
              }}
              className={`rounded-sm bg-[#fff] cursor-pointer min-w-18 ${
                index === stores.length - 1 ? "mr-2" : ""
              }`}
            >
              <Image
                src={store.helperImg}
                alt="imagee"
                width={100}
                height={90}
                className="rounded-t-sm "
              />

              <div className="flex items-center justify-center py-1">
                <Image
                  src={store.brandImg}
                  alt="imagee"
                  width={50}
                  height={50}
                  className="rounded-t-sm object-contain"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-start justify-start  w-full mt-3.5 px-[15px]">
        <h2 className="text-[#000] text-[21px] font-inter font-medium leading-4.5 ">
          Featured <span className="text-[rgba(222,44,109,1)]">THIS WEEK</span>
        </h2>

        <div className="w-full flex items-end justify-between">
          <p className="leading-[19px] text-[#000] text-[10px] font-inter font-medium ">
            Save More, Shop Smart
          </p>
        </div>
        <ProductGrid products={deals} />
        <div
          ref={observerRef}
          className="h-10 w-full flex justify-center items-center mt-4"
        >
          {isLoading && (
            <span className="text-sm text-gray-500">Loading more...</span>
          )}
          {!hasMore && (
            <span className="text-sm text-gray-400">No more products</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllCategory;
