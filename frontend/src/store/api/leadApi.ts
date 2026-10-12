import { crmApi } from './baseApi';
import type {
  ApiResponse,
  LeadItem,
  LeadFilterParams,
  LeadStatus,
  DistributionPayload,
  DistributionResult,
  ExecutiveWorkloadItem,
  CriticalEscalationItem,
  PipelineMetrics,
  ReportSummaryData,
  ReportQueryParams,
  ImportPreviewResult,
  CommitImportPayload,
  CommitImportResult,
  ImportBatchSummary,
  PerformanceReportData,
  LeadNoteItem,
  AddLeadNotePayload,
} from '@/types/api.types';

export const leadApi = crmApi.injectEndpoints({
  endpoints: (builder) => ({
    getLeads: builder.query<ApiResponse<LeadItem[]>, LeadFilterParams | void>({
      query: (params) => ({
        url: "/leads",
        params: params || {},
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: "Lead" as const, id })),
              { type: "Leads", id: "LIST" },
            ]
          : [{ type: "Leads", id: "LIST" }],
      keepUnusedDataFor: 60,
    }),

    getLeadById: builder.query<ApiResponse<LeadItem>, string>({
      query: (id) => `/leads/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Lead", id }],
      keepUnusedDataFor: 60,
    }),

    createLead: builder.mutation<ApiResponse<LeadItem>, Partial<LeadItem>>({
      query: (newLead) => ({
        url: "/leads",
        method: "POST",
        body: newLead,
      }),
      invalidatesTags: [{ type: "Leads", id: "LIST" }, "Metrics"],
    }),

    updateLeadStatus: builder.mutation<
      ApiResponse<LeadItem>,
      { id: string; status: LeadStatus; note?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/leads/${id}/status`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Lead", id },
        { type: "Leads", id: "LIST" },
        "Metrics",
        "Workload",
      ],
    }),

    updateBulkLeadStatus: builder.mutation<
      ApiResponse<{ updatedCount: number; status: LeadStatus }>,
      { leadIds: string[]; status: LeadStatus; note: string }
    >({
      query: (body) => ({
        url: "/leads/bulk/status",
        method: "PATCH",
        body,             
      }),
      invalidatesTags: [
        { type: "Leads", id: "LIST" },
        "Metrics",
        "Workload",
      ],
    }),

    distributeLeads: builder.mutation<
      ApiResponse<DistributionResult>,
      DistributionPayload
    >({
      query: (payload) => ({
        url: "/leads/distribute",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: [
        { type: "Leads", id: "LIST" },
        "Distribution",
        "Workload",
        "Metrics",
      ],
    }),

    getExecutiveWorkload: builder.query<
      ApiResponse<ExecutiveWorkloadItem[]>,
      void
    >({
      query: () => "/leads/workload",
      providesTags: ["Workload"],
    }),

    getCriticalEscalations: builder.query<
      ApiResponse<CriticalEscalationItem[]>,
      void
    >({
      query: () => "/leads/escalations",
      providesTags: ["Escalations"],
    }),

    getPipelineMetrics: builder.query<ApiResponse<PipelineMetrics>, void>({
      query: () => "/leads/metrics",
      providesTags: ["Metrics"],
    }),

    getReportsSummary: builder.query<
      ApiResponse<ReportSummaryData>,
      ReportQueryParams | void
    >({
      query: (params) => ({
        url: "/reports/leads",
        params: params || {},
      }),
      providesTags: ["Metrics", "Workload", "Leads"],
    }),

    postImportFile: builder.mutation<
      ApiResponse<ImportPreviewResult>,
      FormData
    >({
      query: (formData) => ({
        url: "/imports/upload",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: [{ type: "Leads", id: "LIST" }, "Metrics"],
    }),

    commitImport: builder.mutation<
      ApiResponse<CommitImportResult>,
      CommitImportPayload
    >({
      query: (payload) => ({
        url: "/imports/commit",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: [
        { type: "Leads", id: "LIST" },
        "Metrics",
        "Workload",
        "Imports",
      ],
    }),

    recallLeads: builder.mutation<
      ApiResponse<{ recalledCount: number }>,
      { leadIds: string[]; reason?: string }
    >({
      query: (payload) => ({
        url: "/leads/recall",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: (_result, _error, { leadIds }) => [
        ...(leadIds || []).map((id) => ({ type: "Lead" as const, id })),
        { type: "Leads", id: "LIST" },
        "Metrics",
        "Workload",
        "Distribution",
        "Executives",
        "ExecutiveDetail",
      ],
    }),

    reassignLeads: builder.mutation<
      ApiResponse<{ reassignedCount: number; targetExecutive: string }>,
      { leadIds: string[]; targetExecutiveId: string; reason?: string }
    >({
      query: (payload) => ({
        url: "/leads/reassign",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: (_result, _error, { leadIds }) => [
        ...(leadIds || []).map((id) => ({ type: "Lead" as const, id })),
        { type: "Leads", id: "LIST" },
        "Metrics",
        "Workload",
        "Distribution",
        "Executives",
        "ExecutiveDetail",
      ],
    }),

    getPerformanceReport: builder.query<
      ApiResponse<PerformanceReportData>,
      { timeRange?: string; executiveId?: string; fromDate?: string; toDate?: string } | void
    >({
      query: (params) => ({
        url: "/reports/performance",
        params: params || {},
      }),
      providesTags: ["Metrics", "Workload", "Executives"],
    }),

    getImportBatches: builder.query<
      ApiResponse<ImportBatchSummary[]>,
      { page?: number; limit?: number } | void
    >({
      query: (params) => ({
        url: "/imports/batches",
        params: params || {},
      }),
      providesTags: ["Imports"],
    }),

    getImportBatchById: builder.query<ApiResponse<ImportBatchSummary>, string>({
      query: (id) => `/imports/batches/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Imports", id }],
    }),

    addLeadNote: builder.mutation<ApiResponse<LeadNoteItem>, AddLeadNotePayload>({
      query: ({ id, note }) => ({
        url: `/leads/${id}/notes`,
        method: "POST",
        body: { note },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Lead", id },
        { type: "Leads", id: "LIST" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetLeadsQuery,
  useLazyGetLeadsQuery,
  useGetLeadByIdQuery,
  useCreateLeadMutation,
  useUpdateLeadStatusMutation,
  useUpdateBulkLeadStatusMutation,
  useDistributeLeadsMutation,
  useGetExecutiveWorkloadQuery,
  useGetCriticalEscalationsQuery,
  useGetPipelineMetricsQuery,
  useGetReportsSummaryQuery,
  useGetPerformanceReportQuery,
  usePostImportFileMutation,
  useCommitImportMutation,
  useRecallLeadsMutation,
  useReassignLeadsMutation,
  useGetImportBatchesQuery,
  useGetImportBatchByIdQuery,
  useAddLeadNoteMutation,
} = leadApi;



