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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 p-3.5 rounded-sm border border-[#e0e0e0] dark:border-slate-800 shadow-2xs animate-pulse flex flex-col gap-2"
          >
            <div className="w-7 h-7 rounded-xs bg-slate-100 dark:bg-slate-800" />
            <div className="w-16 h-3 bg-slate-100 dark:bg-slate-800 rounded-xs" />
            <div className="w-20 h-6 bg-slate-100 dark:bg-slate-800 rounded-xs" />
          </div>
        ))}
      </div>
    );
  }

  const totalExecutives = executives.length;
  const activeExecutives = executives.filter((e) => e.isActive).length;
  const totalActiveLeads = executives.reduce(
    (sum, e) => sum + (e.activeLeads || 0),
    0,
  );
  const totalConverted = executives.reduce(
    (sum, e) => sum + (e.convertedLeads || 0),
    0,
  );
  const totalAssigned = executives.reduce(
    (sum, e) => sum + (e.totalAssignedLeads || 0),
    0,
  );
  const avgConversionRate =
    totalAssigned > 0
      ? Math.round((totalConverted / totalAssigned) * 1000) / 10
      : 0;
  const totalOverdue = executives.reduce(
    (sum, e) => sum + (e.followUpsOverdue || 0),
    0,
  );

  const stats = [
    {
      label: "Total Staff",
      value: totalExecutives,
      subtext: `${activeExecutives} Active in field`,
      icon: <Users className="w-4 h-4 text-[#2874f0]" />,
    },
    {
      label: "Active Accounts",
      value: activeExecutives,
      subtext: `${totalExecutives - activeExecutives} Inactive / Paused`,
      icon: <UserCheck className="w-4 h-4 text-[#2874f0]" />,
    },
    {
      label: "Active Workload",
      value: totalActiveLeads,
      subtext: "Live listings in pipeline",
      icon: <Briefcase className="w-4 h-4 text-[#2874f0]" />,
    },
    {
      label: "Team Win Rate",
      value: `${avgConversionRate}%`,
      subtext: `${totalConverted} Deals Won / Sold`,
      icon: <TrendingUp className="w-4 h-4 text-emerald-600" />,
    },
    {
      label: "Overdue SLAs",
      value: totalOverdue,
      subtext:
        totalOverdue > 0 ? "Requires supervisor check" : "All SLAs compliant",
      icon: <AlertTriangle className="w-4 h-4 text-rose-600" />,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className="bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 rounded-sm shadow-2xs p-3.5 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              {stat.label}
            </span>
            <div className="w-7 h-7 rounded-xs bg-[#eaf4fe] dark:bg-blue-950/60 flex items-center justify-center">
              {stat.icon}
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-slate-100">
              {stat.value}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              {stat.subtext}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
