"use client";

import React from "react";
import {
  CheckSquare,
  Square,
  Users,
  ArrowRight,
  Clock,
  Globe,
} from "lucide-react";
import { LeadItem } from "@/types/api.types";

interface LeadCardStreamProps {
  leads: LeadItem[];
  selectedLeadIds: string[];
  onToggleLead: (id: string) => void;
  onSelectTop30: () => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onAdvanceToStep2?: () => void;
  activeRepsCount: number;
}

export const LeadCardStream: React.FC<LeadCardStreamProps> = ({
  leads = [],
  selectedLeadIds = [],
  onToggleLead,
  onSelectTop30,
  onSelectAll,
  onClearSelection,
  onAdvanceToStep2,
  activeRepsCount = 4,
}) => {
  const selectedCount = selectedLeadIds.length;
  const equalSplitPerRep = Math.floor(
    selectedCount / Math.max(1, activeRepsCount),
  );

  const totalSelectedEstValue = React.useMemo(() => {
    let sum = 0;
    let hasValue = false;
    leads.forEach((l) => {
      if (selectedLeadIds.includes(l.id) && l.budget) {
        const val =
          typeof l.budget === "number"
            ? l.budget
            : parseFloat(String(l.budget).replace(/[^0-9.]/g, ""));
        if (!isNaN(val) && val > 0) {
          sum += val;
          hasValue = true;
        }
      }
    });
    if (!hasValue || sum === 0) return null;
    if (sum >= 10000000) return `₹${(sum / 10000000).toFixed(2)}Cr`;
    if (sum >= 100000) return `₹${(sum / 100000).toFixed(1)}L`;
    return `₹${sum.toLocaleString("en-IN")}`;
  }, [leads, selectedLeadIds]);

  return (
    <div className="space-y-3.5">
      {/* Selection Control Bar */}
      <div className="flex items-center justify-between px-1 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Selected: {selectedCount} Leads
          </span>
          {totalSelectedEstValue && (
            <span className="text-slate-400 font-medium">
              · Est. value: {totalSelectedEstValue}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs font-semibold text-blue-600 dark:text-blue-400">
          <button
            type="button"
            onClick={onSelectTop30}
            className="hover:underline cursor-pointer"
          >
            Top 30
          </button>
          <button
            type="button"
            onClick={onSelectAll}
            className="hover:underline cursor-pointer"
          >
            Select All ({leads.length})
          </button>
          <button
            type="button"
            onClick={onClearSelection}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Next Step 2 Setup Callout Prompt */}
      {onAdvanceToStep2 && (
        <div
          onClick={onAdvanceToStep2}
          className="flex items-center justify-between p-3.5 rounded-lg bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 cursor-pointer hover:bg-blue-100/60 transition-all group shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-950 dark:text-blue-200">
                  Next: Step 2 Setup
                </span>
                <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-blue-200/80 dark:bg-blue-900 text-blue-900 dark:text-blue-200">
                  {activeRepsCount} Active Reps
                </span>
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Assign via Equally leads distribute ({equalSplitPerRep}/rep),
                Custom lead distribution, or Direct Manual ➔
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
        </div>
      )}

      {/* Stream Header & Sort */}
      <div className="flex items-center justify-between pt-1 pb-1">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
          Lead Selection Queue ({selectedCount} of {leads.length} Selected)
        </h3>
        <span className="text-[11px] font-semibold uppercase text-blue-600 dark:text-blue-400 tracking-wider cursor-pointer hover:underline">
          Sort: Budget High-Low ▾
        </span>
      </div>

      {/* High-Fidelity Lead Card Stream List */}
      <div className="space-y-2.5">
        {leads.map((lead) => {
          const isSelected = selectedLeadIds.includes(lead.id);

          return (
            <div
              key={lead.id}
              onClick={() => onToggleLead(lead.id)}
              className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 rounded-lg border transition-all cursor-pointer ${
                isSelected
                  ? "bg-blue-50/40 dark:bg-blue-950/20 border-blue-400 dark:border-blue-800 shadow-xs"
                  : "bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              {/* Checkbox + Info */}
              <div className="flex items-start sm:items-center gap-3.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleLead(lead.id);
                  }}
                  className="mt-0.5 sm:mt-0 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                >
                  {isSelected ? (
                    <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <Square className="w-5 h-5" />
                  )}
                </button>

                {/* Avatar Initials */}
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold flex items-center justify-center text-xs shrink-0 border border-slate-200/60 dark:border-slate-700">
                  {lead.customerName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>

                {/* Lead Name & Details */}
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {lead.customerName}
                    </span>
                    {lead.priority === "URGENT" && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300">
                        URGENT
                      </span>
                    )}
                    {lead.priority === "HIGH" && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                        HIGH PRIORITY
                      </span>
                    )}
                    {lead.priority === "MEDIUM" && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        MEDIUM
                      </span>
                    )}
                    {lead.productService && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 uppercase">
                        {lead.productService}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-200 font-medium">
                    {[
                      lead.companyName,
                      [lead.city, lead.state].filter(Boolean).join(", "),
                    ]
                      .filter(Boolean)
                      .join(" · ") || "No company/location provided"}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-600 dark:text-slate-300 font-medium pt-1">
                    {(lead.leadSource || lead.source) && (
                      <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-200">
                        <Globe className="w-3 h-3" />
                        {lead.leadSource || lead.source}
                      </span>
                    )}
                    {lead.createdAt && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Financial Budget (Right) */}
              <div className="text-right pt-2 sm:pt-0 pl-11 sm:pl-0">
                <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                  {lead.budget
                    ? typeof lead.budget === "number"
                      ? `₹${lead.budget.toLocaleString("en-IN")}`
                      : String(lead.budget)
                    : "—"}
                </div>
                <span className="text-[11px] uppercase tracking-wider text-slate-700 dark:text-slate-200 font-semibold">
                  Budget
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
