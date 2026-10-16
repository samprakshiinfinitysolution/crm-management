"use client";

import React, { useState, useMemo } from "react";
import type { DashboardMonthlySalesItem } from "@/types/api.types";

export interface CRMDashboardTopKPIsProps {
  wonDeals?: number;
  wonRevenue?: number | string;
  intakeOrNewCount?: number;
  activePipeline?: number;
  isSE?: boolean;
  monthlyTrends?: DashboardMonthlySalesItem[];
  chartData?: { date: string; value: number }[];
  // Backwards-compatible aliases
  unitsSold?: number;
  salesAmount?: number | string;
  newOrders?: number;
  activeListings?: number;
}

export function CRMDashboardTopKPIs({
  wonDeals,
  wonRevenue,
  intakeOrNewCount,
  activePipeline,
  isSE = false,
  monthlyTrends,
  chartData,
  unitsSold,
  salesAmount,
  newOrders,
  activeListings,
}: CRMDashboardTopKPIsProps) {
  const [activeChartTab, setActiveChartTab] = useState<"revenue" | "units" | "intake">("revenue");

  const effectiveWonDeals = wonDeals ?? unitsSold ?? 0;
  const effectiveWonRevenue = wonRevenue ?? salesAmount ?? 0;
  const effectiveIntake = intakeOrNewCount ?? newOrders ?? 0;
  const effectiveActive = activePipeline ?? activeListings ?? 0;

  // Format currency
  const formatINR = (val: number | string) => {
    const num = Number(val);
    if (isNaN(num)) return `₹ ${val}`;
    return `₹ ${num.toLocaleString("en-IN")}`;
  };

  // Sparkline points dynamically reactive to selected tab
  const points = useMemo(() => {
    if (monthlyTrends && monthlyTrends.length > 0) {
      return monthlyTrends.slice(-5).map((m) => {
        let val = m.grossAmount || 0;
        if (activeChartTab === "units") {
          val = m.wonLeads || 0;
        } else if (activeChartTab === "intake") {
          val = m.totalLeads || 0;
        }
        return {
          date: m.month,
          value: val,
        };
      });
    }

    if (chartData && chartData.length > 0) {
      return chartData;
    }

    return [];
  }, [monthlyTrends, chartData, activeChartTab]);

  // Calculate SVG curve path
  const svgWidth = 220;
  const svgHeight = 60;
  const paddingX = 15;
  const paddingY = 10;
  const minVal = points.length > 0 ? Math.min(...points.map((p) => p.value)) : 0;
  const maxVal = points.length > 0 ? Math.max(...points.map((p) => p.value)) || 1 : 1;

  const getCoordinates = (index: number, val: number) => {
    const denom = Math.max(points.length - 1, 1);
    const x = paddingX + (index / denom) * (svgWidth - paddingX * 2);
    const y =
      svgHeight -
      paddingY -
      ((val - minVal) / (maxVal - minVal || 1)) * (svgHeight - paddingY * 2);
    return { x, y };
  };

  const pathD =
    points.length > 0
      ? points
          .map((p, i) => {
            const { x, y } = getCoordinates(i, p.value);
            return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
          })
          .join(" ")
      : "";

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
      {/* KPI 1: Won Deals */}
      <div className="bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 rounded-sm p-3 sm:p-4 flex flex-col justify-between shadow-2xs hover:border-slate-300 transition-all">
        <div>
          <span className="text-xl sm:text-2xl font-bold font-mono text-slate-800 dark:text-slate-100 leading-tight">
            {effectiveWonDeals.toLocaleString("en-IN")}
          </span>
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
            Won Deals
          </p>
          <span className="text-[10px] text-slate-400 block font-mono">
            Closed conversions
          </span>
        </div>
      </div>

      {/* KPI 2: Won Revenue */}
      <div className="bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 rounded-sm p-3 sm:p-4 flex flex-col justify-between shadow-2xs hover:border-slate-300 transition-all">
        <div>
          <span className="text-xl sm:text-2xl font-bold font-mono text-[#2874f0] dark:text-blue-400 leading-tight truncate block">
            {formatINR(effectiveWonRevenue)}
          </span>
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
            Won Revenue
          </p>
          <span className="text-[10px] text-slate-400 block font-mono">
            Attributed sales
          </span>
        </div>
      </div>

      {/* KPI 3: Intake / New Queue */}
      <div className="bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 rounded-sm p-3 sm:p-4 flex flex-col justify-between shadow-2xs hover:border-slate-300 transition-all">
        <div>
          <span className="text-xl sm:text-2xl font-bold font-mono text-slate-800 dark:text-slate-100 leading-tight">
            {effectiveIntake.toLocaleString("en-IN")}
          </span>
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
            {isSE ? "New Assigned Leads" : "Unassigned Pool"}
          </p>
          <span className="text-[10px] text-slate-400 block font-mono">
            {isSE ? "Pending outreach" : "Awaiting allocation"}
          </span>
        </div>
      </div>

      {/* KPI 4: Active Pipeline */}
      <div className="bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 rounded-sm p-3 sm:p-4 flex flex-col justify-between shadow-2xs hover:border-slate-300 transition-all">
        <div>
          <span className="text-xl sm:text-2xl font-bold font-mono text-slate-800 dark:text-slate-100 leading-tight">
            {effectiveActive.toLocaleString("en-IN")}
          </span>
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
            {isSE ? "Active Queue" : "Active Pipeline"}
          </p>
          <span className="text-[10px] text-slate-400 block font-mono">
            {isSE ? "In-flight interactions" : "In-flight leads"}
          </span>
        </div>
      </div>

      {/* KPI 5: Sparkline Chart Box (Takes 2 columns on lg) */}
      <div className="col-span-2 bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 rounded-sm p-2 sm:p-2.5 flex flex-col justify-between shadow-2xs">
        {/* Toggles */}
        <div className="flex items-center gap-1 text-[10px] font-medium text-slate-600 dark:text-slate-300">
          <button
            type="button"
            onClick={() => setActiveChartTab("revenue")}
            className={`px-2 py-0.5 rounded-xs transition-colors cursor-pointer ${
              activeChartTab === "revenue"
                ? "bg-[#2874f0] text-white font-semibold"
                : "hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            Revenue Trend
          </button>
          <button
            type="button"
            onClick={() => setActiveChartTab("units")}
            className={`px-2 py-0.5 rounded-xs transition-colors cursor-pointer ${
              activeChartTab === "units"
                ? "bg-[#2874f0] text-white font-semibold"
                : "hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            Won Deals
          </button>
          <button
            type="button"
            onClick={() => setActiveChartTab("intake")}
            className={`px-2 py-0.5 rounded-xs transition-colors cursor-pointer ${
              activeChartTab === "intake"
                ? "bg-[#2874f0] text-white font-semibold"
                : "hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            {isSE ? "New Leads" : "Intake Volume"}
          </button>
        </div>

        {/* SVG Sparkline */}
        {points.length === 0 ? (
          <div className="h-12 flex flex-col items-center justify-center text-center px-2">
            <span className="text-[11px] text-slate-400 font-medium">No pipeline trend recorded yet</span>
            <span className="text-[9px] text-slate-300 dark:text-slate-600">Dynamic trend populates with closed won deals</span>
          </div>
        ) : (
          <>
            <div className="mt-1 relative flex items-center justify-center">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full h-12 overflow-visible"
              >
                {/* Guide line */}
                <line
                  x1="0"
                  y1={svgHeight - 10}
                  x2={svgWidth}
                  y2={svgHeight - 10}
                  stroke="#e2e8f0"
                  strokeDasharray="2 2"
                />

                {/* Sparkline path */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="#2874f0"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data Dots */}
                {points.map((p, i) => {
                  const { x, y } = getCoordinates(i, p.value);
                  return (
                    <circle
                      key={p.date}
                      cx={x}
                      cy={y}
                      r="3.5"
                      className="fill-[#2874f0] stroke-white stroke-2"
                    />
                  );
                })}
              </svg>
            </div>

            {/* Dates bottom labels */}
            <div className="flex items-center justify-between text-[9px] text-slate-400 px-1 mt-0.5">
              {points.map((p) => (
                <span key={p.date}>{p.date}</span>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Backward-compatibility export alias
export const FlipkartDashboardTopKPIs = CRMDashboardTopKPIs;
export type TopKPIsProps = CRMDashboardTopKPIsProps;
