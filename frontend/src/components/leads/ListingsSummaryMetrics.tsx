"use client";

import React from "react";
import { Info, AlertCircle } from "lucide-react";

interface ListingsSummaryMetricsProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  counts: {
    active: number;
    readyForActivation: number;
    blocked: number;
    inactive: number;
    archived: number;
  };
  onCheckIssues?: () => void;
}

export function ListingsSummaryMetrics({
  activeTab,
  onTabChange,
  counts,
  onCheckIssues,
}: ListingsSummaryMetricsProps) {
  const tabs = [
    {
      id: "ACTIVE",
      count: counts.active,
      label: "Active Listings",
      tooltip: "Listings currently active and discoverable by buyers",
    },
    {
      id: "READY",
      count: counts.readyForActivation,
      label: "Ready for Activation",
      tooltip: "New listings waiting for activation or team assignment",
    },
    {
      id: "BLOCKED",
      count: counts.blocked,
      label: "Blocked Listings",
      tooltip: "Listings temporarily blocked or pending verification",
    },
    {
      id: "INACTIVE",
      count: counts.inactive,
      label: "Inactive Listings",
      tooltip: "Out of stock or deactivated listings",
    },
    {
      id: "ARCHIVED",
      count: counts.archived,
      label: "Archived Listings",
      tooltip: "Won, closed or archived deals",
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 rounded-sm shadow-2xs overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-stretch divide-y md:divide-y-0 md:divide-x divide-[#e0e0e0] dark:divide-slate-800">
        {/* Metric Tabs */}
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-x divide-y sm:divide-y-0 divide-[#e0e0e0] dark:divide-slate-800">
          {tabs.map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange?.(tab.id)}
                className={`p-3 sm:p-3.5 text-left transition-all cursor-pointer relative flex flex-col justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                  isSelected
                    ? "bg-[#f2f7fe]/40 dark:bg-blue-950/20"
                    : "bg-white dark:bg-slate-900"
                }`}
              >
                {/* Active Indicator Bar at bottom */}
                {isSelected && (
                  <div className="absolute bottom-0 inset-x-0 h-[3px] bg-[#2874f0]" />
                )}

                <div className="flex items-center justify-between gap-1 mb-1">
                  <span
                    className={`text-lg sm:text-xl font-bold leading-none ${
                      isSelected
                        ? "text-[#2874f0] dark:text-blue-400"
                        : "text-slate-800 dark:text-slate-100"
                    }`}
                  >
                    {tab.count}
                  </span>
                  <span
                    title={tab.tooltip}
                    className="text-slate-400 hover:text-[#2874f0] transition-colors cursor-help"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </span>
                </div>

                <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 truncate">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Far Right Action Link */}
        <div className="p-3 sm:p-3.5 flex items-center justify-end md:justify-center bg-slate-50/60 dark:bg-slate-800/40 shrink-0">
          <button
            type="button"
            onClick={onCheckIssues}
            className="text-xs font-semibold text-[#2874f0] dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Check Listing Issue</span>
          </button>
        </div>
      </div>
    </div>
  );
}
