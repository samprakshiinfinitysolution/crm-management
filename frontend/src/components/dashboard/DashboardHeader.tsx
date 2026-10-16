"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Menu,
  ChevronDown,
  HelpCircle,
  Shield,
  Layers,
  GitFork,
  CalendarClock,
  Users,
  TrendingUp,
  BarChart3,
  User,
  Sparkles,
  LogOut,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useAppSelector } from "@/store";
import { performLogout } from "@/lib/authService";
import { UserRole } from "@/types/api.types";
import { useGetNotificationsQuery } from "@/store/api/notificationApi";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

// Code splitting: Modals are only loaded on-demand when activated
const LogoutDialog = dynamic(() => import("@/components/auth/LogoutDialog"), {
  ssr: false,
});

const CRMHelpModal = dynamic(
  () =>
    import("@/components/dashboard/CRMHelpModal").then((m) => m.CRMHelpModal),
  { ssr: false },
);

interface DashboardHeaderProps {
  onToggleMobileNav?: () => void;
}

export default function DashboardHeader({
  onToggleMobileNav,
}: DashboardHeaderProps) {
  const pathname = usePathname();
  const { user } = useAppSelector((state) => state.auth);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    };
    if (isProfileMenuOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isProfileMenuOpen]);

  const isAdmin = user?.role === UserRole.ADMIN;
  const isTL = user?.role === UserRole.TEAM_LEADER;
  const isSE = user?.role === UserRole.SALES_EXECUTIVE;

  const { data: notifData } = useGetNotificationsQuery(undefined, {
    pollingInterval: 30000,
    skip: !user,
  });
  const unreadCount = notifData?.data?.filter((n) => !n.isRead).length ?? 0;

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true);
      await performLogout({ callBackend: true, redirectTo: "/login" });
    } catch {
      await performLogout({ callBackend: false, redirectTo: "/login" });
    } finally {
      setIsLoggingOut(false);
      setIsLogoutModalOpen(false);
      setIsProfileMenuOpen(false);
    }
  };

  const displayName =
    user?.name ||
    user?.email?.split("@")[0] ||
    (isAdmin ? "Administrator" : isTL ? "Team Leader" : "Sales Executive");
  const avatarLetter =
    displayName[0]?.toUpperCase() || (isAdmin ? "A" : isTL ? "T" : "S");

  // Base path prefix depending on role
  const basePath = isAdmin ? "/admin" : "/dashboard";

  // Check which top nav section is active
  const isHomeActive = pathname === "/dashboard" || pathname === "/admin";
  const isListingsActive = pathname.includes("/leads");
  const isInventoryActive = pathname.includes("/distributions");
  const isOrdersActive = pathname.includes("/follow-ups");
  const isPaymentsActive = pathname.includes("/users");
  const isReportsActive = pathname.includes("/reports");
  const isPartnerServicesActive = pathname.includes("/audit-logs");

  return (
    <>
      <header className="fixed top-0 inset-x-0 h-14 z-40 bg-white dark:bg-slate-900 border-b border-[#e0e0e0] dark:border-slate-800 shadow-2xs transition-colors">
        <div className="h-full px-2 sm:px-4 lg:px-6 flex items-center justify-between gap-2 max-w-[1540px] mx-auto">
          {/* Left: Mobile Nav Toggle & Flipkart Seller Logo */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {onToggleMobileNav && (
              <button
                type="button"
                onClick={onToggleMobileNav}
                className="lg:hidden p-1.5 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Toggle navigation"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            {/* CRM Management Hub Inspired Logo */}
            <Link
              href={basePath}
              className="flex items-center gap-2 group py-1"
              title="CRM Management Hub CRM"
            >
              {/* Yellow shopping bag / "S" emblem */}
              <div className="w-8 h-8 rounded-sm bg-brand-primary shadow-brand-sm  border border-card flex items-center justify-center shadow-2xs shrink-0 group-hover:scale-105 transition-transform">
                <span className="font-black text-card text-lg leading-none italic font-serif">
                  LF
                </span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-[15px] font-bold tracking-tight text-[#2874f0] dark:text-blue-400 leading-none">
                    LeadFlow
                  </span>
                  <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 tracking-tight leading-none">
                    {isAdmin ? "Admin" : isTL ? "Supervisor" : "Executive"}
                  </span>
                </div>
                <span className="text-[9px] text-slate-400 font-medium tracking-wide leading-none mt-0.5 uppercase">
                  {isAdmin
                    ? "Admin Console"
                    : isTL
                      ? "Supervisor Desk"
                      : "Executive Queue"}
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Desktop Horizontal Flipkart Marketplace Menu Bar */}
          <nav className="hidden lg:flex items-center h-full text-[13px] font-medium text-slate-700 dark:text-slate-200">
            {/* Home */}
            <Link
              href={basePath}
              className={`h-full flex items-center px-3 hover:text-[#2874f0] transition-colors relative ${
                isHomeActive
                  ? "text-[#2874f0] font-semibold border-b-[3px] border-[#2874f0]"
                  : ""
              }`}
            >
              Home
            </Link>

            {/* Listings ⌄ */}
            <div
              className="relative h-full flex items-center"
              onMouseEnter={() => setActiveDropdown("listings")}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <Link
                href={`${basePath}/leads`}
                className={`h-full flex items-center gap-1 px-3 hover:text-[#2874f0] transition-colors ${
                  isListingsActive
                    ? "text-[#2874f0] font-semibold border-b-[3px] border-[#2874f0]"
                    : ""
                }`}
              >
                <span>Listings</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </Link>

              {activeDropdown === "listings" && (
                <div className="absolute top-14 left-0 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-b-md py-1.5 z-50 animate-in fade-in-50 duration-150">
                  <Link
                    href={`${basePath}/leads`}
                    className="flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-[#f2f7fe] dark:hover:bg-slate-800 hover:text-[#2874f0]"
                  >
                    <Layers className="w-4 h-4 text-blue-500" />
                    <span>My Listings / Lead Directory</span>
                  </Link>
                  <Link
                    href={`${basePath}/leads/create`}
                    className="flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-[#f2f7fe] dark:hover:bg-slate-800 hover:text-[#2874f0]"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                    <span>Add New Listing / Lead</span>
                  </Link>
                  {isSE && (
                    <Link
                      href="/dashboard/my-leads"
                      className="flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-[#f2f7fe] dark:hover:bg-slate-800 hover:text-[#2874f0]"
                    >
                      <Layers className="w-4 h-4 text-amber-500" />
                      <span>My Assigned Listings</span>
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsHelpOpen(true)}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-[#f2f7fe] dark:hover:bg-slate-800 hover:text-[#2874f0] text-left cursor-pointer"
                  >
                    <HelpCircle className="w-4 h-4 text-slate-400" />
                    <span>Track Listing Quality</span>
                  </button>
                </div>
              )}
            </div>

            {/* Inventory ⌄ (Distributions) */}
            {(isAdmin || isTL) && (
              <div
                className="relative h-full flex items-center"
                onMouseEnter={() => setActiveDropdown("inventory")}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={`${basePath}/distributions`}
                  className={`h-full flex items-center gap-1 px-3 hover:text-[#2874f0] transition-colors ${
                    isInventoryActive
                      ? "text-[#2874f0] font-semibold border-b-[3px] border-[#2874f0]"
                      : ""
                  }`}
                >
                  <span>Inventory</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </Link>

                {activeDropdown === "inventory" && (
                  <div className="absolute top-14 left-0 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-b-md py-1.5 z-50 animate-in fade-in-50 duration-150">
                    <Link
                      href={`${basePath}/distributions`}
                      className="flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-[#f2f7fe] dark:hover:bg-slate-800 hover:text-[#2874f0]"
                    >
                      <GitFork className="w-4 h-4 text-purple-500" />
                      <span>Distribute & Reassign</span>
                    </Link>
                    <Link
                      href={`${basePath}/distributions/create`}
                      className="flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-[#f2f7fe] dark:hover:bg-slate-800 hover:text-[#2874f0]"
                    >
                      <GitFork className="w-4 h-4 text-emerald-500" />
                      <span>Create Lead Distribution</span>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Orders ⌄ (Follow-ups) */}
            <div
              className="relative h-full flex items-center"
              onMouseEnter={() => setActiveDropdown("follow-ups")}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <Link
                href="/dashboard/follow-ups"
                className={`h-full flex items-center gap-1 px-3 hover:text-[#2874f0] transition-colors ${
                  isOrdersActive
                    ? "text-[#2874f0] font-semibold border-b-[3px] border-[#2874f0]"
                    : ""
                }`}
              >
                <span>Follow-ups</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </Link>

              {activeDropdown === "follow-ups" && (
                <div className="absolute top-14 left-0 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-b-md py-1.5 z-50 animate-in fade-in-50 duration-150">
                  <Link
                    href="/dashboard/follow-ups"
                    className="flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-[#f2f7fe] dark:hover:bg-slate-800 hover:text-[#2874f0]"
                  >
                    <CalendarClock className="w-4 h-4 text-blue-500" />
                    <span>Follow-up Pipeline</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Payments ⌄ (Sales Team / Users) */}
            {(isAdmin || isTL) && (
              <div
                className="relative h-full flex items-center"
                onMouseEnter={() => setActiveDropdown("team")}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={`${basePath}/users`}
                  className={`h-full flex items-center gap-1 px-3 hover:text-[#2874f0] transition-colors ${
                    isPaymentsActive
                      ? "text-[#2874f0] font-semibold border-b-[3px] border-[#2874f0]"
                      : ""
                  }`}
                >
                  <span>Team</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </Link>

                {activeDropdown === "team" && (
                  <div className="absolute top-14 left-0 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-b-md py-1.5 z-50 animate-in fade-in-50 duration-150">
                    <Link
                      href={`${basePath}/users`}
                      className="flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-[#f2f7fe] dark:hover:bg-slate-800 hover:text-[#2874f0]"
                    >
                      <Users className="w-4 h-4 text-blue-500" />
                      <span>Sales Team & Quotas</span>
                    </Link>
                    <Link
                      href={`${basePath}/users/create`}
                      className="flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-[#f2f7fe] dark:hover:bg-slate-800 hover:text-[#2874f0]"
                    >
                      <Users className="w-4 h-4 text-emerald-500" />
                      <span>Add Team Executive</span>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Reports ⌄ */}
            {(isAdmin || isTL) && (
              <div
                className="relative h-full flex items-center"
                onMouseEnter={() => setActiveDropdown("reports")}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={`${basePath}/reports`}
                  className={`h-full flex items-center gap-1 px-3 hover:text-[#2874f0] transition-colors ${
                    isReportsActive
                      ? "text-[#2874f0] font-semibold border-b-[3px] border-[#2874f0]"
                      : ""
                  }`}
                >
                  <span>Reports</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </Link>

                {activeDropdown === "reports" && (
                  <div className="absolute top-14 left-0 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-b-md py-1.5 z-50 animate-in fade-in-50 duration-150">
                    <Link
                      href={`${basePath}/reports`}
                      className="flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-[#f2f7fe] dark:hover:bg-slate-800 hover:text-[#2874f0]"
                    >
                      <BarChart3 className="w-4 h-4 text-blue-500" />
                      <span>Reports Overview</span>
                    </Link>
                    <Link
                      href="/dashboard/reports/leads"
                      className="flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-[#f2f7fe] dark:hover:bg-slate-800 hover:text-[#2874f0]"
                    >
                      <Layers className="w-4 h-4 text-purple-500" />
                      <span>Lead Conversion Reports</span>
                    </Link>
                    <Link
                      href="/dashboard/reports/performance"
                      className="flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-[#f2f7fe] dark:hover:bg-slate-800 hover:text-[#2874f0]"
                    >
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                      <span>Executive Performance Matrix</span>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Audit Services ⌄ (Audit Logs & Governance) */}
            {(isAdmin || isTL) && (
              <div
                className="relative h-full flex items-center"
                onMouseEnter={() => setActiveDropdown("partners")}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={`${basePath}/audit-logs`}
                  className={`h-full flex items-center gap-1 px-3 hover:text-[#2874f0] transition-colors ${
                    isPartnerServicesActive
                      ? "text-[#2874f0] font-semibold border-b-[3px] border-[#2874f0]"
                      : ""
                  }`}
                >
                  <span>Audit Services</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </Link>

                {activeDropdown === "partners" && (
                  <div className="absolute top-14 left-0 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-b-md py-1.5 z-50 animate-in fade-in-50 duration-150">
                    <Link
                      href={`${basePath}/audit-logs`}
                      className="flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-[#f2f7fe] dark:hover:bg-slate-800 hover:text-[#2874f0]"
                    >
                      <Shield className="w-4 h-4 text-blue-500" />
                      <span>System Audit Trail</span>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </nav>

          {/* Right: Buyer Questions, Help, Notification Bell, User Avatar */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0 text-xs">
            {/* Buyer Questions Link */}
            <Link
              href="/dashboard/notifications"
              className="hidden md:inline-flex items-center text-slate-600 dark:text-slate-300 hover:text-[#2874f0] dark:hover:text-white transition-colors"
            >
              Buyer Questions
            </Link>

            {/* Help Link */}
            <button
              type="button"
              onClick={() => setIsHelpOpen(true)}
              className="hidden sm:inline-flex items-center text-slate-600 dark:text-slate-300 hover:text-[#2874f0] dark:hover:text-white transition-colors cursor-pointer"
            >
              Help
            </button>

            {/* Notification Bell with Badge */}
            <Link
              href="/dashboard/notifications"
              className="relative p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
              title="Notifications"
            >
              <Bell className="w-4.5 h-4.5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-[#fb641b] text-white text-[9px] font-bold flex items-center justify-center ring-1 ring-white dark:ring-slate-900 shadow-xs">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>

            {/* User Profile Avatar Circle (like [21 W] or [1 P] in CRM Management Hub) */}
            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                onClick={() => {
                  setIsLogoutModalOpen(false);
                  setIsProfileMenuOpen((prev) => !prev);
                }}
                className="flex items-center gap-1.5 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Account Settings"
              >
                {/* Yellow circle avatar */}
                <div className="w-7 h-7 rounded-full bg-brand-primary text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  {avatarLetter}
                </div>
                <span className="hidden xl:inline text-xs font-semibold text-slate-800 dark:text-slate-100 max-w-28 truncate">
                  {displayName}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden xl:inline" />
              </button>

              {/* Profile Dropdown */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 top-11 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-md py-2 z-50 animate-in fade-in duration-100">
                  <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                      {displayName}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {user?.email || "seller@leadflow.internal"}
                    </p>
                    <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-semibold border border-blue-200 dark:border-blue-800">
                      {isAdmin
                        ? "Superuser"
                        : isTL
                          ? "Team Leader"
                          : "Sales Executive"}
                    </span>
                  </div>
 
                  <Link
                    href={`${basePath}/profile`}
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-[#f2f7fe] dark:hover:bg-slate-800 hover:text-[#2874f0]"
                  >
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span>My Profile</span>
                  </Link>

                  <div className="px-3.5 py-1.5 flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
                    <span>Appearance</span>
                    <ThemeToggle size="sm" variant="button" />
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      setIsLogoutModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer text-left"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* CRM Help & Support Modal - Code split & rendered on-demand */}
      {isHelpOpen && (
        <CRMHelpModal
          isOpen={isHelpOpen}
          onClose={() => setIsHelpOpen(false)}
        />
      )}

      {/* Logout Confirmation Modal - Rendered at root level so it never unmounts with menu */}
      <LogoutDialog
        open={isLogoutModalOpen}
        setOpen={setIsLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onLogout={handleSignOut}
        isPending={isLoggingOut}
        showTrigger={false}
      />
    </>
  );
}
