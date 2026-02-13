import { createApi } from "@reduxjs/toolkit/query/react";
import { apiBaseQuery } from "../../services/apiBase";

export const usersApi = createApi({
  reducerPath: "usersApi",
  baseQuery: apiBaseQuery,
  tagTypes: ["Users"],
  endpoints: (builder) => ({
    listUsers: builder.query({
      query: () => "/api/users",
      providesTags: ["Users"]
    }),
    createUser: builder.mutation({
      query: (body) => ({ url: "/api/users", method: "POST", body: body }),
      invalidatesTags: ["Users"]
    }),
    setUserActive: builder.mutation({
      query: (arg) => ({
        url: "/api/users/" + arg.id + "/active",
        method: "PATCH",
        body: { isActive: arg.isActive }
      }),
      invalidatesTags: ["Users"]
    })
  })
});

export const { useListUsersQuery, useCreateUserMutation, useSetUserActiveMutation } = usersApi;
