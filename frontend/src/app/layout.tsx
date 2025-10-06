"use client";
import "./globals.css";
import ReduxProvider from "@/providers/ReduxProvider";
import { Inter, Raleway } from "next/font/google";
import { ToastProvider } from "../components/Toast/Toast";
import { useEffect, useState } from "react";
import NoInternet from "@/components/postLogin/LoadingStatesAndModals/NoInternet";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700", "800"],
  preload: true,
});

const raleway = Raleway({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-raleway",
  weight: ["300", "400", "500", "600", "700", "800"],
  preload: true,
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    // Initial status
    updateOnlineStatus();

    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => console.log("SW registered:", reg))
          .catch((err) => console.error("SW registration failed:", err));
      });
    }

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  if (!isOnline) return <NoInternet />;

  return (
    <html
      lang="en-IN"
      className={`${inter.variable} ${raleway.variable} overflow-y-scroll &::--scrollbar]:hidden  scroll-smooth`}
    >
      <head>
       <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org/",
              "@type": "WebSite",
              "name": "HyyFam",
              "url": "https://www.hyyfam.com/",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://www.hyyfam.com/brands{search_term_string}",
                "query-input": "required name=search_term_string"
              }
            }),
          }}
        />
        {/*  Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','GTM-T3PKTW4F');
              `,
          }}
        />
        {/*  End Google Tag Manager  */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#317EFB" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-T3PKTW4F"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          ></iframe>
        </noscript>
        <ReduxProvider>{children}</ReduxProvider>
        <ToastProvider />
      </body>
    </html>
  );
}
