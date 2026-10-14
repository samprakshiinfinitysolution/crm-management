"use client";

import React from "react";
import {
  Users,
  TrendingUp,
  IndianRupee,
  Clock,
  AlertTriangle,
  Activity,
} from "lucide-react";

interface UserMetricCardsProps {
  metrics: {
    totalAssignedLeads: number;
    activeLeads: number;
    convertedLeads: number;
    lostLeads?: number;
    conversionRate: number;
    totalPipelineValue: number;
    followUpsPending: number;
    followUpsOverdue: number;
    capacityPercentage: number;
    workloadStatus: "OPTIMAL" | "NEAR_CAPACITY" | "OVERLOADED" | string;
  };
}

export const UserMetricCards: React.FC<UserMetricCardsProps> = ({ metrics }) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const workloadConfig = {
    OPTIMAL: {
      label: "Optimal Load",
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
      text: "text-emerald-700 dark:text-emerald-300",
      border: "border-emerald-200 dark:border-emerald-800",
    },
    NEAR_CAPACITY: {
      label: "Near Capacity",
      bg: "bg-amber-50 dark:bg-amber-950/40",
      text: "text-amber-700 dark:text-amber-300",
      border: "border-amber-200 dark:border-amber-800",
    },
    OVERLOADED: {
      label: "Overloaded",
      bg: "bg-rose-50 dark:bg-rose-950/40",
      text: "text-rose-700 dark:text-rose-300",
      border: "border-rose-200 dark:border-rose-800",
    },
  }[metrics.workloadStatus] || {
    label: metrics.workloadStatus || "Normal",
    bg: "bg-blue-50 dark:bg-blue-950/40",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-200 dark:border-blue-800",
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mb-4">
      {/* 1. Total Assigned & Active Leads */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 sm:p-4 shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
            Assigned Leads
          </span>
          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {metrics.totalAssignedLeads || 0}
          </span>
          <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
            ({metrics.activeLeads || 0} active)
          </span>
        </div>
        <div className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium flex items-center justify-between">
          <span>Converted: {metrics.convertedLeads || 0}</span>
          <span>Lost: {metrics.lostLeads || 0}</span>
        </div>
      </div>

      {/* 2. Total Pipeline Value */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 sm:p-4 shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
            Pipeline Value
          </span>
          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
            <IndianRupee className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5">
          <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {formatCurrency(metrics.totalPipelineValue)}
          </span>
        </div>
        <div className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Conversion Rate: <strong className="text-slate-900 dark:text-slate-100 font-bold">{metrics.conversionRate}%</strong></span>
        </div>
      </div>

      {/* 3. Follow-ups Queue */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 sm:p-4 shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
            Pending Follow-ups
          </span>
          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {metrics.followUpsPending || 0}
          </span>
          {metrics.followUpsOverdue > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900">
              <AlertTriangle className="w-3 h-3" />
              {metrics.followUpsOverdue} overdue
            </span>
          )}
        </div>
        <div className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
          {metrics.followUpsOverdue > 0
            ? "Requires urgent follow-up action"
            : "All scheduled follow-ups on track"}
        </div>
      </div>

      {/* 4. Capacity & Workload Status */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 sm:p-4 shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
            Workload Capacity
          </span>
          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
            <Activity className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5 flex items-center justify-between">
          <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {metrics.capacityPercentage || 0}%
          </span>
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${workloadConfig.bg} ${workloadConfig.text} ${workloadConfig.border}`}
          >
            {workloadConfig.label}
          </span>
        </div>
        <div className="mt-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              metrics.capacityPercentage > 85
                ? "bg-rose-500"
                : metrics.capacityPercentage > 60
                ? "bg-amber-500"
                : "bg-blue-600"
            }`}
            style={{ width: `${Math.min(100, metrics.capacityPercentage || 0)}%` }}
          />
        </div>
      </div>
    </div>
  );
};
