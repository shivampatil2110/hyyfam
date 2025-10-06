"use client";
import ReduxProvider from "@/providers/ReduxProvider";
import Header from "@/components/landingPages/header"
import Footer from "@/components/landingPages/footer";
import { usePathname } from "next/navigation";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    const pathname = usePathname();
    const isDynamicRoute = pathname.includes("/preview");
  return (
<main>
       {!isDynamicRoute &&  <Header />}
        {children}
       {!isDynamicRoute && <Footer />}
       </main>
  );
}
