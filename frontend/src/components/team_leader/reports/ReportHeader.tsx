"use client";

import React from "react";
import { BarChart3, Download, RefreshCw } from "lucide-react";

interface ReportHeaderProps {
  onRefresh: () => void;
  onOpenExport: () => void;
  isFetching?: boolean;
}

export const ReportHeader: React.FC<ReportHeaderProps> = ({
  onRefresh,
  onOpenExport,
  isFetching = false,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-3.5 sm:p-4 bg-card dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-lg shadow-xs">
      <div>
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-800/60 rounded-lg text-blue-600 dark:text-blue-400">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Reports & Performance Intelligence
            </h1>
            <p className="text-xs text-slate-700 dark:text-slate-200 font-medium mt-0.5">
              Pipeline conversion funnel, lead acquisition velocity, and
              executive workload scorecards.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onRefresh}
          disabled={isFetching}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-card dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs transition-all disabled:opacity-50"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`}
          />
          <span>Refresh</span>
        </button>

        <button
          onClick={onOpenExport}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Excel Report</span>
        </button>
      </div>
    </div>
  );
};
