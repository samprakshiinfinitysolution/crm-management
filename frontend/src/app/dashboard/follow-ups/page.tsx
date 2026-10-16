"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ChevronRight, Info, Calendar } from "lucide-react";
import FollowUpStatsCards from "@/components/sales_executive/FollowUpStatsCards";
import FollowUpWorkQueue from "@/components/sales_executive/FollowUpWorkQueue";
import type { FollowUpScope } from "@/types/api.types";

export default function FollowUpsPage() {
  const router = useRouter();
  const [activeScope, setActiveScope] = useState<FollowUpScope>("today");

  return (
    <div className="space-y-4 animate-in fade-in duration-150 select-none pb-12">
      {/* Breadcrumb Navigation matching CRM Management Hub */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
        <Link
          href="/dashboard"
          className="text-[#2874f0] hover:underline font-medium"
        >
          Home
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <Link
          href="/dashboard/my-leads"
          className="text-[#2874f0] hover:underline font-medium"
        >
          My Assigned Leads
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <span className="text-slate-700 dark:text-slate-300 font-medium">
          Customer Follow-Up Queue
        </span>
      </div>

      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e0e0e0] dark:border-slate-800 pb-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#2874f0]" />
            <span>Customer Follow-Up Queue</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Prioritize customer conversations, meet SLAs, and prevent deal
            drop-offs
          </p>
        </div>

        <Link
          href="/dashboard/my-leads"
          className="h-8 px-3 rounded-sm bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors self-start sm:self-auto shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to My Leads</span>
        </Link>
      </div>

      {/* Marketplace Guidance Notice Banner */}
      <div className="px-4 py-3 bg-[#eaf4fe] dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-sm flex items-start gap-3 text-xs">
        <Info className="w-4 h-4 text-[#2874f0] shrink-0 mt-0.5" />
        <div className="space-y-0.5 text-slate-700 dark:text-slate-300">
          <p className="font-semibold text-slate-900 dark:text-white">
            SLA Compliance & Task Execution
          </p>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
            Overdue tasks affect team SLA benchmarks. Complete customer calls,
            meetings, or emails and immediately log outcome notes to advance
            pipeline progression.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <FollowUpStatsCards
        activeScope={activeScope}
        onScopeSelect={(scope) => setActiveScope(scope)}
      />

      {/* Work Queue */}
      <FollowUpWorkQueue
        scope={activeScope}
        onScopeChange={(scope) => setActiveScope(scope)}
        onSelectLead={(leadId) => router.push(`/dashboard/leads/${leadId}`)}
      />
    </div>
  );
}
