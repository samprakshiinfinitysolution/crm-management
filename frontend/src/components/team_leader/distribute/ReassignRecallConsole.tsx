"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeftRight,
  RotateCcw,
  Search,
  CheckSquare,
  Square,
  UserCheck,
  User,
  Briefcase,
} from "lucide-react";
import { LeadItem, SalesExecutiveSummary, LeadStatus } from "@/types/api.types";
import { Pagination } from "@/components/ui/Pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/lib/useDebounce";

interface ReassignRecallConsoleProps {
  executives: SalesExecutiveSummary[];
  assignedLeads: LeadItem[];
  onReassignLeads: (
    sourceExecId: string,
    targetExecId: string,
    leadIds: string[],
    reason: string,
  ) => void;
  onRecallLeads: (
    sourceExecId: string,
    leadIds: string[],
    reason: string,
  ) => void;
  handleSelectAllExecutives?: () => void;
  handleDeselectAllExecutives?: () => void;
  isProcessing?: boolean;
  fetchLeadsForExecutive?: (query?: {
    status?: LeadStatus;
    assignedToUserId?: string;
    limit?: number;
  }) => void;
}

export const ReassignRecallConsole: React.FC<ReassignRecallConsoleProps> = ({
  executives = [],
  assignedLeads = [],
  onReassignLeads,
  onRecallLeads,
  isProcessing = false,
  fetchLeadsForExecutive,
}) => {
  const [sourceExecutiveId, setSourceExecutiveId] = useState<string>("");
  const [targetExecutiveId, setTargetExecutiveId] = useState<string>("");
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [reason, setReason] = useState<string>("Workload rebalancing");
  const [actionType, setActionType] = useState<"REASSIGN" | "RECALL">(
    "REASSIGN",
  );
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Debounced search query
  const debouncedSearch = useDebounce(searchTerm, 300);

  const effectiveSourceExecutiveId =
    sourceExecutiveId || (executives.length > 0 ? executives[0].id : "");

  useEffect(() => {
    if (effectiveSourceExecutiveId && fetchLeadsForExecutive) {
      fetchLeadsForExecutive({
        assignedToUserId: effectiveSourceExecutiveId,
        limit: 100,
      });
    }
  }, [effectiveSourceExecutiveId, fetchLeadsForExecutive]);

  // Filter leads assigned to the selected source executive
  const sourceExecutive = executives.find(
    (e) => e.id === effectiveSourceExecutiveId,
  );
  const targetExecutive = executives.find((e) => e.id === targetExecutiveId);
  const leadsForSource = assignedLeads.filter((lead) => {
    const isSourceMatch =
      lead.assignedToUserId === effectiveSourceExecutiveId ||
      lead.assignedToId === effectiveSourceExecutiveId ||
      lead.assignedTo?.id === effectiveSourceExecutiveId;

    const matchesSearch =
      !debouncedSearch ||
      lead.customerName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      lead.leadCode.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      lead.mobile.includes(debouncedSearch);

    return isSourceMatch && matchesSearch;
  });

  const totalLeadItems = leadsForSource.length;
  const totalLeadPages = Math.max(1, Math.ceil(totalLeadItems / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalLeadPages);
  const paginatedLeads = leadsForSource.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize,
  );

  const handleToggleLead = (id: string) => {
    setSelectedLeadIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    if (
      selectedLeadIds.length === leadsForSource.length &&
      leadsForSource.length > 0
    ) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(leadsForSource.map((l) => l.id));
    }
  };

  const handleExecute = () => {
    if (selectedLeadIds.length === 0) return;

    if (actionType === "REASSIGN") {
      if (!targetExecutiveId) return;
      onReassignLeads(
        effectiveSourceExecutiveId,
        targetExecutiveId,
        selectedLeadIds,
        reason,
      );
    } else {
      onRecallLeads(effectiveSourceExecutiveId, selectedLeadIds, reason);
    }
    setSelectedLeadIds([]);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 rounded-sm shadow-2xs p-4 sm:p-5 space-y-4">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e0e0e0] dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div>
            <h2 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide flex items-center gap-1.5">
              <ArrowLeftRight className="w-3.5 h-3.5 text-[#2874f0]" />
              <span>Workload Reassignment & Pool Recall Console</span>
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Transfer assigned inventory between representatives or return
              uncontacted items to central intake
            </p>
          </div>
        </div>

        {/* Action Toggle Pills matching CRM Management Hub tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-sm shrink-0">
          <button
            type="button"
            onClick={() => setActionType("REASSIGN")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xs text-xs font-bold transition-all cursor-pointer ${
              actionType === "REASSIGN"
                ? "bg-[#2874f0] text-white shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Reassign to Representative</span>
          </button>
          <button
            type="button"
            onClick={() => setActionType("RECALL")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xs text-xs font-bold transition-all cursor-pointer ${
              actionType === "RECALL"
                ? "bg-rose-600 text-white shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Recall to Pool</span>
          </button>
        </div>
      </div>

      {/* Source & Target Configuration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 bg-slate-50/70 dark:bg-slate-800/40 p-3.5 sm:p-4 rounded-sm border border-[#e0e0e0] dark:border-slate-800">
        {/* Source Executive Picker */}
        <div className="space-y-1">
          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
            Source Representative (From):
          </label>
          <Select
            value={sourceExecutiveId}
            onValueChange={(val: string | null) => {
              setSourceExecutiveId(val || "");
              setSelectedLeadIds([]);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-full h-8.5 px-3 rounded-sm bg-white dark:bg-slate-800/80 border border-[#e0e0e0] dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#2874f0] focus:ring-1 focus:ring-[#2874f0]">
              <SelectValue placeholder="Select Source Representative">
                {sourceExecutive
                  ? `${sourceExecutive.name} (${sourceExecutive.activeLeads || 0} active listings)`
                  : undefined}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="border border-[#e0e0e0] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md">
              {executives.map((exec) => (
                <SelectItem
                  key={exec.id}
                  value={exec.id}
                  className="text-xs cursor-pointer"
                >
                  {exec.name} ({exec.activeLeads || 0} active listings)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Target Executive Picker (if Reassign) or Recall Notice */}
        {actionType === "REASSIGN" ? (
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
              Target Representative (To):
            </label>
            <Select
              value={targetExecutiveId}
              onValueChange={(val: string | null) => {
                setTargetExecutiveId(val || "");
              }}
            >
              <SelectTrigger className="w-full h-8.5 px-3 rounded-sm bg-white dark:bg-slate-800/80 border border-[#e0e0e0] dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#2874f0] focus:ring-1 focus:ring-[#2874f0]">
                <SelectValue placeholder="Select Target Representative">
                  {targetExecutive
                    ? `${targetExecutive.name} (Capacity: ${targetExecutive.activeLeads || 0}/30)`
                    : undefined}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="border border-[#e0e0e0] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md">
                {executives
                  .filter((e) => e.id !== sourceExecutiveId)
                  .map((exec) => (
                    <SelectItem
                      key={exec.id}
                      value={exec.id}
                      className="text-xs cursor-pointer"
                    >
                      {exec.name} (Load: ${exec.activeLeads || 0}/30 active)
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
              Recall Destination:
            </label>
            <div className="h-8.5 px-3 rounded-sm bg-[#eaf4fe] dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 flex items-center text-xs text-[#2874f0] font-semibold gap-1.5">
              <Briefcase className="w-3.5 h-3.5" />
              <span>Unassigned Central Intake Pool (Open Inventory)</span>
            </div>
          </div>
        )}

        {/* Reason for Audit Log */}
        <div className="md:col-span-2 space-y-1">
          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
            Audit Reason for{" "}
            {actionType === "REASSIGN" ? "Reassignment" : "Recall"}:
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Workload balancing, executive leave coverage, priority escalation..."
            className="w-full h-8.5 px-3 rounded-sm bg-white dark:bg-slate-800/80 border border-[#e0e0e0] dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-[#2874f0] focus:ring-1 focus:ring-[#2874f0] transition-all"
          />
        </div>
      </div>

      {/* Leads Selection Table for the Source Executive */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">
              Active Inventory of{" "}
              {sourceExecutive?.name || "Selected Representative"}
            </h3>
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-xs bg-[#eaf4fe] text-[#2874f0] border border-blue-200">
              {leadsForSource.length} items
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search listings..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-44 sm:w-56 h-8 pl-8 pr-3 text-xs rounded-sm bg-white dark:bg-slate-800 border border-[#e0e0e0] dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-[#2874f0] focus:ring-1 focus:ring-[#2874f0] transition-all"
              />
            </div>

            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
                className="h-8 px-2.5 rounded-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                title="Reset search"
              >
                <RotateCcw className="w-3 h-3 text-slate-500" />
                <span>Reset</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSelectAll}
              className="h-8 px-3 rounded-sm border border-[#e0e0e0] dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer"
            >
              {selectedLeadIds.length === leadsForSource.length &&
              leadsForSource.length > 0
                ? "Deselect All"
                : "Select All"}
            </button>
          </div>
        </div>

        {/* Table of Leads */}
        <div className="border border-[#e0e0e0] dark:border-slate-800 rounded-sm overflow-hidden">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 uppercase font-bold text-[11px] border-b border-[#e0e0e0] dark:border-slate-800">
              <tr>
                <th className="py-2.5 px-3 w-10 text-center">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-slate-400 hover:text-[#2874f0] cursor-pointer"
                  >
                    {selectedLeadIds.length > 0 &&
                    selectedLeadIds.length === leadsForSource.length ? (
                      <CheckSquare className="w-4 h-4 text-[#2874f0]" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="py-2.5 px-3">Lead Code</th>
                <th className="py-2.5 px-3">Customer Details</th>
                <th className="py-2.5 px-3">Status Stage</th>
                <th className="py-2.5 px-3">Budget</th>
                <th className="py-2.5 px-3">Priority SLA</th>
                <th className="py-2.5 px-3">Assigned Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e0e0e0] dark:divide-slate-800">
              {leadsForSource.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No active assigned leads found for this representative.
                  </td>
                </tr>
              ) : (
                paginatedLeads.map((lead) => {
                  const isSelected = selectedLeadIds.includes(lead.id);

                  return (
                    <tr
                      key={lead.id}
                      onClick={() => handleToggleLead(lead.id)}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors ${
                        isSelected ? "bg-blue-50/60 dark:bg-blue-950/30" : ""
                      }`}
                    >
                      <td
                        className="py-2.5 px-3 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => handleToggleLead(lead.id)}
                          className="text-slate-400 hover:text-[#2874f0] cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-[#2874f0]" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-[#2874f0]">
                        {lead.leadCode}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>{lead.customerName}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {lead.mobile}
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {lead.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-700 dark:text-slate-300 font-medium">
                        {lead.budget
                          ? `₹${Number(lead.budget).toLocaleString("en-IN")}`
                          : "—"}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-[11px] text-slate-700 dark:text-slate-300">
                        {lead.priority}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                        {lead.assignedAt
                          ? new Date(lead.assignedAt).toLocaleDateString()
                          : "Recent"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalLeadItems > 0 && (
          <div className="pt-2">
            <Pagination
              currentPage={safeCurrentPage}
              totalPages={totalLeadPages}
              totalItems={totalLeadItems}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
              className="bg-transparent border-0 px-0 py-0"
            />
          </div>
        )}
      </div>

      {/* Action Footer matching Flipkart Seller Central CTAs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#e0e0e0] dark:border-slate-800">
        <div className="text-xs text-slate-500 dark:text-slate-400">
          Selected Items:{" "}
          <strong className="text-slate-900 dark:text-slate-100 font-mono font-bold">
            {selectedLeadIds.length}
          </strong>{" "}
          leads to {actionType === "REASSIGN" ? "reassign" : "recall"}
        </div>

        <button
          type="button"
          disabled={
            selectedLeadIds.length === 0 ||
            (actionType === "REASSIGN" && !targetExecutiveId) ||
            isProcessing
          }
          onClick={handleExecute}
          className={`h-8.5 px-5 rounded-sm font-bold text-xs uppercase tracking-wide flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50 cursor-pointer ${
            actionType === "REASSIGN"
              ? "bg-[#2874f0] hover:bg-[#1a5bb8] text-white"
              : "bg-rose-600 hover:bg-rose-700 text-white"
          }`}
        >
          {isProcessing ? (
            <span>PROCESSING...</span>
          ) : actionType === "REASSIGN" ? (
            `EXECUTE REASSIGNMENT (${selectedLeadIds.length} LEADS)`
          ) : (
            `EXECUTE RECALL TO POOL (${selectedLeadIds.length} LEADS)`
          )}
        </button>
      </div>
    </div>
  );
};
