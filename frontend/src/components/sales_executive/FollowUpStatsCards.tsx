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
      icon: <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
      iconBox: "bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/50",
      badge: "High Priority",
      badgeStyle: "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800",
    },
    {
      key: "overdue" as const,
      label: "Overdue",
      count: summary?.overdue ?? 0,
      icon: <AlertTriangle className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
      iconBox: "bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/50",
      badge: (summary?.overdue ?? 0) > 0 ? "Action Required" : "Clean",
      badgeStyle:
        (summary?.overdue ?? 0) > 0
          ? "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900 font-bold"
          : "bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
    },
    {
      key: "upcoming" as const,
      label: "Upcoming",
      count: summary?.upcoming ?? 0,
      icon: <CalendarCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
      iconBox: "bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/50",
      badge: "Scheduled",
      badgeStyle: "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800",
    },
    {
      key: "completed" as const,
      label: "Completed (Month)",
      count: summary?.completedThisMonth ?? 0,
      icon: <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
      iconBox: "bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/50",
      badge: "Delivered",
      badgeStyle: "bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
      {cards.map((card) => {
        const isActive = activeScope === card.key;
        return (
          <button
            key={card.key}
            type="button"
            onClick={() => onScopeSelect?.(card.key)}
            className={`text-left p-3.5 rounded-xl bg-white dark:bg-slate-900 border transition-all duration-150 flex flex-col justify-between shadow-xs cursor-pointer ${
              isActive
                ? "border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/20 dark:bg-slate-800/80"
                : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div
                className={`w-8 h-8 rounded-lg ${card.iconBox} flex items-center justify-center shadow-2xs`}
              >
                {card.icon}
              </div>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${card.badgeStyle}`}
              >
                {card.badge}
              </span>
            </div>
            <div>
              <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-0.5">
                {isLoading ? (
                  <div className="h-7 w-12 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                ) : (
                  card.count
                )}
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                {card.label}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
