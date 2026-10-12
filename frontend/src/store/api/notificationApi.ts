import { crmApi } from './baseApi';
import type { ApiResponse } from '@/types/api.types';

export interface NotificationItem {
  id: string;
  recipientUserId: string;
  title: string;
  message: string;
  type: string;
  link?: string | null;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
}

export const notificationApi = crmApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<ApiResponse<NotificationItem[]>, void>({
      query: () => '/notifications',
      providesTags: ['Notifications'],
      keepUnusedDataFor: 30,
    }),
    markNotificationRead: builder.mutation<ApiResponse<NotificationItem>, string>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Notifications'],
    }),
    markAllNotificationsRead: builder.mutation<ApiResponse<{ success: boolean }>, void>({
      query: () => ({
        url: '/notifications/read-all',
        method: 'PATCH',
      }),
      invalidatesTags: ['Notifications'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} = notificationApi;
