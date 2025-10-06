import Head from "next/head";
import Brands from "../../../components/landingPages/brandsLandingPage/index";
import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title:
    "Hyyfam : Curated Branded Shopping Storefronts by Influencers & Creators",
  description:
    " Explore HyyFam’s curated brand catalog—250+ affiliate partners, auto‑DM tools, real‑time earnings tracking, and creator‑focused growth.",
      keywords: "brand collaboration, brand collaborations, brand collab, collab with brands, brand collaboration instagram",
  robots: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  authors: [{ name: "HyyFam" }],
          alternates: {
    canonical: "https://www.hyyfam.com/brands",
  },
  facebook: {
    appId: "1749835512284494",
  },
  openGraph: {
    title:
      "Hyyfam : Curated Branded Shopping Storefronts by Influencers & Creators",
    description:
      " Explore HyyFam’s curated brand catalog—250+ affiliate partners, auto‑DM tools, real‑time earnings tracking, and creator‑focused growth.",
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

const page = () => {
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
    <div>

      <Brands />
    </div>
    </>
  );
};

export default page;
