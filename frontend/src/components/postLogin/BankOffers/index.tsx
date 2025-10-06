"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useGetTaskQuery } from "@/redux/api/homeApi";
import "./styles.css";
import React, {
  useState,
  useEffect,
  ComponentType,
  Suspense,
  lazy,
} from "react";
import HelpIcon from "@mui/icons-material/Help"; // fallback icon
import { SvgIconProps } from "@mui/material/SvgIcon";
import "@mui/icons-material";
import dynamic from "next/dynamic";
import { CircularProgress } from "@mui/material";

interface MovingArrowsProps {
  color?: string;
  width?: string | number;
  height?: string | number;
  className?: string;
  spacing?: number; // New prop to control arrow spacing
}

export async function loadMuiIcon(iconName: any) {
  try {
    const module = await import(
      /* webpackInclude: /\.js$/ */
      `@mui/icons-material/${iconName}`
    );
    return module.default;
  } catch (err) {
    console.error(`Icon "${iconName}" not found in @mui/icons-material`);
    return null;
  }
}

const DynamicMuiIcon: React.FC<any> = ({ iconName, className, style }) => {
  const [IconComponent, setIconComponent] =
    useState<React.ComponentType | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadIcon = async () => {
      try {
        if (iconName) {
          iconName = iconName.replace("Icon", "");

          let moduleName = `@mui/icons-material/${iconName}`;
          const module = await import(
            /* webpackInclude: /\.js$/ */
            moduleName
          );
          if (isMounted) {
            setIconComponent(() => module.default);
          }
        }
      } catch (err) {
        console.error(`Icon "${iconName}" not found`);
        setIconComponent(() => null);
      }
    };

    loadIcon();

    return () => {
      isMounted = false;
    };
  }, [iconName]);

  if (!IconComponent) return null; // or a fallback like <HelpOutline />

  return <IconComponent />;
};

