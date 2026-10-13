"use client";

import React from "react";
import { AlertCircle, Split, ArrowRight, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { TLDashboardUrgentAttention } from "@/types/api.types";

interface UrgentAttentionBannerProps {
  data?: TLDashboardUrgentAttention;
  unassignedCount?: number;
  batchName?: string;
  onEqualSplit?: () => void;
  onMatrixRule?: () => void;
  isLoading?: boolean;
}

export default function UrgentAttentionBanner({
  data,
  unassignedCount: propUnassignedCount,
  batchName: propBatchName,
  onEqualSplit,
  onMatrixRule,
  isLoading = false,
}: UrgentAttentionBannerProps) {
  const router = useRouter();

  if (isLoading) {
    return (
      <section className="py-1">
        <div className="bg-card dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-lg animate-pulse flex items-center justify-between">
          <div className="h-4 w-48 bg-card/70 dark:bg-slate-700 rounded" />
          <div className="h-8 w-24 bg-card/70 dark:bg-slate-700 rounded-lg" />
        </div>
      </section>
    );
  }

  const count = data?.unassignedCount ?? propUnassignedCount ?? 0;
  const fileName =
    data?.latestBatch?.fileName || propBatchName || "Latest Excel file";
  const execCount = data?.activeExecutivesCount ?? 5;

  const handleEqualSplit = () => {
    if (onEqualSplit) {
      onEqualSplit();
    } else {
      router.push("/dashboard/distributions");
    }
  };

  const handleCustomDistribution = () => {
    if (onMatrixRule) {
      onMatrixRule();
    } else {
      router.push("/dashboard/distributions");
    }
  };

  if (count === 0) {
    return (
      <section className="py-1">
        <div className="bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 p-4 sm:p-5 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-100">
                All Leads Assigned
              </h3>
              <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 mt-0.5">
                The intake pool is clear. All incoming leads have been assigned
                to sales representatives.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => router.push("/dashboard/imports")}
            className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer transition-all self-start sm:self-auto"
          >
            Import Leads
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="py-1">
      <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 p-4 sm:p-5 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
            <AlertCircle className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-amber-950 dark:text-amber-100">
                {count} {count === 1 ? "Lead" : "Leads"} Waiting for Assignment
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-700/60">
                Needs Review
              </span>
            </div>

            <p className="text-xs text-amber-800/90 dark:text-amber-300/90 mt-1">
              Unassigned leads from{" "}
              <span className="font-semibold text-amber-950 dark:text-amber-100">
                {fileName}
              </span>{" "}
              are waiting to be allocated to reps.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={handleEqualSplit}
            className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Split className="w-3.5 h-3.5" />
            <span>Equally leads distribute ({execCount} Reps)</span>
          </button>

          <button
            type="button"
            onClick={handleCustomDistribution}
            className="px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-card dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all"
          >
            <span>Custom lead distribution</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
}
