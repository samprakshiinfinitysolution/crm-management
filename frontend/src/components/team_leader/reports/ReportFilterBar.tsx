"use client";

import React from "react";
import { Calendar, Users, Globe, Download, RefreshCw, RotateCcw } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ReportFilterBarProps {
  timeRange: string;
  setTimeRange: (range: string) => void;
  selectedExecutive: string;
  setSelectedExecutive: (id: string) => void;
  selectedSource: string;
  setSelectedSource: (source: string) => void;
  executivesList?: Array<{ id: string; name: string }>;
  onExport?: () => void;
  isExporting?: boolean;
  onReset?: () => void;
}

export const ReportFilterBar: React.FC<ReportFilterBarProps> = ({
  timeRange,
  setTimeRange,
  selectedExecutive,
  setSelectedExecutive,
  selectedSource,
  setSelectedSource,
  executivesList = [],
  onExport,
  isExporting = false,
  onReset,
}) => {
  const hasActiveFilters = Boolean(
    timeRange !== "7d" ||
    selectedExecutive !== "ALL" ||
    selectedSource !== "ALL"
  );
  const timePresets = [
    { label: "Today", value: "today" },
    { label: "Last 7 Days", value: "7d" },
    { label: "Last 30 Days", value: "30d" },
    { label: "This Quarter", value: "quarter" },
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-lg bg-card dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
      {/* Date Presets */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-card/80 dark:bg-slate-800/80 rounded-lg border border-slate-200/60 dark:border-slate-700/60 max-w-full">
        <Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400 ml-2 mr-1 shrink-0" />
        {timePresets.map((preset) => (
          <button
            key={preset.value}
            onClick={() => setTimeRange(preset.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              timeRange === preset.value
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-card dark:hover:bg-slate-700"
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Dropdown Filters & Actions */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Executive Filter */}
        <div className="flex items-center gap-2">
          <Select
            value={selectedExecutive}
            onValueChange={(value) => setSelectedExecutive(value || "ALL")}
          >
            <SelectTrigger className="px-3.5 py-2 rounded-lg bg-card dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-2xs">
              <Users className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 mr-2" />
              <SelectValue placeholder="All Executives" />
            </SelectTrigger>

            <SelectContent className="border border-slate-200 dark:border-slate-800 bg-card dark:bg-slate-900 shadow-md">
              <SelectItem
                value="ALL"
                className="px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-xs"
              >
                All Executives
              </SelectItem>
              {executivesList?.map((exec) => (
                <SelectItem
                  key={exec.id}
                  value={exec.id}
                  className="px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-xs"
                >
                  {exec.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Source Filter */}
        <div className="flex items-center gap-2">
          <Select
            value={selectedSource}
            onValueChange={(value) => setSelectedSource(value || "ALL")}
            aria-label="Filter by lead source"
          >
            <SelectTrigger className="px-3.5 py-2 rounded-lg bg-card dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-2xs">
              <Globe className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 mr-2" />
              <SelectValue placeholder="All Lead Sources" />
            </SelectTrigger>
            <SelectContent className="border border-slate-200 dark:border-slate-800 bg-card dark:bg-slate-900 shadow-md">
              {["ALL", "WEBSITE", "CAMPAIGN", "REFERRAL", "EXCEL_IMPORT"].map(
                (source) => (
                  <SelectItem
                    key={source}
                    value={source}
                    className="px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-xs"
                  >
                    {source === "ALL"
                      ? "All Sources"
                      : source.replace("_", " ")}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Reset Filters */}
        {hasActiveFilters && onReset && (
          <button
            type="button"
            onClick={onReset}
            className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs shrink-0"
            title="Reset filters to default"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Reset</span>
          </button>
        )}

        {/* Export Trigger */}
        {onExport && (
          <button
            type="button"
            onClick={onExport}
            disabled={isExporting}
            className="px-3.5 py-2 rounded-lg bg-card dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            title="Export filtered data"
          >
            {isExporting ? (
              <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5 text-blue-600" />
            )}
            <span>{isExporting ? "Exporting..." : "Export Report"}</span>
          </button>
        )}
      </div>
    </div>
  );
};
