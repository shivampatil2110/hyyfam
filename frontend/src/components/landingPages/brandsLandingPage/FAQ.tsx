"use client";

import React, { useState } from "react";
import { ChevronDown, ArrowUpRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion"
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

// Define the type for FAQ items
interface FAQItem {
  id: number;
  question: string;
  answer: string;
  isHighlighted?: boolean;
}

const FAQSection = () => {
  // Sample data - in a real app, you'd pass this as a prop or fetch from an API
  const faqData: FAQItem[] = [
    {
      id: 1,
      question: "How can Hyyfam help my brand grow?",
      answer:
        "Hyyfam helps your brand grow by connecting you with the right content creators who can authentically promote your products to the right audience. Our platform uses performance-driven strategies, trend insights, and data-backed recommendations to run high-converting campaigns. From increasing brand visibility to boosting engagement and sales, Hyyfam supports you at every step with tools that simplify influencer marketing and deliver real impact.",
    },
    {
      id: 2,
      question: "How can I connect with the content creators on Hyyfam?",
      answer:
        " It’s extremely simple. All you have to do is tell us about your campaign, what you are promoting, your goal and your target audience. Based on this, Hyyfam recommends suitable creators who align with your brand values. You can choose the best fit, launch collaborations, and manage everything seamlessly on one platform. We ensure the process is not only easy but also impactful and results-driven.",
    },
    {
      id: 3,
      question: "Can I work with creators from different platforms?",
      answer:
        "Yes, Hyyfam allows you to collaborate with creators from both Instagram and YouTube, all from one dashboard. You can manage campaigns, track performance, and communicate with the creators, no matter which platform they are on.",
    },
    {
      id: 4,
      question: "What if a creator doesn’t deliver as promised?",
      answer:
        "We have got your back! At Hyyfam, we closely monitor collaborations to ensure all agreed deliverables are met. If a creator fails to meet expectations outlined in the campaign brief, our team steps in to resolve the issue. Whether it’s through follow-ups, adjustments, or alternative solutions, we make sure your campaign stays on track without compromising results.",
    },
  ];

  const [openId, setOpenId] = useState<number | null>(3); // Default to the third question being open

  const toggleQuestion = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <motion.div
      className="w-full md:w-[85%] lg:w-[78%] max-w-[1444px] mx-auto px-[18px] md:px-0 pt-12 "
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="text-center my-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <h2 className="text-[26px] font-inter md:text-[28px]  font-medium mb-2">
          Got <span className="font-bold">Questions?</span>
        </h2>
        <p className="text-[16px] md:text-[18px] ">
          Got Questions? We are here for you!
        </p>
      </motion.div>

      <div className="space-y-4 md:space-y-5 lg:space-y-7 md:w-[80%] md:mx-auto">
        {faqData.map((item, index) => (
          <motion.div
            key={item.id}
            className="border rounded-[10px] overflow-hidden"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index, duration: 0.4 }}
            whileHover={{ scale: 1.01 }}
          >
            <motion.div
              className={`flex justify-between items-center p-4 cursor-pointer ${item.isHighlighted ? "bg-blue-100" : "bg-white"
                }`}
              onClick={() => toggleQuestion(item.id)}
            // whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center">
                {item.isHighlighted && (
                  <motion.div
                    className="w-8 h-8 rounded-md bg-blue-500 text-white flex items-center justify-center mr-3"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    T
                  </motion.div>
                )}
                <h3 className="font-semibold text-[18px]  ">
                  {item.question}
                </h3>
              </div>
              <motion.div
                className="flex-shrink-0"
                // animate={{ rotate: openId === item.id ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {openId === item.id ? (
                  <KeyboardArrowUpIcon className="scale-150" />
                ) : (
                  <KeyboardArrowDownIcon className="scale-150" />
                )}
              </motion.div>
            </motion.div>

            <AnimatePresence>
              {openId === item.id && (
                <motion.div
                  className="overflow-hidden"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{
                    height: { duration: 0.3, ease: "easeInOut" },
                    opacity: { duration: 0.2 },
                  }}
                >
                  <div className="px-4 pb-4 bg-white ">
                    <motion.p
                      className="text-[#000] text-[16px] "
                      initial={{ y: -10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -10, opacity: 0 }}
                      transition={{ delay: 0.1, duration: 0.2 }}
                    >
                      {item.answer}
                    </motion.p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default FAQSection;
