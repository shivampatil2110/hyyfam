import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../../appConstants/baseURL";
import { formatDateToLocalYYYYMMDD } from "@/utils/dateFormat";

const createBaseQueryWithCookies = (
  cookieString = "",
  cookieObjects: any = null
) => {
  return fetchBaseQuery({
    baseUrl: BASE_URL,
    credentials: "include",
    prepareHeaders: (headers) => {
      // Always attach the cookie string if available
      if (cookieString) {
        headers.set("cookie", cookieString);
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
            headers.set("x-hyyzo-topic", JSON.stringify(hyyzoTopicValue));
          } catch (e) {
          }
        }

        // Handle session cookie
        if (cookieObjects.session) {
          headers.set("x-session", cookieObjects.session);
        }
      }

      return headers;
    },
  });
};

interface GetPostReportParams {
  post_id?: string;
  limit?: number;
  offset?: number;
  start_date?: any;
  end_date?: any;
  //   type?: string;
  //   type?: string;
  alltime?: boolean;
  sort_by?: string;
  page?: number;
}

interface GetCollectionReportParams {
  cid?: any;
  limit?: number;
  offset?: number;
  start_date?: any;
  end_date?: any;
  type?: string;
  alltime?: boolean;
  sort_by?: string;
  store_arr?: string[];
  status?: string[];
  page?: number;
  store_id?: string;
  store?: boolean;
}

