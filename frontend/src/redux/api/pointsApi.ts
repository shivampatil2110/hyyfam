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

export const pointsApi = createApi({
    reducerPath: 'pointsApi',
    baseQuery: createBaseQueryWithCookies(),
    tagTypes: ['Bank', 'Profile'],
    keepUnusedDataFor: 600,
    endpoints: (builder) => ({
        getUserPayInfo: builder.query<any, void>({
            query: () => {
                return `/user/auth/userpayinfo`;
            },
            transformResponse: (response: any) => {
                const mId3Array = response.data.filter((item: any) => item.m_id === 3);
                const mId2Array = response.data.filter((item: any) => item.m_id === 2);
                let data = {
                    Bank: mId2Array,
                    UPI: mId3Array
                }
                return data
            },
            providesTags: ['Bank']
        }),
        addUserPaymentInfo: builder.mutation({
            query: (newResource) => ({
                url: '/user/auth/addpaydetails',
                method: 'POST',
                body: newResource,
            }),
            invalidatesTags: ['Bank'],
        }),
        removeUserPaymentInfo: builder.mutation({
            query: (newResource) => ({
                url: '/user/auth/removepaydetails',
                method: 'POST',
                body: newResource,
            }),
            invalidatesTags: ['Bank'],
        }),
        getRedemptionHistory: builder.query<any, any>({
            query: ({ page }: any) => {
                const params = new URLSearchParams();

                if (page) params.append('page', page);
                return `/user/auth/getRedemptionHistory?${params.toString()}`;
            },
            transformResponse: (response: []) => {
                return response
            },
            providesTags: ['Bank']
        }),
        getUserProfile: builder.query<any, void>({
            query: () => {
                return `/user/auth/getUserProfile`;
            },
            transformResponse: (response: []) => {
                return response
            },
            providesTags: ['Profile']
        }),
        updateProfile: builder.mutation({
            query: (newResource) => ({
                url: '/user/auth/updateProfile',
                method: 'POST',
                body: newResource,
            }),
            invalidatesTags: ['Profile'],
        }),
        updateProfilePicture: builder.mutation({
            query: (newResource) => ({
                url: '/user/auth/uploadProfilePicture',
                method: 'POST',
                body: newResource,
            }),
            invalidatesTags: ['Profile'],
        }),
        sendverificationemail: builder.mutation({
            query: (newResource) => ({
                url: '/user/auth/sendverificationemail',
                method: 'POST',
                body: newResource,
            }),
        }),
    })
})

export const { useGetUserPayInfoQuery, useAddUserPaymentInfoMutation, useRemoveUserPaymentInfoMutation, useGetRedemptionHistoryQuery, useGetUserProfileQuery, useUpdateProfileMutation, useUpdateProfilePictureMutation, useSendverificationemailMutation } = pointsApi