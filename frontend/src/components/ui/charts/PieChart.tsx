"use client";

import React, { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

export interface PieChartSegment {
  label: string;
  count: number;
  percentage?: number;
  color: string;
  dotColor?: string;
  formattedValue?: string;
}

export interface PieChartProps {
  data: PieChartSegment[];
  totalLabel?: string;
  totalValue?: number | string;
  variant?: "donut" | "pie";
  size?: number;
  showLegend?: boolean;
  isLoading?: boolean;
  className?: string;
}

export const PieChart: React.FC<PieChartProps> = ({
  data = [],
  totalLabel = "TOTAL",
  totalValue,
  variant = "donut",
  size = 160,
  showLegend = true,
  isLoading = false,
  className,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const totalCount = useMemo(() => {
    if (totalValue !== undefined) return totalValue;
    return data.reduce((acc, curr) => acc + curr.count, 0);
  }, [data, totalValue]);

  // Compute calculated percentages & SVG stroke offsets cleanly without mutating outer variables inside map
  const circumference = 346.18; // 2 * PI * r (r=55)
  const segmentsWithAngles = useMemo(() => {
    const total = data.reduce((acc, c) => acc + c.count, 0) || 1;
    const offsets: number[] = [];
    let currentOffset = 0;

    data.forEach((item) => {
      offsets.push(currentOffset);
      const percentage = item.percentage ?? Math.round((item.count / total) * 100);
      const strokeDash = Math.max(2, (percentage / 100) * circumference);
      currentOffset += strokeDash;
    });

    return data.map((item, idx) => {
      const percentage = item.percentage ?? Math.round((item.count / total) * 100);
      const strokeDash = Math.max(2, (percentage / 100) * circumference);

      return {
        ...item,
        percentage,
        strokeDasharray: `${strokeDash} ${circumference - strokeDash}`,
        strokeDashoffset: -offsets[idx],
        index: idx,
      };
    });
  }, [data, circumference]);

  if (isLoading) {
    return (
      <div className={cn("grid grid-cols-1 sm:grid-cols-12 items-center gap-4 py-4 animate-pulse", className)}>
        <div className="sm:col-span-6 flex items-center justify-center">
          <div className="w-36 h-36 rounded-full border-8 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700" />
          </div>
        </div>
        <div className="sm:col-span-6 flex flex-col gap-2.5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="h-3 w-20 bg-slate-200 dark:bg-slate-750 rounded" />
              <div className="h-3 w-8 bg-slate-200 dark:bg-slate-750 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={cn("py-12 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 gap-2 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl", className)}>
        <p className="text-xs font-medium">No distribution data available</p>
      </div>
    );
  }

  const activeSegment = hoveredIdx !== null ? segmentsWithAngles[hoveredIdx] : null;

  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-12 items-center gap-5 py-2", className)}>
      {/* SVG Donut / Pie Render */}
      <div className="sm:col-span-6 flex items-center justify-center relative">
        <svg
          viewBox="0 0 160 160"
          style={{ width: size, height: size }}
          className="overflow-visible select-none"
        >
          {segmentsWithAngles.map((seg) => {
            const isHovered = hoveredIdx === seg.index;
            return (
              <circle
                key={seg.label}
                cx="80"
                cy="80"
                r="55"
                fill="transparent"
                stroke={seg.color}
                strokeWidth={variant === "donut" ? (isHovered ? 24 : 20) : (isHovered ? 58 : 55)}
                strokeDasharray={seg.strokeDasharray}
                strokeDashoffset={seg.strokeDashoffset}
                onMouseEnter={() => setHoveredIdx(seg.index)}
                onMouseLeave={() => setHoveredIdx(null)}
                className={cn(
                  "cursor-pointer transition-all duration-300 transform origin-center",
                  isHovered && "scale-105 shadow-lg drop-shadow-md brightness-110"
                )}
              />
            );
          })}
        </svg>

        {/* Center Label (for Donut mode) */}
        {variant === "donut" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            {activeSegment ? (
              <div className="animate-in fade-in zoom-in-95 duration-150">
                <span className="text-xl font-bold text-slate-900 dark:text-white block">
                  {activeSegment.percentage}%
                </span>
                <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 truncate max-w-[90px] block">
                  {activeSegment.label}
                </span>
              </div>
            ) : (
              <div>
                <span className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight block">
                  {totalCount}
                </span>
                <span className="text-[9px] font-bold tracking-wider text-slate-400 dark:text-slate-500 block uppercase">
                  {totalLabel}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Legend List */}
      {showLegend && (
        <div className="sm:col-span-6 flex flex-col gap-2.5 text-xs">
          {segmentsWithAngles.map((seg) => {
            const isHovered = hoveredIdx === seg.index;
            return (
              <div
                key={seg.label}
                onMouseEnter={() => setHoveredIdx(seg.index)}
                onMouseLeave={() => setHoveredIdx(null)}
                className={cn(
                  "flex items-center justify-between p-1.5 rounded-lg transition-all cursor-pointer",
                  isHovered
                    ? "bg-slate-100 dark:bg-slate-800/80 shadow-2xs font-bold"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                )}
              >
                <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
                    style={{ backgroundColor: seg.color }}
                  />
                  <span className="truncate">{seg.label}</span>
                </span>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {seg.formattedValue || seg.count}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                    ({seg.percentage}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PieChart;
