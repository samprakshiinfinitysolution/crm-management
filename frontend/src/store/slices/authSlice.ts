import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthUser } from "@/types/api.types";

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  isLoggingOut: boolean;
  authMode: "login" | "register";
  selectedRole: "tl" | "exec";
}

const initialState: AuthState = {
  user: null,
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
      action: PayloadAction<{ user: AuthUser; token?: string | null }>,
    ) => {
      state.user = action.payload.user;
      const incomingToken =
        action.payload.token ?? action.payload.user.token ?? state.token ?? null;
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
    logout: (state) => {
      state.user = null;
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
  logout,
  setLoggingOut,
  setLoading,
  setInitialized,
  setAuthMode,
  setSelectedRole,
} = authSlice.actions;

export default authSlice.reducer;
