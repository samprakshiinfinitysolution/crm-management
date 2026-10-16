"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  TrendingUp,
  BarChart3,
  Layers,
  ChevronRight,
  ChevronDown,
  Loader2,
  Filter,
  FileSpreadsheet,
  FileText,
  Check,
} from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { UserRole } from "@/types/api.types";
import { useGetReportsSummaryQuery } from "@/store/api/leadApi";
import dynamic from "next/dynamic";
import { ChartCard, ChartSkeleton } from "@/components/ui/charts";

// Code splitting: Heavy SVG charts are loaded dynamically with zero layout-shift skeleton
const FunnelAnalyticsCard = dynamic(
  () =>
    import("@/components/team_leader/reports/FunnelAnalyticsCard").then(
      (m) => m.FunnelAnalyticsCard
    ),
  {
    loading: () => <ChartSkeleton height="h-72" />,
    ssr: false,
  }
);

const PieChart = dynamic(
  () => import("@/components/ui/charts/PieChart").then((m) => m.PieChart),
  {
    loading: () => <ChartSkeleton height="h-64" />,
    ssr: false,
  }
);

const BarChart = dynamic(
  () => import("@/components/ui/charts/BarChart").then((m) => m.BarChart),
  {
    loading: () => <ChartSkeleton height="h-64" />,
    ssr: false,
  }
);

const AreaChart = dynamic(
  () => import("@/components/ui/charts/AreaChart").then((m) => m.AreaChart),
  {
    loading: () => <ChartSkeleton height="h-64" />,
    ssr: false,
  }
);
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { downloadReportsExport } from "@/lib/exportUtils";

const dateRanges = [
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "90d", label: "Last Quarter" },
];

