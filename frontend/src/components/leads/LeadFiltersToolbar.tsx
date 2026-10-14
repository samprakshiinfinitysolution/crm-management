"use client";

import { Search, RotateCcw } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LeadFiltersToolbarProps {
  search: string;
  onSearchChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
  sourceFilter: string;
  onSourceFilterChange: (val: string) => void;
  onReset?: () => void;
}

export function LeadFiltersToolbar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sourceFilter,
  onSourceFilterChange,
  onReset,
}: LeadFiltersToolbarProps) {
  const hasActiveFilters = Boolean(
    search.trim() ||
    (statusFilter && statusFilter !== "ALL") ||
    (sourceFilter && sourceFilter !== "ALL")
  );

  return (
    <div className="bg-white dark:bg-slate-900 p-3 sm:p-3.5 rounded-lg border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center gap-3">
      {/* Search Input */}
      <div className="relative flex-1 w-full">
        <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by customer name, mobile, email, lead code or company..."
          className="w-full h-10 pl-9 pr-4 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
        />
      </div>

      {/* Filter Selects */}
      <div className="flex items-center gap-2 w-full md:w-auto">
        {/* Status Filter */}
        <Select
          value={statusFilter}
          onValueChange={(val) => onStatusFilterChange(val || "ALL")}
        >
          <SelectTrigger className="h-10 px-3 min-w-38.75 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 font-medium focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md">
            <SelectItem
              value="ALL"
              className="text-xs text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              All Statuses
            </SelectItem>
            <SelectItem
              value="NEW"
              className="text-xs text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              New
            </SelectItem>
            <SelectItem
              value="ASSIGNED"
              className="text-xs text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              Assigned
            </SelectItem>
            <SelectItem
              value="CONTACTED"
              className="text-xs text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              Contacted
            </SelectItem>
            <SelectItem
              value="INTERESTED"
              className="text-xs text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              Interested
            </SelectItem>
            <SelectItem
              value="FOLLOW_UP"
              className="text-xs text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              Follow Up
            </SelectItem>
            <SelectItem
              value="QUALIFIED"
              className="text-xs text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              Qualified
            </SelectItem>
            <SelectItem
              value="WON_SOLD"
              className="text-xs text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              Won / Sold
            </SelectItem>
            <SelectItem
              value="LOST"
              className="text-xs text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              Lost
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Source Filter */}
        <Select
          value={sourceFilter}
          onValueChange={(val) => onSourceFilterChange(val || "ALL")}
        >
          <SelectTrigger className="h-10 px-3 min-w-36 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 font-medium focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all">
            <SelectValue placeholder="All Sources" />
          </SelectTrigger>
          <SelectContent className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md">
            <SelectItem
              value="ALL"
              className="text-xs text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              All Sources
            </SelectItem>
            <SelectItem
              value="Website"
              className="text-xs text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              Website
            </SelectItem>
            <SelectItem
              value="Facebook"
              className="text-xs text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              Facebook
            </SelectItem>
            <SelectItem
              value="Google Ads"
              className="text-xs text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              Google Ads
            </SelectItem>
            <SelectItem
              value="Referral"
              className="text-xs text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              Referral
            </SelectItem>
            <SelectItem
              value="Cold Call"
              className="text-xs text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              Cold Call
            </SelectItem>
            <SelectItem
              value="Direct"
              className="text-xs text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              Direct
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Reset Button */}
        {hasActiveFilters && onReset && (
          <button
            type="button"
            onClick={onReset}
            className="h-10 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs shrink-0"
            title="Reset all filters"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
}
