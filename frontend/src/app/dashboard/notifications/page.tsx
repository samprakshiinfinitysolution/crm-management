"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  CheckCheck,
  RefreshCw,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  type NotificationItem,
} from "@/store/api/notificationApi";
import { useAppSelector } from "@/store";
import { UserRole } from "@/types/api.types";
import {
  getNotificationLink,
  getNotificationMeta,
} from "@/lib/notificationUtils";
import { NotificationSkeleton } from "@/components/ui/NotificationSkelation";
import { PageHeader } from "@/components/shared/PageHeader";

export default function NotificationsCenterPage() {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const isTL = user?.role === UserRole.TEAM_LEADER;

  const {
    data: notifRes,
    isLoading,
    isFetching,
    refetch,
  } = useGetNotificationsQuery();
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead, { isLoading: isMarkingAll }] =
    useMarkAllNotificationsReadMutation();

  const [filter, setFilter] = useState<"all" | "unread">("all");

  const notifications = notifRes?.data || [];
  const filtered = notifications.filter((n) =>
    filter === "unread" ? !n.isRead : true,
  );
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkRead = async (id: string) => {
    try {
      await markRead(id).unwrap();
    } catch {
      toast.error("Failed to mark notification as read");
    }
  };

  const handleMarkAll = async () => {
    try {
      await markAllRead().unwrap();
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark all as read");
    }
  };

  const handleNotificationClick = (item: NotificationItem) => {
    if (!item.isRead) {
      handleMarkRead(item.id);
    }
    const targetUrl = getNotificationLink(item, isTL);
    router.push(targetUrl);
  };

  return (
    <div className="w-full flex flex-col gap-3.5">
      {/* Header */}
      <PageHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Notifications" },
        ]}
        title="Notification Alerts"
        description="Real-time feed of lead assignments, upcoming follow-up deadlines, and pipeline updates."
        actions={
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAll}
                disabled={isMarkingAll}
                className="px-3.5 py-2 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all disabled:opacity-50 cursor-pointer"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Mark All as Read ({unreadCount})</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => refetch()}
              className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-2xs transition-all cursor-pointer"
              title="Refresh alerts"
            >
              <RefreshCw
                className={`w-4 h-4 ${isFetching ? "animate-spin text-blue-600 dark:text-blue-400" : ""}`}
              />
            </button>
          </div>
        }
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            filter === "all"
              ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          All Alerts ({notifications.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter("unread")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            filter === "unread"
              ? "bg-blue-600 text-white"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          Unread Only ({unreadCount})
        </button>
      </div>

      {/* Notification List */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-800 shadow-xs divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
        {isLoading ? (
          <NotificationSkeleton />
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-slate-400 dark:text-slate-500 flex flex-col items-center gap-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 stroke-[1.5]" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              All caught up!
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              No new alerts or pending tasks require your attention.
            </p>
          </div>
        ) : (
          filtered.map((item) => {
            const meta = getNotificationMeta(item.type);
            return (
              <div
                key={item.id}
                onClick={() => handleNotificationClick(item)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleNotificationClick(item);
                  }
                }}
                className={`p-4 flex items-start justify-between gap-4 transition-colors cursor-pointer group ${
                  item.isRead
                    ? "bg-white dark:bg-slate-900 hover:bg-slate-50/80 dark:hover:bg-slate-800/60"
                    : "bg-blue-50/30 dark:bg-blue-950/20 hover:bg-blue-50/70 dark:hover:bg-blue-950/40"
                }`}
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div
                    className={`w-8 h-8 rounded-lg ${meta.iconBg} flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform`}
                  >
                    <meta.Icon className={`w-4 h-4 ${meta.iconColor}`} />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {item.title}
                      </span>
                      {!item.isRead && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 ring-2 ring-blue-100 dark:ring-blue-900 shrink-0" />
                      )}
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                        {meta.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                      {item.message}
                    </p>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-center">
                  {!item.isRead && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkRead(item.id);
                      }}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 shrink-0 cursor-pointer"
                    >
                      Mark read
                    </button>
                  )}
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
