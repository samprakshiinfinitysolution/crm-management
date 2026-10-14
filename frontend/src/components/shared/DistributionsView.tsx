"use client";

import React, { useCallback } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { LeadStatus } from "@/types/api.types";
import {
  useGetLeadsQuery,
  useLazyGetLeadsQuery,
  useGetSalesExecutivesQuery,
  useReassignLeadsMutation,
  useRecallLeadsMutation,
} from "@/store";
import { handleApiError } from "@/lib/errorHandler";
import { ReassignRecallConsole } from "@/components/team_leader/distribute";
import { PageHeader, BreadcrumbItem } from "./PageHeader";

export interface DistributionsViewProps {
  title?: string;
  description?: string;
  distributeHref?: string;
  breadcrumbs?: BreadcrumbItem[];
}

export const DistributionsView: React.FC<DistributionsViewProps> = ({
  title = "Lead Rebalancing & Reassignment Console",
  description = "Govern active lead assignments, execute cross-executive workload rebalancing, and recall leads to the intake pool.",
  distributeHref = "/dashboard/distributions/create",
  breadcrumbs,
}) => {
  // 1. Unassigned leads query (for refetch sync)
  const { refetch: refetchUnassigned } = useGetLeadsQuery({
    status: LeadStatus.NEW,
    limit: 1,
  });

  // 2. Query to fetch executive leads on-demand
  const [
    triggerGetLeads,
    { data: execLeadsData, isFetching: isFetchingExecLeads },
  ] = useLazyGetLeadsQuery();

  const fetchLeadsForExecutive = useCallback(
    (query?: {
      status?: LeadStatus;
      assignedToUserId?: string;
      limit?: number;
    }) => {
      triggerGetLeads(query || {});
    },
    [triggerGetLeads]
  );

  const { data: execsData, refetch: refetchExecs } =
    useGetSalesExecutivesQuery();
  const executives = execsData?.data || [];

  const [reassignMutation, { isLoading: isReassigning }] =
    useReassignLeadsMutation();
  const [recallMutation, { isLoading: isRecalling }] = useRecallLeadsMutation();

  const handleReassignLeads = async (
    sourceExecId: string,
    targetExecId: string,
    leadIds: string[],
    reason: string
  ) => {
    try {
      const res = await reassignMutation({
        leadIds,
        targetExecutiveId: targetExecId,
        reason: reason || "Workload rebalancing",
      }).unwrap();

      toast.success(res.message || "Leads reassigned successfully");
      refetchExecs();
      fetchLeadsForExecutive({ assignedToUserId: sourceExecId });
    } catch (err) {
      handleApiError(err, "Failed to reassign leads");
      throw err;
    }
  };

  const handleRecallLeads = async (
    sourceExecId: string,
    leadIds: string[],
    reason: string
  ) => {
    try {
      const res = await recallMutation({
        leadIds,
        reason: reason || "Recalled to intake pool",
      }).unwrap();

      toast.success(res.message || "Leads recalled successfully");
      refetchExecs();
      refetchUnassigned();
      fetchLeadsForExecutive({ assignedToUserId: sourceExecId });
    } catch (err) {
      handleApiError(err, "Failed to recall leads");
      throw err;
    }
  };

  return (
    <div className="space-y-3.5 animate-in fade-in duration-200">
      {/* Page Header */}
      <PageHeader
        title={title}
        description={description}
        breadcrumbs={breadcrumbs}
        actions={
          distributeHref ? (
            <Link
              href={distributeHref}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Distribute Intake</span>
            </Link>
          ) : undefined
        }
      />

      {/* Reassign & Recall Console */}
      <ReassignRecallConsole
        executives={executives}
        assignedLeads={execLeadsData?.data || []}
        isProcessing={isReassigning || isRecalling || isFetchingExecLeads}
        fetchLeadsForExecutive={fetchLeadsForExecutive}
        onReassignLeads={handleReassignLeads}
        onRecallLeads={handleRecallLeads}
      />
    </div>
  );
};
