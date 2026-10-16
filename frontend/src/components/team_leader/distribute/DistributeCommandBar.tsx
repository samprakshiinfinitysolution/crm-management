"use client";

import React from "react";
import { ArrowLeft, Check, Loader2 } from "lucide-react";

interface DistributeCommandBarProps {
  summaryText: string;
  onBack: () => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
  isValid?: boolean;
  confirmLabel?: string;
}

export const DistributeCommandBar: React.FC<DistributeCommandBarProps> = ({
  summaryText,
  onBack,
  onConfirm,
  isSubmitting = false,
  isValid = true,
  confirmLabel = "Confirm Distribution",
}) => {
  return (
    <div className="sticky bottom-0 z-20 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs border border-[#e0e0e0] dark:border-slate-800 rounded-sm p-3 sm:p-3.5 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4">
      {/* Left: Summary Text */}
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#2874f0] animate-pulse" />
        <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">
          {summaryText}
        </span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2.5 self-end sm:self-auto">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="h-8.5 px-3.5 rounded-sm border border-[#e0e0e0] dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={onConfirm}
          disabled={!isValid || isSubmitting}
          className="h-8.5 px-5 rounded-sm bg-[#2874f0] hover:bg-[#1a5bb8] disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white font-bold text-xs uppercase tracking-wide flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>PROCESSING...</span>
            </>
          ) : (
            <>
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{confirmLabel}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
