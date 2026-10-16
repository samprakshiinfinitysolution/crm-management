"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  Target,
  Clock,
  ShieldCheck,
  IndianRupee,
  ChevronRight,
  ChevronDown,
  TrendingUp,
  Loader2,
  RefreshCw,
  FileSpreadsheet,
  FileText,
  Check,
} from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { UserRole } from "@/types/api.types";
import { useGetPerformanceReportQuery } from "@/store/api/leadApi";
import dynamic from "next/dynamic";
import { ChartSkeleton } from "@/components/ui/charts";

// Code splitting: Performance matrix is dynamically loaded
const ExecutivePerformanceMatrix = dynamic(
  () =>
    import("@/components/team_leader/reports/ExecutivePerformanceMatrix").then(
      (m) => m.ExecutivePerformanceMatrix
    ),
  {
    loading: () => <ChartSkeleton height="h-80" />,
    ssr: false,
  }
);
import { downloadReportsExport } from "@/lib/exportUtils";

export default function PerformanceReportPage() {
  const [activePreset, setActivePreset] = useState<string>("30d");
  const [customFromDate, setCustomFromDate] = useState<string>("");
  const [customToDate, setCustomToDate] = useState<string>("");
  const [appliedFromDate, setAppliedFromDate] = useState<string | undefined>(
    undefined,
  );
  const [appliedToDate, setAppliedToDate] = useState<string | undefined>(
    undefined,
  );
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

  // Handle Preset Button Clicks
  const handleSelectPreset = (presetId: string) => {
    setActivePreset(presetId);
    const now = new Date();

    if (presetId === "all") {
      setCustomFromDate("");
      setCustomToDate("");
      setAppliedFromDate(undefined);
      setAppliedToDate(undefined);
    } else if (presetId === "yesterday") {
      const yesterday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 1,
      );
      const yStr = yesterday.toISOString().slice(0, 10);
      setCustomFromDate(yStr);
      setCustomToDate(yStr);
      setAppliedFromDate(yStr);
      setAppliedToDate(yStr);
    } else if (presetId === "7d") {
      setCustomFromDate("");
      setCustomToDate("");
      setAppliedFromDate(undefined);
      setAppliedToDate(undefined);
    } else if (presetId === "lastWeek") {
      const lwEnd = new Date(now.getTime() - 7 * 86400000)
        .toISOString()
        .slice(0, 10);
      const lwStart = new Date(now.getTime() - 14 * 86400000)
        .toISOString()
        .slice(0, 10);
      setCustomFromDate(lwStart);
      setCustomToDate(lwEnd);
      setAppliedFromDate(lwStart);
      setAppliedToDate(lwEnd);
    } else if (presetId === "30d") {
      setCustomFromDate("");
      setCustomToDate("");
      setAppliedFromDate(undefined);
      setAppliedToDate(undefined);
    }
  };

  const handleApplyCustomDates = (e: React.FormEvent) => {
    e.preventDefault();
    if (customFromDate || customToDate) {
      setAppliedFromDate(customFromDate || undefined);
      setAppliedToDate(customToDate || undefined);
      setActivePreset("custom");
    }
  };

  const handleResetDates = () => {
    setCustomFromDate("");
    setCustomToDate("");
    setAppliedFromDate(undefined);
    setAppliedToDate(undefined);
    setActivePreset("30d");
  };

  // Build query parameters
  const queryParams = useMemo(() => {
    const range = activePreset === "custom" ? "30d" : activePreset;
    return {
      timeRange: range,
      fromDate: appliedFromDate,
      toDate: appliedToDate,
    };
  }, [activePreset, appliedFromDate, appliedToDate]);

  const {
    data: performanceRes,
    isLoading,
    isFetching,
    refetch,
  } = useGetPerformanceReportQuery(queryParams, {
    pollingInterval: 45000,
  });

  const performanceData = performanceRes?.data;
  const summary = performanceData?.summary;
  const executives = performanceData?.executives || [];

  const handleExport = async (format: "xlsx" | "csv" = selectedFormat) => {
    setSelectedFormat(format);
    setExportingFormat(format);
    setExportMenuOpen(false);
    try {
      await downloadReportsExport({
        timeRange: queryParams.timeRange,
        fromDate: queryParams.fromDate,
        toDate: queryParams.toDate,
        format,
      });
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
            Executive Performance Matrix
          </span>
        </div>

        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e0e0e0] dark:border-slate-800 pb-3">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#2874f0]" />
              <span>EXECUTIVE PERFORMANCE MATRIX</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Staff throughput, close ratios, turnaround velocity, and SLA
              adherence scorecard.
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
                className="h-8.5 px-3.5 rounded-l-sm bg-brand-primary hover:bg-brand-primary/90 text-white font-bold text-xs uppercase tracking-wide flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
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
                className="h-8.5 px-2 rounded-r-sm bg-brand-primary/95 hover:bg-brand-primary text-white border-l border-white/20 flex items-center justify-center transition-colors disabled:opacity-50 cursor-pointer"
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
                      Performance Matrix
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
                        Styled multi-sheet workbook with KPIs & scorecard
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

        {/* Flipkart Filter Buttons Bar matching screenshot & query params */}
        <div className="bg-[#f1f3f6] dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 rounded-sm p-3 space-y-2.5 shadow-2xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Left: Button Filters matching screenshot */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {[
                { id: "all", label: "Lifetime" },
                { id: "yesterday", label: "Yesterday" },
                { id: "7d", label: "This Week" },
                { id: "lastWeek", label: "Last Week" },
                { id: "30d", label: "Last 30 Days" },
              ].map((tab) => {
                const isSelected = activePreset === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleSelectPreset(tab.id)}
                    className={`h-7 px-3.5 rounded-sm text-xs font-bold transition-all cursor-pointer border shadow-2xs ${
                      isSelected
                        ? "bg-[#2874f0] text-white border-[#2874f0]"
                        : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-[#e0e0e0] dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Right: Custom Date Filter Form */}
            <form
              onSubmit={handleApplyCustomDates}
              className="flex flex-wrap items-center gap-2 text-xs"
            >
              <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-[#e0e0e0] dark:border-slate-700 rounded-sm px-2 py-1">
                <span className="text-[11px] font-bold text-slate-400">
                  From:
                </span>
                <input
                  type="date"
                  value={customFromDate}
                  onChange={(e) => setCustomFromDate(e.target.value)}
                  className="bg-transparent text-xs text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-[#e0e0e0] dark:border-slate-700 rounded-sm px-2 py-1">
                <span className="text-[11px] font-bold text-slate-400">
                  To:
                </span>
                <input
                  type="date"
                  value={customToDate}
                  onChange={(e) => setCustomToDate(e.target.value)}
                  className="bg-transparent text-xs text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
                />
              </div>

              <button
                type="submit"
                className="h-7 px-3 rounded-sm bg-[#2874f0] text-white text-xs font-bold hover:bg-[#1f5cc4] transition-colors cursor-pointer shadow-2xs"
              >
                Apply
              </button>

              {(appliedFromDate || appliedToDate || activePreset !== "30d") && (
                <button
                  type="button"
                  onClick={handleResetDates}
                  className="h-7 px-2.5 rounded-sm bg-white dark:bg-slate-800 border border-[#e0e0e0] text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Reset
                </button>
              )}

              <button
                type="button"
                onClick={() => refetch()}
                title="Refresh Matrix"
                className="h-7 w-7 rounded-sm bg-white dark:bg-slate-800 border border-[#e0e0e0] dark:border-slate-700 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-[#2874f0]" : ""}`}
                />
              </button>
            </form>
          </div>

          {/* Active API Query Indicator */}
          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200 dark:border-slate-800 text-slate-500 font-mono">
            <div className="flex items-center gap-2 truncate">
              <span className="font-bold text-[#2874f0] uppercase tracking-wider">
                Active Endpoint:
              </span>
              <span className="text-slate-600 dark:text-slate-400 truncate">
                /api/reports/performance?timeRange={queryParams.timeRange}
                {queryParams.fromDate
                  ? `&fromDate=${queryParams.fromDate}`
                  : ""}
                {queryParams.toDate ? `&toDate=${queryParams.toDate}` : ""}
              </span>
            </div>
            {summary?.timeRangeLabel && (
              <span className="font-semibold text-slate-700 dark:text-slate-300 shrink-0">
                Range: {summary.timeRangeLabel}
              </span>
            )}
          </div>
        </div>

        {/* Summary Metric KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {/* Active Staff */}
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-sm border border-[#e0e0e0] dark:border-slate-800 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider">
                Active Staff
              </span>
              <div className="w-6 h-6 rounded-xs bg-[#eaf4fe] flex items-center justify-center">
                <Users className="w-3.5 h-3.5 text-[#2874f0]" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">
              {summary ? summary.totalExecutives : "—"}
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5">
              {summary
                ? `${summary.totalAssigned} leads assigned`
                : "Loading..."}
            </span>
          </div>

          {/* Close Rate */}
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-sm border border-[#e0e0e0] dark:border-slate-800 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider">
                Close Rate
              </span>
              <div className="w-6 h-6 rounded-xs bg-emerald-50 flex items-center justify-center">
                <Target className="w-3.5 h-3.5 text-emerald-600" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-600">
              {summary ? `${summary.overallConversionRate}%` : "—"}
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5">
              {summary
                ? `${summary.totalWon} won / ${summary.totalLost} lost`
                : "Loading..."}
            </span>
          </div>

          {/* Avg Response */}
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-sm border border-[#e0e0e0] dark:border-slate-800 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider">
                Avg Response
              </span>
              <div className="w-6 h-6 rounded-xs bg-[#eaf4fe] flex items-center justify-center">
                <Clock className="w-3.5 h-3.5 text-[#2874f0]" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">
              {summary ? `${summary.overallAvgResponseHours}h` : "—"}
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5">
              First touch velocity
            </span>
          </div>

          {/* SLA Adherence */}
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-sm border border-[#e0e0e0] dark:border-slate-800 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider">
                SLA Adherence
              </span>
              <div className="w-6 h-6 rounded-xs bg-emerald-50 flex items-center justify-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-600">
              {summary ? `${summary.overallSlaComplianceRate}%` : "—"}
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5">
              {summary ? `${summary.totalSlaBreaches} breaches` : "Loading..."}
            </span>
          </div>

          {/* Closed Revenue */}
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-sm border border-[#e0e0e0] dark:border-slate-800 shadow-2xs flex flex-col justify-between col-span-2 md:col-span-1">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider">
                Closed Revenue
              </span>
              <div className="w-6 h-6 rounded-xs bg-emerald-50 flex items-center justify-center">
                <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-600 truncate">
              {summary
                ? `₹${Number(summary.totalWonRevenue).toLocaleString("en-IN")}`
                : "—"}
            </div>
            <span className="text-[11px] text-slate-500 mt-0.5 truncate font-mono">
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
