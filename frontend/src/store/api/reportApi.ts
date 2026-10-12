import { crmApi } from './baseApi';
import type { ApiResponse, TLDashboardMetrics, SEDashboardMetrics, AdminDashboardMetrics } from '@/types/api.types';

export const reportApi = crmApi.injectEndpoints({
  endpoints: (build) => ({
    getTLDashboardMetrics: build.query<ApiResponse<TLDashboardMetrics>, void>({
      query: () => "/reports/dashboard-metrics/team-lead",
      providesTags: ["Metrics", "Dashboard"],
      keepUnusedDataFor: 45,
    }),
    getSEDashboardMetrics: build.query<ApiResponse<SEDashboardMetrics>, void>({
      query: () => "/reports/dashboard-metrics/sales-executive",
      providesTags: ["Metrics", "Dashboard"],
      keepUnusedDataFor: 45,
    }),
    getAdminDashboardMetrics: build.query<ApiResponse<AdminDashboardMetrics>, void>({
      query: () => "/reports/dashboard-metrics/admin",
      providesTags: ["Metrics", "Dashboard"],
      keepUnusedDataFor: 45,
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetTLDashboardMetricsQuery,
  useGetSEDashboardMetricsQuery,
  useGetAdminDashboardMetricsQuery,
} = reportApi;