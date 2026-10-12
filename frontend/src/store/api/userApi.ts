import { crmApi } from "./baseApi";
import type {
  ApiResponse,
  SalesExecutiveSummary,
  SalesExecutiveDetail,
  Conversation,
  ConversationMessage,
  MessageType,
} from "@/types/api.types";

export const userApi = crmApi.injectEndpoints({
  endpoints: (builder) => ({
    getSalesExecutives: builder.query<
      ApiResponse<SalesExecutiveSummary[]>,
      {
        search?: string;
        status?: string;
        workloadStatus?: string;
        page?: number;
        limit?: number;
      } | void
    >({
      query: (params) => ({
        url: "/users/sales-executives",
        params: params || {},
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({
                type: "Executives" as const,
                id,
              })),
              { type: "Executives", id: "LIST" },
            ]
          : [{ type: "Executives", id: "LIST" }],
      keepUnusedDataFor: 120,
    }),

    getSalesExecutiveById: builder.query<
      ApiResponse<SalesExecutiveDetail>,
      string
    >({
      query: (id) => `/users/sales-executives/${id}`,
      providesTags: (_result, _error, id) => [{ type: "ExecutiveDetail", id }],
      keepUnusedDataFor: 120,
    }),

    getUsers: builder.query<
      ApiResponse<SalesExecutiveSummary[]>,
      {
        search?: string;
        status?: string;
        workloadStatus?: string;
        page?: number;
        limit?: number;
        role?: string;
      } | void
    >({
      query: (params) => ({
        url: "/users/",
        params: params || {},
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({
                type: "Users" as const,
                id,
              })),
              { type: "Users", id: "LIST" },
            ]
          : [{ type: "Users", id: "LIST" }],
      keepUnusedDataFor: 120,
    }),

    getUserById: builder.query<ApiResponse<SalesExecutiveDetail>, string>({
      query: (id) => `/users/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Users", id }],
    }),

    toggleExecutiveStatus: builder.mutation<
      ApiResponse<{ id: string; isActive: boolean }>,
      { id: string; isActive: boolean }
    >({
      query: ({ id, ...body }) => ({
        url: `/users/sales-executives/${id}/status`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Executives", id },
        { type: "Executives", id: "LIST" },
        { type: "ExecutiveDetail", id },
        { type: "TeamLeaders", id },
        { type: "TeamLeaders", id: "LIST" },
        { type: "TeamLeaderDetail", id },
        "Workload",
      ],
    }),
    
    getExecutives: builder.query<ApiResponse<SalesExecutiveDetail[]>, void>({
      query: () => "/users",
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({
                type: "Executives" as const,
                id,
              })),
              { type: "Executives", id: "LIST" },
            ]
          : [{ type: "Executives", id: "LIST" }],
    }),
    toggleUserStatus: builder.mutation<
      ApiResponse<{ id: string; isActive: boolean }>,
      { id: string; isActive: boolean }
    >({
      query: ({ id, ...body }) => ({
        url: `/users/${id}/status`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Users", id },
        { type: "Users", id: "LIST" },
        { type: "Executives", id },
        { type: "Executives", id: "LIST" },
        { type: "TeamLeaders", id },
        { type: "TeamLeaders", id: "LIST" },
        "Workload",
      ],
    }),
    createUser: builder.mutation<
      ApiResponse<SalesExecutiveDetail>,
      { name: string; email: string; password?: string; role?: string }
    >({
      query: (body) => ({
        url: "/users",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "Users", id: "LIST" },
        { type: "Executives", id: "LIST" },
        { type: "TeamLeaders", id: "LIST" },
        "Workload",
      ],
    }),

    getConversations: builder.query<
      ApiResponse<Conversation[]>,
      { limit?: number; cursor?: string } | void
    >({
      query: (params) => ({
        url: "/conversations",
        params: params || {},
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({
                type: "Conversations" as const,
                id,
              })),
              { type: "Conversations", id: "LIST" },
            ]
          : [{ type: "Conversations", id: "LIST" }],
    }),

    createDirectConversation: builder.mutation<
      ApiResponse<Conversation>,
      { toUserId: string }
    >({
      query: (body) => ({
        url: "/conversations/direct",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Conversations", id: "LIST" }],
    }),

    getMessages: builder.query<
      ApiResponse<ConversationMessage[]>,
      { conversationId: string; limit?: number }
    >({
      query: ({ conversationId, limit }) => ({
        url: `/conversations/${conversationId}/messages`,
        params: limit ? { limit } : {},
      }),
      providesTags: (_result, _error, { conversationId }) => [
        { type: "Conversations", id: `MESSAGES_${conversationId}` },
      ],
    }),

    sendMessage: builder.mutation<
      ApiResponse<ConversationMessage>,
      {
        conversationId: string;
        content: string;
        type?: MessageType;
        message?: { content: string; type?: MessageType } | string;
      }
    >({
      query: ({ conversationId, content, type = "TEXT", message }) => ({
        url: `/conversations/${conversationId}/messages`,
        method: "POST",
        body: {
          content,
          type,
          message: message ?? { content, type },
        },
      }),
      invalidatesTags: (_result, _error, { conversationId }) => [
        { type: "Conversations", id: conversationId },
        { type: "Conversations", id: `MESSAGES_${conversationId}` },
        { type: "Conversations", id: "LIST" },
      ],
    }),

    sendAttachment: builder.mutation<
      ApiResponse<ConversationMessage>,
      { conversationId: string; file: File; caption?: string }
    >({
      query: ({ conversationId, file, caption }) => {
        const formData = new FormData();
        formData.append("file", file);
        if (caption) formData.append("caption", caption);
        return {
          url: `/conversations/${conversationId}/attachments`,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: (_result, _error, { conversationId }) => [
        { type: "Conversations", id: conversationId },
        { type: "Conversations", id: `MESSAGES_${conversationId}` },
        { type: "Conversations", id: "LIST" },
      ],
    }),
    markConversationAsRead: builder.mutation<
      ApiResponse<{ success: boolean }>,
      { conversationId: string }
    >({
      query: ({ conversationId }) => ({
        url: `/conversations/${conversationId}/read`,
        method: "PATCH",
      }),
      invalidatesTags: (_result, _error, { conversationId }) => [
        { type: "Conversations", id: conversationId },
        { type: "Conversations", id: "LIST" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetSalesExecutivesQuery,
  useLazyGetSalesExecutivesQuery,
  useGetSalesExecutiveByIdQuery,
  useLazyGetSalesExecutiveByIdQuery,
  useGetUsersQuery,
  useLazyGetUsersQuery,
  useGetUserByIdQuery,
  useLazyGetUserByIdQuery,
  useToggleExecutiveStatusMutation,
  useToggleUserStatusMutation,
  useGetExecutivesQuery,
  useCreateUserMutation,
  useGetConversationsQuery,
  useGetMessagesQuery,
  useLazyGetMessagesQuery,
  useCreateDirectConversationMutation,
  useSendMessageMutation,
  useSendAttachmentMutation,
  useMarkConversationAsReadMutation,
} = userApi;
