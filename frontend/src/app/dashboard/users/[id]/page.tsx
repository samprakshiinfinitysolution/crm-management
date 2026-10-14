"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertTriangle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { UserRole, type LeadItem } from "@/types/api.types";
import { Pagination } from "@/components/ui/Pagination";
import {
  useGetSalesExecutiveByIdQuery,
  useToggleExecutiveStatusMutation,
} from "@/store";
import { PageHeader } from "@/components/shared/PageHeader";
import { TableSkeletonRows } from "@/components/ui/TableSkeletonRows";

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);

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
        `Executive marked as ${user.isActive ? "Inactive" : "Active"}`,
      );
      refetch();
    } catch {
      toast.error("Failed to change user status");
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={[UserRole.TEAM_LEADER, UserRole.ADMIN]}>
        <div className="space-y-3.5 animate-pulse select-none">
          {/* Header Skeleton */}
          <div className="pb-3.5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-3 w-3 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-3 w-12 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-3 w-3 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
              </div>
              <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded-md" />
              <div className="h-3.5 w-64 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 rounded-lg" />
              <div className="h-8 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg" />
            </div>
          </div>

          {/* Metrics Overview Grid Skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-900 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2"
              >
                <div className="h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-7 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
              </div>
            ))}
          </div>

          {/* Assigned Leads Table Card Skeleton */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="h-4 w-36 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>

            <div className="overflow-x-auto">
              <table className="p-4 space-y-3">
                {/* Table Header Row Skeleton */}
                <thead>
                  <tr className="grid grid-cols-5 gap-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <th className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
                    <th className="h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
                    <th className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
                    <th className="h-3 w-14 bg-slate-200 dark:bg-slate-800 rounded" />
                    <th className="h-3 w-12 bg-slate-200 dark:bg-slate-800 rounded ml-auto" />
                  </tr>
                </thead>
                <tbody>
                  <TableSkeletonRows rows={5} columns={5} />
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (isError || !user ) {
    return (
      <ProtectedRoute allowedRoles={[UserRole.TEAM_LEADER, UserRole.ADMIN]}>
        <div className="p-8 text-center bg-rose-50 border border-rose-200 rounded-lg text-rose-700">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
          <p className="font-semibold">
            User Not Found or Error Loading Profile
          </p>
          <Link
            href="/dashboard/users"
            className="text-xs underline mt-2 inline-block"
          >
            Back to User Directory
          </Link>
        </div>
      </ProtectedRoute>
    );
  }

  const leads = (user.leads || []) as unknown as LeadItem[];

  return (
    <ProtectedRoute allowedRoles={[UserRole.TEAM_LEADER, UserRole.ADMIN]}>
      <div className="space-y-3.5">
        {/* Header */}
        <PageHeader
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Users", href: "/dashboard/users" },
            { label: user.name },
          ]}
          title={user.name}
          description={`${user.email} · ${user.role} · ${user.isActive ? "Active Account" : "Inactive Account"}`}
          actions={
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard/users"
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors shadow-2xs"
                title="Back to Users"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <button
                type="button"
                onClick={handleToggleActive}
                disabled={isToggling}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all shadow-xs cursor-pointer ${
                  user.isActive
                    ? "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/60"
                    : "bg-emerald-600 text-white hover:bg-emerald-700"
                }`}
              >
                {isToggling ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin mx-auto" />
                ) : user.isActive ? (
                  "Deactivate Account"
                ) : (
                  "Activate Account"
                )}
              </button>
            </div>
          }
        />

        {/* Metrics Overview Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
              Assigned Leads
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              {user.activeLeads ?? 0}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Won Deals
            </p>
            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">
              {user.convertedLeads ?? 0}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Conversion Rate
            </p>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-400 mt-1">
              {(user.conversionRate ?? 0).toFixed(1)}%
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
            <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Workload Status
            </p>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-2 capitalize">
              {user.workloadStatus || "NORMAL"}
            </p>
          </div>
        </div>

        {/* Assigned Leads Table Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Assigned Leads ({leads.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50/80 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Lead Code</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Mobile</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 dark:text-slate-500">
                      No active leads assigned to this executive.
                    </td>
                  </tr>
                ) : (
                  leads
                    .slice(
                      (Math.min(
                        page,
                        Math.max(1, Math.ceil(leads.length / limit)),
                      ) -
                        1) *
                        limit,
                      Math.min(
                        page,
                        Math.max(1, Math.ceil(leads.length / limit)),
                      ) * limit,
                    )
                    .map((lead) => (
                      <tr
                        key={lead.id}
                        onClick={() =>
                          router.push(`/dashboard/leads/${lead.id}`)
                        }
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                      >
                        <td className="py-3 px-4 font-mono font-bold text-blue-700 dark:text-blue-400">
                          {lead.leadCode}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                          {lead.customerName}
                        </td>
                        <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                          {lead.mobile}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {lead.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link
                            href={`/dashboard/leads/${lead.id}`}
                            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>

          {leads.length > 0 && (
            <div className="p-3 border-t border-slate-100 dark:border-slate-800">
              <Pagination
                currentPage={Math.min(
                  page,
                  Math.max(1, Math.ceil(leads.length / limit)),
                )}
                totalPages={Math.max(1, Math.ceil(leads.length / limit))}
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
