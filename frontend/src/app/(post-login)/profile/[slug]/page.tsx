import dynamic from 'next/dynamic'
import { notFound } from 'next/navigation'
import { createStore } from "@/redux/store";
import { getServerApi, getServerCookies } from '@/redux/api/serverPostApiHelper';

type PageProps = {
  params: {
    slug: string;
  },
  searchParams: {
    id?: string;
  };
}

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

const componentMap: Record<string, () => Promise<{ default: React.ComponentType<{ id?: string }> }>> = {
  select_post: () => import('@/components/postLogin/selectPost'),
  collection_view: () => import('@/components/postLogin/profile/CollectionView'),
}

const slugApiMap: Record<string, (store: ReturnType<typeof createStore>, id?: string, serverApi?: any) => Promise<void>> = {
  create_post: async (store, id, serverApi) => {
    await store.dispatch(serverApi("posts").endpoints.getAutoPosts.initiate());
  },
  select_post: async (store, id, serverApi) => {
    await store.dispatch(serverApi("posts").endpoints.getInstaPosts.initiate());
  },
  collection_view: async (store, id, serverApi) => {
    if (!id) {
      throw new Error('ID is required for viewing collection');
    }
    await store.dispatch(serverApi("collection").endpoints.getCollectionLinks.initiate(id));
  },
  edit_collection: async (store, id, serverApi) => {
    if (!id) {
      throw new Error('ID is required for edit_collection');
    }
    await store.dispatch(serverApi("collection").endpoints.getCollectionLinks.initiate(id));
  },
  edit_post: async (store, id, serverApi) => {
    
  }
};

const protectedRoutes = ['create_post', 'select_post', 'collection_view', 'edit_collection', 'edit_post'];


export default async function DynamicPage({ params, searchParams }: PageProps) {
  const { slug } = params;
  const { id } = searchParams;

  const store = createStore();

  const { cookieString, cookieObjects } = getServerCookies();

  const loadComponent = componentMap[slug];
  const apiLoader = slugApiMap[slug];

  if (!loadComponent || !apiLoader) {
    notFound();
  }

  await apiLoader(store, id, getServerApi);
  const preloadedState = store.getState();

  const Component = dynamic(loadComponent);


  return (
    <div className="">
      <Component />
    </div>
  )
}