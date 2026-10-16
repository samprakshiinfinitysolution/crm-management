"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  GitFork,
  CalendarClock,
  BarChart3,
  UploadCloud,
  FileSpreadsheet,
  Bell,
  ShieldCheck,
  UserCheck,
  Briefcase,
  ChevronRight,
  ChevronDown,
  X,
  LogOut,
} from "lucide-react";
import { useAppSelector } from "@/store";
import { UserRole } from "@/types/api.types";
import dynamic from "next/dynamic";
import { performLogout } from "@/lib/authService";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

// Code splitting: Logout dialog is loaded on-demand
const LogoutDialog = dynamic(
  () => import("@/components/auth/LogoutDialog"),
  { ssr: false }
);

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  exact?: boolean;
  badge?: string;
  subRoute?: NavItem[];
}

interface DashboardSidebarProps {
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

const tlNavItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "All Leads",
    href: "/dashboard/leads",
    icon: Users,
    subRoute: [
      {
        label: "Lead Directory",
        href: "/dashboard/leads",
        icon: Users,
        exact: true,
      },
      {
        label: "Create Lead",
        href: "/dashboard/leads/create",
        icon: UserPlus,
        exact: true,
      },
    ],
  },
  {
    label: "Distribute Leads",
    href: "/dashboard/distributions",
    icon: GitFork,
    badge: "TL",
    subRoute: [
      {
        label: "Reassign or Recall Leads",
        href: "/dashboard/distributions",
        icon: GitFork,
        exact: true,
      },
      {
        label: "Create Distribution",
        href: "/dashboard/distributions/create",
        icon: GitFork,
        exact: true,
      },
    ],
  },
  { label: "Follow-ups", href: "/dashboard/follow-ups", icon: CalendarClock },
  {
    label: "Sales Team",
    href: "/dashboard/users",
    icon: Users,
    badge: "TL",
    subRoute: [
      {
        label: "All Team Members",
        href: "/dashboard/users",
        icon: Users,
        exact: true,
      },
      {
        label: "Create Team Member",
        href: "/dashboard/users/create",
        icon: UserPlus,
        exact: true,
      },
    ],
  },
  {
    label: "Reports & KPIs",
    href: "/dashboard/reports",
    icon: BarChart3,
    badge: "TL",
  },
  {
    label: "Import Leads",
    href: "/dashboard/imports",
    icon: UploadCloud,
    badge: "TL",
    subRoute: [
      {
        label: "Import History",
        href: "/dashboard/imports",
        icon: UploadCloud,
        exact: true,
      },
      {
        label: "Upload Excel File",
        href: "/dashboard/imports/upload",
        icon: FileSpreadsheet,
        exact: true,
      },
    ],
  },
  { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
  {
    label: "Audit Logs",
    href: "/dashboard/audit-logs",
    icon: ShieldCheck,
    badge: "TL",
  },
  { label: "Profile", href: "/dashboard/profile", icon: UserCheck },
];

const adminNavItems: NavItem[] = [
  {
    label: "Admin Panel",
    href: "/admin",
    icon: ShieldCheck,
    badge: "ADMIN",
    exact: true,
  },
  {
    label: "User Governance",
    href: "/admin/users",
    icon: Users,
    badge: "ADMIN",
  },
  {
    label: "Audit Logs",
    href: "/admin/audit-logs",
    icon: ShieldCheck,
    badge: "ADMIN",
  },
  {
    label: "All Leads",
    href: "/admin/leads",
    icon: Users,
    subRoute: [
      {
        label: "Lead Directory",
        href: "/admin/leads",
        icon: Users,
        exact: true,
      },
      {
        label: "Create Lead",
        href: "/admin/leads/create",
        icon: UserPlus,
        exact: true,
      },
    ],
  },
  {
    label: "Distribute Leads",
    href: "/admin/distributions",
    icon: GitFork,
    badge: "ADMIN",
    subRoute: [
      {
        label: "Reassign or Recall",
        href: "/admin/distributions",
        icon: GitFork,
        exact: true,
      },
      {
        label: "Create Distribution",
        href: "/admin/distributions/create",
        icon: GitFork,
        exact: true,
      },
    ],
  },
  {
    label: "Reports & KPIs",
    href: "/admin/reports",
    icon: BarChart3,
    badge: "ADMIN",
  },
  {
    label: "Import Leads",
    href: "/admin/imports",
    icon: UploadCloud,
    badge: "ADMIN",
    subRoute: [
      {
        label: "Import History",
        href: "/admin/imports",
        icon: UploadCloud,
        exact: true,
      },
      {
        label: "Upload Excel File",
        href: "/admin/imports/upload",
        icon: FileSpreadsheet,
        exact: true,
      },
    ],
  },
  { label: "Follow-ups", href: "/dashboard/follow-ups", icon: CalendarClock },
  { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { label: "Profile", href: "/dashboard/profile", icon: UserCheck },
];

const seNavItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "My Assigned Leads",
    href: "/dashboard/my-leads",
    icon: Briefcase,
  },
  {
    label: "Follow-up Queue",
    href: "/dashboard/follow-ups",
    icon: CalendarClock,
  },
  { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { label: "Profile", href: "/dashboard/profile", icon: UserCheck },
];

