"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useAppSelector } from "@/store";
import { UserRole } from "@/types/api.types";
import {
  useGetAdminDashboardMetricsQuery,
  useGetTLDashboardMetricsQuery,
  useGetSEDashboardMetricsQuery,
  useGetNotificationsQuery,
  useGetCriticalEscalationsQuery,
} from "@/store";
import dynamic from "next/dynamic";
import { ChevronRight } from "lucide-react";
import { PartnerServicesBanner } from "@/components/dashboard/PartnerServicesBanner";

// Code splitting: Top KPIs and Insights widgets are dynamically streamed
const CRMDashboardTopKPIs = dynamic(
  () =>
    import("@/components/dashboard/CRMDashboardTopKPIs").then(
      (m) => m.CRMDashboardTopKPIs
    ),
  {
    loading: () => (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`h-24 bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 rounded-sm p-4 animate-pulse ${
              i === 4 ? "col-span-2" : ""
            }`}
          />
        ))}
      </div>
    ),
  }
);

const CRMDashboardInsights = dynamic(
  () =>
    import("@/components/dashboard/CRMDashboardInsights").then(
      (m) => m.CRMDashboardInsights
    ),
  {
    loading: () => (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-44 bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 rounded-sm p-4 animate-pulse"
          />
        ))}
      </div>
    ),
  }
);

