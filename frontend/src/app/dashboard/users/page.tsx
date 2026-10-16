"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  UserPlus,
  RefreshCw,
  Eye,
  RotateCcw,
  Search,
  ChevronRight,
  Info,
  Users,
} from "lucide-react";
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

  const hasActiveFilters = Boolean(
    search.trim() || roleFilter !== "all" || statusFilter !== "all",
  );

  const handleResetFilters = () => {
    setSearch("");
    setRoleFilter("all");
    setStatusFilter("all");
    setPage(1);
  };

  const { user } = useAppSelector((state) => state.auth);
  const isSE = user?.role === UserRole.SALES_EXECUTIVE;

  // Debounced search query
  const debouncedSearch = useDebounce(search, 300);

  const queryParams = useMemo(
    () => ({
      search: debouncedSearch.trim() || undefined,
      role:
        roleFilter !== "all"
          ? roleFilter
          : isSE
            ? UserRole.SALES_EXECUTIVE
            : undefined,
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
          <span className="text-slate-700 dark:text-slate-300 font-medium">
            Staff & Representative Directory
          </span>
        </div>

        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e0e0e0] dark:border-slate-800 pb-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <Users className="w-5 h-5 text-[#2874f0]" />
              <span>Team Leaders & Sales Staff Directory</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Manage accounts, active pipeline allocations, quota availability,
              and monitor performance
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleRefetchAll}
              className="h-8.5 px-3 rounded-sm bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              title="Refresh staff data"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${
                  isFetching ? "animate-spin text-[#2874f0]" : ""
                }`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <Link
              href="/dashboard/users/create"
              className="h-8.5 px-4 rounded-sm bg-[#2874f0] hover:bg-[#1a5bb8] text-white font-bold text-xs uppercase tracking-wide flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Staff Member</span>
            </Link>
          </div>
        </div>

        {/* Marketplace Guidance Notice Banner */}
        <div className="px-4 py-3 bg-[#eaf4fe] dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-sm flex items-start gap-3 text-xs">
          <Info className="w-4 h-4 text-[#2874f0] shrink-0 mt-0.5" />
          <div className="space-y-0.5 text-slate-700 dark:text-slate-300">
            <p className="font-semibold text-slate-900 dark:text-white">
              Staff Capacity & Presence Tracking
            </p>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Real-time indicators highlight staff online connectivity.
              Representatives marked INACTIVE are automatically excluded from
              automated lead distributions and workload routing rounds.
            </p>
          </div>
        </div>

        {/* High Density Metric Cards */}
        <ExecutiveStatsCards executives={staffList} isLoading={isLoading} />

        {/* Staff Table Panel */}
        <div className="bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 rounded-sm shadow-2xs overflow-hidden">
          {/* Filter Bar */}
          <div className="p-3.5 border-b border-[#e0e0e0] dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search staff by name or email..."
                className="w-full h-8.5 pl-8 pr-3 text-xs rounded-sm bg-white dark:bg-slate-800 border border-[#e0e0e0] dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-[#2874f0] focus:ring-1 focus:ring-[#2874f0] transition-all"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Select
                value={roleFilter}
                onValueChange={(value) => {
                  setRoleFilter(value || "all");
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-8.5 px-3 rounded-sm bg-white dark:bg-slate-800 border border-[#e0e0e0] dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#2874f0] focus:ring-1 focus:ring-[#2874f0]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent className="border border-[#e0e0e0] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md">
                  <SelectItem value="all" className="text-xs cursor-pointer">
                    All Roles
                  </SelectItem>
                  <SelectItem
                    value={UserRole.TEAM_LEADER}
                    className="text-xs cursor-pointer"
                  >
                    Team Leaders
                  </SelectItem>
                  <SelectItem
                    value={UserRole.SALES_EXECUTIVE}
                    className="text-xs cursor-pointer"
                  >
                    Sales Executives
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value as "all" | "active" | "inactive");
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-8.5 px-3 rounded-sm bg-white dark:bg-slate-800 border border-[#e0e0e0] dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#2874f0] focus:ring-1 focus:ring-[#2874f0]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="border border-[#e0e0e0] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md">
                  <SelectItem value="all" className="text-xs cursor-pointer">
                    All Statuses
                  </SelectItem>
                  <SelectItem value="active" className="text-xs cursor-pointer">
                    Active
                  </SelectItem>
                  <SelectItem
                    value="inactive"
                    className="text-xs cursor-pointer"
                  >
                    Inactive
                  </SelectItem>
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="h-8.5 px-2.5 rounded-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                  title="Reset all filters"
                >
                  <RotateCcw className="w-3 h-3 text-slate-500" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Directory Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-[#e0e0e0] dark:border-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3.5">Staff Member</th>
                  <th className="py-2.5 px-3.5">Assigned Role</th>
                  <th className="py-2.5 px-3.5">Active Leads</th>
                  <th className="py-2.5 px-3.5">Won / Closed</th>
                  <th className="py-2.5 px-3.5">Overdue Rate</th>
                  <th className="py-2.5 px-3.5">Status</th>
                  <th className="py-2.5 px-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e0e0e0] dark:divide-slate-800">
                {isLoading ? (
                  <TableSkeletonRows columns={7} />
                ) : staffList.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-12 text-center text-slate-400"
                    >
                      No staff members match the selected criteria.
                    </td>
                  </tr>
                ) : (
                  staffList.map((exec) => (
                    <tr
                      key={exec.id}
                      onClick={() => router.push(`/dashboard/users/${exec.id}`)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="relative shrink-0">
                            <div className="w-7 h-7 rounded-xs bg-[#eaf4fe] text-[#2874f0] flex items-center justify-center font-bold text-xs">
                              {exec.name[0]?.toUpperCase()}
                            </div>
                            <span
                              title={
                                isUserOnline(exec.id) ? "Online" : "Offline"
                              }
                              className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full ring-2 ring-white dark:ring-slate-900 ${
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
                            <span className="text-[11px] text-slate-400 font-mono">
                              {exec.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3.5">
                        <span className="px-2 py-0.5 rounded-xs text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {exec.role}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 font-bold font-mono text-slate-800 dark:text-slate-200">
                        {exec.activeLeads ?? 0}
                      </td>
                      <td className="py-3 px-3.5 font-bold font-mono text-emerald-600">
                        {exec.convertedLeads ?? 0}
                      </td>
                      <td className="py-3 px-3.5">
                        <span
                          className={`font-semibold ${
                            (exec.followUpsOverdue ?? 0) > 0
                              ? "text-rose-600 font-bold"
                              : "text-slate-500"
                          }`}
                        >
                          {exec.followUpsOverdue ?? 0} Overdue
                        </span>
                      </td>
                      <td className="py-3 px-3.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleActive(exec.id, exec.isActive);
                          }}
                          className={`px-2 py-0.5 rounded-xs text-[10px] font-bold border transition-all cursor-pointer ${
                            exec.isActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                              : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                          }`}
                        >
                          {exec.isActive ? "ACTIVE" : "INACTIVE"}
                        </button>
                      </td>
                      <td className="py-3 px-3.5 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/dashboard/users/${exec.id}`);
                          }}
                          className="p-1 rounded-xs hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-[#2874f0] transition-colors cursor-pointer"
                          title="View user details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!isLoading && staffList.length > 0 && (
            <div className="p-3 border-t border-[#e0e0e0] dark:border-slate-800">
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
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