export default function DashboardSidebar({
  isOpenMobile = false,
  onCloseMobile,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const { user } = useAppSelector((state) => state.auth);
  const isAdmin = user?.role === UserRole.ADMIN;
  const isTL = user?.role === UserRole.TEAM_LEADER;
  const isElevated = isAdmin || isTL;

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({});

  const toggleSubMenu = (label: string, defaultOpen = false) => {
    setOpenSubMenus((prev) => {
      const current = prev[label] ?? defaultOpen;
      return {
        ...prev,
        [label]: !current,
      };
    });
  };

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

  const items = isElevated ? isAdmin ? adminNavItems :tlNavItems : seNavItems;

  const isLinkActive = (item: NavItem) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  };

  const isParentActive = (item: NavItem) => {
    if (item.subRoute && item.subRoute.length > 0) {
      return item.subRoute.some((sub) => isLinkActive(sub));
    }
    return isLinkActive(item);
  };

  useEffect(() => {
    if (isOpenMobile) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpenMobile]);

  return (
    <>
      {/* Sidebar Container */}
      <aside
        className={`fixed md:hidden top-0 lg:top-16 bottom-0 left-0 z-50 lg:z-30 w-64 bg-card dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-xs flex flex-col transition-all duration-300 lg:translate-x-0 ${
          isOpenMobile ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Mobile Close Button */}
        {isOpenMobile && (
          <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 lg:hidden">
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Menu
            </span>
            <button
              type="button"
              onClick={onCloseMobile}
              className="p-1 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Role Workspace Banner */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Signed in as
            </span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
              {isAdmin
                ? "System Admin"
                : isTL
                ? "Team Leader"
                : "Sales Executive"}
            </span>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
              isAdmin
                ? "bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                : isTL
                ? "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800"
                : "bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
            }`}
          >
            {isAdmin ? "Superuser" : isTL ? "Supervisor" : "Sales Rep"}
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1 no-scrollbar">
          {items.map((item) => {
            const hasSub = !!(item.subRoute && item.subRoute.length > 0);
            const parentActive = hasSub
              ? isParentActive(item)
              : isLinkActive(item);
            const isOpen = openSubMenus[item.label] ?? parentActive;
            const Icon = item.icon;

            if (hasSub) {
              return (
                <div key={item.label} className="space-y-1">
                  <button
                    type="button"
                    onClick={() => toggleSubMenu(item.label, parentActive)}
                    className={`w-full group flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                      parentActive
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-bold shadow-2xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/60"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                          parentActive
                            ? "bg-blue-600 text-white shadow-xs"
                            : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 group-hover:bg-slate-200/60 dark:group-hover:bg-slate-700"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="truncate">{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {item.badge && (
                        <span
                          className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${
                            parentActive
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300"
                              : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 group-hover:bg-slate-200/60 dark:group-hover:bg-slate-700"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          isOpen
                            ? "rotate-180 text-blue-600 dark:text-blue-400"
                            : "text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300"
                        }`}
                      />
                    </div>
                  </button>

                  {/* Collapsible Sub-Routes */}
                  {isOpen && (
                    <div className="pl-4 pr-1 py-1 space-y-1 border-l-2 border-slate-100 dark:border-slate-800 ml-6 my-1">
                      {item.subRoute!.map((sub) => {
                        const subActive = isLinkActive(sub);
                        return (
                          <Link
                            key={sub.href + sub.label}
                            href={sub.href}
                            onClick={onCloseMobile}
                            className={`group flex items-center justify-between px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all ${
                              subActive
                                ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-bold"
                                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/60"
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div
                                className={`w-1.5 h-1.5 rounded-full transition-all ${
                                  subActive
                                    ? "bg-blue-600 ring-2 ring-blue-200 dark:ring-blue-900"
                                    : "bg-slate-300 group-hover:bg-slate-500 dark:bg-slate-700 dark:group-hover:bg-slate-400"
                                }`}
                              />
                              <span className="truncate">{sub.label}</span>
                            </div>
                            {subActive && (
                              <ChevronRight className="w-3 h-3 text-blue-600 dark:text-blue-400 shrink-0" />
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  parentActive
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-bold shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                      parentActive
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 group-hover:bg-slate-200/60 dark:group-hover:bg-slate-700"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="truncate">{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {item.badge && (
                    <span
                      className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${
                        parentActive
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300"
                          : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 group-hover:bg-slate-200/60 dark:group-hover:bg-slate-700"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {parentActive && (
                    <ChevronRight className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer User Info, Theme Toggle & Signout */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800">
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                {user?.name?.[0]?.toUpperCase() || (isAdmin ? "AD" : isTL ? "TL" : "SE")}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                  {user?.name || (isAdmin ? "Administrator" : isTL ? "Team Leader" : "Sales Executive")}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                  {user?.email || "Signed in"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <ThemeToggle size="sm" variant="button" />
              <button
                type="button"
                onClick={() => setIsLogoutModalOpen(true)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-colors shrink-0"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {isLogoutModalOpen && (
        <LogoutDialog
          open={isLogoutModalOpen}
          setOpen={setIsLogoutModalOpen}
          onLogout={handleSignOut}
          onClose={() => setIsLogoutModalOpen(false)}
          isPending={isLoggingOut}
        />
      )}
    </>
  );
}
