import dynamic from 'next/dynamic'
import { notFound, redirect } from 'next/navigation'
import { createStore } from "@/redux/store";
import { getServerApi, getServerCookies } from '@/redux/api/serverPostApiHelper';
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

type PageProps = {
  params: {
    slug: string
  }
}

const componentMap: Record<string, () => Promise<{ default: React.ComponentType }>> = {
  link_generator: () => import('@/components/postLogin/create/singleLinkGenerator'),
  collection_generator: () => import('@/components/postLogin/create/collectionGenerator'),
  autoDM: () => import('@/components/postLogin/create/AutoDM'),
}

const slugApiMap: Record<string, (store: ReturnType<typeof createStore>, serverApi: any) => Promise<void>> = {
  link_generator: async (store, serverApi) => {
    await store.dispatch(serverApi('collection').endpoints.getRecentLinks.initiate(1));
  },
  collection_generator: async (store) => {
  },
  autoDM: async (store) => {
  },
};

export default async function HomeSlugPage({ params }: PageProps) {
  const { slug } = params

  // Check if the slug exists in componentMap first
  const loadComponent = componentMap[slug]
  
  if (!loadComponent) {
    notFound()
  }

  const store = createStore();
  const { cookieString, cookieObjects } = getServerCookies();

  // Now safely call the API function since we know the slug exists
  if (slugApiMap[slug]) {
    await slugApiMap[slug](store, getServerApi)
  }
  
  const preloadedState = store.getState();
  const Component = dynamic(loadComponent)

  return (
    <div className="">
      <Component />
    </div>
  )
}