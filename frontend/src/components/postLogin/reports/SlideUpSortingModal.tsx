
"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SortOption {
  label: string;
  value: string;
}

interface SlideUpSortModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSort: string;
  onSortChange: (sortValue: string) => void;
}

const SlideUpSortModal: React.FC<SlideUpSortModalProps> = ({
  isOpen,
  onClose,
  selectedSort,
  onSortChange,
}) => {
  const sortOptions: SortOption[] = [
    { label: "Newest First", value: "newest_first" },
    { label: "Oldest First", value: "oldest_first" },
    { label: "Most Clicks", value: "most_clicks" },
    { label: "Most Commission", value: "most_commssion" },
    { label: "Least Commission", value: "least_commission" },
  ];

  const handleSortSelect = (sortValue: string) => {
    onSortChange(sortValue);
    onClose();
  };

  const getSelectedLabel = () => {
    const selectedOption = sortOptions.find(option => option.value === selectedSort);
    return selectedOption ? selectedOption.label : "Sort By";
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed bottom-0 inset-0 z-70 flex flex-col justify-end &::--scrollbar]:hidden scroll-smooth max-w-[448px] mx-auto">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-[#000] backdrop-blur-[0px] [&::-webkit-scrollbar]:hidden scroll-smooth"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Slide-up Panel */}
          <motion.div
            className="relative bg-white rounded-t-2xl py-6 z-50 max-w-[448px] min-w-full mx-auto [&::-webkit-scrollbar]:hidden scroll-smooth"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="flex gap-4 mb-4">
              <h3 className="text-[15px] font-bold font-inter text-[#333] px-5">
                Sort By
              </h3>
            </div>

            {/* Sort Options */}
            <div className=" mb-6">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSortSelect(option.value)}
                  className="w-full flex items-center justify-between py-3  hover:bg-gray-50 transition-colors border-b-[0.5px] border-b-[#e1e1e1] px-5"
                >
                  <span className="text-[12px] font-medium font-inter text-[#000]">
                    {option.label}
                  </span>
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center">
                    {selectedSort === option.value && (
                      <div className="w-3 h-3 rounded-full bg-[rgba(222,44,109,1)]"></div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SlideUpSortModal;