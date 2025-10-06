"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import React, { useRef, useState, useEffect } from "react";

const brands = [
  { name: "Nykaa", logo: "/static/Nykaa.webp" },
  { name: "Flipkart", logo: "/static/flipkart.webp" },
  // { name: "Amazon", logo: "/static/AmazonLogo.png" },
  // { name: "Adidas", logo: "/static/adidas.png" },
  { name: "Myntra", logo: "/static/myntra.webp" },
  // { name: "Tata Cliq", logo: "/static/TataCliqLogo.jpg" },
  { name: "New Me", logo: "/static/NEWMEASIA.webp" },
  { name: "Ajio", logo: "/static/ajio.webp" },
  // { name: "mCaffeine", logo: "/static/mcaffeine.png" },
  { name: "Savana", logo: "/static/savana.webp" },
  { name: "Meesho", logo: "/static/meesho.webp" },
];

const AutoScrollBrands = () => {
  return (
    <div style={{
      background: 'linear-gradient(0deg, #FFF 10%,  #FFEBF2 29.42%, #FFF 90.98%)'
    }} className="w-full relative">
      <svg
        className="absolute top-0 left-0 hidden lg:block"
        xmlns="http://www.w3.org/2000/svg"
        width="120"
        height="120"
        viewBox="0 0 190 200"
        fill="none"
      >
        <path
          d="M-4.0006 -72C-4.0006 -72 188.999 113 178.999 121C168.999 129 10.9994 4 -4.0006 8C-19.0006 12 94.9994 180 85.9994 189C76.9994 198 -83.0006 116 -83.0006 116"
          stroke="rgba(222,44,109,1)"
          strokeWidth="10.84"
          strokeMiterlimit="10"
        />
      </svg>
      <div className="relative  w-full md:px-0  max-w-[1444px] mx-auto lg:ml-auto   flex flex-col md:flex-row items-center gap-6 sm:gap-8 md:gap-10 overflow-hidden">
        {/* <Image
          src={"/static/checks2.png"}
          alt="checks image"
          className="absolute scale-50 md:scale-100 lg:left-0 top-[-300px] md:top-[-220px] lg:top-0 rotate-90 lg:rotate-0"
          width={320}
          height={100}
        /> */}

        <div className="w-full px-[18px] md:w-2/5">
          <div className="relative text-black text-left py-3 flex flex-col items-start justify-center gap-3 md:gap-4">
            <h2 className="m-0 font-inter text-[26px] md:text-[28px]  font-inter leading-[20px] md:leading-[30px]  w-full text-center md:text-left">
              Partner with Top{" "}
              <span className="m-0 text-[26px] md:text-[28px]  text-[rgba(222,44,109,1)] font-inter-medium font-semibold">
                Brands
              </span>
              
            </h2>
            <p className="m-0 font-inter text-[16px] md:text-[18px] font-inter-medium w-full text-center md:text-left lg:text-left">
              It’s your time to shine, collab with brands that you love.
            </p>
          </div>
        </div>
        <div className="w-full  md:w-3/5 flex justify-center h-[40vh] md:h-[60vh] items-center overflow-hidden">
          <div
            className="hidden md:flex w-[90%] mx-auto justify-around rotate-[-20deg] h-[40vh] md:h-[70vh] lg:h-[80vh]"
          >
            {/* Column 1: Top to Bottom */}
            <ScrollingColumn logos={brands} direction="up" />
            {/* Column 2: Bottom to Top */}
            <ScrollingColumn logos={brands} direction="down" />
            {/* Column 3: Top to Bottom */}
            <ScrollingColumn logos={brands} direction="up" />

            <ScrollingColumn logos={brands} direction="down" />
          </div>

          <div
            className="flex md:hidden justify-around rotate-[-20deg] h-[55vh] md:h-[70vh] lg:h-[80vh]"
          >
            {/* Column 1: Top to Bottom */}
            <ScrollingColumn logos={brands} direction="up" />
            {/* Column 2: Bottom to Top */}
            <ScrollingColumn logos={brands} direction="down" />
            {/* Column 3: Top to Bottom */}
            <ScrollingColumn logos={brands} direction="up" />

            <ScrollingColumn logos={brands} direction="down" />
          </div>
        </div>
      </div>
    </div>
  );
};

const ScrollingColumn = ({ logos, direction }: any) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [containerHeight, setContainerHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    if (containerRef.current) {
      setContainerHeight(containerRef.current.offsetHeight);
    }
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [logos]);

  return (
    <div
      ref={containerRef}
      className="overflow-hidden relative min-w-[115px] md:min-w-[170px] lg:min-w-[170px] h-full" // Ensure it has a defined height
    >
      <motion.div
        initial={{ y: direction === "down" ? -contentHeight / 2 : 0 }}
        animate={{
          y:
            direction === "down"
              ? [0, -contentHeight / 2]
              : [-contentHeight / 2, 0],
        }}
        transition={{
          repeat: Infinity,
          repeatType: "loop",
          duration: 35,
          ease: "linear",
        }}
        className="absolute top-0 left-0 "
      >
        {/* Repeat logos for seamless scrolling */}
        <div ref={contentRef} className="flex flex-col">
          {[...logos, ...logos].map((logo, index) => (
            <div key={index} className="flex justify-center my-1.5 lg:my-4 bg-[#fff] border-[2px] border-[#f1437e]/20 p-5 h-25 md:h-35 lg:h-30   w-25 md:w-35 lg:w-30 rounded-[20px]">
              <img
                src={logo.logo}
                alt={logo.name}
                className="transform  hover:scale-110 transition-transform duration-300  w-[75px] md:w-[110px] lg:w-[150px] object-contain"
              />
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default AutoScrollBrands;
