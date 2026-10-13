"use client";

import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  GitFork,
  Upload,
  BarChart3,
  Users,
  ChevronRight,
  ChevronLeft,
  Compass,
} from "lucide-react";
import { useAppDispatch, useAppSelector, setActiveTab } from "@/store";
import { useRouter, usePathname } from "next/navigation";

interface NavItem {
  id: string;
  label: string;
  description: string;
  link?: string;
  icon: React.ElementType;
  badge?: string;
}

export default function TLBottomNav({
  className = "",
}: {
  className?: string;
}) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const activeTab = useAppSelector((state) => state.ui.activeTab);

  // Expanded slider state for desktop
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const tabs: NavItem[] = [
    {
      id: "overview",
      label: "Overview",
      description: "Supervisor command center & KPIs",
      link: "/team_leader",
      icon: LayoutDashboard,
    },
    {
      id: "distribute",
      label: "Distribute",
      description: "Lead allocation & quota engine",
      link: "/team_leader/distribute",
      icon: GitFork,
      badge: "Action",
    },
    {
      id: "intake",
      label: "Intake",
      description: "Staged Excel import & ingestion",
      link: "/team_leader/intake",
      icon: Upload,
    },
    {
      id: "sales_pipeline",
      label: "Sales Team",
      description: "Executives directory & quotas",
      link: "/team_leader/users",
      icon: Users,
    },
    {
      id: "reports",
      label: "Reports",
      description: "Analytics & conversion matrix",
      link: "/team_leader/reports",
      icon: BarChart3,
    },
  ];

  // Auto-sync active tab from pathname
  useEffect(() => {
    if (pathname.includes("/intake")) {
      dispatch(setActiveTab("intake"));
    } else if (pathname.includes("/distribute")) {
      dispatch(setActiveTab("distribute"));
    } else if (pathname.includes("/sales_executives")) {
      dispatch(setActiveTab("sales_pipeline"));
    } else if (pathname.includes("/reports")) {
      dispatch(setActiveTab("reports"));
    } else if (pathname === "/team_leader" || pathname === "/team_leader/") {
      dispatch(setActiveTab("overview"));
    }
  }, [pathname, dispatch]);

  const handleTabClick = (tab: NavItem) => {
    dispatch(setActiveTab(tab.id));

    if (tab.link) {
      router.push(tab.link);
    }
  };

  const isSliderOpen = isExpanded || isHovered;

  return (
    <>
      {/* =========================================================================
          DESKTOP & TABLET: Floating Left Slider / Dock Navigation (md and up)
         ========================================================================= */}
      <aside
        aria-label="Team Leader Navigation"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`hidden md:flex fixed left-5 top-1/2 -translate-y-1/2 z-40 flex-col transition-all duration-300 ease-in-out ${
          isSliderOpen ? "w-60" : "w-16"
        } ${className}`}
      >
        <div className="relative flex flex-col bg-card/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-2.5 shadow-2xl shadow-indigo-950/10 overflow-visible">
          {/* Header & Toggle Slider Button */}
          <div className="flex items-center justify-between px-2 py-2 mb-1 border-b border-slate-100 dark:border-slate-800">
            <div
              className={`flex items-center gap-2 overflow-hidden transition-all duration-300 ${
                isSliderOpen ? "opacity-100 max-w-full" : "opacity-0 max-w-0"
              }`}
            >
              <div className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600">
                <Compass className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 tracking-tight whitespace-nowrap">
                Navigation
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? "Collapse Sidebar" : "Pin Open Sidebar"}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-card dark:hover:bg-slate-800 transition-colors mx-auto"
            >
              {isSliderOpen ? (
                <ChevronLeft className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Navigation Items List */}
          <nav className="flex flex-col gap-1.5 py-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive =
                activeTab === tab.id ||
                (tab.link &&
                  (pathname === tab.link ||
                    (tab.link !== "/team_leader" &&
                      pathname.startsWith(tab.link))));

              return (
                <div key={tab.id} className="relative group/item">
                  <button
                    type="button"
                    onClick={() => handleTabClick(tab)}
                    className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 active:scale-[0.98] ${
                      isActive
                        ? "bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/25"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-card/80 dark:hover:bg-slate-800/80"
                    }`}
                  >
                    {/* Active Floating Pill Indicator */}
                    {isActive && (
                      <span className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-card rounded-full shadow-sm" />
                    )}

                    <div className="flex items-center justify-center w-6 h-6 shrink-0">
                      <Icon
                        className={`w-5 h-5 transition-transform duration-200 group-hover/item:scale-110 ${
                          isActive
                            ? "text-white"
                            : "text-slate-500 dark:text-slate-400 group-hover/item:text-indigo-600"
                        }`}
                      />
                    </div>

                    {/* Label & Description (Visible when slider expands) */}
                    <div
                      className={`flex flex-col min-w-0 transition-all duration-200 ${
                        isSliderOpen
                          ? "opacity-100 translate-x-0 w-auto"
                          : "opacity-0 -translate-x-2 w-0 overflow-hidden pointer-events-none"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold tracking-tight whitespace-nowrap truncate">
                          {tab.label}
                        </span>
                        {tab.badge && (
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase ${
                              isActive
                                ? "bg-card/20 text-white"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                            }`}
                          >
                            {tab.badge}
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-[10px] truncate max-w-35 ${
                          isActive
                            ? "text-indigo-100"
                            : "text-slate-400 dark:text-slate-500"
                        }`}
                      >
                        {tab.description}
                      </span>
                    </div>
                  </button>

                  {/* Floating Tooltip (Visible on Hover when slider is Collapsed) */}
                  {!isSliderOpen && (
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3.5 px-3 py-1.5 bg-slate-900 text-white text-xs rounded-lg shadow-xl whitespace-nowrap pointer-events-none opacity-0 translate-x-1 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all duration-150 z-50 flex items-center gap-1.5 border border-slate-700">
                      <span className="font-semibold">{tab.label}</span>
                      {tab.badge && (
                        <span className="text-[9px] bg-amber-400/20 text-amber-300 px-1 rounded font-bold">
                          {tab.badge}
                        </span>
                      )}
                      {/* Tooltip triangle arrow */}
                      <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-900 rotate-45 border-l border-b border-slate-700" />
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Quick status pill at the bottom of slider */}
          <div
            className={`mt-1 pt-2 border-t border-slate-100 dark:border-slate-800 transition-all duration-200 ${
              isSliderOpen
                ? "opacity-100 px-2"
                : "opacity-0 h-0 overflow-hidden p-0"
            }`}
          >
            <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="truncate">TL Console Active</span>
            </div>
          </div>
        </div>
      </aside>

      {/* =========================================================================
          MOBILE: Floating Bottom Dock Navigation (< md screens)
         ========================================================================= */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-md bg-card/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 rounded-lg px-2 py-1.5 shadow-2xl shadow-slate-950/15 flex items-center justify-around"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            activeTab === tab.id ||
            (tab.link &&
              (pathname === tab.link ||
                (tab.link !== "/team_leader" &&
                  pathname.startsWith(tab.link))));

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabClick(tab)}
              className={`flex flex-col items-center justify-center min-w-14 h-12 gap-1 rounded-lg transition-all duration-150 active:scale-90 ${
                isActive
                  ? "text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50/80 dark:bg-indigo-950/40"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 font-medium"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
