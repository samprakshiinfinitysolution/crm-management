"use client";

import React from "react";
import { Download, UserCheck, RotateCcw, X } from "lucide-react";

interface LeadsBulkActionBarProps {
  selectedCount: number;
  isTL: boolean;
  onExport: () => void;
  onReassign?: () => void;
  onRecall?: () => void;
  onClear: () => void;
  onStatusChange?: () => void;
}

export function LeadsBulkActionBar({
  selectedCount,
  isTL,
  onExport,
  onReassign,
  onRecall,
  onClear,
  onStatusChange,
}: LeadsBulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-card text-accent-foreground px-5 py-3 rounded-lg shadow-2xl flex items-center gap-4 border border-brand-primary animate-in slide-in-from-bottom-5 duration-200">
      <div className="flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">
          {selectedCount}
        </span>
        <span className="text-xs font-semibold text-muted-foreground">
          Leads Selected
        </span>
      </div>

      <div className="h-4 w-px bg-slate-700" />

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onExport}
          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Selected ({selectedCount})</span>
        </button>

        {onStatusChange && (
          <button
            type="button"
            onClick={onStatusChange}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-[12px] text-wrap font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Update Status</span>
          </button>
        )}

        {isTL && (
          <>
            {onReassign && (
              <button
                type="button"
                onClick={onReassign}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Reassign</span>
              </button>
            )}

            {onRecall && (
              <button
                type="button"
                onClick={onRecall}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Recall to Pool</span>
              </button>
            )}
          </>
        )}

        <button
          type="button"
          onClick={onClear}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          title="Clear Selection"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
