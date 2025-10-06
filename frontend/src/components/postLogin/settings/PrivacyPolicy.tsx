"use client";
import React from "react";
import { useRouter } from "next/navigation";

const PrivacyPolicy = ({changeTab}: any) => {
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
          <h1 className="text-2xl font-bold ">Privacy Policy</h1>

          <section className="mb-6">
            <p>
              At Hyyfam, we value your privacy and are committed to protecting
              your personal information. This privacy policy outlines how we
              collect, use, and safeguard your data when you use our platform.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">CONSENT</h2>
            <ul className="">
              <li className="mb-4">
                By using Hyyfam, you consent to the collection, use, and sharing
                of your information as outlined in this Privacy Policy. When you
                sign up, connect your social media, or engage with our services,
                you acknowledge that you’ve read and agreed to our terms.
              </li>
              <li className="mb-4">
                If at any moment you wish to withdraw your consent, you may do
                so by contacting us at the email address provided in the
                “contact us” section of this policy. Upon receiving your
                Withdrawal request, we will stop processing your personal
                information (bank details, contact number, email address, etc),
                except where required by law or for legitimate business
                purposes.
              </li>
              <li className="mb-4">
                Please ensure that withdrawing your consent will also restrict
                your access to certain features of Hyyfam.
              </li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">
              INFORMATION WE COLLECT:{" "}
            </h2>
            <p className="mb-4">
              To make your experience smooth, personalized, and efficient on
              Hyyfam, we collect the following types of information.
            </p>
            <ul className="list-disc list-inside">
              <li>Name and email address</li>
              <li>Phone number </li>
              <li>
                Social media profile details (username and follower count){" "}
              </li>
              <li>Content engagement data (likes, comments, and shares)</li>
              <li>Login and usage activity</li>
              <li>
                Payment and transaction details (for payouts or collaboration){" "}
              </li>
              <li>Campaign-related preferences (for brands and creators) </li>
            </ul>

            <p className="mt-4">
              Please note that we only collect information that’s necessary to
              help you earn, collaborate, and grow better on Hyyfam. You will
              always have a record of the data collected by us.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">
              WHY DO WE COLLECT YOUR INFORMATION?
            </h2>
            {/* <h3 className="font-medium">4.1 Personal Data</h3> */}
            <p className="my-4">
              At Hyyfam, we collect your information to create a personlized and
              secure experience for both creators and brands. The data helps us
              make the platform according to your needs. Hyyfam uses temporary
              cookies to store non-sensitive data, which allows us and our
              service partners to perform technical operations, platform
              improvements, and general administration. In some cases,
              authorized third-party services may place or recognize cookies on
              your browser to help deliver better services or relevant ads.
            </p>
            <ul className="list-disc list-inside mb-2">
              <li>
                To deliver and enhance our services, we enable payments, send
                confirmations, provide the features you request, launch new
                tools, offer customer support, ensure account security, and keep
                you updated with relevant notifications and messages.
              </li>
              <li>
                We use the information for internal operations like detecting
                and preventing fraud, resolving technical issues, analyzing
                data, conducting research, and tracking user behaviour to
                improve functionality.
              </li>
              <li>
                We may send updates, promotions, product features, offers, news,
                and events on Hyyfam. This also includes managing entries for
                giveaways and fulfilling associated rewards.{" "}
              </li>
              <li>
                We aim to recommend creators, content, features, and ads
                according to your preferences, making your experience with
                Hyyfam more engaging and relevant.{" "}
              </li>
            </ul>
            <p className="my-4">
              Please note that while you interact on Hyyfam, your data may also
              be accessed or used by parties beyond our control. These may
              include your mobile service provider, device OS, third-party apps,
              social platforms, or other external services you engage with.
            </p>

            <h2 className="text-xl font-semibold mt-6">COOKIES: </h2>
            <p className="my-4">
              We use cookies and similar tracking technologies on our websites
              to improve your browsing experience, analyze site traffic, and
              personalize content and ads based on your preferences. You can
              manage or disable cookies through your browser settings.
            </p>
            <p className="mb-4">We use cookies to: </p>
            <ul className="list-disc list-inside mb-2">
              <li>Keep you logged in securely </li>
              <li>Save your preference (so you don’t have to do it twice) </li>
              <li>Understand how you use Hyyfam and how we can improve</li>
            </ul>
            <p>
              This Cookie Policy may be updated periodically. We recommend
              checking this section occasionally for any changes.
            </p>

            <h2 className="text-xl font-semibold my-4">YOUR RIGHTS:</h2>
            <p className="my-4">
              We at Hyyfam respect your privacy and believe you should have full
              control over your personal information. As a user, you have a
              right to:
            </p>
            <ul className="list-disc list-inside mb-2">
              <li>
                Request a copy of the personal data we hold about you at any
                time.{" "}
              </li>
              <li>
                If your personal information is outdated or inaccurate, you have
                the right to update or correct it.
              </li>
              <li>
                You can request that we delete your personal data from our
                system, subject to any legal or contractual obligations.
              </li>
              <li>
                If you’ve given us permission to use your data, you can withdraw
                that consent at any time.{" "}
              </li>
              <li>
                You can opt out of promotional emails, messages, or
                notifications by following the unsubscribe instructions in the
                message or by adjusting your preferences in your account
                setting.{" "}
              </li>
              <li>
                If you believe your data rights have been violated, you have the
                right to take legal action against us.{" "}
              </li>
            </ul>
            {/* <p>You can manage cookies via your browser settings or visit our Cookie Policy for more details.</p> */}
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">AUTO-LINK FEATURE: </h2>
            <p>
              The Auto-Link feature is designed to enhance your experience on
              Hyyfam by automatically sending product links via Instagram DMs
              whenever someone comments on your posts.{" "}
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">DATA RETENTION:</h2>
            <p>
              Hyyfam collects your personal data that is essential to operate
              and improve our social commerce and creator brand collaboration
              services. This may include your name, contact details, age,
              gender, and browsing behaviour on our platform. By using Hyyfam,
              you agree to the collection, storage, and usage of your personal
              data as outlined in our Privacy Policy.{" "}
            </p>
            <p>
              WYour data may be shared with the trusted third-party service
              providers who support our platform operations, such as payment
              processors, analytics providers, or customer support tools. In
              case where brands are involved in affiliate partnerships,
              necessary data may also be shared with them strictly to fulfil
              campaign or business requirements.{" "}
            </p>
            <p>
              We retain your data only as long as necessary for the purposes of
              business operations or to comply with applicable laws and
              regulations. In the case of a data breach, Hyyfam will take swift
              action to notify affected users and relevant authorities.{" "}
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">GENERAL</h2>
            <p>
              We may change this Privacy Policy periodically. We encourage you
              to review this page regularly to stay informed about any updates.
              If you have any queries, feel free to reach out.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
