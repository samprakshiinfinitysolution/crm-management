"use client";

import { useState, useMemo } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { UserRole } from "@/types/api.types";
import {
  DistributeStepperHeader,
  DistributeModeSelector,
  EqualSplitSection,
  CustomSplitSection,
  ManualSplitSection,
  ReassignRecallConsole,
  DistributeCommandBar,
  DistributionStepSummary,
  DistributionSuccessModal,
  ExecutiveSelectorStep,
  useLeadDistribution,
} from "@/components/team_leader/distribute";

export default function CreateDistributionPage() {
  // Step 2 is the active distribution step requested
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
    <ProtectedRoute allowedRoles={[UserRole.TEAM_LEADER, UserRole.ADMIN]}>
      <div className="flex flex-col gap-3.5 pb-8 max-w-7xl mx-auto w-full">
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
            {/* Mode Selector Tabs: [ Equal Split ] [ Custom Split ] [ Manual Split ] */}
            <DistributeModeSelector
              activeMode={activeMode}
              onSelectMode={handleSelectMode}
              unassignedCount={totalUnassignedCount}
            />

            {/* Equal Split Section: Executive table/selection first, then Lead pool & presets */}
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

            {/* Custom Split Section: Executive table & quota inputs first, then Target leads & balance */}
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

            {/* Manual Split Section: Target Executive panel first, then Unassigned Lead Table */}
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

            {/* Reassign / Recall Console */}
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

            {/* Sticky Step 2 Command Bar */}
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

        {/* Confirmation Success Celebration Modal */}
        <DistributionSuccessModal
          isOpen={isSuccessModalOpen}
          onClose={() => setIsSuccessModalOpen(false)}
          totalDistributed={lastDistributedCount}
          allocations={lastAllocations}
          mode={activeMode}
        />
      </div>
    </ProtectedRoute>
  );
}
