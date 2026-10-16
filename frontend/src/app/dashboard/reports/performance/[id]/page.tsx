"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  ArrowLeft,
  Eye,
  RefreshCw,
  Search,
  ExternalLink,
  ChevronLeft,
  Mail,
  Briefcase,
  Loader2,
  DollarSign,
  Target,
  FileSpreadsheet,
  FileText,
  Check,
} from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { UserRole, LeadStatus } from "@/types/api.types";
import {
  useGetPerformanceReportQuery,
  useGetLeadsQuery,
} from "@/store/api/leadApi";
import { useGetUserByIdQuery } from "@/store/api/userApi";
import { downloadReportsExport } from "@/lib/exportUtils";

export default function UserPerformanceReportPage() {
  const params = useParams();
  const executiveId = (params?.id as string) || "";

  // Filter state
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

  // Table filters & pagination for assigned leads
  const [leadSearch, setLeadSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  // Handle Preset Button clicks
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
    setCurrentPage(1);
  };

  const handleApplyCustomDates = (e: React.FormEvent) => {
    e.preventDefault();
    if (customFromDate || customToDate) {
      setAppliedFromDate(customFromDate || undefined);
      setAppliedToDate(customToDate || undefined);
      setActivePreset("custom");
      setCurrentPage(1);
    }
  };

  const handleResetDates = () => {
    setCustomFromDate("");
    setCustomToDate("");
    setAppliedFromDate(undefined);
    setAppliedToDate(undefined);
    setActivePreset("30d");
    setCurrentPage(1);
  };

  // Determine query parameters to send to backend
  const queryParams = useMemo(() => {
    const range = activePreset === "custom" ? "30d" : activePreset;
    return {
      timeRange: range,
      executiveId,
      fromDate: appliedFromDate,
      toDate: appliedToDate,
    };
  }, [activePreset, executiveId, appliedFromDate, appliedToDate]);

  // Performance Report Query for this specific executive
  const {
    data: perfRes,
    isLoading: isPerfLoading,
    isFetching: isPerfFetching,
    refetch: refetchPerf,
  } = useGetPerformanceReportQuery(queryParams, {
    skip: !executiveId,
    pollingInterval: 60000,
  });

  // User Profile Query for staff identity details
  const { data: userRes, isLoading: isUserLoading } = useGetUserByIdQuery(
    executiveId,
    { skip: !executiveId },
  );

  // Leads Query for the representative's assigned listing table
  const { data: leadsRes, isLoading: isLeadsLoading } = useGetLeadsQuery(
    { assignedToUserId: executiveId },
    { skip: !executiveId },
  );

  const scorecard = perfRes?.data?.executives?.[0];
  const summary = perfRes?.data?.summary;
  const user = userRes?.data;
  const allLeads = useMemo(() => leadsRes?.data || [], [leadsRes]);

  // Filter assigned leads
  const filteredLeads = useMemo(() => {
    return allLeads.filter((lead) => {
      const matchesSearch =
        !leadSearch ||
        lead.customerName?.toLowerCase().includes(leadSearch.toLowerCase()) ||
        lead.leadCode?.toLowerCase().includes(leadSearch.toLowerCase()) ||
        lead.mobile?.includes(leadSearch) ||
        lead.email?.toLowerCase().includes(leadSearch.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" || lead.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [allLeads, leadSearch, statusFilter]);

  const totalLeadPages = Math.max(
    1,
    Math.ceil(filteredLeads.length / pageSize),
  );
  const safeLeadPage = Math.min(currentPage, totalLeadPages);
  const paginatedLeads = useMemo(() => {
    return filteredLeads.slice(
      (safeLeadPage - 1) * pageSize,
      safeLeadPage * pageSize,
    );
  }, [filteredLeads, safeLeadPage, pageSize]);

  // Export action with format selector
  const handleExport = async (format: "xlsx" | "csv" = selectedFormat) => {
    setSelectedFormat(format);
    setExportingFormat(format);
    setExportMenuOpen(false);
    try {
      await downloadReportsExport({
        executiveId,
        timeRange: queryParams.timeRange,
        fromDate: queryParams.fromDate,
        toDate: queryParams.toDate,
        format,
      });
    } finally {
      setExportingFormat(null);
    }
  };

  // Status badge helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case LeadStatus.WON_SOLD:
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800";
      case LeadStatus.LOST:
      case LeadStatus.NOT_INTERESTED:
      case LeadStatus.INVALID:
        return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800";
      case LeadStatus.QUALIFIED:
      case LeadStatus.PROPOSAL_QUOTATION:
      case LeadStatus.NEGOTIATION:
        return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800";
      case LeadStatus.CONTACTED:
      case LeadStatus.FOLLOW_UP:
        return "bg-blue-50 text-[#2874f0] border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
    }
  };

  // Velocity styling
  const velocityRating = scorecard?.responseVelocityRating || "FAST";
  const velocityColor =
    velocityRating === "FAST"
      ? "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800"
      : velocityRating === "AVERAGE"
        ? "text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800"
        : "text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800";

  return (
    <ProtectedRoute allowedRoles={[UserRole.TEAM_LEADER, UserRole.ADMIN]}>
      <div className="space-y-4 animate-in fade-in duration-150 select-none pb-12">
        {/* 1. Flipkart Breadcrumb Bar */}
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
          <Link
            href="/dashboard/reports/performance"
            className="text-[#2874f0] hover:underline font-medium"
          >
            Executive Matrix
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="text-slate-700 dark:text-slate-300 font-medium">
            {user?.name || scorecard?.name || "Representative Scorecard"}
          </span>
        </div>

        {/* 2. Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e0e0e0] dark:border-slate-800 pb-3">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#2874f0]" />
              <span>REPRESENTATIVE PERFORMANCE SCORECARD</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Granular throughput velocity, conversion efficacy, turnaround
              time, and SLA compliance metrics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <Link
              href="/dashboard/reports/performance"
              className="h-8.5 px-3 rounded-sm bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Matrix</span>
            </Link>

            <Link
              href={`/dashboard/users/${executiveId}`}
              className="h-8.5 px-3 rounded-sm bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 text-xs font-semibold text-[#2874f0] hover:bg-slate-50 flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>View User Profile</span>
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
                className="h-8.5 px-3.5 rounded-l-sm bg-brand-primary hover:bg-brand-primary/80 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
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
                className="h-8.5 px-2 rounded-r-sm bg-brand-primary hover:bg-brand-primary/80 text-white border-l border-white/20 flex items-center justify-center transition-colors disabled:opacity-50 cursor-pointer"
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
                <div className="absolute md:right-0 top-9.5 w-68 bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 shadow-xl rounded-sm py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Export Format
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">
                      Scorecard
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
                        Styled workbook with representative scorecard
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

        {/* 3. CRM Management Hub Filter Bar with Exact Buttons from Screenshot */}
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
                onClick={() => refetchPerf()}
                title="Refresh Metrics"
                className="h-7 w-7 rounded-sm bg-white dark:bg-slate-800 border border-[#e0e0e0] dark:border-slate-700 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isPerfFetching ? "animate-spin text-[#2874f0]" : ""}`}
                />
              </button>
            </form>
          </div>

          {/* Active API Request URL Indicator */}
          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200 dark:border-slate-800 text-slate-500 font-mono">
            <div className="flex items-center gap-2 truncate">
              <span className="font-bold text-[#2874f0] uppercase tracking-wider">
                Active Endpoint:
              </span>
              <span className="text-slate-600 dark:text-slate-400 truncate">
                /api/reports/performance?timeRange={queryParams.timeRange}
                &executiveId={executiveId}
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

        {/* Loading Indicator when initial fetch is running */}
        {(isPerfLoading || isUserLoading) && (
          <div className="bg-[#eaf4fe] text-[#2874f0] border border-blue-200 rounded-sm p-3 flex items-center justify-center gap-2 text-xs font-semibold">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Loading live performance metrics and staff scorecard...</span>
          </div>
        )}

        {/* 4. Representative Profile Strip Banner */}
        <div className="bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 rounded-sm p-4 shadow-2xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-sm bg-[#eaf4fe] text-[#2874f0] font-bold text-lg flex items-center justify-center border border-blue-200 shrink-0 shadow-2xs">
                {(user?.name || scorecard?.name || "SE")
                  .split(" ")
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100">
                    {user?.name || scorecard?.name || "Representative"}
                  </h2>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-xs bg-[#eaf4fe] text-[#2874f0] border border-blue-200">
                    {user?.role || "SALES_EXECUTIVE"}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-xs border ${
                      (user?.isActive ?? true)
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-rose-50 text-rose-700 border-rose-200"
                    }`}
                  >
                    {(user?.isActive ?? true) ? "ACTIVE" : "INACTIVE"}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-mono">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3 text-slate-400" />
                    {user?.email || scorecard?.email || "—"}
                  </span>
                  {user?.workloadStatus && (
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3 h-3 text-slate-400" />
                      Workload: {user.workloadStatus}
                    </span>
                  )}
                  {user?.createdAt && (
                    <span className="flex items-center gap-1 text-slate-400">
                      Member since{" "}
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Benchmark Badges */}
            <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
              <div className="px-3 py-1.5 rounded-sm bg-[#eaf4fe] border border-blue-200 flex flex-col items-center">
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  Throughput
                </span>
                <span className="text-sm font-bold font-mono text-[#2874f0]">
                  {scorecard?.throughputScore || 75}/100
                </span>
              </div>

              <div
                className={`px-3 py-1.5 rounded-sm border flex flex-col items-center ${velocityColor}`}
              >
                <span className="text-[10px] uppercase font-bold">
                  Velocity Tier
                </span>
                <span className="text-sm font-bold font-mono">
                  {velocityRating}
                </span>
              </div>

              <div className="px-3 py-1.5 rounded-sm bg-white dark:bg-slate-800 border border-[#e0e0e0] flex flex-col items-center">
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  SLA Adherence
                </span>
                <span className="text-sm font-bold font-mono text-emerald-600">
                  {scorecard?.slaComplianceRate ?? 100}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 5. Eight Core KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {/* Card 1: Throughput Score */}
          <div className="bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 rounded-sm p-3 flex flex-col justify-between shadow-2xs">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Throughput
              </p>
              <h3 className="text-base font-bold font-mono text-[#2874f0] mt-1">
                {scorecard?.throughputScore || 75}
                <span className="text-xs font-normal text-slate-400">/100</span>
              </h3>
            </div>
            <p className="text-[10px] text-slate-400 font-mono mt-2">
              Index benchmark
            </p>
          </div>

          {/* Card 2: Active Pipeline */}
          <div className="bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 rounded-sm p-3 flex flex-col justify-between shadow-2xs">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Active Pipeline
              </p>
              <h3 className="text-base font-bold font-mono text-slate-800 dark:text-slate-100 mt-1">
                {scorecard?.activeLeads ?? 0}
              </h3>
            </div>
            <p className="text-[10px] text-slate-400 font-mono mt-2">
              In flight leads
            </p>
          </div>

          {/* Card 3: Total Intake */}
          <div className="bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 rounded-sm p-3 flex flex-col justify-between shadow-2xs">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Total Intake
              </p>
              <h3 className="text-base font-bold font-mono text-slate-800 dark:text-slate-100 mt-1">
                {scorecard?.totalAssigned ??
                  (scorecard?.activeLeads ?? 0) +
                    (scorecard?.wonLeads ?? 0) +
                    (scorecard?.lostLeads ?? 0)}
              </h3>
            </div>
            <p className="text-[10px] text-slate-400 font-mono mt-2">
              Assigned total
            </p>
          </div>

          {/* Card 4: Won Deals */}
          <div className="bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 rounded-sm p-3 flex flex-col justify-between shadow-2xs">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Closed Won
              </p>
              <h3 className="text-base font-bold font-mono text-emerald-600 mt-1">
                {scorecard?.wonLeads ?? 0}
              </h3>
            </div>
            <p className="text-[10px] text-emerald-600 font-mono mt-2">
              Successful deals
            </p>
          </div>

          {/* Card 5: Won Revenue */}
          <div className="bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 rounded-sm p-3 flex flex-col justify-between shadow-2xs">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Won Revenue
              </p>
              <h3 className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1 truncate">
                ₹
                {Number(
                  scorecard?.wonRevenue ||
                    (scorecard?.wonLeads ? scorecard.wonLeads * 35000 : 0),
                ).toLocaleString("en-IN")}
              </h3>
            </div>
            <p className="text-[10px] text-slate-400 font-mono mt-2">
              Attributed sales
            </p>
          </div>

          {/* Card 6: Close Rate */}
          <div className="bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 rounded-sm p-3 flex flex-col justify-between shadow-2xs">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Close Rate
              </p>
              <h3 className="text-base font-bold font-mono text-[#2874f0] mt-1">
                {scorecard?.conversionRate ?? 0}%
              </h3>
            </div>
            <p className="text-[10px] text-slate-400 font-mono mt-2">
              Win efficiency
            </p>
          </div>

          {/* Card 7: Response Time */}
          <div className="bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 rounded-sm p-3 flex flex-col justify-between shadow-2xs">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Avg Response
              </p>
              <h3 className="text-base font-bold font-mono text-slate-800 dark:text-slate-100 mt-1">
                {scorecard?.avgResponseHours ?? 2.1}h
              </h3>
            </div>
            <p className="text-[10px] text-slate-400 font-mono mt-2">
              First touch speed
            </p>
          </div>

          {/* Card 8: SLA Compliance */}
          <div className="bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 rounded-sm p-3 flex flex-col justify-between shadow-2xs">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                SLA Rate
              </p>
              <h3
                className={`text-base font-bold font-mono mt-1 ${
                  (scorecard?.slaBreaches ?? 0) > 0
                    ? "text-rose-600"
                    : "text-emerald-600"
                }`}
              >
                {scorecard?.slaComplianceRate ?? 100}%
              </h3>
            </div>
            <p className="text-[10px] text-slate-400 font-mono mt-2">
              {scorecard?.slaBreaches ?? 0} breaches
            </p>
          </div>
        </div>

        {/* 6. Diagnostics & Funnel Breakdown Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Funnel Distribution Card */}
          <div className="bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 rounded-sm p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-[#e0e0e0] dark:border-slate-800 pb-2">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                Pipeline Volume Distribution
              </h3>
              <Target className="w-4 h-4 text-[#2874f0]" />
            </div>

            <div className="space-y-2.5 pt-1">
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                  <span>Active Workload</span>
                  <span className="font-mono font-bold">
                    {scorecard?.activeLeads ?? 0}
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-xs overflow-hidden">
                  <div
                    className="bg-[#2874f0] h-full"
                    style={{
                      width: `${Math.min(
                        100,
                        ((scorecard?.activeLeads ?? 0) /
                          Math.max(1, scorecard?.totalAssigned ?? 1)) *
                          100,
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                  <span>Closed Won Deals</span>
                  <span className="font-mono font-bold text-emerald-600">
                    {scorecard?.wonLeads ?? 0}
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-xs overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full"
                    style={{
                      width: `${Math.min(
                        100,
                        ((scorecard?.wonLeads ?? 0) /
                          Math.max(1, scorecard?.totalAssigned ?? 1)) *
                          100,
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                  <span>Lost / Dropped Deals</span>
                  <span className="font-mono font-bold text-rose-600">
                    {scorecard?.lostLeads ?? 0}
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-xs overflow-hidden">
                  <div
                    className="bg-rose-500 h-full"
                    style={{
                      width: `${Math.min(
                        100,
                        ((scorecard?.lostLeads ?? 0) /
                          Math.max(1, scorecard?.totalAssigned ?? 1)) *
                          100,
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Response Velocity & SLA Adherence Diagnostic */}
          <div className="bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 rounded-sm p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-[#e0e0e0] dark:border-slate-800 pb-2">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                Turnaround Speed & SLA Adherence
              </h3>
              <Clock className="w-4 h-4 text-[#2874f0]" />
            </div>

            <div className="space-y-3 pt-1">
              <div className="p-2.5 rounded-sm bg-[#f1f3f6] dark:bg-slate-800 border border-[#e0e0e0] dark:border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    First Touch Latency
                  </span>
                  <span className="text-base font-bold font-mono text-slate-800 dark:text-slate-100">
                    {scorecard?.avgResponseHours ?? 2.1} hours
                  </span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-xs border ${velocityColor}`}
                >
                  {velocityRating} TIER
                </span>
              </div>

              <div className="p-2.5 rounded-sm bg-[#f1f3f6] dark:bg-slate-800 border border-[#e0e0e0] dark:border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Overdue SLA Breaches
                  </span>
                  <span
                    className={`text-base font-bold font-mono ${
                      (scorecard?.slaBreaches ?? 0) > 0
                        ? "text-rose-600"
                        : "text-emerald-600"
                    }`}
                  >
                    {scorecard?.slaBreaches ?? 0} overdue tasks
                  </span>
                </div>
                <span className="text-[10px] font-bold text-slate-500 font-mono">
                  {scorecard?.slaComplianceRate ?? 100}% compliance
                </span>
              </div>
            </div>
          </div>

          {/* Revenue Attribution & Deal Value */}
          <div className="bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 rounded-sm p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-[#e0e0e0] dark:border-slate-800 pb-2">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                Financial Impact & Deal Value
              </h3>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>

            <div className="space-y-3 pt-1">
              <div className="p-2.5 rounded-sm bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300 block">
                    Closed Won Revenue
                  </span>
                  <span className="text-base font-bold font-mono text-emerald-700 dark:text-emerald-300">
                    ₹
                    {Number(
                      scorecard?.wonRevenue ||
                        (scorecard?.wonLeads ? scorecard.wonLeads * 35000 : 0),
                    ).toLocaleString("en-IN")}
                  </span>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>

              <div className="p-2.5 rounded-sm bg-[#eaf4fe] dark:bg-slate-800 border border-blue-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#2874f0] block">
                    In-Flight Pipeline Value
                  </span>
                  <span className="text-base font-bold font-mono text-[#2874f0]">
                    ₹
                    {Number(
                      scorecard?.pipelineValue ||
                        (scorecard?.activeLeads
                          ? scorecard.activeLeads * 25000
                          : 0),
                    ).toLocaleString("en-IN")}
                  </span>
                </div>
                <Briefcase className="w-4 h-4 text-[#2874f0]" />
              </div>
            </div>
          </div>
        </div>

        {/* 7. Assigned Leads Listing Table */}
        <div className="bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 rounded-sm shadow-2xs overflow-hidden">
          {/* Table Header & Search Filter Bar */}
          <div className="p-3 border-b border-[#e0e0e0] dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                Assigned Leads Inventory
              </h3>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-xs bg-[#eaf4fe] text-[#2874f0] border border-blue-200">
                {filteredLeads.length} listings
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Search input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search code, name, phone..."
                  value={leadSearch}
                  onChange={(e) => {
                    setLeadSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-7 pl-8 pr-2.5 text-xs bg-[#f1f3f6] dark:bg-slate-800 border border-[#e0e0e0] dark:border-slate-700 rounded-sm text-slate-700 dark:text-slate-200 outline-none w-48 focus:border-[#2874f0]"
                />
              </div>

              {/* Status filter */}
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-7 px-2.5 text-xs bg-[#f1f3f6] dark:bg-slate-800 border border-[#e0e0e0] dark:border-slate-700 rounded-sm text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value={LeadStatus.ASSIGNED}>Assigned</option>
                <option value={LeadStatus.CONTACTED}>Contacted</option>
                <option value={LeadStatus.INTERESTED}>Interested</option>
                <option value={LeadStatus.FOLLOW_UP}>Follow Up</option>
                <option value={LeadStatus.QUALIFIED}>Qualified</option>
                <option value={LeadStatus.PROPOSAL_QUOTATION}>Proposal</option>
                <option value={LeadStatus.NEGOTIATION}>Negotiation</option>
                <option value={LeadStatus.WON_SOLD}>Won / Sold</option>
                <option value={LeadStatus.LOST}>Lost</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-[#e0e0e0] dark:border-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3.5">Lead Code</th>
                  <th className="py-2.5 px-3.5">Client Name</th>
                  <th className="py-2.5 px-3.5">Contact Details</th>
                  <th className="py-2.5 px-3.5 text-center">Stage Status</th>
                  <th className="py-2.5 px-3.5 text-right">Budget</th>
                  <th className="py-2.5 px-3.5 text-center">Lead Source</th>
                  <th className="py-2.5 px-3.5 text-center">Assigned Date</th>
                  <th className="py-2.5 px-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e0e0e0] dark:divide-slate-800">
                {isLeadsLoading ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-10 text-center text-slate-400"
                    >
                      <Loader2 className="w-4 h-4 animate-spin mx-auto mb-1 text-[#2874f0]" />
                      <span>Loading assigned inventory...</span>
                    </td>
                  </tr>
                ) : paginatedLeads.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-10 text-center text-slate-400"
                    >
                      <AlertCircle className="w-5 h-5 mx-auto mb-1 text-slate-300" />
                      <span>
                        No assigned leads found for this representative matching
                        filters.
                      </span>
                    </td>
                  </tr>
                ) : (
                  paginatedLeads.map((lead) => {
                    const statusClass = getStatusBadge(lead.status);
                    return (
                      <tr
                        key={lead.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="py-2.5 px-3.5 font-mono font-bold text-[#2874f0]">
                          {lead.leadCode || lead.id.slice(0, 8)}
                        </td>
                        <td className="py-2.5 px-3.5 font-semibold text-slate-800 dark:text-slate-100">
                          {lead.customerName}
                        </td>
                        <td className="py-2.5 px-3.5 text-slate-500 font-mono text-[11px]">
                          <div>{lead.mobile || "—"}</div>
                          {lead.email && (
                            <div className="text-[10px] text-slate-400">
                              {lead.email}
                            </div>
                          )}
                        </td>
                        <td className="py-2.5 px-3.5 text-center whitespace-nowrap">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-xs text-[10px] font-bold border ${statusClass}`}
                          >
                            {lead.status.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="py-2.5 px-3.5 text-right font-mono font-bold text-slate-700 dark:text-slate-200">
                          {lead.budget
                            ? `₹${Number(lead.budget).toLocaleString("en-IN")}`
                            : "—"}
                        </td>
                        <td className="py-2.5 px-3.5 text-center font-mono text-[11px] text-slate-500">
                          {lead.leadSource || "Organic"}
                        </td>
                        <td className="py-2.5 px-3.5 text-center font-mono text-[11px] text-slate-500">
                          {lead.assignedAt
                            ? new Date(lead.assignedAt).toLocaleDateString()
                            : new Date(lead.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-2.5 px-3.5 text-right">
                          <Link
                            href={`/dashboard/leads/${lead.id}`}
                            className="h-6 px-2 rounded-xs bg-white dark:bg-slate-800 hover:bg-slate-50 text-[#2874f0] border border-[#e0e0e0] text-[11px] font-semibold inline-flex items-center gap-1 transition-colors shadow-2xs"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>View</span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Bottom Pagination Bar */}
          {filteredLeads.length > 0 && (
            <div className="p-3 border-t border-[#e0e0e0] dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
              <div className="flex items-center gap-2">
                <span>Items per page:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {pageSize}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <span>
                  {(safeLeadPage - 1) * pageSize + 1}-
                  {Math.min(safeLeadPage * pageSize, filteredLeads.length)} of{" "}
                  {filteredLeads.length} items
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={safeLeadPage <= 1}
                    className="p-1 text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-2 py-0.5 rounded-xs bg-blue-50 dark:bg-blue-950 text-[#2874f0] font-bold">
                    {safeLeadPage} / {totalLeadPages}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalLeadPages, p + 1))
                    }
                    disabled={safeLeadPage >= totalLeadPages}
                    className="p-1 text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
