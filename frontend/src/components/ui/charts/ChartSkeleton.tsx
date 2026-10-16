import React from "react";
import { cn } from "@/lib/utils";

interface ChartSkeletonProps {
  height?: string | number;
  className?: string;
  title?: string;
}

export function ChartSkeleton({
  height = "h-64",
  className,
  title,
}: ChartSkeletonProps) {
  const heightClass = typeof height === "number" ? `h-[${height}px]` : height;

  return (
    <div
      className={cn(
        "w-full bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 rounded-sm p-4 animate-pulse flex flex-col justify-between shadow-2xs",
        heightClass,
        className
      )}
    >
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
        {title ? (
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{title}</span>
        ) : (
          <div className="h-4 w-36 bg-slate-200 dark:bg-slate-800 rounded" />
        )}
        <div className="h-3 w-16 bg-slate-100 dark:bg-slate-800 rounded" />
      </div>

      <div className="flex-1 flex items-end gap-3 pt-6 pb-2 px-2">
        <div className="h-3/5 flex-1 bg-slate-100 dark:bg-slate-800/70 rounded-xs" />
        <div className="h-4/5 flex-1 bg-slate-200 dark:bg-slate-800 rounded-xs" />
        <div className="h-2/5 flex-1 bg-slate-100 dark:bg-slate-800/70 rounded-xs" />
        <div className="h-full flex-1 bg-slate-200 dark:bg-slate-800 rounded-xs" />
        <div className="h-3/4 flex-1 bg-slate-100 dark:bg-slate-800/70 rounded-xs" />
        <div className="h-1/2 flex-1 bg-slate-200 dark:bg-slate-800 rounded-xs" />
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
        <div className="h-2.5 w-12 bg-slate-100 dark:bg-slate-800 rounded" />
        <div className="h-2.5 w-12 bg-slate-100 dark:bg-slate-800 rounded" />
        <div className="h-2.5 w-12 bg-slate-100 dark:bg-slate-800 rounded" />
        <div className="h-2.5 w-12 bg-slate-100 dark:bg-slate-800 rounded" />
      </div>
    </div>
  );
}

export default ChartSkeleton;
