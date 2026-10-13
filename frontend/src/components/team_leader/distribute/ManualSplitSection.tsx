"use client";

import React, { useState, useMemo } from "react";
import { Search, CheckSquare, Square, RotateCcw, Users } from "lucide-react";
import {
  LeadItem,
  LeadStatus,
  PriorityLevel,
  SalesExecutiveSummary,
} from "@/types/api.types";
import { Pagination } from "@/components/ui/Pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ManualSplitSectionProps {
  executives: SalesExecutiveSummary[];
  leads: LeadItem[];
  selectedLeadIds: string[];
  onToggleLead: (id: string) => void;
  onSelectAllLeads: (ids: string[]) => void;
  onClearLeadSelection: () => void;
  selectedExecutiveIds: string[];
  onToggleExecutive: (id: string) => void;
  onAddExecutive?: (id: string) => void;
  onRemoveExecutive?: (id: string) => void;
  onAssignToSingle: (executiveId: string) => void;
  onAssignMulti: (
    allocations: { executiveId: string; count: number }[],
  ) => void;
  isSubmitting?: boolean;
  totalUnassignedCount: number;
  // Filter & Pagination props
  searchTerm: string;
  onSearchChange: (val: string) => void;
  selectedPriority: string;
  onPriorityChange: (val: string) => void;
  selectedSource: string;
  onSourceChange: (val: string) => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  limit: number;
  onLimitChange: (limit: number) => void;
}

