"use client";

import React from "react";
import { BarChart3, Activity } from "lucide-react";
import { SalesExecutiveDetail } from "@/types/api.types";

interface UserOverviewTabProps {
  user: SalesExecutiveDetail;
}

export const UserOverviewTab: React.FC<UserOverviewTabProps> = ({ user }) => {
  const statusEntries = Object.entries(user.statusBreakdown || {});
  const totalInBreakdown =
    statusEntries.reduce((acc, [, count]) => acc + count, 0) ||
    user.totalAssignedLeads ||
    1;

  const getStatusColor = (status: string) => {
    const map: Record<string, { bg: string; bar: string; text: string }> = {
      NEW: {
        bg: "bg-blue-50 dark:bg-blue-950/40",
        bar: "bg-blue-500",
        text: "text-blue-700 dark:text-blue-300",
      },
      ASSIGNED: {
        bg: "bg-sky-50 dark:bg-sky-950/40",
        bar: "bg-sky-500",
        text: "text-sky-700 dark:text-sky-300",
      },
      CONTACTED: {
        bg: "bg-blue-50 dark:bg-blue-950/40",
        bar: "bg-blue-500",
        text: "text-blue-700 dark:text-blue-300",
      },
      IN_PROGRESS: {
        bg: "bg-amber-50 dark:bg-amber-950/40",
        bar: "bg-amber-500",
        text: "text-amber-700 dark:text-amber-300",
      },
      QUALIFIED: {
        bg: "bg-purple-50 dark:bg-purple-950/40",
        bar: "bg-purple-500",
        text: "text-purple-700 dark:text-purple-300",
      },
      WON: {
        bg: "bg-emerald-50 dark:bg-emerald-950/40",
        bar: "bg-emerald-500",
        text: "text-emerald-700 dark:text-emerald-300",
      },
      LOST: {
        bg: "bg-rose-50 dark:bg-rose-950/40",
        bar: "bg-rose-500",
        text: "text-rose-700 dark:text-rose-300",
      },
    };

    return (
      map[status] || {
        bg: "bg-slate-50 dark:bg-slate-800",
        bar: "bg-slate-500",
        text: "text-slate-700 dark:text-slate-300",
      }
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
      {/* 1. Lead Pipeline Distribution */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 sm:p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3.5">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              Lead Status Distribution
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5">
              Breakdown of {user.totalAssignedLeads || 0} assigned leads across lifecycle stages
            </p>
          </div>
        </div>

        {statusEntries.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No pipeline distribution data available.
          </div>
        ) : (
          <div className="space-y-3 mt-3">
            {statusEntries.map(([status, count]) => {
              const colors = getStatusColor(status);
              const percentage = Math.round((count / totalInBreakdown) * 100);

              return (
                <div key={status} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {status}
                    </span>
                    <span className="text-slate-600 dark:text-slate-300 font-medium">
                      {count} leads ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${colors.bar}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Executive Performance & Workload Summary */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 sm:p-4 shadow-xs flex flex-col justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-1">
            <Activity className="w-4 h-4 text-blue-600" />
            Performance & SLA Summary
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mb-3.5">
            Operational workload status and pipeline velocity metrics
          </p>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 uppercase">
                Conversion Rate
              </span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {user.conversionRate || 0}%
                </span>
              </div>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 inline-block">
                {user.convertedLeads || 0} deals won
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 uppercase">
                Active Ratio
              </span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {user.totalAssignedLeads
                    ? Math.round(
                        ((user.activeLeads || 0) / user.totalAssignedLeads) * 100
                      )
                    : 0}
                  %
                </span>
              </div>
              <span className="text-[11px] text-slate-600 dark:text-slate-300 font-medium mt-1 inline-block">
                {user.activeLeads || 0} active in pipeline
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 uppercase">
                Follow-ups Status
              </span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {user.followUpsPending || 0}
                </span>
                <span className="text-xs text-slate-500 font-medium">pending</span>
              </div>
              <span
                className={`text-[11px] font-medium mt-1 inline-block ${
                  user.followUpsOverdue > 0
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {user.followUpsOverdue} overdue actions
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 uppercase">
                Workload Load
              </span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {user.capacityPercentage || 0}%
                </span>
              </div>
              <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium mt-1 inline-block">
                Status: {user.workloadStatus || "OPTIMAL"}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span>Total Pipeline Volume: {user.leads?.length || 0} records</span>
          <span>Recent Activities: {user.recentActivities?.length || 0}</span>
        </div>
      </div>
    </div>
  );
};
