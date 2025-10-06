"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  useGetBonusStatusQuery,
  useGetBestEarningQuery,
} from "@/redux/api/homeApi";
import { useRouter } from "next/navigation";
import Image from "next/image";
import SlideUpModal from "../home/SlideUpModal";
import { useAppSelector } from "@/redux/store";

const Task = () => {
  const { data, isLoading, isFetching } = useGetBonusStatusQuery();
  const router = useRouter();
  const {
    isInstaAuthenticated,
    isInstagramFollowersSatisfied,
    isInstagramPermissionsSatisfied,
    isInstagramReverificationRequired,
  } = useAppSelector((state) => state.auth);
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  

  // Touch/scroll handling states
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const tasks = [
    {
      id: "connect_social",
      title: "Connect your socials",
      description: "Link your Instagram to Hyyfam",
      completed: data?.connect_social,
      route: "/verification",
    },
    {
      id: "create_collection",
      title: "Custom Collection",
      description:
        "Create any three custom collections with your favourite product links.",
      completed: data?.create_collection,
      route: "/create/collection_generator",
    },
    {
      id: "generate_link",
      title: "Generate product link",
      description: "Generate 3 affiliate links",
      completed: data?.generate_link,
      route: "/create/link_generator",
    },
    {
      id: "setup_schedule",
      title: "Schedule your post",
      description: "Plan and set your insta post in advance",
      completed: data?.setup_schedule,
      route: "/profile/select_post",
    },
  ];

  // Clean up wheel timeout on unmount
  useEffect(() => {
    return () => {
      if (wheelTimeoutRef.current) {
        clearTimeout(wheelTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const autoSlide = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === tasks.length - 1 ? 0 : prevIndex + 1
      );
    }, 6000); // 6 seconds

    return () => clearInterval(autoSlide); // Cleanup interval on component unmount
  }, [tasks.length]);

  const goToSlide = (index: any) => {
    setCurrentIndex(index);
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === tasks.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToPrev = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? tasks.length - 1 : prevIndex - 1
    );
  };

  const handleTaskClick = (route : any) => {
    if (!isDragging) {
      if(isInstaAuthenticated) {
        if(isInstagramFollowersSatisfied && isInstagramPermissionsSatisfied && !isInstagramReverificationRequired) {
          router.push(route);
        } else {
          setIsModalOpen(true);
        }
      } else {
        router.push("/verification");
      }
    }
  };

  // Touch event handlers
  const onTouchStart = (e: any) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsDragging(false);
  };

  const onTouchMove = (e: any) => {
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

    // Reset dragging state after a short delay to prevent accidental clicks
    setTimeout(() => {
      setIsDragging(false);
    }, 100);
  };

  // Mouse event handlers for desktop (simplified and more reliable)
  const onMouseDown = (e: any) => {
    e.preventDefault();
    setIsMouseDown(true);
    setTouchStart(e.clientX);
    setTouchEnd(null);
    setIsDragging(false);
  };

  const onMouseMove = (e: any) => {
    if (!isMouseDown || !touchStart) return;
    
    e.preventDefault();
    setTouchEnd(e.clientX);
    
    const distance = Math.abs(e.clientX - touchStart);
    if (distance > 10) {
      setIsDragging(true);
    }
  };

  const onMouseUp = (e: any) => {
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
    
    // Reset dragging state after a short delay
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

  // Wheel event handler for desktop scroll (throttled)
   const wheelTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const onWheel = (e: any) => {
    // e.preventDefault();
    
    // Throttle wheel events to prevent rapid firing
    if (wheelTimeoutRef.current) return;
    
    const deltaX = e.deltaX || e.deltaY;
    
    if (Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        goToNext();
      } else {
        goToPrev();
      }
      
      // Set timeout to throttle wheel events
      wheelTimeoutRef.current = setTimeout(() => {
        wheelTimeoutRef.current = null;
      }, 300);
    }
  };

  return (
    <>
      <div
        style={{
          background: "#fff",
        }}
        className="w-full px-[15px] pb-5  flex flex-col items-start justify-start gap-0"
      >
        <div className="w-full flex items-center justify-between ">
          <div className="flex flex-col items-center justify-center gap-1 pt-5 pb-0 w-full">
            <div className="flex items-center justify-center gap-2.5 py-2.5 px-[9px] bg-[#e82f6d] w-fit rounded-[10px]">
              <Image
                src={"/static/HyyFamNewWhite.png"}
                alt="logo"
                height={40}
                width={90}
              />
              <p className="text-[16px] leading-5.5 text-[#fff] font-raleway font-bold">
                GIVEAWAYS!
              </p>
            </div>

            <div className="flex items-center justify-between gap-3 pr-2 pb-5 w-full ">
              <div className="flex flex-col items-start justify-center">
                <h3 className="text-[#000] text-[20px] font-semibold leading-normal font-raleway">
                  {" "}
                  Want ₹400 Free Instantly!
                </h3>
                <p className="text-[#757575] text-[13px] font-semibold font-raleway leading-6">
                  You got it, Fam! 
                </p>
              </div>
              <Image
                src={"/static/NoteCoin.png"}
                alt="logo"
                height={100}
                width={100}
              />
            </div>
          </div>
        </div>

        <div className="w-full max-w-[450px] mx-auto">
          {/* Carousel Container */}
          <div className="relative w-full">
            {/* Fixed Frame with Border */}
            <div
              className="border-[1px] border-[#f1437e] rounded-[25px] py-[5px] px-[1px] bg-[#fff] overflow-hidden w-full select-none"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseLeave}
              onWheel={onWheel}
              style={{ 
                cursor: isMouseDown ? 'grabbing' : 'grab',
                touchAction: 'pan-y',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                MozUserSelect: 'none'
              }}
            >
              {/* Cards Container */}
              <div
                ref={carouselRef}
                className="flex transition-transform duration-300 ease-in-out h-full"
                style={{
                  transform: `translateX(-${currentIndex * 100}%)`,
                }}
              >
                {tasks.map((task, index) => (
                  <div
                    key={task.id}
                    style={{
                      minWidth: "calc(100% - 8px)",
                      maxWidth: "calc(100% - 8px)",
                    }}
                    className="w-full flex-shrink-0 flex items-center justify-between gap-2 rounded-[20px]  bg-[#fff3f9] border-[1px] border-[rgba(0,0,0,0.05)] px-[20px] py-3 mx-1"
                  >
                    {/* Instagram Icon for Connect Social */}
                    {task.id === "connect_social" && (
                     <Image 
                     src={"/static/socials.png"}
                     alt="title_img"
                     height={100}
                     width={140}
                     />
                    )}

                    {/* Collection Icon */}
                    {task.id === "create_collection" && (
                             <Image 
                             className="mr-[10px]"
                     src={"/static/collection.png"}
                     alt="title_img"
                     height={100}
                     width={140}
                     />
                    )}

                    {/* Link Icon */}
                    {task.id === "generate_link" && (
                            <Image 
                            className="ml-[-12px]"
                     src={"/static/product.png"}
                     alt="title_img"
                     height={100}
                     width={145}
                     />
                    )}

                    {/* Schedule Icon */}
                    {task.id === "setup_schedule" && (
                             <Image 
                             className="mr-[10px]"
                     src={"/static/autoDM.png"}
                     alt="title_img"
                     height={100}
                     width={160}
                     />
                    )}

                    <div className="flex flex-col items-start justify-center gap-2 ">
                      <h5 className="m-0 text-[#000] font-raleway text-[16px] leading-[16px] font-semibold ">
                        {task.title}
                      </h5>
                      {task.completed ? (
                        <p className="m-0 text-[16px] text-[#f1437e] font-raleway font-bold leading-[14px] ">
                          Completed!!
                        </p>
                      ) : (
                        <p className="m-0 text-[12px] text-[#747474] font-raleway leading-[17px] ">
                          {task.description}
                        </p>
                      )}

                      {!task.completed && (
                        <button
                          className="px-[12px] py-[11px] flex items-center justify-center gap-[10px] rounded-[22px] font-raleway text-[12px] font-semibold cursor-pointer bg-[#f1437e] text-[#fff] hover:bg-[rgba(222,44,109,0.9)] transition-colors "
                          onClick={() => handleTaskClick(task.route)}
                        >
                          Get ₹100 Now
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            fill="none"
                          >
                            <circle cx="6" cy="6" r="6" fill="white" />
                            <path
                              d="M6.5 8L8.5 5.89474L6.5 4"
                              stroke="#F1437E"
                            />
                            <path
                              d="M3.5 8L5.5 5.89474L3.5 4"
                              stroke="#F1437E"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center mt-3 space-x-2">
            {tasks.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={` rounded-full cursor-pointer transition-colors ${
                  currentIndex === index
                    ? "bg-[#f1437e] w-[38px] h-2.5"
                    : "bg-gray-300 hover:bg-gray-400 w-2.5 h-2.5"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center px-7 py-[14px] gap-5 border-y-[1px] border-y-[#cbcbcb] mb-[26px]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="37"
          height="38"
          viewBox="0 0 37 38"
          fill="none"
        >
          <g clipPath="url(#clip0_3246_17920)">
            <path
              d="M22.5539 18.2068C23.317 18.4612 23.317 19.5388 22.5539 19.7932L18.0745 21.2847C17.0899 21.6131 16.1952 22.1662 15.4615 22.9003C14.7277 23.6345 14.1751 24.5295 13.8473 25.5143L12.3557 29.9913C12.1014 30.7544 11.0237 30.7544 10.7694 29.9913L9.2778 25.512C8.94949 24.5273 8.39634 23.6327 7.66219 22.8989C6.92804 22.1652 6.03308 21.6125 5.04823 21.2847L0.571236 19.7932C0.404133 19.7383 0.258617 19.6321 0.155453 19.4897C0.0522881 19.3472 -0.00326157 19.1759 -0.00326157 19C-0.00326157 18.8241 0.0522881 18.6527 0.155453 18.5103C0.258617 18.3679 0.404133 18.2616 0.571236 18.2068L5.05055 16.7152C6.03497 16.3872 6.92947 15.8344 7.66319 15.1006C8.39692 14.3669 8.94972 13.4724 9.2778 12.488L10.7694 8.00868C10.8242 7.84157 10.9304 7.69606 11.0729 7.59289C11.2153 7.48973 11.3867 7.43418 11.5625 7.43418C11.7384 7.43418 11.9098 7.48973 12.0522 7.59289C12.1947 7.69606 12.3009 7.84157 12.3557 8.00868L13.8473 12.488C14.1754 13.4724 14.7282 14.3669 15.4619 15.1006C16.1956 15.8344 17.0901 16.3872 18.0745 16.7152L22.5539 18.2068ZM34.3453 9.27361C34.4454 9.30677 34.5326 9.37065 34.5944 9.45617C34.6561 9.54169 34.6894 9.6445 34.6894 9.74999C34.6894 9.85548 34.6561 9.95829 34.5944 10.0438C34.5326 10.1293 34.4454 10.1932 34.3453 10.2264L31.6582 11.1213C30.4603 11.5214 29.5214 12.4602 29.1214 13.6581L28.2264 16.3452C28.1933 16.4454 28.1294 16.5325 28.0439 16.5943C27.9583 16.6561 27.8555 16.6893 27.75 16.6893C27.6446 16.6893 27.5417 16.6561 27.4562 16.5943C27.3707 16.5325 27.3068 16.4454 27.2737 16.3452L26.3787 13.6581C26.1825 13.067 25.851 12.5298 25.4106 12.0894C24.9702 11.649 24.4331 11.3175 23.8419 11.1213L21.1548 10.2264C21.0547 10.1932 20.9675 10.1293 20.9057 10.0438C20.844 9.95829 20.8107 9.85548 20.8107 9.74999C20.8107 9.6445 20.844 9.54169 20.9057 9.45617C20.9675 9.37065 21.0547 9.30677 21.1548 9.27361L23.8419 8.37868C24.4331 8.18249 24.9702 7.85099 25.4106 7.41057C25.851 6.97016 26.1825 6.433 26.3787 5.84186L27.2737 3.15474C27.3068 3.05459 27.3707 2.96745 27.4562 2.90568C27.5417 2.84391 27.6446 2.81067 27.75 2.81067C27.8555 2.81067 27.9583 2.84391 28.0439 2.90568C28.1294 2.96745 28.1933 3.05459 28.2264 3.15474L29.1214 5.84186C29.3175 6.433 29.649 6.97016 30.0895 7.41057C30.5299 7.85099 31.067 8.18249 31.6582 8.37868L34.3453 9.27361ZM36.7711 25.6207C36.837 25.6435 36.894 25.6863 36.9345 25.7431C36.9749 25.7998 36.9966 25.8678 36.9966 25.9375C36.9966 26.0072 36.9749 26.0751 36.9345 26.1319C36.894 26.1887 36.837 26.2315 36.7711 26.2543L34.9812 26.8509C34.1811 27.1169 33.5544 27.7436 33.2885 28.5437L32.6919 30.3336C32.669 30.3994 32.6263 30.4565 32.5695 30.4969C32.5127 30.5373 32.4447 30.559 32.375 30.559C32.3054 30.559 32.2374 30.5373 32.1806 30.4969C32.1238 30.4565 32.0811 30.3994 32.0582 30.3336L31.4616 28.5437C31.3298 28.1497 31.1083 27.7918 30.8145 27.498C30.5208 27.2042 30.1628 26.9827 29.7689 26.8509L27.979 26.2543C27.9131 26.2315 27.856 26.1887 27.8156 26.1319C27.7752 26.0751 27.7535 26.0072 27.7535 25.9375C27.7535 25.8678 27.7752 25.7998 27.8156 25.7431C27.856 25.6863 27.9131 25.6435 27.979 25.6207L29.7689 25.024C30.1628 24.8922 30.5208 24.6707 30.8145 24.377C31.1083 24.0832 31.3298 23.7253 31.4616 23.3313L32.0582 21.5437C32.0811 21.4779 32.1238 21.4208 32.1806 21.3804C32.2374 21.34 32.3054 21.3183 32.375 21.3183C32.4447 21.3183 32.5127 21.34 32.5695 21.3804C32.6263 21.4208 32.669 21.4779 32.6919 21.5437L33.2885 23.3336C33.5544 24.1337 34.1811 24.7604 34.9812 25.0264L36.7711 25.6207Z"
              fill="black"
            />
          </g>
          <defs>
            <clipPath id="clip0_3246_17920">
              <rect
                width="37"
                height="37"
                fill="white"
                transform="matrix(0 1 -1 0 37 0.5)"
              />
            </clipPath>
          </defs>
        </svg>

        <p className="text-[#000] text-[16px] font-semibold leading-[23px] font-raleway">
          Create & Complete the Task and win{" "}
          <span className="text-[#f1437e] font-inter">400 </span> Hyyfam points
        </p>
      </div>
      <SlideUpModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              profileComplete={true}
            >
              <div className="bg-[rgba(222,44,109,1)] pt-[4px] rounded-t-[14px]">
                <div className="w-full mx-auto bg-white rounded-t-[14px] shadow-lg overflow-hidden px-[15px] pb-[30px] pt-11 relative flex flex-col items-center justify-center gap-4 ">
                  <button
                    onClick={(e) => {
                      setIsModalOpen(false);
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
                    
                  <h2 className="text-[16px] font-inter font-bold text-[#000] leading-normal text-center">
                    {
                      isInstagramReverificationRequired
                      ? "Instagram Reverification Required"
                      : (isInstagramPermissionsSatisfied || isInstagramFollowersSatisfied )
                      ? "Oh no! Setup Incomplete"
                      : ""
                    }
                  </h2>
                  </div>
      
                  <div className="flex flex-col items-center justify-center gap-3 w-full">
                   { isInstagramReverificationRequired
                      ? (  <div
                      className={`flex items-center justify-start py-3 px-[10px] gap-[10px] w-full rounded-[4px] ${!isInstagramReverificationRequired
                        ? "bg-[#edffdf]"
                        : "bg-[#ffefe8]"
                        }  `}
                    >
                      {!isInstagramReverificationRequired ? (
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
                        <span className="font-bold"></span>{" "}
                        {!isInstagramReverificationRequired
                          ? "Completed"
                          : "It seems you have change your Instagram Password Please sign up on HYYFAM again"}
                      </p>
                    </div>)
                    : (isInstagramPermissionsSatisfied || isInstagramFollowersSatisfied )
                     ? <>
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
                    </>
                    : ""
                  }
                  </div>
                  <button
                    className="mt-4 w-full bg-[rgba(222,44,109,1)] hover:bg-pink-600 text-white font-medium font-inter text-[16px] py-3 rounded-[7px] transition duration-200"
                    onClick={() => {
                      setIsModalOpen(false);
                      router.push("/verification");
                    }}
                  >
                    Complete Setup & Activate Engage
                  </button>
                </div>
              </div>
            </SlideUpModal>
    </>
  );
};

export default Task;