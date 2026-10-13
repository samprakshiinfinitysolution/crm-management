'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Shield,
  ShieldCheck,
  Users,
  GitFork,
  BarChart3,
  ExternalLink,
  Menu,
  X,
  LayoutDashboard,
  Layers,
  UploadCloud,
  ChevronRight,
} from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { UserRole } from '@/types/api.types';
import { useAppSelector } from '@/store';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { FloatingChatWidget } from '@/components/shared/FloatingChatWidget';
import LogOutPopUp from '@/components/LogOutPopUp';
import { performLogout } from '@/lib/authService';

interface AdminNavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  exact?: boolean;
}

const adminNavItems: AdminNavItem[] = [
  {
    label: 'Overview',
    href: '/admin',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: 'Users & Access',
    href: '/admin/users',
    icon: Users,
  },
  {
    label: 'System Audit Logs',
    href: '/admin/audit-logs',
    icon: ShieldCheck,
  },
  {
    label: 'Lead Management',
    href: '/admin/leads',
    icon: Layers,
  },
  {
    label: 'Lead Distribution',
    href: '/admin/distributions',
    icon: GitFork,
  },
  {
    label: 'Reports & KPIs',
    href: '/admin/reports',
    icon: BarChart3,
  },
  {
    label: 'Imports & Intake',
    href: '/admin/imports',
    icon: UploadCloud,
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useAppSelector((state) => state.auth);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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

  // Close mobile sidebar on route change
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setIsMobileMenuOpen(false);
  }

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isMobileMenuOpen]);

  const isLinkActive = (item: AdminNavItem) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  };

  return (
    <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
        {/* Mobile Top App Bar */}
        <div className="lg:hidden sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 h-16 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                window.dispatchEvent(new CustomEvent("crm:menu-open"));
                setIsMobileMenuOpen(true);
              }}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
              aria-label="Open sidebar navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
                <Shield className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-slate-100">
                LeadFlow Admin
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle size="sm" variant="button" />
            <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
          </div>
        </div>

        {/* Mobile Backdrop */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Left Sidebar Navigation */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Brand Header */}
          <div className="h-16 px-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
            <Link href="/admin" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform">
                <Shield className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-slate-100 tracking-tight">
                    LeadFlow
                  </span>
                  <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    Admin
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  Governance & Systems
                </span>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            <div className="px-3 py-2 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Administration
            </div>

            {adminNavItems.map((item) => {
              const active = isLinkActive(item);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    active
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                        active
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 group-hover:bg-slate-200/60 dark:group-hover:bg-slate-700'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="truncate">{item.label}</span>
                  </div>

                  {active && (
                    <ChevronRight className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2 shrink-0">
            {/* Link back to CRM dashboard */}
            <Link
              href="/"
              className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <span className="flex items-center gap-2">
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                <span>Back to CRM</span>
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">Workspace</span>
            </Link>

            {/* Profile, Theme, and Signout Card */}
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {user?.name?.[0]?.toUpperCase() || 'A'}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                    {user?.name || 'Administrator'}
                  </span>
                  <span className="text-[10px] text-purple-600 dark:text-purple-400 font-medium leading-none">
                    Superuser
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <ThemeToggle size="sm" variant="button" />
                {/*<button
                  type="button"
                  onClick={() => setIsLogoutModalOpen(true)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-colors"
                  title="Sign out of LeadFlow"
                  aria-label="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>*/}
                <LogOutPopUp
                  isText={false}
                  open={isLogoutModalOpen}
                  setOpen={setIsLogoutModalOpen}
                  onLogout={handleSignOut}
                  onClose={() => setIsLogoutModalOpen(false)}
                  isPending={isLoggingOut}
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Workspace (Offset by sidebar width on lg screens) */}
        <div className="flex-1 w-full lg:pl-64 flex flex-col min-h-[90dvh] transition-all duration-300">
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <ErrorBoundary resetKeys={[pathname]}>
              {children}
              <FloatingChatWidget />
            </ErrorBoundary>
          </main>
        </div>

       
      </div>
    </ProtectedRoute>
  );
}
