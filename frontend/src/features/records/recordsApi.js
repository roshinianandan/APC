import { createApi } from "@reduxjs/toolkit/query/react";
import { apiBaseQuery } from "../../services/apiBase";

export const recordsApi = createApi({
  reducerPath: "recordsApi",
  baseQuery: apiBaseQuery,
  tagTypes: ["Records"],
  endpoints: (builder) => ({
    // faculty/admin: POST /api/records  ✅
    upsertRecord: builder.mutation({
      query: (body) => ({
        url: "/api/records",
        method: "POST",
        body: body
      }),
      invalidatesTags: ["Records"]
    }),

    // faculty/admin: GET /api/records?department=...&term=... ✅
    listRecords: builder.query({
      query: (arg) =>
        "/api/records?department=" +
        encodeURIComponent(arg.department) +
        "&term=" +
        encodeURIComponent(arg.term),
      providesTags: ["Records"]
    }),

    // faculty/admin: DELETE /api/records/:id ✅
    deleteRecord: builder.mutation({
      query: (id) => ({
        url: "/api/records/" + id,
        method: "DELETE"
      }),
      invalidatesTags: ["Records"]
    }),

    // student: GET /api/records/my?term=... ✅ (FIXED)
    myRecord: builder.query({
      query: (term) => "/api/records/my?term=" + encodeURIComponent(term)
    }),

    // student: GET /api/records/my-cluster?term=...&department=... ✅
    myCluster: builder.query({
      query: (arg) =>
        "/api/records/my-cluster?term=" +
        encodeURIComponent(arg.term) +
        "&department=" +
        encodeURIComponent(arg.department)
    })
  })
});

export const {
  useUpsertRecordMutation,
  useListRecordsQuery,
  useDeleteRecordMutation,
  useMyRecordQuery,
  useMyClusterQuery
} = recordsApi;
