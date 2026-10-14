"use client";

import React, { useState } from "react";
import {
  Search,
  Filter,
  RefreshCw,
  ArrowUpRight,
  Database,
  ChevronLeft,
  ChevronRight,
  Clock,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RotateCcw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { LeadItem, LeadStatus } from "@/types/api.types";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/lib/useDebounce";
import { useGetLeadsQuery, useGetPipelineMetricsQuery } from "@/store";

interface PreuploadedLeadsViewProps {
  leads?: LeadItem[];
  isLoading?: boolean;
  isFetching?: boolean;
  onRefresh?: () => void;
  onSwitchToUpload: () => void;
}

const filterMap: Record<string, string> = {
  EXCEL_IMPORT: "Excel Import",
  WEBSITE: "Website Organic",
  CAMPAIGN: "Paid Campaign",
  REFERRAL: "Partner Referral",
  MANUAL_ENTRY: "Manual Entry",
};

export const PreuploadedLeadsView: React.FC<PreuploadedLeadsViewProps> = ({
  leads: initialLeads,
  isLoading: initialLoading,
  isFetching: initialFetching,
  onRefresh,
  onSwitchToUpload,
}) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSource, setSelectedSource] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [sortBy, setSortBy] = useState("createdAt:desc");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const hasActiveFilters = Boolean(
    searchTerm.trim() ||
    selectedSource !== "ALL" ||
    selectedStatus !== "ALL"
  );

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedSource("ALL");
    setSelectedStatus("ALL");
    setCurrentPage(1);
  };

  // Debounce search input by 400ms to avoid flooding backend requests
  const debouncedSearch = useDebounce(searchTerm, 400);

  // Server-side filtered & paginated query
  const {
    data: leadsRes,
    isLoading: isQueryLoading,
    isFetching: isQueryFetching,
    refetch: queryRefetch,
  } = useGetLeadsQuery({
    search: debouncedSearch.trim() || undefined,
    source: selectedSource !== "ALL" ? selectedSource : undefined,
    status: selectedStatus !== "ALL" ? selectedStatus : undefined,
    sortBy: sortBy || undefined,
    page: currentPage,
    limit: pageSize,
  });

  // Global database pipeline metrics for KPI strip
  const { data: metricsRes } = useGetPipelineMetricsQuery();
  const metrics = metricsRes?.data;

  const leads = initialLeads ?? (leadsRes?.data || []);
  const isLoading = initialLoading ?? isQueryLoading;
  const isFetching = initialFetching ?? isQueryFetching;
  const handleRefresh = onRefresh || queryRefetch;

  const pagination = leadsRes?.pagination;
  const totalCount = pagination?.total ?? metrics?.totalLeads ?? leads.length;
  const totalPages = Math.max(
    1,
    pagination?.totalPages ?? Math.ceil(totalCount / pageSize),
  );

  // Stats: Prefer database-wide metrics, fallback to local counts
  const totalInRepo = metrics?.totalLeads ?? totalCount;
  const unassignedCount =
    metrics?.unassignedCount ??
    leads.filter((l) => !l.assignedTo && !l.assignedToUserId).length;
  const assignedCount =
    metrics?.assignedCount ??
    leads.filter((l) => !!l.assignedTo || !!l.assignedToUserId).length;
  const wonCount =
    metrics?.convertedCount ??
    leads.filter((l) => l.status === LeadStatus.WON_SOLD).length;

  const handleSortToggle = (field: string) => {
    const [currentField, currentDir] = sortBy.split(":");
    let nextDir = field === "createdAt" ? "desc" : "asc";
    if (currentField === field) {
      nextDir = currentDir === "asc" ? "desc" : "asc";
    }
    setSortBy(`${field}:${nextDir}`);
    setCurrentPage(1);
  };

  const renderSortHeader = (label: string, field: string, className = "") => {
    const isFieldActive = sortBy.startsWith(`${field}:`);
    const isAsc = sortBy === `${field}:asc`;

    return (
      <th
        onClick={() => handleSortToggle(field)}
        className={`pb-3 cursor-pointer select-none group transition-colors ${
          isFieldActive
            ? "text-blue-400 font-bold"
            : "hover:text-accent-foreground/80"
        } ${className}`}
        title={`Click to sort by ${label}`}
      >
        <div className="inline-flex items-center gap-1.5">
          <span>{label}</span>
          {isFieldActive ? (
            isAsc ? (
              <ArrowUp className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            ) : (
              <ArrowDown className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            )
          ) : (
            <ArrowUpDown className="w-3 h-3 text-slate-500/40 group-hover:text-slate-300 transition-colors shrink-0" />
          )}
        </div>
      </th>
    );
  };

  return (
    <div className="space-y-3.5">
      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <Card className="p-3.5 rounded-lg bg-card/3 border border-white/10">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-200">
            Total In Repository
          </span>
          <div className="text-xl font-bold text-accent-foreground mt-1">
            {totalInRepo}
          </div>
        </Card>
        <Card className="p-3.5 rounded-lg bg-card/3 border border-white/10">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Unassigned Pool
          </span>
          <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            {unassignedCount}
          </div>
        </Card>
        <Card className="p-3.5 rounded-lg bg-card/3 border border-white/10">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            Assigned to Sales
          </span>
          <div className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-1">
            {assignedCount}
          </div>
        </Card>
        <Card className="p-3.5 rounded-lg bg-card/3 border border-white/10">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Closed Won
          </span>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {wonCount}
          </div>
        </Card>
      </div>

      {/* Main Table Container */}
      <div className="md:p-6 rounded-lg bg-card/3 border border-white/10 space-y-4">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 flex-1">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search repository leads..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-8 pr-3 py-1.5 bg-card/5 border border-crm-brand-subtle rounded-lg text-xs text-accent-foreground placeholder-accent-foreground/50 focus:outline-none focus:border-blue-500/50"
              />
            </div>

            {/* Filters: 2-column grid on mobile, flex on sm+ */}
            <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
              {/* Source Filter */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card/5 border border-white/10 w-full sm:w-auto">
                <Filter className="w-3 h-3 text-slate-400 shrink-0" />

                <Select<string>
                  value={selectedSource}
                  onValueChange={(value) => {
                    setSelectedSource(value || "ALL");
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-full sm:w-auto border-0 bg-transparent p-0 h-auto focus-visible:ring-0 text-xs shadow-none">
                    <p className="text-xs text-slate-400">Source:</p>
                    <SelectValue placeholder="All Sources" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="ALL">All Sources</SelectItem>
                    {Object.entries(filterMap).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card/5 border border-white/10 w-full sm:w-auto">
                <Select<string>
                  value={selectedStatus}
                  onValueChange={(value) => {
                    setSelectedStatus(value || "ALL");
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-full sm:w-auto border-0 bg-transparent p-0 h-auto focus-visible:ring-0 text-xs shadow-none">
                    <p className="text-xs text-slate-400">Status:</p>
                    <SelectValue placeholder="Filter Status" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="ALL">All Statuses</SelectItem>
                    <SelectItem value={LeadStatus.NEW}>NEW</SelectItem>
                    <SelectItem value={LeadStatus.ASSIGNED}>
                      ASSIGNED
                    </SelectItem>
                    <SelectItem value={LeadStatus.CONTACTED}>
                      CONTACTED
                    </SelectItem>
                    <SelectItem value={LeadStatus.INTERESTED}>
                      INTERESTED
                    </SelectItem>
                    <SelectItem value={LeadStatus.FOLLOW_UP}>
                      FOLLOW UP
                    </SelectItem>
                    <SelectItem value={LeadStatus.QUALIFIED}>
                      QUALIFIED
                    </SelectItem>
                    <SelectItem value={LeadStatus.PROPOSAL_QUOTATION}>
                      PROPOSAL
                    </SelectItem>
                    <SelectItem value={LeadStatus.NEGOTIATION}>
                      NEGOTIATION
                    </SelectItem>
                    <SelectItem value={LeadStatus.WON_SOLD}>
                      WON / SOLD
                    </SelectItem>
                    <SelectItem value={LeadStatus.LOST}>LOST</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Reset Button */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="h-8 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs shrink-0 self-start sm:self-auto"
                title="Reset repository filters"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span>Reset</span>
              </button>
            )}
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isFetching}
              className="p-2 rounded-lg bg-card/5 hover:bg-card/10 border border-white/10 text-slate-300 hover:text-white transition-all disabled:opacity-50"
              title="Refresh Repository"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`}
              />
            </button>

            <button
              type="button"
              onClick={() => router.push("/dashboard/distributions/create")}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all flex-1 sm:flex-initial"
            >
              <span>Distribute Leads</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="border-b border-crm-brand-subtle">
              <tr className="border-b border-crm-brand-subtle text-[11px] font-semibold uppercase tracking-wider text-slate-400 [&>th]:px-2">
                {renderSortHeader("Lead Code", "leadCode", "pl-2")}
                {renderSortHeader("Customer", "customerName")}
                <th className="pb-3">Contact</th>
                <th className="pb-3">Requirement</th>
                {renderSortHeader("City", "city")}
                <th className="pb-3">Source</th>
                <th className="pb-3">Assignment</th>
                {renderSortHeader("Status", "status")}
                {renderSortHeader("Date", "createdAt", "pr-2")}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={9} className="py-4">
                      <div className="h-6 bg-card/5 rounded-lg w-full" />
                    </td>
                  </tr>
                ))
              ) : leads.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="py-12 text-center text-xs text-slate-500"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Database className="w-8 h-8 text-slate-600" />
                      <p className="text-slate-400 font-medium">
                        No repository leads found matching your criteria.
                      </p>
                      <button
                        type="button"
                        onClick={onSwitchToUpload}
                        className="text-blue-400 hover:underline text-xs"
                      >
                        Upload a spreadsheet to get started
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-card/2 transition-colors [&>td]:px-2 border-b border-crm-brand-subtle"
                  >
                    <td className="py-3.5 pl-2 font-mono text-xs font-semibold text-blue-400">
                      {lead.leadCode}
                    </td>
                    <td className="py-3.5 font-medium text-brand-primary">
                      {lead.customerName}
                    </td>
                    <td className="py-3.5">
                      <div className="text-xs text-foreground/70 font-mono">
                        {lead.mobile}
                      </div>
                      {lead.email && (
                        <div className="text-[11px] text-slate-500">
                          {lead.email}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 text-xs text-foreground/70 max-w-35 truncate">
                      {lead.requirement || "—"}
                    </td>
                    <td className="py-3.5 text-xs text-foreground/70">
                      {lead.city || "—"}
                    </td>
                    <td className="py-3.5">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {lead.source || lead.leadSource || "EXCEL_IMPORT"}
                      </span>
                    </td>
                    <td className="py-3.5 text-xs flex items-center justify-center text-center">
                      {lead.assignedTo ? (
                        <span className="text-slate-200 font-medium">
                          {lead.assignedTo.name}
                        </span>
                      ) : (
                        <span className="text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full text-[10px] font-medium">
                          Unassigned Pool
                        </span>
                      )}
                    </td>
                    <td className="py-3.5">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-card/5 border border-white/10 text-slate-300">
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-3.5 pr-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalCount > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-crm-brand-subtle text-xs text-slate-400">
            <div>
              Showing {Math.min((currentPage - 1) * pageSize + 1, totalCount)}{" "}
              to {Math.min(currentPage * pageSize, totalCount)} of {totalCount}{" "}
              leads
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage === 1 || isFetching}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg bg-card/5 hover:bg-card/10 border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-slate-300"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-medium text-slate-700 dark:text-slate-300">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= totalPages || isFetching}
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                className="p-1.5 rounded-lg bg-card/5 hover:bg-card/10 border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-slate-300"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
