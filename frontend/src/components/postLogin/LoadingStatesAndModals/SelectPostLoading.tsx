import React from "react";

interface SelectPostLoadingProps {
  count?: number; // Number of placeholders
}

const SelectPostLoading: React.FC<SelectPostLoadingProps> = ({ count = 9 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="relative cursor-pointer h-[170px] w-full overflow-hidden rounded-[4px] shimmer"
        />
      ))}

      {/* Shimmer animation styles */}
      <style jsx>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
        .shimmer {
          position: relative;
          background-color: #e5e5e5;
        }
        .shimmer::after {
          content: "";
          position: absolute;
          inset: 0;
          transform: translateX(-100%);
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.4) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          animation: shimmer 1.2s infinite;
        }
      `}</style>
    </>
  );
};

export default SelectPostLoading;
