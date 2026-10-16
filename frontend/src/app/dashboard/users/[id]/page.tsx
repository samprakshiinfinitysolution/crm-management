"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  AlertCircle,
  RefreshCw,
  ChevronRight,
  User,
  Phone,
  Briefcase,
  TrendingUp,
  CheckCircle2,
  Clock,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { UserRole, type LeadItem } from "@/types/api.types";
import { Pagination } from "@/components/ui/Pagination";
import {
  useGetSalesExecutiveByIdQuery,
  useToggleExecutiveStatusMutation,
} from "@/store";

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const {
    data: userRes,
    isLoading,
    isError,
    refetch,
  } = useGetSalesExecutiveByIdQuery(id);
  const [toggleStatus, { isLoading: isToggling }] =
    useToggleExecutiveStatusMutation();
  const user = userRes?.data;

  const handleToggleActive = async () => {
    if (!user) return;
    try {
      await toggleStatus({ id: user.id, isActive: !user.isActive }).unwrap();
      toast.success(
        `Staff member marked as ${user.isActive ? "Inactive" : "Active"}`,
      );
      refetch();
    } catch {
      toast.error("Failed to change user status");
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={[UserRole.TEAM_LEADER, UserRole.ADMIN]}>
        <div className="py-20 flex flex-col items-center justify-center gap-2 text-slate-500">
          <Clock className="w-8 h-8 animate-spin text-[#2874f0]" />
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
            Loading representative profile details...
          </span>
        </div>
      </ProtectedRoute>
    );
  }

  if (isError || !user) {
    return (
      <ProtectedRoute allowedRoles={[UserRole.TEAM_LEADER, UserRole.ADMIN]}>
        <div className="max-w-xl min-h-[90vh] mx-auto py-12 text-center">
          <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-sm p-6 flex flex-col items-center gap-3 shadow-2xs">
            <AlertCircle className="w-8 h-8 text-rose-600 dark:text-rose-400" />
            <h2 className="text-sm font-bold text-rose-900 dark:text-rose-200 uppercase tracking-wide">
              Representative Profile Unavailable
            </h2>
            <p className="text-xs text-rose-700 dark:text-rose-300">
              The requested user profile does not exist or you do not have
              sufficient permissions to view it.
            </p>
            <Link
              href="/dashboard/users"
              className="h-8.5 px-4 rounded-sm bg-[#2874f0] text-white text-xs font-bold uppercase tracking-wide hover:bg-[#1a5bb8] flex items-center transition-colors shadow-2xs"
            >
              Back to Staff Directory
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const leads = (user.leads || []) as unknown as LeadItem[];
  const totalPages = Math.max(1, Math.ceil(leads.length / limit));
  const safePage = Math.min(page, totalPages);
  const paginatedLeads = leads.slice((safePage - 1) * limit, safePage * limit);

  return (
    <ProtectedRoute allowedRoles={[UserRole.TEAM_LEADER, UserRole.ADMIN]}>
      <div className="space-y-4 animate-in fade-in duration-150 select-none pb-12">
        {/* Breadcrumb Navigation matching CRM Management Hub */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Link
            href="/dashboard"
            className="text-[#2874f0] hover:underline font-medium"
          >
            Home
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <Link
            href="/dashboard/users"
            className="text-[#2874f0] hover:underline font-medium"
          >
            Staff Directory
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="text-slate-700 dark:text-slate-300 font-medium">
            {user.name}
          </span>
        </div>

        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e0e0e0] dark:border-slate-800 pb-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
                <User className="w-5 h-5 text-[#2874f0]" />
                <span>{user.name}</span>
              </h1>
              <span className="px-2 py-0.5 rounded-xs text-xs font-bold bg-[#eaf4fe] text-[#2874f0] border border-blue-200">
                {user.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Email:{" "}
              <span className="font-mono text-slate-700 dark:text-slate-300">
                {user.email}
              </span>{" "}
              · Account Status:{" "}
              <span
                className={`font-bold ${
                  user.isActive ? "text-emerald-600" : "text-slate-400"
                }`}
              >
                {user.isActive ? "Active in Field" : "Inactive / Paused"}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Link
              href="/dashboard/users"
              className="h-8.5 px-3 rounded-sm bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Directory</span>
            </Link>

            <button
              type="button"
              onClick={handleToggleActive}
              disabled={isToggling}
              className={`h-8.5 px-4 rounded-sm text-xs font-bold uppercase tracking-wide transition-colors shadow-xs cursor-pointer disabled:opacity-50 ${
                user.isActive
                  ? "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                  : "bg-emerald-600 text-white hover:bg-emerald-700"
              }`}
            >
              {isToggling ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : user.isActive ? (
                "Deactivate Account"
              ) : (
                "Activate Account"
              )}
            </button>
          </div>
        </div>

        {/* 4-Metric Overview Strip matching CRM Management Hub */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 rounded-sm shadow-2xs p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Assigned Leads
              </span>
              <div className="w-7 h-7 rounded-xs bg-[#eaf4fe] flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-[#2874f0]" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">
              {user.activeLeads ?? 0}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Live in pipeline
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 rounded-sm shadow-2xs p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Won / Closed
              </span>
              <div className="w-7 h-7 rounded-xs bg-emerald-50 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-600">
              {user.convertedLeads ?? 0}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Deals won/sold</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 rounded-sm shadow-2xs p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Win Rate
              </span>
              <div className="w-7 h-7 rounded-xs bg-[#eaf4fe] flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-[#2874f0]" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-[#2874f0]">
              {(user.conversionRate ?? 0).toFixed(1)}%
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Conversion metric
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 rounded-sm shadow-2xs p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Workload Status
              </span>
              <div className="w-7 h-7 rounded-xs bg-slate-100 flex items-center justify-center">
                <Clock className="w-4 h-4 text-slate-600" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-slate-800 dark:text-slate-200 uppercase">
              {user.workloadStatus || "NORMAL"}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Capacity benchmark
            </p>
          </div>
        </div>

        {/* Assigned Leads Table Card */}
        <div className="bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 rounded-sm shadow-2xs overflow-hidden">
          <div className="p-3.5 border-b border-[#e0e0e0] dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                Assigned Listings Inventory
              </h2>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-xs bg-[#eaf4fe] text-[#2874f0] border border-blue-200">
                {leads.length} items
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-[#e0e0e0] dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-2.5 px-3.5">Lead Code</th>
                  <th className="py-2.5 px-3.5">Customer Name</th>
                  <th className="py-2.5 px-3.5">Contact Phone</th>
                  <th className="py-2.5 px-3.5">Pipeline Stage</th>
                  <th className="py-2.5 px-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e0e0e0] dark:divide-slate-800">
                {leads.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-12 text-center text-slate-400"
                    >
                      No active leads assigned to this representative.
                    </td>
                  </tr>
                ) : (
                  paginatedLeads.map((lead) => (
                    <tr
                      key={lead.id}
                      onClick={() => router.push(`/dashboard/leads/${lead.id}`)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                    >
                      <td className="py-2.5 px-3.5 font-mono font-bold text-[#2874f0]">
                        {lead.leadCode}
                      </td>
                      <td className="py-2.5 px-3.5 font-semibold text-slate-900 dark:text-slate-100">
                        {lead.customerName}
                      </td>
                      <td className="py-2.5 px-3.5 font-mono text-slate-600 dark:text-slate-300">
                        <a
                          href={`tel:${lead.mobile}`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 hover:text-[#2874f0]"
                        >
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{lead.mobile}</span>
                        </a>
                      </td>
                      <td className="py-2.5 px-3.5">
                        <span className="px-2 py-0.5 rounded-xs text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {lead.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/dashboard/leads/${lead.id}`);
                          }}
                          className="h-7 px-2.5 rounded-xs bg-white dark:bg-slate-800 hover:bg-slate-50 text-[#2874f0] border border-[#e0e0e0] text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {leads.length > 0 && (
            <div className="p-3 border-t border-[#e0e0e0] dark:border-slate-800">
              <Pagination
                currentPage={safePage}
                totalPages={totalPages}
                totalItems={leads.length}
                pageSize={limit}
                onPageChange={setPage}
                onPageSizeChange={(newLimit) => {
                  setLimit(newLimit);
                  setPage(1);
                }}
              />
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
