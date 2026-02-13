import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: JSON.parse(localStorage.getItem("user") || "null")
};

const authSlice = createSlice({
  name: "auth",
  initialState: initialState,
  reducers: {
    setAuth: (state, action) => {
      const payload = action.payload || {};
      state.user = payload.user || null;
      if (payload.user) localStorage.setItem("user", JSON.stringify(payload.user));
      if (payload.accessToken) localStorage.setItem("accessToken", payload.accessToken);
    },
    logout: (state) => {
      state.user = null;
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
    }
  }
});

export const { setAuth, logout } = authSlice.actions;
export default authSlice.reducer;
