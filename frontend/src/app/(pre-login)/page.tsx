import LandingPage from "../../components/landingPages/creatorsLandingPage/index";
import type { Metadata } from "next";
import Head from "next/head";
import Script from "next/script";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "HyyFam",
  alternateName: "HyyFam",
  url: "https://www.hyyfam.com/",
  logo: "https://cdn.hyyfam.com/images/gallery/file1753187589937HyyfamLogo.jpg",
  sameAs: [
    "https://www.facebook.com/people/Hyyfam/61576204471387/",
    "https://x.com/hyyfam_",
    "https://www.instagram.com/hyy_fam/",
    "https://www.youtube.com/@hyyfam",
    "https://www.linkedin.com/company/hyyfam/",
  ],
};

export const metadata: Metadata = {
  title: "Earn More with Instagram Monetization Tool for Influencers & Creators | HyyFam",
  description:
    "Turn your Instagram into income: Hyyfam’s auto-DMs, affiliate links & real-time tracking make Instagram monetization seamless.",
      keywords: "instagram monetization, earn money through instagram, earn money from instagram, instagram money earning, earn through social media, instagram automation, instagram automation tool, brand collaboration, auto dm instagram tool, Auto DM tool, brand collaborations, collab with brands, brand collab, brand collaboration instagram, earn from instagram, make money on ig, link sharing",
  robots: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  authors: [{ name: "HyyFam" }],
      alternates: {
    canonical: "https://www.hyyfam.com",
  },
  facebook: {
    appId: "1749835512284494",
  },
  openGraph: {
    title: "Hyyfam : Top Monetization Tool for Creators to Grow & Earn Online",
    description:
      "HyyFam empowers content creators with an all-in-one monetization tool for creators to earn money through product links, brand collabs, and custom storefronts.",
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
  other: {
    "verify-admitad": "f2c20d3a28",
  },
};

export default function Home() {
  return (
    <>
    {/* <Head> */}
        <Script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
{/* </Head> */}
      <LandingPage />
    </>
  );
}
