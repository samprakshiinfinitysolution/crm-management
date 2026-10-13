"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  UserPlus,
  Search,
  RefreshCw,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Loader2,
  Lock,
  Mail,
  User,
  X,
  Eye,
  EyeOff,
  Briefcase,
} from "lucide-react";
import { toast } from "sonner";
import { UserRole } from "@/types/api.types";
import {
  useGetUsersQuery,
  useToggleUserStatusMutation,
  useCreateUserMutation,
} from "@/store/api/userApi";
import { useAppSelector } from "@/store";
import { Pagination } from "@/components/ui/Pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { TableSkeletonRows } from "@/components/ui/TableSkeletonRows";
import { useDebounce } from "@/lib/useDebounce";
import { createUserSchema } from "@/lib/utils";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useSocket } from "@/components/providers/SocketProvider";

export default function AdminUsersPage() {
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const { isUserOnline } = useSocket();

  // Filters & Pagination State
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<"All" | "active" | "inactive">("All");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const router = useRouter()

  // Debounced search query
  const debouncedSearch = useDebounce(search, 300);

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState<UserRole>(UserRole.SALES_EXECUTIVE);
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Mutations
  const [toggleUserStatus, { isLoading: isToggling }] = useToggleUserStatusMutation();
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();

  // Query Params
  const queryParams = useMemo(
    () => ({
      search: debouncedSearch.trim() || undefined,
      role: roleFilter !== "All" ? roleFilter : undefined,
      status: statusFilter !== "All" ? statusFilter : undefined,
      page,
      limit,
    }),
    [debouncedSearch, roleFilter, statusFilter, page, limit]
  );

  const {
    data: usersRes,
    isLoading,
    isFetching,
    refetch,
  } = useGetUsersQuery(queryParams);

  const users = usersRes?.data || [];
  const pagination = usersRes?.pagination;

  // Toggle user active status
  const handleToggleStatus = async (targetUser: {
    id: string;
    name: string;
    isActive: boolean;
    role: string;
  }) => {
    if (targetUser.id === currentUser?.id) {
      toast.error("You cannot deactivate your own administrative account.");
      return;
    }

    try {
      const nextStatus = !targetUser.isActive;
      await toggleUserStatus({
        id: targetUser.id,
        isActive: nextStatus,
      }).unwrap();

      toast.success(
        `User "${targetUser.name}" has been ${
          nextStatus ? "activated" : "deactivated"
        }.`
      );
    } catch (err: unknown) {
      const errorObj = err as { data?: { message?: string } };
      toast.error(
        errorObj?.data?.message || "Failed to update user account status."
      );
    }
  };

  // Submit new user
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    const validation = createUserSchema.safeParse({
      name: newUserName,
      email: newUserEmail,
      password: newUserPassword,
      role: newUserRole,
    });

    if (!validation.success) {
      const errMap: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (field) errMap[field.toString()] = issue.message;
      });
      setFormErrors(errMap);
      return;
    }

    try {
      await createUser({
        name: newUserName.trim(),
        email: newUserEmail.trim(),
        password: newUserPassword,
        role: newUserRole,
      }).unwrap();

      toast.success(`User "${newUserName}" created successfully.`);
      setIsCreateModalOpen(false);
      setNewUserName("");
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserRole(UserRole.SALES_EXECUTIVE);
      setFormErrors({});
      refetch();
    } catch (err: unknown) {
      const errorObj = err as { data?: { message?: string } };
      toast.error(
        errorObj?.data?.message || "Failed to create user account."
      );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header with Breadcrumb & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/admin"
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            >
              Admin Panel
            </Link>
            <span className="text-slate-400">/</span>
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              Users & Access
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            User Governance & Directory
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Manage personnel, roles, permissions, and active status across
            LeadFlow CRM.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            title="Refresh user list"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Invite / Add User</span>
          </button>
        </div>
      </div>

      {/* 2. Search & Filters Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Role Filter */}
          <div className="w-full sm:w-44">
            <Select
              value={roleFilter}
              onValueChange={(val) => {
                setRoleFilter(val || "all");
                setPage(1);
              }}
            >
              <SelectTrigger className="lg:w-36 h-9 text-xs bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                <SelectValue placeholder="Filter by Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value={UserRole.TEAM_LEADER}>
                  Team Leaders
                </SelectItem>
                <SelectItem value={UserRole.SALES_EXECUTIVE}>
                  Sales Executives
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="w-full sm:w-36">
            <Select
              value={statusFilter}
              onValueChange={(val) => {
                setStatusFilter(
                  (val as "All" | "active" | "inactive") || "All",
                );
                setPage(1);
              }}
            >
              <SelectTrigger className="lg:w-36 h-9 text-xs bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Statuses</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="inactive">Inactive Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <button type="button" onClick={()=>{
            setRoleFilter("All");
            setStatusFilter("All")
            setPage(1)
          }}>Reset</button>
        </div>
      </div>

      {/* 3. User Governance Directory Table */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Current Workload</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4">Joined Date</th>
                <th className="py-3 px-4 text-right">Access Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <TableSkeletonRows rows={8} columns={6} />
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-medium">
                      No users found matching your filters.
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Try clearing the search term or adjusting role filters.
                    </p>
                  </td>
                </tr>
              ) : (
                users.map((item) => {
                  const isCurrent = item.id === currentUser?.id;
                  const roleBadge =
                    item.role === UserRole.ADMIN
                      ? "bg-purple-100 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                      : item.role === UserRole.TEAM_LEADER
                        ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800"
                        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";

                  const roleLabel =
                    item.role === UserRole.ADMIN
                      ? "Administrator"
                      : item.role === UserRole.TEAM_LEADER
                        ? "Team Leader"
                        : "Sales Executive";

                        const isAdmin = item.role === UserRole.ADMIN;

                  return (
                    <tr
                      key={item.id}
                      onClick={() => {
                        if (!isAdmin) {
                          router.push(
                            `/admin/users/${item.id}?isActive=${item.isActive}`,
                          );
                        }
                      }}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                    >
                      {/* Name & Email */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative shrink-0">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center shrink-0">
                              {item.name ? item.name[0].toUpperCase() : "U"}
                            </div>
                            <span
                              title={isUserOnline(item.id) ? "Online" : "Offline"}
                              className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-slate-900 ${
                                isUserOnline(item.id)
                                  ? "bg-emerald-500"
                                  : "bg-slate-300 dark:bg-slate-600"
                              }`}
                            />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                                {item.name}
                              </span>
                              {isCurrent && (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                              {item.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${roleBadge}`}
                        >
                          {item.role === UserRole.ADMIN && (
                            <ShieldAlert className="w-3 h-3" />
                          )}
                          {item.role === UserRole.TEAM_LEADER && (
                            <Users className="w-3 h-3" />
                          )}
                          {item.role === UserRole.SALES_EXECUTIVE && (
                            <Briefcase className="w-3 h-3" />
                          )}
                          <span>{roleLabel}</span>
                        </span>
                      </td>

                      {/* Workload / Assigned Deals */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {item.totalAssignedLeads ?? 0}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            leads
                          </span>
                          {item.activeLeads !== undefined && (
                            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                              ({item.activeLeads} active)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Account Status */}
                      <td className="py-3 px-4">
                        {item.isActive ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-600 dark:text-rose-400">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Inactive</span>
                          </span>
                        )}
                      </td>

                      {/* Created Date */}
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400 text-[11px]">
                        {item.createdAt
                          ? format(new Date(item.createdAt), "MMM d, yyyy")
                          : "—"}
                      </td>

                      {/* Access Toggle Button */}
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(item)}
                          disabled={isCurrent || isToggling}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            item.isActive
                              ? "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900"
                              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900"
                          } disabled:opacity-40 disabled:cursor-not-allowed`}
                          title={
                            isCurrent
                              ? "Cannot deactivate your own account"
                              : item.isActive
                                ? "Deactivate user account"
                                : "Activate user account"
                          }
                        >
                          {item.isActive ? "Deactivate" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {pagination && pagination.totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Showing page {pagination.page} of {pagination.totalPages} (
              {pagination.total} total accounts)
            </span>
            <Pagination
              currentPage={page}
              totalPages={pagination.totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {/* 4. Create / Invite User Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xl max-w-md w-full relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Invite / Add New User
                  </h3>
                  <p className="text-xs text-slate-500">
                    Create credentials and assign an organizational role.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 mt-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="e.g. Maya Sharma"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                {formErrors.name && (
                  <p className="text-[11px] text-rose-500 mt-1">
                    {formErrors.name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Corporate Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="maya@company.com"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                {formErrors.email && (
                  <p className="text-[11px] text-rose-500 mt-1">
                    {formErrors.email}
                  </p>
                )}
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  System Role <span className="text-rose-500">*</span>
                </label>
                <Select
                  value={newUserRole}
                  onValueChange={(val) => {
                    if (val) setNewUserRole(val as UserRole);
                  }}
                >
                  <SelectTrigger className="h-9 w-full text-xs bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UserRole.SALES_EXECUTIVE}>
                      Sales Executive (Handle assigned leads)
                    </SelectItem>
                    <SelectItem value={UserRole.TEAM_LEADER}>
                      Team Leader (Distribute leads & supervise)
                    </SelectItem>
                    
                  </SelectContent>
                </Select>
                {formErrors.role && (
                  <p className="text-[11px] text-rose-500 mt-1">
                    {formErrors.role}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Initial Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full pl-9 pr-10 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {formErrors.password && (
                  <p className="text-[11px] text-rose-500 mt-1">
                    {formErrors.password}
                  </p>
                )}
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  disabled={isCreating}
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors disabled:opacity-50"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create User</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
