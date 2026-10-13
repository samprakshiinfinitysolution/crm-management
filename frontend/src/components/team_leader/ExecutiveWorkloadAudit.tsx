"use client";

import React from "react";
import {
  ArrowRightLeft,
  BellRing,
  PlusCircle,
  Users,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useSocket } from "@/components/providers/SocketProvider";
import type { TLDashboardExecutiveWorkload } from "@/types/api.types";

interface ExecutiveWorkloadAuditProps {
  executives?: TLDashboardExecutiveWorkload[];
  isLoading?: boolean;
}

export default function ExecutiveWorkloadAudit({
  executives,
  isLoading,
}: ExecutiveWorkloadAuditProps) {
  const router = useRouter();
  const { isUserOnline } = useSocket();

  const handleAction = (rep: TLDashboardExecutiveWorkload) => {
    if (rep.actionType === "assign") {
      router.push("/dashboard/distributions/create");
    } else if (rep.actionType === "nudge") {
      toast.info(
        `Sent SLA follow-up reminder to ${rep.name} for ${rep.overdueCount} overdue leads`,
      );
    } else {
      router.push("/dashboard/users");
    }
  };

  if (isLoading) {
    return (
      <div className="bg-card dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-5 w-48 bg-card/70 dark:bg-slate-800 animate-pulse rounded-lg" />
          <div className="h-4 w-24 bg-card/70 dark:bg-slate-800 animate-pulse rounded-lg" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-12 w-full bg-card dark:bg-slate-800/60 animate-pulse rounded-lg"
            />
          ))}
        </div>
      </div>
    );
  }

  const reps = executives || [];

  return (
    <div className="bg-card dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col">
      {/* Header bar */}
      <div className="p-5 md:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Executive Workload & SLA Audit
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800">
              {reps.length} Active Reps
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Live pipeline quotas, response capacity, and overdue lead
            bottlenecks
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push("/dashboard/users")}
          className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer self-start sm:self-auto"
        >
          Manage All Reps →
        </button>
      </div>

      {reps.length === 0 ? (
        <div className="p-10 text-center text-xs text-slate-500 dark:text-slate-400">
          <Users className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-60" />
          <p className="font-bold text-sm text-slate-800 dark:text-slate-200">
            No sales executives found
          </p>
          <p className="mt-1">
            Add sales executives to start assigning and managing pipeline leads.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/75 dark:bg-slate-800/40 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4 font-semibold">
                  Sales Representative
                </th>
                <th className="py-3 px-4 font-semibold text-center">
                  Active Queue
                </th>
                <th className="py-3 px-4 font-semibold text-center">
                  Due Today
                </th>
                <th className="py-3 px-4 font-semibold text-center">Overdue</th>
                <th className="py-3 px-4 font-semibold">SLA Compliance</th>
                <th className="py-3 px-4 font-semibold text-right">
                  Closed Won
                </th>
                <th className="py-3 px-4 font-semibold text-right">
                  Quick Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {reps.map((rep) => {
                const initials = rep.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();

                const isOverloaded =
                  rep.capacityWarning || rep.activeCount >= 25;
                const isOptimal = !isOverloaded && rep.activeCount > 0;

                return (
                  <tr
                    key={rep.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group"
                  >
                    {/* Representative Info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-linear-to-tr from-blue-600 to-blue-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-slate-900 dark:text-white truncate">
                              {rep.name}
                            </span>
                            <span
                              className={`w-2 h-2 rounded-full shrink-0 ${
                                isUserOnline(rep.id)
                                  ? "bg-emerald-500"
                                  : "bg-slate-300 dark:bg-slate-600"
                              }`}
                              title={isUserOnline(rep.id) ? "Online" : "Offline"}
                            />
                            {rep.roleBadge && (
                              <span
                                className={`px-1.5 py-0.5 rounded-md text-[9px] font-extrabold ${
                                  rep.capacityWarning
                                    ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-900"
                                    : "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-900"
                                }`}
                              >
                                {rep.roleBadge}
                              </span>
                            )}
                          </div>
                          <span
                            className={`text-[11px] block truncate font-medium ${
                              rep.capacityWarning
                                ? "text-rose-600 dark:text-rose-400 font-semibold"
                                : rep.isStatusPositive
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-slate-400"
                            }`}
                          >
                            {rep.statusText}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Active Count */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full font-bold text-xs ${
                          isOverloaded
                            ? "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200/60"
                            : isOptimal
                              ? "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200/60"
                              : "bg-card text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        {rep.activeCount}
                      </span>
                    </td>

                    {/* Due Today */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {rep.dueTodayCount}
                      </span>
                    </td>

                    {/* Overdue */}
                    <td className="py-3.5 px-4 text-center">
                      {rep.overdueCount > 0 ? (
                        <span className="inline-flex items-center gap-1 font-bold text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-900">
                          <AlertTriangle className="w-3 h-3 text-rose-500 shrink-0" />
                          <span>{rep.overdueCount}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium">0</span>
                      )}
                    </td>

                    {/* SLA Progress */}
                    <td className="py-3.5 px-4 min-w-35">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-semibold">
                          <span className="text-slate-700 dark:text-slate-300">
                            {rep.slaPercent}%
                          </span>
                          <span className="text-slate-400 text-[10px]">
                            {rep.slaPercent >= 90 ? "Excellent" : "Standard"}
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-card/70 dark:bg-slate-700 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              rep.slaPercent >= 90
                                ? "bg-emerald-500"
                                : rep.slaPercent >= 70
                                  ? "bg-blue-600"
                                  : "bg-amber-500"
                            }`}
                            style={{
                              width: `${Math.min(100, Math.max(5, rep.slaPercent))}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Closed Won */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {rep.formattedWonAmount || `₹${rep.wonAmount || 0}`}
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase">
                        {rep.wonCount ? `${rep.wonCount} won` : "0 deals"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      {rep.actionType === "assign" && (
                        <button
                          type="button"
                          onClick={() => handleAction(rep)}
                          className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold text-xs transition-colors inline-flex items-center gap-1.5 border border-blue-200/60 dark:border-blue-800 cursor-pointer"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>Assign</span>
                        </button>
                      )}

                      {rep.actionType === "nudge" && (
                        <button
                          type="button"
                          onClick={() => handleAction(rep)}
                          className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900 text-amber-700 dark:text-amber-300 font-bold text-xs transition-colors inline-flex items-center gap-1.5 border border-amber-200/60 dark:border-amber-800 cursor-pointer"
                        >
                          <BellRing className="w-3.5 h-3.5 text-amber-600" />
                          <span>Nudge ({rep.overdueCount})</span>
                        </button>
                      )}

                      {rep.actionType === "reassign" && (
                        <button
                          type="button"
                          onClick={() => handleAction(rep)}
                          className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 font-bold text-xs transition-colors inline-flex items-center gap-1.5 border border-rose-200/60 dark:border-rose-900 cursor-pointer"
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                          <span>Reassign</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
