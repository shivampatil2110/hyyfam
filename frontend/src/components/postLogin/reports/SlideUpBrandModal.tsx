"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface StoreOption {
  store_name: string;
  store_id: string;
}

interface SlideUpBrandFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeOptions: StoreOption[];
  selectedStore: string; // Changed from selectedStores array to single string
  onFilterChange: (store: string, name: string) => void; // Changed from onFiltersChange to onFilterChange
  isLoadingStores?: boolean;
  selectedName: string;
}

const SlideUpBrandFilterModal: React.FC<SlideUpBrandFilterModalProps> = ({
  isOpen,
  onClose,
  storeOptions,
  selectedStore,
  onFilterChange,
  isLoadingStores = false,
  selectedName,
}) => {
  const [tempSelectedStore, setTempSelectedStore] = useState<string>(selectedStore);
  const [tempSelectedStoreName, setTempSelectedStoreName] = useState<string>(selectedName);
  
  // Update temp values when modal opens or selected value changes
  useEffect(() => {
    setTempSelectedStore(selectedStore);
    setTempSelectedStoreName(selectedName);
  }, [selectedStore, isOpen]);

  const handleStoreRadioChange = (value: string, name: string) => {
    setTempSelectedStore(value);
    setTempSelectedStoreName(name);
  };

  const handleApply = () => {
    onFilterChange(tempSelectedStore, tempSelectedStoreName);
    onClose();
  };

  const handleClearSelection = () => {
    setTempSelectedStore("");
    setTempSelectedStoreName("");
  };

  const currentOptions = storeOptions?.map(option => ({
    id: option.store_id,
    name: option.store_name
  }));

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed bottom-0 inset-0 z-70 flex flex-col justify-end [&::-webkit-scrollbar]:hidden scroll-smooth max-w-[448px] mx-auto">
          {/* Backdrop */}
          <motion.div
            className="absolute h-[90vh] inset-0 bg-[rgba(0,0,0,0.3)] backdrop-blur-[0px] [&::-webkit-scrollbar]:hidden scroll-smooth"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Slide-up Panel */}
          <motion.div
            className="relative h-[90vh] bg-white rounded-t-[8px] z-50 max-w-[448px] min-w-full mx-auto [&::-webkit-scrollbar]:hidden scroll-smooth max-h-[80vh] overflow-hidden flex flex-col"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b-[0.5px] border-b-[#e1e1e1] ">
              <h3 className="text-[15px] font-bold font-inter text-[#333]">
                Select Brand
              </h3>
          
            </div>

            {/* Loading state for stores */}
            {isLoadingStores ? (
              <div className="flex-1 flex items-center justify-center py-8">
                <div className="text-[14px] text-gray-500">Loading brands...</div>
              </div>
            ) : currentOptions?.length > 0 ? (
              <div className="flex flex-col flex-1 items-start justify-start w-full">
          

                {/* Filter Options - Scrollable */}
                <div className="flex-1 w-full overflow-y-auto [&::-webkit-scrollbar]:hidden scroll-smooth">
                  <div className="space-y-1">
                    {currentOptions?.map((option, index) => {
                      const isSelected = tempSelectedStore === option.id;
                      
                      return (
                        <button
                          key={index}
                          onClick={() => handleStoreRadioChange(option.id, option.name)}
                          className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors border-b-[0.5px] border-b-[#e1e1e1] "
                        >
                          <div className="flex items-center w-full gap-3">
                            {/* Brand Icon Placeholder */}
                            <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                        
                            </div>
                            <span className="text-[12px] font-medium font-inter text-[#18181b]">
                              {option.name}
                            </span>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                            isSelected
                              ? "bg-[rgba(222,44,109,1)] border-[rgba(222,44,109,1)]"
                              : "border-gray-300 bg-white"
                          }`}>
                            {isSelected && (
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
                            <div className="flex flex-col flex-1 items-center justify-center w-full">
                              <p className="text-[18px] text-gray-700 w-[80%] text-center mx-auto">No brands available to be selected in the provided date range</p>
                            </div> 
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-center p-5 pt-0 ">
              <button
                onClick={handleApply}
                disabled={isLoadingStores}
                className="flex-1 px-5 py-2 bg-[rgba(222,44,109,1)] rounded-[8px] text-[14px] text-[#fff] font-inter font-medium leading-6 hover:bg-[rgba(200,39,98,1)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apply Filter
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SlideUpBrandFilterModal;