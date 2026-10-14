"use client";

import React, { useState } from "react";
import Link from "next/link";
import { TrendingUp, PieChart, Users, Download, ArrowUpRight } from "lucide-react";
import {
  ReportFilterBar,
  ReportKPIs,
  FunnelAnalyticsCard,
  ExecutivePerformanceMatrix,
} from "@/components/team_leader/reports";
import { ExportLeadsModal } from "@/components/leads";
import { downloadReportsExport } from "@/lib/exportUtils";
import { useGetSalesExecutivesQuery } from "@/store/api/userApi";
import { useGetReportsSummaryQuery } from "@/store/api/leadApi";
import { PageHeader, BreadcrumbItem } from "./PageHeader";

export interface ReportsHubViewProps {
  title?: string;
  description?: string;
  leadReportHref?: string;
  performanceReportHref?: string;
  breadcrumbs?: BreadcrumbItem[];
}

export const ReportsHubView: React.FC<ReportsHubViewProps> = ({
  title = "Performance & Conversion Reports",
  description = "Executive pipeline performance, funnel stage drop-offs, channel origin ROI, and systemic sales velocity.",
  leadReportHref = "/dashboard/reports/leads",
  performanceReportHref = "/dashboard/reports/performance",
  breadcrumbs,
}) => {
  const [timeRange, setTimeRange] = useState("7d");
  const [selectedExecutive, setSelectedExecutive] = useState("ALL");
  const [selectedSource, setSelectedSource] = useState("ALL");
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleResetFilters = () => {
    setTimeRange("7d");
    setSelectedExecutive("ALL");
    setSelectedSource("ALL");
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await downloadReportsExport({
        timeRange,
        source: selectedSource !== "ALL" ? selectedSource : undefined,
        executiveId:
          selectedExecutive !== "ALL" ? selectedExecutive : undefined,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const { data: executivesRes } = useGetSalesExecutivesQuery();
  const executivesList = (executivesRes?.data || []).map((e) => ({
    id: e.id,
    name: e.name,
  }));

  const { data: reportsRes, isLoading } = useGetReportsSummaryQuery({
    timeRange,
    executiveId: selectedExecutive === "ALL" ? undefined : selectedExecutive,
    source: selectedSource === "ALL" ? undefined : selectedSource,
  });

  const reportData = reportsRes?.data;

  return (
    <div className="space-y-3.5 animate-in fade-in duration-200">
      {/* Page Header */}
      <PageHeader
        title={title}
        description={description}
        icon={<TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
        breadcrumbs={breadcrumbs}
        actions={
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? "Exporting..." : "Export Excel Report"}</span>
          </button>
        }
      />

      {/* Quick Navigation Cards */}
      {(leadReportHref || performanceReportHref) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {leadReportHref && (
            <Link
              href={leadReportHref}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500/50 hover:shadow-md transition-all group flex items-center justify-between"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                  <PieChart className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    Detailed Leads Report
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 font-medium">
                    Lead statuses, sources, conversions & distributions
                  </p>
                </div>
              </div>
            </Link>
          )}

          {performanceReportHref && (
            <Link
              href={performanceReportHref}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500/50 hover:shadow-md transition-all group flex items-center justify-between"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    Executive Scorecards
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 font-medium">
                    Individual conversion rates, workloads & response SLAs
                  </p>
                </div>
              </div>
            </Link>
          )}
        </div>
      )}

      {/* Filter Bar */}
      <ReportFilterBar
        timeRange={timeRange}
        setTimeRange={setTimeRange}
        selectedExecutive={selectedExecutive}
        setSelectedExecutive={setSelectedExecutive}
        selectedSource={selectedSource}
        setSelectedSource={setSelectedSource}
        executivesList={executivesList}
        onExport={handleExport}
        isExporting={isExporting}
        onReset={handleResetFilters}
      />

      {/* KPI Cards */}
      <ReportKPIs kpis={reportData?.kpis} isLoading={isLoading} />

      {/* Funnel Analytics & Executive Matrix */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <FunnelAnalyticsCard
          stages={reportData?.funnel}
          isLoading={isLoading}
        />
        <ExecutivePerformanceMatrix
          executives={reportData?.executives}
          isLoading={isLoading}
        />
      </div>

      {/* Export Modal */}
      <ExportLeadsModal
        open={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        selectedLeadIds={[]}
        totalMatchingCount={reportData?.kpis?.totalIntake || 0}
      />
    </div>
  );
};
