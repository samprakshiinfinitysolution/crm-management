"use client";

import React from "react";
import { Database, UploadCloud, PlusCircle } from "lucide-react";

interface IntakeModeTabsProps {
  activeMode: "preuploaded" | "upload";
  onSelectMode: (mode: "preuploaded" | "upload") => void;
  preuploadedCount?: number;
  onOpenCreateModal: () => void;
}

export const IntakeModeTabs: React.FC<IntakeModeTabsProps> = ({
  activeMode,
  onSelectMode,
  preuploadedCount = 0,
  onOpenCreateModal,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg bg-card dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
      {/* Segmented Mode Switcher */}
      <div className="flex items-center gap-1.5 p-1 bg-card/80 dark:bg-slate-800/80 rounded-lg border border-slate-200/60 dark:border-slate-700/60 w-full sm:w-auto overflow-x-auto">
        <button
          type="button"
          onClick={() => onSelectMode("preuploaded")}
          className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeMode === "preuploaded"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-card dark:hover:bg-slate-700"
          }`}
        >
          <Database className="w-3.5 h-3.5 shrink-0" />
          <span>Pre-Uploaded Repository</span>
          {preuploadedCount > 0 && (
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                activeMode === "preuploaded"
                  ? "bg-card/20 text-white"
                  : "bg-card/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
              }`}
            >
              {preuploadedCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => onSelectMode("upload")}
          className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeMode === "upload"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-card dark:hover:bg-slate-700"
          }`}
        >
          <UploadCloud className="w-3.5 h-3.5 shrink-0" />
          <span>Upload Spreadsheet</span>
        </button>
      </div>

      {/* Action Button: Create Lead Manually */}
      <div className="flex items-center w-full sm:w-auto">
        <button
          type="button"
          onClick={onOpenCreateModal}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-card dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs transition-all active:scale-95"
        >
          <PlusCircle className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
          <span>Create Lead Manually</span>
        </button>
      </div>
    </div>
  );
};
