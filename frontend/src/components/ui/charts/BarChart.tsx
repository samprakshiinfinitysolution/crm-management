"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

export interface BarChartItem {
  label: string;
  value: number;
  formattedValue?: string;
  color?: string;
}

export interface BarChartProps {
  data: BarChartItem[];
  height?: number;
  orientation?: "vertical" | "horizontal";
  barColor?: string;
  valuePrefix?: string;
  valueSuffix?: string;
  showValuesOnTop?: boolean;
  isLoading?: boolean;
  className?: string;
}

export const BarChart: React.FC<BarChartProps> = ({
  data = [],
  height = 200,
  orientation = "vertical",
  barColor = "#2563eb", // Blue 600
  valuePrefix = "",
  valueSuffix = "",
  showValuesOnTop = false,
  isLoading = false,
  className,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div
        style={{ height }}
        className={cn(
          "flex w-full items-end justify-between gap-2 pt-4 animate-pulse",
          className
        )}
      >
        {[45, 60, 30, 75, 90, 50, 65, 40, 55, 70, 85].map((h, i) => (
          <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
            <div
              style={{ height: `${h}%` }}
              className="w-full max-w-[20px] rounded-t-md bg-slate-200 dark:bg-slate-800"
            />
          </div>
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div
        style={{ height }}
        className={cn(
          "flex w-full items-center justify-center rounded-xl border border-dashed border-slate-200 text-xs font-medium text-slate-400 dark:border-slate-800 dark:text-slate-500",
          className
        )}
      >
        No chart data recorded
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const activeItem = hoveredIndex !== null ? data[hoveredIndex] : null;

  if (orientation === "horizontal") {
    return (
      <div className={cn("w-full flex flex-col gap-3", className)}>
        {data.map((item, idx) => {
          const percentage = Math.max(4, (item.value / maxValue) * 100);
          const isHovered = hoveredIndex === idx;

          return (
            <div
              key={item.label}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="group flex flex-col gap-1 cursor-pointer"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {item.label}
                </span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {item.formattedValue || `${valuePrefix}${item.value.toLocaleString()}${valueSuffix}`}
                </span>
              </div>
              <div className="h-3.5 w-full rounded-full bg-slate-100 dark:bg-slate-800/80 p-0.5 overflow-hidden border border-slate-200/50 dark:border-slate-700/50">
                <div
                  style={{ width: `${percentage}%`, backgroundColor: item.color || barColor }}
                  className={cn(
                    "h-full rounded-full transition-all duration-500 shadow-2xs",
                    isHovered && "brightness-110 shadow-sm scale-y-105"
                  )}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Default Vertical orientation
  return (
    <div className={cn("w-full flex flex-col gap-2", className)}>
      {/* Active value banner */}
      <div className="flex justify-end h-5 text-xs font-bold text-blue-600 dark:text-blue-400">
        {activeItem && (
          <span className="animate-in fade-in duration-150">
            {activeItem.label}: {activeItem.formattedValue || `${valuePrefix}${activeItem.value.toLocaleString()}${valueSuffix}`}
          </span>
        )}
      </div>

      {/* Vertical Bars Grid */}
      <div
        style={{ height }}
        className="flex items-end justify-between gap-1.5 sm:gap-2.5 px-2 border-b border-slate-200/80 dark:border-slate-800"
      >
        {data.map((item, idx) => {
          const heightPercentage = Math.max(6, (item.value / maxValue) * 100);
          const isHovered = hoveredIndex === idx;
          const color = item.color || barColor;

          return (
            <div
              key={item.label}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="flex-1 flex flex-col items-center justify-end h-full group cursor-pointer relative"
            >
              {showValuesOnTop && isHovered && (
                <span className="absolute -top-6 text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded shadow-xs border border-slate-200 dark:border-slate-700 z-20 whitespace-nowrap">
                  {item.formattedValue || item.value}
                </span>
              )}

              {/* Bar Element */}
              <div
                style={{
                  height: `${heightPercentage}%`,
                  backgroundColor: color,
                }}
                className={cn(
                  "w-full max-w-[24px] rounded-t-md transition-all duration-200 shadow-2xs",
                  isHovered
                    ? "brightness-115 scale-x-110 shadow-md ring-2 ring-blue-500/20"
                    : "opacity-90 hover:opacity-100"
                )}
              />
            </div>
          );
        })}
      </div>

      {/* X Axis Labels */}
      <div className="flex items-center justify-between px-2 text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium pt-1">
        {data.map((item, idx) => (
          <span
            key={item.label}
            className={cn(
              "flex-1 text-center truncate px-0.5 transition-colors",
              hoveredIndex === idx && "font-bold text-blue-600 dark:text-blue-400"
            )}
          >
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
};

export default BarChart;
