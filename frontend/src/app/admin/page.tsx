"use client";

import React from "react";
import Link from "next/link";
import {
  Users,
  GitFork,
  ShieldCheck,
  TrendingUp,
  Layers,
  ArrowUpRight,
  RefreshCw,
  Clock,
  CheckCircle2,
  Activity,
  ChevronRight,
} from "lucide-react";
import { useGetAdminDashboardMetricsQuery } from "@/store/api/reportApi";
import { useGetAuditLogsQuery } from "@/store/api/auditLogApi";
import { formatDistanceToNow } from "date-fns";

export default function AdminOverviewPage() {
  const {
    data: metricsRes,
    isLoading: isMetricsLoading,
    isFetching: isMetricsFetching,
    refetch: refetchMetrics,
  } = useGetAdminDashboardMetricsQuery();

  const {
    data: auditRes,
    isLoading: isAuditLoading,
    refetch: refetchAudit,
  } = useGetAuditLogsQuery({ limit: 6 });

  const metrics = metricsRes?.data;
  const overview = metrics?.overview;
  const auditLogs = auditRes?.data || [];

  const handleRefreshAll = () => {
    refetchMetrics();
    refetchAudit();
  };

  return (
    <div className="space-y-3 animate-in fade-in duration-200">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              Admin Command Center
            </span>
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-slate-500 dark:text-slate-400">
              System Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Organization Command & Control
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            System superuser visibility into active personnel, pipeline velocity, lead distribution, and audit integrity.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleRefreshAll}
            disabled={isMetricsFetching}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            title="Refresh metrics and audit stream"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isMetricsFetching ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </button>

          <Link
            href="/admin/users"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Manage Users</span>
          </Link>

          <Link
            href="/dashboard/distributions/create"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white hover:bg-slate-800 dark:hover:bg-white/90 shadow-xs transition-colors"
          >
            <GitFork className="w-3.5 h-3.5" />
            <span>Distribute Leads</span>
          </Link>
        </div>
      </div>

      {/* 2. Top Administrative KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {/* Total Leads & Intake */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Lead Inventory
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {isMetricsLoading ? "..." : (overview?.totalLeads ?? 0).toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">total records</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              Assigned: <strong className="text-slate-700 dark:text-slate-200">{overview?.assignedLeads ?? 0}</strong>
            </span>
            <span className="text-amber-600 dark:text-amber-400 font-medium">
              Unassigned: {overview?.unassignedLeads ?? 0}
            </span>
          </div>
        </div>

        {/* Total Pipeline & Won Revenue */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Pipeline Value
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {isMetricsLoading ? "..." : (overview?.formattedPipelineValue ?? "₹0")}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              Won Revenue: <strong className="text-emerald-600 dark:text-emerald-400">{overview?.formattedWonRevenue ?? "₹0"}</strong>
            </span>
            <span className="text-slate-500 dark:text-slate-400">
              Won: {overview?.wonLeads ?? 0}
            </span>
          </div>
        </div>

        {/* User Governance KPI */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Team Accounts
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {isMetricsLoading ? "..." : (overview?.totalUsers ?? 0)}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">registered users</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>
              TLs: <strong className="text-blue-600 dark:text-blue-400">{overview?.totalTeamLeaders ?? 0}</strong>
            </span>
            <span>
              Execs: <strong className="text-emerald-600 dark:text-emerald-400">{overview?.totalSalesExecutives ?? 0}</strong>
            </span>
            <span>
              Admins: <strong className="text-purple-600 dark:text-purple-400">{overview?.totalAdmins ?? 0}</strong>
            </span>
          </div>
        </div>

        {/* Conversion Rate & SLA Compliance */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Conversion & Health
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {isMetricsLoading ? "..." : `${overview?.conversionRate ?? 0}%`}
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Win rate</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              Follow-up SLA: <strong className="text-slate-700 dark:text-slate-300">{metrics?.followUps?.slaComplianceRate ?? 100}%</strong>
            </span>
            <span className="text-rose-600 dark:text-rose-400 font-medium">
              Overdue: {metrics?.followUps?.overdue ?? 0}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Primary Operations Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
        {/* Left 2 Cols: User Governance & Workforce Overview */}
        <div className="lg:col-span-2 space-y-6">
          {/* User Governance Banner */}
          <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  User Governance & Role Distribution
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Manage account status, team leaders, and sales representatives across the system.
                </p>
              </div>
              <Link
                href="/admin/users"
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                <span>Directory</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                    Administrators
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300">
                    Full Authority
                  </span>
                </div>
                <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {overview?.totalAdmins ?? 0}
                </div>
                <span className="text-[11px] text-slate-400">System superusers</span>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                    Team Leaders
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                    Supervisors
                  </span>
                </div>
                <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {overview?.totalTeamLeaders ?? 0}
                </div>
                <span className="text-[11px] text-slate-400">Distribution managers</span>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                    Sales Executives
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
                    Field Reps
                  </span>
                </div>
                <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {overview?.totalSalesExecutives ?? 0}
                </div>
                <span className="text-[11px] text-slate-400">Lead handlers</span>
              </div>
            </div>

            {/* Quick Link Row */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">
                Need to create or modify team permissions?
              </span>
              <div className="flex items-center gap-2">
                <Link
                  href="/admin/users"
                  className="px-3 py-1.5 rounded-md font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  View All Users
                </Link>
                <Link
                  href="/admin/users"
                  className="px-3 py-1.5 rounded-md font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                >
                  + Add User
                </Link>
              </div>
            </div>
          </div>

          {/* Lead Distribution Pool & Intake Health */}
          <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Lead Intake Pool & Allocation Status
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Balance between unassigned intake leads and actively assigned deals.
                </p>
              </div>
              <Link
                href="/dashboard/distributions"
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                <span>Distribution Suite</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                    Unassigned Intake Pool
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                </div>
                <div className="mt-2 text-3xl font-extrabold text-amber-900 dark:text-amber-100">
                  {overview?.unassignedLeads ?? 0}
                </div>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                  Leads awaiting distribution to sales executives.
                </p>
                <div className="mt-3">
                  <Link
                    href="/dashboard/distributions/create"
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <span>Launch Distribution Wizard →</span>
                  </Link>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-blue-800 dark:text-blue-300">
                    Active Assigned Leads
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                </div>
                <div className="mt-2 text-3xl font-extrabold text-blue-900 dark:text-blue-100">
                  {overview?.assignedLeads ?? 0}
                </div>
                <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                  Active in field pipeline with assigned owners.
                </p>
                <div className="mt-3">
                  <Link
                    href="/dashboard/leads"
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <span>Open Lead Directory →</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Live Audit Log Stream & System Governance */}
        <div className="space-y-6">
          {/* Live System Audit Stream */}
          <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Recent Audit Trail
                </h2>
              </div>
              <Link
                href="/dashboard/audit-logs"
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                All Logs
              </Link>
            </div>

            <div className="space-y-3">
              {isAuditLoading ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Loading audit stream...
                </div>
              ) : auditLogs.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No recent audit activity found.
                </div>
              ) : (
                auditLogs.map((log) => {
                  const actionColor =
                    log.action === "CREATE"
                      ? "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                      : log.action === "DELETE"
                      ? "text-rose-700 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800"
                      : "text-blue-700 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800";

                  return (
                    <div
                      key={log.id}
                      className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs flex flex-col gap-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${actionColor}`}
                        >
                          {log.action}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(log.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-medium">
                        <span className="truncate">
                          {log.entityType}
                          {log.entityId ? ` #${log.entityId.slice(0, 8)}` : ""}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                          by {log.actor?.name || "System"}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Link
                href="/admin/audit-logs"
                className="w-full py-2 px-3 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>View Full Audit Trail</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>
          </div>

          {/* Quick System Governance Badges */}
          <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              System Safeguards
            </h3>
            <div className="flex items-start gap-3 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Protected Deals Enforcement
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Won, Sold, and Lost deals are protected from silent edits per CRM security rules.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Backend-Authoritative RBAC
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Tenant boundaries and data isolation enforced at the database query layer.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}