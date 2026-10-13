"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, PieChart as PieChartIcon, TrendingUp, BarChart3, Layers } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { UserRole } from "@/types/api.types";
import { useGetReportsSummaryQuery } from "@/store/api/leadApi";
import { FunnelAnalyticsCard } from "@/components/team_leader/reports";
import { ChartCard, PieChart, BarChart, AreaChart } from "@/components/ui/charts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function LeadsReportPage() {
  const [timeRange, setTimeRange] = useState("30d");
  const { data: reportsRes, isLoading } = useGetReportsSummaryQuery({
    timeRange,
  });

  const reportData = reportsRes?.data;
  const stages = useMemo(() => reportData?.funnel || [], [reportData?.funnel]);

  // Lead Sources Distribution for Pie Chart
  const sourceSegments = useMemo(() => {
    return [
      { label: "Meta Ads", count: 420, percentage: 42, color: "#6366f1" },
      { label: "Google Search", count: 280, percentage: 28, color: "#3b82f6" },
      { label: "Direct Referral", count: 180, percentage: 18, color: "#10b981" },
      { label: "Partner Network", count: 120, percentage: 12, color: "#f59e0b" },
    ];
  }, []);

  // Conversion Stage Bar Chart
  const stageBarData = useMemo(() => {
    return stages.map((s) => ({
      label: s.stage,
      value: s.count,
      formattedValue: `${s.count} leads`,
      color: s.stage === "WON" ? "#10b981" : "#4f46e5",
    }));
  }, [stages]);

  // Lead Inflow Area Chart Data
  const inflowAreaPoints = useMemo(() => {
    return [
      { label: "W1", value: 120, secondaryValue: 80 },
      { label: "W2", value: 190, secondaryValue: 140 },
      { label: "W3", value: 240, secondaryValue: 180 },
      { label: "W4", value: 310, secondaryValue: 220 },
      { label: "W5", value: 280, secondaryValue: 210 },
      { label: "W6", value: 390, secondaryValue: 310 },
    ];
  }, []);

  return (
    <ProtectedRoute allowedRoles={[UserRole.TEAM_LEADER, UserRole.ADMIN]}>
      <div className="mx-auto flex flex-col gap-6 text-slate-800 dark:text-slate-200">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/reports"
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-2xs cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>Lead Pipeline & Funnel Breakdown</span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                End-to-end sales lifecycle stage throughput and conversion drop-offs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={timeRange}
              onValueChange={(val) => {
                if (val) setTimeRange(val);
              }}
            >
              <SelectTrigger className="h-9 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 cursor-pointer shadow-2xs">
                <SelectValue placeholder="Select Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last Quarter</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Top Grid: Funnel Chart (Left) + Source Share Pie Chart (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <FunnelAnalyticsCard stages={stages} isLoading={isLoading} />
          </div>

          <div className="lg:col-span-5">
            <ChartCard
              title="Lead Source Distribution"
              subtitle="Breakdown by acquisition channel"
              icon={<Layers className="w-4 h-4" />}
              className="h-full"
            >
              <PieChart
                data={sourceSegments}
                totalLabel="TOTAL INBOUND"
                totalValue={1000}
                variant="donut"
                isLoading={isLoading}
              />
            </ChartCard>
          </div>
        </div>

        {/* Bottom Grid: Stage Volume Bar Chart (Left) + Inflow Velocity Area Chart (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6">
            <ChartCard
              title="Stage Volume Distribution"
              subtitle="Absolute lead counts by active stage"
              icon={<BarChart3 className="w-4 h-4" />}
            >
              <BarChart
                data={stageBarData}
                height={200}
                showValuesOnTop
                isLoading={isLoading}
              />
            </ChartCard>
          </div>

          <div className="lg:col-span-6">
            <ChartCard
              title="Lead Inflow Velocity"
              subtitle="Weekly lead generation vs qualified progression"
              icon={<TrendingUp className="w-4 h-4" />}
            >
              <AreaChart
                data={inflowAreaPoints}
                height={200}
                primaryLabel="Total Inflow"
                secondaryLabel="Qualified"
                primaryColor="#6366f1"
                secondaryColor="#10b981"
                isLoading={isLoading}
              />
            </ChartCard>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
