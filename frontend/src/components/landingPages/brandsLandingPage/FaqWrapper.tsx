import React from "react";
import Head from "next/head";
import FAQSection from "./FAQ";
import Script from "next/script";
import faqs from "@/components/postLogin/settings/faqs";

const FAQWrapper = () => {

  const faqSchema = {
  "@context": "https://schema.org",
   "@type": "FAQPage",
   "mainEntity": [{
 	"@type": "Question",
 	"name": "How can Hyyfam help my brand grow?",
 	"acceptedAnswer": {
   	"@type": "Answer",
   	"text": "Hyyfam helps your brand grow by connecting you with the right content creators who can authentically promote your products to the right audience. Our platform uses performance-driven strategies, trend insights, and data-backed recommendations to run high-converting campaigns. From increasing brand visibility to boosting engagement and sales, Hyyfam supports you at every step with tools that simplify influencer marketing and deliver real impact."
 	}
   },{
 	"@type": "Question",
 	"name": "How can I connect with the content creators on Hyyfam?",
 	"acceptedAnswer": {
   	"@type": "Answer",
   	"text": "It’s extremely simple. All you have to do is tell us about your campaign, what you are promoting, your goal and your target audience. Based on this, Hyyfam recommends suitable creators who align with your brand values. You can choose the best fit, launch collaborations, and manage everything seamlessly on one platform. We ensure the process is not only easy but also impactful and results-driven."
 	}
   },{
 	"@type": "Question",
 	"name": "Can I work with creators from different platforms?",
 	"acceptedAnswer": {
   	"@type": "Answer",
   	"text": "Yes, Hyyfam allows you to collaborate with creators from both Instagram and YouTube, all from one dashboard. You can manage campaigns, track performance, and communicate with the creators, no matter which platform they are on."
 	}
   },{
 	"@type": "Question",
 	"name": "What if a creator doesn’t deliver as promised?",
 	"acceptedAnswer": {
   	"@type": "Answer",
   	"text": "We have got your back! At Hyyfam, we closely monitor collaborations to ensure all agreed deliverables are met. If a creator fails to meet expectations outlined in the campaign brief, our team steps in to resolve the issue. Whether it’s through follow-ups, adjustments, or alternative solutions, we make sure your campaign stays on track without compromising results."
 	}
   }]
};

  return (
    <>
      {/* <Head>
        <Script type="application/ld+json">
          {`
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
  `}
        </Script>
      </Head> */}

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
