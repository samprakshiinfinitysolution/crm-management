"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, GitFork, UploadCloud, Download, Tag } from "lucide-react";
import { toast } from "sonner";
import { useGetLeadsQuery, useAppSelector } from "@/store";
import { UserRole, LeadStatus, type LeadItem } from "@/types/api.types";
import { RecallLeadModal, ReassignLeadModal } from "@/components/team_leader";
import {
  ExportLeadsModal,
  LeadFiltersToolbar,
  LeadsBulkActionBar,
  LeadsDirectoryTable,
  StatusChangeModal,
} from "@/components/leads";
import { PageHeader } from "@/components/shared/PageHeader";
import { useDebounce } from "@/lib/useDebounce";

export default function LeadsListPage() {
  const { user } = useAppSelector((state) => state.auth);
  const isTL = user?.role === UserRole.TEAM_LEADER;

  // Filter and pagination states
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sourceFilter, setSourceFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Debounced search query
  const debouncedSearch = useDebounce(search, 400);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setSourceFilter("ALL");
    setPage(1);
  };

  // Modals and selection state
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);

  // Single/bulk Recall state
  const [isRecallModalOpen, setIsRecallModalOpen] = useState(false);
  const [recallTargetLeadIds, setRecallTargetLeadIds] = useState<string[]>([]);
  const [recallTargetLeadCodes, setRecallTargetLeadCodes] = useState<string[]>(
    [],
  );
  const [recallTargetExecutiveName, setRecallTargetExecutiveName] = useState<
    string | undefined
  >();

  // Single/bulk Reassign state
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [reassignTargetLeadIds, setReassignTargetLeadIds] = useState<string[]>(
    [],
  );
  const [reassignTargetLeadCodes, setReassignTargetLeadCodes] = useState<
    string[]
  >([]);
  const [reassignTargetAssigneeId, setReassignTargetAssigneeId] = useState<
    string | undefined
  >();
  const [reassignTargetAssigneeName, setReassignTargetAssigneeName] = useState<
    string | undefined
  >();

  // Single/Bulk Status Change
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusTargetLeadIds, setStatusTargetLeadIds] = useState<string[]>([]);
  const [statusTargetLeadCodes, setStatusTargetLeadCodes] = useState<string[]>(
    [],
  );
  const [statusTargetStatus, setStatusTargetStatus] = useState<
    LeadStatus | undefined
  >();

  const {
    data: leadsResponse,
    isLoading,
    refetch,
  } = useGetLeadsQuery({
    search: debouncedSearch.trim() || undefined,
    status: statusFilter !== "ALL" ? (statusFilter as LeadStatus) : undefined,
    source: sourceFilter !== "ALL" ? sourceFilter : undefined,
    page,
    limit,
  });

  const leads = leadsResponse?.data || [];
  const pagination = leadsResponse?.pagination;

  const handleToggleSelectLead = (id: string) => {
    setSelectedLeadIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedLeadIds.length === leads.length && leads.length > 0) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(leads.map((l) => l.id));
    }
  };

  const handleTriggerSingleRecall = (lead: LeadItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecallTargetLeadIds([lead.id]);
    setRecallTargetLeadCodes([lead.leadCode]);
    setRecallTargetExecutiveName(lead.assignedTo?.name);
    setIsRecallModalOpen(true);
  };

  const handleTriggerBulkRecall = () => {
    if (selectedLeadIds.length === 0) return;
    const selectedLeads = leads.filter((l) => selectedLeadIds.includes(l.id));
    setRecallTargetLeadIds(selectedLeadIds);
    setRecallTargetLeadCodes(selectedLeads.map((l) => l.leadCode));
    setRecallTargetExecutiveName(undefined);
    setIsRecallModalOpen(true);
  };

  const handleTriggerSingleReassign = (lead: LeadItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setReassignTargetLeadIds([lead.id]);
    setReassignTargetAssigneeId(
      lead.assignedTo?.id || lead.assignedToUserId || undefined,
    );
    setReassignTargetAssigneeName(lead.assignedTo?.name || undefined);
    setIsReassignModalOpen(true);
  };

  const handleTriggerBulkReassign = () => {
    if (selectedLeadIds.length === 0) return;
    const selectedLeads = leads.filter((l) => selectedLeadIds.includes(l.id));
    setReassignTargetLeadIds(selectedLeadIds);
    setReassignTargetLeadCodes(selectedLeads.map((l) => l.leadCode));
    setReassignTargetAssigneeId(undefined);
    setReassignTargetAssigneeName(undefined);
    setIsReassignModalOpen(true);
  };

  const handleStatusChange = () => {
    if (selectedLeadIds.length === 0) {
      toast.info(
        "Please select at least one lead from the table to update status",
      );
      return;
    }
    const selectedLeads = leads.filter((l) => selectedLeadIds.includes(l.id));
    setStatusTargetLeadIds(selectedLeadIds);
    setStatusTargetLeadCodes(selectedLeads.map((l) => l.leadCode));
    setStatusTargetStatus(undefined);
    setIsStatusModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-3.5">
      {/* Header & Quick Action Buttons */}
      <PageHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Lead Directory" },
        ]}
        title="Lead Directory"
        description={
          isTL
            ? "Complete overview of unassigned pool, active pipelines, and converted leads"
            : "Review your assigned customer inquiries and track deal progress"
        }
        actions={
          <div className="flex flex-wrap items-center gap-2 [&>a]:hover:cursor-pointer [&>a]:hover:active:scale-95">
            {isTL && (
              <>
                <Link
                  href="/dashboard/leads/create"
                  className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Lead</span>
                </Link>

                <Link
                  href="/dashboard/distributions/create"
                  className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 dark:border dark:border-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                >
                  <GitFork className="w-4 h-4" />
                  <span>Distribute</span>
                </Link>

                <Link
                  href="/dashboard/imports/upload"
                  className="px-3.5 py-2 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <span>Import Sheet</span>
                </Link>
              </>
            )}

            <button
              type="button"
              onClick={handleStatusChange}
              className="px-3.5 py-2 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
              title="Update pipeline status for selected leads"
            >
              <Tag className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>
                Update Status
                {selectedLeadIds.length > 0 ? ` (${selectedLeadIds.length})` : ""}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setIsExportModalOpen(true)}
              className="px-3.5 py-2 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
              title="Export Leads to Excel or CSV"
            >
              <Download className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Export</span>
            </button>
          </div>
        }
      />

      {/* Filter and Search Bar Component */}
      <LeadFiltersToolbar
        search={search}
        onSearchChange={handleSearchChange}
        statusFilter={statusFilter}
        onStatusFilterChange={(val) => {
          setStatusFilter(val);
          setPage(1);
        }}
        sourceFilter={sourceFilter}
        onSourceFilterChange={(val) => {
          setSourceFilter(val);
          setPage(1);
        }}
        onReset={handleResetFilters}
      />

      {/* Leads Directory Table Component */}
      <LeadsDirectoryTable
        leads={leads}
        isLoading={isLoading}
        selectedLeadIds={selectedLeadIds}
        isTL={isTL}
        search={search}
        statusFilter={statusFilter}
        sourceFilter={sourceFilter}
        pagination={pagination}
        page={page}
        onPageChange={(p) => setPage(p)}
        onPageSizeChange={(s) => setLimit(s)}
        limit={limit}
        onToggleSelectLead={handleToggleSelectLead}
        onToggleSelectAll={handleToggleSelectAll}
        onTriggerSingleRecall={handleTriggerSingleRecall}
        onTriggerSingleReassign={handleTriggerSingleReassign}
      />

      {/* Floating Bulk Actions Bar Component */}
      <LeadsBulkActionBar
        selectedCount={selectedLeadIds.length}
        isTL={isTL}
        onExport={() => setIsExportModalOpen(true)}
        onReassign={handleTriggerBulkReassign}
        onRecall={handleTriggerBulkRecall}
        onStatusChange={handleStatusChange}
        onClear={() => setSelectedLeadIds([])}
      />

      {/* Export Leads Modal */}
      {isExportModalOpen && (
        <ExportLeadsModal
          open={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          selectedLeadIds={selectedLeadIds}
          selectedLeadCodes={leads
            .filter((l) => selectedLeadIds.includes(l.id))
            .map((l) => l.leadCode)}
          currentFilters={{
            search: search.trim() || undefined,
            status: statusFilter !== "ALL" ? statusFilter : undefined,
            source: sourceFilter !== "ALL" ? sourceFilter : undefined,
          }}
          totalMatchingCount={pagination?.total}
        />
      )}

      {/* Recall Lead Modal */}
      {isRecallModalOpen && (
        <RecallLeadModal
          open={isRecallModalOpen}
          onClose={() => {
            setIsRecallModalOpen(false);
            setRecallTargetLeadIds([]);
            setRecallTargetLeadCodes([]);
            setRecallTargetExecutiveName(undefined);
          }}
          leadIds={recallTargetLeadIds}
          leadCodes={recallTargetLeadCodes}
          assignedExecutiveName={recallTargetExecutiveName}
          onSuccess={() => {
            setSelectedLeadIds([]);
            refetch();
          }}
        />
      )}

      {/* Reassign Lead Modal */}
      {isReassignModalOpen && (
        <ReassignLeadModal
          open={isReassignModalOpen}
          onClose={() => {
            setIsReassignModalOpen(false);
            setReassignTargetLeadIds([]);
            setReassignTargetLeadCodes([]);
            setReassignTargetAssigneeId(undefined);
            setReassignTargetAssigneeName(undefined);
          }}
          leadIds={reassignTargetLeadIds}
          leadCodes={reassignTargetLeadCodes}
          currentAssigneeId={reassignTargetAssigneeId}
          currentAssigneeName={reassignTargetAssigneeName}
          onSuccess={() => {
            setSelectedLeadIds([]);
            refetch();
          }}
        />
      )}

      {isStatusModalOpen && (
        <StatusChangeModal
          open={isStatusModalOpen}
          onClose={() => {
            setIsStatusModalOpen(false);
            setStatusTargetLeadIds([]);
            setStatusTargetLeadCodes([]);
            setStatusTargetStatus(undefined);
          }}
          leadIds={statusTargetLeadIds}
          leadCodes={statusTargetLeadCodes}
          currentStatus={statusTargetStatus}
          onSuccess={() => {
            setSelectedLeadIds([]);
            refetch();
          }}
        />
      )}
    </div>
  );
}
