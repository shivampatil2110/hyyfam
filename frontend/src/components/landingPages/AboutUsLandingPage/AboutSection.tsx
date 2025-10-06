import Image from "next/image";
import React from "react";

const AboutSection = () => {
  return (
    <div style={{
      // background: 'linear-gradient(0deg, rgba(255, 255, 255, 0.40) 68.75%, rgba(255, 214, 228, 0.30) 100%)',
      // background: 'linear-gradient(0deg, #FFF 10%,  #FFEBF2 29.42%, #FFF 90.98%)'
background: '#fff',
// filter: 'blur(32.04999923706055px)'
    }} className="relative w-full overflow-hidden h-auto ">
      {/* <svg
        className="absolute left-0 top-0"
        xmlns="http://www.w3.org/2000/svg"
        width="176"
        height="136"
        viewBox="0 0 176 136"
        fill="none"
      >
        <path
          d="M-17.9996 -45C-17.9996 -45 175 75.6617 165 80.8795C155 86.0973 -2.99962 4.56913 -17.9996 7.17803C-32.9996 9.78693 81.0004 119.361 72.0004 125.231C63.0004 131.101 -96.9996 77.6184 -96.9996 77.6184"
          stroke="#5FCBA5"
          strokeWidth="19.84"
          strokeMiterlimit="10"
        />
      </svg> */}

      <svg
        className="absolute bottom-0 left-0"
        xmlns="http://www.w3.org/2000/svg"
        width="223"
        height="206"
        viewBox="0 0 263 236"
        fill="none"
      >
        <path
          opacity="0.1"
          d="M244.628 43.0913C-60.0041 53.7963 -113.511 220.028 -56.7854 297.338C-0.0600518 374.647 71.8052 361.857 137.463 340.389C208.773 317.081 258.828 240.954 251.985 166.257C251.056 154.621 242.223 132.594 242.223 132.594C242.223 132.594 229.749 104.249 219.126 92.5592C199.684 70.2064 176.073 51.8555 149.613 38.5324C101.903 14.5945 46.9687 8.1622 -6.35388 11.6777C-59.6765 15.1932 -111.777 27.9064 -163.539 40.6835"
          stroke="rgba(222,44,109,1)"
          strokeWidth="19.84"
          strokeMiterlimit="10"
        />
      </svg>
      <div className="px-[18px] w-full md:px-0 md:w-[95%] lg:w-[90%] max-w-[1444px] mx-auto py-[70px] md:py-[80px] flex flex-col items-center justify-center gap-8 md:gap-12 lg:gap-16 relative">
        <Image
          className="absolute hidden md:block rotate-90 right-0 -top-40"
          src={"/static/checks.png"}
          alt="checkss"
          width={250}
          height={300}
        />
                <Image
          className="absolute md:hidden block rotate-90 right-0 -top-40"
          src={"/static/checks.png"}
          alt="checkss"
          width={300}
          height={300}
        />
        <div className="flex flex-col gap-3 md:gap-0 md:flex-row items-center justify-between w-full   mx-auto">
          <h2 className="m-0 text-[#000] hidden md:block  font-inter text-[26px]  md:text-[28px] font-medium leading-[15px] md:leading-[25px] w-full md:w-1/3 lg:mb-25">
            About <br />
            <span className="text-[rgba(222,44,109,1)] text-[40px] font-bold  leading-[53px] ">
              HyyFam
            </span>
          </h2>

                    <h2 className="m-0 text-[#000] text-center block md:hidden font-inter text-[26px] md:text-[28px] font-medium leading-[15px] md:leading-[25px] w-full md:w-1/3">
            About{' '}
            <span className="text-[rgba(222,44,109,1)] font-bold leading-[63px] ">
              HyyFam
            </span>
          </h2>
          <div className="flex flex-col items-start justify-center gap-8 w-full md:w-2/3 md:px-10">
            <p className="m-0 text-[#000] text-[16px] lg:text-[18px] leading-[25px] md:leading-[28px] ">
              At <span className="font-bold">HyyFam</span>, we know that social media is so much more than just
              scrolling content, and influencers are so much more than pretty
              faces on a feed. You are the trendsetters, the ones who turn every
              style into new trend, and we’re here to help you turn that
              influence earnings.
            </p>

            <p className="m-0 text-[#000] text-[16px] lg:text-[18px] leading-[25px] md:leading-[28px] ">
              This platform is designed for influencers like you who are ready
              to elevate their talent. Whether you're showcasing your style,
              linking your favorite products, or sharing your passion, we are
              here to help you earn .
            </p>

            <p className="m-0 text-[#000] text-[16px] lg:text-[18px] leading-[25px] md:leading-[28px] ">
              We don’t just stop at likes and comments; we take your journey
              beyond that. <span className="font-bold">HyyFam</span> is where you can grow your creativity and
              earnings at the same time. Guess what? By reading this, you are
              halfway there, so don’t wait for the right opportunity, Just Join
              us and create an endless opportunities for yourself.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutSection;
