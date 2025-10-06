"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { logout } from "@/redux/features/authSlice";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { useSelector } from "react-redux";
import { CDN_URL } from "@/appConstants/baseURL";
import { showToast } from "@/components/Toast/Toast";
import Profile from "./profile"
import Redeem from "./redeem/index"
import Faqs from "./faqs"
import AboutUs from "./AboutUs";
import HelpSupport from "./HelpAndSupport";
import PrivacyPolicy from "./PrivacyPolicy";
import TermsAndConditions from "./TermsAndConditions";
import { useGetUserProfileQuery } from "@/redux/api/pointsApi";

interface ProfileBoxProps {
  title: string;
  id: number;
  changeTab : (currentTab: string) => void;
  // url: string;
}

interface ProfileData {
  id: number;
  title: string;
  // url: string;
}

// Single profile box component with its own hover state
const ProfileBox: React.FC<ProfileBoxProps> = ({ title, id, changeTab }) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const router = useRouter();

  return (
    <div
      key={id}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => changeTab(title)}
      className="relative flex items-center justify-center gap-4 p-4 border-[0.5px] border-[#c2c2c2] bg-[#fdfdfd] rounded-[12px] w-full cursor-pointer hover:border-[rgba(222,44,109,1)] hover:border-[1px] hover:scale-101"
    >
      {isHovered && (
        <div className="absolute left-0  w-[5px] h-[40px] bg-[rgba(222,44,109,1)] rounded-r-[4px] z-50"></div>
      )}

      <div className="flex items-center justify-center bg-[#f9f8f4] rounded-[21px] p-1">
        {title === "My Profile" && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 22 22"
            fill="none"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M11.2866 18.9973H19.6049C19.6564 18.9973 19.706 18.9759 19.742 18.9399C19.779 18.903 19.7994 18.8543 19.7994 18.8027V17.3911C19.7994 16.5836 19.2225 15.8714 18.3333 15.2663C16.7455 14.1825 14.1761 13.4995 11.2866 13.4995C10.8838 13.4995 10.5569 13.1726 10.5569 12.7698C10.5569 12.368 10.8838 12.0401 11.2866 12.0401C14.5185 12.0401 17.3798 12.8486 19.1564 14.0599C20.5116 14.9841 21.2588 16.1584 21.2588 17.3911V18.8027C21.2588 19.2406 21.0846 19.6618 20.7743 19.9722C20.4639 20.2816 20.0436 20.4567 19.6049 20.4567H11.2866C10.8838 20.4557 10.5569 20.1288 10.5569 19.726C10.5569 19.3242 10.8838 18.9964 11.2866 18.9973Z"
              fill="black"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M11.2868 0.499969C14.2405 0.499969 16.6377 2.89719 16.6377 5.85091C16.6377 8.80463 14.2405 11.2019 11.2868 11.2019C8.33303 11.2019 5.93581 8.80463 5.93581 5.85091C5.93581 2.89719 8.33303 0.499969 11.2868 0.499969ZM11.2868 1.95932C9.13859 1.95932 7.39516 3.70275 7.39516 5.85091C7.39516 7.99907 9.13859 9.74251 11.2868 9.74251C13.4349 9.74251 15.1783 7.99907 15.1783 5.85091C15.1783 3.70275 13.4349 1.95932 11.2868 1.95932Z"
              fill="black"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M5.44957 12.8437C7.36229 12.8437 8.91504 14.3965 8.91504 16.3092C8.91504 18.2219 7.36229 19.7756 5.44957 19.7756C3.53686 19.7756 1.98314 18.2219 1.98314 16.3092C1.98314 14.3965 3.53686 12.8437 5.44957 12.8437ZM5.44957 14.3031C4.34242 14.3031 3.44248 15.202 3.44248 16.3092C3.44248 17.4163 4.34242 18.3163 5.44957 18.3163C6.55673 18.3163 7.45666 17.4163 7.45666 16.3092C7.45666 15.202 6.55673 14.3031 5.44957 14.3031Z"
              fill="black"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M4.71936 13.5725V11.9312C4.71936 11.5284 5.04626 11.2015 5.44904 11.2015C5.85182 11.2015 6.17871 11.5284 6.17871 11.9312V13.5735C6.17871 13.9753 5.85182 14.3031 5.44904 14.3031C5.04626 14.3022 4.71936 13.9753 4.71936 13.5725Z"
              fill="black"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M2.99786 14.8907L1.83719 13.729C1.55213 13.445 1.55213 12.9819 1.83719 12.6978C2.12127 12.4127 2.58437 12.4127 2.86846 12.6978L4.0301 13.8584C4.31419 14.1435 4.31419 14.6056 4.0301 14.8907C3.74504 15.1748 3.28291 15.1748 2.99786 14.8907Z"
              fill="black"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M2.71368 17.0388H1.07143C0.668647 17.0388 0.341753 16.7119 0.341753 16.3091C0.341753 15.9063 0.668647 15.5794 1.07143 15.5794H2.71368C3.11549 15.5794 3.44238 15.9063 3.44238 16.3091C3.44335 16.7119 3.11549 17.0388 2.71368 17.0388Z"
              fill="black"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M4.0301 18.7598L2.86846 19.9204C2.58437 20.2055 2.12127 20.2055 1.83719 19.9204C1.55213 19.6364 1.55213 19.1733 1.83719 18.8892L2.99786 17.7275C3.28291 17.4434 3.74504 17.4434 4.0301 17.7275C4.31419 18.0126 4.31419 18.4747 4.0301 18.7598Z"
              fill="black"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M6.17871 19.0448V20.6871C6.17871 21.0899 5.85182 21.4168 5.44904 21.4168C5.04626 21.4168 4.71936 21.0899 4.71936 20.6871V19.0448C4.71936 18.643 5.04626 18.3161 5.44904 18.3152C5.85182 18.3152 6.17871 18.643 6.17871 19.0448Z"
              fill="black"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M7.89995 17.7275L9.06062 18.8892C9.34568 19.1733 9.34568 19.6364 9.06062 19.9204C8.77653 20.2055 8.31343 20.2055 8.02935 19.9204L6.86771 18.7598C6.58362 18.4747 6.58362 18.0126 6.86771 17.7275C7.15277 17.4434 7.61489 17.4434 7.89995 17.7275Z"
              fill="black"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M8.18666 15.5794H9.82794C10.2307 15.5794 10.5576 15.9063 10.5576 16.3091C10.5576 16.7119 10.2307 17.0388 9.82794 17.0388H8.18666C7.78388 17.0388 7.45602 16.7119 7.45699 16.3091C7.45699 15.9063 7.78388 15.5794 8.18666 15.5794Z"
              fill="black"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M6.86771 13.8584L8.02935 12.6978C8.31343 12.4127 8.77653 12.4127 9.06062 12.6978C9.34568 12.9819 9.34568 13.445 9.06062 13.729L7.89995 14.8907C7.61489 15.1748 7.15277 15.1748 6.86771 14.8907C6.58362 14.6056 6.58362 14.1435 6.86771 13.8584Z"
              fill="black"
            />
          </svg>
        )}

        {title === "Payout" && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="16"
            viewBox="0 0 20 16"
            fill="none"
          >
            <path
              d="M13.338 9.99999C13.1817 9.99999 13.0318 10.0632 12.9213 10.1757C12.8108 10.2882 12.7487 10.4409 12.7487 10.6C12.7487 10.7591 12.8108 10.9117 12.9213 11.0243C13.0318 11.1368 13.1817 11.2 13.338 11.2H16.088C16.2442 11.2 16.3941 11.1368 16.5046 11.0243C16.6152 10.9117 16.6772 10.7591 16.6772 10.6C16.6772 10.4409 16.6152 10.2882 16.5046 10.1757C16.3941 10.0632 16.2442 9.99999 16.088 9.99999H13.338ZM0.573242 3.79999C0.573242 3.00434 0.883669 2.24128 1.43623 1.67867C1.98879 1.11606 2.73823 0.799988 3.51967 0.799988H16.4808C17.2623 0.799988 18.0117 1.11606 18.5643 1.67867C19.1168 2.24128 19.4272 3.00434 19.4272 3.79999V12.2C19.4272 12.9956 19.1168 13.7587 18.5643 14.3213C18.0117 14.8839 17.2623 15.2 16.4808 15.2H3.52046C2.73902 15.2 1.98958 14.8839 1.43702 14.3213C0.884454 13.7587 0.574028 12.9956 0.574028 12.2L0.573242 3.79999ZM3.51967 1.99999C3.05081 1.99999 2.60114 2.18963 2.26961 2.5272C1.93807 2.86476 1.75181 3.3226 1.75181 3.79999V4.39999H18.2487V3.79999C18.2487 3.3226 18.0624 2.86476 17.7309 2.5272C17.3993 2.18963 16.9497 1.99999 16.4808 1.99999H3.51967ZM1.75181 12.2C1.75181 12.6774 1.93807 13.1352 2.26961 13.4728C2.60114 13.8103 3.05081 14 3.51967 14H16.4808C16.9497 14 17.3993 13.8103 17.7309 13.4728C18.0624 13.1352 18.2487 12.6774 18.2487 12.2V5.59999H1.7526L1.75181 12.2Z"
              fill="black"
            />
          </svg>
        )}

        {title === "FAQS" && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
          >
            <g clipPath="url(#clip0_136_1158)">
              <path
                d="M15.75 1.125C16.0484 1.125 16.3345 1.24353 16.5455 1.4545C16.7565 1.66548 16.875 1.95163 16.875 2.25V15.75C16.875 16.0484 16.7565 16.3345 16.5455 16.5455C16.3345 16.7565 16.0484 16.875 15.75 16.875H2.25C1.95163 16.875 1.66548 16.7565 1.4545 16.5455C1.24353 16.3345 1.125 16.0484 1.125 15.75V2.25C1.125 1.95163 1.24353 1.66548 1.4545 1.4545C1.66548 1.24353 1.95163 1.125 2.25 1.125H15.75ZM2.25 0C1.65326 0 1.08097 0.237053 0.65901 0.65901C0.237053 1.08097 0 1.65326 0 2.25L0 15.75C0 16.3467 0.237053 16.919 0.65901 17.341C1.08097 17.7629 1.65326 18 2.25 18H15.75C16.3467 18 16.919 17.7629 17.341 17.341C17.7629 16.919 18 16.3467 18 15.75V2.25C18 1.65326 17.7629 1.08097 17.341 0.65901C16.919 0.237053 16.3467 0 15.75 0L2.25 0Z"
                fill="black"
              />
              <path
                d="M5.91235 6.50925C5.91081 6.54558 5.91672 6.58184 5.92971 6.61581C5.9427 6.64977 5.9625 6.68072 5.9879 6.70674C6.01329 6.73277 6.04374 6.75333 6.07738 6.76715C6.11101 6.78097 6.14712 6.78777 6.18347 6.78713H7.1116C7.26685 6.78713 7.3906 6.66 7.41085 6.50588C7.5121 5.76787 8.01835 5.23013 8.9206 5.23013C9.69235 5.23013 10.3988 5.616 10.3988 6.54412C10.3988 7.2585 9.9781 7.587 9.31322 8.0865C8.5561 8.63663 7.95647 9.279 7.99922 10.3219L8.0026 10.566C8.00378 10.6398 8.03393 10.7102 8.08655 10.762C8.13917 10.8137 8.21003 10.8428 8.28385 10.8427H9.19622C9.27082 10.8427 9.34235 10.8131 9.3951 10.7604C9.44784 10.7076 9.47747 10.6361 9.47747 10.5615V10.4434C9.47747 9.63562 9.7846 9.4005 10.6137 8.77163C11.2988 8.25075 12.0132 7.6725 12.0132 6.45863C12.0132 4.75875 10.5777 3.9375 9.0061 3.9375C7.58072 3.9375 6.01922 4.60125 5.91235 6.50925ZM7.66397 12.9926C7.66397 13.5922 8.1421 14.0355 8.80022 14.0355C9.48535 14.0355 9.95672 13.5922 9.95672 12.9926C9.95672 12.3716 9.48422 11.9351 8.7991 11.9351C8.1421 11.9351 7.66397 12.3716 7.66397 12.9926Z"
                fill="black"
              />
            </g>
            <defs>
              <clipPath id="clip0_136_1158">
                <rect width="18" height="18" fill="white" />
              </clipPath>
            </defs>
          </svg>
        )}

        {title === "Feedback" && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="18"
            viewBox="0 0 20 18"
            fill="none"
          >
            <path
              d="M10 10.3452L11.8556 11.4918C12.0163 11.5941 12.177 11.5859 12.3378 11.467C12.4985 11.3481 12.5581 11.1879 12.5167 10.9862L12.0256 8.8567L13.6589 7.43137C13.8144 7.29068 13.8626 7.12817 13.8033 6.94384C13.7441 6.75951 13.613 6.65795 13.41 6.63914L11.2589 6.44165L10.4144 4.43174C10.3359 4.24967 10.1978 4.15863 10 4.15863C9.80222 4.15863 9.66407 4.24967 9.58556 4.43174L8.74111 6.44052L6.59 6.63914C6.38778 6.65795 6.25667 6.75951 6.19667 6.94384C6.13667 7.12817 6.18481 7.29068 6.34111 7.43137L7.97444 8.8567L7.48333 10.9862C7.44185 11.1871 7.50148 11.3474 7.66222 11.467C7.82296 11.5866 7.98407 11.5949 8.14556 11.4918L10 10.3452ZM3.41889 15.7994L1.52556 17.7224C1.24481 18.0076 0.92037 18.073 0.552222 17.9188C0.184074 17.7646 0 17.4843 0 17.078V1.82257C0 1.30345 0.171482 0.870096 0.514445 0.522509C0.857408 0.174922 1.28407 0.000752353 1.79444 0H18.2056C18.7167 0 19.1433 0.17417 19.4856 0.522509C19.8278 0.870849 19.9993 1.3042 20 1.82257V13.9768C20 14.496 19.8289 14.9297 19.4867 15.278C19.1444 15.6264 18.7174 15.8002 18.2056 15.7994H3.41889ZM2.94444 14.6709H18.2056C18.3759 14.6709 18.5326 14.5987 18.6756 14.4542C18.8185 14.3098 18.8896 14.1506 18.8889 13.9768V1.82257C18.8889 1.64953 18.8178 1.49041 18.6756 1.34521C18.5333 1.2 18.3767 1.12778 18.2056 1.12853H1.79444C1.62407 1.12853 1.46741 1.20076 1.32444 1.34521C1.18148 1.48966 1.11037 1.64878 1.11111 1.82257V16.5273L2.94444 14.6709Z"
              fill="black"
            />
          </svg>
        )}

        {title === "About Us" && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
          >
            <path
              d="M19.0417 2.53078C19.0416 2.26044 18.9971 1.99191 18.9101 1.73572C18.628 0.922013 17.7347 0.369438 16.9518 0.532646V8.11951C15.0265 6.02112 12.7462 4.91364 9.97931 4.9183C9.54363 4.91991 9.10855 4.95029 8.67695 5.00923C6.73752 5.27735 5.05669 6.15169 3.57567 7.57393L3.56392 7.58559L3.39936 7.74646L3.37585 7.77212L3.21129 7.93999L3.19719 7.95398L3.04673 8.11719V0.527982H3.01852V0.506999C2.90666 0.497667 2.79422 0.497667 2.68236 0.506999C2.32611 0.538557 1.98656 0.671219 1.70432 0.889121C1.42209 1.10702 1.20911 1.40094 1.09085 1.73572C1.07473 1.77677 1.06138 1.81883 1.05089 1.86163C0.985033 2.07547 0.951754 2.29787 0.952152 2.52146C0.952152 4.62141 0.952152 6.71981 0.952152 8.81665V17.3921C0.952152 17.5087 0.952152 17.6253 0.952152 17.7348C0.980476 18.0114 1.06868 18.2786 1.21074 18.5182C1.33426 18.734 1.49965 18.9234 1.69736 19.0755C1.89567 19.235 2.12674 19.3496 2.3744 19.4112C2.55431 19.4609 2.74008 19.4868 2.92684 19.4882C3.86717 19.4998 4.8075 19.4882 5.73372 19.4882C4.84324 18.6995 4.12345 17.7397 3.61798 16.667C2.91914 15.085 2.84205 13.3009 3.40188 11.6654C3.96171 10.0299 5.11797 8.66114 6.64349 7.82807L6.69286 7.80243L6.75633 7.76745C7.66506 7.29014 8.66983 7.02024 9.69722 6.97748C10.7246 6.93472 11.7487 7.12018 12.6945 7.52031C13.5462 7.87738 14.318 8.39858 14.9651 9.05371C15.6122 9.70883 16.1217 10.4848 16.4642 11.3367C16.8066 12.1886 16.9751 13.0995 16.96 14.0165C16.9448 14.9334 16.7463 15.8383 16.3759 16.6786C15.8704 17.7514 15.1506 18.7111 14.2602 19.4998C15.2005 19.4998 16.1408 19.4998 17.0647 19.4998C17.3289 19.5034 17.5912 19.4539 17.8356 19.3542C18.08 19.2544 18.3015 19.1066 18.4867 18.9197C18.6719 18.7327 18.817 18.5105 18.9132 18.2664C19.0094 18.0222 19.0547 17.7613 19.0464 17.4993C19.0433 12.5083 19.0417 7.51875 19.0417 2.53078Z"
              fill="rgba(222,44,109,1)"
            />
            <path
              d="M7.57547 14.4922V19.5H5.52385C5.50231 19.4189 5.48848 19.3363 5.4825 19.2532C5.4825 17.6715 5.45925 15.1137 5.49801 13.5342C5.5055 12.4493 5.9259 11.3971 6.69374 10.5412C7.46158 9.68542 8.53377 9.07406 9.74337 8.80237C11.7433 8.30877 14.3246 9.00206 15.428 10.3146L13.9706 11.571C12.8286 10.5412 11.4384 10.1508 9.81572 10.7207C9.32311 10.8907 8.88212 11.1567 8.52682 11.4983C8.17153 11.8399 7.91145 12.2478 7.76668 12.6906H13.1722V14.4855L7.57547 14.4922Z"
              fill="rgba(222,44,109,1)"
            />
            <path
              d="M14.072 3.21429C14.8215 3.21429 15.4291 2.60668 15.4291 1.85715C15.4291 1.10762 14.8215 0.5 14.072 0.5C13.3225 0.5 12.7148 1.10762 12.7148 1.85715C12.7148 2.60668 13.3225 3.21429 14.072 3.21429Z"
              fill="rgba(222,44,109,1)"
            />
          </svg>
        )}

        {title === "Help & Support" && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 22 22"
            fill="none"
          >
            <path
              d="M5.2853 11.0004V7.24328C5.29645 6.50475 5.45323 5.77569 5.74664 5.09785C6.04004 4.42002 6.46432 3.80675 6.99515 3.29317C7.52598 2.77959 8.15294 2.3758 8.84009 2.10494C9.52724 1.83408 10.2611 1.70147 10.9996 1.71471C11.7381 1.70147 12.4719 1.83408 13.1591 2.10494C13.8462 2.3758 14.4732 2.77959 15.004 3.29317C15.5348 3.80675 15.9591 4.42002 16.2525 5.09785C16.5459 5.77569 16.7027 6.50475 16.7139 7.24328V11.0004M13.8567 18.5004C14.6145 18.5004 15.3412 18.1994 15.877 17.6636C16.4128 17.1278 16.7139 16.401 16.7139 15.6433V12.429M13.8567 18.5004C13.8567 18.974 13.6686 19.4282 13.3337 19.7631C12.9988 20.098 12.5446 20.2861 12.071 20.2861H9.92815C9.45455 20.2861 9.00035 20.098 8.66546 19.7631C8.33058 19.4282 8.14244 18.974 8.14244 18.5004C8.14244 18.0268 8.33058 17.5726 8.66546 17.2377C9.00035 16.9028 9.45455 16.7147 9.92815 16.7147H12.071C12.5446 16.7147 12.9988 16.9028 13.3337 17.2377C13.6686 17.5726 13.8567 18.0268 13.8567 18.5004ZM3.14244 8.85757H4.57101C4.76045 8.85757 4.94213 8.93282 5.07609 9.06677C5.21004 9.20073 5.2853 9.38241 5.2853 9.57185V13.8576C5.2853 14.047 5.21004 14.2287 5.07609 14.3626C4.94213 14.4966 4.76045 14.5719 4.57101 14.5719H3.14244C2.76356 14.5719 2.4002 14.4213 2.13229 14.1534C1.86438 13.8855 1.71387 13.5222 1.71387 13.1433V10.2861C1.71387 9.90726 1.86438 9.54389 2.13229 9.27598C2.4002 9.00808 2.76356 8.85757 3.14244 8.85757ZM18.8567 14.5719H17.4282C17.2387 14.5719 17.057 14.4966 16.9231 14.3626C16.7891 14.2287 16.7139 14.047 16.7139 13.8576V9.57185C16.7139 9.38241 16.7891 9.20073 16.9231 9.06677C17.057 8.93282 17.2387 8.85757 17.4282 8.85757H18.8567C19.2356 8.85757 19.599 9.00808 19.8669 9.27598C20.1348 9.54389 20.2853 9.90726 20.2853 10.2861V13.1433C20.2853 13.5222 20.1348 13.8855 19.8669 14.1534C19.599 14.4213 19.2356 14.5719 18.8567 14.5719Z"
              stroke="black"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>

      <p className="text-[#000] text-[16px] font-semibold font-inter leading-[10px] w-full">
        {title}
      </p>

      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="6"
        height="10"
        viewBox="0 0 6 10"
        fill="none"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0.21967 0.209209C-0.0732231 0.488155 -0.0732231 0.940416 0.21967 1.21936L4.18934 5L0.21967 8.78064C-0.0732231 9.05958 -0.0732231 9.51184 0.21967 9.79079C0.512563 10.0697 0.987437 10.0697 1.28033 9.79079L5.78033 5.50508C6.07322 5.22613 6.07322 4.77387 5.78033 4.49492L1.28033 0.209209C0.987437 -0.0697365 0.512563 -0.0697365 0.21967 0.209209Z"
          fill={isHovered ? "rgba(222,44,109,1)" : "#232323"}
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0.21967 0.209209C-0.0732231 0.488155 -0.0732231 0.940416 0.21967 1.21936L4.18934 5L0.21967 8.78064C-0.0732231 9.05958 -0.0732231 9.51184 0.21967 9.79079C0.512563 10.0697 0.987437 10.0697 1.28033 9.79079L5.78033 5.50508C6.07322 5.22613 6.07322 4.77387 5.78033 4.49492L1.28033 0.209209C0.987437 -0.0697365 0.512563 -0.0697365 0.21967 0.209209Z"
          fill={isHovered ? "rgba(222,44,109,1)" : "#232323"}
          fillOpacity="0.2"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0.21967 0.209209C-0.0732231 0.488155 -0.0732231 0.940416 0.21967 1.21936L4.18934 5L0.21967 8.78064C-0.0732231 9.05958 -0.0732231 9.51184 0.21967 9.79079C0.512563 10.0697 0.987437 10.0697 1.28033 9.79079L5.78033 5.50508C6.07322 5.22613 6.07322 4.77387 5.78033 4.49492L1.28033 0.209209C0.987437 -0.0697365 0.512563 -0.0697365 0.21967 0.209209Z"
          fill={isHovered ? "rgba(222,44,109,1)" : "#232323"}
          fillOpacity="0.2"
        />
      </svg>
    </div>
  );
};

