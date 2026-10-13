"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Bell, Menu } from "lucide-react";
import { useAppSelector } from "@/store";
import { performLogout } from "@/lib/authService";
import LogOutPopUp from "@/components/LogOutPopUp";
import { UserRole } from "@/types/api.types";
import { useGetNotificationsQuery } from "@/store/api/notificationApi";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

interface DashboardHeaderProps {
  onToggleMobileNav?: () => void;
}

export default function DashboardHeader({
  onToggleMobileNav,
}: DashboardHeaderProps) {
  const { user } = useAppSelector((state) => state.auth);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const isAdmin = user?.role === UserRole.ADMIN;

  const { data: notifData } = useGetNotificationsQuery(undefined, {
    pollingInterval: 30000,
    skip: !user,
  });
  const unreadCount = notifData?.data?.filter((n) => !n.isRead).length || 0;

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
    : isTL
      ? "TL"
      : "SE";

  return (
    <header className="fixed top-0 inset-x-0 h-16 z-40 bg-brand-primary dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 shadow-2xs transition-colors">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-3 mx-auto ">
        {/* Left: Mobile Nav Toggle & Brand Logo */}
        <div className="flex items-center gap-3 min-w-0">
          {onToggleMobileNav && (
            <button
              type="button"
              onClick={onToggleMobileNav}
              className="lg:hidden p-2 rounded-lg text-slate-100 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 active:scale-95 transition-all cursor-pointer"
              aria-label="Toggle navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-600 shadow-xs flex items-center justify-center text-white font-bold text-sm shrink-0">
              LF
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center max-sm:flex-col gap-1.5">
                <span className="text-base font-bold text-slate-100 tracking-tight truncate leading-tight">
                  LeadFlow
                </span>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[10px] font-semibold tracking-wide leading-none shrink-0">
                  {isAdmin ? "Admin" : isTL ? "Team Leader" : "Sales Rep"}
                </span>
              </div>
              <span className="text-[11px] text-slate-100 dark:text-slate-400 font-medium truncate hidden sm:inline">
                {isAdmin
                  ? "Admin Governance"
                  : isTL
                    ? "Team Operations"
                    : "Personal Queue"}
              </span>
            </div>
          </Link>
        </div>

        {/* Right: Theme Toggle, Notifications, Profile, Logout */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <ThemeToggle className="w-9 h-9 border-slate-200/80 bg-white hover:bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700" />

          <Link
            href="/dashboard/notifications"
            className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 relative active:scale-95 transition-all"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-4.5 h-4.5 px-1 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center ring-2 ring-white dark:ring-slate-900 shadow-xs">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>

          <Link
            href="/dashboard/profile"
            className="group flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/10 dark:hover:bg-slate-800 active:scale-95 transition-all"
            title="View Profile"
          >
            <div className="w-8 h-8 rounded-lg bg-white dark:bg-blue-600 text-blue-700 dark:text-white font-bold flex items-center justify-center text-xs transition-colors">
              {initials}
            </div>
            <div className="hidden lg:flex flex-col text-left min-w-0">
              <span className="text-xs font-semibold text-white truncate max-w-28 transition-colors">
                {user?.name || (isTL ? "Team Leader" : "Sales Executive")}
              </span>
              <span className="text-[11px] text-white/70 dark:text-slate-400 truncate max-w-28 transition-colors">
                {user?.email || (isTL ? "Supervisor" : "Sales Rep")}
              </span>
            </div>
          </Link>

          <div className="hidden md:flex">
            <LogOutPopUp
              open={isLogoutModalOpen}
              setOpen={setIsLogoutModalOpen}
              onLogout={handleSignOut}
              onClose={() => setIsLogoutModalOpen(false)}
              isPending={isLoggingOut}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
