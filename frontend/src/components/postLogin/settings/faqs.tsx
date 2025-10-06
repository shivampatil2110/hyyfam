"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  isHighlighted?: boolean;
}

const faqs = ({changeTab}: any) => {
  const router = useRouter();
  const faqData: FAQItem[] = [
    {
      id: 1,
      question: "Can I reply to my Insta post comments automatically?",
      answer:
        "Yes! You can set a predefined auto-reply that goes to every new comment on your post.",
    },
    {
      id: 2,
      question: "How can I be a part of Hyyfam giveaway?",
      answer:
        "All you have to do is connect your social media account, create any three custom collections with your favourite product links, generate three affiliate links and plan and set your next Insta post.",
    },
    {
      id: 3,
      question: "Can I edit or delete my collection after publishing?",
      answer:
        "Yes, you can easily edit the title, image, or products in your collection anytime. You can also delete it if you no longer want it displayed.",
    },
    {
      id: 4,
      question: "What is an auto DM, and how does it work?",
      answer:
        "Auto DM automatically lets you send a DM to the user who comments on your post using the preset keywords.",
    },
    {
      id: 5,
      question: "How can I schedule my upcoming post on Instagram?",
      answer:
        "To schedule your upcoming post on Insta, you need to keep the following things in mind:\n• You can prepare your post in advance and add products before uploading.\n• Once products are added, you have 3 hours to upload the post.\n• If the post is not uploaded within 3 hours, the products will not be added to that post.\n• After posting, you are required to make the first comment for testing purpose.",
    },
    {
      id: 6,
      question: "How are my orders tracked?",
      answer:
        "Hyyfam automatically tracks orders when someone clicks your shared link and makes a purchase. You don’t need to track anything manually.",
    },
    {
      id: 10,
      question: "Can Hyyfam help me track my performance?",
      answer:
        "Yes, with the help of our analytical dashboard, you can track your performance and all the relevant insights.\n ▸ What metrics can I see in my dashboard?\n Total clicks on product links\n Products added \n Estimated earnings",
    },
    {
      id: 7,
      question: "How do I know which product links are performing well?",
      answer:
        "Your dashboard shows top-performing product links based on click count and engagement.\n ▸ Can I compare product performance? \n Yes! You can view link-wise metrics to understand which products your audience interacts with the most.",
    },
    {
      id: 8,
      question: "Can I use this data to pitch to brands?",
      answer:
        "Yes! Your performance insights can help showcase your influence and conversion power when collaborating with brands.",
    },
    {
      id: 9,
      question: "What happens if I delete a post or story after linking it on Hyyfam?",
      answer:
        "If the post is deleted, the associated analytics stop updating. \n ▸ Will I lose the clicks I already received? \n No, past data will remain visible on your dashboard, but further tracking will stop.",
    },
  ];

  const [openId, setOpenId] = useState<number | null>(3); // Default to the third question being open

  const toggleQuestion = (id: number) => {
    setOpenId(openId === id ? null : id);
  };
  return (
    <div className="min-h-screen font-inter">
      <div className="pb-20  flex flex-col items-center justify-start w-full">
        <div className="w-full flex items-center justify-start gap-[14px] py-[18px] border-b-[1px] border-b-[#f0f2f5] px-[15px]">
          <svg
            onClick={() => changeTab("Settings")}
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
          <h1 className="text-[#000] text-[18px] font-inter font-bold leading-normal ">
            FAQs
          </h1>
        </div>

        <div className="flex flex-col items-center justify-center gap-[14px] pt-[30px] px-[15px] w-full">
          {faqData.map((item, index) => (
            <motion.div
              key={item.id}
              className="border-[0.5px] border-[#c2c2c2] rounded-[8px] overflow-hidden w-full"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.4 }}
              whileHover={{ scale: 1.01 }}
            >
              <motion.div
                className={`flex justify-between items-center p-[14px] cursor-pointer gap-2 ${item.isHighlighted ? "bg-blue-100" : "bg-white"
                  }`}
                onClick={() => toggleQuestion(item.id)}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center">
                  {item.isHighlighted && (
                    <motion.div
                      className="w-8 h-8 rounded-md bg-blue-500 text-white flex items-center justify-center mr-3"
                      whileHover={{ scale: 1.1 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 10,
                      }}
                    >
                      T
                    </motion.div>
                  )}
                  <h3 className="font-bold text-[14px] font-inter ">
                    {item.question}
                  </h3>
                </div>
                <motion.div
                  className="flex-shrink-0"
                  animate={{ rotate: openId === item.id ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {openId === item.id ? (
                    <svg
                      className="rotate-180"
                      xmlns="http://www.w3.org/2000/svg"
                      width="27"
                      height="27"
                      viewBox="0 0 27 27"
                      fill="none"
                    >
                      <path
                        d="M1 13.5C1 3.20625 3.20625 1 13.5 1C23.7937 1 26 3.20625 26 13.5C26 23.7937 23.7937 26 13.5 26C3.20625 26 1 23.7937 1 13.5Z"
                        stroke="black"
                      />
                      <path
                        d="M13.5003 18.6991L13.5003 7.60794"
                        stroke="black"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M18.7393 14.1541L13.8453 19.0481C13.6554 19.238 13.3474 19.2379 13.1574 19.048L8.2636 14.1541"
                        stroke="black"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="hover:rotate-45"
                      xmlns="http://www.w3.org/2000/svg"
                      width="27"
                      height="27"
                      viewBox="0 0 27 27"
                      fill="none"
                    >
                      <path
                        d="M1 13.5C1 3.20625 3.20625 1 13.5 1C23.7937 1 26 3.20625 26 13.5C26 23.7937 23.7937 26 13.5 26C3.20625 26 1 23.7937 1 13.5Z"
                        stroke="black"
                      />
                      <path
                        d="M17.1786 9.82371L9.33594 17.6664"
                        stroke="black"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M10.2617 9.3335H17.1828C17.4513 9.3335 17.6691 9.55132 17.6691 9.81997V16.7409"
                        stroke="black"
                        strokeLinejoin="round"
                      />
                    </svg>
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
                    <div className="px-[14px] pb-[14px] bg-white ">
                      <div
                        className="text-[#000] text-[12px] font-inter whitespace-pre-line"
                      >
                        {item.answer}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default faqs;
