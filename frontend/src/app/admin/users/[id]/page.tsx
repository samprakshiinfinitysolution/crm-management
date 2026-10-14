"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Layers,
  ListTodo,
  History,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import { useGetUserByIdQuery } from "@/store";
import {
  UserHeader,
  UserMetricCards,
  UserOverviewTab,
  UserLeadsTab,
  UserFollowUpsTab,
  UserActivityTimelineTab,
} from "@/components/admin/user-detail";

type TabType = "overview" | "leads" | "followups" | "activities";

export default function UserDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [activeTab, setActiveTab] = useState<TabType>("overview");

  const {
    data: userRes,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetUserByIdQuery(id, {
    skip: !id,
  });

  const user = userRes?.data;

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 p-6">
        <div className="max-w-7xl mx-auto space-y-3.5">
          {/* Header Skeleton */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800" />
              <div className="space-y-2 flex-1">
                <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
                <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
              </div>
            </div>
          </div>

          {/* KPI Cards Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 h-28 animate-pulse"
              >
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2 mb-3" />
                <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
              </div>
            ))}
          </div>

          {/* Content Box Skeleton */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 h-96 animate-pulse" />
        </div>
      </div>
    );
  }

  // 2. Error State
  if (error || !user) {
    const errorMsg =
      (error as { data?: { message?: string } })?.data?.message ||
      "Unable to find the requested user profile or you do not have permission to view it.";

    return (
      <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 p-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center shadow-lg">
          <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            User Not Found
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 mb-6">
            {errorMsg}
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/admin/users"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Users
            </Link>
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Tab Configuration
  const tabs = [
    {
      id: "overview" as TabType,
      label: "Overview & Performance",
      icon: LayoutDashboard,
      count: undefined,
    },
    {
      id: "leads" as TabType,
      label: "Assigned Leads",
      icon: Layers,
      count: user.leads?.length ?? user.totalAssignedLeads ?? 0,
    },
    {
      id: "followups" as TabType,
      label: "Follow-ups",
      icon: ListTodo,
      count: user.upcomingFollowUps?.length ?? 0,
    },
    {
      id: "activities" as TabType,
      label: "Activity Log",
      icon: History,
      count: user.recentActivities?.length ?? 0,
    },
  ];

  return (
    <div className="bg-slate-50/50 dark:bg-slate-950 p-4 sm:p-6 lg:p-0">
      <div className="max-w-7xl mx-auto space-y-3.5">
        {/* Reusable Header */}
        <UserHeader
          user={{
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
            createdAt: user.createdAt,
          }}
          onRefresh={refetch}
          isRefreshing={isFetching}
        />

        {/* Reusable KPI Metric Cards */}
        <UserMetricCards
          metrics={{
            totalAssignedLeads: user.totalAssignedLeads ?? 0,
            activeLeads: user.activeLeads ?? 0,
            convertedLeads: user.convertedLeads ?? 0,
            lostLeads: user.lostLeads ?? 0,
            conversionRate: user.conversionRate ?? 0,
            totalPipelineValue: user.totalPipelineValue ?? 0,
            followUpsPending: user.followUpsPending ?? 0,
            followUpsOverdue: user.followUpsOverdue ?? 0,
            capacityPercentage: user.capacityPercentage ?? 0,
            workloadStatus: user.workloadStatus ?? "OPTIMAL",
          }}
        />

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-px">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all border-b-2 shrink-0 ${
                  isActive
                    ? "border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 border-x border-t border-slate-200 dark:border-slate-800"
                    : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-800/40"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {typeof tab.count === "number" && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                      isActive
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div>
          {activeTab === "overview" && <UserOverviewTab user={user} />}

          {activeTab === "leads" && (
            <UserLeadsTab leads={user.leads || []} />
          )}

          {activeTab === "followups" && (
            <UserFollowUpsTab followUps={user.upcomingFollowUps || []} />
          )}

          {activeTab === "activities" && (
            <UserActivityTimelineTab
              activities={user.recentActivities || []}
            />
          )}
        </div>
      </div>
    </div>
  );
}