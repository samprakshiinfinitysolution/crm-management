"use client";

import React from "react";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { TLDashboardCriticalEscalation } from "@/types/api.types";

interface CriticalEscalationsProps {
  deals?: TLDashboardCriticalEscalation[];
  isLoading?: boolean;
}

export default function CriticalEscalations({
  deals,
  isLoading,
}: CriticalEscalationsProps) {
  const router = useRouter();

  const handleNudge = (deal: TLDashboardCriticalEscalation) => {
    toast.info(
      `Sent escalation notice to ${deal.ownerName} regarding ${deal.companyName}`,
    );
  };

  const handleReassign = () => {
    router.push("/dashboard/distributions/create");
  };

  if (isLoading) {
    return (
      <section className="py-2">
        <div className="bg-crm-card rounded-lg p-4 border border-crm-subtle h-32 animate-pulse"></div>
      </section>
    );
  }

  const items = deals || [];

  if (items.length === 0) {
    return (
      <section className="py-1">
        <div className="bg-crm-card rounded-lg p-3.5 sm:p-4 border border-crm-subtle shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-crm-primary">
                  Critical Escalations
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                  Zero SLA breaches detected. All follow-ups are on schedule.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 tracking-wide">
              0 OVERDUE
            </span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-1">
      <div className="bg-crm-card rounded-lg p-3.5 sm:p-4 border border-crm-subtle shadow-xs">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-crm-danger text-crm-danger flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-crm-primary">
              Critical Overdue Escalations
            </h3>
          </div>
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-crm-danger text-crm-danger tracking-wide">
            {items.length} CRITICAL
          </span>
        </div>

        {/* Deals list */}
        <div className="flex flex-col gap-2.5">
          {items.map((deal) => (
            <div
              key={deal.id}
              className="p-3 rounded-lg bg-crm-subtle border border-crm-subtle flex flex-col gap-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-xs font-bold text-crm-primary">
                    {deal.companyName}
                    <span className="text-[10px] text-crm-muted font-normal ml-1.5">
                      ({deal.leadCode})
                    </span>
                  </div>
                  <div className="text-[11px] text-crm-muted">
                    {deal.stageInfo} •{" "}
                    <span className="font-semibold text-crm-secondary">
                      {deal.formattedArrAmount || `₹${deal.arrAmount}`}
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-crm-danger text-crm-danger text-[10px] font-bold">
                  {deal.overdueHours}H OVERDUE
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-crm-subtle">
                <span className="text-crm-muted">
                  Owner:{" "}
                  <span className="font-semibold text-crm-primary">
                    {deal.ownerName}
                  </span>
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleNudge(deal)}
                    className="px-2.5 py-1 rounded-lg bg-crm-muted hover:bg-card/70 text-crm-secondary font-semibold text-xs active:scale-95 transition-all cursor-pointer"
                  >
                    Nudge
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReassign()}
                    className="px-2.5 py-1 rounded-lg bg-crm-dark hover:bg-crm-dark-hover text-crm-inverse font-semibold text-xs active:scale-95 transition-all cursor-pointer"
                  >
                    Reassign
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
