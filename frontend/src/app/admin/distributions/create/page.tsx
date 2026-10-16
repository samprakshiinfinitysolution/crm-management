"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronRight, Info } from "lucide-react";
import dynamic from "next/dynamic";
import {
  DistributeStepperHeader,
  DistributeModeSelector,
  DistributeCommandBar,
  DistributionStepSummary,
  ExecutiveSelectorStep,
  useLeadDistribution,
} from "@/components/team_leader/distribute";

// Code splitting: Mode sections and success modal are loaded on-demand
const EqualSplitSection = dynamic(
  () =>
    import("@/components/team_leader/distribute/EqualSplitSection").then(
      (m) => m.EqualSplitSection
    ),
  {
    loading: () => (
      <div className="h-64 animate-pulse bg-slate-100 dark:bg-slate-800 rounded-sm" />
    ),
  }
);

const CustomSplitSection = dynamic(
  () =>
    import("@/components/team_leader/distribute/CustomSplitSection").then(
      (m) => m.CustomSplitSection
    ),
  {
    loading: () => (
      <div className="h-64 animate-pulse bg-slate-100 dark:bg-slate-800 rounded-sm" />
    ),
  }
);

const ManualSplitSection = dynamic(
  () =>
    import("@/components/team_leader/distribute/ManualSplitSection").then(
      (m) => m.ManualSplitSection
    ),
  {
    loading: () => (
      <div className="h-64 animate-pulse bg-slate-100 dark:bg-slate-800 rounded-sm" />
    ),
  }
);

const ReassignRecallConsole = dynamic(
  () =>
    import("@/components/team_leader/distribute/ReassignRecallConsole").then(
      (m) => m.ReassignRecallConsole
    ),
  {
    loading: () => (
      <div className="h-64 animate-pulse bg-slate-100 dark:bg-slate-800 rounded-sm" />
    ),
  }
);

const DistributionSuccessModal = dynamic(
  () =>
    import(
      "@/components/team_leader/distribute/DistributionSuccessModal"
    ).then((m) => m.DistributionSuccessModal),
  { ssr: false }
);

