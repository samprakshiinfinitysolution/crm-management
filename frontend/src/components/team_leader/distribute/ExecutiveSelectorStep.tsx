"use client";

import React, { useMemo } from "react";
import {
  Search,
  Users,
  TrendingUp,
  ArrowRight,
  CheckSquare,
  Square,
} from "lucide-react";
import { SalesExecutiveSummary } from "@/types/api.types";
import { Button } from "@/components/ui/button";
import { TableSkeletonRows } from "@/components/ui/TableSkeletonRows";

interface ExecutiveSelectorStepProps {
  executives: SalesExecutiveSummary[];
  selectedExecutiveIds: string[];
  onToggleExecutive: (id: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onAdvanceToStep2: () => void;
  isLoading?: boolean;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  workloadFilter?: "ALL" | "OPTIMAL" | "NEAR_CAPACITY" | "OVERLOADED";
  onWorkloadFilterChange?: (
    filter: "ALL" | "OPTIMAL" | "NEAR_CAPACITY" | "OVERLOADED",
  ) => void;
}

export const ExecutiveSelectorStep: React.FC<ExecutiveSelectorStepProps> = ({
  executives = [],
  selectedExecutiveIds = [],
  onToggleExecutive,
  onSelectAll,
  onDeselectAll,
  onAdvanceToStep2,
  isLoading = false,
  searchTerm = "",
  onSearchChange,
  workloadFilter = "ALL",
  onWorkloadFilterChange,
}) => {
  // Workload counts from current executive list
  const workloadCounts = useMemo(() => {
    const counts = {
      ALL: executives.length,
      OPTIMAL: 0,
      NEAR_CAPACITY: 0,
      OVERLOADED: 0,
    };
    executives.forEach((e) => {
      if (e.workloadStatus === "OPTIMAL") counts.OPTIMAL++;
      else if (e.workloadStatus === "NEAR_CAPACITY") counts.NEAR_CAPACITY++;
      else if (e.workloadStatus === "OVERLOADED") counts.OVERLOADED++;
    });
    return counts;
  }, [executives]);

  const isAllSelected =
    executives.length > 0 &&
    executives.every((e) => selectedExecutiveIds.includes(e.id));

  return (
    <div className="bg-card dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col">
      {/* 1. Header & Actions Toolbar */}
      <div className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Select Sales Representatives
            </h2>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              {selectedExecutiveIds.length} of {executives.length} Selected
            </span>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-200 font-medium mt-0.5">
            Choose representatives who will receive leads in this distribution
            round.
          </p>
        </div>

        {/* Quick Select & Advance Actions */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={isAllSelected ? onDeselectAll : onSelectAll}
            className="px-3 py-2 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            {isAllSelected ? (
              <>
                <Square className="w-3.5 h-3.5" />
                <span>Deselect All</span>
              </>
            ) : (
              <>
                <CheckSquare className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Select All ({executives.length})</span>
              </>
            )}
          </button>

          <Button
            type="button"
            disabled={selectedExecutiveIds.length === 0}
            onClick={onAdvanceToStep2}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <span>Continue to Step 2</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="px-3.5 sm:px-4 py-2.5 bg-slate-50/70 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Box */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-8 pr-7 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => onSearchChange?.("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              ×
            </button>
          )}
        </div>

        {/* Workload Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 text-xs">
          <button
            type="button"
            onClick={() => onWorkloadFilterChange?.("ALL")}
            className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
              workloadFilter === "ALL"
                ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs"
                : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
            }`}
          >
            All ({workloadCounts.ALL})
          </button>
          <button
            type="button"
            onClick={() => onWorkloadFilterChange?.("OPTIMAL")}
            className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
              workloadFilter === "OPTIMAL"
                ? "bg-emerald-600 dark:bg-emerald-500 text-white shadow-xs"
                : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
            }`}
          >
            Optimal ({workloadCounts.OPTIMAL})
          </button>
          <button
            type="button"
            onClick={() => onWorkloadFilterChange?.("NEAR_CAPACITY")}
            className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
              workloadFilter === "NEAR_CAPACITY"
                ? "bg-amber-600 dark:bg-amber-500 text-white shadow-xs"
                : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40"
            }`}
          >
            Near Capacity ({workloadCounts.NEAR_CAPACITY})
          </button>
          <button
            type="button"
            onClick={() => onWorkloadFilterChange?.("OVERLOADED")}
            className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
              workloadFilter === "OVERLOADED"
                ? "bg-rose-600 dark:bg-rose-500 text-white shadow-xs"
                : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
            }`}
          >
            Overloaded ({workloadCounts.OVERLOADED})
          </button>
        </div>
      </div>

      {/* 3. Executive Table View */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4 w-10 text-center">
                <button
                  type="button"
                  onClick={isAllSelected ? onDeselectAll : onSelectAll}
                  className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                  title={isAllSelected ? "Deselect all" : "Select all"}
                >
                  {isAllSelected ? (
                    <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
              </th>
              <th className="py-3 px-4">Sales Representative</th>
              <th className="py-3 px-4">Workload Status</th>
              <th className="py-3 px-4">Active Leads / Capacity</th>
              <th className="py-3 px-4">Win Rate</th>
              <th className="py-3 px-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {isLoading ? (
              <TableSkeletonRows columns={6} rows={8} />
            ) : executives.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-1 max-w-sm mx-auto">
                    <Users className="w-6 h-6 text-slate-300 dark:text-slate-600" />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      No sales representatives found
                    </span>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">
                      {searchTerm || workloadFilter !== "ALL"
                        ? "Try adjusting your search query or workload status filter."
                        : "No active sales executives are available."}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              executives.map((exec) => {
                const isSelected = selectedExecutiveIds.includes(exec.id);
                const statusInfo = exec.workloadStatus;
                const currentLeads = exec.activeLeads || 0;
                const maxCapacity = 30;
                const capacityPercent = Math.min(
                  100,
                  Math.round((currentLeads / maxCapacity) * 100),
                );

                const getStatusBadgeStyle = (status: string) => {
                  if (status === "OPTIMAL") return "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
                  if (status === "NEAR_CAPACITY") return "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800";
                  if (status === "OVERLOADED") return "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800";
                  return "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700";
                };

                const getProgressColor = (percent: number) => {
                  if (percent >= 90) return "bg-rose-500 dark:bg-rose-600";
                  if (percent >= 70) return "bg-amber-500 dark:bg-amber-600";
                  return "bg-emerald-500 dark:bg-emerald-600";
                };

                return (
                  <tr
                    key={exec.id}
                    onClick={() => onToggleExecutive(exec.id)}
                    className={`transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-blue-50/50 dark:bg-blue-950/30 hover:bg-blue-50/70 dark:hover:bg-blue-950/50"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    }`}
                  >
                    {/* Checkbox Column */}
                    <td
                      className="py-3 px-4 text-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleExecutive(exec.id);
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => onToggleExecutive(exec.id)}
                        className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>

                    {/* Representative Column */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                            isSelected
                              ? "bg-blue-600 text-white"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                          }`}
                        >
                          {exec.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <span className="font-semibold text-slate-900 dark:text-slate-100 block truncate">
                            {exec.name}
                          </span>
                          <span className="text-[11px] text-slate-400 dark:text-slate-500 block truncate">
                            {exec.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Workload Status Badge Column */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md border ${getStatusBadgeStyle(statusInfo)}`}
                      >
                        {statusInfo}
                      </span>
                    </td>

                    {/* Active Leads / Capacity Column */}
                    <td className="py-3 px-4 min-w-[160px]">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 dark:text-slate-400 font-medium">
                            {currentLeads} of {maxCapacity} leads
                          </span>
                          <span className="font-semibold text-slate-700 dark:text-slate-200">
                            {capacityPercent}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${getProgressColor(capacityPercent)}`}
                            style={{ width: `${capacityPercent}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Conversion / Win Rate Column */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-slate-700 dark:text-slate-200 font-semibold">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{exec.conversionRate}%</span>
                      </div>
                    </td>

                    {/* Participation Status Column */}
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                          isSelected
                            ? "text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800"
                            : "text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800"
                        }`}
                      >
                        {isSelected ? "Selected" : "Excluded"}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 4. Action Footer */}
      <div className="p-4 bg-slate-50/70 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-slate-500 dark:text-slate-400">
          <strong className="text-slate-900 dark:text-slate-100 font-semibold">
            {selectedExecutiveIds.length}
          </strong>{" "}
          of {executives.length} representatives selected
        </div>

        <Button
          type="button"
          disabled={selectedExecutiveIds.length === 0}
          onClick={onAdvanceToStep2}
          className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <span>Continue to Step 2 (Allocate Leads)</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
