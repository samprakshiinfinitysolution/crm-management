"use client";

import React from "react";
import {
  User,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { handleApiError } from "@/lib/errorHandler";
import {
  useAppDispatch,
  setSelectedExecutiveId,
  useToggleExecutiveStatusMutation,
} from "@/store";
import { useSocket } from "@/components/providers/SocketProvider";
import type { SalesExecutiveSummary } from "@/types/api.types";
import { Pagination } from "@/components/ui";

interface ExecutivesTableProps {
  executives: SalesExecutiveSummary[];
  isLoading?: boolean;
  error?: unknown;
  onRefresh?: () => void;
  page: number;
  setPage: (page: number) => void;
  limit: number;
  setLimit: (limit: number) => void;
  totalItems: number;
  totalPages: number;
}

export default function ExecutivesTable({
  executives,
  isLoading = false,
  error,
  onRefresh,
  page,
  setPage,
  limit,
  setLimit,
  totalItems,
  totalPages,
}: ExecutivesTableProps) {
  const dispatch = useAppDispatch();
  const { isUserOnline } = useSocket();
  const [toggleStatus, { isLoading: isToggling }] =
    useToggleExecutiveStatusMutation();

  const handleToggleStatus = async (
    e: React.MouseEvent,
    execId: string,
    currentStatus: boolean,
  ) => {
    e.stopPropagation();
    try {
      const res = await toggleStatus({
        id: execId,
        isActive: !currentStatus,
      }).unwrap();
      toast.success(
        res.message ||
          `Executive status updated to ${!currentStatus ? "Active" : "Inactive"}`,
      );
    } catch (err: unknown) {
      handleApiError(err, "Failed to update executive status");
    }
  };

  if (isLoading) {
    return (
      <div className="bg-card dark:bg-slate-900 rounded-lg border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200/90 dark:border-slate-800 flex items-center justify-between">
          <div className="h-5 w-48 bg-card dark:bg-slate-800 rounded animate-pulse" />
          <div className="h-5 w-24 bg-card dark:bg-slate-800 rounded animate-pulse" />
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="p-4 flex items-center justify-between gap-4 animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-card dark:bg-slate-800" />
                <div className="flex flex-col gap-1">
                  <div className="w-32 h-4 bg-card dark:bg-slate-800 rounded" />
                  <div className="w-48 h-3 bg-slate-50 dark:bg-slate-800/60 rounded" />
                </div>
              </div>
              <div className="hidden sm:block w-24 h-4 bg-card dark:bg-slate-800 rounded" />
              <div className="hidden md:block w-20 h-4 bg-card dark:bg-slate-800 rounded" />
              <div className="w-24 h-8 bg-card dark:bg-slate-800 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card dark:bg-slate-900 rounded-lg border border-rose-200 dark:border-rose-900/60 p-8 text-center shadow-xs flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-100 dark:border-rose-900 text-rose-600 dark:text-rose-400 flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Failed to Load Sales Executives
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            An unexpected error occurred while querying the executive directory.
          </p>
        </div>
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className="px-4 py-2 bg-slate-900 dark:bg-card text-white dark:text-slate-900 rounded-lg text-xs font-semibold transition-all shadow-xs"
          >
            Retry Query
          </button>
        )}
      </div>
    );
  }

  if (executives.length === 0) {
    return (
      <div className="bg-card dark:bg-slate-900 rounded-lg border border-slate-200/90 dark:border-slate-800 p-12 text-center shadow-xs flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 flex items-center justify-center">
          <User className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            No Sales Executives Found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
            No sales executives match the current filter or search criteria.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card dark:bg-slate-900 rounded-lg border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
      {/* Table Title Bar */}
      <div className="p-4 border-b border-slate-200/90 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
            Sales Executive Directory & Workload Audit Table
          </h2>
          <span className="px-2 py-0.5 rounded-full bg-card dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold">
            {totalItems} Total
          </span>
        </div>
        <span className="text-[11px] text-slate-400">
          Click any executive row to inspect individual leads & follow-up queue
        </span>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-200/90 dark:border-slate-800 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">Sales Executive</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3">Active Workload</th>
              <th className="py-3 px-3">Conversion (Won)</th>
              <th className="py-3 px-3">Follow-Ups</th>
              <th className="py-3 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-700 dark:text-slate-300">
            {executives.map((exec) => {
              const initials = exec.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();

              const workloadBadgeClass =
                exec.workloadStatus === "OVERLOADED"
                  ? "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800"
                  : exec.workloadStatus === "NEAR_CAPACITY"
                    ? "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                    : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";

              const workloadBarClass =
                exec.workloadStatus === "OVERLOADED"
                  ? "bg-rose-500"
                  : exec.workloadStatus === "NEAR_CAPACITY"
                    ? "bg-amber-500"
                    : "bg-emerald-500";

              return (
                <tr
                  key={exec.id}
                  onClick={() => dispatch(setSelectedExecutiveId(exec.id))}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors group"
                >
                  {/* Executive Name & Avatar */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <div className="w-9 h-9 rounded-lg bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center font-bold text-xs shadow-xs border border-slate-200/60 dark:border-slate-700">
                          {initials}
                        </div>
                        <span
                          title={isUserOnline(exec.id) ? "Online" : "Offline"}
                          className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-slate-900 ${
                            isUserOnline(exec.id)
                              ? "bg-emerald-500"
                              : "bg-slate-300 dark:bg-slate-600"
                          }`}
                        />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {exec.name}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 truncate">
                          {exec.email}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Status & Quick Toggle */}
                  <td className="py-3.5 px-3">
                    <button
                      type="button"
                      title={`Click to ${exec.isActive ? "deactivate" : "activate"}`}
                      onClick={(e) =>
                        handleToggleStatus(e, exec.id, exec.isActive)
                      }
                      disabled={isToggling}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all ${
                        exec.isActive
                          ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100"
                          : "bg-card dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-card/70"
                      }`}
                    >
                      {exec.isActive ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <XCircle className="w-3 h-3 text-slate-400" />
                      )}
                      <span>{exec.isActive ? "Active" : "Inactive"}</span>
                    </button>
                  </td>

                  {/* Active Workload & Capacity */}
                  <td className="py-3.5 px-3">
                    <div className="flex flex-col gap-1 min-w-30">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {exec.activeLeads} leads
                        </span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase border ${workloadBadgeClass}`}
                        >
                          {exec.workloadStatus.replace("_", " ")}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-card dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${workloadBarClass}`}
                          style={{ width: `${exec.capacityPercentage}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {exec.capacityPercentage}% capacity (of 30 quota)
                      </span>
                    </div>
                  </td>

                  {/* Won & Conversion Rate */}
                  <td className="py-3.5 px-3">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1 font-semibold text-slate-900 dark:text-white">
                        <TrendingUp className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                        <span>{exec.convertedLeads} Won</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {exec.conversionRate}% win rate (
                        {exec.totalAssignedLeads} total)
                      </span>
                    </div>
                  </td>

                  {/* Follow-up Health */}
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-700 dark:text-slate-300 font-medium">
                        {exec.followUpsPending} pending
                      </span>
                      {exec.followUpsOverdue > 0 && (
                        <span className="px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold text-[10px] flex items-center gap-0.5">
                          <AlertCircle className="w-3 h-3" />
                          <span>{exec.followUpsOverdue} overdue</span>
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => dispatch(setSelectedExecutiveId(exec.id))}
                      className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-semibold inline-flex items-center gap-1 transition-all group-hover:bg-blue-600 group-hover:text-white"
                    >
                      <span>Details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
          {/* Pagination */}
        </table>
        <div className="">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            pageSize={limit}
            onPageSizeChange={setLimit}
            totalItems={totalItems}
          />
        </div>
      </div>
    </div>
  );
}
