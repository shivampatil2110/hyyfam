import Image from "next/image";
import React from "react";

// Dots Spinner Loading Component
interface DotsSpinnerLoadingProps {
  isLoading: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const DotsSpinnerRotating2: React.FC<DotsSpinnerLoadingProps> = ({
  isLoading,
  className = "",
  size = "md",
}) => {
  const sizeClasses = {
    sm: { container: "w-6 h-6", dot: "w-1 h-1" },
    md: { container: "w-8 h-8", dot: "w-1.5 h-1.5" },
    lg: { container: "w-12 h-12", dot: "w-2 h-2" },
  };

  if (!isLoading) return null;

  return (
    <div className="h-screen relative overflow-x-scroll [&::-webkit-scrollbar]:hidden font-inter bg-[#FFF3F7] w-full flex flex-col items-center justify-center gap-5">
      <div className="flex flex-col items-center justify-center gap-2 w-[60%] mx-auto">
        <h2 className="text-[18px] font-medium leading-6 text-center font-inter">
          Please don’t press back or refresh this page
        </h2>
        <h3 className="text-[16px] font-normal leading-6 text-center font-inter mb-4">
          We’re building your Hyyfam Links
        </h3>

      </div>
      <div
        className={`relative my-6 ${sizeClasses[size].container} ${className}`}
      >
        <div
          className="absolute inset-0 animate-spin"
          style={{ animationDuration: "2s" }}
        >
          {[...Array(8)].map((_, index) => (
            <div
              key={index}
              className={`absolute ${sizeClasses[size].dot} bg-[rgba(222,44,109,1)] rounded-full`}
              style={{
                top: "50%",
                left: "50%",
                transform: `translate(-50%, -50%) rotate(${index * 45
                  }deg) translateY(-${size === "sm" ? "12px" : size === "md" ? "16px" : "24px"
                  })`,
                opacity: 1 - index * 0.1,
              }}
            />
          ))}
        </div>
      </div>

      <Image
        src={"/static/rabbi.png"}
        alt="image-rabbit"
        width={130}
        height={300}
      />

      <p className="text-[14px] font-normal leading-5 text-center font-inter w-[60%] mx-auto mt-3">
        Please don’t refresh or go back.Your personalized links will be ready
        in a moment.
      </p>
    </div>
  );
}