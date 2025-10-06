"use client";
import React, { useState, useEffect } from "react";
import { useRouter, usePathname, useParams } from "next/navigation";
import { useGetNotificationQuery } from "@/redux/api/homeApi";
import Image from "next/image";
import { useGetUserProfileQuery } from "@/redux/api/pointsApi";
import { CDN_URL } from "@/appConstants/baseURL";
import { useSelector } from "react-redux";

const NameSection = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { data: notifications = [], isLoading } = useGetNotificationQuery();
  // const userProfile = useSelector((state: any) => state.auth.user);

  const { data: userProfileData } = useGetUserProfileQuery();
  const userData = userProfileData ? userProfileData[0] : {}
  const fallbackUserProfile = useSelector((state: any) => state.auth.user);
  
  // Use API data if available, otherwise fall back to Redux store
  const userProfile = userData || fallbackUserProfile;

  // Function to get stored notification IDs from localStorage
  const getStoredNotificationIds = (): string[] => {
    try {
      const stored = localStorage.getItem('readNotificationIds');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return [];
    }
  };

  // Function to set notification IDs in localStorage
  const setStoredNotificationIds = (ids: string[]) => {
    try {
      localStorage.setItem('readNotificationIds', JSON.stringify(ids));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  };

  // Function to check if there are unread notifications
  const hasUnreadNotifications = (): boolean => {
    if (!notifications || notifications.length === 0) {
      return false;
    }

    const storedIds = getStoredNotificationIds();
    
    // If no stored IDs and there are notifications, show red dot
    if (storedIds.length === 0) {
      return true;
    }

    // Check if there's any notification ID not present in stored IDs
    return notifications.some((notification: any) => 
      !storedIds.includes(notification.id)
    );
  };

  // Function to clean up localStorage - remove IDs that are no longer in API response
  const cleanupStoredNotifications = () => {
    if (!notifications || notifications.length === 0) {
      return;
    }

    const storedIds = getStoredNotificationIds();
    const currentNotificationIds = notifications.map((notification: any) => notification.id);
    
    // Filter out IDs that are no longer present in the API response
    const cleanedIds = storedIds.filter(id => currentNotificationIds.includes(id));
    
    // Update localStorage only if there's a difference
    if (cleanedIds.length !== storedIds.length) {
      setStoredNotificationIds(cleanedIds);
    }
  };

  // Function to handle notification click
  const handleNotificationClick = () => {
    if (notifications && notifications.length > 0) {
      // Mark all current notifications as read by storing their IDs
      const currentNotificationIds = notifications.map((notification: any) => notification.id);
      const storedIds = getStoredNotificationIds();
      
      // Merge current stored IDs with new notification IDs (remove duplicates)
      const updatedIds = [...new Set([...storedIds, ...currentNotificationIds])];
      setStoredNotificationIds(updatedIds);
    }
    
    router.push("/notifications");
  };

  // Effect to check and cleanup notifications every time component renders and notifications change
  useEffect(() => {
    if (notifications && notifications.length > 0) {
      cleanupStoredNotifications();
    }
  }, [notifications]);

  return (
    <div className="w-full px-[15px] py-3 flex items-center justify-between ">
      <div className="flex items-center justify-start gap-2">
        <div
          className="flex items-center justify-center gap-2 cursor-pointer"
          onClick={() => router.push("/settings")}
        >
          {!pathname.includes("profile") && (
            <div className="h-[50px] w-[50px] bg-gray-600 rounded-full">
              <img
                src={
                  userProfile?.profile_image == null
                    ? "/images/profileImage.webp"
                    : `${CDN_URL + "/images" + userProfile?.profile_image}`
                }
                alt="Profile"
                className="w-full h-full object-cover rounded-full"
                key={userProfile?.profile_image}
              />
            </div>
          )}
          <Image
            src={"/static/HyyFamNew.png"}
            alt="logo"
            height={40}
            width={90}
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-5 ">
        <div className="flex items-center justify-center relative">
          {hasUnreadNotifications() && (
            <div className="bg-red-500 w-2 h-2 rounded-full absolute -top-1 -right-1"></div>
          )}
          <svg
            className="cursor-pointer"
            onClick={handleNotificationClick}
            xmlns="http://www.w3.org/2000/svg"
            width="21"
            height="21"
            viewBox="0 0 21 21"
            fill="none"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M10.5 2.62498C9.10761 2.62498 7.77226 3.17811 6.78769 4.16267C5.80312 5.14724 5.25 6.4826 5.25 7.87498V12.25C5.25 12.8697 5.08565 13.4724 4.7811 14H16.2189C15.9143 13.4724 15.75 12.8697 15.75 12.25V7.87498C15.75 6.4826 15.1969 5.14724 14.2123 4.16267C13.2277 3.17811 11.8924 2.62498 10.5 2.62498ZM19.25 14C18.7859 14 18.3408 13.8156 18.0126 13.4874C17.6844 13.1592 17.5 12.7141 17.5 12.25V7.87498C17.5 6.01847 16.7625 4.23799 15.4497 2.92524C14.137 1.61248 12.3565 0.874985 10.5 0.874985C8.64348 0.874985 6.86301 1.61248 5.55025 2.92524C4.2375 4.23799 3.5 6.01847 3.5 7.87498V12.25C3.5 12.7141 3.31563 13.1592 2.98744 13.4874C2.65925 13.8156 2.21413 14 1.75 14C1.26675 14 0.875 14.3917 0.875 14.875C0.875 15.3582 1.26675 15.75 1.75 15.75H19.25V14ZM8.5472 17.6181C8.96521 17.3756 9.50064 17.5179 9.74312 17.9359C9.82004 18.0685 9.93044 18.1786 10.0633 18.2551C10.1961 18.3316 10.3467 18.3719 10.5 18.3719C10.6533 18.3719 10.8039 18.3316 10.9367 18.2551C11.0696 18.1786 11.18 18.0685 11.2569 17.9359C11.4994 17.5179 12.0348 17.3756 12.4528 17.6181C12.8708 17.8606 13.0131 18.396 12.7706 18.814C12.5399 19.2118 12.2087 19.542 11.8102 19.7715C11.4117 20.0011 10.9599 20.1219 10.5 20.1219C10.0401 20.1219 9.58833 20.0011 9.18983 19.7715C8.79133 19.542 8.46013 19.2118 8.22938 18.814C7.98689 18.396 8.12919 17.8606 8.5472 17.6181Z"
              fill="#232323"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M10.5 2.62498C9.10761 2.62498 7.77226 3.17811 6.78769 4.16267C5.80312 5.14724 5.25 6.4826 5.25 7.87498V12.25C5.25 12.8697 5.08565 13.4724 4.7811 14H16.2189C15.9143 13.4724 15.75 12.8697 15.75 12.25V7.87498C15.75 6.4826 15.1969 5.14724 14.2123 4.16267C13.2277 3.17811 11.8924 2.62498 10.5 2.62498ZM19.25 14C18.7859 14 18.3408 13.8156 18.0126 13.4874C17.6844 13.1592 17.5 12.7141 17.5 12.25V7.87498C17.5 6.01847 16.7625 4.23799 15.4497 2.92524C14.137 1.61248 12.3565 0.874985 10.5 0.874985C8.64348 0.874985 6.86301 1.61248 5.55025 2.92524C4.2375 4.23799 3.5 6.01847 3.5 7.87498V12.25C3.5 12.7141 3.31563 13.1592 2.98744 13.4874C2.65925 13.8156 2.21413 14 1.75 14C1.26675 14 0.875 14.3917 0.875 14.875C0.875 15.3582 1.26675 15.75 1.75 15.75H19.25V14ZM8.5472 17.6181C8.96521 17.3756 9.50064 17.5179 9.74312 17.9359C9.82004 18.0685 9.93044 18.1786 10.0633 18.2551C10.1961 18.3316 10.3467 18.3719 10.5 18.3719C10.6533 18.3719 10.8039 18.3316 10.9367 18.2551C11.0696 18.1786 11.18 18.0685 11.2569 17.9359C11.4994 17.5179 12.0348 17.3756 12.4528 17.6181C12.8708 17.8606 13.0131 18.396 12.7706 18.814C12.5399 19.2118 12.2087 19.542 11.8102 19.7715C11.4117 20.0011 10.9599 20.1219 10.5 20.1219C10.0401 20.1219 9.58833 20.0011 9.18983 19.7715C8.79133 19.542 8.46013 19.2118 8.22938 18.814C7.98689 18.396 8.12919 17.8606 8.5472 17.6181Z"
              fill="black"
              fillOpacity="0.2"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M10.5 2.62498C9.10761 2.62498 7.77226 3.17811 6.78769 4.16267C5.80312 5.14724 5.25 6.4826 5.25 7.87498V12.25C5.25 12.8697 5.08565 13.4724 4.7811 14H16.2189C15.9143 13.4724 15.75 12.8697 15.75 12.25V7.87498C15.75 6.4826 15.1969 5.14724 14.2123 4.16267C13.2277 3.17811 11.8924 2.62498 10.5 2.62498ZM19.25 14C18.7859 14 18.3408 13.8156 18.0126 13.4874C17.6844 13.1592 17.5 12.7141 17.5 12.25V7.87498C17.5 6.01847 16.7625 4.23799 15.4497 2.92524C14.137 1.61248 12.3565 0.874985 10.5 0.874985C8.64348 0.874985 6.86301 1.61248 5.55025 2.92524C4.2375 4.23799 3.5 6.01847 3.5 7.87498V12.25C3.5 12.7141 3.31563 13.1592 2.98744 13.4874C2.65925 13.8156 2.21413 14 1.75 14C1.26675 14 0.875 14.3917 0.875 14.875C0.875 15.3582 1.26675 15.75 1.75 15.75H19.25V14ZM8.5472 17.6181C8.96521 17.3756 9.50064 17.5179 9.74312 17.9359C9.82004 18.0685 9.93044 18.1786 10.0633 18.2551C10.1961 18.3316 10.3467 18.3719 10.5 18.3719C10.6533 18.3719 10.8039 18.3316 10.9367 18.2551C11.0696 18.1786 11.18 18.0685 11.2569 17.9359C11.4994 17.5179 12.0348 17.3756 12.4528 17.6181C12.8708 17.8606 13.0131 18.396 12.7706 18.814C12.5399 19.2118 12.2087 19.542 11.8102 19.7715C11.4117 20.0011 10.9599 20.1219 10.5 20.1219C10.0401 20.1219 9.58833 20.0011 9.18983 19.7715C8.79133 19.542 8.46013 19.2118 8.22938 18.814C7.98689 18.396 8.12919 17.8606 8.5472 17.6181Z"
              fill="black"
              fillOpacity="0.2"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default NameSection;