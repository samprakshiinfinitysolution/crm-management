"use client";

import React from "react";
import {
  TrendingUp,
  Briefcase,
  UserCheck,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Mail,
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

interface ExecutiveCardStreamViewProps {
  executives: SalesExecutiveSummary[];
  isLoading?: boolean;
  page: number;
  setPage: (page: number) => void;
  limit: number;
  setLimit: (limit: number) => void;
  totalItems: number;
  totalPages: number;
}

export const ExecutiveCardStreamView: React.FC<
  ExecutiveCardStreamViewProps
> = ({
  executives = [],
  isLoading = false,
  page,
  setPage,
  limit,
  setLimit,
  totalItems,
  totalPages,
}) => {
  const dispatch = useAppDispatch();
  const { isUserOnline } = useSocket();
  const [toggleStatus, { isLoading: isToggling }] =
    useToggleExecutiveStatusMutation();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OPTIMAL":
        return {
          label: "OPTIMAL",
          badge:
            "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
          bar: "bg-emerald-500",
        };
      case "NEAR_CAPACITY":
        return {
          label: "NEAR CAPACITY",
          badge:
            "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800",
          bar: "bg-amber-500",
        };
      case "OVERLOADED":
        return {
          label: "OVERLOADED",
          badge:
            "bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800",
          bar: "bg-rose-500",
        };
      default:
        return {
          label: "ACTIVE",
          badge:
            "bg-card text-slate-700 dark:text-slate-300 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
          bar: "bg-indigo-500",
        };
    }
  };

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
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="p-4 rounded-lg bg-card dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 animate-pulse flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-11 h-11 rounded-full bg-card dark:bg-slate-800 shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="w-36 h-4 bg-card/70 dark:bg-slate-700 rounded" />
                <div className="w-48 h-3 bg-card dark:bg-slate-800 rounded" />
              </div>
            </div>
            <div className="w-32 h-6 bg-card dark:bg-slate-800 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (executives.length === 0) {
    return (
      <div className="bg-card dark:bg-slate-900 rounded-lg border border-slate-200/90 dark:border-slate-800 p-12 text-center shadow-xs flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-lg bg-card dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 flex items-center justify-center">
          <UserCheck className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            No Sales Executives Match Criteria
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
            Try adjusting your search query, status, or capacity filter
            settings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Stream Header */}
      <div className="flex items-center justify-between px-1 text-xs">
        <h3 className="font-bold text-slate-900 dark:text-white">
          Representative Roster Stream ({totalItems} Staff)
        </h3>
        <span className="text-[11px] font-bold text-slate-400">
          Click card to inspect full lead dossier & activities
        </span>
      </div>

      {/* Cards List */}
      <div className="space-y-2.5">
        {executives.map((exec) => {
          const statusInfo = getStatusBadge(exec.workloadStatus);
          const currentLeads = exec.activeLeads || 0;
          const maxCapacity = 30;
          const capacityPercent = Math.min(
            100,
            Math.round((currentLeads / maxCapacity) * 100),
          );

          const initials = exec.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

          return (
            <div
              key={exec.id}
              onClick={() => dispatch(setSelectedExecutiveId(exec.id))}
              className="flex flex-col lg:flex-row lg:items-center justify-between p-4 rounded-lg border border-slate-200/90 dark:border-slate-800 bg-card dark:bg-slate-900 hover:border-indigo-400 dark:hover:border-indigo-700 hover:shadow-xs transition-all cursor-pointer group gap-4"
            >
              {/* Executive Details & Avatar */}
              <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                {/* Avatar with Status Ring */}
                <div className="relative shrink-0">
                  <div className="w-11 h-11 rounded-full bg-card dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold flex items-center justify-center text-xs border border-slate-200/60 dark:border-slate-700 shadow-2xs group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    {initials}
                  </div>
                  <span
                    title={isUserOnline(exec.id) ? "Online" : "Offline"}
                    className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-white dark:ring-slate-900 ${
                      isUserOnline(exec.id)
                        ? "bg-emerald-500"
                        : "bg-slate-300 dark:bg-slate-600"
                    }`}
                  />
                </div>

                {/* Name, Status Badges & Contact */}
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {exec.name}
                    </span>
                    <span
                      className={`text-[10px] font-black px-2 py-0.2 rounded-full border ${statusInfo.badge}`}
                    >
                      {statusInfo.label}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-card text-slate-800 dark:bg-slate-800 dark:text-slate-300 uppercase">
                      SALES EXECUTIVE
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 truncate">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      <span>{exec.email}</span>
                    </span>
                  </div>

                  {/* Workload Progress & Win Rate Badges */}
                  <div className="flex items-center gap-3 pt-0.5 text-[11px] text-slate-400 flex-wrap">
                    <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                      <Briefcase className="w-3 h-3 text-slate-400" />
                      Load: {currentLeads}/{maxCapacity} ({capacityPercent}%)
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                      <TrendingUp className="w-3 h-3" />
                      Win Rate: {exec.conversionRate}% ({exec.convertedLeads}{" "}
                      Won)
                    </span>
                    {exec.followUpsOverdue > 0 ? (
                      <span className="flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.2 rounded-md border border-amber-200 dark:border-amber-800">
                        <AlertCircle className="w-3 h-3" />
                        {exec.followUpsOverdue} Overdue SLAs
                      </span>
                    ) : (
                      <span className="text-slate-400">
                        {exec.followUpsPending} Tasks Scheduled
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Controls & Financial Value */}
              <div
                className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Financial Value Pill */}
                <div className="text-left sm:text-right">
                  <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    ₹{((exec.totalPipelineValue ?? 0) / 100000).toFixed(1)}L
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                    Pipeline Value
                  </span>
                </div>

                {/* Quick Toggle Status */}
                <button
                  type="button"
                  title={`Click to ${exec.isActive ? "deactivate" : "activate"}`}
                  onClick={(e) => handleToggleStatus(e, exec.id, exec.isActive)}
                  disabled={isToggling}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    exec.isActive
                      ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100"
                      : "bg-card dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-card/70"
                  }`}
                >
                  {exec.isActive ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  <span>{exec.isActive ? "Active" : "Inactive"}</span>
                </button>

                {/* Details Button */}
                <button
                  type="button"
                  onClick={() => dispatch(setSelectedExecutiveId(exec.id))}
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white text-xs font-bold inline-flex items-center gap-1 transition-all"
                >
                  <span>Dossier</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
        {/* Pagination */}
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
};

export default ExecutiveCardStreamView;