export default function AdminCreateDistributionPage() {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  const {
    activeMode,
    handleSelectMode,
    unassignedLeads,
    executives,
    assignedLeads,
    fetchLeadsForExecutive,
    isAssignedLeadsLoading,
    selectedLeadIds,
    selectedExecutiveIds,
    handleToggleLead,
    handleSelectAllLeads,
    handleClearLeadSelection,
    handleToggleExecutiveSelection,
    handleSelectAllExecutives,
    handleDeselectAllExecutives,
    quotas,
    handleUpdateQuota,
    equalQuantity,
    setEqualQuantity,
    customTargetLeads,
    setCustomTargetLeads,
    equalSharePerExecutive,
    equalRemainderCount,
    currentAllocatedCount,
    isSubmitting,
    isExecutivesLoading,
    totalUnassignedCount,
    handleExecuteDistribution,
    handleAssignToSingle,
    handleAssignMulti,
    handleReassignLeads,
    handleRecallLeads,
    isSuccessModalOpen,
    setIsSuccessModalOpen,
    lastAllocations,
    lastDistributedCount,
    page,
    limit,
    totalPages,
    setPage,
    setLimit,
    searchTerm,
    setSearchTerm,
    selectedSource,
    setSelectedSource,
    selectedPriority,
    setSelectedPriority,
    executiveSearchTerm,
    setExecutiveSearchTerm,
    executiveWorkloadFilter,
    setExecutiveWorkloadFilter,
  } = useLeadDistribution();

  // Determine effective count of leads to distribute based on active mode
  const leadsToDistributeCount = useMemo(() => {
    if (activeMode === "EQUAL_SPLIT") return equalQuantity;
    if (activeMode === "FIXED_QUOTA")
      return currentAllocatedCount || customTargetLeads;
    if (activeMode === "MANUAL_PICK") return selectedLeadIds.length;
    return totalUnassignedCount;
  }, [
    activeMode,
    equalQuantity,
    currentAllocatedCount,
    customTargetLeads,
    selectedLeadIds.length,
    totalUnassignedCount,
  ]);

  // Step 2: only selected executives show
  const selectedExecutives = useMemo(() => {
    return executives.filter((e) => selectedExecutiveIds.includes(e.id));
  }, [executives, selectedExecutiveIds]);

  // Validation for proceeding from Step 2 to Step 3
  const isStep2Valid = useMemo(() => {
    if (selectedExecutiveIds.length === 0) return false;

    if (activeMode === "EQUAL_SPLIT") {
      return (
        equalQuantity > 0 && equalQuantity <= Math.max(1, totalUnassignedCount)
      );
    }

    if (activeMode === "FIXED_QUOTA") {
      return (
        currentAllocatedCount > 0 &&
        currentAllocatedCount === (customTargetLeads || 30)
      );
    }

    if (activeMode === "MANUAL_PICK") {
      return selectedLeadIds.length > 0;
    }

    return true;
  }, [
    selectedExecutiveIds.length,
    activeMode,
    equalQuantity,
    totalUnassignedCount,
    currentAllocatedCount,
    customTargetLeads,
    selectedLeadIds.length,
  ]);

  const step2SummaryText = useMemo(() => {
    if (activeMode === "EQUAL_SPLIT") {
      return `${equalQuantity} unassigned leads · ${selectedExecutiveIds.length} executives selected`;
    }
    if (activeMode === "FIXED_QUOTA") {
      return `${currentAllocatedCount} allocated of ${customTargetLeads || 30} target leads · ${selectedExecutiveIds.length} executives`;
    }
    if (activeMode === "MANUAL_PICK") {
      return `${selectedLeadIds.length} leads selected · ${selectedExecutiveIds.length} executives`;
    }
    return `${selectedExecutiveIds.length} executives selected`;
  }, [
    activeMode,
    equalQuantity,
    selectedExecutiveIds.length,
    currentAllocatedCount,
    customTargetLeads,
    selectedLeadIds.length,
  ]);

  return (
    <div className="space-y-4 animate-in fade-in duration-150 select-none pb-12">
      {/* Breadcrumb Navigation matching CRM Management Hub */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
        <Link
          href="/admin"
          className="text-[#2874f0] hover:underline font-medium"
        >
          Admin Console
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <Link
          href="/admin/distributions"
          className="text-[#2874f0] hover:underline font-medium"
        >
          Distributions Management
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <span className="text-slate-700 dark:text-slate-300 font-medium">
          Distribute Intake Inventory
        </span>
      </div>

      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e0e0e0] dark:border-slate-800 pb-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            Distribute Intake Inventory
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Admin engine for automated equal split, quota-based, or manual lead
            allocations
          </p>
        </div>

        <Link
          href="/admin/distributions"
          className="h-8 px-3 rounded-sm bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors self-start sm:self-auto shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Distributions</span>
        </Link>
      </div>

      {/* Marketplace Guidance Notice Banner */}
      <div className="px-4 py-3 bg-[#eaf4fe] dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-sm flex items-start gap-3 text-xs">
        <Info className="w-4 h-4 text-[#2874f0] shrink-0 mt-0.5" />
        <div className="space-y-0.5 text-slate-700 dark:text-slate-300">
          <p className="font-semibold text-slate-900 dark:text-white">
            Administrative Lead Distribution Engine
          </p>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
            Follow the 3-step wizard to choose active representatives, select an
            allocation strategy (Equal Split, Custom Quota, or Manual Pick), and
            commit the assignments atomically.
          </p>
        </div>
      </div>

      {/* Three-Step Stepper Header */}
      <DistributeStepperHeader
        currentStep={currentStep}
        onSelectStep={setCurrentStep}
        selectedExecCount={selectedExecutiveIds.length}
        totalExecCount={executives.length}
        selectedLeadCount={selectedLeadIds.length}
        activeMode={activeMode}
      />

      {/* STEP 1: Select Sales Executives */}
      {currentStep === 1 && (
        <ExecutiveSelectorStep
          executives={executives}
          selectedExecutiveIds={selectedExecutiveIds}
          onToggleExecutive={handleToggleExecutiveSelection}
          onSelectAll={handleSelectAllExecutives}
          onDeselectAll={handleDeselectAllExecutives}
          onAdvanceToStep2={() => setCurrentStep(2)}
          isLoading={isExecutivesLoading}
          searchTerm={executiveSearchTerm}
          onSearchChange={setExecutiveSearchTerm}
          workloadFilter={executiveWorkloadFilter}
          onWorkloadFilterChange={setExecutiveWorkloadFilter}
        />
      )}

      {/* STEP 2: Distribute Leads */}
      {currentStep === 2 && (
        <div className="space-y-3.5">
          <DistributeModeSelector
            activeMode={activeMode}
            onSelectMode={handleSelectMode}
            unassignedCount={totalUnassignedCount}
          />

          {activeMode === "EQUAL_SPLIT" && (
            <EqualSplitSection
              executives={selectedExecutives}
              selectedExecutiveIds={selectedExecutiveIds}
              onToggleExecutive={handleToggleExecutiveSelection}
              onSelectAllExecutives={handleSelectAllExecutives}
              onDeselectAllExecutives={handleDeselectAllExecutives}
              totalUnassignedCount={totalUnassignedCount}
              quantity={equalQuantity}
              onQuantityChange={setEqualQuantity}
            />
          )}

          {activeMode === "FIXED_QUOTA" && (
            <CustomSplitSection
              executives={selectedExecutives}
              selectedExecutiveIds={selectedExecutiveIds}
              onToggleExecutive={handleToggleExecutiveSelection}
              onSelectAllExecutives={handleSelectAllExecutives}
              onDeselectAllExecutives={handleDeselectAllExecutives}
              quotas={quotas}
              onUpdateQuota={handleUpdateQuota}
              totalUnassignedCount={totalUnassignedCount}
              targetLeadsCount={customTargetLeads}
              onTargetLeadsCountChange={setCustomTargetLeads}
            />
          )}

          {activeMode === "MANUAL_PICK" && (
            <ManualSplitSection
              executives={selectedExecutives}
              leads={unassignedLeads}
              selectedLeadIds={selectedLeadIds}
              onToggleLead={handleToggleLead}
              onSelectAllLeads={handleSelectAllLeads}
              onClearLeadSelection={handleClearLeadSelection}
              selectedExecutiveIds={selectedExecutiveIds}
              onToggleExecutive={handleToggleExecutiveSelection}
              onAssignToSingle={handleAssignToSingle}
              onAssignMulti={handleAssignMulti}
              isSubmitting={isSubmitting}
              totalUnassignedCount={totalUnassignedCount}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              selectedPriority={selectedPriority}
              onPriorityChange={setSelectedPriority}
              selectedSource={selectedSource}
              onSourceChange={setSelectedSource}
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              limit={limit}
              onLimitChange={setLimit}
            />
          )}

          {activeMode === "REASSIGN_RECALL" && (
            <ReassignRecallConsole
              executives={selectedExecutives}
              assignedLeads={assignedLeads}
              onReassignLeads={handleReassignLeads}
              handleSelectAllExecutives={handleSelectAllExecutives}
              handleDeselectAllExecutives={handleDeselectAllExecutives}
              onRecallLeads={handleRecallLeads}
              fetchLeadsForExecutive={fetchLeadsForExecutive}
              isProcessing={isSubmitting || isAssignedLeadsLoading}
            />
          )}

          {activeMode !== "REASSIGN_RECALL" && (
            <DistributeCommandBar
              summaryText={step2SummaryText}
              onBack={() => setCurrentStep(1)}
              onConfirm={() => setCurrentStep(3)}
              confirmLabel="Review Allocation (Step 3) →"
              isValid={isStep2Valid}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      )}

      {/* STEP 3: Wizard Step 1 & 2 Summary */}
      {currentStep === 3 && (
        <DistributionStepSummary
          executives={executives}
          selectedExecutiveIds={selectedExecutiveIds}
          mode={activeMode}
          totalLeadsToDistribute={leadsToDistributeCount}
          totalUnassignedCount={totalUnassignedCount}
          quotas={quotas}
          equalSharePerExecutive={equalSharePerExecutive}
          remainderCount={equalRemainderCount}
          selectedLeadIds={selectedLeadIds}
          leads={unassignedLeads}
          isSubmitting={isSubmitting}
          onBack={() => setCurrentStep(2)}
          onConfirm={handleExecuteDistribution}
        />
      )}

      {/* Confirmation Success Celebration Modal - Code split & on-demand */}
      {isSuccessModalOpen && (
        <DistributionSuccessModal
          isOpen={isSuccessModalOpen}
          onClose={() => setIsSuccessModalOpen(false)}
          totalDistributed={lastDistributedCount}
          allocations={lastAllocations}
          mode={activeMode}
        />
      )}
    </div>
  );
}
