import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";

import { authApi } from "../features/auth/authApi";
import { usersApi } from "../features/users/usersApi";
import { recordsApi } from "../features/records/recordsApi";
import { clusteringApi } from "../features/clustering/clusteringApi";
import { studentsApi } from "../features/students/studentsApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
    [recordsApi.reducerPath]: recordsApi.reducer,
    [clusteringApi.reducerPath]: clusteringApi.reducer,
    [studentsApi.reducerPath]: studentsApi.reducer
  },
  middleware: (getDefault) =>
    getDefault().concat(
      authApi.middleware,
      usersApi.middleware,
      recordsApi.middleware,
      clusteringApi.middleware,
      studentsApi.middleware
    )
});
