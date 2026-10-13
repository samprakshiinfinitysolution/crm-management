"use client";

import React from "react";
import {
  Users,
  Plus,
  Minus,
  ArrowLeft,
  Check,
  CheckCircle2,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SalesExecutiveSummary } from "@/types/api.types";
import { DistributionTabMode } from "./DistributeModeSelector";

interface ExecutiveQuotaSelectorProps {
  executives: SalesExecutiveSummary[];
  mode: DistributionTabMode;
  selectedExecutiveIds: string[];
  quotas: Record<string, number>;
  onToggleExecutive: (id: string) => void;
  onUpdateQuota: (id: string, quota: number) => void;
  onSelectAllExecutives?: () => void;
  onDeselectAllExecutives?: () => void;
  equalSharePerExecutive?: number;
  totalLeadsToDistribute: number;
  onBackToStep1?: () => void;
  onConfirmDistribute?: () => void;
  isSubmitting?: boolean;
  isValid?: boolean;
  allocatedCount?: number;
}

export const ExecutiveQuotaSelector: React.FC<ExecutiveQuotaSelectorProps> = ({
  executives = [],
  mode,
  selectedExecutiveIds = [],
  quotas = {},
  onUpdateQuota,
  equalSharePerExecutive = 0,
  totalLeadsToDistribute = 0,
  onBackToStep1,
  onConfirmDistribute,
  isSubmitting = false,
  isValid = true,
  allocatedCount,
}) => {
  // Only show the executives that were selected in Step 1
  const selectedExecutives = executives.filter((e) =>
    selectedExecutiveIds.includes(e.id),
  );

  const totalFixedQuotaAssigned = Object.values(quotas).reduce(
    (sum, val) => sum + (val || 0),
    0,
  );

  const targetAllocated =
    allocatedCount !== undefined ? allocatedCount : totalLeadsToDistribute;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col transition-all">
      {/* Header bar */}
      <div className="p-4 md:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800 flex items-center justify-center shrink-0">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-slate-100">
                Selected Sales Executives
              </h2>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800">
                {selectedExecutives.length} Active
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {mode === "EQUAL_SPLIT" &&
                `Each selected executive will receive ~${equalSharePerExecutive} leads from the allocation`}
              {mode === "FIXED_QUOTA" &&
                `Set custom lead distribution counts for each sales executive`}
              {mode === "MANUAL_PICK" &&
                `Designated assignees for individual lead assignments`}
              {mode === "REASSIGN_RECALL" && `Active queues for reassignment`}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {mode === "FIXED_QUOTA" && (
            <div className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
              Allocated: <strong>{totalFixedQuotaAssigned}</strong> /{" "}
              {totalLeadsToDistribute}
            </div>
          )}
          {mode !== "FIXED_QUOTA" && (
            <div className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
              Available Leads: <strong>{totalLeadsToDistribute}</strong>
            </div>
          )}

          {onBackToStep1 && (
            <button
              type="button"
              onClick={onBackToStep1}
              className="text-xs font-semibold px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Edit Reps in Step 1</span>
            </button>
          )}

          {/* Advance to Step 3 / Review Button */}
          {onConfirmDistribute && (
            <Button
              type="button"
              disabled={
                !isValid ||
                isSubmitting ||
                selectedExecutives.length === 0 ||
                targetAllocated === 0
              }
              onClick={onConfirmDistribute}
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    Proceed to Review
                    {targetAllocated > 0 ? ` (${targetAllocated} Leads)` : ""}
                  </span>
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Selected Executives List / Grid */}
      <div className="p-4 md:p-5">
        {selectedExecutives.length === 0 ? (
          <div className="text-center py-8 px-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-900/40">
            <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No sales executives selected yet
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
              Return to Step 1 to choose which executives will participate in
              this distribution.
            </p>

            {onBackToStep1 && (
              <button
                type="button"
                onClick={onBackToStep1}
                className="text-xs font-semibold px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Go to Step 1 (Select Executives)</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {selectedExecutives.map((exec) => {
              const currentQuota = quotas[exec.id] || 0;
              const initials = exec.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();

              return (
                <div
                  key={exec.id}
                  className="flex items-center justify-between p-3.5 rounded-lg bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500/60 transition-all shadow-2xs"
                >
                  {/* Left: Avatar + Name */}
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div className="w-9 h-9 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate">
                        {exec.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate">
                        {exec.email}
                      </p>
                    </div>
                  </div>

                  {/* Right: Assigned Lead Badge */}
                  <div className="shrink-0">
                    {mode === "EQUAL_SPLIT" && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800 shadow-2xs">
                        <Check className="w-3 h-3 text-blue-500" />
                        <span>+{equalSharePerExecutive} Leads</span>
                      </span>
                    )}

                    {mode === "FIXED_QUOTA" && (
                      <div
                        className="flex items-center gap-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateQuota(exec.id, Math.floor(currentQuota - 1))
                          }
                          className="w-6 h-6 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 flex items-center justify-center text-xs cursor-pointer"
                        >
                          <Minus className="w-2.5 h-2.5" />
                        </button>
                        <input
                          type="number"
                          min="0"
                          value={currentQuota}
                          onChange={(e) =>
                            onUpdateQuota(
                              exec.id,
                              parseInt(e.target.value) || 0,
                            )
                          }
                          className="w-12 text-center py-0.5 text-xs font-bold rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateQuota(exec.id, currentQuota + 1)
                          }
                          className="w-6 h-6 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 flex items-center justify-center text-xs cursor-pointer"
                        >
                          <Plus className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    )}

                    {mode === "MANUAL_PICK" && (
                      <span className="inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        Target Rep
                      </span>
                    )}

                    {mode === "REASSIGN_RECALL" && (
                      <span className="inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {exec.activeLeads || 0} Leads
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
