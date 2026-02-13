import { createApi } from "@reduxjs/toolkit/query/react";
import { apiBaseQuery } from "../../services/apiBase";

export const studentsApi = createApi({
  reducerPath: "studentsApi",
  baseQuery: apiBaseQuery,
  endpoints: (builder) => ({
    myProfile: builder.query({
      query: () => "/api/students/me"
    }),
    upsertProfile: builder.mutation({
      query: (body) => ({ url: "/api/students/profile", method: "POST", body: body })
    })
  })
});

export const { useMyProfileQuery, useUpsertProfileMutation } = studentsApi;
