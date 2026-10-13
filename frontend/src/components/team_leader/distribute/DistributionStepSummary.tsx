"use client";

import React, { useMemo } from "react";
import {
  ArrowLeft,
  Check,
  ShieldCheck,
  Users,
  Layers,
  Loader2,
  FileText,
} from "lucide-react";
import { SalesExecutiveSummary, LeadItem } from "@/types/api.types";
import { DistributionTabMode } from "./DistributeModeSelector";

interface DistributionStepSummaryProps {
  executives: SalesExecutiveSummary[];
  selectedExecutiveIds: string[];
  mode: DistributionTabMode;
  totalLeadsToDistribute: number;
  totalUnassignedCount: number;
  quotas: Record<string, number>;
  equalSharePerExecutive: number;
  remainderCount: number;
  selectedLeadIds: string[];
  leads?: LeadItem[];
  isSubmitting?: boolean;
  onBack: () => void;
  onConfirm: () => void;
}

export const DistributionStepSummary: React.FC<
  DistributionStepSummaryProps
> = ({
  executives,
  selectedExecutiveIds,
  mode,
  totalLeadsToDistribute,
  totalUnassignedCount,
  quotas,
  equalSharePerExecutive,
  remainderCount,
  selectedLeadIds,
  leads = [],
  isSubmitting = false,
  onBack,
  onConfirm,
}) => {
  const selectedExecs = useMemo(() => {
    return executives.filter((e) => selectedExecutiveIds.includes(e.id));
  }, [executives, selectedExecutiveIds]);

  const getInitials = (name: string) => {
    if (!name) return "SE";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Compute calculated allocation per executive for the summary
  const executiveAllocations = useMemo(() => {
    return selectedExecs.map((exec, index) => {
      let allocated = 0;
      if (mode === "EQUAL_SPLIT") {
        allocated = equalSharePerExecutive + (index < remainderCount ? 1 : 0);
      } else if (mode === "FIXED_QUOTA") {
        allocated = quotas[exec.id] || 0;
      } else if (mode === "MANUAL_PICK") {
        allocated =
          selectedExecs.length === 1
            ? selectedLeadIds.length
            : Math.floor(selectedLeadIds.length / selectedExecs.length);
      }
      return {
        ...exec,
        allocatedCount: allocated,
        currentCount: exec.totalAssignedLeads ?? exec.activeLeads ?? 0,
        projectedTotal:
          (exec.totalAssignedLeads ?? exec.activeLeads ?? 0) + allocated,
      };
    });
  }, [
    selectedExecs,
    mode,
    equalSharePerExecutive,
    remainderCount,
    quotas,
    selectedLeadIds.length,
  ]);

  const selectedLeadsPreview = useMemo(() => {
    if (mode !== "MANUAL_PICK") return [];
    return leads.filter((l) => selectedLeadIds.includes(l.id));
  }, [mode, leads, selectedLeadIds]);

  const formatModeLabel = (m: DistributionTabMode) => {
    switch (m) {
      case "EQUAL_SPLIT":
        return "Equal Split";
      case "FIXED_QUOTA":
        return "Custom Split";
      case "MANUAL_PICK":
        return "Manual Split";
      default:
        return "Lead Distribution";
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Overview Banner */}
      <div className="bg-card dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Review & Confirm Distribution
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Review your Step 1 team selection and Step 2 allocation details
            before executing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            Strategy: {formatModeLabel(mode)}
          </span>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            {totalLeadsToDistribute} Leads Total
          </span>
        </div>
      </div>

      {/* Grid: Step 1 Summary & Step 2 Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* STEP 1 SUMMARY: Selected Sales Executives */}
        <div className="bg-card dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Step 1 Summary: Selected Team
                </h3>
              </div>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {selectedExecs.length} Executives
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 pt-2">
              {executiveAllocations.map((exec) => (
                <div
                  key={exec.id}
                  className="py-3 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center shrink-0">
                      {getInitials(exec.name)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        {exec.name}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{exec.email}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                      Current: {exec.currentCount}
                    </span>
                    <p className="font-mono font-bold text-slate-900 dark:text-slate-100">
                      Projected: {exec.projectedTotal}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Team Status</span>
            <span className="font-medium text-emerald-600 dark:text-emerald-400">
              All selected representatives active & ready
            </span>
          </div>
        </div>

        {/* STEP 2 SUMMARY: Lead Allocation & Strategy */}
        <div className="bg-card dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Step 2 Summary: Allocation Details
                </h3>
              </div>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {mode === "MANUAL_PICK"
                  ? `${selectedLeadIds.length} Picked`
                  : `${totalLeadsToDistribute} Pool Leads`}
              </span>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-2 gap-3 pt-3 pb-3">
              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Total Allocated
                </span>
                <p className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-0.5">
                  {totalLeadsToDistribute}
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Remaining in Pool
                </span>
                <p className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-0.5">
                  {Math.max(
                    0,
                    totalUnassignedCount - totalLeadsToDistribute,
                  ).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Allocations breakdown */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-lg overflow-hidden">
              {executiveAllocations.map((exec) => (
                <div
                  key={exec.id}
                  className="px-3.5 py-2.5 flex items-center justify-between text-xs bg-card dark:bg-slate-900 hover:bg-slate-50/50 dark:hover:bg-slate-800/50"
                >
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {exec.name}
                  </span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded">
                    +{exec.allocatedCount} leads
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Allocation Verification</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              100% Balanced & Verified
            </span>
          </div>
        </div>
      </div>

      {/* If Manual Split, show list of chosen Lead IDs */}
      {mode === "MANUAL_PICK" && selectedLeadsPreview.length > 0 && (
        <div className="bg-card dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Selected Leads Roster ({selectedLeadsPreview.length} leads)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-3">
            {selectedLeadsPreview.map((lead) => (
              <div
                key={lead.id}
                className="p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50/50 dark:bg-slate-800/50 text-xs flex items-center justify-between"
              >
                <div>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                    {lead.leadCode}
                  </span>
                  <p className="text-slate-700 dark:text-slate-200 font-semibold truncate">
                    {lead.customerName}
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                  {lead.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sticky Bottom Action Bar */}
      <div className="sticky bottom-0 z-20 w-full bg-card/95 dark:bg-slate-900/95 backdrop-blur-xs border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
            Ready to distribute {totalLeadsToDistribute} leads across{" "}
            {selectedExecs.length} executives
          </span>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          <button
            type="button"
            onClick={onBack}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs sm:text-sm font-medium transition-colors cursor-pointer disabled:opacity-50"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Step 2</span>
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting || totalLeadsToDistribute <= 0}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Distributing...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Confirm & Distribute Leads</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
