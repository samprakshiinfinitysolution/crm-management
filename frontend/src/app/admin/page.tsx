"use client";

import React, { memo } from "react";
import Link from "next/link";
import {
  Users,
  GitFork,
  ShieldCheck,
  TrendingUp,
  Layers,
  RefreshCw,
  Clock,
  CheckCircle2,
  Activity,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { useGetAdminDashboardMetricsQuery } from "@/store/api/reportApi";
import { useGetAuditLogsQuery } from "@/store/api/auditLogApi";
import { formatDistanceToNow } from "date-fns";
import type { AdminDashboardMetrics } from "@/types/api.types";

/**
 * Top Administrative Header Bar matching CRM Management Hub Design System.
 */
const AdminHeader = memo(function AdminHeader({
  isFetching,
  onRefresh,
}: {
  isFetching: boolean;
  onRefresh: () => void;
}) {
  return (
    <div className="space-y-2">
      {/* Breadcrumb Navigation matching CRM Management Hub */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
        <Link
          href="/admin"
          className="text-[#2874f0] hover:underline font-medium"
        >
          Admin Panel
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <span className="text-slate-700 dark:text-slate-300 font-medium">
          Command Center
        </span>
      </div>

      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e0e0e0] dark:border-slate-800 pb-3">
        <div className="space-y-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#2874f0]" />
              <span>Organization Command & Control</span>
            </h1>
            <span className="px-2 py-0.5 rounded-xs text-[10px] font-bold bg-[#eaf4fe] text-[#2874f0] border border-blue-200 uppercase tracking-wide">
              Superuser Console
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            System superuser visibility into active personnel, pipeline
            velocity, lead distribution, and audit integrity
          </p>
        </div>

        {/* Primary Action Shortcuts */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={onRefresh}
            disabled={isFetching}
            className="h-8.5 px-3 rounded-sm bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
            title="Refresh metrics and audit stream"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-[#2874f0] ${isFetching ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </button>

          <Link
            href="/admin/users"
            className="h-8.5 px-3 rounded-sm bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Users className="w-3.5 h-3.5 text-[#2874f0]" />
            <span>Manage Users</span>
          </Link>

          <Link
            href="/admin/distributions/create"
            className="h-8.5 px-3.5 rounded-sm bg-[#2874f0] hover:bg-[#1a5bb8] text-white font-bold text-xs uppercase tracking-wide flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <GitFork className="w-3.5 h-3.5 text-white" />
            <span>Distribute Leads</span>
          </Link>
        </div>
      </div>
    </div>
  );
});

/**
 * Top 4 Primary Administrative KPI Cards in Flipkart High Density.
 */
const AdminKpiGrid = memo(function AdminKpiGrid({
  metrics,
  isLoading,
}: {
  metrics?: AdminDashboardMetrics;
  isLoading: boolean;
}) {
  const overview = metrics?.overview;
  const followUps = metrics?.followUps;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
      {/* 1. Total Leads & Intake */}
      <div className="bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 rounded-sm p-3.5 sm:p-4 flex flex-col justify-between shadow-2xs hover:border-slate-300 transition-all">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Lead Inventory
            </span>
            <div className="w-7 h-7 rounded-xs bg-[#eaf4fe] dark:bg-blue-950/60 flex items-center justify-center">
              <Layers className="w-3.5 h-3.5 text-[#2874f0]" />
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            {isLoading ? (
              <div className="h-7 w-20 bg-slate-200 dark:bg-slate-800 rounded-xs animate-pulse" />
            ) : (
              <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 leading-tight">
                {(overview?.totalLeads ?? 0).toLocaleString("en-IN")}
              </span>
            )}
            <span className="text-[10px] text-slate-400">total leads</span>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-[#e0e0e0] dark:border-slate-800 flex items-center justify-between text-[11px]">
          <span className="text-slate-500 dark:text-slate-400">
            Assigned:{" "}
            <strong className="text-slate-700 dark:text-slate-200 font-mono">
              {overview?.assignedLeads ?? 0}
            </strong>
          </span>
          <span className="text-[#2874f0] font-semibold">
            Unassigned:{" "}
            <strong className="font-mono">
              {overview?.unassignedLeads ?? 0}
            </strong>
          </span>
        </div>
      </div>

      {/* 2. Won Revenue & Pipeline Value */}
      <div className="bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 rounded-sm p-3.5 sm:p-4 flex flex-col justify-between shadow-2xs hover:border-slate-300 transition-all">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Won Revenue
            </span>
            <div className="w-7 h-7 rounded-xs bg-[#eaf4fe] dark:bg-blue-950/60 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-[#2874f0]" />
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            {isLoading ? (
              <div className="h-7 w-24 bg-slate-200 dark:bg-slate-800 rounded-xs animate-pulse" />
            ) : (
              <span className="text-xl sm:text-2xl font-bold font-mono text-[#2874f0] dark:text-blue-400 leading-tight truncate block">
                {overview?.formattedWonRevenue ?? "₹0"}
              </span>
            )}
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-[#e0e0e0] dark:border-slate-800 flex items-center justify-between text-[11px]">
          <span className="text-slate-500 dark:text-slate-400 truncate max-w-[130px]">
            Pipeline:{" "}
            <strong className="text-slate-700 dark:text-slate-200 font-mono">
              {overview?.formattedPipelineValue ?? "₹0"}
            </strong>
          </span>
          <span className="text-slate-700 dark:text-slate-300 font-semibold">
            Won:{" "}
            <strong className="font-mono">{overview?.wonLeads ?? 0}</strong>
          </span>
        </div>
      </div>

      {/* 3. Team Workforce Accounts */}
      <div className="bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 rounded-sm p-3.5 sm:p-4 flex flex-col justify-between shadow-2xs hover:border-slate-300 transition-all">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Team Accounts
            </span>
            <div className="w-7 h-7 rounded-xs bg-[#eaf4fe] dark:bg-blue-950/60 flex items-center justify-center">
              <Users className="w-3.5 h-3.5 text-[#2874f0]" />
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            {isLoading ? (
              <div className="h-7 w-14 bg-slate-200 dark:bg-slate-800 rounded-xs animate-pulse" />
            ) : (
              <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 leading-tight">
                {overview?.totalUsers ?? 0}
              </span>
            )}
            <span className="text-[10px] text-slate-400">staff registered</span>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-[#e0e0e0] dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span>
            TLs:{" "}
            <strong className="text-[#2874f0] font-mono">
              {overview?.totalTeamLeaders ?? 0}
            </strong>
          </span>
          <span>
            Execs:{" "}
            <strong className="text-slate-700 dark:text-slate-200 font-mono">
              {overview?.totalSalesExecutives ?? 0}
            </strong>
          </span>
          <span>
            Admins:{" "}
            <strong className="text-slate-700 dark:text-slate-200 font-mono">
              {overview?.totalAdmins ?? 0}
            </strong>
          </span>
        </div>
      </div>

      {/* 4. Conversion & Health */}
      <div className="bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 rounded-sm p-3.5 sm:p-4 flex flex-col justify-between shadow-2xs hover:border-slate-300 transition-all">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Conversion & Health
            </span>
            <div className="w-7 h-7 rounded-xs bg-[#eaf4fe] dark:bg-blue-950/60 flex items-center justify-center">
              <Activity className="w-3.5 h-3.5 text-[#2874f0]" />
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            {isLoading ? (
              <div className="h-7 w-16 bg-slate-200 dark:bg-slate-800 rounded-xs animate-pulse" />
            ) : (
              <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 leading-tight">
                {overview?.conversionRate ?? 0}%
              </span>
            )}
            <span className="text-[10px] text-[#2874f0] font-semibold">
              Win benchmark
            </span>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-[#e0e0e0] dark:border-slate-800 flex items-center justify-between text-[11px]">
          <span className="text-slate-500 dark:text-slate-400">
            SLA Rate:{" "}
            <strong className="text-slate-700 dark:text-slate-200 font-mono">
              {followUps?.slaComplianceRate ?? 100}%
            </strong>
          </span>
          <span className="text-rose-600 dark:text-rose-400 font-semibold">
            Overdue:{" "}
            <strong className="font-mono">{followUps?.overdue ?? 0}</strong>
          </span>
        </div>
      </div>
    </div>
  );
});

/**
 * User Governance and Lead Intake Allocation Panels.
 */
const AdminOperationsPanel = memo(function AdminOperationsPanel({
  metrics,
  isLoading,
}: {
  metrics?: AdminDashboardMetrics;
  isLoading: boolean;
}) {
  const overview = metrics?.overview;

  return (
    <div className="space-y-3.5">
      {/* 1. User Governance & Role Distribution */}
      <div className="bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 rounded-sm shadow-2xs p-3.5 sm:p-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#e0e0e0] dark:border-slate-800 mb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              User Governance & Role Distribution
            </h2>
            <p className="text-[11px] text-slate-400">
              Manage account status, team leaders, and sales representatives
              across the system
            </p>
          </div>
          <Link
            href="/admin/users"
            className="text-xs font-semibold text-[#2874f0] dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>Staff Directory</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#2874f0]" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Administrators */}
          <div className="p-3 rounded-sm bg-[#f2f7fe] dark:bg-slate-800/40 border border-[#e0e0e0] dark:border-slate-800 flex flex-col justify-between shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Administrators
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-xs bg-[#eaf4fe] text-[#2874f0] border border-blue-200 uppercase">
                Full Authority
              </span>
            </div>
            {isLoading ? (
              <div className="h-7 w-12 bg-slate-200 dark:bg-slate-700 rounded-xs animate-pulse mt-2" />
            ) : (
              <div className="mt-2 text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">
                {overview?.totalAdmins ?? 0}
              </div>
            )}
            <span className="text-[10px] text-slate-400 mt-0.5">
              System superusers
            </span>
          </div>

          {/* Team Leaders */}
          <div className="p-3 rounded-sm bg-[#f2f7fe] dark:bg-slate-800/40 border border-[#e0e0e0] dark:border-slate-800 flex flex-col justify-between shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Team Leaders
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-xs bg-[#eaf4fe] text-[#2874f0] border border-blue-200 uppercase">
                Supervisors
              </span>
            </div>
            {isLoading ? (
              <div className="h-7 w-12 bg-slate-200 dark:bg-slate-700 rounded-xs animate-pulse mt-2" />
            ) : (
              <div className="mt-2 text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">
                {overview?.totalTeamLeaders ?? 0}
              </div>
            )}
            <span className="text-[10px] text-slate-400 mt-0.5">
              Distribution managers
            </span>
          </div>

          {/* Sales Executives */}
          <div className="p-3 rounded-sm bg-[#f2f7fe] dark:bg-slate-800/40 border border-[#e0e0e0] dark:border-slate-800 flex flex-col justify-between shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Sales Executives
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-xs bg-[#eaf4fe] text-[#2874f0] border border-blue-200 uppercase">
                Field Reps
              </span>
            </div>
            {isLoading ? (
              <div className="h-7 w-12 bg-slate-200 dark:bg-slate-700 rounded-xs animate-pulse mt-2" />
            ) : (
              <div className="mt-2 text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">
                {overview?.totalSalesExecutives ?? 0}
              </div>
            )}
            <span className="text-[10px] text-slate-400 mt-0.5">
              Lead handlers
            </span>
          </div>
        </div>

        {/* Quick Actions Footer */}
        <div className="mt-3.5 pt-3 border-t border-[#e0e0e0] dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <span className="text-slate-500 dark:text-slate-400 text-[11px]">
            Need to configure team permissions or onboard personnel?
          </span>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/users"
              className="h-7.5 px-2.5 rounded-sm bg-white dark:bg-slate-800 border border-[#e0e0e0] dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 transition-colors shadow-2xs flex items-center text-[11px]"
            >
              View All Users
            </Link>
            <Link
              href="/dashboard/users/create"
              className="h-7.5 px-3 rounded-sm bg-[#2874f0] hover:bg-[#1a5bb8] text-white font-bold text-[11px] uppercase tracking-wide transition-colors shadow-xs flex items-center gap-1"
            >
              <span>+ Add User</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Lead Distribution Pool & Intake Health */}
      <div className="bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 rounded-sm shadow-2xs p-3.5 sm:p-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#e0e0e0] dark:border-slate-800 mb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Lead Intake Pool & Allocation Status
            </h2>
            <p className="text-[11px] text-slate-400">
              Balance between unassigned intake leads and actively assigned
              deals
            </p>
          </div>
          <Link
            href="/admin/distributions"
            className="text-xs font-semibold text-[#2874f0] dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>Distribution Suite</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#2874f0]" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Unassigned Intake Pool */}
          <div className="p-3.5 rounded-sm bg-[#f2f7fe] dark:bg-slate-800/40 border border-[#e0e0e0] dark:border-slate-800 flex flex-col justify-between shadow-2xs">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                  Unassigned Intake Pool
                </span>
                <span className="px-1.5 py-0.2 rounded-xs bg-[#2874f0] text-white text-[9px] font-bold uppercase">
                  Pending
                </span>
              </div>
              {isLoading ? (
                <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded-xs animate-pulse mt-2" />
              ) : (
                <div className="mt-2 text-2xl sm:text-3xl font-extrabold font-mono text-[#2874f0]">
                  {overview?.unassignedLeads ?? 0}
                </div>
              )}
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Leads awaiting distribution to sales executives.
              </p>
            </div>

            <div className="mt-3 pt-2 border-t border-[#e0e0e0] dark:border-slate-700/60">
              <Link
                href="/admin/distributions/create"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#2874f0] dark:text-blue-400 hover:underline"
              >
                <span>Launch Distribution Wizard</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Active Assigned Leads */}
          <div className="p-3.5 rounded-sm bg-[#f2f7fe] dark:bg-slate-800/40 border border-[#e0e0e0] dark:border-slate-800 flex flex-col justify-between shadow-2xs">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                  Active Assigned Leads
                </span>
                <span className="px-1.5 py-0.2 rounded-xs bg-[#eaf4fe] text-[#2874f0] border border-blue-200 text-[9px] font-bold uppercase">
                  Active
                </span>
              </div>
              {isLoading ? (
                <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded-xs animate-pulse mt-2" />
              ) : (
                <div className="mt-2 text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-slate-100">
                  {overview?.assignedLeads ?? 0}
                </div>
              )}
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Active in field pipeline with assigned owners.
              </p>
            </div>

            <div className="mt-3 pt-2 border-t border-[#e0e0e0] dark:border-slate-700/60">
              <Link
                href="/admin/leads"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#2874f0] dark:text-blue-400 hover:underline"
              >
                <span>Open Lead Directory</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

/**
 * Isolated audit log feed matching CRM Management Hub High Density.
 */
const AuditStreamSection = memo(function AuditStreamSection() {
  const { data: auditRes, isLoading: isAuditLoading } = useGetAuditLogsQuery({
    limit: 6,
  });
  const auditLogs = auditRes?.data || [];

  return (
    <div className="bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 rounded-sm shadow-2xs p-3.5 sm:p-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#e0e0e0] dark:border-slate-800 mb-3">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#2874f0]" />
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
            Recent Audit Trail
          </h2>
        </div>
        <Link
          href="/admin/audit-logs"
          className="text-xs font-semibold text-[#2874f0] dark:text-blue-400 hover:underline flex items-center gap-0.5"
        >
          <span>All Logs</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="space-y-2">
        {isAuditLoading ? (
          <div className="space-y-2 py-1">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-2.5 rounded-sm bg-slate-50 dark:bg-slate-800/40 border border-[#e0e0e0] dark:border-slate-800 animate-pulse space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="h-3.5 w-16 bg-slate-200 dark:bg-slate-700 rounded-xs" />
                  <div className="h-3 w-14 bg-slate-200 dark:bg-slate-700 rounded-xs" />
                </div>
                <div className="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded-xs" />
              </div>
            ))}
          </div>
        ) : auditLogs.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            No recent audit activity found
          </div>
        ) : (
          auditLogs.map((log) => {
            const isDelete = log.action === "DELETE";
            return (
              <div
                key={log.id}
                className="p-2.5 rounded-sm bg-white dark:bg-slate-800/50 border border-[#e0e0e0] dark:border-slate-800 text-xs flex flex-col gap-1 hover:border-[#2874f0] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded-xs border font-mono uppercase ${
                      isDelete
                        ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300"
                        : "bg-[#eaf4fe] text-[#2874f0] border-blue-200 dark:bg-blue-950/50 dark:text-blue-300"
                    }`}
                  >
                    {log.action}
                  </span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#2874f0]" />
                    {formatDistanceToNow(new Date(log.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-medium text-[11px]">
                  <span className="truncate pr-1">
                    {log.entityType}
                    {log.entityId ? ` #${log.entityId.slice(0, 8)}` : ""}
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal shrink-0">
                    by {log.actor?.name || "System"}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-3 pt-2.5 border-t border-[#e0e0e0] dark:border-slate-800">
        <Link
          href="/admin/audit-logs"
          className="w-full h-8 px-3 text-xs font-semibold rounded-sm border border-[#e0e0e0] dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
        >
          <span>View Full Audit Trail</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#2874f0]" />
        </Link>
      </div>
    </div>
  );
});

/**
 * Static system governance indicators.
 */
const SystemSafeguardsSection = memo(function SystemSafeguardsSection() {
  return (
    <div className="bg-[#f8faff] dark:bg-slate-900/60 border border-[#e0e0e0] dark:border-slate-800 rounded-sm shadow-2xs p-3.5 sm:p-4 space-y-3">
      <div className="flex items-center gap-1.5 pb-2 border-b border-[#e0e0e0] dark:border-slate-800">
        <ShieldAlert className="w-4 h-4 text-[#2874f0]" />
        <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
          System Safeguards & Security
        </h3>
      </div>

      <div className="space-y-2.5">
        <div className="flex items-start gap-2.5 text-xs">
          <CheckCircle2 className="w-4 h-4 text-[#2874f0] mt-0.5 shrink-0" />
          <div>
            <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px] block">
              Protected Deals Enforcement
            </span>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug">
              Won, Sold, and Lost deals are protected from silent edits per CRM
              security rules.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5 text-xs">
          <CheckCircle2 className="w-4 h-4 text-[#2874f0] mt-0.5 shrink-0" />
          <div>
            <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px] block">
              Backend-Authoritative RBAC
            </span>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug">
              Tenant boundaries and role isolation enforced at the database
              query layer.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5 text-xs">
          <CheckCircle2 className="w-4 h-4 text-[#2874f0] mt-0.5 shrink-0" />
          <div>
            <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px] block">
              Atomic Distribution Engine
            </span>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug">
              Zero duplicate assignments guarantee with automated database
              transaction rollbacks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

export default function AdminOverviewPage() {
  const {
    data: metricsRes,
    isLoading: isMetricsLoading,
    isFetching: isMetricsFetching,
    refetch: refetchMetrics,
  } = useGetAdminDashboardMetricsQuery();

  const metrics = metricsRes?.data;

  return (
    <div className="space-y-4 animate-in fade-in duration-150 select-none pb-12">
      {/* 1. Header & Quick Actions */}
      <AdminHeader isFetching={isMetricsFetching} onRefresh={refetchMetrics} />

      {/* 2. Top Administrative KPI Grid in Flipkart Density */}
      <AdminKpiGrid metrics={metrics} isLoading={isMetricsLoading} />

      {/* 3. Primary Operations & Governance Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Left 2 Cols: User Governance & Workforce Overview */}
        <div className="lg:col-span-2">
          <AdminOperationsPanel
            metrics={metrics}
            isLoading={isMetricsLoading}
          />
        </div>

        {/* Right 1 Col: Live Audit Log Stream & System Safeguards */}
        <div className="space-y-3.5">
          <AuditStreamSection />
          <SystemSafeguardsSection />
        </div>
      </div>
    </div>
  );
}
