"use client";

import React from "react";
import {
  Layers,
  Forward,
  Award,
  Flag,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import type { TLDashboardPipelineHealth } from "@/types/api.types";

interface MetricItem {
  label: string;
  value: string;
  change?: string;
  subtext?: string;
  icon: React.ReactNode;
  isPositive?: boolean;
  highlightValueColor?: string;
  alertBadge?: string;
}

interface PipelineMetricsGridProps {
  data?: TLDashboardPipelineHealth;
  isLoading?: boolean;
}

export default function PipelineMetricsGrid({
  data,
  isLoading,
}: PipelineMetricsGridProps) {
  if (isLoading) {
    return (
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-4 w-36 bg-card/70 dark:bg-slate-800 animate-pulse rounded-md" />
          <div className="h-3 w-16 bg-card/70 dark:bg-slate-800 animate-pulse rounded-md" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-card dark:bg-slate-900 p-5 rounded-lg border border-slate-200/90 dark:border-slate-800 h-32 animate-pulse flex flex-col justify-between shadow-xs"
            >
              <div className="h-3 w-20 bg-card/70 dark:bg-slate-800 rounded" />
              <div className="h-7 w-24 bg-card/70 dark:bg-slate-800 rounded" />
              <div className="h-3 w-28 bg-card/70 dark:bg-slate-800 rounded" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  const metrics: MetricItem[] = [
    {
      label: "TOTAL POOL",
      value:
        data?.totalPool?.formattedValue || `${data?.totalPool?.value ?? 0}`,
      change: data?.totalPool?.change,
      subtext: data?.totalPool?.subtext || "all leads in system",
      isPositive: data?.totalPool?.isPositive ?? true,
      icon: <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
    },
    {
      label: "ACTIVE IN-FLIGHT",
      value:
        data?.activeInFlight?.formattedValue ||
        `${data?.activeInFlight?.value ?? 0}`,
      subtext:
        data?.activeInFlight?.subtext ||
        `${data?.activeInFlight?.callsToday ?? 0} calls today`,
      icon: <Forward className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
    },
    {
      label: "WON / ARR",
      value: data?.wonARR?.formattedValue || "₹0",
      subtext:
        data?.wonARR?.subtext ||
        `${data?.wonARR?.wonCount ?? 0} Closed • ${data?.wonARR?.conversionRate ?? 0}% rate`,
      icon: <Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
    },
    {
      label: "SLA ADHERENCE",
      value:
        data?.slaAdherence?.formattedValue ||
        `${data?.slaAdherence?.value ?? 100}%`,
      alertBadge: data?.slaAdherence?.alertBadge,
      subtext:
        data?.slaAdherence?.overdueCount === 0
          ? "All follow-ups on time"
          : undefined,
      icon: <Flag className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
    },
  ];

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
          Pipeline Health Matrix
        </h2>
        <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Live sync
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {metrics.map((item, idx) => (
          <div
            key={idx}
            className="bg-card dark:bg-slate-900 p-5 rounded-lg border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all group"
          >
            {/* Top row: Label & Icon */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {item.label}
              </span>
              <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/40">
                {item.icon}
              </div>
            </div>

            {/* Middle: Primary Metric */}
            <div className="my-2.5">
              <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                {item.value}
              </div>
            </div>

            {/* Bottom: Trend / Subtext / Badge */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 flex-wrap pt-1 border-t border-slate-100 dark:border-slate-800/60">
              {item.change && (
                <span
                  className={`font-semibold inline-flex items-center gap-0.5 ${
                    item.isPositive
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {item.isPositive ? (
                    <TrendingUp className="w-3.5 h-3.5" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5" />
                  )}
                  {item.change}
                </span>
              )}
              {item.subtext && <span className="truncate">{item.subtext}</span>}
              {item.alertBadge && (
                <span className="px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 font-bold text-[10px]">
                  {item.alertBadge}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
