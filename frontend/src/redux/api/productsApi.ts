import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from '../../appConstants/baseURL'

const createBaseQueryWithCookies = (cookieString = '', cookieObjects: any = null) => {
    return fetchBaseQuery({
        baseUrl: BASE_URL,
        credentials: 'include',
        prepareHeaders: (headers) => {
            // Always attach the cookie string if available
            if (cookieString) {
                headers.set('cookie', cookieString);
            }

            // Handle specific cookie objects if provided
            if (cookieObjects) {
                // Handle hyyzo_topic cookie
                if (cookieObjects.hyyzo_topic) {
                    try {
                        // Try to parse if it's already in JSON format
                        let hyyzoTopicValue;
                        try {
                            hyyzoTopicValue = JSON.parse(cookieObjects.hyyzo_topic);
                        } catch {
                            // If not parseable, create the expected structure
                            hyyzoTopicValue = { token: cookieObjects.hyyzo_topic };
                        }

                        // Set the cookie header
                        headers.set('x-hyyzo-topic', JSON.stringify(hyyzoTopicValue));
                    } catch (e) {
                    }
                }

                // Handle session cookie
                if (cookieObjects.session) {
                    headers.set('x-session', cookieObjects.session);
                }
            }

            return headers;
        },
    });
};

export const productsApi = createApi({
    reducerPath: 'products',
    baseQuery: createBaseQueryWithCookies(),
    tagTypes: ['Deals'],
    keepUnusedDataFor: 600,
    endpoints: (builder) => ({
        getDeals: builder.mutation({
            query: (newResource) => ({
                url: '/products/deals',
                method: 'POST',
                body: newResource,
            }),
            invalidatesTags: ['Deals'],
        }),
        grabDealDeepLink: builder.mutation({
            query: (newResource) => ({
                url: '/products/grabDealDeepLink',
                method: 'POST',
                body: newResource,
            }),
            invalidatesTags: ['Deals'],
        }),
        deeplink: builder.mutation({
            query: (newResource) => ({
                url: '/products/deeplink',
                method: 'POST',
                body: newResource,
            }),
            invalidatesTags: ['Deals'],
        }),
        storesbycat: builder.query<any, any>({
            query: ({ cat }: any) => {
                const params = new URLSearchParams();

                if (cat) params.append('cat', cat);
                return `/products/storesbycat?${params.toString()}`;
            },
            transformResponse: (response: any) => {

                return response.data
            },
            providesTags: []
        }),
        getStoreSchema: builder.mutation({
            query: (newResource) => ({
                url: '/products/getStoreSchema',
                method: 'POST',
                body: newResource,
            }),
            invalidatesTags: [],
        }),
        getStoreDescription: builder.query<any, any>({
            query: ({ store_page_url }: any) => {
                const params = new URLSearchParams();

                if (store_page_url) params.append('store_page_url', store_page_url);
                return `/products/getStoreDescription?${params.toString()}`;
            },
            transformResponse: (response: any) => {

                return response.data
            },
            providesTags: []
        }),
    })
})

export const { useGetDealsMutation, useGrabDealDeepLinkMutation, useDeeplinkMutation, useStoresbycatQuery, useLazyStoresbycatQuery, useGetStoreSchemaMutation, useLazyGetStoreDescriptionQuery } = productsApi