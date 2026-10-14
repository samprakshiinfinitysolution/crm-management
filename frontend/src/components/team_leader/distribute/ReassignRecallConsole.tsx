"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeftRight,
  RotateCcw,
  Search,
  CheckSquare,
  Square,
  UserCheck,
} from "lucide-react";
import { LeadItem, SalesExecutiveSummary, LeadStatus } from "@/types/api.types";
import { Button } from "@/components/ui/button";
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
    <div className="bg-card dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col space-y-3.5 p-4 sm:p-5">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ArrowLeftRight className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Reassign or Recall Leads</span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5">
            Transfer assigned leads between executives or return them to the
            unassigned intake pool.
          </p>
        </div>

        {/* Action Toggle Pills */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0">
          <button
            type="button"
            onClick={() => setActionType("REASSIGN")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              actionType === "REASSIGN"
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Reassign to Agent</span>
          </button>
          <button
            type="button"
            onClick={() => setActionType("RECALL")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              actionType === "RECALL"
                ? "bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Recall to Pool</span>
          </button>
        </div>
      </div>

      {/* Source & Target Configuration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 bg-slate-50/70 dark:bg-slate-800/40 p-3 sm:p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
        {/* Source Executive Picker */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Source Executive (From):
          </label>
          <Select
            value={sourceExecutiveId}
            onValueChange={(val: string | null) => {
              setSourceExecutiveId(val || "");
              setSelectedLeadIds([]);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-full text-xs h-10 rounded-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-600">
              <SelectValue placeholder="Select Source Executive">
                {sourceExecutive
                  ? `${sourceExecutive.name} (${sourceExecutive.activeLeads || 0} active leads)`
                  : undefined}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {executives.map((exec) => (
                <SelectItem key={exec.id} value={exec.id}>
                  {exec.name} ({exec.activeLeads || 0} active leads)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Target Executive Picker (if Reassign) or Recall Notice */}
        {actionType === "REASSIGN" ? (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Target Executive (To):
            </label>
            <Select
              value={targetExecutiveId}
              onValueChange={(val: string | null) => {
                setTargetExecutiveId(val || "");
              }}
            >
              <SelectTrigger className="w-full text-xs h-10 rounded-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-600">
                <SelectValue placeholder="Select Target Executive">
                  {targetExecutive
                    ? `${targetExecutive.name} (Load: ${targetExecutive.activeLeads || 0}/30)`
                    : undefined}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {executives
                  .filter((e) => e.id !== sourceExecutiveId)
                  .map((exec) => (
                    <SelectItem key={exec.id} value={exec.id}>
                      {exec.name} (Load: {exec.activeLeads || 0}/30)
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Destination:
            </label>
            <div className="h-10 px-3.5 rounded-lg bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center text-xs text-amber-800 dark:text-amber-300 font-medium">
              Unassigned Intake Pool (Open Inventory)
            </div>
          </div>
        )}

        {/* Reason for Audit Log */}
        <div className="md:col-span-2 space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Audit Reason for{" "}
            {actionType === "REASSIGN" ? "Reassignment" : "Recall"}:
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Workload rebalancing, leave cover, escalation..."
            className="w-full h-10 px-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
          />
        </div>
      </div>

      {/* Leads Selection Table for the Source Executive */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Leads Assigned to {sourceExecutive?.name || "Selected Executive"}
            </h3>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {leadsForSource.length} active
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
              />
            </div>

            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
                className="h-8 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs shrink-0"
                title="Reset search"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span>Reset</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSelectAll}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer"
            >
              {selectedLeadIds.length === leadsForSource.length &&
              leadsForSource.length > 0
                ? "Deselect All"
                : "Select All"}
            </button>
          </div>
        </div>

        {/* Table of Leads */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50/80 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-2.5 px-3 w-10 text-center">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                  >
                    {selectedLeadIds.length > 0 &&
                    selectedLeadIds.length === leadsForSource.length ? (
                      <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="py-2.5 px-3">Lead Code</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Assigned Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {leadsForSource.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 dark:text-slate-500">
                    No active assigned leads found for this executive.
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
                        isSelected ? "bg-blue-50/50 dark:bg-blue-950/30" : ""
                      }`}
                    >
                      <td
                        className="py-2.5 px-3 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => handleToggleLead(lead.id)}
                          className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-semibold text-blue-600 dark:text-blue-400">
                        {lead.leadCode}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {lead.customerName}
                        </div>
                        <div className="text-[11px] text-slate-400 dark:text-slate-500">
                          {lead.mobile}
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {lead.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-700 dark:text-slate-300">
                        {lead.priority}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400 text-[11px]">
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

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="text-xs text-slate-500 dark:text-slate-400">
          Selected:{" "}
          <strong className="text-slate-900 dark:text-slate-100 font-semibold">
            {selectedLeadIds.length}
          </strong>{" "}
          leads to {actionType === "REASSIGN" ? "reassign" : "recall"}
        </div>

        <Button
          type="button"
          disabled={
            selectedLeadIds.length === 0 ||
            (actionType === "REASSIGN" && !targetExecutiveId) ||
            isProcessing
          }
          onClick={handleExecute}
          className={`px-5 py-2.5 rounded-lg font-semibold text-xs shadow-xs transition-all cursor-pointer ${
            actionType === "REASSIGN"
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-rose-600 hover:bg-rose-700 text-white"
          }`}
        >
          {isProcessing ? (
            <span>Processing...</span>
          ) : actionType === "REASSIGN" ? (
            `Execute Reassignment (${selectedLeadIds.length} Leads)`
          ) : (
            `Execute Recall to Pool (${selectedLeadIds.length} Leads)`
          )}
        </Button>
      </div>
    </div>
  );
};
