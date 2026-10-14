"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, GitFork, UploadCloud, Download, Tag } from "lucide-react";
import { toast } from "sonner";
import { useGetLeadsQuery } from "@/store";
import { LeadStatus, type LeadItem } from "@/types/api.types";
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

export default function AdminLeadsPage() {
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
  const [recallTargetLeadCodes, setRecallTargetLeadCodes] = useState<string[]>([]);
  const [recallTargetExecutiveName, setRecallTargetExecutiveName] = useState<string | undefined>();

  // Single/bulk Reassign state
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [reassignTargetLeadIds, setReassignTargetLeadIds] = useState<string[]>([]);
  const [reassignTargetLeadCodes, setReassignTargetLeadCodes] = useState<string[]>([]);
  const [reassignTargetAssigneeId, setReassignTargetAssigneeId] = useState<string | undefined>();
  const [reassignTargetAssigneeName, setReassignTargetAssigneeName] = useState<string | undefined>();

  // Single/Bulk Status Change
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusTargetLeadIds, setStatusTargetLeadIds] = useState<string[]>([]);
  const [statusTargetLeadCodes, setStatusTargetLeadCodes] = useState<string[]>([]);
  const [statusTargetStatus, setStatusTargetStatus] = useState<LeadStatus | undefined>();

  // Active query parameters
  const queryParams = {
    search: debouncedSearch.trim() || undefined,
    status: statusFilter !== "ALL" ? (statusFilter as LeadStatus) : undefined,
    source: sourceFilter !== "ALL" ? sourceFilter : undefined,
    page,
    limit,
  };

  const {
    data: leadsResponse,
    isLoading,
    refetch,
  } = useGetLeadsQuery(queryParams);

  const leads = leadsResponse?.data || [];
  const pagination = leadsResponse?.pagination;

  const handleToggleSelectLead = (id: string) => {
    setSelectedLeadIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
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
      lead.assignedTo?.id || lead.assignedToUserId || undefined
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
        "Please select at least one lead from the table to update status"
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
    <div className="space-y-3.5 animate-in fade-in duration-200">
      {/* 1. Header with Breadcrumb & Admin Actions */}
      <PageHeader
        breadcrumbs={[
          { label: "Admin Panel", href: "/admin" },
          { label: "Lead Management" },
        ]}
        title="Lead Inventory & Directory"
        description="Unrestricted administrator view of intake leads, active pipeline deals, and terminal states."
        actions={
          <>
            <button
              type="button"
              onClick={handleStatusChange}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs transition-colors"
            >
              <Tag className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>
                Update Status
                {selectedLeadIds.length > 0 ? ` (${selectedLeadIds.length})` : ""}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setIsExportModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>

            <Link
              href="/admin/imports"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs transition-colors"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Imports</span>
            </Link>

            <Link
              href="/admin/distributions/create"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs transition-colors"
            >
              <GitFork className="w-3.5 h-3.5" />
              <span>Distribute</span>
            </Link>

            <Link
              href="/admin/leads/create"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>+ Create Lead</span>
            </Link>
          </>
        }
      />

      {/* 2. Lead Filters Toolbar */}
      <LeadFiltersToolbar
        search={search}
        onSearchChange={handleSearchChange}
        statusFilter={statusFilter}
        onStatusFilterChange={(val: string) => {
          setStatusFilter(val);
          setPage(1);
        }}
        sourceFilter={sourceFilter}
        onSourceFilterChange={(val: string) => {
          setSourceFilter(val);
          setPage(1);
        }}
        onReset={handleResetFilters}
      />

      {/* 3. Bulk Action Bar */}
      <LeadsBulkActionBar
        selectedCount={selectedLeadIds.length}
        isTL={true}
        onExport={() => setIsExportModalOpen(true)}
        onReassign={handleTriggerBulkReassign}
        onRecall={handleTriggerBulkRecall}
        onStatusChange={handleStatusChange}
        onClear={() => setSelectedLeadIds([])}
      />

      {/* 4. Directory Table */}
      <LeadsDirectoryTable
        leads={leads}
        isLoading={isLoading}
        selectedLeadIds={selectedLeadIds}
        isTL={true}
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

      {/* 5. Modals */}
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
