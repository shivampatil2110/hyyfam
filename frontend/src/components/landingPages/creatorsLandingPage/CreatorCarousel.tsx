"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import "./ScrollingCards.css";

interface Slide {
  number: number;
  heading: string;
  description: string;
}

const carouselData: Slide[] = [
  {
    number: 1,
    heading: "Personalized Catalogue",
    description:
      "Ready to start your **Instagram monetization**? Well, build a custom catalogue with your top product picks and let your followers shop directly from your collection. ",
  },
  {
    number: 2,
    heading: "Instagram Automation Tool ",
    description:
      "Our **auto DM tool** is here to make your journey simpler. Your followers comment, “Link, please,” and we slide into their DMs like a smooth operator with your product’s automated links.",
  },
  {
    number: 3,
    heading: "Analytics Dashboard",
    description:
      "Stay on top of growth with our detailed analytics, keep track of your income, view your performance, and **earn through social media** like never before.",
  },
  {
    number: 4,
    heading: "Effortless Earnings",
    description:
      "You can earn money just by sharing links. Yes, you read it right! Earn every time any user shops from your link, sent by us into their DMs. No hassle, no extra effort.",
  },
  {
    number: 5,
    heading: "100% Transparency ",
    description:
      "Trust starts with clarity. With Hyyfam, you get a complete view of your earnings and performance metrics, ensuring your journey to **earn from Instagram** is extremely simple and clear.",
  },
  {
    number: 6,
    heading: "Explore Stores",
    description:
      "Browse through 250+ stores and effortlessly add them to your catalogue. We are here to ensure that you find the right products to make money on IG.",
  },
  {
    number: 7,
    heading: "Link Your Products Before Posting",
    description:
      "Pre-schedule your product links before you upload your next Instagram post. No switching apps or extra steps. This feature will surely make your link sharing process simpler.",
  },
  {
    number: 8,
    heading: "24*7 support",
    description:
      "Have questions? Our support team is available 24/7 to guide you through [brand collaboration](https://www.hyyfam.com/brands), link setups, or any other query.",
  },
];

const CreatorCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const parseTextWithBold = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/);
  
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

  // Auto-rotation effect
  useEffect(() => {
    if (!isPaused) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % carouselData.length);
      }, 9000); // 7 seconds
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPaused]);

  const goToPrevious = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? carouselData.length - 1 : prev - 1
    );
    // Reset auto-rotation timer
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setIsPaused(false);
  };

  const goToNext = () => {
    setCurrentIndex((prev) =>
      prev === carouselData.length - 1 ? 0 : prev + 1
    );
    // Reset auto-rotation timer
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setIsPaused(false);
  };

  const goToSlide = (index: any) => {
    setCurrentIndex(index);
    // Reset auto-rotation timer
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setIsPaused(false);
  };

  // Touch/swipe handlers
  const handleTouchStart = (e: any) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: any) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;

    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      goToNext();
    }
    if (isRightSwipe) {
      goToPrevious();
    }
  };

  // Mouse handlers for desktop drag
  const handleMouseDown = (e: any) => {
    touchStartX.current = e.clientX;
    setIsPaused(true);
  };

  const handleMouseMove = (e: any) => {
    if (touchStartX.current) {
      touchEndX.current = e.clientX;
    }
  };

  const handleMouseUp = () => {
    if (!touchStartX.current || !touchEndX.current) {
      setIsPaused(false);
      return;
    }

    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    } else {
      setIsPaused(false);
    }

    touchStartX.current = 0;
    touchEndX.current = 0;
  };


  const parseTextAdvanced = (text: string): React.ReactNode[] => {
  const parseSegment = (segment: string, key: number): React.ReactNode => {
    // Check for link pattern first
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/;
    const linkMatch = segment.match(linkRegex);
    
    if (linkMatch) {
      const [fullMatch, linkText, url] = linkMatch;
      const beforeLink = segment.substring(0, linkMatch.index!);
      const afterLink = segment.substring(linkMatch.index! + fullMatch.length);
      
      return (
        <React.Fragment key={key}>
          {beforeLink && parseSegment(beforeLink, key * 10)}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline font-medium transition-all duration-200"
          >
            {parseBold(linkText)}
          </a>
          {afterLink && parseSegment(afterLink, key * 10 + 1)}
        </React.Fragment>
      );
    }
    
    return parseBold(segment);
  };

  const parseBold = (text: string): React.ReactNode => {
    const boldRegex = /\*\*([^*]+)\*\*/;
    const boldMatch = text.match(boldRegex);
    
    if (boldMatch) {
      const [fullMatch, boldText] = boldMatch;
      const beforeBold = text.substring(0, boldMatch.index!);
      const afterBold = text.substring(boldMatch.index! + fullMatch.length);
      
      return (
        <>
          {beforeBold}
          <strong className="font-semibold">{boldText}</strong>
          {afterBold && parseBold(afterBold)}
        </>
      );
    }
    
    return text;
  };

  // Split by major patterns and process each segment
  const segments = text.split(/(\[[^\]]+\]\([^)]+\))/);
  return segments.map((segment, index) => parseSegment(segment, index)).filter(Boolean);
};


  return (
    <div
      style={{
        background:
          "linear-gradient(0deg, rgba(255, 255, 255, 0.40) 53.12%, rgba(255, 214, 228, 0.40) 100%)",
      }}
      className="h-auto w-full py-[30px] md:pt-[100px] lg:py-[80px] relative"
    >
      <div className="w-full md:w-[95%] lg:w-[90%] max-w-[1444px] px-[18px] md:px-0 mx-auto flex flex-col items-center justify-center gap-10 relative ">
        <Image
          className="absolute top-[-40px] md:top-[-70px] right-0 z-0"
          src={"/static/checks.png"}
          alt="creators"
          width={230}
          height={100}
        />

        <div className="flex flex-col md:flex-row items-center md:items-start justify-center w-full gap-8 md:gap-28 z-20">
          <div className="flex flex-col items-center justify-center w-full pt-5 md:pt-0 md:w-2/5 ">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="231"
              height="99"
              viewBox="0 0 231 99"
              fill="none"
              className="lg:scale-125"
            >
              <path
                d="M0 15.406L14.5513 14.4194L15.9496 34.6972L37.1866 33.2573L35.7883 12.9795L50.3396 11.993L54.1044 66.587L39.5531 67.5735L38.101 46.5159L16.8639 47.9557L18.3161 69.0134L3.76481 70L0 15.406Z"
                fill="rgba(222,44,109,1)"
              />
              <path
                d="M83.644 65.7595C80.4978 65.9728 77.5219 65.6 74.7163 64.641C71.9107 63.682 69.419 62.3099 67.2413 60.5248C65.1124 58.6841 63.3816 56.503 62.0487 53.9815C60.7158 51.46 59.9489 48.7434 59.7481 45.8317C59.5474 42.92 59.9341 40.1252 60.9085 37.4473C61.8828 34.7694 63.2999 32.401 65.1599 30.3421C67.0687 28.2276 69.347 26.506 71.9949 25.1773C74.6427 23.8486 77.5397 23.0775 80.686 22.8642C83.937 22.6438 86.9654 23.0131 89.771 23.9721C92.5766 24.9311 95.0438 26.3309 97.1727 28.1716C99.298 29.9603 101.001 32.1172 102.281 34.6422C103.614 37.1637 104.381 39.8803 104.582 42.792L104.743 45.1317L73.6742 47.2382C74.2838 49.9655 75.3746 52.0332 76.9468 53.4415C78.5679 54.7943 80.5583 55.3906 82.9179 55.2306C84.4911 55.124 85.7614 54.8289 86.729 54.3454C87.7491 53.8583 88.5278 53.3093 89.0652 52.6982C89.7038 52.0281 90.178 51.2646 90.4877 50.4078L104.646 49.4479C103.895 52.3196 102.65 54.8853 100.909 57.1451C100.187 58.1343 99.2799 59.11 98.1872 60.0721C97.147 61.0307 95.9179 61.9237 94.4998 62.7511C93.1306 63.5231 91.5427 64.1792 89.7361 64.7196C87.9295 65.26 85.8988 65.6066 83.644 65.7595ZM90.128 39.4624C89.5866 37.723 88.537 36.2532 86.9791 35.0529C85.4701 33.797 83.6144 33.2437 81.412 33.393C79.2097 33.5424 77.421 34.3427 76.046 35.7941C74.7198 37.19 73.9079 38.786 73.6103 40.5823L90.128 39.4624Z"
                fill="rgba(222,44,109,1)"
              />
              <path
                d="M108.508 8.04912L121.879 7.14252L124.918 51.2077L133.963 50.5944L134.689 61.1232L112.273 62.6431L108.508 8.04912Z"
                fill="rgba(222,44,109,1)"
              />
              <path
                d="M135.622 6.21073L148.994 5.30414L152.033 49.3693L161.078 48.756L161.804 59.2849L139.387 60.8047L135.622 6.21073Z"
                fill="rgba(222,44,109,1)"
              />
              <path
                d="M187.426 58.723C184.175 58.9434 181.121 58.5759 178.263 57.6205C175.405 56.665 172.887 55.2947 170.709 53.5096C168.528 51.6725 166.771 49.4932 165.438 46.9717C164.105 44.4502 163.338 41.7336 163.137 38.8219C162.936 35.9102 163.323 33.1154 164.298 30.4375C165.272 27.7595 166.715 25.3894 168.628 23.3269C170.536 21.2125 172.841 19.4891 175.541 18.1568C178.242 16.8245 181.217 16.0481 184.468 15.8277C187.719 15.6073 190.774 15.9748 193.632 16.9302C196.49 17.8857 199.01 19.282 201.191 21.1191C203.369 22.9042 205.124 25.0576 206.457 27.5791C207.79 30.1005 208.557 32.8171 208.757 35.7288C208.958 38.6405 208.571 41.4353 207.597 44.1132C206.623 46.7912 205.181 49.1873 203.272 51.3018C201.36 53.3642 199.054 55.0616 196.353 56.3939C193.653 57.7262 190.677 58.5026 187.426 58.723ZM186.646 47.4142C189.216 47.24 191.303 46.1844 192.908 44.2472C194.513 42.3101 195.208 39.7817 194.993 36.6621C194.778 33.5424 193.742 31.1313 191.886 29.4289C190.03 27.7264 187.818 26.9623 185.248 27.1365C182.679 27.3107 180.592 28.3663 178.987 30.3035C177.382 32.2406 176.687 34.769 176.902 37.8886C177.117 41.0083 178.153 43.4194 180.009 45.1218C181.864 46.8243 184.077 47.5885 186.646 47.4142Z"
                fill="rgba(222,44,109,1)"
              />
              <path
                d="M224.385 56.2172C222.393 56.3523 220.668 55.7901 219.211 54.5307C217.755 53.2713 216.958 51.6537 216.822 49.6779C216.686 47.7021 217.253 45.9921 218.523 44.5478C219.793 43.1035 221.425 42.3138 223.417 42.1787C225.41 42.0436 227.134 42.6058 228.591 43.8652C230.048 45.1246 230.844 46.7422 230.98 48.718C231.116 50.6938 230.549 52.4038 229.279 53.8481C228.009 55.2924 226.378 56.0821 224.385 56.2172ZM215.521 25.0839L213.854 0.90659L227.225 0L228.893 24.1773L227.394 36.816L218.742 37.4026L215.521 25.0839Z"
                fill="rgba(222,44,109,1)"
              />
              <path
                d="M53.9456 95.0107C52.5668 94.7009 51.2722 94.1719 50.0618 93.4238C48.8686 92.6619 47.8213 91.7477 46.92 90.681C46.0359 89.6006 45.3331 88.4111 44.8116 87.1123C44.2898 85.7959 44.0196 84.4214 44.001 82.9888C43.9824 81.5562 44.2185 80.3042 44.7092 79.2329C45.1997 78.144 45.8756 77.2642 46.737 76.5936C47.6156 75.9093 48.6451 75.4617 49.8257 75.2508C51.0235 75.0261 52.3117 75.0687 53.6905 75.3785C54.6329 75.5902 55.4894 75.8797 56.2598 76.2468C57.0302 76.6139 57.7229 77.0252 58.3379 77.4808C58.9529 77.9364 59.4899 78.4186 59.9489 78.9274C60.4254 79.44 60.8322 79.9459 61.1694 80.4448C61.9676 81.6118 62.5581 82.8643 62.9409 84.2024L59.9304 83.5259C59.607 82.7479 59.1625 82.0131 58.5966 81.3217C58.1192 80.7382 57.4852 80.1549 56.6945 79.5717C55.9039 78.9884 54.9152 78.5634 53.7284 78.2968C52.7511 78.0772 51.8544 78.0433 51.0386 78.195C50.2227 78.3467 49.5219 78.6566 48.9363 79.1246C48.3508 79.5927 47.8977 80.2139 47.5771 80.9883C47.274 81.7667 47.1291 82.6688 47.1425 83.6946C47.1558 84.7205 47.325 85.6932 47.6502 86.6127C47.9928 87.5362 48.4648 88.3652 49.0659 89.0999C49.6671 89.8346 50.3801 90.4621 51.2047 90.9824C52.0293 91.5028 52.9303 91.8728 53.9076 92.0924C55.1119 92.363 56.1125 92.3673 56.9096 92.1056C57.7066 91.8438 58.3461 91.5025 58.8278 91.0817C59.3957 90.5921 59.8316 89.9846 60.1354 89.2593L63.1459 89.9357C62.7271 91.1819 62.1056 92.2326 61.2814 93.0879C60.9383 93.4693 60.534 93.8193 60.0683 94.1379C59.6026 94.4565 59.0665 94.7152 58.46 94.914C57.871 95.1167 57.1938 95.2291 56.4284 95.2511C55.6807 95.2947 54.8531 95.2146 53.9456 95.0107Z"
                fill="black"
              />
              <path
                d="M68.3708 83.6184L71.169 83.9553L71.2477 85.9437L71.3809 85.9597C71.5788 85.5965 71.849 85.2773 72.1918 85.0019C72.4833 84.7731 72.8558 84.5805 73.3094 84.424C73.78 84.252 74.3528 84.2066 75.028 84.2879L76.627 84.4804L76.7319 87.1316L74.9996 86.9231C74.4666 86.8589 73.9727 86.8874 73.5177 87.0085C73.0806 87.1318 72.6995 87.3322 72.3745 87.6097C72.0496 87.8872 71.7984 88.2439 71.6212 88.68C71.4617 89.1181 71.3932 89.62 71.4155 90.1856L71.704 97.4763L68.9058 97.1395L68.3708 83.6184Z"
                fill="black"
              />
              <path
                d="M88.4143 98.995C87.4483 98.9651 86.525 98.7603 85.6444 98.3805C84.7806 97.9837 84.0075 97.4664 83.3252 96.8285C82.6596 96.1735 82.1217 95.4167 81.7113 94.5582C81.2999 93.682 81.0635 92.7496 81.0021 91.7609C80.9408 90.7723 81.0627 89.8597 81.3679 89.0234C81.672 88.1694 82.118 87.4431 82.7058 86.8446C83.3103 86.229 84.0221 85.7577 84.8409 85.4306C85.6766 85.0865 86.5775 84.9294 87.5435 84.9593C88.5095 84.9893 89.4244 85.2027 90.2882 85.5995C91.1687 85.9792 91.9418 86.4965 92.6073 87.1515C93.2897 87.7894 93.8366 88.5464 94.248 89.4226C94.6584 90.2811 94.8942 91.2047 94.9556 92.1934L95.0131 93.1203L83.8772 92.7751C84.0196 93.3434 84.2297 93.8521 84.5075 94.3013C84.7853 94.7504 85.1219 95.1397 85.5173 95.4691C85.9116 95.7809 86.3373 96.0232 86.7944 96.1959C87.2694 96.3692 87.7573 96.4637 88.2582 96.4792C88.9559 96.5008 89.5497 96.4311 90.0396 96.2701C90.5284 96.0914 90.9173 95.8832 91.206 95.6455C91.5474 95.3917 91.8234 95.0919 92.034 94.746L94.9857 94.8375C94.6973 95.6568 94.2687 96.3747 93.6999 96.9915C93.448 97.248 93.1603 97.5034 92.8369 97.7577C92.5134 98.012 92.1346 98.2381 91.7006 98.4361C91.2654 98.6164 90.7743 98.7598 90.2274 98.8662C89.6806 98.9726 89.0762 99.0155 88.4143 98.995ZM91.9217 90.7778C91.8261 90.3872 91.6678 89.9946 91.447 89.6001C91.2261 89.2056 90.9369 88.8618 90.5795 88.5688C90.221 88.2582 89.8037 88.0073 89.3276 87.8164C88.8505 87.6078 88.3078 87.494 87.6996 87.4752C87.2344 87.4607 86.7826 87.5172 86.3442 87.6446C85.9236 87.7725 85.5342 87.9719 85.1761 88.2428C84.8348 88.4965 84.5515 88.8225 84.3262 89.2208C84.0999 89.6015 83.9483 90.0373 83.8717 90.5283L91.9217 90.7778Z"
                fill="black"
              />
              <path
                d="M106.181 98.6382C105.271 98.7068 104.408 98.6033 103.594 98.3277C102.797 98.0508 102.077 97.635 101.435 97.0803C100.81 96.5066 100.289 95.8008 99.8738 94.963C99.4762 94.1238 99.2307 93.1755 99.1372 92.1183C99.0437 91.061 99.1194 90.0886 99.3643 89.2009C99.627 88.3119 100.017 87.5463 100.536 86.9042C101.07 86.243 101.706 85.7161 102.444 85.3235C103.199 84.9295 104.032 84.6982 104.942 84.6295C105.638 84.5771 106.263 84.6364 106.818 84.8075C107.372 84.9785 107.838 85.174 108.217 85.3938C108.672 85.661 109.066 85.9594 109.401 86.289L109.535 86.2789L109.383 84.5608L112.193 84.3489L113.385 97.8289L110.575 98.0409L110.411 96.1907L110.277 96.2008C110.008 96.6113 109.673 96.9913 109.273 97.3408C108.94 97.632 108.515 97.9123 108 98.1818C107.483 98.4336 106.877 98.5857 106.181 98.6382ZM106.494 96.0868C107.637 96.0007 108.531 95.5519 109.178 94.7404C109.841 93.9099 110.108 92.7634 109.979 91.3008C109.849 89.8383 109.385 88.7558 108.587 88.0532C107.804 87.3317 106.842 87.014 105.7 87.1002C104.486 87.1917 103.548 87.6526 102.885 88.4831C102.22 89.296 101.952 90.4337 102.082 91.8962C102.211 93.3588 102.676 94.4501 103.476 95.1703C104.275 95.8728 105.281 96.1783 106.494 96.0868Z"
                fill="black"
              />
              <path
                d="M118.649 85.9648L117.061 86.2308L116.783 83.7253L118.371 83.4593L118.049 80.5581L120.828 80.0927L121.15 82.9938L125.253 82.3067L125.531 84.8122L121.428 85.4994L122.365 93.9391L126.6 93.2298L126.878 95.7353L119.863 96.9101L118.649 85.9648Z"
                fill="black"
              />
              <path
                d="M137.921 93.5234C136.951 93.7752 136.019 93.8359 135.124 93.7056C134.244 93.5531 133.452 93.251 132.747 92.7991C132.057 92.3251 131.474 91.7145 130.999 90.9671C130.538 90.1978 130.242 89.3221 130.111 88.34C129.98 87.358 130.032 86.4011 130.266 85.4694C130.515 84.5156 130.902 83.6532 131.426 82.882C131.965 82.0888 132.626 81.4089 133.41 80.8423C134.21 80.2537 135.094 79.8335 136.063 79.5817C137.033 79.3299 137.957 79.2802 138.837 79.4326C139.732 79.563 140.524 79.8652 141.214 80.3391C141.919 80.791 142.502 81.4017 142.963 82.171C143.438 82.9184 143.742 83.783 143.873 84.7651C144.003 85.7472 143.944 86.7151 143.695 87.6688C143.461 88.6005 143.075 89.4629 142.536 90.2561C142.012 91.0273 141.35 91.7072 140.551 92.2958C139.767 92.8624 138.89 93.2716 137.921 93.5234ZM137.588 91.0244C138.176 90.8715 138.699 90.6269 139.155 90.2906C139.629 89.9497 140.014 89.5414 140.309 89.0657C140.621 88.5854 140.836 88.0488 140.954 87.4557C141.087 86.8405 141.108 86.191 141.016 85.5071C140.925 84.8231 140.74 84.2363 140.46 83.7466C140.194 83.2349 139.854 82.8334 139.439 82.542C139.042 82.2461 138.578 82.0582 138.048 81.9782C137.535 81.8936 136.985 81.9278 136.396 82.0807C135.808 82.2336 135.276 82.4804 134.802 82.8213C134.346 83.1576 133.961 83.5659 133.649 84.0462C133.354 84.5219 133.141 85.0674 133.008 85.6825C132.89 86.2756 132.876 86.9141 132.967 87.5981C133.058 88.282 133.237 88.8798 133.502 89.3915C133.782 89.8812 134.121 90.274 134.518 90.5698C134.933 90.8612 135.397 91.0492 135.91 91.1337C136.44 91.2137 136.999 91.1773 137.588 91.0244Z"
                fill="black"
              />
              <path
                d="M147.544 76.5555L150.196 75.6112L150.503 77.5779L150.63 77.5329C150.772 77.0764 150.986 76.6308 151.274 76.1963C151.519 75.8321 151.845 75.4673 152.25 75.1016C152.669 74.7125 153.198 74.404 153.838 74.1762L155.354 73.6366L155.763 76.2588L154.121 76.8433C153.616 77.0232 153.158 77.2785 152.748 77.6091C152.354 77.9338 152.022 78.3105 151.751 78.739C151.48 79.1676 151.288 79.6421 151.174 80.1626C151.076 80.677 151.071 81.2139 151.159 81.7733L152.285 88.9843L149.633 89.9285L147.544 76.5555Z"
                fill="black"
              />
              <path
                d="M167.408 83.3654C166.772 83.6503 166.183 83.8486 165.639 83.9603C165.112 84.0648 164.635 84.1002 164.206 84.0664C163.778 84.0326 163.394 83.9508 163.054 83.821C162.711 83.6737 162.409 83.5082 162.147 83.3244C161.544 82.8989 161.078 82.3083 160.75 81.5524L163.562 80.2925C163.757 80.5999 164.02 80.8396 164.35 81.0116C164.621 81.1532 164.971 81.2409 165.399 81.2747C165.825 81.291 166.347 81.1604 166.967 80.8829C167.456 80.6638 167.855 80.4376 168.166 80.2045C168.476 79.9713 168.717 79.7412 168.888 79.5142C169.072 79.2624 169.188 79.0225 169.235 78.7943C169.283 78.5662 169.289 78.3563 169.255 78.1647C169.187 77.7814 168.939 77.5729 168.51 77.5391C168.098 77.4981 167.586 77.5393 166.975 77.6629C166.363 77.7864 165.709 77.9196 165.013 78.0622C164.317 78.2049 163.649 78.2596 163.009 78.2264C162.367 78.1757 161.803 77.9767 161.319 77.6294C160.851 77.2748 160.54 76.6619 160.385 75.7909C160.298 75.3031 160.319 74.7765 160.447 74.2112C160.592 73.6386 160.844 73.0744 161.202 72.5186C161.561 71.9629 162.022 71.4367 162.585 70.94C163.148 70.4432 163.812 70.0232 164.578 69.68C165.801 69.1322 166.809 68.9154 167.604 69.0295C168.415 69.1364 169.055 69.3671 169.522 69.7218C170.071 70.1343 170.505 70.6924 170.823 71.396L168.134 72.6011C167.964 72.3387 167.735 72.1403 167.447 72.0059C167.198 71.8918 166.871 71.8317 166.465 71.8254C166.072 71.7945 165.59 71.9068 165.02 72.1625C164.237 72.5131 163.701 72.9131 163.412 73.3627C163.122 73.8122 163.011 74.2286 163.079 74.6119C163.148 74.9951 163.388 75.2073 163.8 75.2484C164.225 75.2647 164.744 75.2111 165.355 75.0875C165.967 74.9639 166.621 74.8308 167.317 74.6882C168.013 74.5455 168.683 74.4995 169.325 74.5501C169.965 74.5834 170.518 74.7773 170.986 75.1319C171.47 75.4793 171.79 76.0885 171.945 76.9595C172.038 77.4822 172.013 78.0385 171.872 78.6285C171.73 79.2186 171.474 79.8038 171.102 80.3843C170.727 80.9474 170.225 81.4918 169.597 82.0178C168.985 82.5364 168.256 82.9856 167.408 83.3654Z"
                fill="black"
              />
            </svg>
          </div>

          <div className="flex flex-col  w-[90%] mx-auto md:w-3/5 items-start justify-center gap-1 md:ml-19">
            <h2 className="text-[#000] text-center md:text-left font-inter w-full text-[16px] md:text-[18px]  font-medium leading-normal ">
              CREATE, LINK, EARN!
            </h2>
            <h2 className="text-[#000] w-full text-center md:text-left font-inter text-[26px] md:text-[28px]  font-bold leading-[35px] md:leading-[40px] lg:leading-[50px]">
              {/* It's your chance to turn your passion into profits. Are you ready? Because we are! */}
              Unlock your influence and lock your earnings!
            </h2>
          </div>
        </div>

        <div className="flex flex-col  md:flex-row items-center justify-center w-full md:max-w-[1000px]  md:gap-30 lg:gap-38">
          <div className=" relative  flex w-full md:w-1/3  items-center justify-start md:mr-20">
            {/* Dynamic content based on current slide */}
            <div className="rounded-[30px] bg-[#ff7860] px-4 py-1 absolute top-[38%] md:top-[35%] left-[-25px] md:left-[-30px] z-30 rotate-[-1.866deg] flip-animation scale-65 lg:scale-80 xl:scale-100">
              <p className="text-[#fff] text-[20px] font-bold ">
                {currentIndex === 0
                  ? "DM Plz"
                  : currentIndex === 1
                    ? "Auto DM"
                    : currentIndex === 2
                      ? "Dashboard"
                      : currentIndex === 3
                        ? "Earnings"
                        : currentIndex === 4
                          ? "Explore"
                          : "Easy Link"}
              </p>
            </div>
            <div className="rounded-[30px] bg-[#AB7EE4] px-4 py-1 absolute top-[46%] md:top-[48%] left-[-45px] md:left-[-30px] z-30 rotate-[-2.775deg] shake-animation scale-65 lg:scale-80 xl:scale-100">
              <p className="text-[#fff] text-[20px] font-bold flex items-center justify-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="25"
                  height="26"
                  viewBox="0 0 25 26"
                  fill="none"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M15.8854 4.58776C16.1528 4.28634 16.4775 4.0412 16.8406 3.86662C17.2037 3.69204 17.598 3.59153 18.0004 3.57095C18.4027 3.55037 18.8052 3.61014 19.1842 3.74676C19.5633 3.88338 19.9113 4.09412 20.208 4.36668C20.5048 4.63925 20.7442 4.96817 20.9125 5.33428C21.0807 5.70038 21.1743 6.09632 21.1879 6.499C21.2015 6.90168 21.1348 7.30303 20.9916 7.67964C20.8484 8.05625 20.6316 8.40057 20.354 8.69251L15.9996 13.4328C15.4552 14.0253 14.6978 14.3773 13.8939 14.4114C13.09 14.4455 12.3055 14.159 11.7129 13.6147C11.4153 13.3508 11.0259 13.2142 10.6286 13.2346C10.2313 13.2549 9.85793 13.4304 9.58882 13.7234C9.31971 14.0163 9.17643 14.4033 9.18984 14.8009C9.20325 15.1985 9.37228 15.5749 9.66053 15.849C10.8458 16.9374 12.4148 17.5106 14.0225 17.4423C15.6302 17.3741 17.1451 16.6701 18.2338 15.4852L22.5882 10.7449C23.6442 9.55449 24.1903 7.99699 24.109 6.40783C24.0277 4.81868 23.3256 3.32502 22.1537 2.24856C20.9818 1.17211 19.4341 0.598986 17.8437 0.652632C16.2534 0.706279 14.7478 1.3824 13.6511 2.53538L11.4739 4.90555C11.3351 5.05152 11.2267 5.22368 11.1551 5.41199C11.0835 5.60029 11.0501 5.80097 11.0569 6.0023C11.0637 6.20365 11.1105 6.40162 11.1947 6.58467C11.2788 6.76772 11.3985 6.93218 11.5469 7.06846C11.6952 7.20475 11.8693 7.31012 12.0588 7.37843C12.2483 7.44674 12.4495 7.47662 12.6507 7.46633C12.8519 7.45604 13.049 7.40578 13.2306 7.3185C13.4122 7.23121 13.5745 7.10863 13.7082 6.95793L15.8854 4.58776ZM8.62806 12.4883C9.17245 11.8959 9.92986 11.5439 10.7337 11.5098C11.5376 11.4757 12.3221 11.7622 12.9147 12.3064C13.0607 12.4453 13.2328 12.5536 13.4211 12.6252C13.6095 12.6968 13.8101 12.7302 14.0115 12.7234C14.2128 12.7166 14.4108 12.6698 14.5938 12.5857C14.7769 12.5015 14.9413 12.3818 15.0776 12.2335C15.2139 12.0851 15.3193 11.9111 15.3876 11.7216C15.4559 11.532 15.4858 11.3308 15.4755 11.1296C15.4652 10.9284 15.4149 10.7313 15.3277 10.5497C15.2404 10.3682 15.1178 10.2058 14.9671 10.0721C13.7818 8.98372 12.2128 8.41061 10.6051 8.47883C8.99737 8.54705 7.48256 9.25103 6.39378 10.4359L2.03938 15.1763C1.48402 15.7602 1.05051 16.4488 0.764135 17.202C0.477761 17.9552 0.344263 18.7579 0.37143 19.5633C0.398598 20.3687 0.585886 21.1605 0.922367 21.8927C1.25885 22.6249 1.73778 23.2828 2.33123 23.8279C2.92467 24.3731 3.62074 24.7945 4.37882 25.0678C5.13689 25.341 5.9418 25.4606 6.74656 25.4194C7.55133 25.3782 8.33984 25.1772 9.06608 24.8281C9.79233 24.4789 10.4418 23.9886 10.9765 23.3858L13.1537 21.0156C13.2925 20.8696 13.4009 20.6975 13.4725 20.5092C13.5441 20.3209 13.5775 20.1202 13.5707 19.9189C13.5639 19.7175 13.5171 19.5195 13.433 19.3365C13.3488 19.1534 13.2291 18.989 13.0807 18.8527C12.9324 18.7164 12.7584 18.611 12.5688 18.5427C12.3793 18.4744 12.1781 18.4445 11.9769 18.4548C11.7757 18.4651 11.5786 18.5154 11.397 18.6027C11.2155 18.69 11.0531 18.8125 10.9194 18.9632L8.74222 21.3334C8.47485 21.6348 8.15013 21.88 7.78701 22.0545C7.42389 22.2291 7.02963 22.3296 6.62725 22.3502C6.22487 22.3708 5.82242 22.311 5.44338 22.1744C5.06434 22.0378 4.71631 21.827 4.41958 21.5545C4.12286 21.2819 3.88339 20.953 3.71515 20.5869C3.54691 20.2208 3.45327 19.8248 3.43969 19.4222C3.4261 19.0195 3.49285 18.6181 3.63604 18.2415C3.77922 17.8649 3.99598 17.5206 4.27366 17.2287L8.62806 12.4883Z"
                    fill="white"
                  />
                </svg>
                Link Plz
              </p>
            </div>
            <div className="rounded-[30px] bg-[#5ce07d] px-4 py-1 absolute top-[55%] md:top-[62%] left-[-45px] md:left-[-30px] z-30 rotate-[2.988deg] shake-animation scale-65 lg:scale-80 xl:scale-100">
              <p className="text-[#fff] text-[20px] font-bold ">
                {currentIndex <= 2 ? "Price Please" : "Shop Now"}
              </p>
            </div>

            {/* Swipeable card container */}
            <div
              className="flex items-center justify-center relative cursor-grab select-none"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{ userSelect: "none" }}
            >
              <Image
                className="ml-7 md:ml-40 md:scale-140 lg:mt-10 pointer-events-none"
                src={"/static/instaCard.png"}
                alt="creators"
                width={300}
                height={300}
                draggable={false}
              />
            </div>

          </div>

          <div className="w-full mx-auto flex flex-col items-center justify-center md:gap-10 lg:gap-14 h-[300px] md:h-[400px] ">
            <div className="flex flex-col items-start justify-center gap-2 max-w-[350px] md:max-w-full"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}>
              <h3 className="text-[26px] font-inter md:text-[28px] text-[rgba(222,44,109,1)] font-bold">
                {carouselData[currentIndex].heading}
              </h3>
              <p className="text-[18px] md:text-[18px] text-[#000] font-normal leading-[145%] mt-1 md:w-[90%] lg:w-[70%]">
                {parseTextAdvanced(carouselData[currentIndex].description)}
              </p>
            </div>

            <div className="flex w-full justify-center md:justify-start mt-12 space-x-2">
              {carouselData.map((_, index) => (
                <div
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-2 transition-all ${index === currentIndex
                    ? "w-6 bg-black rounded-md"
                    : "w-2 bg-gray-400 rounded-full"
                    }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorCarousel;