"use client";

import React, { useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { UserRole } from "@/types/api.types";
import dynamic from "next/dynamic";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { usePathname } from "next/navigation";

// Code splitting: Floating help widget is loaded lazily on the client
const FloatingHelpWidget = dynamic(
  () =>
    import("@/components/dashboard/FloatingHelpWidget").then(
      (m) => m.FloatingHelpWidget
    ),
  { ssr: false }
);

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
      <div className="min-h-screen bg-[#f1f3f6] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans relative transition-colors">
        {/* Top Header - CRM Management Hub Marketplace Bar */}
        <DashboardHeader
          onToggleMobileNav={() => {
            if (!isMobileMenuOpen) {
              window.dispatchEvent(new CustomEvent("crm:menu-open"));
            }
            setIsMobileMenuOpen(!isMobileMenuOpen);
          }}
        />

        {/* Mobile Drawer Navigation */}
        <DashboardSidebar
          isOpenMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Main Content Area - Full Width Desktop Marketplace Layout */}
        <div className="flex-1 w-full pt-14 transition-all duration-200">
          <main className="w-full max-w-[1540px] mx-auto px-2 sm:px-4 lg:px-6 py-3 sm:py-4">
            <ErrorBoundary resetKeys={[pathname]}>{children}</ErrorBoundary>
          </main>
        </div>

        {/* Floating Help Button */}
        <FloatingHelpWidget />
      </div>
    </ProtectedRoute>
  );
}
