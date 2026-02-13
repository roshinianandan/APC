import { createApi } from "@reduxjs/toolkit/query/react";
import { apiBaseQuery } from "../../services/apiBase";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: apiBaseQuery,
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (body) => ({
        url: "/api/auth/login",
        method: "POST",
        body: body
      })
    }),
    register: builder.mutation({
      query: (body) => ({
        url: "/api/auth/register",
        method: "POST",
        body: body
      })
    })
  })
});

export const { useLoginMutation, useRegisterMutation } = authApi;