const MovingArrows: React.FC<MovingArrowsProps> = ({
  color = "#fff",
  width = 50,
  height = 24,
  className = "",
  spacing = 6, // Default spacing between arrows
}) => {
  // Calculate positions based on spacing
  const arrow1X = 10;
  const arrow2X = arrow1X + spacing;
  const arrow3X = arrow2X + spacing;

  // Calculate viewBox width based on spacing
  const viewBoxWidth = arrow3X + 7; // Add some padding at the end

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${viewBoxWidth} 24`} // Increased height to 24
      width={width}
      height={height}
      className={`pb-1.5`}
    >
      <style>{`
          .arrow {
            fill: ${color};
          }
          
          #arrow1 {
            animation: pulse 1.5s infinite;
            animation-delay: 0s;
            transform:scale(1.2)
          }
          
          #arrow2 {
            animation: pulse 1.5s infinite;
            animation-delay: 0.5s;
            transform:scale(1.2)
          }
          
          #arrow3 {
            animation: pulse 1.5s infinite;
            animation-delay: 1s;
            transform:scale(1.2)
          }
          
          @keyframes pulse {
            0% { opacity: 0.7; }
            33% { opacity: 0.9; }
            66% { opacity: 1; }
            100% { opacity: 0.7; }
          }
        `}</style>

      <path
        id="arrow1"
        className="arrow"
        d={`M${arrow1X}.3619 10.2415C${arrow1X}.1016 10.4895 ${arrow1X}.1016 10.8915 ${arrow1X}.3619 11.1394L${
          arrow1X + 3.5286
        } 14.5L${arrow1X}.3619 17.8606C${arrow1X}.1016 18.1085 ${arrow1X}.1016 18.5105 ${arrow1X}.3619 18.7585C${arrow1X}.6223 19.0064 ${
          arrow1X + 1.0444
        } 19.0064 ${arrow1X + 1.3047} 18.7585L${arrow1X + 5.3047} 14.9489C${
          arrow1X + 5.5651
        } 14.701 ${arrow1X + 5.5651} 14.299 ${arrow1X + 5.3047} 14.051L${
          arrow1X + 1.3047
        } 10.2415C${
          arrow1X + 1.0444
        } 9.9936 ${arrow1X}.6223 9.9936 ${arrow1X}.3619 10.2415Z`}
      />

      <path
        id="arrow2"
        className="arrow"
        d={`M${arrow2X}.3619 10.2415C${arrow2X}.1016 10.4895 ${arrow2X}.1016 10.8915 ${arrow2X}.3619 11.1394L${
          arrow2X + 3.5286
        } 14.5L${arrow2X}.3619 17.8606C${arrow2X}.1016 18.1085 ${arrow2X}.1016 18.5105 ${arrow2X}.3619 18.7585C${arrow2X}.6223 19.0064 ${
          arrow2X + 1.0444
        } 19.0064 ${arrow2X + 1.3047} 18.7585L${arrow2X + 5.3047} 14.9489C${
          arrow2X + 5.5651
        } 14.701 ${arrow2X + 5.5651} 14.299 ${arrow2X + 5.3047} 14.051L${
          arrow2X + 1.3047
        } 10.2415C${
          arrow2X + 1.0444
        } 9.9936 ${arrow2X}.6223 9.9936 ${arrow2X}.3619 10.2415Z`}
      />

      <path
        id="arrow3"
        className="arrow"
        d={`M${arrow3X}.3619 10.2415C${arrow3X}.1016 10.4895 ${arrow3X}.1016 10.8915 ${arrow3X}.3619 11.1394L${
          arrow3X + 3.5286
        } 14.5L${arrow3X}.3619 17.8606C${arrow3X}.1016 18.1085 ${arrow3X}.1016 18.5105 ${arrow3X}.3619 18.7585C${arrow3X}.6223 19.0064 ${
          arrow3X + 1.0444
        } 19.0064 ${arrow3X + 1.3047} 18.7585L${arrow3X + 5.3047} 14.9489C${
          arrow3X + 5.5651
        } 14.701 ${arrow3X + 5.5651} 14.299 ${arrow3X + 5.3047} 14.051L${
          arrow3X + 1.3047
        } 10.2415C${
          arrow3X + 1.0444
        } 9.9936 ${arrow3X}.6223 9.9936 ${arrow3X}.3619 10.2415Z`}
      />
    </svg>
  );
};

const index = () => {
  const router = useRouter();
  const { data: cards = [], isLoading } = useGetTaskQuery({
    type: "all",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchBar, setShowSearchBar] = useState(false);

  const filteredCards = cards.filter(
    (card: any) =>
      card.task_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.task_short_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCardClick = (cardName: string) => {
    // Convert card name to URL-friendly slug
    const slug = cardName.toLowerCase().replace(/\s+/g, "-");
    router.push(`/bank-offers/${slug}`);
  };

  return (
    <div className="min-h-screen font-inter">
      <div className="flex flex-col items-center justify-start w-full">
        <div className="w-full flex items-center justify-between gap-[14px] py-[18px] border-b-[1px] border-b-[#f0f2f5] px-[15px]">
          <div className="flex items-center justify-start gap-[14px]">
            <svg
              onClick={() => router.push("/home")}
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
            <p className="m-0 text-[#000] text-[18px] font-semibold leading-normal font-inter ">
              Bank Offers
            </p>
          </div>

          <div
            className="p-[9px] rounded-[5px] bg-[#f8f9fa] cursor-pointer"
            onClick={() => setShowSearchBar(!showSearchBar)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
            >
              <circle
                cx="7.66667"
                cy="7.66667"
                r="6.66667"
                stroke="black"
                strokeWidth="1.5"
              />
              <path
                d="M17 17L13 13"
                stroke="black"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
        {showSearchBar && (
          <div className="w-full px-[15px] py-[10px]">
            <input
              type="text"
              placeholder="Search bank offers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />

            {/* Suggestions */}
            {searchQuery && (
              <div className="bg-white mt-2 rounded shadow max-h-60 overflow-y-auto border border-gray-200">
                {filteredCards.length > 0 ? (
                  filteredCards.map((card: any, index: number) => (
                    <div
                      key={index}
                      onClick={() => {
                        handleCardClick(card.task_url);
                        setSearchQuery("");
                        setShowSearchBar(false);
                      }}
                      className="p-2 cursor-pointer hover:bg-gray-100"
                    >
                      {card.task_title}
                    </div>
                  ))
                ) : (
                  <div className="p-2 text-gray-500">No matching offers</div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col items-center justify-center py-6 px-[15px] gap-[13px] w-full">
          {cards.map((card: any, index: number) => {
            const taskMeta = JSON.parse(card?.task_meta);
            return (
              <div
                key={index}
                onClick={() => handleCardClick(card.task_url)}
                className="flex items-center justify-center w-full relative rounded-[9px] cursor-pointer"
              >
                {/* Card Container */}
                <div
                  style={{
                    // background: `url(${card?.url})`
                    backgroundImage: "url(/static/CreditCardImg.png)",
                    backgroundSize: "contain",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                  }}
                  className="relative w-full min-h-[250px]"
                >
                  <div className="  flex flex-col justify-start items-start mt-[20%] ml-[35%] w-[63%]">
                    {/* Tags Section - Top */}
                    {taskMeta?.tags && taskMeta.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 justify-start">
                        {taskMeta.tags.map((tag: any, tagIndex: number) => {

                          return (
                            <div
                              key={tagIndex}
                              className="flex items-center gap-1 rounded-[16px] px-[5px] py-0.5 bg-[#e9f6ff] border-[0.3px] border-[#8fbff2]"
                            >
                              <svg
                              className="scale-160"
                                xmlns="http://www.w3.org/2000/svg"
                                width="6"
                                height="6"
                                viewBox="0 0 6 6"
                                fill="none"
                              >
                                <path
                                  d="M2.8382 0.00428696C2.93645 0.00428696 3.0332 0.010662 3.1232 0.025662C3.21184 0.0372767 3.29929 0.0565999 3.38458 0.083412C3.47008 0.109287 3.5537 0.141537 3.63733 0.182037C3.7187 0.220662 3.80233 0.267912 3.88595 0.319287C4.02733 0.409287 4.16645 0.482037 4.3082 0.540162C4.58725 0.651849 4.88234 0.718309 5.18233 0.737037C5.33458 0.747912 5.49095 0.754287 5.6537 0.754287V2.25429C5.6537 2.53929 5.61733 2.80929 5.54458 3.06654C5.47469 3.32012 5.37539 3.56465 5.2487 3.79516C5.12254 4.02535 4.97327 4.24209 4.8032 4.44204C4.63052 4.64653 4.44355 4.83851 4.2437 5.01654C4.04121 5.19509 3.82793 5.36103 3.60508 5.51341C3.38233 5.66791 3.15733 5.81154 2.93233 5.94204L2.84233 5.99566L2.75233 5.94204C2.52103 5.80813 2.2951 5.66514 2.07508 5.51341C1.85097 5.36274 1.63759 5.19672 1.43645 5.01654C1.23672 4.8385 1.04988 4.64652 0.877325 4.44204C0.70771 4.24124 0.557772 4.02462 0.429575 3.79516C0.30505 3.56363 0.205851 3.31934 0.1337 3.06654C0.060489 2.80206 0.0243937 2.5287 0.0264504 2.25429V0.754287C0.189575 0.754287 0.34595 0.747912 0.4982 0.737037C0.648073 0.726627 0.796976 0.705194 0.9437 0.672912C1.08733 0.640662 1.23095 0.597912 1.37233 0.540162C1.51903 0.480955 1.65968 0.407741 1.79233 0.321537C1.95733 0.214287 2.12458 0.135162 2.28958 0.083037C2.46727 0.0285613 2.65235 0.00199514 2.8382 0.00428696ZM5.27645 1.12291C4.99259 1.10914 4.71136 1.06168 4.4387 0.981537C4.16748 0.900633 3.90914 0.781565 3.67145 0.627912C3.54816 0.546986 3.41427 0.483509 3.27358 0.439287C3.13304 0.396813 2.98689 0.375826 2.84008 0.377037C2.69217 0.37608 2.54495 0.397058 2.4032 0.439287C2.2623 0.482071 2.12858 0.545647 2.00645 0.627912C1.76835 0.782403 1.50934 0.901993 1.23733 0.983037C0.97145 1.06029 0.6932 1.10754 0.40145 1.12479V2.25616C0.40145 2.50479 0.4337 2.74254 0.4982 2.97166C0.56391 3.1988 0.654457 3.41799 0.7682 3.62529C0.883306 3.83474 1.01898 4.03221 1.1732 4.21479C1.32958 4.39891 1.49645 4.57029 1.67645 4.73304C1.85645 4.89616 2.04508 5.04616 2.24233 5.18529C2.44145 5.32479 2.64095 5.45116 2.84008 5.56666C3.04397 5.44796 3.24277 5.32072 3.43595 5.18529C3.6345 5.0466 3.82413 4.89555 4.0037 4.73304C4.1837 4.57029 4.35095 4.39891 4.50733 4.21479C4.66157 4.03222 4.79724 3.83475 4.91233 3.62529C5.02557 3.41825 5.11477 3.19896 5.1782 2.97166C5.24466 2.73902 5.27774 2.49811 5.27645 2.25616V1.12291Z"
                                  fill="#216CB5"
                                />
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M4.23655 1.77017L4.07155 1.62842L3.9193 1.64154L2.2843 3.57204L1.72743 2.77704L1.57743 2.75154L1.4038 2.87567L1.37793 3.02567L2.0938 4.04792L2.17518 4.09292L2.34655 4.10342L2.4343 4.06517L4.24743 1.92204L4.23655 1.77017Z"
                                  fill="#216CB5"
                                />
                              </svg>
                              <span className="text-[10px] text-[#216CB5] font-bold uppercase font-inter">
                                {tag}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Features Section - Middle */}
                    {taskMeta?.features && taskMeta.features.length > 0 && (
                      <div className="flex flex-col gap-1 mt-3 ">
                        {taskMeta.features.map(
                          (feature: string, featureIndex: number) => (
                            <div
                              key={featureIndex}
                              className="flex items-center gap-1"
                            >
                              {/* <div className="w-1.5 h-1.5 bg-white rounded-full"></div> */}
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="12"
                                height="12"
                                viewBox="0 0 12 12"
                                fill="none"
                              >
                                <circle cx="5" cy="5" r="5" fill="#4CAF50" />
                                <path
                                  d="M7.2 3.4L4.5 6.1L2.8 4.4"
                                  stroke="white"
                                  strokeWidth="1"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>

                              <span className="text-[#000] text-[11px] font-medium leading-3">
                                {feature}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    )}

                    <div style={{ backgroundColor: taskMeta?.color || 'rgba(222,44,109,1)' }} className="flex items-center justify-start gap-2 rounded-[14px] px-5 mt-3" >
                      {taskMeta?.earn_text && (
                        <div className="flex justify-center mb-0.5">
                          <div className="">
                            <span className="text-[#fff] text-[10px] font-medium uppercase font-inter ">
                              {taskMeta.earn_text}
                            </span>
                          </div>
                        </div>
                      )}
                      <div className="arrow-container ">
                        <div className="arrow"></div>
                        <div className="arrow"></div>
                        <div className="arrow"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default index;