const index = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<string>("Settings");
  const { loading, isAuthenticated } = useAppSelector((state) => state.auth);

    // Use the API query data instead of Redux selector
  const { data: userProfileData } = useGetUserProfileQuery();
  const userData = userProfileData ? userProfileData[0] : {}
  const fallbackUserProfile = useSelector((state: any) => state.auth.user);
  
  // Use API data if available, otherwise fall back to Redux store
  const userProfile = userData || fallbackUserProfile;
  // console.log(userData, "checking what is coming in this 1");

  // console.log(fallbackUserProfile, "checking what is coming in this 2");
  // const handleLogout = async () => {
  //   try {
  //     const response = await dispatch(logout()).then(() => {
  //       showToast({
  //         message: "Logged out successfully.",
  //         type: "success"
  //       })
  //     })
  //     router.push("/login");
  //   } catch (error) {
  //     showToast({
  //       message: "Error logging out.",
  //       type: "error"
  //     })
  //   }
  // };

  const handleLogout = async () => {
  try {
    await dispatch(logout());
    
    showToast({
      message: "Logged out successfully.",
      type: "success"
    });
    
    router.push("/login");
  } catch (error) {
    console.error('Logout error:', error);
    showToast({
      message: "Error logging out.",
      type: "error"
    });
    // Don't navigate to login if logout failed
  }
};

  // const userProfile = useSelector((state: any) => state.auth.user)

  const changeTab = (currentTab: string) => {
    setActiveTab(currentTab);
  }

  const profiles: ProfileData[] = [
    { id: 1, title: "My Profile" },
    { id: 2, title: "Payout"},
    { id: 3, title: "FAQS"},
    { id: 5, title: "About Us" },
    { id: 6, title: "Help & Support" },
  ];

  return (
    <div className="min-h-screen [&::-webkit-scrollbar]:hidden font-inter">
      {activeTab === "Settings" && (
        <div className="pb-20  flex flex-col items-center justify-start w-full">
          <div className="w-full flex items-center justify-start gap-[14px] py-[18px] border-b-[1px] border-b-[#f0f2f5] px-[15px]">
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
              Settings
            </p>
          </div>

          <div className="px-[15px] py-5 flex flex-col items-center justify-center gap-5 w-full">
            <div
              style={{
                background:
                  "linear-gradient(95deg, #FFBAD1 -24.52%, #FFFAFA 62.5%)",
              }}
              className="w-full relative rounded-[14px]"
            >
              <Image
                className="absolute right-0"
                src={"/images/settingShade.png"}
                alt="shade"
                height={50}
                width={90}
              />

              <div className="flex items-center justify-start gap-4 p-[14px] rounded-[14px] ">
                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg">
                  <img
                    src={
                      userProfile?.profile_image == null
                        ? "/images/profileImage.webp"
                        : `${CDN_URL + "/images" + userProfile?.profile_image}`
                    }
                    alt="Profile"
                    className="w-full h-full object-cover"
                    key={userProfile?.profile_image}
                  />
                </div>
                <div className="flex flex-col items-start justify-center">
                  <h3 className="text-[#000] text-[16px] font-medium font-inter leading-normal m-0 ">
                    {userProfile?.name}
                  </h3>
                  <p className="text-[#000] text-[14px] font-medium font-inter leading-normal m-0 ">
                    {userProfile?.mobile}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center gap-3 w-full">
              {profiles.map((profile) => (
                <ProfileBox
                  key={profile.id}
                  id={profile.id}
                  title={profile.title}
                  changeTab={changeTab}
                  // url={profile.url}
                />
              ))}
            </div>

            <div className="mt-[20px] flex flex-col items-center justify-center w-full gap-1">
              <p className=" w-full text-center text-[#000] text-[12px] font-medium leading-8 ">
                <span
                  className="cursor-pointer"
                  onClick={() => changeTab("Privacy Policy")}
                >
                  Privacy Policy
                </span>{" "}
                <span className="mx-2">•</span>{" "}
                <span
                  className="cursor-pointer"
                  onClick={() => changeTab("Terms of Service")}
                >
                  Terms Of Service
                </span>
              </p>

              <button
                onClick={handleLogout}
                className="py-1 flex items-center justify-center w-full border-[0.5px] border-[rgba(222,44,109,1)] bg-[#fdfdfd] rounded-[5px] text-[16px] text-[rgba(222,44,109,1)] font-medium font-inter cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "My Profile" && <Profile changeTab={changeTab} />}

      {activeTab === "Payout" && <Redeem changeTab={changeTab} />}

      {activeTab === "FAQS" && <Faqs changeTab={changeTab} />}

      {activeTab === "About Us" && <AboutUs changeTab={changeTab} />}

      {activeTab === "Help & Support" && <HelpSupport changeTab={changeTab} />}

      {activeTab === "Privacy Policy" && (
        <PrivacyPolicy changeTab={changeTab} />
      )}

      {activeTab === "Terms of Service" && (
        <TermsAndConditions changeTab={changeTab} />
      )}
    </div>
  );
};

export default index;