export const analyticsApi = createApi({
  reducerPath: "analyticsApi",
  baseQuery: createBaseQueryWithCookies(),
  tagTypes: ["Analytics"],
  keepUnusedDataFor: 600,
  endpoints: (builder) => ({
    getPostReport: builder.query<any, GetPostReportParams>({
      query: ({
        start_date,
        end_date,
        alltime,
        post_id,
        limit,
        offset,
        sort_by,
        page,
      }: any) => {
        const params = new URLSearchParams();

        if (post_id) params.append("post_id", post_id);
        if (page) params.append("page", page);
        if (sort_by) params.append("sort_by", sort_by);
        if (limit !== undefined) params.append("limit", limit.toString());
        if (offset !== undefined) params.append("offset", offset.toString());
        if (start_date !== undefined) {
          const dateStr =
            start_date instanceof Date
              ? start_date.toISOString().split("T")[0] // Gets just YYYY-MM-DD
              : start_date;
          params.append("start_date", dateStr);
        }

        if (end_date !== undefined) {
          const dateStr =
            end_date instanceof Date
              ? end_date.toISOString().split("T")[0] // Gets just YYYY-MM-DD
              : end_date;
          params.append("end_date", dateStr);
        }
        if (alltime !== undefined) params.append("alltime", alltime.toString());
        return `/analytics/getPostReport?${params.toString()}`;
      },
      transformResponse: (response: []) => {
        return response;
      },
      providesTags: ["Analytics"],
    }),
    getCollectionReport: builder.query<any, GetCollectionReportParams>({
      query: ({
        start_date,
        end_date,
        alltime,
        cid,
        limit,
        offset,
        sort_by,
        page,
      }: any) => {
        const params = new URLSearchParams();

        if (cid) params.append("cid", cid);
        if (page) params.append("page", page);
        if (sort_by) params.append("sort_by", sort_by);
        if (limit !== undefined) params.append("limit", limit.toString());
        if (offset !== undefined) params.append("offset", offset.toString());
        if (start_date !== undefined) {
          const dateStr =
            start_date instanceof Date
              ? start_date.toISOString().split("T")[0] // Gets just YYYY-MM-DD
              : start_date;
          params.append("start_date", dateStr);
        }

        if (end_date !== undefined) {
          const dateStr =
            end_date instanceof Date
              ? end_date.toISOString().split("T")[0] // Gets just YYYY-MM-DD
              : end_date;
          params.append("end_date", dateStr);
        }
        if (alltime !== undefined) params.append("alltime", alltime.toString());

        return `/analytics/getCollectionReport?${params.toString()}`;
      },
      transformResponse: (response: []) => {
        return response;
      },
      providesTags: ["Analytics"],
    }),
    getProductReport: builder.query<any, GetCollectionReportParams>({
      query: ({
        start_date,
        end_date,
        alltime,
        cid,
        limit,
        offset,
        sort_by,
        page,
      }: any) => {
        const params = new URLSearchParams();

        if (cid) params.append("cid", cid);
        if (page) params.append("page", page);
        if (sort_by) params.append("sort_by", sort_by);
        if (limit !== undefined) params.append("limit", limit.toString());
        if (offset !== undefined) params.append("offset", offset.toString());
        if (start_date !== undefined) {
          const dateStr = formatDateToLocalYYYYMMDD(start_date);
          if (dateStr) params.append("start_date", dateStr);
        }

        if (end_date !== undefined) {
          const dateStr = formatDateToLocalYYYYMMDD(end_date);
          if (dateStr) params.append("end_date", dateStr);
        }
        if (alltime !== undefined) params.append("alltime", alltime.toString());

        return `/analytics/getProductReport?${params.toString()}`;
      },
      transformResponse: (response: []) => {
        return response;
      },
      providesTags: ["Analytics"],
    }),
    getBrandReport: builder.query<any, GetCollectionReportParams>({
      query: ({ start_date, end_date, alltime, limit, offset, store_id, store }: any) => {
        const params = new URLSearchParams();

        // if (cid) params.append('cid', cid);
        if (limit !== undefined) params.append("limit", limit.toString());
        if (store !== undefined) params.append("store", store.toString());
        if (store_id !== undefined) params.append("store_id", store_id.toString());
        if (offset !== undefined) params.append("offset", offset.toString());
        if (start_date !== undefined) {
          const dateStr =
            start_date instanceof Date
              ? start_date.toISOString().split("T")[0] // Gets just YYYY-MM-DD
              : start_date;
          params.append("start_date", dateStr);
        }

        if (end_date !== undefined) {
          const dateStr =
            end_date instanceof Date
              ? end_date.toISOString().split("T")[0] // Gets just YYYY-MM-DD
              : end_date;
          params.append("end_date", dateStr);
        }
        if (alltime !== undefined) params.append("alltime", alltime.toString());

        return `/analytics/getBrandReport?${params.toString()}`;
      },
      transformResponse: (response: []) => {
        return response;
      },
      providesTags: ["Analytics"],
    }),
    getOrderStatus: builder.query<any, GetCollectionReportParams>({
      query: ({ start_date, end_date, alltime, cid, limit, offset }: any) => {
        const params = new URLSearchParams();

        if (cid) params.append("cid", cid);
        if (limit !== undefined) params.append("limit", limit.toString());
        if (offset !== undefined) params.append("offset", offset.toString());
        if (start_date !== undefined) {
          const dateStr =
            start_date instanceof Date
              ? start_date.toISOString().split("T")[0] // Gets just YYYY-MM-DD
              : start_date;
          params.append("start_date", dateStr);
        }

        if (end_date !== undefined) {
          const dateStr =
            end_date instanceof Date
              ? end_date.toISOString().split("T")[0] // Gets just YYYY-MM-DD
              : end_date;
          params.append("end_date", dateStr);
        }
        if (alltime !== undefined) params.append("alltime", alltime.toString());

        return `/analytics/getOrderStatus?${params.toString()}`;
      },
      transformResponse: (response: []) => {
        return response;
      },
      providesTags: ["Analytics"],
    }),
    getAmountStatus: builder.query<any, GetCollectionReportParams>({
      query: ({ start_date, end_date, alltime, cid, limit, offset }: any) => {
        const params = new URLSearchParams();

        if (cid) params.append("cid", cid);
        if (limit !== undefined) params.append("limit", limit.toString());
        if (offset !== undefined) params.append("offset", offset.toString());
        if (start_date !== undefined) {
          const dateStr =
            start_date instanceof Date
              ? start_date.toISOString().split("T")[0] // Gets just YYYY-MM-DD
              : start_date;
          params.append("start_date", dateStr);
        }

        if (end_date !== undefined) {
          const dateStr =
            end_date instanceof Date
              ? end_date.toISOString().split("T")[0] // Gets just YYYY-MM-DD
              : end_date;
          params.append("end_date", dateStr);
        }
        if (alltime !== undefined) params.append("alltime", alltime.toString());
        return `/analytics/getAmountStatus?${params.toString()}`;
      },
      transformResponse: (response: []) => {
        return response;
      },
      providesTags: ["Analytics"],
    }),
    getTransactionReport: builder.query<any, GetCollectionReportParams>({
      query: ({
        start_date,
        end_date,
        alltime,
        cid,
        limit,
        offset,
        status,
        store_arr,
        page,
      }: any) => {
        const params = new URLSearchParams();

        if (cid) params.append("cid", cid);
        if (page) params.append("page", page);

        if (status?.length > 0) {
          params.append(
            "status",
            Array.isArray(status) ? JSON.stringify(status) : status
          );
        }
        if (store_arr?.length > 0) {
          params.append(
            "store_arr",
            Array.isArray(store_arr) ? JSON.stringify(store_arr) : store_arr
          );
        }
        if (limit !== undefined) params.append("limit", limit.toString());
        if (offset !== undefined) params.append("offset", offset.toString());
        if (start_date !== undefined) {
          const dateStr =
            start_date instanceof Date
              ? start_date.toISOString().split("T")[0] // Gets just YYYY-MM-DD
              : start_date;
          params.append("start_date", dateStr);
        }

        if (end_date !== undefined) {
          const dateStr =
            end_date instanceof Date
              ? end_date.toISOString().split("T")[0] // Gets just YYYY-MM-DD
              : end_date;
          params.append("end_date", dateStr);
        }
        if (alltime !== undefined) params.append("alltime", alltime.toString());
        return `/analytics/getTransactionReport?${params.toString()}`;
      },
      transformResponse: (response: []) => {
        return response;
      },
      providesTags: ["Analytics"],
    }),
    getCashbackDetails: builder.mutation({
      query: (newResource) => ({
        url: "/analytics/getCashbackDetails",
        method: "POST",
        body: newResource,
      }),
      invalidatesTags: ["Analytics"],
    }),
    getLinkReport: builder.mutation({
      query: (newResource) => ({
        url: "/analytics/getLinkReport",
        method: "POST",
        body: newResource,
      }),
      invalidatesTags: ["Analytics"],
    }),
    getUserEarningWallet: builder.mutation({
      query: (newResource) => ({
        url: "/analytics/getUserEarningWallet",
        method: "POST",
        body: newResource,
      }),
      invalidatesTags: ["Analytics"],
    }),
    getDailyReport: builder.query<any, GetCollectionReportParams>({
      query: ({ start_date, end_date, alltime, limit, offset }: any) => {
        const params = new URLSearchParams();

        if (start_date) params.append("start_date", start_date);
        if (end_date) params.append("end_date", end_date);
        if (limit !== undefined) params.append("limit", limit.toString());
        if (offset !== undefined) params.append("offset", offset.toString());
        if (alltime !== undefined) params.append("alltime", alltime.toString());
        return `/analytics/getDailyReport?${params.toString()}`;
      },
      transformResponse: (response: []) => {
        return response;
      },
      providesTags: ["Analytics"],
    }),
    getEarningsGraph: builder.query<any, GetCollectionReportParams>({
      query: ({ start_date, end_date, alltime, limit, offset, type }: any) => {
        const params = new URLSearchParams();
        if (start_date !== undefined) {
          const dateStr =
            start_date instanceof Date
              ? start_date.toISOString().split("T")[0] // Gets just YYYY-MM-DD
              : start_date;
          params.append("start_date", dateStr);
        }

        if (end_date !== undefined) {
          const dateStr =
            end_date instanceof Date
              ? end_date.toISOString().split("T")[0] // Gets just YYYY-MM-DD
              : end_date;
          params.append("end_date", dateStr);
        }
        if (alltime !== undefined) params.append("alltime", alltime.toString());
        if (type) params.append("type", type);
        if (limit !== undefined) params.append("limit", limit.toString());
        if (offset !== undefined) params.append("offset", offset.toString());

        return `/analytics/getEarningsGraph?${params.toString()}`;
      },
      transformResponse: (response: []) => {
        return response;
      },
      providesTags: ["Analytics"],
    }),
    getUserSummary: builder.query<any, any>({
      query: ({ start_date, end_date, alltime }) => {
        const params = new URLSearchParams();

        if (start_date !== undefined) {
          const dateStr =
            start_date instanceof Date
              ? start_date.toISOString().split("T")[0] // Gets just YYYY-MM-DD
              : start_date;
          params.append("start_date", dateStr);
        }

        if (end_date !== undefined) {
          const dateStr =
            end_date instanceof Date
              ? end_date.toISOString().split("T")[0] // Gets just YYYY-MM-DD
              : end_date;
          params.append("end_date", dateStr);
        }
        if (alltime !== undefined) params.append("alltime", alltime.toString());
        return `/analytics/getUserSummary?${params}`;
      },
      transformResponse: (response: []) => {
        return response;
      },
      providesTags: ["Analytics"],
    })
  }),
});

export const {
  useGetAmountStatusQuery,
  useGetBrandReportQuery,
  useLazyGetBrandReportQuery,
  useGetCashbackDetailsMutation,
  useGetCollectionReportQuery,
  useLazyGetCollectionReportQuery,
  useGetDailyReportQuery,
  useGetLinkReportMutation,
  useGetOrderStatusQuery,
  useGetPostReportQuery,
  useGetProductReportQuery,
  useGetUserEarningWalletMutation,
  useLazyGetPostReportQuery,
  useGetTransactionReportQuery,
  useGetEarningsGraphQuery,
  useLazyGetEarningsGraphQuery,
  useGetUserSummaryQuery
} = analyticsApi;
