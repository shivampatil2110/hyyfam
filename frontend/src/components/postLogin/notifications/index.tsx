"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGetNotificationQuery } from "@/redux/api/homeApi";

interface Notification {
  id: string;
  message: React.ReactNode;
  timestamp: string;
  timeAgo: string;
}

const index = () => {
  const router = useRouter();
  // const [notifications, isNotification] = useState<string[]>([]);
  // const [notifications, setNotifications] = useState<Notification[]>([]);
  const { data: notifications = [], isLoading } = useGetNotificationQuery()

  function getTimeAgo(dateString: string) {
    const now: any = new Date();
    const past: any = new Date(dateString);
    const diffMs = now - past;

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (seconds < 60) return `${seconds} seconds ago`;
    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    if (days < 7) return `${days} days ago`;
    if (weeks < 4) return `${weeks} weeks ago`;
    if (months < 12) return `${months} months ago`;
    return `${years} years ago`;
  }


  return (
    <div className="min-h-screen font-inter">
      <div className="pb-20  flex flex-col items-center justify-start w-full">
        <div className="w-full flex items-center justify-start gap-[14px] py-[18px] border-b-[1px] border-b-[#f0f2f5] px-[15px]">
          <svg
            onClick={() => router.push("/home")}
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
            Notifications
          </p>
        </div>

        {notifications.length > 0 && (
          <div className="w-full flex flex-col items-start justify-start gap-4 p-4">
            {notifications.map((notification: any) => (
              <div
                key={notification.id}
                className="w-full  flex justify-between items-start py-1.5"
              >
                <p className="flex items-center justify-start gap-1">
                  {notification.title}
                  <span className="text-[16px] font-normal font-inter text-[#6f7380] leading-normal">
                    {getTimeAgo(notification.created_at)}
                  </span>
                </p>
                <div className="text-gray-500 text-sm ml-2"></div>
              </div>
            ))}
          </div>
        )}

        {!(notifications.length > 0) && (
          <div className="w-full h-[80vh] flex flex-col items-center justify-center gap-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="72"
              height="75"
              viewBox="0 0 72 75"
              fill="none"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M37.7143 6.81928C32.2584 6.81928 27.026 8.97465 23.1681 12.8112C19.3102 16.6478 17.1429 21.8514 17.1429 27.2771V44.3253C17.1429 46.7401 16.4989 49.0889 15.3055 51.1446H60.123C58.9297 49.0889 58.2857 46.7401 58.2857 44.3253V27.2771C58.2857 21.8514 56.1184 16.6478 52.2605 12.8112C48.4026 8.97465 43.1702 6.81928 37.7143 6.81928ZM72 51.1446C70.1814 51.1446 68.4372 50.4261 67.1513 49.1473C65.8653 47.8684 65.1429 46.1339 65.1429 44.3253V27.2771C65.1429 20.0428 62.2531 13.1047 57.1092 7.98928C51.9654 2.87383 44.9888 0 37.7143 0C30.4398 0 23.4632 2.87383 18.3194 7.98928C13.1755 13.1047 10.2857 20.0428 10.2857 27.2771V44.3253C10.2857 46.1339 9.56327 47.8684 8.2773 49.1473C6.99134 50.4261 5.2472 51.1446 3.42857 51.1446C1.53502 51.1446 0 52.6711 0 54.5542C0 56.4373 1.53502 57.9639 3.42857 57.9639H72V51.1446ZM30.0625 65.2435C31.7004 64.2986 33.7984 64.8531 34.7486 66.4819C35.05 66.9986 35.4826 67.4275 36.003 67.7257C36.5235 68.0238 37.1136 68.1807 37.7143 68.1807C38.3149 68.1807 38.905 68.0238 39.4255 67.7257C39.946 67.4275 40.3786 66.9986 40.68 66.4819C41.6301 64.8531 43.7282 64.2986 45.3661 65.2435C47.004 66.1883 47.5616 68.2748 46.6114 69.9037C45.7073 71.4537 44.4095 72.7404 42.848 73.6348C41.2866 74.5292 39.5162 75 37.7143 75C35.9123 75 34.142 74.5292 32.5806 73.6348C31.0191 72.7404 29.7213 71.4537 28.8171 69.9037C27.867 68.2748 28.4246 66.1883 30.0625 65.2435Z"
                fill="#232323"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M37.7143 6.81928C32.2584 6.81928 27.026 8.97465 23.1681 12.8112C19.3102 16.6478 17.1429 21.8514 17.1429 27.2771V44.3253C17.1429 46.7401 16.4989 49.0889 15.3055 51.1446H60.123C58.9297 49.0889 58.2857 46.7401 58.2857 44.3253V27.2771C58.2857 21.8514 56.1184 16.6478 52.2605 12.8112C48.4026 8.97465 43.1702 6.81928 37.7143 6.81928ZM72 51.1446C70.1814 51.1446 68.4372 50.4261 67.1513 49.1473C65.8653 47.8684 65.1429 46.1339 65.1429 44.3253V27.2771C65.1429 20.0428 62.2531 13.1047 57.1092 7.98928C51.9654 2.87383 44.9888 0 37.7143 0C30.4398 0 23.4632 2.87383 18.3194 7.98928C13.1755 13.1047 10.2857 20.0428 10.2857 27.2771V44.3253C10.2857 46.1339 9.56327 47.8684 8.2773 49.1473C6.99134 50.4261 5.2472 51.1446 3.42857 51.1446C1.53502 51.1446 0 52.6711 0 54.5542C0 56.4373 1.53502 57.9639 3.42857 57.9639H72V51.1446ZM30.0625 65.2435C31.7004 64.2986 33.7984 64.8531 34.7486 66.4819C35.05 66.9986 35.4826 67.4275 36.003 67.7257C36.5235 68.0238 37.1136 68.1807 37.7143 68.1807C38.3149 68.1807 38.905 68.0238 39.4255 67.7257C39.946 67.4275 40.3786 66.9986 40.68 66.4819C41.6301 64.8531 43.7282 64.2986 45.3661 65.2435C47.004 66.1883 47.5616 68.2748 46.6114 69.9037C45.7073 71.4537 44.4095 72.7404 42.848 73.6348C41.2866 74.5292 39.5162 75 37.7143 75C35.9123 75 34.142 74.5292 32.5806 73.6348C31.0191 72.7404 29.7213 71.4537 28.8171 69.9037C27.867 68.2748 28.4246 66.1883 30.0625 65.2435Z"
                fill="black"
                fillOpacity="0.2"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M37.7143 6.81928C32.2584 6.81928 27.026 8.97465 23.1681 12.8112C19.3102 16.6478 17.1429 21.8514 17.1429 27.2771V44.3253C17.1429 46.7401 16.4989 49.0889 15.3055 51.1446H60.123C58.9297 49.0889 58.2857 46.7401 58.2857 44.3253V27.2771C58.2857 21.8514 56.1184 16.6478 52.2605 12.8112C48.4026 8.97465 43.1702 6.81928 37.7143 6.81928ZM72 51.1446C70.1814 51.1446 68.4372 50.4261 67.1513 49.1473C65.8653 47.8684 65.1429 46.1339 65.1429 44.3253V27.2771C65.1429 20.0428 62.2531 13.1047 57.1092 7.98928C51.9654 2.87383 44.9888 0 37.7143 0C30.4398 0 23.4632 2.87383 18.3194 7.98928C13.1755 13.1047 10.2857 20.0428 10.2857 27.2771V44.3253C10.2857 46.1339 9.56327 47.8684 8.2773 49.1473C6.99134 50.4261 5.2472 51.1446 3.42857 51.1446C1.53502 51.1446 0 52.6711 0 54.5542C0 56.4373 1.53502 57.9639 3.42857 57.9639H72V51.1446ZM30.0625 65.2435C31.7004 64.2986 33.7984 64.8531 34.7486 66.4819C35.05 66.9986 35.4826 67.4275 36.003 67.7257C36.5235 68.0238 37.1136 68.1807 37.7143 68.1807C38.3149 68.1807 38.905 68.0238 39.4255 67.7257C39.946 67.4275 40.3786 66.9986 40.68 66.4819C41.6301 64.8531 43.7282 64.2986 45.3661 65.2435C47.004 66.1883 47.5616 68.2748 46.6114 69.9037C45.7073 71.4537 44.4095 72.7404 42.848 73.6348C41.2866 74.5292 39.5162 75 37.7143 75C35.9123 75 34.142 74.5292 32.5806 73.6348C31.0191 72.7404 29.7213 71.4537 28.8171 69.9037C27.867 68.2748 28.4246 66.1883 30.0625 65.2435Z"
                fill="black"
                fillOpacity="0.2"
              />
            </svg>
            <p className="m-0 text-[#000]/45 text-[20px] text-center font-inter font-medium leading-normal ">
              No Notification yet!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default index;
