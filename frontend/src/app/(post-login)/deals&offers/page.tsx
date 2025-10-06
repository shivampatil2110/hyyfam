import React, { Suspense } from "react";
import Deals from "@/components/postLogin/DealsPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "HyyFam",
  description: "Join HyyFam, the ultimate platform for creators to earn money. Connect with brands, monetize your content, and grow your influence with our creator economy platform.",
  facebook: {
    appId: "1749835512284494"
  },
  openGraph: {
        title: "HyyFam - Hey! Creator wanna earn? Join Hyyfam Today",
    description: "Join HyyFam, the ultimate platform for creators to earn money. Connect with brands, monetize your content, and grow your influence with our creator economy platform.",
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
}

const page = async () => {
  return (
    <div>
        <Deals />
    </div>
  );
};

export default page;
