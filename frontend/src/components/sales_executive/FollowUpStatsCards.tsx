"use client";

import React from "react";
import {
  Clock,
  AlertTriangle,
  CalendarCheck,
  CheckCircle2,
} from "lucide-react";
import { useGetFollowUpSummaryQuery } from "@/store/api/followUpApi";

interface FollowUpStatsCardsProps {
  onScopeSelect?: (
    scope: "today" | "overdue" | "upcoming" | "completed",
  ) => void;
  activeScope?: string;
}

export default function FollowUpStatsCards({
  onScopeSelect,
  activeScope = "today",
}: FollowUpStatsCardsProps) {
  const { data, isLoading } = useGetFollowUpSummaryQuery();
  const summary = data?.data;

  const cards = [
    {
      key: "today" as const,
      label: "Due Today",
      count: summary?.dueToday ?? 0,
      icon: <Clock className="w-4 h-4 text-[#2874f0]" />,
      badge: "High Priority",
      badgeStyle:
        "bg-[#eaf4fe] text-[#2874f0] border-blue-200 dark:bg-blue-950/60 dark:text-blue-300",
    },
    {
      key: "overdue" as const,
      label: "Overdue Items",
      count: summary?.overdue ?? 0,
      icon: <AlertTriangle className="w-4 h-4 text-rose-600" />,
      badge: (summary?.overdue ?? 0) > 0 ? "Action Required" : "Clean SLA",
      badgeStyle:
        (summary?.overdue ?? 0) > 0
          ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 font-bold"
          : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800",
    },
    {
      key: "upcoming" as const,
      label: "Upcoming Follow-ups",
      count: summary?.upcoming ?? 0,
      icon: <CalendarCheck className="w-4 h-4 text-[#2874f0]" />,
      badge: "Scheduled",
      badgeStyle:
        "bg-[#eaf4fe] text-[#2874f0] border-blue-200 dark:bg-blue-950/60 dark:text-blue-300",
    },
    {
      key: "completed" as const,
      label: "Completed (Month)",
      count: summary?.completedThisMonth ?? 0,
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
      badge: "Delivered",
      badgeStyle:
        "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card) => {
        const isActive = activeScope === card.key;
        return (
          <button
            key={card.key}
            type="button"
            onClick={() => onScopeSelect?.(card.key)}
            className={`text-left p-3.5 rounded-sm bg-white dark:bg-slate-900 border transition-all duration-150 flex flex-col justify-between shadow-2xs cursor-pointer ${
              isActive
                ? "border-[#2874f0] ring-1 ring-[#2874f0] bg-[#f8fbff] dark:bg-blue-950/20"
                : "border-[#e0e0e0] dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-7 h-7 rounded-xs bg-[#eaf4fe] dark:bg-blue-950/60 flex items-center justify-center">
                {card.icon}
              </div>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-xs border ${card.badgeStyle}`}
              >
                {card.badge}
              </span>
            </div>
            <div>
              <div className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-slate-100 mb-0.5">
                {isLoading ? (
                  <div className="h-7 w-12 bg-slate-100 dark:bg-slate-800 rounded-xs animate-pulse" />
                ) : (
                  card.count
                )}
              </div>
              <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                {card.label}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
