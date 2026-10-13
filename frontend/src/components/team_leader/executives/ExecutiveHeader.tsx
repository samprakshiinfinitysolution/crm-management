"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, RefreshCw, Send, Users } from "lucide-react";

interface ExecutiveHeaderProps {
  totalStaff: number;
  activeStaff: number;
  isLoading?: boolean;
  isFetching?: boolean;
  onRefresh: () => void;
}

export const ExecutiveHeader: React.FC<ExecutiveHeaderProps> = ({
  totalStaff,
  activeStaff,
  isLoading = false,
  isFetching = false,
  onRefresh,
}) => {
  return (
    <div className="flex flex-col gap-4 pb-2">
      {/* Top Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
            Live Workload & Roster Orchestrator
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Sales Executive Directory
          </h1>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>TL SECURE</span>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading || isFetching}
            className="h-9 px-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-card dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs disabled:opacity-50"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-blue-600 dark:text-blue-400" : ""}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <Link
            href="/team_leader/distribute"
            className="h-9 px-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Distribute Leads</span>
          </Link>
        </div>
      </div>

      {/* Sub-header Context Card */}
      <div className="bg-card dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-lg p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/team_leader"
              className="w-9 h-9 rounded-lg bg-card hover:bg-card/70 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-all active:scale-95 shrink-0"
              title="Return to Overview Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Staff Capacity & Quota Supervision
                </span>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[10px] font-bold border border-blue-200/60 dark:border-blue-800">
                  {activeStaff} of {totalStaff} Active
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Monitor individual workload quotas, conversion funnels, response
                SLAs, and assigned customer pipelines.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Benchmark:{" "}
              <span className="font-bold text-slate-900 dark:text-white">
                30 Leads / Rep
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveHeader;
