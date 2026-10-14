"use client";

import React, { useState } from "react";
import {
  Mail,
  Shield,
  Key,
  CheckCircle2,
  Lock,
  Palette,
} from "lucide-react";
import { useAppSelector } from "@/store";
import { performLogout } from "@/lib/authService";
import LogOutPopUp from "@/components/LogOutPopUp";
import { ChangePasswordModal } from "@/components/profile/ChangePasswordModal";
import { UserRole } from "@/types/api.types";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { PageHeader } from "@/components/shared/PageHeader";

export default function ProfilePage() {
  const { user } = useAppSelector((state) => state.auth);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true);
      await performLogout({ callBackend: true, redirectTo: "/login" });
    } catch {
      await performLogout({ callBackend: false, redirectTo: "/login" });
    } finally {
      setIsLoggingOut(false);
      setIsLogoutModalOpen(false);
    }
  };

  const isTL = user?.role === UserRole.TEAM_LEADER;
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  return (
    <div className="mx-auto flex flex-col gap-3.5">
      {/* Header */}
      <PageHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Profile & Security" },
        ]}
        title="User Profile & Security"
        description="Review authenticated identity, security credentials, and role privileges."
      />

      {/* Main Profile Card */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-800 shadow-xs p-4 sm:p-5 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {user?.name || "Authorized User"}
                </h2>
                <span
                  className={`px-2 py-0.5 rounded-full flex flex-wrap text-center text-[10px] font-bold border ${
                    isTL
                      ? "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60"
                      : "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60"
                  }`}
                >
                  {isTL ? "TEAM LEADER" : "SALES EXECUTIVE"}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {user?.email}
              </p>
            </div>
          </div>

          <LogOutPopUp
            open={isLogoutModalOpen}
            setOpen={setIsLogoutModalOpen}
            onLogout={handleSignOut}
            onClose={() => setIsLogoutModalOpen(false)}
            isPending={isLoggingOut}
          />
        </div>

        {/* Identity Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase block">
                Access Authorization
              </span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {isTL
                  ? "Full Supervisory & Lead Ingestion"
                  : "Isolated Work Queue & Deals"}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase block">
                Account Status
              </span>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                Active & Verified
              </span>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <Mail className="w-5 h-5 text-slate-500 dark:text-slate-400 shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase block">
                Primary Identity
              </span>
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate block">
                {user?.email}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-lg flex flex-wrap bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Key className="w-5 h-5 text-slate-500 dark:text-slate-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase block">
                  Password & Security
                </span>
                <span className="text-xs font-mono font-medium text-slate-700 dark:text-slate-300">
                  ••••••••••••
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsPasswordModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800/60 text-blue-600 dark:text-blue-400 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer shrink-0"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="whitespace-nowrap">Change Password</span>
            </button>
          </div>
        </div>

        {/* Appearance & Interface Preferences */}
        <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Palette className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase block">
                Interface Appearance
              </span>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Choose light, dark, or system mode
              </span>
            </div>
          </div>
          <ThemeToggle variant="segmented" />
        </div>

        {/* Operational Security Notice */}
        <div className="p-4 rounded-lg bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-800/60 text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
          <span className="font-bold block mb-1">
            Authoritative Backend Security
          </span>
          All sessions and permissions are validated server-side on every
          request. Tamper-evident activity logs record all state modifications
          and distribution transactions.
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );
}
