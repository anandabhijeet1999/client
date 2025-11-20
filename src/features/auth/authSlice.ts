import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import api from "../../api/client";
import type { User } from "../../types";

interface AuthResponse {
  user: User;
  accessToken: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  status: "idle" | "loading" | "error";
  error?: string;
}

const initialState: AuthState = {
  user: null,
  accessToken: localStorage.getItem("accessToken"),
  status: "idle",
};

export const registerUser = createAsyncThunk<AuthResponse, { name: string; email: string; password: string }>(
  "auth/register",
  async (payload) => {
    const { data } = await api.post<AuthResponse>("/auth/register", payload);
    return data;
  },
);

export const loginUser = createAsyncThunk<AuthResponse, { email: string; password: string }>(
  "auth/login",
  async (payload) => {
    const { data } = await api.post<AuthResponse>("/auth/login", payload);
    return data;
  },
);

export const fetchCurrentUser = createAsyncThunk<User>("auth/me", async () => {
  const { data } = await api.get<User>("/auth/me");
  return data;
});

export const updateUserProfile = createAsyncThunk<
  User,
  { name?: string; email?: string; phone?: string | null; address?: string | null; dateOfBirth?: string | null }
>("auth/updateProfile", async (payload) => {
  const { data } = await api.patch<User>("/auth/profile", payload);
  return data;
});

export const updateUserPassword = createAsyncThunk<void, { currentPassword: string; newPassword: string }>(
  "auth/updatePassword",
  async (payload) => {
    await api.patch("/auth/password", payload);
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.accessToken = null;
      localStorage.removeItem("accessToken");
    },
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = "idle";
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        localStorage.setItem("accessToken", action.payload.accessToken);
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = "error";
        state.error = action.error.message;
      })
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "idle";
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        localStorage.setItem("accessToken", action.payload.accessToken);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "error";
        state.error = action.error.message;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.user = null;
        state.accessToken = null;
        localStorage.removeItem("accessToken");
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(updateUserPassword.fulfilled, () => {
        // Password update doesn't change user data
      });
  },
});

export const { logout, setUser } = authSlice.actions;
export default authSlice.reducer;

