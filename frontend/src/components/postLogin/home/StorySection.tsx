"use client";
import React, { useState, useEffect, useRef } from "react";
import { useGetStoriesQuery } from "@/redux/api/homeApi";
import { CDN_URL } from "../../../appConstants/baseURL";

interface StoryHeader {
  heading: string;
  subheading: string;
  profileImage: string;
}

interface Story {
  url: string;
  type: "image" | "video";
  duration: number;
  header: StoryHeader;
  storyId: string;
}

interface UserWithStories {
  username: string;
  stories: Story[];
  id: number;
}

interface Comment {
  id: number;
  text: string;
  user: string;
  timestamp: string;
}

interface CommentsState {
  [storyId: string]: Comment[];
}

interface LikedState {
  [userId: string]: string[];
}

interface StoredLikes {
  [userId: string]: string[];
}

const StorySection: React.FC<any> = ({ setLoading }: any) => {
  const [showStories, setShowStories] = useState<boolean>(false);
  const [currentUserIndex, setCurrentUserIndex] = useState<number>(0);
  // Updated type for liked state - userId -> storyIds[]
  const [liked, setLiked] = useState<LikedState>({});
  const [comments, setComments] = useState<CommentsState>({});
  const [commentText, setCommentText] = useState<string>("");
  const [currentStoryIndex, setCurrentStoryIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [showComments, setShowComments] = useState<boolean>(false);

  const commentInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    data: usersWithStories = [],
    isLoading,
    isFetching,
    isUninitialized,
    isSuccess,
    isError,
  } = useGetStoriesQuery();

  // localStorage key for storing likes
  const LIKES_STORAGE_KEY = "story_likes";

  // Function to load likes from localStorage
  const loadLikesFromStorage = (): StoredLikes => {
    try {
      if (typeof window !== "undefined") {
        const storedLikes = localStorage.getItem(LIKES_STORAGE_KEY);
        return storedLikes ? JSON.parse(storedLikes) : {};
      }
      return {};
    } catch (error) {
      console.error("Error loading likes from localStorage:", error);
      return {};
    }
  };

  // Function to save likes to localStorage
  const saveLikesToStorage = (likes: StoredLikes): void => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify(likes));
      }
    } catch (error) {
      console.error("Error saving likes to localStorage:", error);
    }
  };

  // Function to add/remove like in localStorage
  const updateLikeInStorage = (
    userId: number,
    storyId: string,
    isLiked: boolean
  ): void => {
    const storedLikes = loadLikesFromStorage();
    const userIdStr = userId.toString();

    if (isLiked) {
      // Add like - create user array if doesn't exist, add storyId if not already present
      if (!storedLikes[userIdStr]) {
        storedLikes[userIdStr] = [];
      }
      if (!storedLikes[userIdStr].includes(storyId)) {
        storedLikes[userIdStr].push(storyId);
      }
    } else {
      // Remove like - remove storyId from user's array
      if (storedLikes[userIdStr]) {
        storedLikes[userIdStr] = storedLikes[userIdStr].filter(
          (id) => id !== storyId
        );
        // Remove user key if no more likes
        if (storedLikes[userIdStr].length === 0) {
          delete storedLikes[userIdStr];
        }
      }
    }

    saveLikesToStorage(storedLikes);
  };

  // Function to check if a story is liked from localStorage
  const isStoryLikedInStorage = (userId: number, storyId: string): boolean => {
    const storedLikes = loadLikesFromStorage();
    const userIdStr = userId.toString();
    return storedLikes[userIdStr]?.includes(storyId) ? true : false;
  };

  useEffect(() => {
    const isApiStillLoading = isLoading || isFetching || isUninitialized;
    setLoading(isApiStillLoading);
  }, [isLoading, isFetching, isSuccess, isError, isUninitialized]);

  // Initialize comments and likes objects with localStorage data
  useEffect(() => {
    // Only initialize if we have data and haven't initialized yet
    if (!Array.isArray(usersWithStories) || usersWithStories.length === 0)
      return;

    // Updated to match your new structure: userId -> storyIds[]
    const initialLikes: LikedState = {};

    usersWithStories.forEach((user: any) => {
      user.stories.forEach((story: any) => {
        // Load like status from localStorage
        const isPresent = isStoryLikedInStorage(user.id, story.storyId);
        if (isPresent) {
          const userIdStr = user.id.toString();
          if (!initialLikes[userIdStr]) {
            initialLikes[userIdStr] = [];
          }
          initialLikes[userIdStr].push(story.storyId);
        }
      });
    });
    
    setLiked(initialLikes);
    
  }, [usersWithStories, isSuccess]);

  // Handle story timing and progress
  useEffect(() => {
    if (!showStories || isPaused) {
      if (progressIntervalRef.current)
        clearInterval(progressIntervalRef.current);
      if (progressTimeoutRef.current) clearTimeout(progressTimeoutRef.current);
      return;
    }

    const currentStory = getCurrentStory();
    if (!currentStory) return;

    // Reset progress when story changes
    setProgress(0);

    const duration = currentStory.duration;
    const interval = 10; // Update progress every 10ms for smooth animation
    const totalSteps = duration / interval;
    let currentStep = 0;

    // Set up progress update interval
    progressIntervalRef.current = setInterval(() => {
      currentStep++;
      setProgress((currentStep / totalSteps) * 100);
    }, interval);

    // Set up timeout to move to next story
    progressTimeoutRef.current = setTimeout(() => {
      moveToNextStory();
    }, duration);

    // Clean up intervals and timeouts on unmount or story change
    return () => {
      if (progressIntervalRef.current)
        clearInterval(progressIntervalRef.current);
      if (progressTimeoutRef.current) clearTimeout(progressTimeoutRef.current);
    };
  }, [showStories, isPaused, currentUserIndex, currentStoryIndex]);

  // Handle video events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleVideoPlay = () => {
      setIsPaused(false);
    };

    const handleVideoPause = () => {
      setIsPaused(true);
    };

    const handleVideoEnded = () => {
      moveToNextStory();
    };

    video.addEventListener("play", handleVideoPlay);
    video.addEventListener("pause", handleVideoPause);
    video.addEventListener("ended", handleVideoEnded);

    return () => {
      video.removeEventListener("play", handleVideoPlay);
      video.removeEventListener("pause", handleVideoPause);
      video.removeEventListener("ended", handleVideoEnded);
    };
  }, [currentStoryIndex, currentUserIndex]);

  const moveToNextStory = (): void => {
    // Close comments if open
    if (showComments) {
      setShowComments(false);
    }

    const currentUser = usersWithStories[currentUserIndex];
    if (!currentUser) return;

    if (currentStoryIndex < currentUser.stories.length - 1) {
      // Move to next story of current user
      setCurrentStoryIndex((prevIndex) => prevIndex + 1);
    } else if (currentUserIndex < usersWithStories.length - 1) {
      // Move to first story of next user
      setCurrentUserIndex((prevIndex) => prevIndex + 1);
      setCurrentStoryIndex(0);
    } else {
      // End of all stories
      closeStories();
    }
  };

  const moveToPrevStory = (): void => {
    // Close comments if open
    if (showComments) {
      setShowComments(false);
    }

    if (currentStoryIndex > 0) {
      // Move to previous story of current user
      setCurrentStoryIndex((prevIndex) => prevIndex - 1);
    } else if (currentUserIndex > 0) {
      // Move to last story of previous user
      setCurrentUserIndex((prevIndex) => prevIndex - 1);
      const prevUser = usersWithStories[currentUserIndex - 1];
      setCurrentStoryIndex(prevUser.stories.length - 1);
    }
  };

  const openStories = (index: number): void => {
    setCurrentUserIndex(index);
    setCurrentStoryIndex(0);
    setShowStories(true);
    setProgress(0);
    setShowComments(false);
  };

  const closeStories = (): void => {
    setShowStories(false);
    setShowComments(false);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    if (progressTimeoutRef.current) clearTimeout(progressTimeoutRef.current);
  };

  const getCurrentStory = (): Story | null => {
    if (!showStories || currentUserIndex >= usersWithStories.length)
      return null;

    const currentUser = usersWithStories[currentUserIndex];
    if (!currentUser?.stories?.length) return null;

    if (currentStoryIndex >= currentUser.stories.length) {
      return currentUser.stories[currentUser.stories.length - 1];
    }
    let currentStory = JSON.parse(
      JSON.stringify(currentUser.stories[currentStoryIndex])
    );
    currentStory.header = {};
    currentStory.header.profileImage = currentUser.header_image;
    currentStory.header.heading = currentUser.username;
    let timestamp = timeAgo(currentUser.stories[currentStoryIndex].timestamp);
    currentStory.header.subheading = timestamp;
    return currentStory;
  };

  function timeAgo(dateString: string) {
    const inputDate: any = new Date(dateString.replace(" ", "T"));
    const now: any = new Date();
    const diffMs = now - inputDate;

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (seconds < 60) return "Just now";
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
    if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
    if (weeks < 5) return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
    if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;
    return `${years} year${years === 1 ? "" : "s"} ago`;
  }

  // Updated toggle like function to work with new state structure
  const toggleLike = (): void => {
    const currentStory = getCurrentStory();
    const currentUser = usersWithStories[currentUserIndex];

    if (!currentStory || !currentUser) return;

    const storyId = currentStory.storyId;
    const userId = currentUser.id;
    const userIdStr = userId.toString();

    // Check current like status from state
    const currentlyLiked = liked[userIdStr]?.includes(storyId) || false;
    const newLikedState = !currentlyLiked;

    // Update local state immediately for better UX
    setLiked((prev) => {
      const newState = { ...prev };

      if (newLikedState) {
        // Add like
        if (!newState[userIdStr]) {
          newState[userIdStr] = [];
        }
        if (!newState[userIdStr].includes(storyId)) {
          newState[userIdStr] = [...newState[userIdStr], storyId];
        }
      } else {
        // Remove like
        if (newState[userIdStr]) {
          newState[userIdStr] = newState[userIdStr].filter(
            (id) => id !== storyId
          );
          // Remove user key if no more likes
          if (newState[userIdStr].length === 0) {
            delete newState[userIdStr];
          }
        }
      }

      return newState;
    });

    // Update localStorage
    updateLikeInStorage(userId, storyId, newLikedState);
    
  };

  // Helper function to safely get the current story ID
  const getCurrentStoryId = (): string | null => {
    const currentStory = getCurrentStory();
    return currentStory ? currentStory.storyId : null;
  };

  // Updated helper function to check if current story is liked with new state structure
  const isCurrentStoryLiked = (): boolean => {
    const storyId = getCurrentStoryId();
    const currentUser = usersWithStories[currentUserIndex];

    if (!storyId || !currentUser) return false;

    const userIdStr = currentUser.id.toString();
    return liked[userIdStr]?.includes(storyId) || false;
  };

  // Handle user interaction (pause/play)
  const handleUserInteraction = (action: "pause" | "play"): void => {
    if (action === "pause") {
      setIsPaused(true);
      if (videoRef.current && getCurrentStory()?.type === "video") {
        videoRef.current.pause();
      }
    } else if (action === "play") {
      setIsPaused(false);
      if (videoRef.current && getCurrentStory()?.type === "video") {
        videoRef.current.play().catch((error) => {});
      }
    }
  };

  // Handle navigation clicks
  const handleNavigationClick = (
    e: React.MouseEvent,
    direction: "prev" | "next"
  ): void => {
    e.stopPropagation();
    if (direction === "prev") {
      moveToPrevStory();
    } else if (direction === "next") {
      moveToNextStory();
    }
  };

  // Handle story container clicks (pause/play)
  const handleStoryContainerClick = (): void => {
    // Don't toggle play/pause if comments are open
    if (showComments) return;

    if (isPaused) {
      handleUserInteraction("play");
    } else {
      handleUserInteraction("pause");
    }
  };

  // Get stories for current user
  const currentUserStories = usersWithStories[currentUserIndex]?.stories || [];
  const hasStories = currentUserStories.length > 0;

  return (
    <>
      <div className="flex flex-col items-start justify-center w-full">
        <p className="px-4 text-[#000] text-[18px] leading-8 font-semibold font-raleway ">
          Stories
        </p>
        <div className="pt-3 pb-3 pl-4 flex items-start justify-start gap-3 overflow-x-auto [&::-webkit-scrollbar]:hidden scroll-smooth w-full">
          {Array.isArray(usersWithStories) &&
            usersWithStories?.map((user: any, index: number) => (
              <div
                key={index}
                className={`flex flex-col items-center justify-center max-w-[82px] min-w-[82px] cursor-pointer ${
                  usersWithStories.length === index + 1 && "mr-5"
                }`}
                onClick={() => openStories(index)}
              >
                <div className="w-full relative">
                  {/* Story ring indicator */}
                  <div className="w-[82px] h-[80px] rounded-full bg-[#f1437e] py-0.5 px-[1.5px]">
                    {user.header_image && (
                      <div className="w-full h-[77px] rounded-full bg-[#fff]">
                        <img
                          src={CDN_URL + "/images" + user.header_image}
                          // src="/images/creatorLandingPage/headerImage.png"
                          alt={user.username}
                          className="w-full h-[77px] rounded-full object-cover border-[2px] border-[#fff]  "
                        />
                      </div>
                    )}
                  </div>
                </div>

                <p className="m-0 overflow-hidden overflow- line-clamp-1 text-[14px] text-[#232323 font-raleway font-semibold leading-tight max-w-[122px] text-center mt-1">
                  {user.username}
                </p>
              </div>
            ))}
        </div>
      </div>

      {/* Custom Stories Viewer Modal */}
      {showStories && hasStories && (
        <div className="fixed inset-0 z-[999] bg-black flex flex-col w-full max-w-[448px]  mx-auto">
          {/* Close button */}
          <button
            className="absolute top-4 right-4 cursor-pointer text-white z-50 text-xl bg-black bg-opacity-50 rounded-full w-8 h-8 flex items-center justify-center"
            onClick={closeStories}
            type="button"
          >
            ✕
          </button>

          {/* Header with profile info */}
          <div className="absolute top-0 left-0 right-0 z-40 bg-gradient-to-b from-black to-transparent p-4 max-w-[448px] min-w-full">
            <div className="flex items-center">
              {getCurrentStory()?.header?.profileImage && (
                <img
                  src={
                    CDN_URL + "/images" + getCurrentStory()!.header.profileImage
                  }
                  alt={getCurrentStory()!.header.heading}
                  className="w-8 h-8 rounded-full mr-2 object-cover"
                />
              )}
              <div>
                <div className="text-white font-bold">
                  {getCurrentStory()?.header?.heading}
                </div>
                <div className="text-white text-xs opacity-80">
                  {getCurrentStory()?.header?.subheading}
                </div>
              </div>
            </div>

            {/* Progress bars */}
            <div className="flex mt-3 gap-1">
              {Array.isArray(currentUserStories) &&
                currentUserStories?.map((_: any, idx: number) => (
                  <div
                    key={idx}
                    className="h-1 bg-gray-500 rounded-full flex-1 overflow-hidden"
                  >
                    {idx === currentStoryIndex ? (
                      <div
                        className="h-full bg-white"
                        style={{ width: `${progress}%` }}
                      />
                    ) : idx < currentStoryIndex ? (
                      <div className="h-full bg-white w-full" />
                    ) : (
                      <div className="h-full bg-transparent" />
                    )}
                  </div>
                ))}
            </div>
          </div>

          {/* Stories content */}
          <div className="flex-1 relative" onClick={handleStoryContainerClick}>
            {/* Story content */}
            <div className="absolute inset-0 flex items-center justify-center max-w-[448px] min-w-[448px]">
              {getCurrentStory()?.type === "image" ? (
                <img
                  src={CDN_URL + "/images" + getCurrentStory()!.url}
                  alt="Story"
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <video
                  ref={videoRef}
                  src={CDN_URL + "/videos" + getCurrentStory()!.url}
                  className="max-w-full max-h-full object-contain"
                  autoPlay
                  playsInline
                  muted={false}
                  controls={false}
                />
              )}
            </div>

            {/* Navigation overlay */}
            <div className="absolute inset-0 flex max-w-[448px] min-w-[448px]">
              {/* Left side for previous story */}
              <div
                className="w-1/3 h-full"
                onClick={(e) => handleNavigationClick(e, "prev")}
              />
              {/* Middle for pause/play */}
              <div className="w-1/3 h-full" />
              {/* Right side for next story */}
              <div
                className="w-1/3 h-full"
                onClick={(e) => handleNavigationClick(e, "next")}
              />
            </div>

            {/* Pause indicator */}
            {isPaused && !showComments && (
              <div className="absolute inset-0 flex items-center justify-center max-w-[448px] min-w-[448px]">
                <div className="bg-black bg-opacity-50 p-4 rounded-full">
                  <svg
                    className="w-12 h-12 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="absolute bottom-0 left-0 bg-[#000] right-0 flex justify-end items-center p-2.5 space-x-8 z-30">
            {/* Like button */}
            <button
              className="flex items-center text-[#000] cursor-pointer"
              onClick={toggleLike}
              type="button"
            >
              {isCurrentStoryLiked() ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-red-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="#fff"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default StorySection;
