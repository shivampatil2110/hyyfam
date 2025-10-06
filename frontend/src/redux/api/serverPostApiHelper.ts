// src/lib/serverApiHelpers.ts
import { cookies } from 'next/headers';
import { createServerPostsApi } from '@/redux/api/postsApi';
import { createServerCollectionApi } from './collectionApi';
import { createStore } from '@/redux/store/index';

/**
 * Gets server-side cookie information from Next.js
 * @returns An object containing formatted cookie data for the API
 */
export function getServerCookies() {
  const cookieStore: any = cookies();

  // Format cookies as a string
  let cookieString = '';
  cookieStore.getAll().forEach((cookie: any) => {
    cookieString += `${cookie.name}=${cookie.value}; `;
  });

  // Get specific important cookies
  const hyyzoTopicCookie = cookieStore.get('hyyzo_topic');
  const sessionCookie = cookieStore.get('session');

  // Create cookie objects
  const cookieObjects = {
    hyyzo_topic: hyyzoTopicCookie?.value,
    session: sessionCookie?.value
  };

  return { cookieString, cookieObjects };
}

/**
 * Creates a server-side API instance with cookies attached
 * @returns Server-side API instance
 */

export function getServerApi(apiType = 'posts'): any {
  const { cookieString, cookieObjects }: any = getServerCookies();

  // Create and return the appropriate API type
  switch (apiType.toLowerCase()) {
    case 'posts':
      return createServerPostsApi(cookieString, cookieObjects);
    case 'collection':
      return createServerCollectionApi(cookieString, cookieObjects);
    default:
      throw new Error(`Unknown API type: ${apiType}`);
  }
}


/**
 * Dispatches a server API request with cookies
 * @param endpointFn The API endpoint function to call
 * @param params Parameters to pass to the endpoint function
 * @returns The result of the API call
 */
export async function serverApiRequest(endpointFn: any, params = undefined) {
  const store = createStore()
  const { cookieString, cookieObjects }: any = getServerCookies();

  // Create a server API instance with the cookies
  const serverApi: any = createServerPostsApi(cookieString, cookieObjects);

  // Use the appropriate endpoint from the server API
  const endpoint = Object.keys(serverApi.endpoints).find(key =>
    serverApi.endpoints[key] === endpointFn ||
    serverApi.endpoints[key].initiate === endpointFn
  );

  if (!endpoint) {
    throw new Error('Endpoint not found in server API');
  }

  // Dispatch the request
  return store.dispatch(serverApi.endpoints[endpoint].initiate(params));
}