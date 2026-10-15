import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { setAccessToken, logout } from "../slices/authSlice";
import { handleUnauthorized } from "@/lib/sessionGuard";
import type { RootState } from "../store";

const getApiBaseUrl = (): string => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  // In production browser, route through Next.js proxy rewrites (/api)
  if (typeof window !== "undefined" && window.location.hostname !== "localhost") {
    return "/api";
  }
  return "http://localhost:5000/api";
};

const API_BASE_URL = getApiBaseUrl();

/**
 * 1. Raw Base Query:
 * - credentials: 'include' automatically transmits the HTTP-Only refresh cookie.
 * - prepareHeaders attaches the in-memory Access Token from Redux auth slice.
 */
export const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;
    const token = state?.auth?.accessToken || state?.auth?.token;
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

/**
 * Concurrency Lock:
 * Collapses simultaneous 401s from parallel queries into a SINGLE /api/refresh call.
 */
let refreshPromise: Promise<string | null> | null = null;

/**
 * 2. Custom baseQueryWithReauth:
 * Catches 401 or 403, calls /api/refresh with the HTTP-Only cookie,
 * updates Redux in-memory state with the new Access Token, and retries the original query.
 */
export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  // Step 1: Execute initial request
  let result = await rawBaseQuery(args, api, extraOptions);

  // Step 2: Handle expired/invalid token (401 or 403)
  if (result.error && (result.error.status === 401 || result.error.status === 403)) {
    const url = typeof args === "string" ? args : args.url;

    // Do not attempt refresh on auth endpoints to prevent loops
    const isAuthEndpoint =
      url.includes("/login") ||
      url.includes("/register") ||
      url.includes("/logout") ||
      url.includes("/refresh");

    if (!isAuthEndpoint) {
      // Step 3: Concurrency handling - ensure only one refresh request runs
      if (!refreshPromise) {
        refreshPromise = (async () => {
          try {
            const refreshResult = await rawBaseQuery(
              { url: "/refresh", method: "POST" },
              api,
              extraOptions
            );

            if (refreshResult.data) {
              const res = refreshResult.data as {
                success: boolean;
                data: { accessToken?: string; token?: string };
              };
              const newAccessToken = res.data?.accessToken || res.data?.token;

              if (newAccessToken) {
                // Update in-memory Access Token in Redux store
                api.dispatch(setAccessToken(newAccessToken));
                return newAccessToken;
              }
            }

            // Refresh failed (refresh token expired/revoked) => Force logout
            api.dispatch(logout());
            if (typeof window !== "undefined") {
              handleUnauthorized(url);
            }
            return null;
          } catch {
            api.dispatch(logout());
            if (typeof window !== "undefined") {
              handleUnauthorized(url);
            }
            return null;
          } finally {
            refreshPromise = null;
          }
        })();
      }

      // Await single-flight refresh operation
      const newAccessToken = await refreshPromise;

      if (newAccessToken) {
        // Step 4: Retry initial failed query with the new Access Token
        result = await rawBaseQuery(args, api, extraOptions);
      }
    } else if (result.error.status === 401 && typeof window !== "undefined") {
      handleUnauthorized(url);
    }
  }

  return result;
};

/**
 * RTK Query Base API Slice
 * Centralizes network configuration, authentication tokens, credentials, and cache tags.
 */
export const crmApi = createApi({
  reducerPath: "crmApi",
  baseQuery: baseQueryWithReauth,
  refetchOnFocus: false, // Prevents thundering herd reload when switching browser tabs
  refetchOnReconnect: true,
  keepUnusedDataFor: 60, // 60s default cache duration for inactive queries
  tagTypes: [
    "Auth",
    "Leads",
    "Lead",
    "Distribution",
    "Workload",
    "Escalations",
    "Metrics",
    "Executives",
    "ExecutiveDetail",
    "TeamLeaders",
    "TeamLeaderDetail",
    "Dashboard",
    "FollowUp",
    "FollowUpSummary",
    "Imports",
    "AuditLogs",
    "Notifications",
    "Users",
    "Conversations",
  ],
  endpoints: () => ({}),
});
