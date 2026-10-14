"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  Users,
  UserPlus,
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
  MoreVertical,
  Ban,
} from "lucide-react";
import { toast } from "sonner";
import { UserRole, type SalesExecutiveSummary } from "@/types/api.types";
import {
  useGetUsersQuery,
  useToggleUserStatusMutation,
  useCreateUserMutation,
} from "@/store/api/userApi";
import { useAppSelector } from "@/store";
import { PageHeader } from "@/components/shared/PageHeader";
import { FilterToolbar } from "@/components/shared/FilterToolbar";
import { SearchInput } from "@/components/shared/SearchInput";
import { FilterSelect } from "@/components/shared/FilterSelect";
import { DataTable, type ColumnDef } from "@/components/ui/DataTable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
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
  const [statusFilter, setStatusFilter] = useState<
    "All" | "active" | "inactive"
  >("All");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const router = useRouter();

  // Debounced search query
  const debouncedSearch = useDebounce(search, 300);

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState<UserRole>(
    UserRole.SALES_EXECUTIVE,
  );
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Mutations
  const [toggleUserStatus, { isLoading: isToggling }] =
    useToggleUserStatusMutation();
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
    [debouncedSearch, roleFilter, statusFilter, page, limit],
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
  const handleToggleStatus = useCallback(
    async (targetUser: {
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
          }.`,
        );
      } catch (err: unknown) {
        const errorObj = err as { data?: { message?: string } };
        toast.error(
          errorObj?.data?.message || "Failed to update user account status.",
        );
      }
    },
    [currentUser?.id, toggleUserStatus],
  );

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
      toast.error(errorObj?.data?.message || "Failed to create user account.");
    }
  };

  // Define columns for DataTable
  const columns = useMemo<ColumnDef<SalesExecutiveSummary>[]>(
    () => [
      {
        id: "user",
        header: "User",
        cell: ({ row: item }) => {
          const isCurrent = item.id === currentUser?.id;
          const online = isUserOnline(item.id);

          return (
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center shrink-0">
                  {item.name ? item.name[0].toUpperCase() : "U"}
                </div>
                <span
                  title={online ? "Online" : "Offline"}
                  className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-slate-900 ${
                    online
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
          );
        },
      },
      {
        id: "role",
        header: "Role",
        cell: ({ row: item }) => {
          const roleBadge =
            item.role === UserRole.ADMIN
              ? "bg-purple-100 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300 border-purple-200 dark:border-purple-800"
              : item.role === UserRole.TEAM_LEADER
                ? "bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";

          const roleLabel =
            item.role === UserRole.ADMIN
              ? "Administrator"
              : item.role === UserRole.TEAM_LEADER
                ? "Team Leader"
                : "Sales Executive";

          return (
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
          );
        },
      },
      {
        id: "workload",
        header: "Current Workload",
        cell: ({ row: item }) => (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {item.totalAssignedLeads ?? 0}
            </span>
            <span className="text-[11px] text-slate-400">leads</span>
            {item.activeLeads !== undefined && (
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                ({item.activeLeads} active)
              </span>
            )}
          </div>
        ),
      },
      {
        id: "status",
        header: "Account Status",
        cell: ({ row: item }) =>
          item.isActive ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Active</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-600 dark:text-rose-400">
              <XCircle className="w-3.5 h-3.5" />
              <span>Inactive</span>
            </span>
          ),
      },
      {
        id: "createdAt",
        header: "Joined Date",
        cell: ({ row: item }) => (
          <span className="text-slate-500 dark:text-slate-400 text-[11px]">
            {item.createdAt
              ? format(new Date(item.createdAt), "MMM d, yyyy")
              : "—"}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Access Control",
        align: "right",
        cell: ({ row: item }) => {
          const isCurrent = item.id === currentUser?.id;

          return (
            <div
              className="flex items-center justify-end"
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer"
                  title="User actions"
                >
                  <MoreVertical className="w-4 h-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="min-w-40 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg rounded-lg"
                >
                  <DropdownMenuGroup>
                    {item.role !== UserRole.ADMIN && (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(
                            `/admin/users/${item.id}?isActive=${item.isActive}`,
                          );
                        }}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 rounded-md cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 focus:bg-slate-100 dark:focus:bg-slate-800 focus:text-slate-900 dark:focus:text-slate-100 transition-colors"
                      >
                        <Eye className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        <span>View Details</span>
                      </DropdownMenuItem>
                    )}

                    {item.role !== UserRole.ADMIN && <DropdownMenuSeparator />}

                    <DropdownMenuItem
                      disabled={isCurrent || isToggling}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleStatus(item);
                      }}
                      className={`flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-md cursor-pointer transition-colors ${
                        item.isActive
                          ? "text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:text-rose-700 dark:hover:text-rose-300 focus:bg-rose-50 dark:focus:bg-rose-950/50 focus:text-rose-700 dark:focus:text-rose-300"
                          : "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-700 dark:hover:text-emerald-300 focus:bg-emerald-50 dark:focus:bg-emerald-950/50 focus:text-emerald-700 dark:focus:text-emerald-300"
                      }`}
                    >
                      {item.isActive ? (
                        <>
                          <Ban className="w-4 h-4 text-rose-500" />
                          <span>Deactivate</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span>Activate</span>
                        </>
                      )}
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [currentUser?.id, isUserOnline, router, isToggling, handleToggleStatus],
  );

  return (
    <div className="space-y-3.5 animate-in fade-in duration-200">
      {/* 1. Header with Breadcrumb */}
      <PageHeader
        breadcrumbs={[
          { label: "Admin Panel", href: "/admin" },
          { label: "Users & Access" },
        ]}
        title="User Governance & Directory"
        description="Manage personnel, roles, permissions, and active status across LeadFlow CRM."
      />

      {/* 2. Search & Filters Bar */}
      <FilterToolbar
        showReset={Boolean(
          search.trim() ||
            (roleFilter !== "All" && roleFilter !== "all") ||
            statusFilter !== "All",
        )}
        onReset={() => {
          setSearch("");
          setRoleFilter("All");
          setStatusFilter("All");
          setPage(1);
        }}
      >
        <SearchInput
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Search by name or email..."
        />

        <FilterSelect
          value={roleFilter === "All" ? "all" : roleFilter}
          onChange={(val) => {
            setRoleFilter(val || "all");
            setPage(1);
          }}
          options={[
            { value: "all", label: "All roles" },
            { value: UserRole.TEAM_LEADER, label: "Team Leaders" },
            { value: UserRole.SALES_EXECUTIVE, label: "Sales Executives" },
          ]}
          icon={<ShieldAlert className="w-3.5 h-3.5" />}
          placeholder="All roles"
        />

        <FilterSelect
          value={statusFilter}
          onChange={(val) => {
            setStatusFilter((val || "All") as "All" | "active" | "inactive");
            setPage(1);
          }}
          options={[
            { value: "All", label: "All statuses" },
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
          ]}
          icon={<CheckCircle2 className="w-3.5 h-3.5" />}
          placeholder="All statuses"
        />

        {/* Right-aligned actions (moved from PageHeader) */}
        <div className="flex items-center gap-2 md:ml-auto shrink-0 self-end md:self-auto">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
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
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Invite / Add User</span>
          </button>
        </div>
      </FilterToolbar>

      {/* 3. User Governance Directory Table */}
      <DataTable
        columns={columns}
        data={users}
        isLoading={isLoading}
        isFetching={isFetching}
        onRowClick={(item) => {
          if (item.role !== UserRole.ADMIN) {
            router.push(`/admin/users/${item.id}?isActive=${item.isActive}`);
          }
        }}
        rowKey={(item) => item.id}
        emptyTitle="No users found matching your filters"
        emptyDescription="Try clearing the search term or adjusting role filters."
        emptyIcon={<Users className="w-8 h-8 stroke-[1.5]" />}
        pagination={
          pagination && pagination.totalPages > 1
            ? {
                currentPage: page,
                totalPages: pagination.totalPages,
                onPageChange: setPage,
              }
            : undefined
        }
      />

      {/* 4. Create / Invite User Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xl max-w-md w-full relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
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
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                    className="w-full pl-9 pr-10 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors disabled:opacity-50"
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
