"use client";

import React from "react";
import Link from "next/link";
import {
  ChevronRight,
  AlertCircle,
  TrendingDown,
  RotateCcw,
  Sparkles,
  Bell,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export interface DashboardNotificationItem {
  id: string;
  title: string;
  createdAt: string;
  isRead?: boolean;
  link?: string;
}

export interface CRMDashboardInsightsProps {
  notifications?: DashboardNotificationItem[];
  criticalEscalationsCount?: number;
  criticalEscalationsReason?: string;
  pipelineAtRiskValue?: string | number;
  unassignedLeadsCount?: number;
  activeNegotiationsCount?: number;
  slaAdherencePercent?: number;
  wonDealsCount?: number;
  conversionRate?: number;
  isSE?: boolean;
  todayFollowUpsCount?: number;
  overdueFollowUpsCount?: number;
}

export function CRMDashboardInsights({
  notifications = [],
  criticalEscalationsCount = 0,
  criticalEscalationsReason,
  pipelineAtRiskValue = 0,
  unassignedLeadsCount = 0,
  activeNegotiationsCount = 0,
  slaAdherencePercent = 95,
  wonDealsCount = 0,
  conversionRate = 0,
  isSE = false,
  todayFollowUpsCount = 0,
  overdueFollowUpsCount = 0,
}: CRMDashboardInsightsProps) {
  const displayNotifications = notifications.slice(0, 2);

  const formatShortDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "Today";
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return "Today";
    }
  };

  const formattedLoss =
    typeof pipelineAtRiskValue === "number"
      ? `₹${pipelineAtRiskValue.toLocaleString("en-IN")}`
      : pipelineAtRiskValue || "₹0";

  const effectiveEscalationCount = isSE ? overdueFollowUpsCount : criticalEscalationsCount;

  return (
    <div className="space-y-2">
      {/* 5 Insight Cards in a responsive grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
        {/* Card 1: Operational Alerts & Notifications */}
        <div className="bg-card dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 rounded-sm p-3.5 flex flex-col justify-between shadow-2xs hover:shadow-xs transition-all">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-100 mb-2.5">
              <span className="flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-[#2874f0]" />
                <span>Operational Alerts</span>
              </span>
              {displayNotifications.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-[#eaf4fe] text-[#2874f0] border border-blue-200 text-[10px] font-bold font-mono">
                  {notifications.length}
                </span>
              )}
            </div>

            <div className="space-y-2">
              {displayNotifications.length === 0 ? (
                <div className="p-2.5 rounded-sm bg-white dark:bg-slate-800/60 border border-[#e0e0e0] dark:border-slate-800 text-[11px] text-slate-500">
                  <p className="flex items-center gap-1.5 text-[#2874f0] font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2874f0] shrink-0" />
                    <span>All alerts handled</span>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    No unread operational notifications
                  </p>
                </div>
              ) : (
                displayNotifications.map((notif) => (
                  <Link
                    key={notif.id}
                    href={notif.link || "/dashboard/notifications"}
                    className="block p-2 rounded-sm bg-white dark:bg-slate-800/60 border border-[#e0e0e0] dark:border-slate-800 hover:border-[#2874f0] transition-colors group"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-700 dark:text-slate-300">
                      <span className="truncate pr-1 font-medium">
                        {notif.title}
                      </span>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 shrink-0">
                        <span>{formatShortDate(notif.createdAt)}</span>
                        <ChevronRight className="w-3 h-3 text-[#2874f0] group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-[#e0e0e0] dark:border-slate-800">
            <Link
              href="/dashboard/notifications"
              className="text-xs font-semibold text-[#2874f0] dark:text-blue-400 hover:underline flex items-center justify-between"
            >
              <span>View All Alerts</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#2874f0]" />
            </Link>
          </div>
        </div>

        {/* Card 2: SLA Adherence & Escalations Radar */}
        <div className="bg-card dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 rounded-sm p-3.5 flex flex-col justify-between shadow-2xs hover:shadow-xs transition-all">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-100 mb-2">
              <span>SLA & Escalation Radar</span>
              <span className="px-1.5 py-0.2 rounded-xs bg-[#2874f0] text-white text-[9px] font-bold uppercase">
                Active
              </span>
            </div>

            {effectiveEscalationCount > 0 ? (
              <>
                <div className="flex items-start gap-2 text-[11px] text-slate-700 dark:text-slate-300 mt-1">
                  <AlertCircle className="w-4 h-4 text-[#2874f0] shrink-0 mt-0.5" />
                  <p className="leading-snug">
                    <strong className="text-slate-900 dark:text-slate-100">{effectiveEscalationCount} Leads</strong>{" "}
                    {isSE
                      ? "require urgent follow-up action due to overdue scheduled callbacks."
                      : criticalEscalationsReason || "require SLA escalation due to overdue representative follow-up."}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 mt-2.5 text-[11px] text-[#2874f0] font-semibold">
                  <TrendingDown className="w-3.5 h-3.5 text-[#2874f0]" />
                  <span>{isSE ? "Follow-up backlog at risk" : `Pipeline at risk: ${formattedLoss}`}</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start gap-2 text-[11px] text-slate-700 dark:text-slate-300 mt-1">
                  <ShieldCheck className="w-4 h-4 text-[#2874f0] shrink-0 mt-0.5" />
                  <p className="leading-snug">
                    <strong className="text-slate-900 dark:text-slate-100">Zero Breaches</strong>: All scheduled interactions and lead follow-ups are within standard SLA thresholds.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 mt-2.5 text-[11px] text-[#2874f0] font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2874f0]" />
                  <span>Turnaround compliance at {slaAdherencePercent}%</span>
                </div>
              </>
            )}
          </div>

          <div className="mt-3 pt-2 border-t border-[#e0e0e0] dark:border-slate-800">
            <Link
              href="/dashboard/follow-ups"
              className="text-xs font-semibold text-[#2874f0] dark:text-blue-400 hover:underline flex items-center justify-between"
            >
              <span>View Overdue Queue</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#2874f0]" />
            </Link>
          </div>
        </div>

        {/* Card 3: Lead Pool & Allocation Pipeline (or My Assigned Pipeline for SE) */}
        <div className="bg-card dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 rounded-sm p-3.5 flex flex-col justify-between shadow-2xs hover:shadow-xs transition-all">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-100 mb-2">
              <span>{isSE ? "My Pipeline & Queue" : "Intake Pool & Allocation"}</span>
              <span className="px-1.5 py-0.2 rounded-xs bg-[#2874f0] text-white text-[9px] font-bold uppercase">
                Queue
              </span>
            </div>

            <div className="space-y-1.5 text-[11px] text-slate-700 dark:text-slate-300">
              <Link
                href={isSE ? "/dashboard/my-leads" : "/dashboard/distributions/create"}
                className="flex items-center justify-between py-1 px-1.5 rounded-sm hover:bg-white/80 dark:hover:bg-slate-800/50 transition-colors group"
              >
                <div className="flex items-center gap-1.5">
                  <span className="font-bold font-mono text-[#2874f0]">
                    {unassignedLeadsCount}
                  </span>
                  <span>{isSE ? "New assigned leads pending contact" : "Unassigned leads in intake pool"}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#2874f0] group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                href={isSE ? "/dashboard/my-leads" : "/dashboard/leads"}
                className="flex items-center justify-between py-1 px-1.5 rounded-sm hover:bg-white/80 dark:hover:bg-slate-800/50 transition-colors group"
              >
                <div className="flex items-center gap-1.5">
                  <span className="font-bold font-mono text-[#2874f0]">
                    {activeNegotiationsCount}
                  </span>
                  <span>In-flight active negotiations</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#2874f0] group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                href={isSE ? "/dashboard/my-leads" : "/dashboard/reports"}
                className="flex items-center justify-between py-1 px-1.5 rounded-sm hover:bg-white/80 dark:hover:bg-slate-800/50 transition-colors group"
              >
                <div className="flex items-center gap-1.5">
                  <span className="font-bold font-mono text-[#2874f0]">
                    {conversionRate}%
                  </span>
                  <span>{isSE ? "Personal win rate benchmark" : "Conversion win rate benchmark"}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#2874f0] group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-[#e0e0e0] dark:border-slate-800">
            {isSE ? (
              <Link
                href="/dashboard/my-leads"
                className="text-xs font-semibold text-[#2874f0] dark:text-blue-400 hover:underline flex items-center justify-between"
              >
                <span>View My Assigned Leads</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#2874f0]" />
              </Link>
            ) : (
              <Link
                href="/dashboard/distributions/create"
                className="text-xs font-semibold text-[#2874f0] dark:text-blue-400 hover:underline flex items-center justify-between"
              >
                <span>Distribute Leads</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#2874f0]" />
              </Link>
            )}
          </div>
        </div>

        {/* Card 4: Team Workload & Staff Velocity (or Follow-up Queue for SE) */}
        <div className="bg-card dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 rounded-sm p-3.5 flex flex-col justify-between shadow-2xs hover:shadow-xs transition-all">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-100 mb-2">
              <RotateCcw className="w-3.5 h-3.5 text-[#2874f0]" />
              <span>{isSE ? "Follow-up & Activity Queue" : "Workload & Response Velocity"}</span>
            </div>

            <div className="space-y-2 mt-2 text-[11px]">
              {isSE ? (
                <>
                  <Link
                    href="/dashboard/follow-ups"
                    className="flex items-center justify-between py-1.5 px-2 rounded-sm bg-white dark:bg-slate-800/60 border border-[#e0e0e0] dark:border-slate-800 hover:border-[#2874f0] transition-colors group"
                  >
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      Due Today Follow-ups
                    </span>
                    <span className="text-[#2874f0] font-semibold flex items-center gap-0.5 font-mono">
                      {todayFollowUpsCount} tasks
                      <ChevronRight className="w-3 h-3 text-[#2874f0] group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </Link>

                  <Link
                    href="/dashboard/follow-ups"
                    className="flex items-center justify-between py-1.5 px-2 rounded-sm bg-white dark:bg-slate-800/60 border border-[#e0e0e0] dark:border-slate-800 hover:border-[#2874f0] transition-colors group"
                  >
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      SLA Response Window
                    </span>
                    <span className="text-[#2874f0] font-semibold flex items-center gap-0.5 font-mono">
                      {slaAdherencePercent}% rate
                      <ChevronRight className="w-3 h-3 text-[#2874f0] group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/dashboard/reports/performance"
                    className="flex items-center justify-between py-1.5 px-2 rounded-sm bg-white dark:bg-slate-800/60 border border-[#e0e0e0] dark:border-slate-800 hover:border-[#2874f0] transition-colors group"
                  >
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      Improve Response SLA
                    </span>
                    <span className="text-[#2874f0] font-semibold flex items-center gap-0.5 font-mono">
                      {slaAdherencePercent}% rate
                      <ChevronRight className="w-3 h-3 text-[#2874f0] group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </Link>

                  <Link
                    href="/dashboard/distributions"
                    className="flex items-center justify-between py-1.5 px-2 rounded-sm bg-white dark:bg-slate-800/60 border border-[#e0e0e0] dark:border-slate-800 hover:border-[#2874f0] transition-colors group"
                  >
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      Rebalance Team Workload
                    </span>
                    <span className="text-[#2874f0] font-semibold flex items-center gap-0.5">
                      Reassign
                      <ChevronRight className="w-3 h-3 text-[#2874f0] group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-[#e0e0e0] dark:border-slate-800">
            {isSE ? (
              <Link
                href="/dashboard/follow-ups"
                className="text-xs font-semibold text-[#2874f0] dark:text-blue-400 hover:underline flex items-center justify-between"
              >
                <span>Open Follow-up Workspace</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#2874f0]" />
              </Link>
            ) : (
              <Link
                href="/dashboard/reports/performance"
                className="text-xs font-semibold text-[#2874f0] dark:text-blue-400 hover:underline flex items-center justify-between"
              >
                <span>View Executive Scorecards</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#2874f0]" />
              </Link>
            )}
          </div>
        </div>

        {/* Card 5: High-Value Deals & Fast Turnaround */}
        <div className="bg-card dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 rounded-sm p-3.5 flex flex-col justify-between shadow-2xs hover:shadow-xs transition-all relative">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-100 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#2874f0]" />
              <span>Conversion Accelerators</span>
            </div>

            <div className="space-y-2 mt-2 text-[11px]">
              <Link
                href={isSE ? "/dashboard/my-leads" : "/dashboard/reports/leads"}
                className="flex items-center justify-between py-1.5 px-2 rounded-sm bg-white dark:bg-slate-800/60 border border-[#e0e0e0] dark:border-slate-800 hover:border-[#2874f0] transition-colors group"
              >
                <span className="font-medium text-slate-700 dark:text-slate-200 truncate">
                  {wonDealsCount > 0 ? `${wonDealsCount} Won Deals Closed` : "High-Value Opportunities"}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-[#2874f0] group-hover:translate-x-0.5 transition-transform shrink-0" />
              </Link>

              <Link
                href="/dashboard/follow-ups"
                className="flex items-center justify-between py-1.5 px-2 rounded-sm bg-white dark:bg-slate-800/60 border border-[#e0e0e0] dark:border-slate-800 hover:border-[#2874f0] transition-colors group"
              >
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  Priority Follow-up Queue
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-[#2874f0] group-hover:translate-x-0.5 transition-transform shrink-0" />
              </Link>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-[#e0e0e0] dark:border-slate-800">
            {isSE ? (
              <Link
                href="/dashboard/my-leads"
                className="text-xs font-semibold text-[#2874f0] dark:text-blue-400 hover:underline flex items-center justify-between"
              >
                <span>View Won Portfolio</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#2874f0]" />
              </Link>
            ) : (
              <Link
                href="/dashboard/reports/leads"
                className="text-xs font-semibold text-[#2874f0] dark:text-blue-400 hover:underline flex items-center justify-between"
              >
                <span>View Lead Funnel</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#2874f0]" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Slider / Carousel Indicator Bar */}
      <div className="flex items-center justify-center pt-1 pb-1">
        <div className="w-12 h-1 bg-[#2874f0] rounded-full" />
      </div>
    </div>
  );
}

// Backward-compatibility export alias
export const FlipkartDashboardInsights = CRMDashboardInsights;
export type FlipkartDashboardInsightsProps = CRMDashboardInsightsProps;
