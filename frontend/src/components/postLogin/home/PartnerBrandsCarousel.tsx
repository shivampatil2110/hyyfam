// components/PartnerBrandsCarousel.tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { motion, PanInfo, useAnimation } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useGetTaskQuery } from "@/redux/api/homeApi";

// Define types for our data
interface CardData {
  id: string;
  title: string;
  image: string;
  backgroundColor?: string;
}

interface PartnerBrandsCarouselProps {
  autoScrollInterval?: number;
}

const PartnerBrandsCarousel = ({
  autoScrollInterval = 3000,
}: PartnerBrandsCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);
  const thumbnailControls = useAnimation();
  const router = useRouter();

  const { data: cards = [], isLoading } = useGetTaskQuery({
    type: "",
  });

  // Auto-scroll thumbnails to center the active one
  useEffect(() => {
    if (thumbnailContainerRef.current && cards.length > 0) {
      const container = thumbnailContainerRef.current;
      const thumbnailWidth = 76; // 60px width + 8px margin on each side
      const containerWidth = container.clientWidth;

      // Calculate the scroll position to center the active thumbnail
      const scrollPosition =
        currentIndex * thumbnailWidth - containerWidth / 2 + thumbnailWidth / 2;

      container.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      });
    }
  }, [currentIndex, cards.length]);

  const handleCardClick = (cardName: string) => {
    if (isDragging) return;
    const slug = cardName.toLowerCase().replace(/\s+/g, "-");
    router.push(`/bank-offers/${slug}`);
  };

  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    setIsDragging(false);

    const swipeThreshold = 50;

    if (Math.abs(info.offset.x) > swipeThreshold) {
      if (info.offset.x > 0 && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      } else if (info.offset.x < 0 && currentIndex < cards.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    }
  };

  // if (isLoading) {
  //     return <div className="w-full py-6 text-center">Loading...</div>;
  // }

  if (!cards.length) {
    return null;
  }

  const getVisibleCards = () => {
    const visibleCards = [];

    // Previous card
    if (currentIndex > 0) {
      visibleCards.push({
        ...cards[currentIndex - 1],
        position: "prev",
        index: currentIndex - 1,
      });
    }

    // Current card
    visibleCards.push({
      ...cards[currentIndex],
      position: "current",
      index: currentIndex,
    });

    // Next card
    if (currentIndex < cards.length - 1) {
      visibleCards.push({
        ...cards[currentIndex + 1],
        position: "next",
        index: currentIndex + 1,
      });
    }

    return visibleCards;
  };

  return (
    <div className="w-full py-6">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-[20px] font-inter font-medium">
            Bank Offers
          </h2>
          <Link
            href="/bank-offers"
            className="text-[#f1437e] hover:text-[#f14373] font-raleway text-[14px] font-semibold underline"
          >
            View All
          </Link>
        </div>

        {/* Main Carousel */}
        <div className="relative h-50 flex items-center justify-center overflow-hidden">
          <motion.div
            className="flex items-center justify-center w-full"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={handleDragEnd}
          >
            {getVisibleCards()?.map((card) => {
              const taskMeta = JSON.parse(card?.task_meta);
              return (
                            <div
                                key={`${card.task_id}-${card.position}`}
                                className={`absolute transition-all duration-300 cursor-pointer ${
                                    card.position === 'prev' 
                                        ? 'left-[-250px] opacity-40 transform scale-100 z-10' 
                                        : card.position === 'next'
                                        ? 'right-[-250px] opacity-40 transform scale-100 z-10'
                                        : 'opacity-100 transform scale-100 z-20  rounded-[9px]'
                                }`}
                                onClick={() => {
                                    if (!isDragging) {
                                        if (card.position === 'prev' || card.position === 'next') {
                                            setCurrentIndex(card.index);
                                        } else {
                                            handleCardClick(card.title || '');
                                        }
                                    }
                                }}                >
                  {/* Card Container */}
                  <div
                    style={{
                      background: `url(${card?.url})`,
                      // backgroundImage: "url(/static/CreditCardImg.png)",
                      backgroundSize: "contain",
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "center",
                    }}
                        className={`rounded-lg overflow-hidden ${
                                    card.position === 'current' ? 'w-68 h-48' : 'w-68 h-48'
                                }`}
                  >
                   <div className="  flex flex-col justify-start items-start mt-[23%] ml-[35%] w-[63%]">
                    {/* Tags Section - Top */}
                    {taskMeta?.tags && taskMeta.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 justify-start">
                        {taskMeta.tags.map((tag: any, tagIndex: number) => {
                          return (
                            <div
                              key={tagIndex}
                              className="flex items-center gap-1 rounded-[16px] px-[5px] py-0.5 bg-[#e9f6ff] border-[0.3px] border-[#8fbff2]"
                            >
                              <svg
                            //   className="scale-160"
                                xmlns="http://www.w3.org/2000/svg"
                                width="6"
                                height="6"
                                viewBox="0 0 6 6"
                                fill="none"
                              >
                                <path
                                  d="M2.8382 0.00428696C2.93645 0.00428696 3.0332 0.010662 3.1232 0.025662C3.21184 0.0372767 3.29929 0.0565999 3.38458 0.083412C3.47008 0.109287 3.5537 0.141537 3.63733 0.182037C3.7187 0.220662 3.80233 0.267912 3.88595 0.319287C4.02733 0.409287 4.16645 0.482037 4.3082 0.540162C4.58725 0.651849 4.88234 0.718309 5.18233 0.737037C5.33458 0.747912 5.49095 0.754287 5.6537 0.754287V2.25429C5.6537 2.53929 5.61733 2.80929 5.54458 3.06654C5.47469 3.32012 5.37539 3.56465 5.2487 3.79516C5.12254 4.02535 4.97327 4.24209 4.8032 4.44204C4.63052 4.64653 4.44355 4.83851 4.2437 5.01654C4.04121 5.19509 3.82793 5.36103 3.60508 5.51341C3.38233 5.66791 3.15733 5.81154 2.93233 5.94204L2.84233 5.99566L2.75233 5.94204C2.52103 5.80813 2.2951 5.66514 2.07508 5.51341C1.85097 5.36274 1.63759 5.19672 1.43645 5.01654C1.23672 4.8385 1.04988 4.64652 0.877325 4.44204C0.70771 4.24124 0.557772 4.02462 0.429575 3.79516C0.30505 3.56363 0.205851 3.31934 0.1337 3.06654C0.060489 2.80206 0.0243937 2.5287 0.0264504 2.25429V0.754287C0.189575 0.754287 0.34595 0.747912 0.4982 0.737037C0.648073 0.726627 0.796976 0.705194 0.9437 0.672912C1.08733 0.640662 1.23095 0.597912 1.37233 0.540162C1.51903 0.480955 1.65968 0.407741 1.79233 0.321537C1.95733 0.214287 2.12458 0.135162 2.28958 0.083037C2.46727 0.0285613 2.65235 0.00199514 2.8382 0.00428696ZM5.27645 1.12291C4.99259 1.10914 4.71136 1.06168 4.4387 0.981537C4.16748 0.900633 3.90914 0.781565 3.67145 0.627912C3.54816 0.546986 3.41427 0.483509 3.27358 0.439287C3.13304 0.396813 2.98689 0.375826 2.84008 0.377037C2.69217 0.37608 2.54495 0.397058 2.4032 0.439287C2.2623 0.482071 2.12858 0.545647 2.00645 0.627912C1.76835 0.782403 1.50934 0.901993 1.23733 0.983037C0.97145 1.06029 0.6932 1.10754 0.40145 1.12479V2.25616C0.40145 2.50479 0.4337 2.74254 0.4982 2.97166C0.56391 3.1988 0.654457 3.41799 0.7682 3.62529C0.883306 3.83474 1.01898 4.03221 1.1732 4.21479C1.32958 4.39891 1.49645 4.57029 1.67645 4.73304C1.85645 4.89616 2.04508 5.04616 2.24233 5.18529C2.44145 5.32479 2.64095 5.45116 2.84008 5.56666C3.04397 5.44796 3.24277 5.32072 3.43595 5.18529C3.6345 5.0466 3.82413 4.89555 4.0037 4.73304C4.1837 4.57029 4.35095 4.39891 4.50733 4.21479C4.66157 4.03222 4.79724 3.83475 4.91233 3.62529C5.02557 3.41825 5.11477 3.19896 5.1782 2.97166C5.24466 2.73902 5.27774 2.49811 5.27645 2.25616V1.12291Z"
                                  fill="#216CB5"
                                />
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M4.23655 1.77017L4.07155 1.62842L3.9193 1.64154L2.2843 3.57204L1.72743 2.77704L1.57743 2.75154L1.4038 2.87567L1.37793 3.02567L2.0938 4.04792L2.17518 4.09292L2.34655 4.10342L2.4343 4.06517L4.24743 1.92204L4.23655 1.77017Z"
                                  fill="#216CB5"
                                />
                              </svg>
                              <span className="text-[6px] text-[#216CB5] font-bold uppercase font-inter">
                                {tag}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Features Section - Middle */}
                    {taskMeta?.features && taskMeta.features.length > 0 && (
                      <div className="flex flex-col gap-0.5 mt-3 ">
                        {taskMeta.features.map(
                          (feature: string, featureIndex: number) => (
                            <div
                              key={featureIndex}
                              className="flex items-center gap-1"
                            >
                              {/* <div className="w-1.5 h-1.5 bg-white rounded-full"></div> */}
                              <svg
                              className="scale-80"
                                xmlns="http://www.w3.org/2000/svg"
                                width="12"
                                height="12"
                                viewBox="0 0 12 12"
                                fill="none"
                              >
                                <circle cx="5" cy="5" r="5" fill="#4CAF50" />
                                <path
                                  d="M7.2 3.4L4.5 6.1L2.8 4.4"
                                  stroke="white"
                                  strokeWidth="1"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>

                              <span className="text-[#000] text-[8px] font-medium leading-3">
                                {feature}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    )}

                    <div style={{ backgroundColor: taskMeta?.color || 'rgba(222,44,109,1)' }} className="flex items-center justify-start gap-2 rounded-[14px] px-2.5 mt-2" >
                      {taskMeta?.earn_text && (
                        <div className="flex justify-center">
                          {/* <div className=""> */}
                            <span className="text-[#fff] text-[8px] font-medium uppercase font-inter ">
                              {taskMeta.earn_text}
                            </span>
                          {/* </div> */}
                        </div>
                      )}
                      <div className="arrow-container ">
                        <div className="arrow"></div>
                        <div className="arrow"></div>
                        <div className="arrow"></div>
                      </div>
                    </div>
                  </div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>

        {/* Navigation Dots */}
        <div className="flex justify-center mt-6 space-x-2">
          {Array.isArray(cards) &&
            cards?.map((_: any, index: any) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex ? "bg-gray-800 w-8" : "bg-gray-300 w-2"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
        </div>
        {/* Thumbnails */}
        <div
          ref={thumbnailContainerRef}
          className="mt-6 flex items-center space-x-2 h-16 overflow-x-auto [&::-webkit-scrollbar]:hidden scroll-smooth pb-2"
        >
          {Array.isArray(cards) &&
            cards?.map((card: any, index: any) => (
              <div
                key={card.task_id}
                onClick={() => setCurrentIndex(index)}
                className={`flex-shrink-0 cursor-pointer rounded transition-all ml-1 mr-1.5 duration-300 ${
                  index === currentIndex
                    ? " scale-110 p-[3px] rounded-[3px] border-[0.8px] border-[#2686e3] "
                    : "opacity-60 hover:opacity-80"
                }`}
              >
                <Image
                  src={card?.task_meta?.img }
                  alt={card.task_short_name}
                  width={60}
                  height={40}
                  className="w-15 h-10 object-cover rounded"
                />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default PartnerBrandsCarousel;
