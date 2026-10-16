"use client";

import React from "react";
import {
  Scale,
  SlidersHorizontal,
  CheckSquare,
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
      <div className="bg-white dark:bg-slate-900 p-1 rounded-sm border border-[#e0e0e0] dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-1 shadow-2xs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeMode === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectMode(tab.id)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-sm text-left transition-all duration-150 cursor-pointer ${
                isSelected
                  ? "bg-[#eaf4fe] dark:bg-blue-950/50 text-[#2874f0] border border-blue-200 dark:border-blue-800 shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent"
              }`}
            >
              <div
                className={`p-2 rounded-xs shrink-0 transition-colors ${
                  isSelected
                    ? "bg-[#2874f0] text-white shadow-2xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-xs font-bold tracking-tight ${
                      isSelected
                        ? "text-[#2874f0]"
                        : "text-slate-800 dark:text-slate-200"
                    }`}
                  >
                    {tab.label}
                  </span>
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2874f0]" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {tab.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
