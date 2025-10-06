"use client";
import React from "react";
import { useRouter } from "next/navigation";

const TermsAndConditions = ({changeTab}: any) => {
  const router = useRouter();
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="31"
            viewBox="0 0 28 31"
            fill="none"
          >
            <path
              d="M27.896 3.98166C27.8958 3.56475 27.8273 3.15066 27.693 2.75559C27.258 1.50076 25.8804 0.648635 24.6732 0.90032V12.6001C21.7042 9.36412 18.1877 7.65626 13.9208 7.66346C13.249 7.66595 12.578 7.71278 11.9125 7.80367C8.92166 8.21716 6.32963 9.56547 4.04574 11.7587L4.02762 11.7767L3.77385 12.0248L3.7376 12.0643L3.48384 12.3232L3.46208 12.3448L3.23007 12.5965V0.893127H3.18657V0.860769C3.01407 0.846378 2.84066 0.846378 2.66816 0.860769C2.11879 0.909435 1.59517 1.11401 1.15993 1.45004C0.724693 1.78607 0.396255 2.23932 0.213892 2.75559C0.189031 2.81888 0.168443 2.88375 0.152264 2.94975C0.0507109 3.27952 -0.000607604 3.62248 5.4278e-06 3.96728C5.4278e-06 7.20563 5.4278e-06 10.4416 5.4278e-06 13.6751V26.8994C5.4278e-06 27.0791 5.4278e-06 27.2589 5.4278e-06 27.4279C0.0436847 27.8544 0.179709 28.2665 0.398778 28.636C0.589262 28.9688 0.844308 29.2608 1.1492 29.4953C1.455 29.7413 1.81134 29.918 2.19326 30.0131C2.47071 30.0897 2.75717 30.1296 3.04518 30.1317C4.49527 30.1497 5.94536 30.1317 7.37369 30.1317C6.00047 28.9155 4.89049 27.4354 4.111 25.7812C3.0333 23.3415 2.91443 20.5903 3.77774 18.0682C4.64106 15.5461 6.42414 13.4353 8.77665 12.1506L8.85278 12.1111L8.95066 12.0572C10.352 11.3211 11.9015 10.9049 13.4858 10.8389C15.0702 10.773 16.6493 11.059 18.1079 11.676C19.4214 12.2267 20.6116 13.0304 21.6095 14.0407C22.6073 15.051 23.3931 16.2476 23.9212 17.5614C24.4493 18.8751 24.7092 20.2797 24.6858 21.6938C24.6624 23.1079 24.3562 24.5033 23.785 25.7991C23.0055 27.4534 21.8956 28.9335 20.5223 30.1497C21.9724 30.1497 23.4225 30.1497 24.8472 30.1497C25.2547 30.1552 25.6591 30.0788 26.036 29.9251C26.4129 29.7713 26.7545 29.5434 27.0401 29.2551C27.3257 28.9667 27.5494 28.624 27.6978 28.2476C27.8461 27.8711 27.9161 27.4687 27.9033 27.0648C27.8984 19.368 27.896 11.6736 27.896 3.98166Z"
              fill="rgba(222,44,109,1)"
            />
            <path
              d="M10.2129 22.4274V30.15H7.04903C7.01582 30.0248 6.9945 29.8975 6.98528 29.7694C6.98528 27.3301 6.94942 23.3858 7.00919 20.95C7.02074 19.2771 7.66904 17.6544 8.85313 16.3346C10.0372 15.0148 11.6907 14.072 13.556 13.653C16.6401 12.8919 20.6208 13.961 22.3222 15.985L20.0749 17.9226C18.3137 16.3345 16.1699 15.7325 13.6675 16.6113C12.9079 16.8734 12.2278 17.2837 11.6799 17.8105C11.132 18.3372 10.731 18.9663 10.5077 19.6491H18.8436V22.417L10.2129 22.4274Z"
              fill="rgba(222,44,109,1)"
            />
            <path
              d="M20.2315 5.03569C21.3874 5.03569 22.3244 4.09869 22.3244 2.94284C22.3244 1.78698 21.3874 0.849976 20.2315 0.849976C19.0757 0.849976 18.1387 1.78698 18.1387 2.94284C18.1387 4.09869 19.0757 5.03569 20.2315 5.03569Z"
              fill="rgba(222,44,109,1)"
            />
          </svg>
        </div>

        <div className="flex flex-col items-start justify-center gap-4.5 pt-3 px-[15px]  ">
          <h1 className="text-[#000] font-inter text-[22px] font-medium leading-[53px] ">
            {" "}
            Terms Of Service
          </h1>
          <p>
            We are delighted to have you on Hyyfam! Please carefully review these
            Terms of Service ("Agreement" or "Terms of Service"), as they
            constitute the legally binding terms and conditions governing your use
            of the services provided by Hyyfam (hereinafter referred to as
            "Hyyfam", "we", "our", or "us"). By registering as a user on Hyyfam, you
            expressly acknowledge and accept the terms outlined in this Agreement.
            Please thoroughly peruse and understand these terms prior to using our
            services.
          </p>
          <p>
            Hyyfam reserves the exclusive right, at its sole discretion, to amend
            or modify this Agreement at any time, with such changes taking effect
            as stated in the “Alteration Of Terms” clause mentioned hereinafter.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">Our Service</h2>
          <p>
            Hyyfam offers services designed to help content creators and brands
            connect, collaborate, and monetise their digital presence. For
            creators, Hyyfam enables affiliate link generation, automatic DMs,
            comment replies, and product collection generation in one place, all
            aimed at turning engagement into earnings. For brands, Hyyfam provides
            access to profiles of top-notch creators and real-time performance
            tracking. Our goal is to simplify the content-to-commerce journey and
            help both creators and brands grow through transparent and efficient
            partnerships.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">Mode Of Payment</h2>
          <p>Hyyfam provides four payment methods through which users may request withdrawals:</p>
          <ul className="list-disc pl-6">
            <li>Bank Transfer</li>
            <li>UPI</li>
            <li>Mobile Wallet</li>
            <li>Shopping Vouchers / Gift Certificates / Gift Cards</li>
          </ul>
          <p>
            Creators on Hyyfam earn commissions based on verified purchases made
            through their shared product links. All payments are processed through
            secure and authorized payment gateways. Payouts will be made directly
            to the creator’s registered bank account or preferred UPI ID, as
            provided during onboarding. Earnings are subject to the return window
            and approval process set by the partnered brands or platforms. Hyyfam
            is not responsible for payment delays caused by third-party merchants
            or incomplete user information. Minimum payout thresholds and
            processing timelines may apply and are subject to change.
          </p>
          <p>
            If suspicious or fraudulent activity is detected in a user’s account,
            Hyyfam reserves the right to indefinitely hold all payment requests
            pending further investigation or to cancel any commission accumulated
            up to that point.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">Privacy Policy</h2>
          <p>
            Our Privacy Policy governs the collection, storage, and usage of
            personal data exclusively through Hyyfam and applies solely to
            information shared by or collected from visitors to our website. The
            terms of this policy do not extend to any data collected through
            offline mechanisms or any other means outside this website and the
            official Hyyfam. This Policy forms part of this document, and by
            agreeing to it, you also give us consent to handle your information as
            per the policy's terms.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">
            Intellectual Property & Copyright
          </h2>
          <p>
            Hyyfam and all the content therein are protected by the copyright laws
            of India. All copyrights, trademarks, and intellectual property rights
            associated with Hyyfam and its services are the exclusive property of
            Hyyfam. Any unauthorised copying, reproduction, or distribution of any
            part of this website, including its content, whether modified or
            unmodified, is strictly prohibited without the prior written consent of
            Hyyfam. Furthermore, no individual or entity is permitted to
            commercially exploit Hyyfam's identity, logo, or services in any
            manner.
          </p>
          <p>
            By uploading or submitting any material to Hyyfam, you grant Hyyfam a
            non-exclusive, worldwide right to use, reproduce, and distribute such
            material. This license applies without any compensation to you and
            remains effective for the duration of the intellectual property rights
            in the material.
          </p>
          <h2 className="text-2xl font-bold mt-8 mb-4">Contact Details</h2>
          <p>
            If you have any questions regarding these terms and conditions, please
            contact us via email. All communications under this Agreement must be
            conducted via email. Please send your notices to us at our contact
            email. Notifications and notices from Hyyfam will be shared with the
            email address provided during account registration. Additionally, you
            can contact us via WhatsApp at +91 91165 72332.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
