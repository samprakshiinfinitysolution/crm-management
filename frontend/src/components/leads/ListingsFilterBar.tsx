"use client";

import React, { useState } from "react";
import { Filter, ChevronDown, RotateCcw } from "lucide-react";

interface ListingsFilterBarProps {
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  sourceFilter: string;
  onSourceFilterChange: (source: string) => void;
  priorityFilter: string;
  onPriorityFilterChange: (priority: string) => void;
  onApply: () => void;
  onReset: () => void;
}

export function ListingsFilterBar({
  statusFilter,
  onStatusFilterChange,
  sourceFilter,
  onSourceFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  onApply,
  onReset,
}: ListingsFilterBarProps) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const toggleDropdown = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  const hasFilters = Boolean(
    (statusFilter && statusFilter !== "ALL") ||
    (sourceFilter && sourceFilter !== "ALL") ||
    (priorityFilter && priorityFilter !== "ALL")
  );

  return (
    <div className="bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 rounded-sm p-2 flex flex-wrap items-center gap-2 text-xs relative">
      {/* Funnel Icon Box */}
      <div className="p-1.5 text-slate-400 border-r border-[#e0e0e0] dark:border-slate-800 pr-2">
        <Filter className="w-4 h-4 text-slate-500" />
      </div>

      {/* Category / Status Dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => toggleDropdown("category")}
          className={`h-7 px-2.5 rounded-sm border font-medium flex items-center gap-1 transition-colors cursor-pointer ${
            statusFilter && statusFilter !== "ALL"
              ? "bg-[#f2f7fe] dark:bg-blue-950/60 text-[#2874f0] border-[#2874f0]"
              : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-[#e0e0e0] dark:border-slate-800 hover:border-slate-400"
          }`}
        >
          <span>Status: {statusFilter !== "ALL" ? statusFilter : "All"}</span>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </button>

        {activeDropdown === "category" && (
          <div className="absolute top-8 left-0 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-sm py-1 z-30 animate-in fade-in duration-100 max-h-56 overflow-y-auto">
            <button
              type="button"
              onClick={() => {
                onStatusFilterChange("ALL");
                setActiveDropdown(null);
              }}
              className="w-full px-3 py-1.5 text-xs text-left hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              All Statuses
            </button>
            <button
              type="button"
              onClick={() => {
                onStatusFilterChange("NEW");
                setActiveDropdown(null);
              }}
              className="w-full px-3 py-1.5 text-xs text-left hover:bg-slate-50 dark:hover:bg-slate-800 text-[#2874f0]"
            >
              New / Intake
            </button>
            <button
              type="button"
              onClick={() => {
                onStatusFilterChange("CONTACTED");
                setActiveDropdown(null);
              }}
              className="w-full px-3 py-1.5 text-xs text-left hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Contacted
            </button>
            <button
              type="button"
              onClick={() => {
                onStatusFilterChange("QUALIFIED");
                setActiveDropdown(null);
              }}
              className="w-full px-3 py-1.5 text-xs text-left hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Qualified
            </button>
            <button
              type="button"
              onClick={() => {
                onStatusFilterChange("WON_SOLD");
                setActiveDropdown(null);
              }}
              className="w-full px-3 py-1.5 text-xs text-left hover:bg-slate-50 dark:hover:bg-slate-800 text-emerald-600 font-semibold"
            >
              Won / Sold
            </button>
            <button
              type="button"
              onClick={() => {
                onStatusFilterChange("LOST");
                setActiveDropdown(null);
              }}
              className="w-full px-3 py-1.5 text-xs text-left hover:bg-slate-50 dark:hover:bg-slate-800 text-rose-600"
            >
              Lost / Blocked
            </button>
          </div>
        )}
      </div>

      {/* Brand / Source Dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => toggleDropdown("brand")}
          className={`h-7 px-2.5 rounded-sm border font-medium flex items-center gap-1 transition-colors cursor-pointer ${
            sourceFilter && sourceFilter !== "ALL"
              ? "bg-[#f2f7fe] dark:bg-blue-950/60 text-[#2874f0] border-[#2874f0]"
              : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-[#e0e0e0] dark:border-slate-800 hover:border-slate-400"
          }`}
        >
          <span>Brand / Source: {sourceFilter !== "ALL" ? sourceFilter : "All"}</span>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </button>

        {activeDropdown === "brand" && (
          <div className="absolute top-8 left-0 w-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-sm py-1 z-30 animate-in fade-in duration-100">
            {["ALL", "Website", "Referral", "Cold Call", "Campaign", "Partner"].map((src) => (
              <button
                key={src}
                type="button"
                onClick={() => {
                  onSourceFilterChange(src);
                  setActiveDropdown(null);
                }}
                className="w-full px-3 py-1.5 text-xs text-left hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                {src === "ALL" ? "All Sources" : src}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Priority Dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => toggleDropdown("priority")}
          className={`h-7 px-2.5 rounded-sm border font-medium flex items-center gap-1 transition-colors cursor-pointer ${
            priorityFilter && priorityFilter !== "ALL"
              ? "bg-[#f2f7fe] dark:bg-blue-950/60 text-[#2874f0] border-[#2874f0]"
              : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-[#e0e0e0] dark:border-slate-800 hover:border-slate-400"
          }`}
        >
          <span>Priority: {priorityFilter !== "ALL" ? priorityFilter : "All"}</span>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </button>

        {activeDropdown === "priority" && (
          <div className="absolute top-8 left-0 w-36 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-sm py-1 z-30 animate-in fade-in duration-100">
            {["ALL", "LOW", "MEDIUM", "HIGH", "URGENT"].map((pri) => (
              <button
                key={pri}
                type="button"
                onClick={() => {
                  onPriorityFilterChange(pri);
                  setActiveDropdown(null);
                }}
                className="w-full px-3 py-1.5 text-xs text-left hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                {pri === "ALL" ? "All Priorities" : pri}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons: Apply & Reset */}
      <div className="ml-auto flex items-center gap-1.5">
        {hasFilters && (
          <button
            type="button"
            onClick={onReset}
            className="h-7 px-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-xs flex items-center gap-1 cursor-pointer"
            title="Reset Filters"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
        <button
          type="button"
          onClick={onApply}
          className="h-7 px-4 rounded-sm bg-[#2874f0] hover:bg-[#1a5bb8] text-white font-semibold text-xs transition-colors cursor-pointer"
        >
          Apply
        </button>
      </div>
    </div>
  );
}
