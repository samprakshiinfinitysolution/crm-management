"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Play, Search, Plus, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useGetLeadsQuery, useGetPipelineMetricsQuery } from "@/store";
import dynamic from "next/dynamic";
import { LeadStatus } from "@/types/api.types";
import {
  LeadsDirectoryTable,
  ListingsSummaryMetrics,
  ListingsRecommendationsBar,
  ListingsActionBar,
  ListingsFilterBar,
} from "@/components/leads";
import { downloadLeadsExport } from "@/lib/exportUtils";
import { useDebounce } from "@/lib/useDebounce";

// Code splitting: Modals are only loaded on-demand when user clicks actions
const ExportLeadsModal = dynamic(
  () =>
    import("@/components/leads/ExportLeadsModal").then(
      (m) => m.ExportLeadsModal
    ),
  { ssr: false }
);

const StatusChangeModal = dynamic(
  () =>
    import("@/components/leads/StatusChangeModal").then(
      (m) => m.StatusChangeModal
    ),
  { ssr: false }
);

const RecallLeadModal = dynamic(
  () => import("@/components/team_leader/RecallLeadModal"),
  { ssr: false }
);

const ReassignLeadModal = dynamic(
  () => import("@/components/team_leader/ReassignLeadModal"),
  { ssr: false }
);

const CRMHelpModal = dynamic(
  () =>
    import("@/components/dashboard/CRMHelpModal").then((m) => m.CRMHelpModal),
  { ssr: false }
);

