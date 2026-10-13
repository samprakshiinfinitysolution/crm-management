"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock } from "lucide-react";
import FollowUpStatsCards from "@/components/sales_executive/FollowUpStatsCards";
import FollowUpWorkQueue from "@/components/sales_executive/FollowUpWorkQueue";
import type { FollowUpScope } from "@/types/api.types";

export default function FollowUpsPage() {
  const router = useRouter();
  const [activeScope, setActiveScope] = useState<FollowUpScope>("today");

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <CalendarClock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>Customer Follow-Up Queue</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Prioritize customer conversations, meet SLAs, and prevent deal
            drop-offs
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
