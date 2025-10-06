"use client";
import Image from 'next/image';
import React, { useEffect, useState } from 'react';

interface ProgressBarLoadingProps {
  isLoading: boolean;
  className?: string;
}

export const ProgressBarLoading: React.FC<ProgressBarLoadingProps> = ({
  isLoading,
  className = ''
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let timeout: NodeJS.Timeout;

    if (isLoading) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev < 90) {
            return prev + 10; // move by 10% every 2 sec
          }
          return prev;
        });
      }, 500);
    } else {
      // Complete instantly to 100% and reset after animation
      setProgress(100);
      timeout = setTimeout(() => {
        setProgress(0);
      }, 500);
    }

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isLoading]);

  if (!isLoading && progress === 0) return null;

  const [loadingText, setLoadingText] = useState('Loading');

  useEffect(() => {
    const texts = ['Loading', 'Loading.', 'Loading..', 'Loading...'];
    let index = 0;

    const interval = setInterval(() => {
      setLoadingText(texts[index]);
      index = (index + 1) % texts.length;
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-[448px] fixed inset-0 mx-auto bg-pink-50 flex justify-center items-center min-h-screen font-sans overflow-hidden z-[100]">
      <div className="relative flex flex-col items-center gap-8">
        <div className="relative w-20 h-20 flex justify-center items-center">
          {/* Floating particles - positioned relative to logo */}
          <div className="absolute animate-float-1 opacity-0 -top-2 left-1/4 w-1 h-1 bg-pink-800 rounded-full"></div>
          <div className="absolute animate-float-2 opacity-0 -top-1 left-2/4 w-1 h-1 bg-pink-800 rounded-full"></div>
          <div className="absolute animate-float-3 opacity-0 -top-2 left-3/4 w-1 h-1 bg-pink-800 rounded-full"></div>
          <div className="absolute animate-float-4 opacity-0 -top-1 right-1/4 w-1 h-1 bg-pink-800 rounded-full"></div>

          {/* Animated rings */}
          <div className="absolute w-16 h-16 border-2 border-transparent border-t-pink-600 border-r-pink-600 rounded-full animate-spin-slow"></div>
          <div className="absolute w-20 h-20 border-2 border-transparent border-b-pink-400 border-l-pink-400 rounded-full animate-spin-reverse"></div>
          <div className="absolute w-24 h-24 border-2 border-transparent border-t-pink-300 border-r-pink-300 rounded-full animate-spin-slower"></div>

          {/* Logo SVG */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="36"
            height="37"
            viewBox="0 0 36 37"
            fill="none"
          >
            <circle cx="18" cy="18.5" r="18" fill="rgba(222,44,109,1)" />
            <path
              d="M27.9934 10.8568C27.9933 10.543 27.9417 10.2314 27.8406 9.93409C27.5133 8.98976 26.4766 8.34848 25.5681 8.53789V17.3426C23.3337 14.9074 20.6873 13.6221 17.4763 13.6276C16.9706 13.6294 16.4657 13.6647 15.9648 13.7331C13.7141 14.0442 11.7634 15.0589 10.0447 16.7095L10.031 16.723L9.84005 16.9097L9.81277 16.9395L9.62179 17.1343L9.60542 17.1505L9.43082 17.3399V8.53247H9.39808V8.50812C9.26827 8.49729 9.13777 8.49729 9.00795 8.50812C8.59451 8.54475 8.20046 8.6987 7.87292 8.95158C7.54538 9.20447 7.29821 9.54556 7.16097 9.93409C7.14226 9.98172 7.12676 10.0305 7.11459 10.0802C7.03816 10.3284 6.99954 10.5865 7 10.846C7 13.283 7 15.7183 7 18.1517V28.1037C7 28.239 7 28.3743 7 28.5015C7.03288 28.8224 7.13524 29.1325 7.3001 29.4106C7.44345 29.6611 7.63539 29.8809 7.86484 30.0573C8.09498 30.2425 8.36315 30.3755 8.65056 30.447C8.85936 30.5047 9.07494 30.5347 9.29168 30.5363C10.383 30.5498 11.4742 30.5363 12.5491 30.5363C11.5157 29.621 10.6804 28.5071 10.0938 27.2622C9.28274 25.4262 9.19328 23.3558 9.84298 21.4578C10.4927 19.5597 11.8345 17.9712 13.6049 17.0044L13.6622 16.9747L13.7359 16.9341C14.7905 16.3801 15.9566 16.0669 17.1489 16.0173C18.3412 15.9677 19.5296 16.1829 20.6273 16.6473C21.6158 17.0616 22.5114 17.6665 23.2624 18.4268C24.0134 19.1871 24.6047 20.0877 25.0021 21.0763C25.3995 22.065 25.5951 23.122 25.5775 24.1862C25.5599 25.2504 25.3295 26.3005 24.8997 27.2757C24.313 28.5207 23.4777 29.6345 22.4443 30.5498C23.5356 30.5498 24.6268 30.5498 25.699 30.5498C26.0057 30.554 26.31 30.4965 26.5936 30.3807C26.8773 30.265 27.1343 30.0935 27.3493 29.8765C27.5642 29.6596 27.7326 29.4016 27.8442 29.1183C27.9559 28.835 28.0085 28.5322 27.9989 28.2282C27.9952 22.4359 27.9934 16.6454 27.9934 10.8568Z"
              fill="white"
            />
            <path
              d="M14.687 24.7383V30.55H12.306C12.281 30.4558 12.265 30.36 12.258 30.2636C12.258 28.4279 12.231 25.4596 12.276 23.6265C12.2847 22.3675 12.7726 21.1463 13.6637 20.1531C14.5548 19.1599 15.7991 18.4504 17.2029 18.1351C19.5239 17.5622 22.5196 18.3668 23.8 19.89L22.1087 21.3482C20.7833 20.153 19.17 19.7 17.2868 20.3613C16.7152 20.5586 16.2034 20.8674 15.791 21.2638C15.3787 21.6602 15.0769 22.1336 14.9089 22.6475H21.1821V24.7305L14.687 24.7383Z"
              fill="white"
            />
            <path
              d="M22.2254 11.65C23.0952 11.65 23.8004 10.9449 23.8004 10.075C23.8004 9.20515 23.0952 8.5 22.2254 8.5C21.3555 8.5 20.6504 9.20515 20.6504 10.075C20.6504 10.9449 21.3555 11.65 22.2254 11.65Z"
              fill="white"
            />
          </svg>
        </div>

        <div className="text-pink-900 text-lg font-light tracking-widest uppercase opacity-80 animate-fade-pulse">
          {loadingText}
        </div>

        <div className="w-48 h-1 bg-pink-900 bg-opacity-20 rounded-sm overflow-hidden backdrop-blur-sm">
          <div className="h-full bg-gradient-to-r from-pink-600 via-pink-400 to-pink-600 bg-200% rounded-sm animate-progress-fill"></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px); 
            opacity: 0; 
          }
          25% { 
            opacity: 1; 
            transform: translateY(-20px); 
          }
          50% { 
            opacity: 0.7; 
            transform: translateY(-40px); 
          }
          75% { 
            opacity: 0.3; 
            transform: translateY(-60px); 
          }
        }
 
        .animate-float-1 {
          animation: float 1.5s ease-in-out infinite;
          animation-delay: 0s;
        }
 
        .animate-float-2 {
          animation: float 1.5s ease-in-out infinite;
          animation-delay: 0.4s;
        }
 
        .animate-float-3 {
          animation: float 1.5s ease-in-out infinite;
          animation-delay: 0.8s;
        }
 
        .animate-float-4 {
          animation: float 1.5s ease-in-out infinite;
          animation-delay: 1.2s;
        }
 
        .animate-spin-slow {
          animation: spin 1.5s linear infinite;
        }
 
        .animate-spin-reverse {
          animation: spin 2s linear infinite reverse;
        }
 
        .animate-spin-slower {
          animation: spin 2.5s linear infinite;
        }
 
        .animate-fade-pulse {
          animation: fade-pulse 2s ease-in-out infinite;
        }
 
        .animate-progress-fill {
          animation: progress-fill 3s ease-in-out infinite, shimmer 1.5s ease-in-out infinite;
        }
 
        .bg-200% {
          background-size: 200% 100%;
        }
 
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
 
        @keyframes fade-pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
 
        @keyframes progress-fill {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
 
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
};
