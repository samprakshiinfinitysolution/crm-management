import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthUser } from "@/types/api.types";

export interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  token: string | null; // backwards-compatible alias for existing consumers
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  isLoggingOut: boolean;
  authMode: "login" | "register";
  selectedRole: "tl" | "exec";
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  isLoggingOut: false,
  authMode: "login",
  selectedRole: "exec",
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        user: AuthUser;
        accessToken?: string | null;
        token?: string | null;
      }>,
    ) => {
      state.user = action.payload.user;
      const incomingToken =
        action.payload.accessToken ??
        action.payload.token ??
        action.payload.user.token ??
        state.accessToken ??
        null;
      state.accessToken = incomingToken;
      state.token = incomingToken;
      if (incomingToken && typeof window !== "undefined") {
        try {
          localStorage.setItem("crm_auth_token", incomingToken);
        } catch {
          // Ignore storage access errors in private browsing modes
        }
      }
      state.isAuthenticated = true;
      state.isLoading = false;
      state.isInitialized = true;
      state.isLoggingOut = false;
    },
    setAccessToken: (state, action: PayloadAction<string | null>) => {
      state.accessToken = action.payload;
      state.token = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.token = null;
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem("crm_auth_token");
        } catch {
          // Ignore storage access errors in private browsing modes
        }
      }
      state.isAuthenticated = false;
      state.isLoading = false;
      state.isInitialized = true;
      state.isLoggingOut = true;
    },
    setLoggingOut: (state, action: PayloadAction<boolean>) => {
      state.isLoggingOut = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setInitialized: (state, action: PayloadAction<boolean>) => {
      state.isInitialized = action.payload;
    },
    setAuthMode: (state, action: PayloadAction<"login" | "register">) => {
      state.authMode = action.payload;
    },
    setSelectedRole: (state, action: PayloadAction<"tl" | "exec">) => {
      state.selectedRole = action.payload;
    },
  },
});

export const {
  setCredentials,
  setAccessToken,
  logout,
  setLoggingOut,
  setLoading,
  setInitialized,
  setAuthMode,
  setSelectedRole,
} = authSlice.actions;

export const selectCurrentToken = (state: { auth: AuthState }) =>
  state.auth.accessToken ?? state.auth.token;
export const selectCurrentUser = (state: { auth: AuthState }) =>
  state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.isAuthenticated;

export default authSlice.reducer;