export default function AdminLeadsPage() {
  // Filter and pagination states
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sourceFilter, setSourceFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [activeTab, setActiveTab] = useState("ACTIVE");
  const [activePill, setActivePill] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
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
    setPriorityFilter("ALL");
    setActiveTab("ACTIVE");
    setActivePill("all");
    setPage(1);
  };

  // Modals and selection state
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
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

  const queryStatus =
    statusFilter !== "ALL"
      ? (statusFilter as LeadStatus)
      : activeTab === "READY"
      ? LeadStatus.NEW
      : activeTab === "BLOCKED"
      ? LeadStatus.CONTACTED
      : activeTab === "INACTIVE"
      ? LeadStatus.LOST
      : activeTab === "ARCHIVED"
      ? LeadStatus.WON_SOLD
      : undefined;

  const {
    data: leadsResponse,
    isLoading,
    refetch,
  } = useGetLeadsQuery({
    search: debouncedSearch.trim() || undefined,
    status: queryStatus,
    source: sourceFilter !== "ALL" ? sourceFilter : undefined,
    priority: priorityFilter !== "ALL" ? priorityFilter : undefined,
    sortBy: sortBy !== "newest" ? sortBy : undefined,
    page,
    limit,
  });

  const leads = leadsResponse?.data || [];
  const pagination = leadsResponse?.pagination;
  const totalCount = pagination?.total || leads.length;

  const { data: metricsRes } = useGetPipelineMetricsQuery(undefined, {
    pollingInterval: 30000,
  });
  const metrics = metricsRes?.data;

  const summaryCounts = {
    active: metrics?.totalLeads ?? totalCount,
    readyForActivation: metrics?.unassignedCount ?? leads.filter((l) => l.status === "NEW" || !l.assignedTo).length,
    blocked: leads.filter((l) => l.status === "CONTACTED" || l.status === "ON_HOLD").length,
    inactive: leads.filter((l) => l.status === "LOST" || l.status === "NOT_INTERESTED").length,
    archived: metrics?.convertedCount ?? leads.filter((l) => l.status === "WON_SOLD").length,
  };

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

  const handleQuickDownload = async (format: "csv" | "excel") => {
    try {
      toast.info(`Preparing ${format.toUpperCase()} export download...`);
      await downloadLeadsExport({
        search: debouncedSearch || undefined,
        status: queryStatus,
        source: sourceFilter !== "ALL" ? sourceFilter : undefined,
      });
      toast.success("Download ready and initiated");
    } catch {
      toast.error("Export download failed. Please try again.");
    }
  };

  return (
    <div className="space-y-3 animate-in fade-in duration-150">
      {/* Breadcrumb: Home > Listings Management */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
        <Link href="/admin" className="text-[#2874f0] hover:underline font-medium">
          Home
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <span className="text-slate-700 dark:text-slate-300">Listings Management</span>
      </div>

      {/* Title & Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
          Listings Management
        </h1>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsHelpModalOpen(true)}
            className="h-8.5 px-3 rounded-sm bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 text-xs font-semibold text-[#2874f0] dark:text-blue-400 hover:bg-blue-50/40 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <div className="w-4 h-4 rounded-full bg-[#2874f0] text-white flex items-center justify-center">
              <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
            </div>
            <span>Learn about listing</span>
          </button>

          <div className="flex items-center h-8.5">
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search for FSN, Title or SKU ID"
              className="h-full w-48 sm:w-64 px-3 rounded-l-sm bg-white dark:bg-slate-900 border border-r-0 border-[#e0e0e0] dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-[#2874f0]"
            />
            <button
              type="button"
              onClick={() => setPage(1)}
              className="h-full px-3 rounded-r-sm bg-[#2874f0] hover:bg-[#1a5bb8] text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Search"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>

          <Link
            href="/admin/leads/create"
            className="h-8.5 px-4 rounded-sm bg-[#2874f0] hover:bg-[#1a5bb8] text-white font-bold text-xs uppercase tracking-wide flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>ADD NEW LISTINGS</span>
          </Link>
        </div>
      </div>

      {/* 5-Card Metric Summary Tabs */}
      <ListingsSummaryMetrics
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setPage(1);
        }}
        counts={summaryCounts}
        onCheckIssues={() => {
          setActiveTab("BLOCKED");
          setPage(1);
        }}
      />

      {/* Listings Recommendations Pill Bar */}
      <ListingsRecommendationsBar
        activePill={activePill}
        onPillChange={(pill) => {
          setActivePill(pill);
          if (pill === "stock") {
            setPriorityFilter("HIGH");
          } else if (pill === "minOq") {
            setPriorityFilter("URGENT");
          } else {
            setPriorityFilter("ALL");
          }
          setPage(1);
        }}
        counts={{
          all: metrics?.totalLeads ?? totalCount,
          stock: leads.filter((l) => l.priority === "HIGH").length,
          minOq: leads.filter((l) => l.priority === "URGENT").length,
        }}
      />

      {/* Action Toolbar */}
      <ListingsActionBar
        selectedCount={selectedLeadIds.length}
        onRequestDownload={handleQuickDownload}
        onSortChange={(val) => {
          setSortBy(val);
          setPage(1);
        }}
        currentSort={sortBy}
        isElevatedUser={true}
        onBulkAssign={() => {
          setReassignTargetLeadIds(selectedLeadIds);
          setReassignTargetLeadCodes(
            leads.filter((l) => selectedLeadIds.includes(l.id)).map((l) => l.leadCode),
          );
          setIsReassignModalOpen(true);
        }}
        onBulkStatusChange={() => {
          setStatusTargetLeadIds(selectedLeadIds);
          setStatusTargetLeadCodes(
            leads.filter((l) => selectedLeadIds.includes(l.id)).map((l) => l.leadCode),
          );
          setIsStatusModalOpen(true);
        }}
        onBulkRecall={() => {
          setRecallTargetLeadIds(selectedLeadIds);
          setRecallTargetLeadCodes(
            leads.filter((l) => selectedLeadIds.includes(l.id)).map((l) => l.leadCode),
          );
          setIsRecallModalOpen(true);
        }}
      />

      {/* Filter Bar with Funnel Icon & Dropdown Chips */}
      <ListingsFilterBar
        statusFilter={statusFilter}
        onStatusFilterChange={(s) => {
          setStatusFilter(s);
          setPage(1);
        }}
        sourceFilter={sourceFilter}
        onSourceFilterChange={(src) => {
          setSourceFilter(src);
          setPage(1);
        }}
        priorityFilter={priorityFilter}
        onPriorityFilterChange={(p) => {
          setPriorityFilter(p);
          setPage(1);
        }}
        onApply={() => setPage(1)}
        onReset={handleResetFilters}
      />

      {/* High Density Flipkart Seller Marketplace Table */}
      <LeadsDirectoryTable
        leads={leads}
        isLoading={isLoading}
        selectedLeadIds={selectedLeadIds}
        isTL={true}
        search={debouncedSearch}
        statusFilter={statusFilter}
        sourceFilter={sourceFilter}
        pagination={pagination}
        page={page}
        onPageChange={setPage}
        onPageSizeChange={(newSize) => {
          setLimit(newSize);
          setPage(1);
        }}
        limit={limit}
        onToggleSelectLead={handleToggleSelectLead}
        onToggleSelectAll={handleToggleSelectAll}
        onTriggerSingleRecall={(lead, e) => {
          e.stopPropagation();
          setRecallTargetLeadIds([lead.id]);
          setRecallTargetLeadCodes([lead.leadCode]);
          setRecallTargetExecutiveName(lead.assignedTo?.name);
          setIsRecallModalOpen(true);
        }}
        onTriggerSingleReassign={(lead, e) => {
          e.stopPropagation();
          setReassignTargetLeadIds([lead.id]);
          setReassignTargetLeadCodes([lead.leadCode]);
          setReassignTargetAssigneeId(lead.assignedTo?.id);
          setReassignTargetAssigneeName(lead.assignedTo?.name);
          setIsReassignModalOpen(true);
        }}
        onTriggerSingleStatusChange={(lead, e) => {
          e.stopPropagation();
          setStatusTargetLeadIds([lead.id]);
          setStatusTargetLeadCodes([lead.leadCode]);
          setStatusTargetStatus(lead.status);
          setIsStatusModalOpen(true);
        }}
      />

      {/* CRM Help & Support Modal - Rendered on-demand */}
      {isHelpModalOpen && (
        <CRMHelpModal
          isOpen={isHelpModalOpen}
          onClose={() => setIsHelpModalOpen(false)}
        />
      )}

      {/* Status Change Modal - Rendered on-demand */}
      {isStatusModalOpen && (
        <StatusChangeModal
          open={isStatusModalOpen}
          onClose={() => setIsStatusModalOpen(false)}
          leadIds={statusTargetLeadIds}
          leadCodes={statusTargetLeadCodes}
          currentStatus={statusTargetStatus}
          onSuccess={() => {
            refetch();
            setSelectedLeadIds([]);
          }}
        />
      )}

      {/* Recall Modal - Rendered on-demand */}
      {isRecallModalOpen && (
        <RecallLeadModal
          open={isRecallModalOpen}
          onClose={() => setIsRecallModalOpen(false)}
          leadIds={recallTargetLeadIds}
          leadCodes={recallTargetLeadCodes}
          assignedExecutiveName={recallTargetExecutiveName}
          onSuccess={() => {
            refetch();
            setSelectedLeadIds([]);
          }}
        />
      )}

      {/* Reassign Modal - Rendered on-demand */}
      {isReassignModalOpen && (
        <ReassignLeadModal
          open={isReassignModalOpen}
          onClose={() => setIsReassignModalOpen(false)}
          leadIds={reassignTargetLeadIds}
          leadCodes={reassignTargetLeadCodes}
          currentAssigneeId={reassignTargetAssigneeId}
          currentAssigneeName={reassignTargetAssigneeName}
          onSuccess={() => {
            refetch();
            setSelectedLeadIds([]);
          }}
        />
      )}

      {/* Export Modal - Rendered on-demand */}
      {isExportModalOpen && (
        <ExportLeadsModal
          open={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          currentFilters={{
            search: debouncedSearch || undefined,
            status: queryStatus,
            source: sourceFilter !== "ALL" ? sourceFilter : undefined,
          }}
          selectedLeadIds={selectedLeadIds}
        />
      )}
    </div>
  );
}
