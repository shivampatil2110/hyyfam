"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import "./ScrollingCards.css"; // Import external CSS
import Image from "next/image";

interface Card {
  id: number;
  img: string;
}

const cards: Card[] = [
  { id: 1, img: "/static/MovingCarousel.png" },
  { id: 2, img: "/static/MovingCarousel.png" },
  { id: 3, img: "/static/MovingCarousel.png" },
  { id: 4, img: "/static/MovingCarousel.png" },
  { id: 5, img: "/static/MovingCarousel.png" },
  { id: 6, img: "/static/MovingCarousel.png" },
  { id: 7, img: "/static/MovingCarousel.png" },
  { id: 8, img: "/static/MovingCarousel.png" },
  { id: 9, img: "/static/MovingCarousel.png" },
  { id: 10, img: "/static/MovingCarousel.png" },
];

const duplicatedCards = [...cards, ...cards];

export default function ScrollingCards() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative overflow-hidden w-full h-96 flex items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        className="flex gap-5 min-w-fit scroll-animation h-full"
        style={{
          animationPlayState: isHovered ? "paused" : "running",
        }}
      >
        {duplicatedCards.map((card, index) => (
          <motion.div
            key={index}
            className="w-56 h-72 perspective-1000"
            onMouseEnter={() => setHoveredCard(card.id)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <motion.div
              className="relative w-full h-full transform-style-3d transition-transform duration-900 "
              animate={{ rotateY: hoveredCard === card.id ? 180 : 0 }}
              style={{ transformStyle: "preserve-3d" }} // Ensure 3D rotation works
            >
              {/* Front Side (Image) */}
              <div
                className={`absolute w-full h-full bg-contain bg-center rounded-2xl ${
                  card.id % 2 === 0 ? "mt-6" : "mb-6"
                }`}
                style={{
                  transform: "rotateY(0deg)",
                  backfaceVisibility: "hidden",
                }}
              >
                <Image
                  className={`w-full h-full md:w-[300px] md:h-[360px] rounded-2xl object-cover`}
                  src={card.img}
                  height={600}
                  width={300}
                  alt="creator-image"
                />
              </div>

              {/* Back Side (Text on Linear Gradient) */}
              <div
                className={`absolute w-full h-full flex items-center justify-center rounded-2xl text-white text-lg font-bold ${
                  card.id % 2 === 0 ? "mt-4" : "mb-4"
                }`}
                style={{
                  transform: "rotateY(180deg)",
                  backfaceVisibility: "hidden",
                  background: "linear-gradient(to right, #ff7e5f, #feb47b)", // Gradient background
                }}
              >
                <p className="font-inter">Hello</p>
              </div>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
