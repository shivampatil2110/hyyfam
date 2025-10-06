import { createApi } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from '../../appConstants/baseURL';
import { fetchBaseQuery } from '@reduxjs/toolkit/query';

// Create a factory function that returns a configured baseQuery
// This allows us to dynamically create a baseQuery with the correct cookies
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

// Create the API with the default baseQuery (client-side)
export const postsApi = createApi({
    reducerPath: 'postsApi',
    baseQuery: createBaseQueryWithCookies(),
    tagTypes: ['AutoPost', 'InstaPost', 'Settings'],
    keepUnusedDataFor: 300,
    endpoints: (builder) => ({
        getInstaPosts: builder.query<any, void>({
            query: ({ page }: any) => {
                const params = new URLSearchParams();

                if (page) params.append('page', page);
                return `/instagram/getInstaPosts?${params.toString()}`;
            },
            transformResponse: (response: any) => {
                return response;
            },
            providesTags: ['InstaPost'],
        }),
        getAutoPosts: builder.query<any, void>({
            query: ({ page }: any) => {
                const params = new URLSearchParams();

                if (page) params.append('page', page);
                return `/instagram/getAutoPosts?${params.toString()}`;
            },
            transformResponse: (response: []) => {
                let res = response.map((autoPost: any) => {
                    let parsedProducts = JSON.parse(autoPost.products);
                    return { ...autoPost, products: parsedProducts };
                });
                return res;
            },
            providesTags: ['AutoPost'],
        }),
        createAutoPost: builder.mutation({
            query: (newResource) => ({
                url: '/instagram/createAutoPost',
                method: 'POST',
                body: newResource,
            }),
            invalidatesTags: ['AutoPost', 'InstaPost'],
        }),
        updateAutoPost: builder.mutation({
            query: (newResource) => ({
                url: '/instagram/updateAutoPost',
                method: 'POST',
                body: newResource,
            }),
            invalidatesTags: ['AutoPost'],
        }),
        getPostLinks: builder.query<any, string>({
            query: (id) => `/instagram/getPostLinks?post_id=${id}`,
            transformResponse: (response: []) => {
                let res = response.map((autoPost: any) => {
                    let parsedProducts = JSON.parse(autoPost.products);
                    return { ...autoPost, products: parsedProducts };
                });
                return res;
            },
            providesTags: ['AutoPost'],
        }),
        getUserSetting: builder.query<any, void>({
            query: () => `/instagram/getUserSetting`,
            transformResponse: (response: []) => {
                return response;
            },
            providesTags: ['Settings'],
        }),
        updateUserSetting: builder.mutation({
            query: (newResource) => ({
                url: '/instagram/updateUserSetting',
                method: 'POST',
                body: newResource,
            }),
            invalidatesTags: ['Settings'],
        }),
        getProfileSummary: builder.query<any, void>({
            query: () => '/instagram/getProfileSummary',
            transformResponse: (response: any) => {
                return response;
            },
            providesTags: [],
        }),
        deleteAutoPost: builder.mutation({
            query: (newResource) => ({
                url: '/instagram/deleteAutoPost',
                method: 'DELETE',
                body: newResource,
            }),
            invalidatesTags: ['AutoPost'],
        }),
        checkPostSetup: builder.mutation({
            query: (newResource) => ({
                url: '/instagram/checkPostSetup',
                method: 'POST',
                body: newResource,
            }),
            invalidatesTags: [],
        }),
    }),
});

// Create a server-side version of the API with cookies injected
export function createServerPostsApi(cookieString = '', cookieObjects = null) {
    // Create a new API instance with the server cookies
    return createApi({
        reducerPath: 'postsApi',
        baseQuery: createBaseQueryWithCookies(cookieString, cookieObjects),
        tagTypes: ['AutoPost', 'InstaPost'],
        keepUnusedDataFor: 300,
        endpoints: (builder) => ({
            getInstaPosts: builder.query<any, void>({
                query: () => '/instagram/getInstaPosts',
                transformResponse: (response: any) => {
                    return response.data;
                },
                providesTags: ['InstaPost'],
            }),
            getAutoPosts: builder.query<any, void>({
                query: () => '/instagram/getAutoPosts',
                transformResponse: (response: []) => {
                    let res = response.map((autoPost: any) => {
                        let parsedProducts = JSON.parse(autoPost.products);
                        return { ...autoPost, products: parsedProducts };
                    });
                    return res;
                },
                providesTags: ['AutoPost'],
            }),
            createAutoPost: builder.mutation({
                query: (newResource) => ({
                    url: '/instagram/createAutoPost',
                    method: 'POST',
                    body: newResource,
                }),
                invalidatesTags: ['AutoPost'],
            }),
            updateAutoPost: builder.mutation({
                query: (newResource) => ({
                    url: '/instagram/updateAutoPost',
                    method: 'POST',
                     body: newResource,
                }),
                invalidatesTags: ['AutoPost'],
            }),
            getPostLinks: builder.query<any, string>({
                query: (id) => `/instagram/getPostLinks?post_id=${id}`,
                transformResponse: (response: []) => {
                    let res = response.map((autoPost: any) => {
                        let parsedProducts = JSON.parse(autoPost.products);
                        return { ...autoPost, products: parsedProducts };
                    });
                    return res;
                },
                providesTags: ['AutoPost'],
            }),
            getUserSetting: builder.query<any, void>({
                query: () => `/instagram/getUserSetting`,
                transformResponse: (response: []) => {
                    return response;
                },
            }),
            deleteAutoPost: builder.mutation({
                query: (newResource) => ({
                    url: '/instagram/deleteAutoPost',
                    method: 'DELETE',
                    body: newResource,
                }),
                invalidatesTags: ['AutoPost'],
            }),
        }),
    });
}

export const { useGetInstaPostsQuery, useGetAutoPostsQuery, useCreateAutoPostMutation, useUpdateAutoPostMutation, useGetPostLinksQuery, useGetUserSettingQuery, useUpdateUserSettingMutation, useGetProfileSummaryQuery, useLazyGetProfileSummaryQuery,useDeleteAutoPostMutation, useCheckPostSetupMutation } = postsApi;