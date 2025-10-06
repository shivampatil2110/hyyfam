"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface StoreOption {
  store_name: string;
  store_id: string;
}

interface StatusOption {
  status_name: string;
  status_id: string;
}

interface SlideUpCombinedFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeOptions: StoreOption[];
  statusOptions: StatusOption[];
  selectedStores: string[];
  selectedStatuses: string[];
  onFiltersChange: (stores: string[], statuses: string[]) => void;
  isLoadingStores?: boolean;
}

const SlideUpCombinedFilterModal: React.FC<SlideUpCombinedFilterModalProps> = ({
  isOpen,
  onClose,
  storeOptions,
  statusOptions,
  selectedStores,
  selectedStatuses,
  onFiltersChange,
  isLoadingStores = false,
}) => {
  const [activeTab, setActiveTab] = useState<'stores' | 'status'>('stores');
  const [tempSelectedStores, setTempSelectedStores] = useState<string[]>(selectedStores);
  const [tempSelectedStatuses, setTempSelectedStatuses] = useState<string[]>(selectedStatuses);

  // Update temp values when modal opens or selected values change
  useEffect(() => {
    setTempSelectedStores(selectedStores);
    setTempSelectedStatuses(selectedStatuses);
  }, [selectedStores, selectedStatuses, isOpen]);

  const handleStoreCheckboxChange = (value: string) => {
    setTempSelectedStores(prev => {
      if (prev.includes(value)) {
        return prev.filter(item => item !== value);
      } else {
        return [...prev, value];
      }
    });
  };

  const handleStatusCheckboxChange = (value: string) => {
    setTempSelectedStatuses(prev => {
      if (prev.includes(value)) {
        return prev.filter(item => item !== value);
      } else {
        return [...prev, value];
      }
    });
  };

  const handleSelectAllStores = () => {
    if (tempSelectedStores.length === storeOptions.length) {
      setTempSelectedStores([]);
    } else {
      setTempSelectedStores(storeOptions.map(option => option.store_id));
    }
  };

  const handleSelectAllStatuses = () => {
    if (tempSelectedStatuses.length === statusOptions.length) {
      setTempSelectedStatuses([]);
    } else {
      // ✅ Fixed: Use status_id instead of store_id
      setTempSelectedStatuses(statusOptions.map(option => option.status_id));
    }
  };

  const handleApply = () => {
    onFiltersChange(tempSelectedStores, tempSelectedStatuses);
    onClose();
  };

  const handleClearAll = () => {
    setTempSelectedStores([]);
    setTempSelectedStatuses([]);
  };

  // ✅ Fixed: Handle different option types properly
  const getCurrentOptions = () => {
    if (activeTab === 'stores') {
      return storeOptions?.map(option => ({
        id: option.store_id,
        name: option.store_name
      }));
    } else {
      return statusOptions.map(option => ({
        id: option.status_id,
        name: option.status_name
      }));
    }
  };

  const currentOptions = getCurrentOptions();
  const currentSelected = activeTab === 'stores' ? tempSelectedStores : tempSelectedStatuses;
  const isAllSelected = currentSelected?.length === currentOptions?.length;
  const isSomeSelected = currentSelected?.length > 0 && currentSelected?.length < currentOptions?.length;

  const totalFiltersCount = tempSelectedStores?.length + tempSelectedStatuses?.length;

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
                Filters
              </h3>
              <button
                onClick={handleClearAll}
                className="text-[12px] font-medium font-inter text-[#000]"
              >
                Clear All
              </button>
            </div>

            <div className="grid grid-cols-3 items-start h-full justify-start w-full">
              {/* Tabs */}
              <div className="flex flex-col items-center justify-start w-full col-span-1 h-full border-r-[0.5px] border-r-[#e1e1e1]">
                <button
                  onClick={() => setActiveTab('stores')} 
                  className={` py-3 px-6 w-full text-[12px] font-medium font-inter transition-colors relative ${
                    activeTab === 'stores' 
                      ? "bg-[#fafafa] text-[rgba(222,44,109,1)] border-l-[2px] border-l-[rgba(222,44,109,1)]"
                      : "text-[#000] bg-[#fff]"
                  }`}
                >
                  Stores 
                </button>
                <button
                  onClick={() => setActiveTab('status')}
                  className={` py-3 px-6 w-full text-[12px] font-medium font-inter transition-colors relative ${
                    activeTab === 'status'
                      ? "bg-[#fafafa] text-[rgba(222,44,109,1)] border-l-[2px] border-l-[rgba(222,44,109,1)]"
                      : "text-[#000] bg-[#fff]"
                  }`}
                >
                  Status
                </button>
              </div>

              {/* Loading state for stores */}
              {isLoadingStores && activeTab === 'stores' ? (
                <div className="flex-1 flex items-center justify-center py-8">
                  <div className="text-[14px] text-gray-500">Loading stores...</div>
                </div>
              ) : (
                <>
                  <div className="flex flex-col col-span-2 items-start justify-start w-full">
                    {/* Select All Option */}
                    <button
                      onClick={activeTab === 'stores' ? handleSelectAllStores : handleSelectAllStatuses}
                      className="w-full flex items-start justify-between p-3 hover:bg-gray-50 transition-colors border-b-[1px] border-b-[#e1e1e1]"
                    >
                      <span className="text-[12px] font-medium font-inter text-[#000]">
                        Select All
                      </span>
                      <div className="relative">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                          isAllSelected 
                            ? "bg-[rgba(222,44,109,1)] border-[rgba(222,44,109,1)]" 
                            : "border-gray-300 bg-white"
                        }`}>
                          {isAllSelected && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                          {isSomeSelected && !isAllSelected && (
                            <div className="w-2 h-2 bg-white rounded-sm"></div>
                          )}
                        </div>
                      </div>
                    </button>

                    {/* Filter Options - Scrollable */}
                    <div className="flex-1 w-full overflow-y-auto [&::-webkit-scrollbar]:hidden scroll-smooth">
                      <div className="space-y-1">
                        {currentOptions?.map((option) => {
                          const isSelected = currentSelected.includes(option.id);
                          
                          return (
                            <button
                              key={option.id}
                              onClick={() => {
                                if (activeTab === 'stores') {
                                  handleStoreCheckboxChange(option.id);
                                } else {
                                  handleStatusCheckboxChange(option.id);
                                }
                              }}
                              className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors border-b-[0.5px] border-b-[#e1e1e1] "
                            >
                              <div className="flex items-center w-full gap-3">
                                {/* Store/Status Icon Placeholder */}
                                <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                                  <span className="text-[10px] font-medium text-gray-600">
                                    {option.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <span className="text-[12px] font-medium font-inter text-[#18181b]">
                                  {option.name}
                                </span>
                              </div>
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                isSelected
                                  ? "bg-[rgba(222,44,109,1)] border-[rgba(222,44,109,1)]"
                                  : "border-gray-300 bg-white"
                              }`}>
                                {isSelected && (
                                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

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

export default SlideUpCombinedFilterModal;