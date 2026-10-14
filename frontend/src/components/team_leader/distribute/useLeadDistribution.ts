"use client";

import { useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { DistributionTabMode } from "./DistributeModeSelector";
import { AllocationSummaryItem } from "./DistributionSuccessModal";
import {
  LeadStatus,
} from "@/types/api.types";
import {
  useDistributeLeadsMutation,
  useGetLeadsQuery,
  useLazyGetLeadsQuery,
  useGetSalesExecutivesQuery,
  useRecallLeadsMutation,
  useReassignLeadsMutation,
} from "@/store";
import { handleApiError } from "@/lib/errorHandler";
import { useDebounce } from "@/lib/useDebounce";

export function useLeadDistribution() {
  // Tab / distribution strategy mode
  const [activeMode, setActiveMode] =
    useState<DistributionTabMode>("EQUAL_SPLIT");

  // Selection state
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [userSelectedExecutiveIds, setUserSelectedExecutiveIds] = useState<
    string[] | null
  >(null);
  const [userCustomQuotas, setUserCustomQuotas] = useState<
    Record<string, number>
  >({});

  // Mode-specific quantities (default 0 so nothing is pre-selected until user explicitly picks or inputs a number)
  const [equalQuantity, setEqualQuantityInternal] = useState<number>(0);
  const [customTargetLeads, setCustomTargetLeadsInternal] = useState<number>(0);

  // Modal & operation status
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);
  const [lastAllocations, setLastAllocations] = useState<
    AllocationSummaryItem[]
  >([]);
  const [lastDistributedCount, setLastDistributedCount] = useState<number>(0);

  // Filter state
  const [searchTerm, setSearchTermInternal] = useState("");
  const [selectedSource, setSelectedSourceInternal] = useState("ALL");
  const [selectedPriority, setSelectedPriorityInternal] = useState("ALL");

  // Debounced search query
  const debouncedSearch = useDebounce(searchTerm, 400);

  // Pagination state
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  const setSearchTerm = (val: string) => {
    setSearchTermInternal(val);
    setPage(1);
  };
  const setSelectedSource = (val: string) => {
    setSelectedSourceInternal(val);
    setPage(1);
  };
  const setSelectedPriority = (val: string) => {
    setSelectedPriorityInternal(val);
    setPage(1);
  };

  // Executive Filter state (Server-side)
  const [executiveSearchTerm, setExecutiveSearchTerm] = useState("");
  const [executiveWorkloadFilter, setExecutiveWorkloadFilter] = useState<
    "ALL" | "OPTIMAL" | "NEAR_CAPACITY" | "OVERLOADED"
  >("ALL");

  const debouncedExecutiveSearch = useDebounce(executiveSearchTerm, 300);

  // RTK Query API connections
  const [distributeLeads, { isLoading: isDistributing }] =
    useDistributeLeadsMutation();
  const [recallLeadsMutation, { isLoading: isRecalling }] =
    useRecallLeadsMutation();
  const [reassignLeadsMutation, { isLoading: isReassigning }] =
    useReassignLeadsMutation();

  const {
    data: salesExecutive,
    isLoading: isExecutivesLoading,
    refetch: refetchExecutives,
  } = useGetSalesExecutivesQuery({
    search: debouncedExecutiveSearch.trim() || undefined,
    workloadStatus:
      executiveWorkloadFilter !== "ALL" ? executiveWorkloadFilter : undefined,
  });

  const {
    data: leadsRes,
    isLoading: isQueryLoading,
    isFetching: isQueryFetching,
    refetch: queryRefetch,
  } = useGetLeadsQuery({
    status: LeadStatus.UNASSIGNED,
    limit,
    page,
    search: debouncedSearch.trim() || undefined,
    source: selectedSource !== "ALL" ? selectedSource : undefined,
    priority: selectedPriority !== "ALL" ? selectedPriority : undefined,
  });

  const [assignedSourceExecId, setAssignedSourceExecId] = useState<string>("");

  const [
    triggerFetchAssignedLeads,
    { data: dynamicExecutiveLeadsRes, isFetching: isFetchingDynamicAssigned },
  ] = useLazyGetLeadsQuery();

  const {
    data: assignedLeadsRes,
    refetch: refetchAssignedLeads,
    isFetching: isAssignedLeadsFetching,
  } = useGetLeadsQuery(
    {
      limit: 100,
      assignedToUserId: assignedSourceExecId || undefined,
    },
    { skip: activeMode !== "REASSIGN_RECALL" },
  );

  const fetchLeadsForExecutive = useCallback(
    (query?: {
      status?: LeadStatus;
      assignedToUserId?: string;
      limit?: number;
    }) => {
      if (query?.assignedToUserId) {
        setAssignedSourceExecId(query.assignedToUserId);
        triggerFetchAssignedLeads({
          assignedToUserId: query.assignedToUserId,
          status: query.status,
          limit: query.limit || 100,
        });
      }
    },
    [triggerFetchAssignedLeads],
  );

  const assignedLeads = useMemo(() => {
    const activeData =
      (assignedSourceExecId && dynamicExecutiveLeadsRes?.data) ||
      assignedLeadsRes?.data;
    if (!activeData) return [];
    return activeData.filter((lead) =>
      Boolean(lead.assignedToUserId || lead.assignedTo?.id),
    );
  }, [assignedSourceExecId, dynamicExecutiveLeadsRes, assignedLeadsRes]);

  // Resolved list of leads and executives
  const unassignedLeads = useMemo(() => {
    return leadsRes?.data && leadsRes.data.length > 0 ? leadsRes.data : [];
  }, [leadsRes]);

  const executives = useMemo(() => {
    if (salesExecutive?.data && salesExecutive.data.length > 0) {
      return salesExecutive.data;
    }
    return [];
  }, [salesExecutive]);

  // Total unassigned pool count
  const totalUnassignedCount = useMemo(() => {
    if (leadsRes?.pagination?.total !== undefined) {
      return leadsRes.pagination.total;
    }
    return unassignedLeads.length;
  }, [leadsRes, unassignedLeads.length]);

  // Derived effective quantities strictly bounded to available unassigned leads
  const effectiveEqualQuantity = useMemo(() => {
    return Math.min(Math.max(0, equalQuantity), totalUnassignedCount);
  }, [equalQuantity, totalUnassignedCount]);

  const effectiveCustomTargetLeads = useMemo(() => {
    return Math.min(Math.max(0, customTargetLeads), totalUnassignedCount);
  }, [customTargetLeads, totalUnassignedCount]);

  const setEqualQuantity = useCallback(
    (val: number) => {
      setEqualQuantityInternal(Math.max(0, val));
    },
    [],
  );

  const setCustomTargetLeads = useCallback(
    (val: number) => {
      setCustomTargetLeadsInternal(Math.max(0, val));
    },
    [],
  );

  // Derived selected executives (defaults to first 3 executives if none selected yet)
  const selectedExecutiveIds = useMemo(() => {
    if (userSelectedExecutiveIds !== null) {
      return userSelectedExecutiveIds;
    }
    return [];
  }, [userSelectedExecutiveIds]);

  // Derived quotas for each executive in Custom Split mode (strictly capped at totalUnassignedCount)
  const quotas = useMemo<Record<string, number>>(() => {
    const calculatedQuotas: Record<string, number> = {};
    const hasUserQuotas = Object.keys(userCustomQuotas).length > 0;

    if (hasUserQuotas) {
      let cumulative = 0;
      executives.forEach((e) => {
        const requested = Math.max(0, userCustomQuotas[e.id] ?? 0);
        const maxAvailable = Math.max(0, totalUnassignedCount - cumulative);
        const allowed = Math.min(requested, maxAvailable);
        calculatedQuotas[e.id] = allowed;
        cumulative += allowed;
      });
    } else {
      // Default distribution e.g. 15, 10, 5 for top 3, strictly capped at totalUnassignedCount
      let remaining = Math.min(
        effectiveCustomTargetLeads || 30,
        totalUnassignedCount,
      );
      const defaultDistribution = [15, 10, 5];
      executives.forEach((e, idx) => {
        if (idx < defaultDistribution.length && remaining > 0) {
          const alloc = Math.min(defaultDistribution[idx], remaining);
          calculatedQuotas[e.id] = alloc;
          remaining -= alloc;
        } else {
          calculatedQuotas[e.id] = 0;
        }
      });
    }
    return calculatedQuotas;
  }, [
    executives,
    userCustomQuotas,
    totalUnassignedCount,
    effectiveCustomTargetLeads,
  ]);

  // Mathematical distribution metrics for Equal Split
  const selectedExecCount = selectedExecutiveIds.length;

  const equalSharePerExecutive = useMemo(() => {
    if (selectedExecCount === 0 || effectiveEqualQuantity === 0) return 0;
    return Math.floor(effectiveEqualQuantity / selectedExecCount);
  }, [effectiveEqualQuantity, selectedExecCount]);

  const equalRemainderCount =
    selectedExecCount > 0 ? effectiveEqualQuantity % selectedExecCount : 0;

  // Custom split totals (strictly bounded)
  const customTotalAllocated = useMemo(() => {
    return executives.reduce((sum, e) => sum + (quotas[e.id] || 0), 0);
  }, [executives, quotas]);

  const customRemainderCount = Math.max(
    0,
    effectiveCustomTargetLeads - customTotalAllocated,
  );

  // Manual split metrics
  const manualAllocatedCount = selectedLeadIds.length;

  const currentAllocatedCount =
    activeMode === "EQUAL_SPLIT"
      ? effectiveEqualQuantity
      : activeMode === "FIXED_QUOTA"
        ? customTotalAllocated
        : manualAllocatedCount;

  // Validation
  const isValid = useMemo(() => {
    if (totalUnassignedCount === 0) return false;

    if (activeMode === "EQUAL_SPLIT") {
      return (
        selectedExecCount > 0 &&
        effectiveEqualQuantity >= selectedExecCount &&
        effectiveEqualQuantity <= totalUnassignedCount
      );
    }
    if (activeMode === "FIXED_QUOTA") {
      return (
        customTotalAllocated > 0 &&
        customTotalAllocated <= totalUnassignedCount &&
        (effectiveCustomTargetLeads > 0
          ? customTotalAllocated === effectiveCustomTargetLeads
          : true)
      );
    }
    if (activeMode === "MANUAL_PICK") {
      return (
        selectedLeadIds.length > 0 &&
        selectedLeadIds.length <= totalUnassignedCount &&
        selectedExecutiveIds.length > 0
      );
    }
    return true;
  }, [
    activeMode,
    totalUnassignedCount,
    selectedExecCount,
    effectiveEqualQuantity,
    customTotalAllocated,
    effectiveCustomTargetLeads,
    selectedLeadIds.length,
    selectedExecutiveIds.length,
  ]);

  const validationMessage = useMemo(() => {
    if (totalUnassignedCount === 0) {
      return "No unassigned leads available in the pool for distribution.";
    }
    if (activeMode === "EQUAL_SPLIT") {
      if (selectedExecCount === 0)
        return "Please select at least one sales executive to receive leads.";
      if (effectiveEqualQuantity <= 0)
        return "Please choose a quantity greater than zero.";
      if (effectiveEqualQuantity < selectedExecCount)
        return `Selected lead quantity (${effectiveEqualQuantity}) is less than the number of selected executives (${selectedExecCount}). For equal distribution, you must allocate at least ${selectedExecCount} leads (1 per executive).`;
      if (equalQuantity > totalUnassignedCount)
        return `Selected quantity (${equalQuantity}) exceeds available unassigned leads (${totalUnassignedCount}).`;
    }
    if (activeMode === "FIXED_QUOTA") {
      if (customTotalAllocated === 0)
        return "Please allocate at least 1 lead to an executive.";
      if (customTotalAllocated > totalUnassignedCount)
        return `Sum of custom distributed leads (${customTotalAllocated}) exceeds available unassigned leads (${totalUnassignedCount}).`;
      if (customTotalAllocated > effectiveCustomTargetLeads)
        return `Sum of custom distributed leads (${customTotalAllocated}) exceeds target leads (${effectiveCustomTargetLeads}).`;
      if (customTotalAllocated < effectiveCustomTargetLeads)
        return `${effectiveCustomTargetLeads - customTotalAllocated} leads remaining to reach target of ${effectiveCustomTargetLeads} (currently allocated: ${customTotalAllocated}).`;
    }
    if (activeMode === "MANUAL_PICK") {
      if (selectedLeadIds.length === 0)
        return "Please select at least one lead from the table.";
      if (selectedLeadIds.length > totalUnassignedCount)
        return `Selected leads (${selectedLeadIds.length}) exceeds unassigned pool (${totalUnassignedCount}).`;
      if (selectedExecutiveIds.length === 0)
        return "Please select at least one target executive.";
    }
    return undefined;
  }, [
    activeMode,
    totalUnassignedCount,
    selectedExecCount,
    equalQuantity,
    effectiveEqualQuantity,
    customTotalAllocated,
    effectiveCustomTargetLeads,
    selectedLeadIds.length,
    selectedExecutiveIds.length,
  ]);

  // Lead selection handlers
  const handleToggleLead = (id: string) => {
    setSelectedLeadIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSelectAllLeads = (ids: string[]) => {
    setSelectedLeadIds(ids);
  };

  const handleClearLeadSelection = () => {
    setSelectedLeadIds([]);
  };

  // Executive selection handlers
  const handleToggleExecutive = (id: string) => {
    setUserSelectedExecutiveIds(
      selectedExecutiveIds.includes(id)
        ? selectedExecutiveIds.filter((item) => item !== id)
        : [...selectedExecutiveIds, id],
    );
  };

  const handleAddExecutive = (id: string) => {
    if (!selectedExecutiveIds.includes(id)) {
      setUserSelectedExecutiveIds([...selectedExecutiveIds, id]);
    }
  };

  const handleRemoveExecutive = (id: string) => {
    setUserSelectedExecutiveIds(
      selectedExecutiveIds.filter((item) => item !== id),
    );
  };

  const handleSelectAllExecutives = () => {
    setUserSelectedExecutiveIds(executives.map((e) => e.id));
  };

  const handleDeselectAllExecutives = () => {
    setUserSelectedExecutiveIds([]);
  };

  const handleUpdateQuota = useCallback(
    (id: string, quota: number) => {
      const rawQuota = Math.max(0, quota);
      setUserCustomQuotas((prev) => {
        // Sum up quotas for all OTHER executives
        const otherTotal = executives.reduce((sum, e) => {
          if (e.id === id) return sum;
          const q = prev[e.id] !== undefined ? prev[e.id] : (quotas[e.id] || 0);
          return sum + q;
        }, 0);

        const maxForThisExec = Math.max(0, totalUnassignedCount - otherTotal);
        const clampedQuota = Math.min(rawQuota, maxForThisExec);

        return {
          ...prev,
          [id]: clampedQuota,
        };
      });
    },
    [executives, quotas, totalUnassignedCount],
  );

  const handleSelectMode = (mode: DistributionTabMode) => {
    setActiveMode(mode);
  };

  // Direct single executive assign (Manual Split)
  const handleAssignToSingle = async (executiveId: string) => {
    if (selectedLeadIds.length === 0) {
      toast.error("Please select at least one lead to assign");
      return;
    }
    const targetExec = executives.find((e) => e.id === executiveId);
    if (!targetExec) {
      toast.error("Invalid executive selected");
      return;
    }

    setIsSubmitting(true);
    try {
      // If demo data, simulate instant feedback
      const hasMockLeads = selectedLeadIds.some(
        (id) => id.startsWith("demo-") || id.startsWith("lead-"),
      );
      const isMockExec =
        targetExec.id.startsWith("exec-") || targetExec.id.startsWith("se-");

      if (hasMockLeads || isMockExec) {
        toast.success(
          `Successfully assigned ${selectedLeadIds.length} leads to ${targetExec.name}`,
        );
        setLastAllocations([
          { executiveName: targetExec.name, count: selectedLeadIds.length },
        ]);
        setLastDistributedCount(selectedLeadIds.length);
        setIsSuccessModalOpen(true);
        setSelectedLeadIds([]);
        return;
      }

      const assignments = selectedLeadIds.map((leadId) => ({
        leadId,
        salesExecutiveId: executiveId,
      }));

      const res = await distributeLeads({
        mode: "EXPLICIT",
        assignments,
        reason: "Manual Split Assignment",
      }).unwrap();

      toast.success(res.message || "Leads assigned successfully");
      setLastAllocations([
        { executiveName: targetExec.name, count: selectedLeadIds.length },
      ]);
      setLastDistributedCount(selectedLeadIds.length);
      setIsSuccessModalOpen(true);
      setSelectedLeadIds([]);
      queryRefetch();
      refetchExecutives();
    } catch (err) {
      handleApiError(err, "Failed to assign leads");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Multi executive assign (Manual Split)
  const handleAssignMulti = async (
    allocations: { executiveId: string; count: number }[],
  ) => {
    setIsSubmitting(true);
    try {
      const activeAllocations = allocations.filter((a) => a.count > 0);
      const totalAllocated = activeAllocations.reduce(
        (sum, a) => sum + a.count,
        0,
      );

      if (totalAllocated !== selectedLeadIds.length) {
        toast.error("Total allocated count must match selected leads");
        setIsSubmitting(false);
        return;
      }

      const modalAllocations: AllocationSummaryItem[] = [];
      const assignments: { leadId: string; salesExecutiveId: string }[] = [];
      let leadIdx = 0;

      for (const alloc of activeAllocations) {
        const exec = executives.find((e) => e.id === alloc.executiveId);
        if (exec) {
          modalAllocations.push({
            executiveName: exec.name,
            count: alloc.count,
          });
        }
        for (let i = 0; i < alloc.count; i++) {
          if (leadIdx < selectedLeadIds.length) {
            assignments.push({
              leadId: selectedLeadIds[leadIdx],
              salesExecutiveId: alloc.executiveId,
            });
            leadIdx++;
          }
        }
      }

      const isMock = assignments.some(
        (a) =>
          a.leadId.startsWith("demo-") ||
          a.salesExecutiveId.startsWith("exec-") ||
          a.salesExecutiveId.startsWith("se-"),
      );

      if (isMock) {
        toast.success(
          `Successfully assigned ${selectedLeadIds.length} leads across ${activeAllocations.length} executives`,
        );
        setLastAllocations(modalAllocations);
        setLastDistributedCount(selectedLeadIds.length);
        setIsSuccessModalOpen(true);
        setSelectedLeadIds([]);
        return;
      }

      const res = await distributeLeads({
        mode: "EXPLICIT",
        assignments,
        reason: "Manual Split Multi-Assignment",
      }).unwrap();

      toast.success(res.message || "Leads assigned successfully");
      setLastAllocations(modalAllocations);
      setLastDistributedCount(selectedLeadIds.length);
      setIsSuccessModalOpen(true);
      setSelectedLeadIds([]);
      queryRefetch();
      refetchExecutives();
    } catch (err) {
      handleApiError(err, "Failed to distribute leads");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Main Distribution Execution
  const handleExecuteDistribution = async () => {
    setIsSubmitting(true);
    try {
      const modalAllocations: AllocationSummaryItem[] = [];

      if (activeMode === "EQUAL_SPLIT") {
        const qtyToDistribute = effectiveEqualQuantity;
        if (qtyToDistribute < selectedExecutiveIds.length) {
          toast.error(
            `Cannot distribute: lead quantity (${qtyToDistribute}) is less than selected executives (${selectedExecutiveIds.length}). Each executive must receive at least 1 lead.`,
          );
          setIsSubmitting(false);
          return;
        }

        if (qtyToDistribute > totalUnassignedCount) {
          toast.error(
            `Distribution quantity (${qtyToDistribute}) cannot exceed available unassigned leads (${totalUnassignedCount})`,
          );
          setIsSubmitting(false);
          return;
        }

        const base = Math.floor(qtyToDistribute / selectedExecutiveIds.length);
        const rem = qtyToDistribute % selectedExecutiveIds.length;

        selectedExecutiveIds.forEach((id, index) => {
          const exec = executives.find((e) => e.id === id);
          if (exec) {
            const count = base + (index < rem ? 1 : 0);
            modalAllocations.push({
              executiveName: exec.name,
              count,
            });
          }
        });

        const hasMock = selectedExecutiveIds.some(
          (id) => id.startsWith("exec-") || id.startsWith("se-"),
        );

        if (hasMock) {
          toast.success(
            `Successfully distributed ${qtyToDistribute} leads equally across ${selectedExecutiveIds.length} executives`,
          );
          setLastAllocations(modalAllocations);
          setLastDistributedCount(qtyToDistribute);
          setIsSuccessModalOpen(true);
          return;
        }

        // Real API call
        const res = await distributeLeads({
          mode: "EQUAL",
          executiveIds: selectedExecutiveIds,
          leadIds:
            unassignedLeads.length >= qtyToDistribute
              ? unassignedLeads.slice(0, qtyToDistribute).map((l) => l.id)
              : undefined,
          reason: "Equal Lead Distribution",
        }).unwrap();

        toast.success(res.message || "Leads distributed equally");
        setLastAllocations(modalAllocations);
        setLastDistributedCount(res.data?.distributedCount ?? qtyToDistribute);
        setIsSuccessModalOpen(true);
        queryRefetch();
        refetchExecutives();
      } else if (activeMode === "FIXED_QUOTA") {
        if (customTotalAllocated > totalUnassignedCount) {
          toast.error(
            `Allocated leads (${customTotalAllocated}) cannot exceed available unassigned pool (${totalUnassignedCount})`,
          );
          setIsSubmitting(false);
          return;
        }

        const activeAllocations = executives
          .filter((e) => (quotas[e.id] || 0) > 0)
          .map((e) => ({
            salesExecutiveId: e.id,
            count: quotas[e.id] || 0,
            exec: e,
          }));

        activeAllocations.forEach((item) => {
          modalAllocations.push({
            executiveName: item.exec.name,
            count: item.count,
          });
        });

        const hasMock = activeAllocations.some(
          (a) =>
            a.salesExecutiveId.startsWith("exec-") ||
            a.salesExecutiveId.startsWith("se-"),
        );

        if (hasMock) {
          toast.success(
            `Successfully allocated ${customTotalAllocated} leads across ${activeAllocations.length} executives`,
          );
          setLastAllocations(modalAllocations);
          setLastDistributedCount(customTotalAllocated);
          setIsSuccessModalOpen(true);
          return;
        }

        const res = await distributeLeads({
          mode: "CUSTOM",
          allocations: activeAllocations.map((a) => ({
            salesExecutiveId: a.salesExecutiveId,
            count: a.count,
          })),
          reason: "Custom Lead Distribution",
        }).unwrap();

        toast.success(res.message || "Leads allocated successfully");
        setLastAllocations(modalAllocations);
        setLastDistributedCount(
          res.data?.distributedCount ?? customTotalAllocated,
        );
        setIsSuccessModalOpen(true);
        queryRefetch();
        refetchExecutives();
      } else if (activeMode === "MANUAL_PICK") {
        if (selectedExecutiveIds.length === 1) {
          await handleAssignToSingle(selectedExecutiveIds[0]);
        } else {
          toast.info("Please assign leads using the assignment panel above");
        }
      }
    } catch (err) {
      handleApiError(err, "Failed to distribute leads");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reassignment & Recall handlers
  const handleReassignLeads = async (
    sourceExecId: string,
    targetExecId: string,
    leadIds: string[],
    reason: string,
  ) => {
    setIsSubmitting(true);
    try {
      const res = await reassignLeadsMutation({
        leadIds,
        targetExecutiveId: targetExecId,
        reason: reason || "Workload rebalancing",
      }).unwrap();

      toast.success(
        res.message || `Reassigned ${leadIds.length} leads successfully`,
      );
      if (assignedSourceExecId) {
        triggerFetchAssignedLeads({
          assignedToUserId: assignedSourceExecId,
          limit: 100,
        });
      }
      refetchAssignedLeads();
      refetchExecutives();
      queryRefetch();
    } catch (err) {
      handleApiError(err, "Failed to reassign leads");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecallLeads = async (
    sourceExecId: string,
    leadIds: string[],
    reason: string,
  ) => {
    setIsSubmitting(true);
    try {
      const res = await recallLeadsMutation({
        leadIds,
        reason: reason || "Recalled to unassigned pool",
      }).unwrap();

      toast.success(
        res.message ||
          `Recalled ${leadIds.length} leads back to unassigned pool`,
      );
      if (assignedSourceExecId) {
        triggerFetchAssignedLeads({
          assignedToUserId: assignedSourceExecId,
          limit: 100,
        });
      }
      refetchAssignedLeads();
      refetchExecutives();
      queryRefetch();
    } catch (err) {
      handleApiError(err, "Failed to recall leads to pool");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    // Strategy & Tabs
    activeMode,
    handleSelectMode,

    // Entities
    unassignedLeads,
    executives,
    assignedLeads,
    fetchLeadsForExecutive,
    isAssignedLeadsLoading:
      isAssignedLeadsFetching || isFetchingDynamicAssigned,

    // Selection
    selectedLeadIds,
    selectedExecutiveIds,
    handleToggleLead,
    handleSelectAllLeads,
    handleClearLeadSelection,
    handleToggleExecutive,
    handleToggleExecutiveSelection: handleToggleExecutive,
    handleAddExecutive,
    handleRemoveExecutive,
    handleSelectAllExecutives,
    handleDeselectAllExecutives,

    // Mode-specific quantities & quotas
    equalQuantity,
    setEqualQuantity,
    customTargetLeads,
    setCustomTargetLeads,
    quotas,
    handleUpdateQuota,

    // Mathematical metrics
    effectiveTotalLeads: totalUnassignedCount,
    selectedExecCount,
    equalSharePerExecutive,
    currentAllocatedCount,
    currentRemainderCount: equalRemainderCount,
    equalRemainderCount,
    customRemainderCount,

    // Validation
    isValid,
    validationMessage,

    // Query & Submission states
    isSubmitting:
      isSubmitting || isDistributing || isRecalling || isReassigning,
    isQueryLoading,
    isQueryFetching,
    isExecutivesLoading,
    totalUnassignedCount,

    // Pagination controls
    page,
    limit,
    totalPages:
      leadsRes?.pagination?.totalPages ||
      Math.max(
        1,
        Math.ceil(
          (leadsRes?.pagination?.total || unassignedLeads.length || 1) / limit,
        ),
      ),
    setPage,
    setLimit,

    // Server-side filter state
    searchTerm,
    setSearchTerm,
    selectedSource,
    setSelectedSource,
    selectedPriority,
    setSelectedPriority,

    // Executive server filter state
    executiveSearchTerm,
    setExecutiveSearchTerm,
    executiveWorkloadFilter,
    setExecutiveWorkloadFilter,

    // Execution handlers
    handleExecuteDistribution,
    handleAssignToSingle,
    handleAssignMulti,
    handleReassignLeads,
    handleRecallLeads,

    // Success Modal
    isSuccessModalOpen,
    setIsSuccessModalOpen,
    lastAllocations,
    lastDistributedCount,
  };
}
