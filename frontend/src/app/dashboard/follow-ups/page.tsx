"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import FollowUpStatsCards from "@/components/sales_executive/FollowUpStatsCards";
import FollowUpWorkQueue from "@/components/sales_executive/FollowUpWorkQueue";
import { PageHeader } from "@/components/shared/PageHeader";
import type { FollowUpScope } from "@/types/api.types";

export default function FollowUpsPage() {
  const router = useRouter();
  const [activeScope, setActiveScope] = useState<FollowUpScope>("today");

  return (
    <div className="flex flex-col gap-3.5">
      {/* Header */}
      <PageHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Follow-Ups" },
        ]}
        title="Customer Follow-Up Queue"
        description="Prioritize customer conversations, meet SLAs, and prevent deal drop-offs."
      />

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
