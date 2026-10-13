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
    <div className="sticky bottom-0 z-20 w-full bg-card/95 backdrop-blur-xs border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 sm:p-4 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4">
      {/* Left: Summary Text */}
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
        <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100">
          {summaryText}
        </span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2.5 self-end sm:self-auto">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs sm:text-sm font-medium transition-colors cursor-pointer disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={onConfirm}
          disabled={!isValid || isSubmitting}
          className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-500 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{confirmLabel}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

