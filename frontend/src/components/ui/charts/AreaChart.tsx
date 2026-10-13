"use client";

import React, { useState, useId } from "react";
import { cn } from "@/lib/utils";

export interface DataPoint {
  label: string;
  value: number;
  secondaryValue?: number;
  formattedValue?: string;
  formattedSecondaryValue?: string;
}

export interface AreaChartProps {
  data: DataPoint[];
  height?: number;
  primaryLabel?: string;
  secondaryLabel?: string;
  primaryColor?: string; // hex or tailwind stroke class
  secondaryColor?: string;
  showGridLines?: boolean;
  showLegend?: boolean;
  valuePrefix?: string;
  valueSuffix?: string;
  isLoading?: boolean;
  className?: string;
}

export const AreaChart: React.FC<AreaChartProps> = ({
  data = [],
  height = 220,
  primaryLabel = "Primary Metric",
  secondaryLabel = "Secondary Metric",
  primaryColor = "#2563eb", // Blue 600
  secondaryColor = "#f59e0b", // Amber 500
  showGridLines = true,
  showLegend = true,
  valuePrefix = "",
  valueSuffix = "",
  isLoading = false,
  className,
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const primaryGradId = useId();
  const secondaryGradId = useId();

  if (isLoading) {
    return (
      <div
        style={{ height }}
        className={cn(
          "flex w-full animate-pulse flex-col justify-end gap-3 pt-4",
          className
        )}
      >
        <div className="flex h-full w-full items-center justify-center rounded-xl bg-slate-100/70 dark:bg-slate-800/40">
          <div className="h-8 w-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin opacity-40" />
        </div>
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
        No chart data available
      </div>
    );
  }

  // Find max value across series for Y scaling
  const allValues = data.flatMap((d) => [
    d.value,
    d.secondaryValue !== undefined ? d.secondaryValue : 0,
  ]);
  const maxValue = Math.max(...allValues, 1);
  const paddingY = 24;
  const paddingX = 40;
  const svgWidth = 500;
  const svgHeight = height;

  const chartWidth = svgWidth - paddingX * 2;
  const chartHeight = svgHeight - paddingY * 2;

  // Calculate coordinates
  const points = data.map((d, i) => {
    const x = paddingX + (i / Math.max(1, data.length - 1)) * chartWidth;
    const y1 =
      paddingY + chartHeight - (d.value / maxValue) * chartHeight;
    const y2 =
      d.secondaryValue !== undefined
        ? paddingY + chartHeight - (d.secondaryValue / maxValue) * chartHeight
        : undefined;
    return { x, y1, y2, dataPoint: d, index: i };
  });

  // Generate smooth SVG paths
  const createSplinePath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return "";
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;

    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cx = (p0.x + p1.x) / 2;
      path += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return path;
  };

  const primaryLinePath = createSplinePath(
    points.map((p) => ({ x: p.x, y: p.y1 }))
  );
  const primaryAreaPath =
    points.length > 0
      ? `${primaryLinePath} L ${points[points.length - 1].x} ${
          paddingY + chartHeight
        } L ${points[0].x} ${paddingY + chartHeight} Z`
      : "";

  const hasSecondary = points.some((p) => p.y2 !== undefined);
  const secondaryLinePath = hasSecondary
    ? createSplinePath(
        points.filter((p): p is typeof p & { y2: number } => p.y2 !== undefined).map((p) => ({ x: p.x, y: p.y2 }))
      )
    : "";

  const hoverPoint = activeIndex !== null ? points[activeIndex] : null;

  return (
    <div className={cn("w-full flex flex-col gap-2", className)}>
      {/* Legend & Hover Info Header */}
      {showLegend && (
        <div className="flex flex-wrap items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 pb-1">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 rounded-full shadow-xs"
                style={{ backgroundColor: primaryColor }}
              />
              <span className="text-slate-700 dark:text-slate-300">{primaryLabel}</span>
            </span>
            {hasSecondary && (
              <span className="flex items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 rounded-full shadow-xs"
                  style={{ backgroundColor: secondaryColor }}
                />
                <span className="text-slate-700 dark:text-slate-300">{secondaryLabel}</span>
              </span>
            )}
          </div>

          {hoverPoint && (
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold animate-in fade-in duration-200">
              <span>{hoverPoint.dataPoint.label}:</span>
              <span>
                {hoverPoint.dataPoint.formattedValue ||
                  `${valuePrefix}${hoverPoint.dataPoint.value.toLocaleString()}${valueSuffix}`}
              </span>
              {hoverPoint.dataPoint.secondaryValue !== undefined && (
                <span className="text-amber-500 font-semibold">
                  (Sec: {hoverPoint.dataPoint.formattedSecondaryValue || hoverPoint.dataPoint.secondaryValue})
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* SVG Container */}
      <div className="relative w-full overflow-hidden rounded-xl">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            <linearGradient id={primaryGradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={primaryColor} stopOpacity="0.35" />
              <stop offset="100%" stopColor={primaryColor} stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id={secondaryGradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={secondaryColor} stopOpacity="0.2" />
              <stop offset="100%" stopColor={secondaryColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {showGridLines && (
            <g className="stroke-slate-200/80 dark:stroke-slate-800/80" strokeWidth="1" strokeDasharray="3 3">
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                const y = paddingY + chartHeight * ratio;
                return (
                  <line key={ratio} x1={paddingX} y1={y} x2={svgWidth - paddingX} y2={y} />
                );
              })}
            </g>
          )}

          {/* Primary Gradient Area Fill */}
          <path d={primaryAreaPath} fill={`url(#${primaryGradId})`} />

          {/* Primary Smooth Curve Line */}
          <path
            d={primaryLinePath}
            fill="none"
            stroke={primaryColor}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-300 drop-shadow-xs"
          />

          {/* Secondary Line */}
          {hasSecondary && (
            <path
              d={secondaryLinePath}
              fill="none"
              stroke={secondaryColor}
              strokeWidth="2.5"
              strokeDasharray="4 4"
              strokeLinecap="round"
              className="transition-all duration-300"
            />
          )}

          {/* Interactive Hover Indicators & Dots */}
          {points.map((p) => {
            const isHovered = activeIndex === p.index;
            return (
              <g
                key={p.index}
                onMouseEnter={() => setActiveIndex(p.index)}
                onMouseLeave={() => setActiveIndex(null)}
                className="cursor-pointer"
              >
                {/* Vertical Cursor Guide */}
                {isHovered && (
                  <line
                    x1={p.x}
                    y1={paddingY}
                    x2={p.x}
                    y2={paddingY + chartHeight}
                    stroke={primaryColor}
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                    className="opacity-70"
                  />
                )}

                {/* Data Circle Marker */}
                <circle
                  cx={p.x}
                  cy={p.y1}
                  r={isHovered ? 6 : 4}
                  fill="#ffffff"
                  stroke={primaryColor}
                  strokeWidth={isHovered ? 3 : 2}
                  className="transition-all duration-200 dark:fill-slate-900"
                />

                {/* Hit target area */}
                <rect
                  x={p.x - chartWidth / (data.length * 2)}
                  y={paddingY}
                  width={chartWidth / data.length}
                  height={chartHeight}
                  fill="transparent"
                />
              </g>
            );
          })}

          {/* X Axis Labels */}
          <g fontSize="10" className="fill-slate-400 dark:fill-slate-500 font-medium" textAnchor="middle">
            {points.map((p, idx) => {
              // Skip labels on dense charts if needed
              if (data.length > 12 && idx % Math.ceil(data.length / 8) !== 0) {
                return null;
              }
              return (
                <text key={idx} x={p.x} y={svgHeight - 4}>
                  {p.dataPoint.label}
                </text>
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
};

export default AreaChart;
