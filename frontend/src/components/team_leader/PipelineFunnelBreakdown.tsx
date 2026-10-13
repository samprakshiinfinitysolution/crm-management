"use client";

import React, { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type {
  TLDashboardFunnelBreakdown,
  TLDashboardFunnelStage,
} from "@/types/api.types";

interface PipelineFunnelBreakdownProps {
  data?: TLDashboardFunnelBreakdown;
  isLoading?: boolean;
}

export default function PipelineFunnelBreakdown({
  data,
  isLoading,
}: PipelineFunnelBreakdownProps) {
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const router = useRouter();

  if (isLoading) {
    return (
      <section className="py-2">
        <div className="bg-crm-card rounded-lg p-4 border border-crm-subtle h-44 animate-pulse flex flex-col justify-between">
          <div className="flex justify-between">
            <div className="h-4 w-32 bg-crm-muted rounded"></div>
            <div className="h-4 w-20 bg-crm-muted rounded"></div>
          </div>
          <div className="w-full h-3 rounded-full bg-crm-muted"></div>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-12 bg-crm-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const defaultStages: TLDashboardFunnelStage[] = [
    {
      key: "unassigned",
      label: "Unassigned",
      count: 0,
      pct: 0,
      totalValue: 0,
      colorClass: "bg-amber-500",
      dotBg: "bg-amber-500",
    },
    {
      key: "contacted",
      label: "Contacted",
      count: 0,
      pct: 0,
      totalValue: 0,
      colorClass: "bg-blue-500",
      dotBg: "bg-blue-500",
    },
    {
      key: "followup",
      label: "In Follow-up",
      count: 0,
      pct: 0,
      totalValue: 0,
      colorClass: "bg-blue-600",
      dotBg: "bg-blue-600",
    },
    {
      key: "proposal",
      label: "Proposal",
      count: 0,
      pct: 0,
      totalValue: 0,
      colorClass: "bg-purple-500",
      dotBg: "bg-purple-500",
    },
    {
      key: "won",
      label: "Won / Sold",
      count: 0,
      pct: 0,
      totalValue: 0,
      colorClass: "bg-emerald-500",
      dotBg: "bg-emerald-500",
    },
    {
      key: "lost",
      label: "Disqualified",
      count: 0,
      pct: 0,
      totalValue: 0,
      colorClass: "bg-rose-400",
      dotBg: "bg-rose-400",
    },
  ];

  const stages =
    data?.stages && data.stages.length > 0 ? data.stages : defaultStages;
  const totalMapped =
    data?.totalMappedLeads ?? stages.reduce((sum, s) => sum + s.count, 0);

  const handleStageClick = (stage: TLDashboardFunnelStage) => {
    setSelectedStage(stage.key === selectedStage ? null : stage.key);
    toast.info(`Filtering stage: ${stage.label} (${stage.count} leads)`);
  };

  return (
    <section className="py-2">
      <div className="bg-crm-card rounded-lg p-4 border border-crm-subtle shadow-xs">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-crm-primary">
              Funnel Breakdown
            </h3>
            <span className="text-xs text-crm-muted">
              {totalMapped} active leads mapped
            </span>
          </div>
          <button
            type="button"
            onClick={() => router.push("/team_leader/reports")}
            className="text-xs font-semibold text-crm-brand hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View Reports</span>
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Multi-segment pipeline status bar */}
        <div className="w-full h-3 rounded-full bg-crm-muted flex overflow-hidden my-3">
          {stages.map((stage) => (
            <div
              key={stage.key}
              className={`${stage.colorClass} h-full transition-opacity cursor-pointer ${
                selectedStage && selectedStage !== stage.key
                  ? "opacity-30"
                  : "opacity-100"
              }`}
              style={{
                width: `${Math.max(stage.pct, stage.count > 0 ? 3 : 0)}%`,
              }}
              title={`${stage.label}: ${stage.count} (${stage.pct}%)`}
              onClick={() => handleStageClick(stage)}
            />
          ))}
        </div>

        {/* Legend Pill Grid */}
        <div className="grid grid-cols-3 gap-2 pt-1 text-left">
          {stages.map((stage) => (
            <button
              key={stage.key}
              type="button"
              onClick={() => handleStageClick(stage)}
              className={`p-2 rounded-lg text-left transition-all border cursor-pointer ${
                selectedStage === stage.key
                  ? "border-blue-600 bg-blue-50/50 shadow-xs"
                  : "border-crm-subtle bg-crm-subtle hover:bg-crm-muted"
              }`}
            >
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-crm-secondary uppercase tracking-wider">
                <span className={`w-2 h-2 rounded-full ${stage.dotBg}`}></span>
                <span className="truncate">{stage.label}</span>
              </div>
              <div className="text-sm font-bold text-crm-primary mt-1">
                {stage.count}{" "}
                <span className="font-normal text-crm-muted text-xs">
                  ({stage.pct}%)
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
