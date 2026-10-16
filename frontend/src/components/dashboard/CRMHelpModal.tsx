"use client";

import React from "react";
import {
  X,
  HelpCircle,
  BookOpen,
  CheckCircle2,
  ShieldAlert,
  BarChart2,
  PhoneCall,
  FileSpreadsheet,
} from "lucide-react";

export interface CRMHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CRMHelpModal({ isOpen, onClose }: CRMHelpModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-[#2874f0] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold leading-tight">
                CRM Assistance
              </h2>
              <p className="text-xs text-blue-100">
                Quick guides, Lead management policies, SLA standards and FAQs
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-600 dark:text-slate-300">
          {/* Section 1: Lead Management */}
          <div className="p-3.5 rounded-lg border border-blue-100 dark:border-blue-900/50 bg-[#f2f7fe] dark:bg-blue-950/20">
            <h3 className="font-bold text-sm text-[#2874f0] dark:text-blue-400 flex items-center gap-1.5 mb-1.5">
              <BookOpen className="w-4 h-4" />
              Lead & Pipeline Management Guide
            </h3>
            <p className="leading-relaxed">
              In the Lead Management view, every lead operates as a structured client
              opportunity. Track deal stage, budget estimation, SLA response timers,
              and executive assignments with end-to-end auditability.
            </p>
            <ul className="mt-2 space-y-1.5 text-slate-700 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Active Leads:</strong> Leads currently in your active sales pipeline
                  undergoing active representative engagement.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Unassigned Pool:</strong> Fresh intake leads awaiting allocation to
                  sales executives by Team Leaders.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Turnaround SLA:</strong> Target response timeline before an unattended
                  lead automatically flags for managerial escalation.
                </span>
              </li>
            </ul>
          </div>

          {/* Quick FAQ Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50">
              <div className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 mb-1">
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                Protected Deals
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Terminal deals (WON_SOLD, LOST) are protected. Only Team Leaders
                or Admins may modify them with full audit logging.
              </p>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50">
              <div className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 mb-1">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                Bulk Upload & Export
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Use the Upload console to stage Excel workbooks. The server
                validates schemas and duplicate records before ingestion.
              </p>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50">
              <div className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 mb-1">
                <PhoneCall className="w-4 h-4 text-blue-600" />
                Follow-up SLAs
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Scheduled follow-ups alert representatives automatically. Keep response
                turnarounds prompt for maximum deal conversion.
              </p>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50">
              <div className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 mb-1">
                <BarChart2 className="w-4 h-4 text-purple-600" />
                Performance & Analytics
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Explore pipeline velocity, team workload balance, and stage conversion
                trends in the Reports Hub.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-400">
            LeadFlow CRM • CRM Management Hub
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-[#2874f0] hover:bg-[#1a5bb8] text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
          >
            Got it, thanks
          </button>
        </div>
      </div>
    </div>
  );
}

// Backward-compatibility export alias
export const SellerHelpModal = CRMHelpModal;
export type SellerHelpModalProps = CRMHelpModalProps;
