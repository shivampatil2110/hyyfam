// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// export const authApi = createApi({
//     reducerPath: 'authApi',
//     baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:5300/api' }),
//     tagTypes: ['AuthToken'],
//     keepUnusedDataFor: 500000,
//     endpoints: (builder) => ({
//         // getProfile: builder.query<any, void>({
//         //     query: () => '/user/auth/profile',
//         //     transformResponse: (response: []) => {
//         //         return response
//         //     },
//         //     providesTags: ['AuthToken']
//         // }),

//         sendOtp: builder.mutation({
//             query: (newResource) => ({
//                 url: '/user/auth/sendmobotp',
//                 method: 'POST',
//                 body: newResource
//             }),
//             invalidatesTags: ['AuthToken']
//         }),
//         sendLoginOtp: builder.mutation({
//             query: (newResource) => ({
//                 url: '/user/auth/sendloginotp',
//                 method: 'POST',
//                 body: newResource
//             }),
//             invalidatesTags: ['AuthToken']
//         }),

//     }),
// });

// export const { useSendOtpMutation, useSendLoginOtpMutation } = authApi;