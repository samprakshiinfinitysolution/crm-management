"use client";

import React from "react";
import {
  Users,
  UserCheck,
  Briefcase,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import type { SalesExecutiveSummary } from "@/types/api.types";

interface ExecutiveStatsCardsProps {
  executives: SalesExecutiveSummary[];
  isLoading?: boolean;
}

export default function ExecutiveStatsCards({
  executives,
  isLoading = false,
}: ExecutiveStatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="bg-card dark:bg-slate-900 p-4 rounded-lg border border-slate-200/90 dark:border-slate-800 shadow-xs animate-pulse flex flex-col gap-2"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800" />
            <div className="w-16 h-3 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="w-20 h-6 bg-slate-200 dark:bg-slate-800 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const totalExecutives = executives.length;
  const activeExecutives = executives.filter((e) => e.isActive).length;
  const totalActiveLeads = executives.reduce(
    (sum, e) => sum + e.activeLeads,
    0,
  );
  const totalConverted = executives.reduce(
    (sum, e) => sum + e.convertedLeads,
    0,
  );
  const totalAssigned = executives.reduce(
    (sum, e) => sum + e.totalAssignedLeads,
    0,
  );
  const avgConversionRate =
    totalAssigned > 0
      ? Math.round((totalConverted / totalAssigned) * 1000) / 10
      : 0;
  const totalOverdue = executives.reduce(
    (sum, e) => sum + e.followUpsOverdue,
    0,
  );

  const stats = [
    {
      label: "Total Executives",
      value: totalExecutives,
      subtext: `${activeExecutives} Active in field`,
      icon: <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
      iconBg:
        "bg-blue-50 dark:bg-blue-950/60 border-blue-100 dark:border-blue-900/50",
    },
    {
      label: "Active Staff",
      value: activeExecutives,
      subtext: `${totalExecutives - activeExecutives} Inactive/Paused`,
      icon: <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
      iconBg:
        "bg-blue-50 dark:bg-blue-950/60 border-blue-100 dark:border-blue-900/50",
    },
    {
      label: "Active Workload",
      value: totalActiveLeads,
      subtext: "Leads currently in pipeline",
      icon: <Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
      iconBg:
        "bg-blue-50 dark:bg-blue-950/60 border-blue-100 dark:border-blue-900/50",
    },
    {
      label: "Team Win Rate",
      value: `${avgConversionRate}%`,
      subtext: `${totalConverted} Deals Won/Sold`,
      icon: <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
      iconBg:
        "bg-blue-50 dark:bg-blue-950/60 border-blue-100 dark:border-blue-900/50",
    },
    {
      label: "Overdue Follow-ups",
      value: totalOverdue,
      subtext:
        totalOverdue > 0 ? "Requires supervisor nudge" : "All SLAs compliant",
      icon: <AlertTriangle className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
      iconBg:
        "bg-blue-50 dark:bg-blue-950/60 border-blue-100 dark:border-blue-900/50",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className="bg-white dark:bg-slate-900 p-3 sm:p-3.5 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-all hover:border-slate-300 dark:hover:border-slate-700"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
              {stat.label}
            </span>
            <div
              className={`w-7 h-7 rounded-lg border flex items-center justify-center ${stat.iconBg}`}
            >
              {stat.icon}
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {stat.value}
            </div>
            <div className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-0.5 truncate">
              {stat.subtext}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
