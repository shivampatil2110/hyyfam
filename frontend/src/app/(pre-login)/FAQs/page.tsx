import FAQ from "@/components/landingPages/FAQ";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "HyyFam",
  description:
    "Join HyyFam, the ultimate platform for creators to earn money. Connect with brands, monetize your content, and grow your influence with our creator economy platform.",
  facebook: {
    appId: "1749835512284494",
  },
  openGraph: {
    title: "HyyFam - Hey! Creator wanna earn? Join Hyyfam Today",
    description:
      "Join HyyFam, the ultimate platform for creators to earn money. Connect with brands, monetize your content, and grow your influence with our creator economy platform.",
    siteName: "HyyFam",
    images: [
      {
        url: "/hyyfam.png",
        width: 1200,
        height: 630,
        alt: "Hey! Creator wanna earn? Join Hyyfam Today.",
      },
    ],
    type: "website",
    url: "https://www.hyyfam.com",
  },
  icons: {
    icon: [
      {
        url: "/hyyfam.png",
        sizes: "any",
      },
      {
        url: "/hyyfam.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: "/hyyfam.png",
        sizes: "32x32",
        type: "image/png",
      },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },
};

const faqSchema = {
  "@context": "https://schema.org",

  "@type": "FAQPage",

  mainEntity: [
    {
      "@type": "Question",

      name: "How can Hyyfam help me as a creator to grow?",

      acceptedAnswer: {
        "@type": "Answer",

        text: "Hyyfam lets you monetize your content effortlessly by turning your posts into shopping links. You can share affiliate links, set auto DMs, reply to comments automatically, and create a personalized catalogue, all designed to boost engagement, build trust with followers, and increase your earnings.",
      },
    },
    {
      "@type": "Question",

      name: "What is an auto DM, and how does it work?",

      acceptedAnswer: {
        "@type": "Answer",

        text: "Auto DM is a feature that automatically sends a direct message to anyone who comments with selected keywords on your post. It helps you instantly share product links or a preset message with interested users. To set it up, simply upload your post on Hyyfam and activate Auto DM within 3 hours. Select your product link, define the trigger keywords, and compose your custom message. Once done, every relevant comment triggers an automatic DM, saving you time and boosting engagement.",
      },
    },
    {
      "@type": "Question",

      name: "How can I track my earnings?",

      acceptedAnswer: {
        "@type": "Answer",

        text: "Hyyfam provides a built-in analytics dashboard that allows you to easily monitor your earnings, link performance, and daily activity. It keeps all your data organized and up-to-date, so you always know how your content is performing.",
      },
    },
    {
      "@type": "Question",

      name: "Can I collaborate with brands through Hyyfam?",

      acceptedAnswer: {
        "@type": "Answer",

        text: "Yes, absolutely. Hyyfam connects creators with top brands seeking genuine and engaging partnerships. As you stay active and share product links, your profile becomes visible to brands based on your content and performance. You can receive collaboration offers, discuss terms, and promote products that align with your style. It’s a straightforward way to expand your presence and begin earning money.",
      },
    },
    {
      "@type": "Question",

      name: "Do I need a minimum follower count to use Hyyfam?",

      acceptedAnswer: {
        "@type": "Answer",

        text: "Yes, you need at least 1000 followers to use Hyyfam.",
      },
    },
    {
      "@type": "Question",

      name: "How can Hyyfam help my brand grow?",

      acceptedAnswer: {
        "@type": "Answer",

        text: "Hyyfam helps your brand grow by connecting you with the right content creators who can authentically promote your products to the right audience. Our platform uses performance-driven strategies, trend insights, and data-backed recommendations to run high-converting campaigns. From increasing brand visibility to boosting engagement and sales, Hyyfam supports you at every step with tools that simplify influencer marketing and deliver real impact.",
      },
    },
    {
      "@type": "Question",

      name: "How can I connect with the content creators on Hyyfam?",

      acceptedAnswer: {
        "@type": "Answer",

        text: "It’s extremely simple. All you have to do is tell us about your campaign, what you are promoting, your goal and your target audience. Based on this, Hyyfam recommends suitable creators who align with your brand values. You can choose the best fit, launch collaborations, and manage everything seamlessly on one platform. We ensure the process is not only easy but also impactful and results-driven.",
      },
    },
    {
      "@type": "Question",

      name: "Can I work with creators from different platforms?",

      acceptedAnswer: {
        "@type": "Answer",

        text: "Yes, Hyyfam allows you to collaborate with creators from both Instagram and YouTube, all from one dashboard. You can manage campaigns, track performance, and communicate with the creators, no matter which platform they are on.",
      },
    },
    {
      "@type": "Question",

      name: "What if a creator doesn’t deliver as promised?",

      acceptedAnswer: {
        "@type": "Answer",

        text: "We have got your back! At Hyyfam, we closely monitor collaborations to ensure all agreed deliverables are met. If a creator fails to meet expectations outlined in the campaign brief, our team steps in to resolve the issue. Whether it’s through follow-ups, adjustments, or alternative solutions, we make sure your campaign stays on track without compromising results.",
      },
    },
  ],
};

const page = () => {
  return (
    <>
                     <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />
    <div
      className="w-full h-auto font-inter"
      style={{
        background:
          "linear-gradient(0deg, rgba(255, 255, 255, 0.40) 53.12%, rgba(255, 214, 228, 0.40) 100%)",
      }}
    >
      <FAQ />
    </div>
    </>
  );
};

export default page;
