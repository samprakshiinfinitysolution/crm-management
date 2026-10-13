"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface FunnelStageItem {
  stage: string;
  count: number;
  conversionPercentage: number;
  dropOffRate?: number;
}

export interface FunnelChartProps {
  stages?: FunnelStageItem[];
  isLoading?: boolean;
  className?: string;
}

export const FunnelChart: React.FC<FunnelChartProps> = ({
  stages = [],
  isLoading = false,
  className,
}) => {
  if (isLoading) {
    return (
      <div className={cn("space-y-4 py-4 animate-pulse", className)}>
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-10 rounded-xl bg-slate-100 dark:bg-slate-800"
          />
        ))}
      </div>
    );
  }

  if (!stages || stages.length === 0) {
    return (
      <div className={cn("py-12 text-center text-slate-500 dark:text-slate-400 text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-xl", className)}>
        No funnel data available for selected period
      </div>
    );
  }

  const maxCount = Math.max(...stages.map((s) => s.count), 1);

  return (
    <div className={cn("space-y-4", className)}>
      {stages.map((stage, idx) => {
        const isFinal = idx === stages.length - 1;
        const relativeWidthPercentage = Math.max(8, (stage.count / maxCount) * 100);

        return (
          <div key={stage.stage} className="group flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {stage.stage}
              </span>
              <span className="font-bold text-slate-900 dark:text-white">
                {stage.count.toLocaleString()} leads{" "}
                <span className="font-medium text-slate-400 dark:text-slate-500">
                  ({stage.conversionPercentage}%)
                </span>
              </span>
            </div>

            {/* Gradient Funnel Progress Bar */}
            <div className="h-3 w-full bg-slate-100 dark:bg-slate-800/90 rounded-full overflow-hidden p-0.5 border border-slate-200/60 dark:border-slate-700/60">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500 shadow-2xs group-hover:brightness-110",
                  isFinal
                    ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                    : "bg-gradient-to-r from-blue-600 via-blue-500 to-sky-400"
                )}
                style={{ width: `${relativeWidthPercentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FunnelChart;
