import React, { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SlideUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: string;
  onDeleteOrDiscard?: () => void;
  collectionName?: string;
  postName?: string;
}

const SlideUpConfirmationModal: React.FC<SlideUpModalProps> = ({
  isOpen,
  onClose,
  type,
  onDeleteOrDiscard,
  collectionName,
  postName,
}) => {
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
            className={`relative bg-white rounded-t-2xl px-[15px] pt-[18px] pb-[20px] z-50 max-w-[448px] min-w-full mx-auto &::--scrollbar]:hidden  scroll-smooth`}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {type === "collection_del" && (
              <div className="relative w-full">
                <svg
                  onClick={onClose}
                  className="absolute top-0 right-0 cursor-pointer"
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M1 15.1969L14.3093 1.43091M1.16477 1L14.4741 14.766"
                    stroke="black"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex flex-col w-full items-start justify-center gap-12">
                  <div className="flex flex-col  items-start justify-center w-full gap-[18px]">
                    <h2 className="text-[#161616] text-[14px] font-bold font-inter leading-normal">
                      Delete Collection?
                    </h2>
                    <div className="flex flex-col  items-start justify-center w-full gap-3">
                      <h4 className="text-[#000] text-[12px] font-normal font-inter leading-normal">
                        Are you sure you want to delete{" "}
                        <span className="font-bold">"{collectionName}"</span>?
                      </h4>
                      <p className="text-[11px] font-normal leading-4 font-inter text-[#000]">
                        This will remove all items from the collection.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center w-full gap-3">
                    <button
                      onClick={onClose}
                      className="py-3 w-full bg-[rgba(222,44,109,1)] rounded-[7px] text-[16px] font-medium font-inter text-[#fff] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={onDeleteOrDiscard}
                      className="py-3 w-full bg-[#fff] rounded-[7px] text-[16px] font-medium font-inter text-[#000]/70 cursor-pointer border border-[#EDE7E7]"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}

            {type === "post_del" && (
              <div className="relative w-full">
                <svg
                  onClick={onClose}
                  className="absolute top-0 right-0 cursor-pointer"
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M1 15.1969L14.3093 1.43091M1.16477 1L14.4741 14.766"
                    stroke="black"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex flex-col w-full items-start justify-center gap-12">
                  <div className="flex flex-col  items-start justify-center w-full gap-[18px]">
                    <h2 className="text-[#161616] text-[14px] font-bold font-inter leading-normal">
                      Delete Post?
                    </h2>
                    <div className="flex flex-col  items-start justify-center w-full gap-3">
                      <h4 className="text-[#000] text-[12px] font-normal font-inter leading-normal">
                        Are you sure you want to delete this Auto Post?
                      </h4>
                      <p className="text-[11px] font-normal leading-4 font-inter text-[#000]">
                        This will remove all items from the collection.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center w-full gap-3">
                    <button
                      onClick={onClose}
                      className="py-3 w-full bg-[rgba(222,44,109,1)] rounded-[7px] text-[16px] font-medium font-inter text-[#fff] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={onDeleteOrDiscard}
                      className="py-3 w-full bg-[#fff] rounded-[7px] text-[16px] font-medium font-inter text-[#000]/70 cursor-pointer border border-[#EDE7E7]"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}

            {type === "discard_post" && (
              <div className="relative w-full">
                <svg
                  onClick={onClose}
                  className="absolute top-0 right-0 cursor-pointer"
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M1 15.1969L14.3093 1.43091M1.16477 1L14.4741 14.766"
                    stroke="black"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex flex-col w-full items-start justify-center gap-12">
                  <div className="flex flex-col  items-start justify-center w-full gap-[18px]">
                    <h2 className="text-[#161616] text-[14px] font-bold font-inter leading-normal">
                      Discard draft post?
                    </h2>
                    <div className="flex flex-col  items-start justify-center w-full gap-3">
                      <h4 className="text-[#000] text-[12px] font-normal font-inter leading-normal">
                        Are you sure you want to discard this setup.
                      </h4>
                      <p className="text-[11px] font-normal leading-4 font-inter text-[#000]">
                        This will remove all items from this post.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center w-full gap-3">
                    <button
                      onClick={onClose}
                      className="py-3 w-full bg-[rgba(222,44,109,1)] rounded-[7px] text-[16px] font-medium font-inter text-[#fff] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={onDeleteOrDiscard}
                      className="py-3 w-full bg-[#fff] rounded-[7px] text-[16px] font-medium font-inter text-[#000]/70 cursor-pointer border border-[#EDE7E7]"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}

            {type === "delete_acc" && (
              <div className="relative w-full">
                <svg
                  onClick={onClose}
                  className="absolute top-0 right-0 cursor-pointer"
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M1 15.1969L14.3093 1.43091M1.16477 1L14.4741 14.766"
                    stroke="black"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex flex-col w-full items-start justify-center gap-[29px]">
                  <div className="flex flex-col  items-start justify-center w-full gap-6">
                    <div className="flex flex-col  items-start justify-center w-full gap-3">
                      <h2 className="text-[#F52D2D] text-[14px] font-bold font-inter leading-normal">
                        Delete Account?
                      </h2>
                      <p className="text-[12px] font-medium leading-4 font-inter text-[#000]">
                        Are you sure you want to permanently delete your
                        account? This action cannot be undone.
                      </p>
                    </div>

                    <div className="bg-[#FFEFE8] rounded-[7px] p-3 flex flex-col items-start justify-center w-full gap-3 ">
                      <p className="text-[11px] text-[#000] font-bold font-inter leading-4">
                        What you'll lose:
                      </p>
                      <ul className="list-disc ml-3.5 text-[11px] font-normal font-inter text-[#000] leading-5">
                        <li>All saved collections and items</li>
                        <li>Purchase history and order tracking</li>
                        <li>Personalized recommendations</li>
                        <li>Reward points and loyalty status</li>
                        <li>Stored payment methods and addresses</li>
                      </ul>
                    </div>
                  </div>
                  <div className="flex items-center justify-center w-full gap-3">
                    <button
                      onClick={onClose}
                      className="py-3 w-full bg-[#fff] rounded-[7px] text-[16px] font-medium font-inter text-[#000]/70 cursor-pointer border border-[#EDE7E7]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={onDeleteOrDiscard}
                      className="py-3 w-full bg-[#F54A4A] rounded-[7px] text-[16px] font-medium font-inter text-[#fff] cursor-pointer border border-[#EDE7E7]"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SlideUpConfirmationModal;
