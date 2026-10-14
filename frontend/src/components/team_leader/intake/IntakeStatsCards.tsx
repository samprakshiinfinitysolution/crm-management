"use client";

import React from "react";
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
} from "lucide-react";

interface IntakeStatsCardsProps {
  total: number;
  valid: number;
  duplicates: number;
  invalid: number;
}

export const IntakeStatsCards: React.FC<IntakeStatsCardsProps> = ({
  total,
  valid,
  duplicates,
  invalid,
}) => {
  const cards = [
    {
      title: "Total Staged Rows",
      value: total,
      sub: "Records in active sheet",
      icon: FileSpreadsheet,
    },
    {
      title: "Valid Ready Leads",
      value: valid,
      sub: `${total > 0 ? Math.round((valid / total) * 100) : 0}% passing checks`,
      icon: CheckCircle2,
    },
    {
      title: "Potential Duplicates",
      value: duplicates,
      sub: "Matching existing mobile/email",
      icon: AlertTriangle,
    },
    {
      title: "Incomplete / Invalid",
      value: invalid,
      sub: "Missing required attributes",
      icon: AlertCircle,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                {card.title}
              </span>
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                {card.value}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium">{card.sub}</p>
          </div>
        );
      })}
    </div>
  );
};
