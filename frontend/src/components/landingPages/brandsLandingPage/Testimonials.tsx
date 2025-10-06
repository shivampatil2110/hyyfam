"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const testimonials = [
  {
    id: 1,
    name: "",
    followers: "",
    content:
      "Hyyfam made creator collaboration easy and effortless. We saw a spike in engagement and conversion in just one week. Looking forward to more collaborations and projects.",
  },
  {
    id: 2,
    name: "",
    followers: "",
    content:
      "What stood out with Hyyfam is their content quality. No fake creators, no fake hype ups, just smooth communication and real results.",
  },
  {
    id: 3,
    name: "",
    followers: "",
    content:
      "It’s rare to find platforms like Hyyfam, their team is super supportive and helped us find the creators that perfectly fit into our niche.",
  },
];

const duplicatedTestimonials = [
  ...testimonials,
  ...testimonials,
  ...testimonials,
];

// Testimonial card component
const TestimonialCard = ({ testimonial }: any) => (
  <div className="bg-white p-6 rounded-[25px] shadow-md">
    <p className="text-[#000] text-[16px] mb-4">{testimonial.content}</p>
    <div className="border-b pb-4 mb-4"></div>
    <div className="flex items-center mt-4">
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className="w-5 h-5 text-yellow-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    </div>
    {
      testimonial.name && testimonial.followers &&
      <p className="text-black text-[16px] font-bold mt-2">
        {testimonial.name}, {testimonial.followers}"
      </p>
    }
  </div>
);

const TestimonialCardMobile = ({ testimonial }: any) => (
  <div className="bg-white p-6 max-h-[265px] min-h-[265px] max-w-[280px] min-w-[280px]  rounded-[25px] shadow-md">
    <p className="text-[#000] text-[14px] min-h-[130px] mb-4">{testimonial.content}</p>
    <div className="border-b-[0.2px] border-b-[#000]/50 pb-4 mb-4"></div>
    <div className="flex items-center mt-4">
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className="w-5 h-5 text-yellow-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    </div>
    {/* <p className="text-black font-bold text-[14px] mt-2">
      {testimonial.name}, {testimonial.followers}"
    </p> */}
  </div>
);

// Vertical scroll for desktop
const VerticalScroll = () => (
  <div className="relative w-full max-w-[90%] min-h-[80vh] max-h-[80vh] overflow-hidden">
    <motion.div
      initial={{ y: 0 }}
      animate={{ y: "-33.33%" }}
      transition={{
        repeat: Infinity,
        duration: 20,
        ease: "linear",
        repeatType: "loop",
      }}
      className="w-full"
    >
      {duplicatedTestimonials.map((testimonial, index) => (
        <div
          key={`${testimonial.id}-${index}`}
          className="mb-4 rounded-[25px] border-black border-solid border-[1px] box-border"
        >
          <TestimonialCard testimonial={testimonial} />
        </div>
      ))}
    </motion.div>
  </div>
);

// Horizontal carousel for mobile
const HorizontalCarousel = () => (
  <div className="relative w-full overflow-hidden px-2">
    <motion.div
      className="flex"
      initial={{ x: 0 }}
      animate={{ x: "-200%" }}
      transition={{
        repeat: Infinity,
        duration: 25,
        ease: "linear",
        repeatType: "loop",
      }}
    >
      {duplicatedTestimonials.map((testimonial, index) => (
        <div
          key={`${testimonial.id}-${index}`}
          className="min-w-[280px] max-w-[280px] max-h-[265px] min-h-[265px] mx-3 px-2 mb-4 md:min-w-0"
          style={{ flex: "0 0 100%" }}
        >
          <TestimonialCardMobile testimonial={testimonial} />
        </div>
      ))}
    </motion.div>
  </div>
);

const TestimonialSection = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkIfMobile();

    // Set up event listener
    window.addEventListener("resize", checkIfMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  return (
    <div className="w-full h-auto bg-[#ffeff5]">
      <div className=" w-full md:px-0 md:w-[95%] lg:w-[90%] max-w-[1444px] py-14 md:py-0 mx-auto md:min-h-[80vh] md:max-h-[80vh] flex flex-col md:flex-row">
        {/* Left side content */}
        <div className=" w-full md:w-1/2 flex flex-col items-center md:items-start justify-center p-  md:p-6 px-[18px]">
          <h2 className="text-[16px] font-inter md:text-[18px] font-medium italic">
            Voices of the brands
          </h2>
          <h2 className="text-[26px] font-inter md:text-[28px] font-medium mt-2.5 mb-1.5  leading-[40px] lg:leading-[54px] text-center md:text-left">
            Transforming  {' '}
            <span className="text-[rgba(222,44,109,1)] font-bold">
              your brand
            </span> into stories that sell
          </h2>
          <p className="text-[16px] md:text-[18px] mb-10 leading-[22px] text-center md:text-left">
            Hear what our clients have shared about their journey with us and how our services helped them grow.
          </p>
        </div>

        {/* Right side testimonials */}
        <div className="flex justify-center items-center lg:max-h-[80vh] lg:min-h-[80vh] md:min-h-[80vh] md:max-h-[80vh] lg:w-[50%] w-xs-[100%] md:w-1/2">
          {isMobile ? <HorizontalCarousel /> : <VerticalScroll />}
        </div>
      </div>
    </div>
  );
};

export default TestimonialSection;
