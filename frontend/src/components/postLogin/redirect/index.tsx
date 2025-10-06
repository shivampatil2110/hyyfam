// containers/redirectContainer.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface RedirectPageProps {
    serverData: {
        redirect_url?: string;
        [key: string]: any;
    } | null;
}

interface LoadingDotsProps {
    size?: "sm" | "md" | "lg";
    color?: string;
    className?: string;
}

const LoadingDots: React.FC<LoadingDotsProps> = ({
    size = "md",
    color = "#ff69b4",
    className = "",
}) => {
    const sizeClasses = {
        sm: "w-2 h-2",
        md: "w-3 h-3",
        lg: "w-4 h-4",
    };

    const gapClasses = {
        sm: "gap-1",
        md: "gap-2",
        lg: "gap-3",
    };

    return (
        <div
            className={`flex items-center justify-center ${gapClasses[size]} ${className}`}
        >
            {[0, 1, 2].map((index) => (
                <div
                    key={index}
                    className={`${sizeClasses[size]} rounded-full animate-pulse`}
                    style={{
                        backgroundColor: color,
                        animationDelay: `${index * 0.2}s`,
                        animationDuration: "1.4s",
                    }}
                />
            ))}
        </div>
    );
};

const RedirectPage: React.FC<RedirectPageProps> = ({ serverData }: any) => {
    const router = useRouter();

    useEffect(() => {
        if (serverData?.link?.aff_url) {
            window.location.href = serverData.link.aff_url;
        }
    }, [serverData]);

    return (
        <div className="h-[90vh] flex flex-col items-center justify-center px-[15px]">
            <p className="w-[60%] mx-auto text-[18px] font-bold font-inter text-[#000] text-center">
                Hyyfam is taking you to {serverData.name}
            </p>
            <div className="mt-11 flex items-center justify-center w-full gap-2.5">
                <svg
                    className="scale-110"
                    xmlns="http://www.w3.org/2000/svg"
                    width="76"
                    height="76"
                    viewBox="0 0 76 76"
                    fill="none"
                >
                    <circle cx="38" cy="38" r="38" fill="#F1437E" />
                    <path
                        d="M60.1731 22.2624C60.1728 21.588 60.0619 20.9182 59.8447 20.2791C59.141 18.2493 56.9126 16.8708 54.9598 17.278V36.2038C50.157 30.9692 44.4687 28.2065 37.5665 28.2182C36.4797 28.2222 35.3944 28.298 34.3177 28.445C29.4797 29.1139 25.2868 31.2949 21.5923 34.8428L21.563 34.8719L21.1525 35.2732L21.0939 35.3372L20.6834 35.7559L20.6482 35.7908L20.2729 36.198V17.2663H20.2025V17.214C19.9235 17.1907 19.643 17.1907 19.3639 17.214C18.4753 17.2927 17.6282 17.6236 16.9242 18.1672C16.2201 18.7108 15.6888 19.444 15.3938 20.2791C15.3536 20.3815 15.3203 20.4864 15.2942 20.5932C15.1299 21.1266 15.0469 21.6814 15.0479 22.2392C15.0479 27.4776 15.0479 32.7121 15.0479 37.9428V59.3346C15.0479 59.6255 15.0479 59.9163 15.0479 60.1896C15.1185 60.8795 15.3386 61.5461 15.6929 62.1438C16.0011 62.6821 16.4136 63.1546 16.9068 63.5339C17.4015 63.9319 17.9779 64.2177 18.5957 64.3714C19.0445 64.4955 19.5079 64.56 19.9738 64.5634C22.3195 64.5924 24.6652 64.5634 26.9757 64.5634C24.7543 62.5959 22.9588 60.2017 21.6979 57.5258C19.9546 53.5794 19.7623 49.129 21.1588 45.0492C22.5553 40.9693 25.4397 37.5549 29.2452 35.4767L29.3683 35.4128L29.5266 35.3255C31.7935 34.1348 34.3 33.4616 36.8628 33.3549C39.4257 33.2482 41.9802 33.7109 44.3397 34.709C46.4643 35.5997 48.3896 36.8999 50.0038 38.5341C51.618 40.1684 52.8891 42.1042 53.7433 44.2293C54.5975 46.3544 55.018 48.6265 54.9801 50.914C54.9423 53.2014 54.4471 55.4587 53.5231 57.5549C52.2622 60.2308 50.4666 62.625 48.2453 64.5924C50.591 64.5924 52.9367 64.5924 55.2413 64.5924C55.9005 64.6014 56.5546 64.4778 57.1643 64.2291C57.774 63.9803 58.3265 63.6116 58.7885 63.1453C59.2505 62.6789 59.6124 62.1245 59.8524 61.5155C60.0924 60.9066 60.2055 60.2557 60.1848 59.6022C60.177 47.1517 60.1731 34.7051 60.1731 22.2624Z"
                        fill="white"
                    />
                    <path
                        d="M31.5693 52.1003V64.5924H26.4514C26.3977 64.39 26.3632 64.1841 26.3483 63.9768C26.3483 60.031 26.2903 53.6506 26.387 49.7104C26.4057 47.0042 27.4544 44.3792 29.3698 42.2443C31.2852 40.1094 33.9598 38.5844 36.9772 37.9066C41.9662 36.6753 48.4054 38.4048 51.1577 41.6789L47.5224 44.8132C44.6734 42.2442 41.2056 41.2703 37.1577 42.6919C35.9289 43.116 34.8288 43.7797 33.9425 44.6318C33.0562 45.4838 32.4074 46.5015 32.0463 47.606H45.5307V52.0835L31.5693 52.1003Z"
                        fill="white"
                    />
                    <path
                        d="M47.7731 23.9674C49.6429 23.9674 51.1586 22.4517 51.1586 20.582C51.1586 18.7123 49.6429 17.1965 47.7731 17.1965C45.9034 17.1965 44.3877 18.7123 44.3877 20.582C44.3877 22.4517 45.9034 23.9674 47.7731 23.9674Z"
                        fill="white"
                    />
                </svg>

                <LoadingDots size="md" className="ml-3" />

                <div className="max-w-fit p-5 rounded-full h-[120px] w-[120px]">
                    <img src={serverData.img_url} alt={serverData.name} />
                </div>
            </div>

            <p className="mt-5.5 w-[85%] mx-auto text-center text-[15px] text-[#000] leading-5 font-medium font-inter">
                Hyyfam is opening your {serverData.name} experience...
            </p>

            <p className="mt-[13px] w-[85%] mx-auto text-center text-[14px] text-[#000] leading-5 font-normal font-inter">
                Make your purchase on {serverData.name} through Hyyfam. Commission
                will be credited to your account after order confirmation.
            </p>
        </div>
    )
};

export default RedirectPage;
