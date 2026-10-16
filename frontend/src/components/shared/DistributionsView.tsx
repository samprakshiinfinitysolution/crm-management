"use client";

import React, { useCallback } from "react";
import Link from "next/link";
import { Plus, ChevronRight, Info } from "lucide-react";
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
import { BreadcrumbItem } from "./PageHeader";

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
    [triggerGetLeads],
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
    reason: string,
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
    reason: string,
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
    <div className="space-y-4 animate-in fade-in duration-150 select-none pb-12">
      {/* Breadcrumb Navigation matching CRM Management Hub */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
        {breadcrumbs && breadcrumbs.length > 0 ? (
          breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <ChevronRight className="w-3 h-3 text-slate-400" />}
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="text-[#2874f0] hover:underline font-medium"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  {crumb.label}
                </span>
              )}
            </React.Fragment>
          ))
        ) : (
          <>
            <Link
              href="/dashboard"
              className="text-[#2874f0] hover:underline font-medium"
            >
              Home
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="text-slate-700 dark:text-slate-300 font-medium">
              Distributions & Workload Rebalancing
            </span>
          </>
        )}
      </div>

      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e0e0e0] dark:border-slate-800 pb-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            {title}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {description}
          </p>
        </div>

        {distributeHref && (
          <Link
            href={distributeHref}
            className="h-8.5 px-4 rounded-sm bg-[#2874f0] hover:bg-[#1a5bb8] text-white font-bold text-xs uppercase tracking-wide flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Distribute Intake</span>
          </Link>
        )}
      </div>

      {/* Marketplace Guidance Notice Banner */}
      <div className="px-4 py-3 bg-[#eaf4fe] dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-sm flex items-start gap-3 text-xs">
        <Info className="w-4 h-4 text-[#2874f0] shrink-0 mt-0.5" />
        <div className="space-y-0.5 text-slate-700 dark:text-slate-300">
          <p className="font-semibold text-slate-900 dark:text-white">
            Lead Allocation & Workload Governance
          </p>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
            Select an executive to view their live inventory. Reassign leads to
            another representative with available bandwidth, or recall
            uncontacted leads back into the unassigned intake pool for
            redistribution.
          </p>
        </div>
      </div>

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
