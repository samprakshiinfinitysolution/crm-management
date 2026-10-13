"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  TrendingUp,
  Users,
  Target,
  Clock,
  ShieldCheck,
  IndianRupee,
} from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { UserRole } from "@/types/api.types";
import { useGetPerformanceReportQuery } from "@/store/api/leadApi";
import { ExecutivePerformanceMatrix } from "@/components/team_leader/reports";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";

const dateRanges = [
  {
    value: "7d",
    label: "Last 7 Days",
  },
  {
    value: "30d",
    label: "Last 30 Days",
  },
  {
    value: "90d",
    label: "Last Quarter",
  },
];

export default function PerformanceReportPage() {
  const [timeRange, setTimeRange] = useState("30d");
  const { data: performanceRes, isLoading } = useGetPerformanceReportQuery({
    timeRange,
  });

  const performanceData = performanceRes?.data;
  const summary = performanceData?.summary;
  const executives = performanceData?.executives || [];

  return (
    <ProtectedRoute allowedRoles={[UserRole.TEAM_LEADER, UserRole.ADMIN]}>
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        {/* Header and Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/reports"
              className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>Executive Performance Matrix</span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Staff throughput, win ratios, response velocity and SLA overdue
                metrics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Select
              value={timeRange}
              onValueChange={(v) => setTimeRange(v || "30d")}
            >
              <SelectTrigger className="h-9 w-36 min-w-36 shrink-0 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs">
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent align="end" className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200">
                {dateRanges.map((dr) => (
                  <SelectItem
                    key={dr.value}
                    value={dr.value}
                    className="cursor-pointer text-xs"
                  >
                    {dr.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Summary Metric KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
          {/* Total Staff */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-semibold">Active Staff</span>
              <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {summary ? summary.totalExecutives : "—"}
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
              {summary
                ? `${summary.totalAssigned} leads assigned`
                : "Loading..."}
            </span>
          </div>

          {/* Close / Win Rate */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-semibold">Close Rate</span>
              <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {summary ? `${summary.overallConversionRate}%` : "—"}
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
              {summary
                ? `${summary.totalWon} won / ${summary.totalLost} lost`
                : "Loading..."}
            </span>
          </div>

          {/* Avg Response Time */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-semibold">Avg Response</span>
              <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {summary ? `${summary.overallAvgResponseHours} hrs` : "—"}
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
              First touch turnaround
            </span>
          </div>

          {/* SLA Compliance */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-semibold">SLA Adherence</span>
              <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            </div>
            <div className="text-xl font-bold text-teal-600 dark:text-teal-400">
              {summary ? `${summary.overallSlaComplianceRate}%` : "—"}
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
              {summary
                ? `${summary.totalSlaBreaches} overdue breaches`
                : "Loading..."}
            </span>
          </div>

          {/* Won Revenue */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between col-span-2 md:col-span-1">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-semibold">Closed Revenue</span>
              <IndianRupee className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100 truncate">
              {summary
                ? `₹${Number(summary.totalWonRevenue).toLocaleString("en-IN")}`
                : "—"}
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
              {summary
                ? `₹${Number(summary.totalPipelineValue).toLocaleString("en-IN")} pipeline`
                : "Loading..."}
            </span>
          </div>
        </div>

        {/* Executive Performance Matrix Table */}
        <ExecutivePerformanceMatrix
          executives={executives}
          isLoading={isLoading}
        />
      </div>
    </ProtectedRoute>
  );
}