export default function DashboardOverviewPage() {
  const { user } = useAppSelector((state) => state.auth);
  const isTL = user?.role === UserRole.TEAM_LEADER;
  const isAdmin = user?.role === UserRole.ADMIN;
  const isSE = user?.role === UserRole.SALES_EXECUTIVE;

  // Admin Metrics Query (GET /reports/dashboard-metrics/admin)
  const { data: adminResponse } =
    useGetAdminDashboardMetricsQuery(undefined, {
      skip: !isAdmin,
      pollingInterval: 30000,
    });

  // TL Metrics Query (GET /reports/dashboard-metrics/team-lead)
  const { data: tlResponse } =
    useGetTLDashboardMetricsQuery(undefined, {
      skip: !isTL,
      pollingInterval: 30000,
    });

  // Sales Executive Metrics Query (GET /reports/dashboard-metrics/sales-executive)
  const { data: seMetricsRes } =
    useGetSEDashboardMetricsQuery(undefined, {
      skip: !isSE,
      pollingInterval: 30000,
    });

  // Live Notifications Query
  const { data: notifData } = useGetNotificationsQuery(undefined, {
    pollingInterval: 30000,
    skip: !user,
  });

  // Critical Escalations Query
  const { data: escalationsData } = useGetCriticalEscalationsQuery(undefined, {
    skip: isSE,
    pollingInterval: 30000,
  });

  const adminData = adminResponse?.data;
  const tlData = tlResponse?.data;
  const seMetrics = seMetricsRes?.data;

  const recentLeads = useMemo(() => {
    return (
      (isAdmin ? adminData?.recentLeads : isTL ? tlData?.recentLeads : seMetrics?.recentLeads) || []
    );
  }, [isAdmin, isTL, adminData, tlData, seMetrics]);

  // Monthly Sales Array from API for sparkline chart
  const monthlySalesData = useMemo(() => {
    return isAdmin
      ? adminData?.monthlySales
      : isTL
      ? tlData?.monthlySales
      : seMetrics?.monthlySales;
  }, [isAdmin, isTL, adminData, tlData, seMetrics]);

  const sparklinePoints = useMemo(() => {
    if (monthlySalesData && monthlySalesData.length > 0) {
      return monthlySalesData.slice(-5).map((m) => ({
        date: m.month,
        value: m.grossAmount || m.totalLeads || 0,
      }));
    }
    return [];
  }, [monthlySalesData]);

  // Won Deals Count
  const wonDealsCount = useMemo(() => {
    if (isAdmin) return adminData?.overview?.wonLeads ?? 0;
    if (isTL) return tlData?.pipelineHealth?.wonARR?.wonCount ?? 0;
    return seMetrics?.wonCount ?? 0;
  }, [isAdmin, isTL, adminData, tlData, seMetrics]);

  // Won Revenue Amount
  const wonRevenueAmount = useMemo(() => {
    if (isAdmin) return adminData?.overview?.totalWonRevenue ?? 0;
    if (isTL) return tlData?.pipelineHealth?.wonARR?.formattedValue?.replace(/[^0-9]/g, "") ?? 0;
    return seMetrics?.wonValue ?? seMetrics?.formattedWonValue?.replace(/[^0-9]/g, "") ?? seMetrics?.formattedPipelineValue ?? 0;
  }, [isAdmin, isTL, adminData, tlData, seMetrics]);

  // Intake Pool or New Assigned Leads
  const intakeOrNewCount = useMemo(() => {
    if (isAdmin) return adminData?.overview?.unassignedLeads ?? 0;
    if (isTL) return tlData?.pipelineHealth?.totalPool?.value ?? 0;
    return seMetrics?.newCount ?? 0;
  }, [isAdmin, isTL, adminData, tlData, seMetrics]);

  // Active Pipeline In-flight
  const activePipelineCount = useMemo(() => {
    if (isAdmin) return adminData?.overview?.activeLeads ?? 0;
    if (isTL) return tlData?.pipelineHealth?.activeInFlight?.value ?? 0;
    return seMetrics?.activeCount ?? 0;
  }, [isAdmin, isTL, adminData, tlData, seMetrics]);

  const criticalEscalations = useMemo(() => {
    return escalationsData?.data || tlData?.criticalEscalations || [];
  }, [escalationsData, tlData]);
  const criticalCount = criticalEscalations.length;

  const escalationReason = useMemo(() => {
    const first = criticalEscalations[0];
    if (!first) return undefined;
    if ("reason" in first && typeof (first as { reason?: string }).reason === "string") {
      return (first as { reason: string }).reason;
    }
    if ("stageInfo" in first && typeof (first as { stageInfo?: string }).stageInfo === "string") {
      const tlEsc = first as { stageInfo: string; overdueHours: number };
      return `${tlEsc.stageInfo} (${tlEsc.overdueHours}h overdue)`;
    }
    return undefined;
  }, [criticalEscalations]);

  const notificationsList = useMemo(() => {
    return (notifData?.data || []).map((n) => ({
      id: n.id,
      title: n.title,
      createdAt: n.createdAt,
      isRead: n.isRead,
      link: n.link || "/dashboard/notifications",
    }));
  }, [notifData]);

  return (
    <div className="space-y-4 animate-in fade-in duration-150 select-none">
      {/* 1. Header: Role-aware dashboard title and primary navigation link */}
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            Your Dashboard
          </h1>
          <span className="text-xs text-slate-400 font-medium">· Today</span>
        </div>

        {isSE ? (
          <Link
            href="/dashboard/my-leads"
            className="text-xs font-semibold text-[#2874f0] dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>View Assigned Pipeline</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#2874f0]" />
          </Link>
        ) : (
          <Link
            href="/dashboard/reports"
            className="text-xs font-semibold text-[#2874f0] dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>View All Reports & Metrics</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#2874f0]" />
          </Link>
        )}
      </div>

      {/* 2. Top Row KPI Cards + Sparkline Chart with CRM pipeline metrics */}
      <CRMDashboardTopKPIs
        wonDeals={wonDealsCount}
        wonRevenue={wonRevenueAmount}
        intakeOrNewCount={intakeOrNewCount}
        activePipeline={activePipelineCount}
        isSE={isSE}
        monthlyTrends={monthlySalesData}
        chartData={sparklinePoints}
      />

      {/* 3. Five Insight Cards in Light Blue Tint with Live API data */}
      <CRMDashboardInsights
        notifications={notificationsList}
        criticalEscalationsCount={criticalCount}
        criticalEscalationsReason={escalationReason}
        pipelineAtRiskValue={
          adminData?.overview?.totalPipelineValue
            ? Math.round(adminData.overview.totalPipelineValue * 0.15)
            : criticalCount > 0
            ? criticalCount * 10000
            : 0
        }
        unassignedLeadsCount={intakeOrNewCount}
        activeNegotiationsCount={activePipelineCount}
        slaAdherencePercent={
          adminData?.followUps?.slaComplianceRate ??
          tlData?.pipelineHealth?.slaAdherence?.value ??
          95
        }
        wonDealsCount={wonDealsCount}
        conversionRate={
          adminData?.overview?.conversionRate ??
          tlData?.pipelineHealth?.wonARR?.conversionRate ??
          seMetrics?.conversionRate ??
          0
        }
        isSE={isSE}
        todayFollowUpsCount={
          isAdmin
            ? adminData?.followUps?.dueToday ?? 0
            : seMetrics?.todayFollowUpsCount ?? 0
        }
        overdueFollowUpsCount={
          isAdmin
            ? adminData?.followUps?.overdue ?? 0
            : isTL
            ? tlData?.pipelineHealth?.slaAdherence?.overdueCount ?? 0
            : seMetrics?.overdueFollowUpsCount ?? 0
        }
      />

      {/* 4. Platform Action Banner with Zero Duplicate Guarantee and Role CTAs */}
      <PartnerServicesBanner isSE={isSE} />

      {/* 5. Recent Lead Allocations & Intake Table */}
      <div className="bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 rounded-sm shadow-2xs overflow-hidden">
        <div className="p-3 sm:p-4 border-b border-[#e0e0e0] dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              {isSE ? "My Assigned Leads & Queue" : "Recent Lead Allocations & Intake"}
            </h2>
            <p className="text-[11px] text-slate-400">
              {isSE
                ? "Your recent lead assignments, requirements, and deal progression"
                : "Real-time pipeline intake, stage progression, and representative allocations"}
            </p>
          </div>

          <Link
            href={isSE ? "/dashboard/my-leads" : "/dashboard/leads"}
            className="text-xs font-semibold text-[#2874f0] dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>{isSE ? "View My Leads" : "View All Leads"}</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#2874f0]" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-[#f4f6f8] dark:bg-slate-800/80 border-b border-[#e0e0e0] dark:border-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
              <tr>
                <th className="py-2.5 px-4">Lead Code</th>
                <th className="py-2.5 px-4">Client / Requirement</th>
                <th className="py-2.5 px-4 text-right">Deal Budget</th>
                <th className="py-2.5 px-4 text-center">Channel Source</th>
                <th className="py-2.5 px-4 text-center">Pipeline Stage</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e0e0e0] dark:divide-slate-800 bg-white dark:bg-slate-900">
              {recentLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    {isSE ? "No assigned leads found in your work queue" : "No recent leads logged in the pipeline yet"}
                  </td>
                </tr>
              ) : (
                recentLeads.slice(0, 5).map((lead) => {
                  const budgetNum =
                    typeof lead.budget === "number"
                      ? lead.budget
                      : Number(lead.amount) || 0;
                  return (
                    <tr
                      key={lead.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-2.5 px-4 font-mono font-bold text-[#2874f0] dark:text-blue-400">
                        {lead.leadCode || lead.id.substring(0, 8).toUpperCase()}
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800 dark:text-slate-100">
                            {lead.name}
                          </span>
                          <span className="text-[10px] text-slate-400 truncate max-w-44">
                            {lead.category || "Direct Inquiry"}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-800 dark:text-slate-100">
                        {budgetNum > 0
                          ? `₹${budgetNum.toLocaleString("en-IN")}`
                          : lead.amount || "₹0"}
                      </td>
                      <td className="py-2.5 px-4 text-center font-mono text-[11px] text-slate-500">
                        {lead.category || "Organic Inflow"}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-xs bg-[#eaf4fe] text-[#2874f0] dark:bg-blue-950/60 dark:text-blue-300 font-semibold text-[10px] border border-blue-200 dark:border-blue-800">
                          {lead.status ? lead.status.replace(/_/g, " ") : "NEW"}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <Link
                          href={`/dashboard/leads/${lead.id}`}
                          className="text-[#2874f0] dark:text-blue-400 font-semibold hover:underline"
                        >
                          View Lead
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
