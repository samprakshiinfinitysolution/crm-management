"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Calendar,
  CheckCircle2,
  XCircle,
  RefreshCw,
  UserCheck,
  UserX,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { UserRole } from "@/types/api.types";
import { useToggleUserStatusMutation } from "@/store/api/userApi";

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

  const roleBadgeStyle =
    user.role === UserRole.ADMIN
      ? "bg-purple-100 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300 border-purple-200 dark:border-purple-800"
      : user.role === UserRole.TEAM_LEADER
      ? "bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border-blue-200 dark:border-blue-800"
      : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";

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
    <div className="mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Back button + User details */}
        <div className="flex items-start sm:items-center gap-4">
          <Link
            href="/admin/users"
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            title="Back to Users"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div className="w-12 h-12 rounded-xl bg-blue-600/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50 font-bold text-lg flex items-center justify-center shrink-0">
            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 truncate">
                {user.name}
              </h1>
              <span
                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${roleBadgeStyle}`}
              >
                {roleLabel}
              </span>
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                  user.isActive
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800"
                    : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800"
                }`}
              >
                {user.isActive ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    Active Account
                  </>
                ) : (
                  <>
                    <XCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                    Inactive Account
                  </>
                )}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {user.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Joined {formattedDate}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 self-end md:self-center">
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
      </div>
    </div>
  );
};