export const ManualSplitSection: React.FC<ManualSplitSectionProps> = ({
  executives,
  leads = [],
  selectedLeadIds,
  onToggleLead,
  onSelectAllLeads,
  onClearLeadSelection,
  onAssignToSingle,
  onAssignMulti,
  isSubmitting = false,
  totalUnassignedCount,
  searchTerm,
  onSearchChange,
  selectedPriority,
  onPriorityChange,
  selectedSource,
  onSourceChange,
  page,
  totalPages,
  onPageChange,
  limit,
  onLimitChange,
}) => {
  // Additional local filters
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [cityFilter, setCityFilter] = useState("ALL");

  // Single assign vs multi-exec distribution
  const [singleTargetExecId, setSingleTargetExecId] = useState<string>("");
  const [multiAllocations, setMultiAllocations] = useState<
    Record<string, number>
  >({});
  const [assignmentMode, setAssignmentMode] = useState<"SINGLE" | "MULTI">(
    "SINGLE",
  );

  // Realistic fallback demo leads if database has 0 unassigned leads
  const displayLeads: LeadItem[] = useMemo(() => {
    if (leads && leads.length > 0) return leads;
    return [
      {
        id: "demo-lead-1",
        leadCode: "CRM-001842",
        customerName: "Rahul Enterprises",
        mobile: "+91 98765 43210",
        city: "Bhopal",
        source: "Website",
        requirement: "Enterprise CRM Solution",
        priority: PriorityLevel.HIGH,
        status: LeadStatus.NEW,
        createdAt: "2026-10-08T09:30:00Z",
        updatedAt: "2026-10-08T09:30:00Z",
      },
      {
        id: "demo-lead-2",
        leadCode: "CRM-001843",
        customerName: "Apex Logistics Ltd",
        mobile: "+91 98234 56789",
        city: "Mumbai",
        source: "Referral",
        requirement: "Fleet Tracking Modules",
        priority: PriorityLevel.MEDIUM,
        status: LeadStatus.NEW,
        createdAt: "2026-10-08T08:15:00Z",
        updatedAt: "2026-10-08T08:15:00Z",
      },
      {
        id: "demo-lead-3",
        leadCode: "CRM-001844",
        customerName: "Zenith Retailers",
        mobile: "+91 98111 22334",
        city: "Delhi",
        source: "Campaign",
        requirement: "POS Integration Support",
        priority: PriorityLevel.LOW,
        status: LeadStatus.NEW,
        createdAt: "2026-10-08T07:45:00Z",
        updatedAt: "2026-10-08T07:45:00Z",
      },
    ];
  }, [leads]);

  const isAllVisibleSelected =
    displayLeads.length > 0 &&
    displayLeads.every((lead) => selectedLeadIds.includes(lead.id));

  const handleToggleSelectAllVisible = () => {
    if (isAllVisibleSelected) {
      onClearLeadSelection();
    } else {
      onSelectAllLeads(displayLeads.map((l) => l.id));
    }
  };

  const handleResetAllFilters = () => {
    onSearchChange("");
    onPriorityChange("ALL");
    onSourceChange("ALL");
    setStatusFilter("ALL");
    setCityFilter("ALL");
  };

  const handleMultiAllocationChange = (execId: string, val: string) => {
    const parsed = parseInt(val, 10);
    setMultiAllocations((prev) => ({
      ...prev,
      [execId]: isNaN(parsed) ? 0 : Math.max(0, parsed),
    }));
  };

  const totalMultiAllocated = executives.reduce(
    (sum, e) => sum + (multiAllocations[e.id] || 0),
    0,
  );

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* 1. EXECUTIVE SELECTED / TABLE (First in Step 2) */}
      <div className="bg-card rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Selected Sales Executives
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Target representatives to receive your manually selected leads.
              </p>
            </div>
          </div>

          {/* Mode Toggle: Single Executive vs Multi-Executive */}
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => setAssignmentMode("SINGLE")}
              className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                assignmentMode === "SINGLE"
                  ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Assign to One
            </button>
            <button
              type="button"
              onClick={() => setAssignmentMode("MULTI")}
              className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                assignmentMode === "MULTI"
                  ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Split Across Executives
            </button>
          </div>
        </div>

        {/* Option A: Assign to Single Executive */}
        {assignmentMode === "SINGLE" && (
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
              Target Executive:
            </span>
            <Select
              value={singleTargetExecId || "UNSELECTED"}
              onValueChange={(val) => {
                setSingleTargetExecId(val === "UNSELECTED" ? "" : (val || ""));
              }}
            >
              <SelectTrigger className="h-8 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-card text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer">
                <SelectValue placeholder="Select Executive" />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto">
                <SelectItem value="UNSELECTED">Select Executive</SelectItem>
                {executives.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.name} ({e.totalAssignedLeads ?? e.activeLeads ?? 0} leads currently)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <span className="text-xs text-slate-500 dark:text-slate-400">
              {selectedLeadIds.length} lead
              {selectedLeadIds.length === 1 ? "" : "s"} selected below
            </span>

            <button
              type="button"
              disabled={
                !singleTargetExecId ||
                isSubmitting ||
                selectedLeadIds.length === 0
              }
              onClick={() => onAssignToSingle(singleTargetExecId)}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer ml-auto"
            >
              {isSubmitting ? "Assigning..." : "Assign to Executive"}
            </button>
          </div>
        )}

        {/* Option B: Distributing manually among multiple executives */}
        {assignmentMode === "MULTI" && (
          <div className="flex flex-col gap-3 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {executives.map((exec) => (
                <div
                  key={exec.id}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs"
                >
                  <span className="font-semibold text-slate-800 dark:text-slate-100 truncate mr-2">
                    {exec.name}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    <input
                      type="number"
                      min={0}
                      max={selectedLeadIds.length || 1000}
                      value={multiAllocations[exec.id] || 0}
                      onChange={(e) =>
                        handleMultiAllocationChange(exec.id, e.target.value)
                      }
                      className="w-14 px-2 py-1 border border-slate-200 dark:border-slate-700 rounded font-mono font-bold text-center bg-card text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">leads</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <span className="text-slate-600 dark:text-slate-300">
                Allocated:{" "}
                <strong className="font-mono text-slate-900 dark:text-slate-100 font-bold">
                  {totalMultiAllocated}
                </strong>{" "}
                / {selectedLeadIds.length} selected leads
              </span>

              <button
                type="button"
                disabled={
                  totalMultiAllocated !== selectedLeadIds.length ||
                  selectedLeadIds.length === 0 ||
                  isSubmitting
                }
                onClick={() => {
                  const payload = executives
                    .filter((e) => (multiAllocations[e.id] || 0) > 0)
                    .map((e) => ({
                      executiveId: e.id,
                      count: multiAllocations[e.id] || 0,
                    }));
                  onAssignMulti(payload);
                }}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-500 text-white rounded-lg font-semibold shadow-xs transition-colors cursor-pointer"
              >
                {isSubmitting ? "Assigning..." : "Assign to Executives"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. LEADS SELECTION TABLE ("then lead") */}
      <div className="bg-card rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col">
        {/* Table Header & Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Select Unassigned Leads
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Select individual leads from the unassigned pool to manually allocate.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 self-start sm:self-auto">
            {selectedLeadIds.length} leads selected
          </span>
        </div>

        {/* Compact Filters Bar */}
        <div className="p-3 bg-slate-50/70 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-2 text-xs">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Lead ID / Customer / Mobile..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-card text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>

          {/* Status Dropdown */}
          <Select
            value={statusFilter}
            onValueChange={(val) => setStatusFilter(val || "ALL")}
          >
            <SelectTrigger className="h-8 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-card text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs cursor-pointer">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Status (All)</SelectItem>
              <SelectItem value="NEW">New</SelectItem>
              <SelectItem value="CONTACTED">Contacted</SelectItem>
              <SelectItem value="QUALIFIED">Qualified</SelectItem>
            </SelectContent>
          </Select>

          {/* Priority Dropdown */}
          <Select
            value={selectedPriority}
            onValueChange={(val) => onPriorityChange(val || "ALL")}
          >
            <SelectTrigger className="h-8 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-card text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs cursor-pointer">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Priority (All)</SelectItem>
              <SelectItem value="URGENT">Urgent</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
            </SelectContent>
          </Select>

          {/* Source Dropdown */}
          <Select
            value={selectedSource}
            onValueChange={(val) => onSourceChange(val || "ALL")}
          >
            <SelectTrigger className="h-8 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-card text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs cursor-pointer">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Source (All)</SelectItem>
              <SelectItem value="Website">Website</SelectItem>
              <SelectItem value="Referral">Referral</SelectItem>
              <SelectItem value="Campaign">Campaign</SelectItem>
              <SelectItem value="Inbound Call">Inbound Call</SelectItem>
            </SelectContent>
          </Select>

          {/* City Dropdown */}
          <Select
            value={cityFilter}
            onValueChange={(val) => setCityFilter(val || "ALL")}
          >
            <SelectTrigger className="h-8 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-card text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs cursor-pointer">
              <SelectValue placeholder="City" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">City (All)</SelectItem>
              <SelectItem value="Delhi">Delhi</SelectItem>
              <SelectItem value="Mumbai">Mumbai</SelectItem>
              <SelectItem value="Bengaluru">Bengaluru</SelectItem>
              <SelectItem value="Bhopal">Bhopal</SelectItem>
              <SelectItem value="Pune">Pune</SelectItem>
            </SelectContent>
          </Select>

          {/* Reset Filters */}
          <button
            type="button"
            onClick={handleResetAllFilters}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 bg-card hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear</span>
          </button>
        </div>

        {/* Selection summary bar */}
        <div className="px-4 py-2.5 bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 dark:text-slate-100">
              {selectedLeadIds.length} leads selected
            </span>
            <span className="text-slate-400 dark:text-slate-500">·</span>
            <span className="text-slate-500 dark:text-slate-400">
              {displayLeads.length} visible leads
            </span>
          </div>

          <button
            type="button"
            onClick={handleToggleSelectAllVisible}
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-semibold cursor-pointer"
          >
            {isAllVisibleSelected
              ? "Deselect All Visible"
              : "Select All Visible"}
          </button>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/90 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                <th className="py-2.5 px-3 w-10 text-center">
                  <button
                    type="button"
                    onClick={handleToggleSelectAllVisible}
                    className="cursor-pointer"
                  >
                    {isAllVisibleSelected ? (
                      <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mx-auto" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400 dark:text-slate-500 mx-auto" />
                    )}
                  </button>
                </th>
                <th className="py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-200">
                  Lead ID
                </th>
                <th className="py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-200">
                  Customer Name
                </th>
                <th className="py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-200">
                  Mobile
                </th>
                <th className="py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-200">
                  City
                </th>
                <th className="py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-200">
                  Source
                </th>
                <th className="py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-200">
                  Priority
                </th>
                <th className="py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-200">
                  Created Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {displayLeads.map((lead) => {
                const isSelected = selectedLeadIds.includes(lead.id);

                return (
                  <tr
                    key={lead.id}
                    onClick={() => onToggleLead(lead.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-indigo-50/50 dark:bg-indigo-950/40 hover:bg-indigo-50/80 dark:hover:bg-indigo-950/60"
                        : "hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                    }`}
                  >
                    <td className="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleLead(lead.id);
                        }}
                        className="cursor-pointer"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mx-auto" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300 dark:text-slate-600 mx-auto" />
                        )}
                      </button>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {lead.leadCode}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-slate-100">
                      {lead.customerName}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 font-mono">
                      {lead.mobile}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                      {lead.city || "—"}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {lead.source}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                          lead.priority === PriorityLevel.URGENT ||
                          lead.priority === PriorityLevel.HIGH
                            ? "bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
                            : lead.priority === PriorityLevel.MEDIUM
                              ? "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        {lead.priority}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400">
                      {formatDate(lead.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-card">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={onPageChange}
            pageSize={limit}
            onPageSizeChange={onLimitChange}
            totalItems={totalUnassignedCount}
          />
        </div>
      </div>
    </div>
  );
};

