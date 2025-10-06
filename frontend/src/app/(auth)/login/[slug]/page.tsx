import dynamic from 'next/dynamic'
import { notFound } from 'next/navigation'
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
    robots: {
    index: false,
    follow: false,
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


type PageProps = {
  params: {
    slug: string
  }
}

const componentMap: Record<string, () => Promise<{ default: React.ComponentType }>> = {
  otp: () => import('@/components/auth/OtpInputPage'),
  otpVerification: () => import('@/components/auth/OtpPage'),
  details: () => import('@/components/auth/SignupDetails'),
  forgot_password: () => import('@/components/auth/ForgotPassword'),

}

export default async function HomeSlugPage({ params }: PageProps) {
  const { slug } = params

  const loadComponent = componentMap[slug]

  if (!loadComponent) {
    notFound()
  }

  const Component = dynamic(loadComponent)

  return (
    <div className="">
      <Component />
    </div>
  )
}
