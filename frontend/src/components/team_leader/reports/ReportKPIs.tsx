"use client";

import React from "react";
import { TrendingUp, Target, Clock, AlertTriangle } from "lucide-react";

interface ReportKPIsProps {
  kpis?: {
    totalIntake: number;
    intakeChangePercent: number;
    conversionRate: number;
    avgCycleTimeHours: number;
    slaComplianceRate: number;
    wonDealsCount: number;
  };
  isLoading?: boolean;
}

export const ReportKPIs: React.FC<ReportKPIsProps> = ({
  kpis,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-lg bg-card dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 animate-pulse"
          />
        ))}
      </div>
    );
  }

  const items = [
    {
      title: "Lead Intake Velocity",
      value: kpis?.totalIntake || 0,
      badge: `+${kpis?.intakeChangePercent || 0}% vs prev`,
      badgeColor:
        "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800/60",
      icon: TrendingUp,
      iconColor:
        "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border-blue-100 dark:border-blue-900/60",
    },
    {
      title: "Funnel Conversion Rate",
      value: `${kpis?.conversionRate || 0}%`,
      sub: `${kpis?.wonDealsCount || 0} Deals Closed Won`,
      icon: Target,
      iconColor:
        "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border-blue-100 dark:border-blue-900/60",
    },
    {
      title: "Avg. First Response Time",
      value: `${kpis?.avgCycleTimeHours || 0} hrs`,
      sub: "Lead assignment to outreach",
      icon: Clock,
      iconColor:
        "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border-blue-100 dark:border-blue-900/60",
    },
    {
      title: "SLA Adherence Rate",
      value: `${kpis?.slaComplianceRate || 0}%`,
      sub: "Contacted within 4-hour SLA",
      icon: AlertTriangle,
      iconColor:
        "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border-blue-100 dark:border-blue-900/60",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="p-5 rounded-lg bg-card dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {card.title}
              </span>
              <div className={`p-2 rounded-lg border ${card.iconColor}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {card.value}
              </span>
              {card.badge && (
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${card.badgeColor}`}
                >
                  {card.badge}
                </span>
              )}
            </div>
            {card.sub && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {card.sub}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};
