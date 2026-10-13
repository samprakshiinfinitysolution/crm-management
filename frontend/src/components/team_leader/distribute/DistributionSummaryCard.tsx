"use client";

import React from "react";
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DistributionTabMode } from "./DistributeModeSelector";

interface DistributionSummaryCardProps {
  mode: DistributionTabMode;
  totalLeadsToDistribute: number;
  selectedExecutiveCount: number;
  allocatedCount: number;
  remainderCount: number;
  isSubmitting?: boolean;
  onExecuteDistribution: () => void;
  onBack?: () => void;
  isValid: boolean;
  validationMessage?: string;
}

export const DistributionSummaryCard: React.FC<
  DistributionSummaryCardProps
> = ({
  mode,
  totalLeadsToDistribute,
  selectedExecutiveCount,
  allocatedCount,
  remainderCount,
  isSubmitting = false,
  onExecuteDistribution,
  onBack,
  isValid = true,
  validationMessage,
}) => {
  const formatModeBadge = (m: string) => {
    switch (m) {
      case "EQUAL_SPLIT":
        return "EQUALLY LEADS DISTRIBUTE";
      case "FIXED_QUOTA":
        return "CUSTOM LEAD DISTRIBUTION";
      case "MANUAL_PICK":
        return "MANUAL PICK";
      case "REASSIGN_RECALL":
        return "REASSIGN / RECALL";
      default:
        return m.replace("_", " ");
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl p-6 md:p-7 shadow-xs border border-slate-200/90 dark:border-slate-800 flex flex-col justify-between gap-6 transition-all">
      {/* Top Title & Badge */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base md:text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Distribution Engine Summary
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Deterministic allocation calculation before atomic database commit
          </p>
        </div>

        <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800 tracking-wider uppercase shrink-0">
          {formatModeBadge(mode)}
        </span>
      </div>

      {/* Numerical Metrics Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 rounded-lg p-4.5 space-y-1 shadow-2xs">
          <span className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
            Total Leads
          </span>
          <div className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
            {totalLeadsToDistribute}
          </div>
        </div>

        <div className="bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 rounded-lg p-4.5 space-y-1 shadow-2xs">
          <span className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
            Active Targets
          </span>
          <div className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
            {selectedExecutiveCount}
          </div>
        </div>

        <div className="bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 rounded-lg p-4.5 space-y-1 shadow-2xs">
          <span className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
            Will Allocate
          </span>
          <div className="text-2xl md:text-3xl font-bold text-emerald-600 dark:text-emerald-400">
            {allocatedCount}
          </div>
        </div>

        <div className="bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 rounded-lg p-4.5 space-y-1 shadow-2xs">
          <span className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
            Pool Remainder
          </span>
          <div className="text-2xl md:text-3xl font-bold text-amber-600 dark:text-amber-400">
            {remainderCount}
          </div>
        </div>
      </div>

      {/* Validation Message or ACID Guarantee */}
      <div className="space-y-2">
        {!isValid && validationMessage ? (
          <div className="flex items-center gap-2.5 p-3.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-200 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{validationMessage}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              <strong className="text-slate-900 dark:text-white font-semibold">
                ACID Guarantee:
              </strong>{" "}
              Distribution executes inside an isolated transaction. History
              ledger is automatically preserved.
            </span>
          </div>
        )}
      </div>

      {/* Bottom Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="text-xs font-semibold px-4 py-2 rounded-lg bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              Back to Allocations
            </button>
          )}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Lock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Authorized Team Leader</span>
          </div>
        </div>

        <Button
          type="button"
          disabled={!isValid || isSubmitting || allocatedCount === 0}
          onClick={onExecuteDistribution}
          className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-xs flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Distributing Leads...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm & Allocate {allocatedCount} Leads</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
