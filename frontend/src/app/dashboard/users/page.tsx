"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Users, UserPlus, RefreshCw, Eye } from "lucide-react";
import { toast } from "sonner";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { UserRole } from "@/types/api.types";
import { Pagination } from "@/components/ui/Pagination";
import {
  useAppSelector,
  useGetUsersQuery,
  useToggleExecutiveStatusMutation,
} from "@/store";
import { useSocket } from "@/components/providers/SocketProvider";
import { ExecutiveStatsCards } from "@/components/team_leader/executives";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { TableSkeletonRows } from "@/components/ui/TableSkeletonRows";
import { useDebounce } from "@/lib/useDebounce";

export default function UsersManagementPage() {
  const router = useRouter();
  const { isUserOnline } = useSocket();
  const [search, setSearch] = useState("");  
  
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { user } = useAppSelector((state) => state.auth);
  const isSE = user?.role;

  // Debounced search query
  const debouncedSearch = useDebounce(search, 300);

  const queryParams = useMemo(
    () => ({
      search: debouncedSearch.trim()  || undefined,
      role: roleFilter !== "all" ? roleFilter : isSE ? UserRole.SALES_EXECUTIVE : undefined,
      status: statusFilter !== "all" ? statusFilter : undefined,
      page,
      limit,
    }),
    [debouncedSearch, roleFilter, isSE, statusFilter, page, limit],
  );

  const {
    data: usersRes,
    isLoading,
    isFetching,
    refetch,
  } = useGetUsersQuery(queryParams);

  const [toggleStatus] = useToggleExecutiveStatusMutation();

  const staffList = usersRes?.data || [];
  const pagination = usersRes?.pagination;

  const handleRefetchAll = () => {
    refetch();
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      await toggleStatus({ id, isActive: !currentActive }).unwrap();
      toast.success(
        `Staff member marked as ${!currentActive ? "active" : "inactive"}`,
      );
      handleRefetchAll();
    } catch {
      toast.error("Failed to toggle status");
    }
  };

  return (
    <ProtectedRoute allowedRoles={[UserRole.TEAM_LEADER, UserRole.ADMIN]}>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <span>Team Leaders & Sales Staff Directory</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Manage team leaders, executive accounts, quota availability, and monitor
              performance
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRefetchAll}
              className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-2xs transition-all cursor-pointer"
              title="Refresh"
            >
              <RefreshCw
                className={`w-4 h-4 ${isFetching ? "animate-spin text-blue-600 dark:text-blue-400" : ""}`}
              />
            </button>

            <Link
              href="/dashboard/users/create"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Staff Member</span>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <ExecutiveStatsCards executives={staffList} isLoading={isLoading} />

        {/* Users Table Card */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search staff by name or email..."
              className="h-9 px-3 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 max-w-sm w-full"
            />

            <div className="flex items-center gap-2">
              <Select
                value={roleFilter}
                onValueChange={(value) => {
                  setRoleFilter(value || "all");
                  setPage(1);
                }}
              >
                <SelectTrigger >
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value={UserRole.TEAM_LEADER}>Team Leaders</SelectItem>
                  <SelectItem value={UserRole.SALES_EXECUTIVE}>Sales Executives</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value as "all" | "active" | "inactive");
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-9 px-3 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
              <thead className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Active Leads</th>
                  <th className="py-3 px-4">Won / Closed</th>
                  <th className="py-3 px-4">Overdue Rate</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {isLoading ? (
                  <TableSkeletonRows columns={7} />
                ) : staffList.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-12 text-center text-slate-400 dark:text-slate-500"
                    >
                      No staff members match the selected criteria.
                    </td>
                  </tr>
                ) : (
                  staffList.map((exec) => (
                    <tr
                      key={exec.id}
                      onClick={() =>
                        router.push(`/dashboard/users/${exec.id}`)
                      }
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative shrink-0">
                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs">
                              {exec.name[0]}
                            </div>
                            <span
                              title={isUserOnline(exec.id) ? "Online" : "Offline"}
                              className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-slate-900 ${
                                isUserOnline(exec.id)
                                  ? "bg-emerald-500"
                                  : "bg-slate-300 dark:bg-slate-600"
                              }`}
                            />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-900 dark:text-slate-100">
                              {exec.name}
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400">
                              {exec.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
                          {exec.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">
                        {exec.activeLeads ?? 0}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-emerald-700 dark:text-emerald-400">
                        {exec.convertedLeads ?? 0}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`font-semibold ${
                            (exec.followUpsOverdue ?? 0) > 0
                              ? "text-rose-600 dark:text-rose-400"
                              : "text-slate-500 dark:text-slate-400"
                          }`}
                        >
                          {exec.followUpsOverdue ?? 0} Overdue
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleActive(exec.id, exec.isActive);
                          }}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                            exec.isActive
                              ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
                          }`}
                        >
                          {exec.isActive ? "ACTIVE" : "INACTIVE"}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/dashboard/users/${exec.id}`);
                          }}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!isLoading && staffList.length > 0 && (
            <Pagination
              currentPage={pagination?.page || page}
              totalPages={pagination?.totalPages || 1}
              totalItems={pagination?.total || staffList.length}
              pageSize={limit}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setLimit(size);
                setPage(1);
              }}
            />
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
