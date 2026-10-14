"use client";

import React from "react";
import { Calendar, GitFork, UploadCloud, BarChart3 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { TLDashboardSupervisor } from "@/types/api.types";

interface SupervisorBannerProps {
  supervisor?: TLDashboardSupervisor;
  onDistributeClick?: () => void;
  onImportClick?: () => void;
  onReportClick?: () => void;
}

export default function SupervisorBanner({
  supervisor,
  onDistributeClick,
  onImportClick,
  onReportClick,
}: SupervisorBannerProps) {
  const router = useRouter();

  const name = supervisor?.name || "Marcus Sterling";
  const currentDate =
    supervisor?.currentDate ||
    new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  const unassignedCount = supervisor?.quickCounts?.unassignedCount ?? 0;

  return (
    <section className="pt-1.5 pb-2">
      <div className="bg-card rounded-lg p-3.5 sm:p-4.5 border border-slate-200/80 shadow-xs flex flex-col gap-3">
        {/* Supervisor Profile Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-lg bg-blue-600 text-white font-bold text-base flex items-center justify-center shrink-0 shadow-xs">
              {name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">
                  {name}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-[11px] font-semibold">
                  Team Leader
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-200 font-medium mt-0.5">
                Overseeing sales pipeline, lead allocation, and team follow-ups
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-50 border border-slate-200/70 px-3 py-1.5 rounded-lg text-slate-700 text-xs font-semibold">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>{currentDate}</span>
          </div>
        </div>

        {/* Quick Operational Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={
              onDistributeClick ||
              (() => router.push("/dashboard/distributions"))
            }
            className="flex items-center justify-between p-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white active:scale-[0.99] transition-all shadow-xs cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <GitFork className="w-4 h-4 text-white" />
              <div className="text-left">
                <span className="text-xs font-semibold block leading-tight">
                  Distribute Leads
                </span>
                <span className="text-[11px] text-blue-100">
                  {unassignedCount} waiting
                </span>
              </div>
            </div>
            <span className="text-xs font-bold bg-card/20 px-2 py-0.5 rounded-md">
              Assign
            </span>
          </button>

          <button
            type="button"
            onClick={onImportClick || (() => router.push("/dashboard/imports"))}
            className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-card border border-slate-200 text-slate-700 dark:text-slate-300 active:scale-[0.99] transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <UploadCloud className="w-4 h-4 text-blue-600" />
              <div className="text-left">
                <span className="text-xs font-semibold block leading-tight">
                  Import Leads
                </span>
                <span className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                  Excel / CSV batch
                </span>
              </div>
            </div>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Upload</span>
          </button>

          <button
            type="button"
            onClick={onReportClick || (() => router.push("/dashboard/reports"))}
            className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-card border border-slate-200 text-slate-700 dark:text-slate-300 active:scale-[0.99] transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <BarChart3 className="w-4 h-4 text-slate-600" />
              <div className="text-left">
                <span className="text-xs font-semibold block leading-tight">
                  View Reports
                </span>
                <span className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                  Team performance
                </span>
              </div>
            </div>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">View</span>
          </button>
        </div>
      </div>
    </section>
  );
}
