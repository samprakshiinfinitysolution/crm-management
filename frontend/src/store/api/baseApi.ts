import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { handleUnauthorized } from "@/lib/sessionGuard";

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

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  credentials: "include", // Includes HTTPs-only cookies
});

// Delegates all 401 (session-expiry) handling to the shared, idempotent guard.
// This collapses concurrent 401s into a single logout/redirect and prevents
// refresh loops. See lib/sessionGuard.ts.
const baseQueryWithSessionManagement: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401 && typeof window !== "undefined") {
    const endpoint = typeof args === "string" ? args : args.url;
    handleUnauthorized(endpoint);
  }

  return result;
};

/**
 * RTK Query Base API Slice
 * Centralizes network configuration, authentication tokens, credentials, and cache tags.
 */
export const crmApi = createApi({
  reducerPath: "crmApi",
  baseQuery: baseQueryWithSessionManagement,
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
