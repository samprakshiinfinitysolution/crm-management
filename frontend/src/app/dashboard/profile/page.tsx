"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Mail,
  Shield,
  Key,
  CheckCircle2,
  Lock,
  Palette,
  ChevronRight,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useAppSelector } from "@/store";
import { performLogout } from "@/lib/authService";
import { UserRole } from "@/types/api.types";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

// Code splitting: Modals are only loaded on-demand
const LogoutDialog = dynamic(
  () => import("@/components/auth/LogoutDialog"),
  { ssr: false }
);

const ChangePasswordModal = dynamic(
  () =>
    import("@/components/profile/ChangePasswordModal").then(
      (m) => m.ChangePasswordModal
    ),
  { ssr: false }
);

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
  const isAdmin = user?.role === UserRole.ADMIN;

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  const roleLabel = isAdmin
    ? "ADMINISTRATOR"
    : isTL
      ? "TEAM LEADER"
      : "SALES EXECUTIVE";

  return (
    <div className="space-y-4 animate-in fade-in duration-150 select-none pb-12">
      {/* 1. Breadcrumb Navigation matching CRM Management Hub */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
        <Link
          href="/dashboard"
          className="text-[#2874f0] hover:underline font-medium"
        >
          Home
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <span className="text-slate-700 dark:text-slate-300 font-medium">
          Profile & Security
        </span>
      </div>

      {/* 2. Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e0e0e0] dark:border-slate-800 pb-3">
        <div className="space-y-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-[#2874f0]" />
              <span>User Profile & Security</span>
            </h1>
            <span className="px-2 py-0.5 rounded-xs text-[10px] font-bold bg-[#eaf4fe] text-[#2874f0] border border-blue-200 uppercase tracking-wide">
              {roleLabel}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Review authenticated identity, security credentials, and role
            privileges
          </p>
        </div>

        {/* Action Buttons: Change Password & Sign Out */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIsPasswordModalOpen(true)}
            className="h-8.5 px-3 rounded-sm bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5 text-[#2874f0]" />
            <span>Change Password</span>
          </button>

          <LogoutDialog
            open={isLogoutModalOpen}
            setOpen={setIsLogoutModalOpen}
            onLogout={handleSignOut}
            onClose={() => setIsLogoutModalOpen(false)}
            isPending={isLoggingOut}
            className="h-8.5 px-3 rounded-sm bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-xs font-bold text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors shadow-2xs"
          />
        </div>
      </div>

      {/* 3. Main Identity Card */}
      <div className="bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 rounded-sm shadow-2xs p-4 sm:p-5 flex flex-col gap-4">
        {/* User Identity Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e0e0e0] dark:border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-xs bg-[#2874f0] text-white flex items-center justify-center font-bold text-xl font-mono shadow-xs">
              {initials}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                  {user?.name || "Authorized User"}
                </h2>
                <span className="px-2 py-0.5 rounded-xs text-[10px] font-bold bg-[#eaf4fe] text-[#2874f0] border border-blue-200 uppercase tracking-wide">
                  {roleLabel}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                {user?.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs bg-[#eaf4fe] text-[#2874f0] border border-blue-200 text-[11px] font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#2874f0]" />
              <span>Verified Session</span>
            </span>
          </div>
        </div>

        {/* 4 Identity Detail Cards (Flipkart Density) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Card 1: Access Privileges */}
          <div className="p-3.5 rounded-sm bg-[#f2f7fe] dark:bg-slate-800/40 border border-[#e0e0e0] dark:border-slate-800 flex items-start gap-3 shadow-2xs">
            <div className="w-8 h-8 rounded-xs bg-[#eaf4fe] dark:bg-blue-950/60 flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4 text-[#2874f0]" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">
                Access Authorization
              </span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate">
                {isAdmin
                  ? "Full Workspace Governance & Administration"
                  : isTL
                    ? "Supervisory & Lead Ingestion Pool"
                    : "Isolated Work Queue & Deals"}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                Role-based backend authorization verified
              </span>
            </div>
          </div>

          {/* Card 2: Account Status */}
          <div className="p-3.5 rounded-sm bg-[#f2f7fe] dark:bg-slate-800/40 border border-[#e0e0e0] dark:border-slate-800 flex items-start gap-3 shadow-2xs">
            <div className="w-8 h-8 rounded-xs bg-[#eaf4fe] dark:bg-blue-950/60 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4 text-[#2874f0]" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">
                Account Status
              </span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Active & Verified
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                Secure authenticated credentials active
              </span>
            </div>
          </div>

          {/* Card 3: Registered Identity */}
          <div className="p-3.5 rounded-sm bg-[#f2f7fe] dark:bg-slate-800/40 border border-[#e0e0e0] dark:border-slate-800 flex items-start gap-3 shadow-2xs">
            <div className="w-8 h-8 rounded-xs bg-[#eaf4fe] dark:bg-blue-950/60 flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4 text-[#2874f0]" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">
                Primary Identity
              </span>
              <span className="text-xs font-mono font-semibold text-slate-800 dark:text-slate-200 truncate block">
                {user?.email}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                Authoritative login identifier
              </span>
            </div>
          </div>

          {/* Card 4: Password & Security */}
          <div className="p-3.5 rounded-sm bg-[#f2f7fe] dark:bg-slate-800/40 border border-[#e0e0e0] dark:border-slate-800 flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-8 h-8 rounded-xs bg-[#eaf4fe] dark:bg-blue-950/60 flex items-center justify-center shrink-0">
                <Key className="w-4 h-4 text-[#2874f0]" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">
                  Password & Security
                </span>
                <span className="text-xs font-mono font-medium text-slate-700 dark:text-slate-300 block">
                  ••••••••••••
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                  Encrypted server-side hash
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsPasswordModalOpen(true)}
              className="px-2.5 py-1 rounded-sm bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-[#e0e0e0] dark:border-slate-700 text-[#2874f0] text-xs font-semibold flex items-center gap-1 transition-colors shadow-2xs cursor-pointer shrink-0"
            >
              <Lock className="w-3 h-3 text-[#2874f0]" />
              <span className="whitespace-nowrap">Update</span>
            </button>
          </div>
        </div>

        {/* 4. Appearance & Interface Preferences */}
        <div className="p-3.5 sm:p-4 rounded-sm bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xs bg-[#eaf4fe] dark:bg-blue-950/60 flex items-center justify-center shrink-0">
              <Palette className="w-4 h-4 text-[#2874f0]" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">
                Interface Appearance
              </span>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Choose light, dark, or system preference
              </span>
            </div>
          </div>
          <ThemeToggle variant="segmented" />
        </div>

        {/* 5. Authoritative Backend Security Notice */}
        <div className="p-4 rounded-sm bg-[#f8faff] dark:bg-slate-800/30 border border-[#e0e0e0] dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 shadow-2xs">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-4 h-4 text-[#2874f0]" />
            <span className="font-bold text-slate-900 dark:text-slate-100">
              Authoritative Backend Security & Audit Guarantee
            </span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
            All sessions, distribution privileges, and data operations are
            authenticated server-side. Tamper-evident immutable activity logs
            record all state modifications and distribution transactions.
          </p>
        </div>
      </div>

      {/* Change Password Modal - Code split & rendered on-demand */}
      {isPasswordModalOpen && (
        <ChangePasswordModal
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
        />
      )}
    </div>
  );
}
