"use client";

import React from "react";
import {
  Scale,
  SlidersHorizontal,
  CheckSquare,
  ArrowLeftRight,
} from "lucide-react";

export type DistributionTabMode =
  | "EQUAL_SPLIT"
  | "FIXED_QUOTA"
  | "MANUAL_PICK"
  | "REASSIGN_RECALL";

interface DistributeModeSelectorProps {
  activeMode: DistributionTabMode;
  onSelectMode: (mode: DistributionTabMode) => void;
  unassignedCount?: number;
}

interface TabItem {
  id: DistributionTabMode;
  label: string;
  description: string;
  icon: React.ElementType;
}

export const DistributeModeSelector: React.FC<DistributeModeSelectorProps> = ({
  activeMode,
  onSelectMode,
}) => {
  const tabs: TabItem[] = [
    {
      id: "EQUAL_SPLIT",
      label: "Equal Split",
      description:
        "Distribute unassigned leads equally among selected executives",
      icon: Scale,
    },
    {
      id: "FIXED_QUOTA",
      label: "Custom Split",
      description: "Specify exact lead counts for each executive",
      icon: SlidersHorizontal,
    },
    {
      id: "MANUAL_PICK",
      label: "Manual Split",
      description: "Select individual leads from the pool to assign",
      icon: CheckSquare,
    },
  ];

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* 3-Option Segmented Control Tabs */}
      <div className="bg-card p-1 rounded-xl border border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeMode === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectMode(tab.id)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-left transition-all duration-150 cursor-pointer ${
                isSelected
                  ? "bg-card dark:bg-slate-800 text-blue-900 dark:text-blue-300 border border-slate-200 dark:border-slate-700 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent"
              }`}
            >
              <div
                className={`p-2 rounded-lg shrink-0 transition-colors ${
                  isSelected
                    ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-sm font-semibold tracking-tight ${
                      isSelected
                        ? "text-blue-900 dark:text-blue-300 font-bold"
                        : "text-slate-800 dark:text-slate-200"
                    }`}
                  >
                    {tab.label}
                  </span>
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                  )}
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-200 font-medium truncate mt-0.5">
                  {tab.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Subtle secondary utility action for rebalance/recall */}
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={() =>
            onSelectMode(
              activeMode === "REASSIGN_RECALL"
                ? "EQUAL_SPLIT"
                : "REASSIGN_RECALL",
            )
          }
          className={`text-xs inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
            activeMode === "REASSIGN_RECALL"
              ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-medium border border-blue-200 dark:border-blue-800"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-card dark:hover:bg-slate-800"
          }`}
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
          <span>Need to rebalance active leads? Reassign & Recall Console</span>
        </button>
      </div>
    </div>
  );
};

