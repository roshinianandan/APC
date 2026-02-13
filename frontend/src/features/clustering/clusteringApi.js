import { createApi } from "@reduxjs/toolkit/query/react";
import { apiBaseQuery } from "../../services/apiBase";

export const clusteringApi = createApi({
  reducerPath: "clusteringApi",
  baseQuery: apiBaseQuery,
  endpoints: (builder) => ({
    runClustering: builder.mutation({
      query: (body) => ({ url: "/api/clustering/run", method: "POST", body: body })
    }),
    latestRun: builder.query({
      query: (arg) => "/api/clustering/latest?department=" + encodeURIComponent(arg.department) + "&term=" + encodeURIComponent(arg.term)
    }),
    myCluster: builder.query({
      query: (term) => "/api/clustering/me?term=" + encodeURIComponent(term)
    })
  })
});

export const { useRunClusteringMutation, useLatestRunQuery, useMyClusterQuery } = clusteringApi;
