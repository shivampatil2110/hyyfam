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

export const homeApi = createApi({
    reducerPath: 'home',
    baseQuery: createBaseQueryWithCookies(),
    tagTypes: ['Story', 'Sales', 'Bonus'],
    keepUnusedDataFor: 600,
    endpoints: (builder) => ({
        getStories: builder.query<any, void>({
            query: () => '/home/getStories',
            transformResponse: (response: any) => {
                return response;
            },
            providesTags: ['Story'],
        }),
        getBanners: builder.query<any, void>({
            query: () => '/home/getBanners',
            transformResponse: (response: any) => {
                return response;
            },
            providesTags: [],
        }),
        getUpcomingSales: builder.query<any, any>({
            query: ({ start_date }: any) => {
                const params = new URLSearchParams();

                if (start_date) params.append('start_date', start_date);
                return `/home/getUpcomingSales?${params.toString()}`;
            },
            transformResponse: (response: any) => {
                return response
            },
            providesTags: []
        }),
        getNotification: builder.query<any, void>({
            query: () => '/home/getNotification',
            transformResponse: (response: any) => {
                return response;
            },
            providesTags: [],
        }),
        getTask: builder.query<any, any>({
            query: ({ type }: any) => {
                const params = new URLSearchParams();

                if (type) params.append('type', type);
                return `/home/getTask?${params.toString()}`;
            },
            transformResponse: (response: any) => {
                return response;
            },
            providesTags: [],
        }),
        gettaskbyurl: builder.query<any, any>({
            query: ({ task_url }: any) => {
                const params = new URLSearchParams();

                if (task_url) params.append('task_url', task_url);
                return `/home/gettaskbyurl?${params.toString()}`;
            },
            transformResponse: (response: any) => {
                return response;
            },
            providesTags: [],
        }),
        getBonusStatus: builder.query<any, void>({
            query: () => '/home/getBonusStatus',
            transformResponse: (response: any) => {
                return JSON.parse(response["bonus_status"]);
            },
            providesTags: ['Bonus'],
        }),
        getBestEarning: builder.query<any, void>({
            query: () => '/home/getBestEarning',
            transformResponse: (response: any) => {
                return response;
            },
            providesTags: ['Bonus'],
        }),
        getTotalComission: builder.query<any, void>({
            query: () => '/home/getTotalComission',
            transformResponse: (response: any) => {
                return response;
            },
            providesTags: ['Bonus'],
        }),
    })
})

export const { useGetStoriesQuery, useGetUpcomingSalesQuery, useLazyGetUpcomingSalesQuery, useGetNotificationQuery, useGetTaskQuery, useGettaskbyurlQuery, useLazyGettaskbyurlQuery, useGetBonusStatusQuery, useGetBestEarningQuery, useGetTotalComissionQuery, useGetBannersQuery } = homeApi