export default function LeadsReportPage() {
  const [timeRange, setTimeRange] = useState("30d");
  const [selectedFormat, setSelectedFormat] = useState<"xlsx" | "csv">("xlsx");
  const [exportMenuOpen, setExportMenuOpen] = useState<boolean>(false);
  const [exportingFormat, setExportingFormat] = useState<"xlsx" | "csv" | null>(
    null,
  );
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Close export dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        exportMenuRef.current &&
        !exportMenuRef.current.contains(event.target as Node)
      ) {
        setExportMenuOpen(false);
      }
    };
    if (exportMenuOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [exportMenuOpen]);

  const { data: reportsRes, isLoading } = useGetReportsSummaryQuery({
    timeRange,
  });

  const reportData = reportsRes?.data;
  const stages = useMemo(() => reportData?.funnel || [], [reportData?.funnel]);

  // Lead Sources Distribution for Pie Chart
  const sourceSegments = useMemo(() => {
    return [
      { label: "Meta Ads", count: 420, percentage: 42, color: "#2874f0" },
      { label: "Google Search", count: 280, percentage: 28, color: "#00a65a" },
      {
        label: "Direct Referral",
        count: 180,
        percentage: 18,
        color: "#f3a847",
      },
      {
        label: "Partner Network",
        count: 120,
        percentage: 12,
        color: "#8b5cf6",
      },
    ];
  }, []);

  // Conversion Stage Bar Chart
  const stageBarData = useMemo(() => {
    return stages.map((s) => ({
      label: s.stage,
      value: s.count,
      formattedValue: `${s.count} leads`,
      color: s.stage === "WON" ? "#00a65a" : "#2874f0",
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

  const handleExport = async (format: "xlsx" | "csv" = selectedFormat) => {
    setSelectedFormat(format);
    setExportingFormat(format);
    setExportMenuOpen(false);
    try {
      await downloadReportsExport({ timeRange, format });
    } finally {
      setExportingFormat(null);
    }
  };

  return (
    <ProtectedRoute allowedRoles={[UserRole.TEAM_LEADER, UserRole.ADMIN]}>
      <div className="space-y-4 animate-in fade-in duration-150 select-none pb-12">
        {/* Breadcrumb Navigation matching CRM Management Hub */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Link
            href="/dashboard"
            className="text-[#2874f0] hover:underline font-medium"
          >
            Home
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <Link
            href="/dashboard/reports"
            className="text-[#2874f0] hover:underline font-medium"
          >
            Reports Hub
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="text-slate-700 dark:text-slate-300 font-medium">
            Pipeline Funnel Breakdown
          </span>
        </div>

        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e0e0e0] dark:border-slate-800 pb-3">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#2874f0]" />
              <span>LEAD PIPELINE & FUNNEL BREAKDOWN</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              End-to-end sales lifecycle stage throughput, drop-offs, and source
              acquisition channels.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <Link
              href="/dashboard/reports"
              className="h-8.5 px-3 rounded-sm bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 text-xs font-semibold text-slate-700 dark:hover:text-slate-800 dark:text-slate-300 hover:bg-slate-50 flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Reports</span>
            </Link>

            {/* Functional Time Range Select */}
            <Select
              value={timeRange}
              onValueChange={(val) => {
                if (val) setTimeRange(val);
              }}
            >
              <SelectTrigger className="h-8.5 w-36 bg-white dark:bg-slate-900 border-[#e0e0e0] dark:border-slate-800 text-xs font-semibold rounded-sm shadow-2xs">
                <SelectValue placeholder="Select Range" />
              </SelectTrigger>
              <SelectContent
                align="end"
                className="bg-white dark:bg-slate-900 border-[#e0e0e0] dark:border-slate-800 text-slate-800 dark:text-slate-200"
              >
                {dateRanges.map((dr) => (
                  <SelectItem
                    key={dr.value}
                    value={dr.value}
                    className="text-xs"
                  >
                    {dr.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Functional Export Button with Excel / CSV Option Format */}
            <div
              className="relative inline-flex items-center rounded-sm shadow-2xs"
              ref={exportMenuRef}
            >
              {/* Primary Action Button */}
              <button
                type="button"
                onClick={() => handleExport(selectedFormat)}
                disabled={exportingFormat !== null}
                className="h-8.5 px-3.5 rounded-l-sm bg-[#2874f0] hover:bg-[#1a5bb8] text-white font-bold text-xs uppercase tracking-wide flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {exportingFormat ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : selectedFormat === "xlsx" ? (
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                ) : (
                  <FileText className="w-3.5 h-3.5" />
                )}
                <span>
                  {exportingFormat
                    ? `Exporting ${exportingFormat.toUpperCase()}...`
                    : `Export ${selectedFormat.toUpperCase()}`}
                </span>
              </button>

              {/* Format Dropdown Trigger Button */}
              <button
                type="button"
                onClick={() => setExportMenuOpen((prev) => !prev)}
                disabled={exportingFormat !== null}
                className="h-8.5 px-2 rounded-r-sm bg-[#1a5bb8] hover:bg-[#134996] text-white border-l border-white/20 flex items-center justify-center transition-colors disabled:opacity-50 cursor-pointer"
                title="Choose export format: Excel (.xlsx) or CSV (.csv)"
                aria-expanded={exportMenuOpen}
                aria-haspopup="true"
              >
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-150 ${
                    exportMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu Options */}
              {exportMenuOpen && (
                <div className="absolute right-0 top-9.5 w-68 bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 shadow-xl rounded-sm py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Export Format
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">
                      Pipeline Breakdown
                    </span>
                  </div>

                  {/* Excel Option */}
                  <button
                    type="button"
                    onClick={() => handleExport("xlsx")}
                    disabled={exportingFormat !== null}
                    className="w-full px-3 py-2.5 text-left flex items-start gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors cursor-pointer group"
                  >
                    <div className="w-7 h-7 rounded-sm bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      <FileSpreadsheet className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                          Excel (.xlsx)
                        </span>
                        {selectedFormat === "xlsx" && (
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        Styled workbook with pipeline & channel metrics
                      </p>
                    </div>
                  </button>

                  {/* CSV Option */}
                  <button
                    type="button"
                    onClick={() => handleExport("csv")}
                    disabled={exportingFormat !== null}
                    className="w-full px-3 py-2.5 text-left flex items-start gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors cursor-pointer group"
                  >
                    <div className="w-7 h-7 rounded-sm bg-blue-50 dark:bg-blue-950/60 text-[#2874f0] dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                          CSV (.csv)
                        </span>
                        {selectedFormat === "csv" && (
                          <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        Universal comma-separated format for BI & tools
                      </p>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Top Grid: Funnel Chart (Left) + Source Share Pie Chart (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
          <div className="lg:col-span-7">
            <FunnelAnalyticsCard stages={stages} isLoading={isLoading} />
          </div>

          <div className="lg:col-span-5">
            <ChartCard
              title="Lead Source Distribution"
              subtitle="Breakdown by acquisition channel"
              icon={<Layers className="w-4 h-4 text-[#2874f0]" />}
              className="h-full rounded-sm border-[#e0e0e0] dark:border-slate-800 shadow-2xs"
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
          <div className="lg:col-span-6">
            <ChartCard
              title="Stage Volume Distribution"
              subtitle="Absolute lead counts by active stage"
              icon={<Filter className="w-4 h-4 text-[#2874f0]" />}
              className="rounded-sm border-[#e0e0e0] dark:border-slate-800 shadow-2xs"
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
              icon={<TrendingUp className="w-4 h-4 text-emerald-600" />}
              className="rounded-sm border-[#e0e0e0] dark:border-slate-800 shadow-2xs"
            >
              <AreaChart
                data={inflowAreaPoints}
                height={200}
                primaryLabel="Total Inflow"
                secondaryLabel="Qualified"
                primaryColor="#2874f0"
                secondaryColor="#00a65a"
                isLoading={isLoading}
              />
            </ChartCard>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
