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

export const collectionApi = createApi({
    reducerPath: 'collectionApi',
    baseQuery: createBaseQueryWithCookies(),
    tagTypes: ['Collection', 'RecentLinks'],
    keepUnusedDataFor: 500000,
    endpoints: (builder) => ({
        getCollections: builder.query<any, any>({
            query: ({ search, page }: any) => {
                const params = new URLSearchParams();

                if (search) params.append('search', search);
                if (page) params.append('page', page);
                return `/collection/getCollection?${params.toString()}`;
            },
            transformResponse: (response: []) => {
                let res = response.map((collection: any) => {
                    let parsedProducts = JSON.parse(collection.products)
                    return { ...collection, products: parsedProducts }
                })
                return res
            },
            providesTags: ['Collection']
        }),
        getRecentLinks: builder.query<any, any>({
            query: ({ search, page }: any) => {
                const params = new URLSearchParams();

                if (search) params.append('search', search);
                if (page) params.append('page', page);
                return `/collection/getRecentLinks?${params.toString()}`;
            },
            transformResponse: (response: []) => {
                return response
            },
            providesTags: ['RecentLinks']
        }),
        getProductDetails: builder.mutation({
            query: (newResource) => ({
                url: '/collection/getProductDetails',
                method: 'POST',
                body: newResource
            }),
            invalidatesTags: ['Collection']
        }),
        createCollection: builder.mutation({
            query: (newResource) => ({
                url: '/collection/createCollection',
                method: 'POST',
                body: newResource,
            }),
            invalidatesTags: ['Collection'],
        }),
        createSingleLink: builder.mutation({
            query: (newResource) => ({
                url: '/collection/convertSingleLink',
                method: 'POST',
                body: newResource,
            }),
            invalidatesTags: ['RecentLinks'],
        }),
        getCollectionLinks: builder.query<any, string>({
            query: (id) => `/collection/getCollectionLinks?cid=${id}`,
            transformResponse: (response: []) => {
                return response
            },
            providesTags: ['Collection', 'RecentLinks']
        }),
        updateCollection: builder.mutation({
            query: (newResource) => ({
                url: '/collection/updateCollection',
                method: 'POST',
                body: newResource,
            }),
            invalidatesTags: ['Collection'],
        }),
        getCollectionPreview: builder.query<any, string>({
            query: (id: any) => `/collection/getPreviewCollection?uid=${id.uid}&page=${id.page}`,
            transformResponse: (response: any) => {
                let collection = response.collectionData
                collection = collection.map((col: any) => {
                    col.products = JSON.parse(col.products)
                    return col
                })
                response.collectionData = collection
                return response
            },
            transformErrorResponse: (res: any) => {
                return res.data.message
            },
            providesTags: []
        }),
        getPreviewCollectionDetails: builder.query<any, any>({
            query: (id: any) => `/collection/getPreviewCollectionDetails?uid=${id.uid}&cid=${id.cid}`,
            transformResponse: (response: any) => {
                return response
            },
            providesTags: []
        }),
        deleteCollection: builder.mutation({
            query: (newResource) => ({
                url: '/collection/deleteCollection',
                method: 'DELETE',
                body: newResource,
            }),
            invalidatesTags: ['Collection'],
        }),
    }),
});

export function createServerCollectionApi(cookieString = '', cookieObjects = null) {
    // Create a new API instance with the server cookies
    return createApi({
        reducerPath: 'collectionApi',
        baseQuery: createBaseQueryWithCookies(cookieString, cookieObjects),
        tagTypes: ['Collection', 'RecentLinks'],
        keepUnusedDataFor: 500000,
        endpoints: (builder) => ({
            getCollections: builder.query<any, void>({
                query: () => '/collection/getCollection',
                transformResponse: (response: []) => {
                    let res = response.map((collection: any) => {
                        let parsedProducts = JSON.parse(collection.products)
                        return { ...collection, products: parsedProducts }
                    })
                    return res
                },
                providesTags: ['Collection']
            }),
            getRecentLinks: builder.query<any, number>({
                query: (page = 1) => `/collection/getRecentLinks?page=${page}`,
                transformResponse: (response: []) => {
                    return response
                },
                providesTags: ['RecentLinks']
            }),
            getProductDetails: builder.mutation({
                query: (newResource) => ({
                    url: '/collection/getProductDetails',
                    method: 'POST',
                    body: newResource
                }),
                invalidatesTags: ['Collection']
            }),
            createCollection: builder.mutation({
                query: (newResource) => ({
                    url: '/collection/createCollection',
                    method: 'POST',
                    body: newResource,
                }),
                invalidatesTags: ['Collection'],
            }),
            createSingleLink: builder.mutation({
                query: (newResource) => ({
                    url: '/collection/convertSingleLink',
                    method: 'POST',
                    body: newResource,
                }),
                invalidatesTags: ['RecentLinks'],
            }),
            getCollectionLinks: builder.query<any, string>({
                query: (id) => `/collection/getCollectionLinks?cid=${id}`,
                transformResponse: (response: []) => {
                    return response
                },
                providesTags: ['Collection', 'RecentLinks']
            }),
            updateCollection: builder.mutation({
                query: (newResource) => ({
                    url: '/collection/updateCollection',
                    method: 'POST',
                    body: newResource,
                }),
                invalidatesTags: ['Collection'],
            }),
        }),
    });
}

export const { useGetCollectionsQuery, useGetRecentLinksQuery, useGetProductDetailsMutation,
    useCreateCollectionMutation, useCreateSingleLinkMutation, useGetCollectionLinksQuery, useUpdateCollectionMutation, useLazyGetCollectionLinksQuery, useLazyGetCollectionsQuery, useLazyGetRecentLinksQuery, useGetCollectionPreviewQuery, useGetPreviewCollectionDetailsQuery, useDeleteCollectionMutation } = collectionApi;