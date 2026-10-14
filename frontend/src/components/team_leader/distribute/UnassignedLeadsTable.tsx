"use client";

import React, { useState } from "react";
import {
  Search,
  CheckSquare,
  Square,
  AlertCircle,
  MapPin,
  Phone,
  Mail,
  IndianRupee,
  RotateCcw,
} from "lucide-react";
import { LeadItem, PriorityLevel } from "@/types/api.types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pagination } from "@/components/ui/Pagination";

export interface UnassignedLeadsTableProps {
  leads: LeadItem[];
  selectedLeadIds: string[];
  onToggleLead: (leadId: string) => void;
  onSelectAll: (leadIds: string[]) => void;
  onClearSelection: () => void;
  isLoading?: boolean;
  page?: number;
  limit?: number;
  totalPages?: number;
  totalCount?: number;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  priorityFilter?: string;
  onPriorityChange?: (priority: string) => void;
  sourceFilter?: string;
  onSourceChange?: (source: string) => void;
}

export const UnassignedLeadsTable: React.FC<UnassignedLeadsTableProps> = ({
  leads = [],
  selectedLeadIds = [],
  onToggleLead,
  onSelectAll,
  onClearSelection,
  isLoading = false,
  page,
  limit,
  totalPages: serverTotalPages,
  totalCount: serverTotalCount,
  onPageChange: serverOnPageChange,
  onLimitChange: serverOnLimitChange,
  searchTerm: controlledSearchTerm,
  onSearchChange,
  priorityFilter: controlledPriorityFilter,
  onPriorityChange,
  sourceFilter: controlledSourceFilter,
  onSourceChange,
}) => {
  const [internalSearchTerm, setInternalSearchTerm] = useState("");
  const [internalPriorityFilter, setInternalPriorityFilter] = useState("ALL");
  const [internalSourceFilter, setInternalSourceFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = limit || 10;

  const isServerPagination = Boolean(serverOnPageChange);

  // Active filter values (controlled if provided by parent query, otherwise internal)
  const activeSearchTerm =
    controlledSearchTerm !== undefined
      ? controlledSearchTerm
      : internalSearchTerm;
  const activePriorityFilter =
    controlledPriorityFilter !== undefined
      ? controlledPriorityFilter
      : internalPriorityFilter;
  const activeSourceFilter =
    controlledSourceFilter !== undefined
      ? controlledSourceFilter
      : internalSourceFilter;

  const handleSearchChange = (term: string) => {
    if (controlledSearchTerm === undefined) {
      setInternalSearchTerm(term);
    }
    onSearchChange?.(term);

    if (isServerPagination && serverOnPageChange) {
      serverOnPageChange(1);
    } else {
      setCurrentPage(1);
    }
  };

  const handlePriorityChange = (val: string | null) => {
    const nextPriority = val || "ALL";
    if (controlledPriorityFilter === undefined) {
      setInternalPriorityFilter(nextPriority);
    }
    onPriorityChange?.(nextPriority);

    if (isServerPagination && serverOnPageChange) {
      serverOnPageChange(1);
    } else {
      setCurrentPage(1);
    }
  };

  const handleSourceChange = (val: string | null) => {
    const nextSource = val || "ALL";
    if (controlledSourceFilter === undefined) {
      setInternalSourceFilter(nextSource);
    }
    onSourceChange?.(nextSource);

    if (isServerPagination && serverOnPageChange) {
      serverOnPageChange(1);
    } else {
      setCurrentPage(1);
    }
  };

  // In server-pagination mode, search/priority/source filtering is authoritative on the server.
  // In local-pagination mode, apply client-side filtering across the provided leads inventory.
  const filteredLeads = isServerPagination
    ? leads
    : leads.filter((lead) => {
        const matchesSearch =
          !activeSearchTerm ||
          lead.customerName
            .toLowerCase()
            .includes(activeSearchTerm.toLowerCase()) ||
          lead.leadCode
            .toLowerCase()
            .includes(activeSearchTerm.toLowerCase()) ||
          lead.mobile.includes(activeSearchTerm) ||
          (lead.requirement &&
            lead.requirement
              .toLowerCase()
              .includes(activeSearchTerm.toLowerCase())) ||
          (lead.city &&
            lead.city.toLowerCase().includes(activeSearchTerm.toLowerCase()));

        const matchesPriority =
          activePriorityFilter === "ALL" ||
          lead.priority === activePriorityFilter;
        const matchesSource =
          activeSourceFilter === "ALL" ||
          (lead.leadSource &&
            lead.leadSource.toUpperCase() ===
              activeSourceFilter.toUpperCase()) ||
          (lead.source &&
            lead.source.toUpperCase() === activeSourceFilter.toUpperCase());

        return matchesSearch && matchesPriority && matchesSource;
      });

  const totalPages = isServerPagination
    ? serverTotalPages !== undefined
      ? serverTotalPages
      : 1
    : Math.max(1, Math.ceil(filteredLeads.length / pageSize));

  const paginatedLeads = isServerPagination
    ? leads
    : filteredLeads.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const isAllFilteredSelected =
    filteredLeads.length > 0 &&
    filteredLeads.every((l) => selectedLeadIds.includes(l.id));

  const handleSelectQuick = (count: number) => {
    const subsetIds = filteredLeads.slice(0, count).map((l) => l.id);
    onSelectAll(Array.from(new Set([...selectedLeadIds, ...subsetIds])));
  };

  const handleToggleSelectAll = () => {
    if (isAllFilteredSelected) {
      // Remove all current filtered leads from selection
      const filteredIds = new Set(filteredLeads.map((l) => l.id));
      const remaining = selectedLeadIds.filter((id) => !filteredIds.has(id));
      onSelectAll(remaining);
    } else {
      // Add all filtered leads to selection
      const combined = Array.from(
        new Set([...selectedLeadIds, ...filteredLeads.map((l) => l.id)]),
      );
      onSelectAll(combined);
    }
  };

  const getPriorityBadge = (priority: PriorityLevel | string) => {
    switch (priority) {
      case PriorityLevel.URGENT:
      case "URGENT":
        return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900";
      case PriorityLevel.HIGH:
      case "HIGH":
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900";
      case PriorityLevel.MEDIUM:
      case "MEDIUM":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col">
      {/* Header & Quick Action Selection Bar */}
      <div className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Unassigned Lead Inventory
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                {isServerPagination && serverTotalCount !== undefined
                  ? serverTotalCount
                  : filteredLeads.length}{" "}
                leads
              </span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-200 font-medium">
              Filter and select specific leads or choose batch sizes below
            </p>
          </div>

          {/* Quick Batch Selection Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 mr-1 hidden sm:inline">
              Quick Select:
            </span>
            <button
              type="button"
              onClick={() => handleSelectQuick(10)}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              +10
            </button>
            <button
              type="button"
              onClick={() => handleSelectQuick(25)}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              +25
            </button>
            <button
              type="button"
              onClick={() => handleSelectQuick(50)}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              +50
            </button>
            <button
              type="button"
              onClick={handleToggleSelectAll}
              className="text-xs font-semibold px-3 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 transition-colors cursor-pointer"
            >
              {isAllFilteredSelected ? "Deselect All" : "Select All Filtered"}
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        {(() => {
          const hasActiveFilters = Boolean(
            activeSearchTerm.trim() ||
            (activePriorityFilter && activePriorityFilter !== "ALL") ||
            (activeSourceFilter && activeSourceFilter !== "ALL")
          );

          const handleResetFilters = () => {
            handleSearchChange("");
            handlePriorityChange("ALL");
            handleSourceChange("ALL");
          };

          return (
            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
              {/* Search Input */}
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by code, customer, mobile, city..."
                  value={activeSearchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                />
              </div>

              {/* Priority Filter */}
              <div className="w-full sm:w-44">
                <Select
                  value={activePriorityFilter}
                  onValueChange={handlePriorityChange}
                >
                  <SelectTrigger className="w-full text-xs h-9 rounded-lg bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">
                    <SelectValue placeholder="Priority (All)" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <SelectItem value="ALL">All Priorities</SelectItem>
                    <SelectItem value="URGENT">Urgent Priority</SelectItem>
                    <SelectItem value="HIGH">High Priority</SelectItem>
                    <SelectItem value="MEDIUM">Medium Priority</SelectItem>
                    <SelectItem value="LOW">Low Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Source Filter */}
              <div className="w-full sm:w-44">
                <Select value={activeSourceFilter} onValueChange={handleSourceChange}>
                  <SelectTrigger className="w-full text-xs h-9 rounded-lg bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">
                    <SelectValue placeholder="Source (All)" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <SelectItem value="ALL">All Sources</SelectItem>
                    <SelectItem value="WEBSITE">Website Organic</SelectItem>
                    <SelectItem value="CAMPAIGN">Marketing Campaign</SelectItem>
                    <SelectItem value="EXCEL_IMPORT">Excel Ingestion</SelectItem>
                    <SelectItem value="REFERRAL">Partner Referral</SelectItem>
                    <SelectItem value="MANUAL_ENTRY">Manual Entry</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Reset Button */}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="h-9 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs shrink-0 w-full sm:w-auto"
                  title="Reset all filters"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          );
        })()}
      </div>

      {/* Selected Leads Sticky Pill */}
      {selectedLeadIds.length > 0 && (
        <div className="bg-blue-50/90 dark:bg-blue-950/40 px-4 py-2 border-b border-blue-100 dark:border-blue-900/50 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-blue-900 dark:text-blue-200 font-medium">
            <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>
              <strong className="font-bold">{selectedLeadIds.length}</strong>{" "}
              leads currently selected for distribution
            </span>
          </div>
          <button
            type="button"
            onClick={onClearSelection}
            className="text-xs text-blue-700 dark:text-blue-300 hover:underline font-semibold cursor-pointer"
          >
            Clear
          </button>
        </div>
      )}

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50/80 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-100 dark:border-slate-800">
            <tr>
              <th className="py-3 px-4 w-12 text-center">
                <button
                  type="button"
                  onClick={handleToggleSelectAll}
                  className="text-slate-400 hover:text-blue-600 focus:outline-none cursor-pointer"
                  title="Toggle select all on this page"
                >
                  {isAllFilteredSelected ? (
                    <CheckSquare className="w-4 h-4 text-blue-600" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
              </th>
              <th className="py-3 px-3">Lead Code</th>
              <th className="py-3 px-3">Customer & Contact</th>
              <th className="py-3 px-3">Requirement & Budget</th>
              <th className="py-3 px-3">Location</th>
              <th className="py-3 px-3">Priority</th>
              <th className="py-3 px-3">Source</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <span>Loading unassigned lead pool...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedLeads.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <AlertCircle className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                    <p className="font-semibold text-slate-600 dark:text-slate-300">
                      No unassigned leads found
                    </p>
                    <p className="text-xs text-slate-400">
                      Try adjusting your search criteria or ingest new leads via
                      Intake.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedLeads.map((lead) => {
                const isSelected = selectedLeadIds.includes(lead.id);

                return (
                  <tr
                    key={lead.id}
                    onClick={() => onToggleLead(lead.id)}
                    className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-blue-50/50 dark:bg-blue-950/30 font-medium"
                        : ""
                    }`}
                  >
                    {/* Checkbox */}
                    <td
                      className="py-3 px-4 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => onToggleLead(lead.id)}
                        className="text-slate-400 hover:text-blue-600 focus:outline-none cursor-pointer"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>

                    {/* Lead Code */}
                    <td className="py-3 px-3">
                      <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                        {lead.leadCode}
                      </span>
                    </td>

                    {/* Customer & Contact */}
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900 dark:text-slate-100">
                        {lead.customerName}
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {lead.mobile}
                        </span>
                        {lead.email && (
                          <span className="flex items-center gap-1 truncate max-w-32.5">
                            <Mail className="w-3 h-3" />
                            {lead.email}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Requirement & Budget */}
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-45">
                        {lead.requirement || "General Inquiry"}
                      </div>
                      {lead.budget && (
                        <div className="flex items-center gap-0.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                          <IndianRupee className="w-3 h-3" />
                          <span>{lead.budget}</span>
                        </div>
                      )}
                    </td>

                    {/* Location */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{lead.city || lead.state || "Unspecified"}</span>
                      </div>
                    </td>

                    {/* Priority Badge */}
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPriorityBadge(
                          lead.priority,
                        )}`}
                      >
                        {lead.priority}
                      </span>
                    </td>

                    {/* Source */}
                    <td className="py-3 px-3">
                      <span className="text-[11px] font-medium text-slate-500">
                        {lead.leadSource || lead.source || "DIRECT"}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <Pagination
        currentPage={isServerPagination ? page || 1 : currentPage}
        totalPages={
          serverTotalPages !== undefined ? serverTotalPages : totalPages
        }
        totalItems={
          isServerPagination && serverTotalCount !== undefined
            ? serverTotalCount
            : filteredLeads.length
        }
        pageSize={pageSize}
        onPageChange={(p) => {
          if (isServerPagination && serverOnPageChange) {
            serverOnPageChange(p);
          } else {
            setCurrentPage(p);
          }
        }}
        onPageSizeChange={serverOnLimitChange}
        showPageSizeSelector={Boolean(serverOnLimitChange)}
      />
    </div>
  );
};
