import React from "react";
import Head from "next/head";
import FAQSection from "./FAQ";
import Script from "next/script";
import faqs from "@/components/postLogin/settings/faqs";

const FAQWrapper = () => {

  const faqSchema = {
 "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How can Hyyfam help my brand grow?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Hyyfam helps you to grow as a brand by suggesting result-driven strategies and ideas that are trending in marketing, including influencer marketing.",
        },
      },
      {
        "@type": "Question",
        name: "How can I connect with the content creators on Hyyfam?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You can discover and collaborate with the influencer simply by sharing your campaign brief and we will match you with the right creator who aligns with your brand and audience.",
        },
      },
      {
        "@type": "Question",
        name: "What if a creator doesn't deliver as promised?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "We have got your back! Hyyfam ensures that deliverables are met and provides support if any issues arise.",
        },
      },
    ],
};

  return (
    <>
                 <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />

      <FAQSection />
    </>
  );
};

export default FAQWrapper;
