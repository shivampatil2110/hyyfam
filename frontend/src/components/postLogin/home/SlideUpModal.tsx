import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SlideUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileComplete: boolean;
  children: React.ReactNode;
}

const SlideUpModal: React.FC<SlideUpModalProps> = ({ isOpen, onClose, profileComplete, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed bottom-0 inset-0 z-70 flex flex-col justify-end &::--scrollbar]:hidden  scroll-smooth max-w-[448px] mx-auto">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/30 backdrop-blur-[0px] &::--scrollbar]:hidden  scroll-smooth"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Slide-up Panel */}
          <motion.div
            className={`relative bg-white rounded-t-2xl ${profileComplete ?  "" : "px-[15px] pt-[42px] pb-[45px]" } z-50 max-w-[448px] min-w-full mx-auto &::--scrollbar]:hidden  scroll-smooth`}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SlideUpModal;
