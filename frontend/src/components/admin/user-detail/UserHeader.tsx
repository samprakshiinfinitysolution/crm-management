"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  RefreshCw,
  UserCheck,
  UserX,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { UserRole } from "@/types/api.types";
import { useToggleUserStatusMutation } from "@/store/api/userApi";
import { PageHeader } from "@/components/shared/PageHeader";

interface UserHeaderProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole | string;
    isActive: boolean;
    createdAt?: string;
  };
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const UserHeader: React.FC<UserHeaderProps> = ({
  user,
  onRefresh,
  isRefreshing = false,
}) => {
  const [toggleStatus, { isLoading: isToggling }] =
    useToggleUserStatusMutation();

  const handleToggleStatus = async () => {
    try {
      const nextStatus = !user.isActive;
      await toggleStatus({
        id: user.id,
        isActive: nextStatus,
      }).unwrap();

      toast.success(
        `User "${user.name}" has been ${
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

  const roleLabel =
    user.role === UserRole.ADMIN
      ? "Administrator"
      : user.role === UserRole.TEAM_LEADER
      ? "Team Leader"
      : "Sales Executive";

  const formattedDate = user.createdAt
    ? format(new Date(user.createdAt), "MMMM dd, yyyy")
    : "N/A";

  return (
    <PageHeader
      breadcrumbs={[
        { label: "Admin Panel", href: "/admin" },
        { label: "Users", href: "/admin/users" },
        { label: user.name },
      ]}
      title={user.name}
      description={`${user.email} · ${roleLabel} · ${
        user.isActive ? "Active Account" : "Inactive Account"
      } · Joined ${formattedDate}`}
      actions={
        <div className="flex items-center gap-2">
          <Link
            href="/admin/users"
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            title="Back to Users"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          )}

          <button
            onClick={handleToggleStatus}
            disabled={isToggling}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors shadow-xs ${
              user.isActive
                ? "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:hover:bg-rose-950/70 dark:text-rose-300 dark:border-rose-900"
                : "bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:hover:bg-emerald-500"
            }`}
          >
            {user.isActive ? (
              <>
                <UserX className="w-3.5 h-3.5" />
                Deactivate Account
              </>
            ) : (
              <>
                <UserCheck className="w-3.5 h-3.5" />
                Activate Account
              </>
            )}
          </button>
        </div>
      }
    />
  );
};
