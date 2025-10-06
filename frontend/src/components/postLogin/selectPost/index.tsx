"use client";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useGetInstaPostsQuery } from "@/redux/api/postsApi";
import { showToast } from "@/components/Toast/Toast";
import SelectPost from '@/components/postLogin/createPost'
import EditPosts from "../profile/EditPosts";
import SelectPostLoading from "../LoadingStatesAndModals/SelectPostLoading";
import {
useCheckPostSetupMutation
} from "@/redux/api/postsApi";

interface Post {
  id: string;
  imageUrl: string;
  //   type: string;
  title?: string;
  //   hasVideo?: boolean;
}

const ThreeHourCountdown = ({ startTime }: any) => {
  const THREE_HOURS_MS = 3 * 60 * 60 * 1000;

  const [timeLeft, setTimeLeft] = useState(() => {
    const endTime = new Date(startTime).getTime() + THREE_HOURS_MS;
    const now = Date.now();
    const remaining = endTime - now;
    return remaining > 0 ? remaining : 0;
  });

  useEffect(() => {
    if (timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1000;
        if (newTime <= 0) {
          clearInterval(interval);
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  const formatTime = (ms: any) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hrs = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const mins = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const secs = String(totalSeconds % 60).padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  return (
    <div>
      <p className="font-inter text-[14px] text-white font-medium ">
        <span>{formatTime(timeLeft)}</span>
      </p>
    </div>
  );
};


export default function index() {
  // Sample posts array
  const [selectedPostId, setSelectedPostId] = useState<string>("");
  const [permaLink, setPermaLink] = useState<string>("");
  const [selectedPostImage, setSelectedPostImage] = useState<string>("");
  const [isScheduledPost, setIsScheduledPost] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("Select Post");
  const [schedule, setSchedule] = useState<boolean>(false);

  const router = useRouter();
  const [posts, setPosts] = useState<any[]>([]);
  const lastItemRef = useRef<HTMLDivElement | null>(null);
  const isInitialLoad = useRef(true);
  const isFirstLoad = useRef(true);
  const [isPostScheduled, setIsPostScheduled] = useState(false);
  const [page, setPage] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
    const [checkPostSetup, checkPostSetupState] = useCheckPostSetupMutation();  

  const queryParams = useMemo(() => {
    const params: any = {};
    if (page) params.page = page;
    return params;
  }, [page]);

  const { data = {}, isFetching } = useGetInstaPostsQuery(queryParams);

  // useEffect(() => {
  //   if(isPostScheduled === )
  // }, [isPostScheduled])

  // Handle new data
  useEffect(() => {
    if (!data?.data) return;

    const newPosts = data.data;

    if (isFirstLoad.current) {
      setPosts(newPosts);
      isFirstLoad.current = false;
    } else {
      setPosts((prev) => {
        const existingIds = new Set(prev.map((item: any) => item.id));
        const uniqueNew = newPosts.filter((item: any) => !existingIds.has(item.id));
        return [...prev, ...uniqueNew];
      });
    }

    const newAfter = data.paging?.cursors?.after;
    setNextCursor(newAfter || null);
    setHasMore(!!newAfter);

          if (data.scheduled) {
        setIsScheduledPost(true)
        setTimeRemaining(data.scheduled)
      }else {
    setIsScheduledPost(false);
    setTimeRemaining(""); // or whatever default value you use
  }
  }, [data]);

  // IntersectionObserver
  useEffect(() => {
    if (!hasMore || isFetching || posts.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && nextCursor) {
          setPage(nextCursor); // ⬅️ this is now the ONLY place calling setPage
        }
      },
      { root: null, rootMargin: "100px", threshold: 0.1 }
    );

    const current = lastItemRef.current;
    if (current) observer.observe(current);

    return () => {
      if (current) observer.unobserve(current);
    };
  }, [isFetching, hasMore, posts.length, nextCursor]);

    const changeTab = (currentTab: string) => {
    setActiveTab(currentTab);
    schedule === true ? setSchedule(false) : ""
  }

  const handlePostSelect = (postId: string, imageUrl: string, permalink: string): void => {
    let permanentLink = getShortCode(permalink)
    setSelectedPostId(postId);
    setSelectedPostImage(encodeURIComponent(imageUrl));
    setPermaLink(permanentLink)
  };

  const handleContinue = async () => {
    if (selectedPostId) {
     const response =  await checkPostSetup({post_id: selectedPostId}).unwrap();

      if(response.isPostSetup) {
        changeTab("Edit Post");
      } else {
        changeTab("Create Post")
      }

      // setActiveTab("Create Post");
    } else {
      showToast({
        message: "Please select a post to continue",
        type: 'warning'
      });
    }
  };

  const handleSchedulePost = (val : boolean) : void => {
    setIsPostScheduled(val);
  }

  const getShortCode = (permalink: string) => {
    const patterns = [
      /instagram\.com\/p\/([A-Za-z0-9_-]+)/,
      /instagram\.com\/reel\/([A-Za-z0-9_-]+)/,
      /instagram\.com\/tv\/([A-Za-z0-9_-]+)/
    ];
    for (const pattern of patterns) {
      const match = permalink.match(pattern);
      if (match) {
        return match[1];
      }
    }
    return "";
  }

  return (
    <>
   
{activeTab === "Select Post" && (
  <div className="min-h-screen font-inter">
        <div className="pb-20  flex flex-col items-center justify-start w-full">
        <div className="w-full flex items-center justify-start gap-[14px] py-[18px] border-b-[1px] border-b-[#f0f2f5] px-[15px]">
          <svg
            onClick={() => router.push("/create")}
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
            Select a Post
          </p>
        </div>
        {
          isScheduledPost ?
            <div className="flex flex-col items-center justify-center gap-1.5 w-full px-[15px] py-4.5 bg-[#f8f8f8]">
              <div className="px-8 py-[26px] bg-[#fff] w-full flex flex-col items-center justify-center gap-[14px] rounded-[8px] border-[1px] border-dashed border-[rgba(222,44,109,1)]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="26"
                  viewBox="0 0 28 26"
                  fill="none"
                >
                  <path
                    d="M24.7528 8.4773C24.7838 8.2511 24.8 8.0249 24.8 7.8C24.8 4.7073 21.9069 2.2256 18.6966 2.6455C17.7611 1.0426 15.9791 0 14 0C12.0209 0 10.2389 1.0426 9.30335 2.6455C6.0863 2.2256 3.2 4.7073 3.2 7.8C3.2 8.0249 3.2162 8.2511 3.24725 8.4773C1.5827 9.3795 0.5 11.0955 0.5 13C0.5 14.9045 1.5827 16.6205 3.24725 17.5227C3.2161 17.7472 3.20032 17.9735 3.2 18.2C3.2 21.2927 6.0863 23.7679 9.30335 23.3545C10.2389 24.9574 12.0209 26 14 26C15.9791 26 17.7611 24.9574 18.6966 23.3545C21.9069 23.7679 24.8 21.2927 24.8 18.2C24.8 17.9751 24.7838 17.7489 24.7528 17.5227C26.4173 16.6205 27.5 14.9045 27.5 13C27.5 11.0955 26.4173 9.3795 24.7528 8.4773ZM12.5893 18.7408L7.6388 13.9126L9.5612 12.0874L12.6082 15.0592L18.4496 9.477L20.3504 11.323L12.5893 18.7408Z"
                    fill="#00BA00"
                  />
                </svg>

                <div className="flex flex-col items-center justify-center gap-[9px] ">
                  <p className="text-[12px] text-[#000] leading-[13px] font-inter font-bold text-center">
                    Your Upcoming Post is All Set!
                  </p>

                  <p className="text-[12px] text-[#000] leading-[16px] font-inter font-medium text-center">
                    Once you upload your post, make sure to <span className="font-bold">drop the first comment</span>  to activate It.

                  </p>
                  <button
                    className="bg-[rgba(222,44,109,1)] hover:bg-pink-600  p-1  rounded-sm transition duration-200 w-36 mt-1.5 flex items-center justify-center gap-1.5"
                  >
                    <ThreeHourCountdown startTime={timeRemaining} />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="15"
                      viewBox="0 0 12 13"
                      fill="none"
                    >
                      <path
                        d="M6 3.44444V6.5H9.05556M6 12C5.27773 12 4.56253 11.8577 3.89524 11.5813C3.22795 11.3049 2.62163 10.8998 2.11091 10.3891C1.60019 9.87836 1.19506 9.27205 0.918663 8.60476C0.642262 7.93747 0.5 7.22227 0.5 6.5C0.5 5.77773 0.642262 5.06253 0.918663 4.39524C1.19506 3.72795 1.60019 3.12163 2.11091 2.61091C2.62163 2.10019 3.22795 1.69506 3.89524 1.41866C4.56253 1.14226 5.27773 1 6 1C7.45869 1 8.85764 1.57946 9.88909 2.61091C10.9205 3.64236 11.5 5.04131 11.5 6.5C11.5 7.95869 10.9205 9.35764 9.88909 10.3891C8.85764 11.4205 7.45869 12 6 12Z"
                        stroke="white"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between w-full">
                <p className="text-[#000] font-inter font-normal text-center text-[10px] pl-[2px]">
                  ( You’ve got 3 hours, post now, don’t miss a comment.)
                </p>
                <p className=" font-inter font-normal text-end underline text-blue-700 text-[10px] cursor-pointer" onClick={() => setActiveTab("Edit Post") }>
                  Edit Post
                </p>
              </div>
            </div>
            :
            <div className="flex flex-col items-center justify-center gap-1.5 w-full px-[15px] py-4.5 bg-[#f8f8f8]">
              <div className="px-8 py-[22px] bg-[#fff] w-full flex flex-col items-center justify-center gap-[14px] rounded-[8px] border-[1px] border-dashed border-[#959394]">
                <div className="flex items-center justify-center gap-[14px] w-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="21"
                    height="20"
                    viewBox="0 0 21 20"
                    fill="none"
                  >
                    <path
                      d="M10.4992 9.51797C9.60743 9.51797 8.73566 9.25352 7.99416 8.75807C7.25266 8.26262 6.67474 7.55841 6.33346 6.7345C5.99219 5.91059 5.9029 5.00398 6.07688 4.12933C6.25086 3.25467 6.68029 2.45125 7.31089 1.82065C7.94148 1.19006 8.7449 0.760621 9.61956 0.586641C10.4942 0.412661 11.4008 0.501954 12.2247 0.843228C13.0486 1.1845 13.7529 1.76243 14.2483 2.50393C14.7438 3.24543 15.0082 4.11719 15.0082 5.00899C15.0069 6.20443 14.5314 7.35053 13.6861 8.19584C12.8408 9.04114 11.6947 9.51663 10.4992 9.51797ZM10.4992 1.28125C9.76195 1.28125 9.04123 1.49988 8.4282 1.90949C7.81518 2.3191 7.33739 2.90129 7.05524 3.58244C6.7731 4.2636 6.69928 5.01312 6.84311 5.73623C6.98695 6.45934 7.34198 7.12356 7.86331 7.64489C8.38465 8.16623 9.04887 8.52126 9.77198 8.66509C10.4951 8.80893 11.2446 8.73511 11.9258 8.45296C12.6069 8.17082 13.1891 7.69303 13.5987 7.08001C14.0083 6.46698 14.227 5.74626 14.227 5.00899C14.2258 4.02068 13.8327 3.07318 13.1339 2.37434C12.435 1.6755 11.4875 1.28239 10.4992 1.28125Z"
                      fill="rgba(222,44,109,1)"
                    />
                    <path
                      d="M10.5 7.55649C10.3964 7.55649 10.297 7.51533 10.2238 7.44208C10.1505 7.36882 10.1094 7.26946 10.1094 7.16586V2.85141C10.1094 2.74781 10.1505 2.64845 10.2238 2.5752C10.297 2.50194 10.3964 2.46078 10.5 2.46078C10.6036 2.46078 10.703 2.50194 10.7762 2.5752C10.8495 2.64845 10.8906 2.74781 10.8906 2.85141V7.16586C10.8906 7.26946 10.8495 7.36882 10.7762 7.44208C10.703 7.51533 10.6036 7.55649 10.5 7.55649Z"
                      fill="rgba(222,44,109,1)"
                    />
                    <path
                      d="M12.6559 5.39978H8.3418C8.2382 5.39978 8.13884 5.35863 8.06558 5.28537C7.99233 5.21211 7.95117 5.11276 7.95117 5.00916C7.95117 4.90556 7.99233 4.8062 8.06558 4.73294C8.13884 4.65969 8.2382 4.61853 8.3418 4.61853H12.6559C12.7595 4.61853 12.8588 4.65969 12.9321 4.73294C13.0053 4.8062 13.0465 4.90556 13.0465 5.00916C13.0465 5.11276 13.0053 5.21211 12.9321 5.28537C12.8588 5.35863 12.7595 5.39978 12.6559 5.39978Z"
                      fill="rgba(222,44,109,1)"
                    />
                    <path
                      d="M18.3051 19.7156H2.69492C2.11301 19.7149 1.55515 19.4834 1.14368 19.0719C0.732206 18.6604 0.500724 18.1026 0.5 17.5207L0.5 6.22456C0.500724 5.64269 0.732219 5.08486 1.1437 4.67345C1.55518 4.26205 2.11305 4.03065 2.69492 4.03003H6.42383C6.52743 4.03003 6.62679 4.07118 6.70004 4.14444C6.7733 4.2177 6.81445 4.31705 6.81445 4.42065C6.81445 4.52425 6.7733 4.62361 6.70004 4.69687C6.62679 4.77012 6.52743 4.81128 6.42383 4.81128H2.69492C2.32016 4.81159 1.96082 4.96058 1.69579 5.22554C1.43075 5.4905 1.28166 5.84979 1.28125 6.22456V17.5207C1.28166 17.8955 1.43074 18.2548 1.69576 18.5198C1.96079 18.7848 2.32012 18.9339 2.69492 18.9343H18.3051C18.6799 18.9339 19.0392 18.7848 19.3042 18.5198C19.5693 18.2548 19.7183 17.8955 19.7188 17.5207V6.22456C19.7183 5.84979 19.5693 5.4905 19.3042 5.22554C19.0392 4.96058 18.6798 4.81159 18.3051 4.81128H14.5762C14.4726 4.81128 14.3732 4.77012 14.3 4.69687C14.2267 4.62361 14.1855 4.52425 14.1855 4.42065C14.1855 4.31705 14.2267 4.2177 14.3 4.14444C14.3732 4.07118 14.4726 4.03003 14.5762 4.03003H18.3051C18.8869 4.03065 19.4448 4.26205 19.8563 4.67345C20.2678 5.08486 20.4993 5.64269 20.5 6.22456V17.5207C20.4993 18.1026 20.2678 18.6604 19.8563 19.0719C19.4449 19.4834 18.887 19.7149 18.3051 19.7156Z"
                      fill="rgba(222,44,109,1)"
                    />
                    <path
                      d="M18.5422 18.1465H2.46094C2.35734 18.1465 2.25798 18.1053 2.18472 18.0321C2.11147 17.9588 2.07031 17.8594 2.07031 17.7558V5.98944C2.07031 5.88584 2.11147 5.78648 2.18472 5.71323C2.25798 5.63997 2.35734 5.59882 2.46094 5.59882H6.50117C6.60477 5.59882 6.70413 5.63997 6.77739 5.71323C6.85064 5.78648 6.8918 5.88584 6.8918 5.98944C6.8918 6.09304 6.85064 6.1924 6.77739 6.26565C6.70413 6.33891 6.60477 6.38007 6.50117 6.38007H2.85156V17.3652H18.1516V6.38007H14.502C14.3984 6.38007 14.299 6.33891 14.2257 6.26565C14.1525 6.1924 14.1113 6.09304 14.1113 5.98944C14.1113 5.88584 14.1525 5.78648 14.2257 5.71323C14.299 5.63997 14.3984 5.59882 14.502 5.59882H18.5422C18.6458 5.59882 18.7451 5.63997 18.8184 5.71323C18.8917 5.78648 18.9328 5.88584 18.9328 5.98944V17.7558C18.9328 17.8594 18.8917 17.9588 18.8184 18.0321C18.7451 18.1053 18.6458 18.1465 18.5422 18.1465Z"
                      fill="rgba(222,44,109,1)"
                    />
                    <path
                      d="M2.46051 18.1467C2.39027 18.1467 2.32135 18.1276 2.261 18.0917C2.20066 18.0557 2.15113 18.0042 2.11762 17.9424C2.08411 17.8807 2.06787 17.8111 2.07061 17.7409C2.07335 17.6707 2.09496 17.6026 2.13317 17.5436L6.44762 10.876C6.48098 10.8245 6.52602 10.7815 6.57909 10.7506C6.63216 10.7198 6.69176 10.7018 6.75306 10.6983C6.81436 10.6947 6.87563 10.7057 6.9319 10.7303C6.98817 10.7548 7.03785 10.7923 7.07692 10.8397L12.5679 17.5077C12.6322 17.5878 12.6624 17.6901 12.6518 17.7923C12.6413 17.8945 12.5909 17.9884 12.5115 18.0537C12.4322 18.119 12.3303 18.1505 12.228 18.1412C12.1257 18.1319 12.0311 18.0827 11.9648 18.0042L6.81325 11.7499L2.78981 17.9694C2.75413 18.0241 2.7053 18.0691 2.64777 18.1C2.59024 18.131 2.52585 18.1471 2.46051 18.1467Z"
                      fill="rgba(222,44,109,1)"
                    />
                    <path
                      d="M18.5401 18.1464C18.4416 18.1464 18.3467 18.1091 18.2745 18.0421L13.0593 13.1984L10.58 15.6777C10.5063 15.7488 10.4076 15.7882 10.3052 15.7873C10.2028 15.7864 10.1048 15.7453 10.0324 15.6729C9.95996 15.6005 9.91887 15.5025 9.91798 15.4001C9.91709 15.2977 9.95647 15.199 10.0276 15.1253L12.7729 12.3796C12.8445 12.3081 12.9409 12.2671 13.0421 12.2653C13.1432 12.2635 13.2411 12.301 13.3151 12.3698L18.8061 17.4698C18.8636 17.5233 18.9036 17.5928 18.9209 17.6693C18.9383 17.7458 18.9322 17.8257 18.9035 17.8987C18.8748 17.9717 18.8248 18.0344 18.76 18.0786C18.6952 18.1227 18.6186 18.1464 18.5401 18.1464Z"
                      fill="rgba(222,44,109,1)"
                    />
                    <path
                      d="M18.5401 18.1464C18.4416 18.1464 18.3467 18.1091 18.2745 18.0421L13.0593 13.1984L10.58 15.6777C10.5063 15.7488 10.4076 15.7882 10.3052 15.7873C10.2028 15.7864 10.1048 15.7453 10.0324 15.6729C9.95996 15.6005 9.91887 15.5025 9.91798 15.4001C9.91709 15.2977 9.95647 15.199 10.0276 15.1253L12.7729 12.3796C12.8445 12.3081 12.9409 12.2671 13.0421 12.2653C13.1432 12.2635 13.2411 12.301 13.3151 12.3698L18.8061 17.4698C18.8636 17.5233 18.9036 17.5928 18.9209 17.6693C18.9383 17.7458 18.9322 17.8257 18.9035 17.8987C18.8748 17.9717 18.8248 18.0344 18.76 18.0786C18.6952 18.1227 18.6186 18.1464 18.5401 18.1464Z"
                      fill="rgba(222,44,109,1)"
                    />
                  </svg>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="21"
                    viewBox="0 0 22 21"
                    fill="none"
                  >
                    <path
                      d="M2.43182 20C2.37508 20.0001 2.31888 19.989 2.26651 19.9671C2.18763 19.9344 2.12022 19.879 2.07279 19.808C2.02535 19.737 2.00002 19.6536 2 19.5682V2.72727C2.00052 2.26933 2.18267 1.8303 2.50648 1.50648C2.8303 1.18267 3.26933 1.00052 3.72727 1H19.2727C19.7307 1.00052 20.1697 1.18267 20.4935 1.50648C20.8173 1.8303 20.9995 2.26933 21 2.72727V13.9545C20.9995 14.4125 20.8173 14.8515 20.4935 15.1753C20.1697 15.4991 19.7307 15.6813 19.2727 15.6818H6.92877L2.73713 19.8735C2.69704 19.9136 2.64944 19.9454 2.59706 19.9671C2.54467 19.9888 2.48852 20 2.43182 20ZM3.72727 1.86364C3.49829 1.86386 3.27876 1.95493 3.11684 2.11684C2.95493 2.27876 2.86387 2.49829 2.86364 2.72727V18.5258L6.44469 14.9447C6.48477 14.9046 6.53236 14.8728 6.58475 14.8511C6.63714 14.8293 6.69329 14.8182 6.75 14.8182H19.2727C19.5017 14.818 19.7212 14.7269 19.8832 14.565C20.0451 14.4031 20.1361 14.1835 20.1364 13.9545V2.72727C20.1361 2.49829 20.0451 2.27876 19.8832 2.11684C19.7212 1.95493 19.5017 1.86386 19.2727 1.86364H3.72727Z"
                      fill="rgba(222,44,109,1)"
                    />
                    <path
                      d="M16.8334 12.0835C16.7648 12.0834 16.6973 12.0665 16.6368 12.0341C16.5763 12.0017 16.5248 11.9549 16.4867 11.8979C16.021 11.1976 15.3921 10.6211 14.654 10.2181C13.9159 9.81501 13.0909 9.5975 12.25 9.58429V11.6668C12.2499 11.7473 12.2265 11.8261 12.1826 11.8937C12.1387 11.9612 12.0761 12.0146 12.0026 12.0473C11.929 12.0801 11.8475 12.0908 11.7679 12.0782C11.6883 12.0656 11.6141 12.0303 11.5542 11.9764L7.38753 8.22644C7.34423 8.18731 7.30962 8.13953 7.28593 8.0862C7.26224 8.03286 7.25 7.97515 7.25 7.91679C7.25 7.85843 7.26224 7.80071 7.28593 7.74738C7.30962 7.69404 7.34423 7.64627 7.38753 7.60714L11.5542 3.85714C11.6141 3.80329 11.6883 3.76794 11.7679 3.75536C11.8475 3.74278 11.929 3.75352 12.0026 3.78627C12.0761 3.81902 12.1387 3.87238 12.1826 3.93991C12.2265 4.00743 12.2499 4.08623 12.25 4.16679V6.26595C13.6099 6.37255 14.8796 6.98759 15.8063 7.98852C16.7329 8.98945 17.2484 10.3028 17.25 11.6668C17.2499 11.7562 17.2211 11.8433 17.1678 11.9151C17.1144 11.9869 17.0394 12.0396 16.9538 12.0656C16.9148 12.0775 16.8742 12.0835 16.8334 12.0835ZM8.28926 7.91679L11.4167 10.7313V9.16679C11.4167 9.11206 11.4274 9.05786 11.4484 9.0073C11.4693 8.95673 11.5 8.91079 11.5387 8.87209C11.5774 8.83339 11.6233 8.8027 11.6739 8.78177C11.7244 8.76084 11.7786 8.75009 11.8334 8.75012H12.1621C13.6591 8.74853 15.1029 9.30489 16.2116 10.3106C15.921 9.37632 15.3395 8.55935 14.5519 7.97883C13.7643 7.39831 12.8118 7.0846 11.8334 7.08345C11.7786 7.08349 11.7244 7.07273 11.6739 7.0518C11.6233 7.03087 11.5774 7.00018 11.5387 6.96149C11.5 6.92279 11.4693 6.87684 11.4484 6.82628C11.4274 6.77571 11.4167 6.72151 11.4167 6.66679V5.10225L8.28926 7.91679Z"
                      fill="rgba(222,44,109,1)"
                    />
                    <path
                      d="M9.33336 12.0833C9.23028 12.0834 9.13083 12.0452 9.0542 11.9763L4.88753 8.22629C4.84423 8.18716 4.80962 8.13938 4.78593 8.08605C4.76224 8.03271 4.75 7.975 4.75 7.91664C4.75 7.85828 4.76224 7.80056 4.78593 7.74723C4.80962 7.69389 4.84423 7.64612 4.88753 7.60699L9.0542 3.85699C9.09485 3.82028 9.14234 3.79194 9.19396 3.77359C9.24557 3.75525 9.30029 3.74725 9.355 3.75006C9.4097 3.75287 9.46331 3.76644 9.51277 3.78998C9.56223 3.81353 9.60656 3.84658 9.64324 3.88727C9.67992 3.92796 9.70822 3.97547 9.72652 4.0271C9.74482 4.07873 9.75277 4.13345 9.74991 4.18816C9.74706 4.24286 9.73345 4.29646 9.70986 4.3459C9.68628 4.39534 9.65318 4.43964 9.61246 4.47629L5.78926 7.91664L9.61253 11.357C9.67518 11.4134 9.71925 11.4875 9.73891 11.5695C9.75857 11.6514 9.75291 11.7374 9.72266 11.8161C9.69242 11.8948 9.63902 11.9625 9.56951 12.0102C9.50001 12.0579 9.41767 12.0834 9.33336 12.0833Z"
                      fill="rgba(222,44,109,1)"
                    />
                  </svg>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="19"
                    height="20"
                    viewBox="0 0 19 20"
                    fill="none"
                  >
                    <mask id="path-1-inside-1_1671_16714" fill="white">
                      <path d="M12.2421 8.37514L7.99063 12.8626C7.65231 13.1721 7.14527 13.1532 6.82912 12.8195C6.51297 12.4858 6.49508 11.9506 6.78821 11.5935L11.0396 7.10596C11.3771 6.76773 11.9055 6.76773 12.2421 7.10596C12.5727 7.45675 12.5727 8.02434 12.2421 8.37514ZM4.304 3.26774C3.98615 2.93223 3.47058 2.93223 3.15188 3.26774C2.83402 3.60414 2.83402 4.14834 3.15188 4.48384L4.64745 6.06246C4.9636 6.38627 5.46723 6.38627 5.78339 6.06246C5.87031 5.97071 5.93592 5.85918 5.97427 5.73594C6.07653 5.4265 6.00239 5.08381 5.78339 4.85082L4.304 3.26774ZM7.90794 1.61987H7.9088C7.69405 1.60728 7.48272 1.68464 7.32165 1.83575C7.16144 1.98687 7.06429 2.19914 7.05151 2.42582L6.99697 3.45034L6.93306 4.64936H6.93391C6.90664 5.12339 7.24836 5.53176 7.69745 5.56144H7.74262C8.17213 5.55964 8.52663 5.20523 8.55132 4.7528L8.66978 2.52475C8.68256 2.29807 8.60842 2.075 8.46526 1.90589C8.32209 1.73678 8.12098 1.63514 7.90623 1.62255L7.90794 1.61987ZM4.46762 7.25966L2.35848 7.38649H2.35934C1.92643 7.41977 1.59494 7.80655 1.60687 8.26439C1.61965 8.72224 1.97076 9.08922 2.40449 9.09643H2.44966L4.5605 8.9714L4.56135 8.9723C5.00874 8.94442 5.35046 8.53965 5.3249 8.06741C5.29848 7.59517 4.915 7.23447 4.46761 7.26146L4.46762 7.25966ZM14.3785 13.906C14.1578 13.6757 13.8331 13.5983 13.5399 13.7045C13.4232 13.7458 13.3175 13.8142 13.2306 13.906C12.9144 14.2406 12.9144 14.7821 13.2306 15.1176L14.7261 16.7007C14.8676 16.8986 15.0832 17.0218 15.3175 17.0389C15.551 17.056 15.7811 16.9651 15.9473 16.7898C16.1135 16.6152 16.1987 16.3724 16.1825 16.125C16.1663 15.8777 16.0495 15.6501 15.8621 15.5008L14.3785 13.906ZM16.5805 10.8738L14.4697 10.9988H14.4688C14.2549 11.0105 14.0538 11.113 13.9124 11.2839C13.701 11.5358 13.6482 11.8947 13.7786 12.2014C13.9081 12.509 14.1961 12.7069 14.5149 12.7087H14.5626L15.6985 12.6413L16.6691 12.5837V12.5846C17.1165 12.5576 17.4583 12.1537 17.4335 11.6815C17.4088 11.2093 17.0253 10.8477 16.5779 10.8738L16.5805 10.8738ZM11.3328 14.407C11.118 14.3944 10.9067 14.4718 10.7465 14.6238C10.5863 14.7758 10.49 14.989 10.4789 15.2157L10.3604 17.4419C10.3477 17.6686 10.4218 17.8908 10.565 18.0599C10.7081 18.229 10.9092 18.3315 11.124 18.3432H11.1692C11.3669 18.3468 11.5577 18.2749 11.7077 18.1399C11.8679 17.9879 11.9659 17.7766 11.9787 17.5499L12.0972 15.3236H12.0963C12.1117 15.0951 12.0392 14.8694 11.8961 14.6976C11.7521 14.5249 11.5501 14.4205 11.3328 14.407ZM8.92368 12.3949H8.92453C9.02083 13.065 8.81205 13.7432 8.3604 14.2253L5.27894 17.4751C4.48898 18.309 3.20816 18.309 2.41826 17.4751C1.62836 16.6413 1.62829 15.2894 2.41826 14.4556L5.4971 11.2049C5.95473 10.7227 6.60407 10.5015 7.24235 10.6103L8.27179 9.50482C7.65992 9.21608 6.97904 9.12973 6.31946 9.25836C5.66074 9.38699 5.05313 9.72339 4.57932 10.2244L1.50222 13.486C0.866493 14.1408 0.506033 15.0358 0.500055 15.9731C0.494942 16.9104 0.844328 17.8108 1.47238 18.4736C2.10043 19.1366 2.95346 19.5054 3.84134 19.4999C4.7293 19.4936 5.57721 19.1132 6.19764 18.4421L9.28761 15.1942C9.76142 14.6931 10.0801 14.0527 10.2011 13.3565C10.323 12.6612 10.242 11.9425 9.96935 11.2966L8.92368 12.3949ZM17.528 1.52632C16.905 0.869676 16.0605 0.5 15.1802 0.5C14.2998 0.5 13.4554 0.869699 12.8324 1.52632L9.75595 4.77428C9.28213 5.2753 8.96258 5.91573 8.84072 6.61106C8.71971 7.30726 8.80066 8.02595 9.07421 8.67179L10.1079 7.58519C10.0108 6.91598 10.2195 6.23684 10.6712 5.75563L13.7509 2.49315C14.1301 2.09287 14.6448 1.86801 15.1808 1.86801C15.7177 1.86801 16.2324 2.09289 16.6116 2.49315C17.4016 3.32699 17.4016 4.67893 16.6116 5.51269L13.5328 8.76342C13.1536 9.1628 12.6389 9.38766 12.1029 9.38676C11.9972 9.38676 11.8915 9.37777 11.7875 9.36068L10.7581 10.4635C11.37 10.7522 12.0509 10.8386 12.7104 10.7099C13.3692 10.5813 13.9768 10.2449 14.4506 9.74387L17.5277 6.48232C18.1498 5.82478 18.5 4.93338 18.5 4.00415C18.5 3.07491 18.1497 2.18358 17.5277 1.52597L17.528 1.52632Z" />
                    </mask>
                    <path
                      d="M12.2421 8.37514L7.99063 12.8626C7.65231 13.1721 7.14527 13.1532 6.82912 12.8195C6.51297 12.4858 6.49508 11.9506 6.78821 11.5935L11.0396 7.10596C11.3771 6.76773 11.9055 6.76773 12.2421 7.10596C12.5727 7.45675 12.5727 8.02434 12.2421 8.37514ZM4.304 3.26774C3.98615 2.93223 3.47058 2.93223 3.15188 3.26774C2.83402 3.60414 2.83402 4.14834 3.15188 4.48384L4.64745 6.06246C4.9636 6.38627 5.46723 6.38627 5.78339 6.06246C5.87031 5.97071 5.93592 5.85918 5.97427 5.73594C6.07653 5.4265 6.00239 5.08381 5.78339 4.85082L4.304 3.26774ZM7.90794 1.61987H7.9088C7.69405 1.60728 7.48272 1.68464 7.32165 1.83575C7.16144 1.98687 7.06429 2.19914 7.05151 2.42582L6.99697 3.45034L6.93306 4.64936H6.93391C6.90664 5.12339 7.24836 5.53176 7.69745 5.56144H7.74262C8.17213 5.55964 8.52663 5.20523 8.55132 4.7528L8.66978 2.52475C8.68256 2.29807 8.60842 2.075 8.46526 1.90589C8.32209 1.73678 8.12098 1.63514 7.90623 1.62255L7.90794 1.61987ZM4.46762 7.25966L2.35848 7.38649H2.35934C1.92643 7.41977 1.59494 7.80655 1.60687 8.26439C1.61965 8.72224 1.97076 9.08922 2.40449 9.09643H2.44966L4.5605 8.9714L4.56135 8.9723C5.00874 8.94442 5.35046 8.53965 5.3249 8.06741C5.29848 7.59517 4.915 7.23447 4.46761 7.26146L4.46762 7.25966ZM14.3785 13.906C14.1578 13.6757 13.8331 13.5983 13.5399 13.7045C13.4232 13.7458 13.3175 13.8142 13.2306 13.906C12.9144 14.2406 12.9144 14.7821 13.2306 15.1176L14.7261 16.7007C14.8676 16.8986 15.0832 17.0218 15.3175 17.0389C15.551 17.056 15.7811 16.9651 15.9473 16.7898C16.1135 16.6152 16.1987 16.3724 16.1825 16.125C16.1663 15.8777 16.0495 15.6501 15.8621 15.5008L14.3785 13.906ZM16.5805 10.8738L14.4697 10.9988H14.4688C14.2549 11.0105 14.0538 11.113 13.9124 11.2839C13.701 11.5358 13.6482 11.8947 13.7786 12.2014C13.9081 12.509 14.1961 12.7069 14.5149 12.7087H14.5626L15.6985 12.6413L16.6691 12.5837V12.5846C17.1165 12.5576 17.4583 12.1537 17.4335 11.6815C17.4088 11.2093 17.0253 10.8477 16.5779 10.8738L16.5805 10.8738ZM11.3328 14.407C11.118 14.3944 10.9067 14.4718 10.7465 14.6238C10.5863 14.7758 10.49 14.989 10.4789 15.2157L10.3604 17.4419C10.3477 17.6686 10.4218 17.8908 10.565 18.0599C10.7081 18.229 10.9092 18.3315 11.124 18.3432H11.1692C11.3669 18.3468 11.5577 18.2749 11.7077 18.1399C11.8679 17.9879 11.9659 17.7766 11.9787 17.5499L12.0972 15.3236H12.0963C12.1117 15.0951 12.0392 14.8694 11.8961 14.6976C11.7521 14.5249 11.5501 14.4205 11.3328 14.407ZM8.92368 12.3949H8.92453C9.02083 13.065 8.81205 13.7432 8.3604 14.2253L5.27894 17.4751C4.48898 18.309 3.20816 18.309 2.41826 17.4751C1.62836 16.6413 1.62829 15.2894 2.41826 14.4556L5.4971 11.2049C5.95473 10.7227 6.60407 10.5015 7.24235 10.6103L8.27179 9.50482C7.65992 9.21608 6.97904 9.12973 6.31946 9.25836C5.66074 9.38699 5.05313 9.72339 4.57932 10.2244L1.50222 13.486C0.866493 14.1408 0.506033 15.0358 0.500055 15.9731C0.494942 16.9104 0.844328 17.8108 1.47238 18.4736C2.10043 19.1366 2.95346 19.5054 3.84134 19.4999C4.7293 19.4936 5.57721 19.1132 6.19764 18.4421L9.28761 15.1942C9.76142 14.6931 10.0801 14.0527 10.2011 13.3565C10.323 12.6612 10.242 11.9425 9.96935 11.2966L8.92368 12.3949ZM17.528 1.52632C16.905 0.869676 16.0605 0.5 15.1802 0.5C14.2998 0.5 13.4554 0.869699 12.8324 1.52632L9.75595 4.77428C9.28213 5.2753 8.96258 5.91573 8.84072 6.61106C8.71971 7.30726 8.80066 8.02595 9.07421 8.67179L10.1079 7.58519C10.0108 6.91598 10.2195 6.23684 10.6712 5.75563L13.7509 2.49315C14.1301 2.09287 14.6448 1.86801 15.1808 1.86801C15.7177 1.86801 16.2324 2.09289 16.6116 2.49315C17.4016 3.32699 17.4016 4.67893 16.6116 5.51269L13.5328 8.76342C13.1536 9.1628 12.6389 9.38766 12.1029 9.38676C11.9972 9.38676 11.8915 9.37777 11.7875 9.36068L10.7581 10.4635C11.37 10.7522 12.0509 10.8386 12.7104 10.7099C13.3692 10.5813 13.9768 10.2449 14.4506 9.74387L17.5277 6.48232C18.1498 5.82478 18.5 4.93338 18.5 4.00415C18.5 3.07491 18.1497 2.18358 17.5277 1.52597L17.528 1.52632Z"
                      fill="rgba(222,44,109,1)"
                      stroke="white"
                      strokeWidth="0.4"
                      mask="url(#path-1-inside-1_1671_16714)"
                    />
                  </svg>
                </div>

                <div className="flex flex-col items-center justify-center gap-[9px] ">
                  <p className="text-[12px] text-[#000] leading-[13px] font-inter font-bold text-center">
                    Setup your Upcoming Insta Post
                  </p>
                  {/* Add product links before posting on Insta so you never miss replying to a comment. Set first, then post */}
                  <p className="text-[12px] text-[#000] leading-[16px] font-inter font-bold text-center">
                    <span className="font-normal">Add product links</span> before posting {" "}
                    <span className="font-normal">on Insta</span> so you never miss{" "}
                    <span className="font-normal">replying</span> to a comment.{" "}
                    <span className="font-normal block mt-2">Set first, then post</span>{" "}
                  </p>
                  <button
                    className="bg-[rgba(222,44,109,1)] hover:bg-pink-600 text-white font-medium p-1 font-inter text-[14px] rounded-sm transition duration-200 w-36 cursor-pointer mt-1.5"
                    // onMouseEnter={x`
                    onClick={() =>
                    {
                      setSchedule(true);
                      setActiveTab("Create Post")
                    }
                    }
                  >
                    Let's Setup
                  </button>
                </div>
              </div>

              <p className="text-[#000] font-inter font-normal text-center w-full text-[10px]">
                (Setup will last for <span className="font-bold">3 hours</span>{" "}
                before publishing)
              </p>
            </div>
        }
       
        <div className="grid grid-cols-3 gap-[2px] w-full py-[19px] px-[2px]">
         {posts.map((post: any, index: number) => (
            <div
              key={post.id}
              ref={index === posts.length - 1 ? lastItemRef : null}
              className="relative cursor-pointer h-[170px] w-full  overflow-hidden"
              onClick={() =>
                handlePostSelect(
                  post.id,
                  post.media_type === "IMAGE" || post.media_type === "CAROUSEL_ALBUM"
                    ? post.media_url
                    : post.thumbnail_url,
                  post.permalink
                )
              }
            >
              <img
                src={
                  post.media_type === "IMAGE" || post.media_type === "CAROUSEL_ALBUM"
                    ? post.media_url
                    : post.thumbnail_url
                }
                alt={post.title || `Post ${post.id}`}
                className="w-full h-full object-cover"
              />

              {/* Post title overlay */}
              {/* {post.title && (
             <div className="absolute inset-0 flex items-center justify-center bg-black/30">
               <span className="text-white font-medium">{post.title}</span>
             </div>
           )} */}

              {/* Checkbox in top right corner */}
              <div className="absolute top-2 right-2 z-10">
                <div
                  className={`w-6 h-6 rounded-[4px] border-[1px] flex items-center justify-center ${selectedPostId === post.id
                    ? "bg-blue-500 border-blue-500"
                    : "bg-transparent border-gray-400"
                    }`}
                >
                  {selectedPostId === post.id && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2.5"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
         ))}
         {isFetching && <SelectPostLoading count={9} />}
        </div>
      </div>

      {/* Continue button */}
      <div
        style={{
          boxShadow: "0px 2px 12.6px 0px rgba(0, 0, 0, 0.25)",
        }}
        className="w-full fixed bottom-0 max-w-[450px] px-[15px] py-[21px] rounded-t-[14px] bg-[#fff] z-50 "
      >
        <button
          onClick={handleContinue}
          disabled={!selectedPostId}
          className={
            " py-3 w-full rounded-[7px] text-white text-[16px] font-semibold font-inter leading-normal bg-[rgba(222,44,109,1)] hover:bg-[#e03d73] transition-color cursor-pointer"
          }
          type="button"
        >
          Next
        </button>
      </div>
 </div>
)}

{activeTab === "Create Post" && !schedule && (
<SelectPost postId={selectedPostId} imgurl={selectedPostImage} permaLink={permaLink} schedule={false} changeTab={changeTab} handleSchedulePost={handleSchedulePost}  />
)}

{activeTab === "Create Post" && schedule && (
<SelectPost schedule={true} changeTab={changeTab} handleSchedulePost={handleSchedulePost} />
)}

{activeTab === "Edit Post" && selectedPostId && (
<EditPosts postId={selectedPostId} imgUrl={selectedPostImage} changeTab={changeTab} postSetup={true}  />
)}

{activeTab === "Edit Post" && !selectedPostId && (
<EditPosts postId={"isScheduled"} changeTab={changeTab}  />
)}
    </>
  );
}
