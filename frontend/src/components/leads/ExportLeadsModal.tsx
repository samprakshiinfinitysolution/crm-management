"use client";

import React, { useState } from "react";
import {
  Download,
  FileSpreadsheet,
  FileText,
  Check,
  X,
  ListOrdered,
  CheckSquare,
} from "lucide-react";
import { downloadLeadsExport } from "@/lib/exportUtils";
import type { ExportLeadsPayload } from "@/types/api.types";

interface ExportLeadsModalProps {
  open: boolean;
  onClose: () => void;
  selectedLeadIds?: string[];
  selectedLeadCodes?: string[];
  currentFilters?: {
    search?: string;
    status?: string;
    source?: string;
    city?: string;
    priority?: string;
    assignedToUserId?: string;
    fromDate?: string;
    toDate?: string;
  };
  totalMatchingCount?: number;
  onSuccess?: () => void;
}

const TOP_COUNT_PRESETS = [10, 20, 30, 40, 50, 100];

export const ExportLeadsModal: React.FC<ExportLeadsModalProps> = ({
  open,
  onClose,
  selectedLeadIds = [],
  selectedLeadCodes = [],
  currentFilters = {},
  totalMatchingCount,
  onSuccess,
}) => {
  const [format, setFormat] = useState<"xlsx" | "csv">("xlsx");
  const hasSelectedLeads = selectedLeadIds.length > 0;

  // Mode: "SELECTED" or "TOP_QUANTITY"
  const [exportMode, setExportMode] = useState<"SELECTED" | "TOP_QUANTITY">(
    hasSelectedLeads ? "SELECTED" : "TOP_QUANTITY",
  );

  // Active Lead IDs & Codes (allows adding/removing on the fly)
  const [customLeadCodes, setCustomLeadCodes] = useState<string[]>([]);
  const [manualCodeInput, setManualCodeInput] = useState<string>("");

  // Selected top count: number or null (for All)
  const [selectedTopCount, setSelectedTopCount] = useState<number | "ALL">(
    hasSelectedLeads ? "ALL" : 30,
  );
  const [customCountInput, setCustomCountInput] = useState<string>("");
  const [isCustomCount, setIsCustomCount] = useState(false);

  const [isExporting, setIsExporting] = useState(false);

  if (!open) return null;

  const allSelectedCodes = Array.from(
    new Set([...selectedLeadCodes, ...customLeadCodes]),
  );

  const handlePresetSelect = (count: number | "ALL") => {
    setIsCustomCount(false);
    setSelectedTopCount(count);
  };

  const handleCustomCountChange = (val: string) => {
    const numeric = val.replace(/[^0-9]/g, "");
    setCustomCountInput(numeric);
    setIsCustomCount(true);
  };

  const handleAddManualLeadCode = () => {
    if (!manualCodeInput.trim()) return;
    const codes = manualCodeInput
      .split(/[\s,]+/)
      .map((c) => c.trim().toUpperCase())
      .filter((c) => c.length > 0);

    setCustomLeadCodes((prev) => Array.from(new Set([...prev, ...codes])));
    setManualCodeInput("");
  };

  const handleRemoveCustomCode = (codeToRemove: string) => {
    setCustomLeadCodes((prev) => prev.filter((c) => c !== codeToRemove));
  };

  const getEffectiveLimit = (): number | undefined => {
    if (exportMode === "SELECTED") return undefined;
    if (isCustomCount && customCountInput) {
      const parsed = parseInt(customCountInput, 10);
      return parsed > 0 ? parsed : undefined;
    }
    if (selectedTopCount === "ALL") return undefined;
    return selectedTopCount;
  };

  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsExporting(true);

    const payload: ExportLeadsPayload = {
      format,
    };

    if (exportMode === "SELECTED") {
      if (selectedLeadIds.length > 0 && customLeadCodes.length === 0) {
        payload.leadIds = selectedLeadIds;
      } else if (allSelectedCodes.length > 0) {
        payload.leadCodes = allSelectedCodes;
      } else if (selectedLeadIds.length > 0) {
        payload.leadIds = selectedLeadIds;
      }
    } else {
      const limit = getEffectiveLimit();
      if (limit) payload.limit = limit;

      if (currentFilters.search) payload.search = currentFilters.search;
      if (currentFilters.status && currentFilters.status !== "ALL")
        payload.status = currentFilters.status;
      if (currentFilters.source && currentFilters.source !== "ALL")
        payload.source = currentFilters.source;
      if (currentFilters.city) payload.city = currentFilters.city;
      if (currentFilters.priority && currentFilters.priority !== "ALL")
        payload.priority = currentFilters.priority;
      if (currentFilters.assignedToUserId)
        payload.assignedToUserId = currentFilters.assignedToUserId;
      if (currentFilters.fromDate) payload.fromDate = currentFilters.fromDate;
      if (currentFilters.toDate) payload.toDate = currentFilters.toDate;
    }

    const success = await downloadLeadsExport(payload);
    setIsExporting(false);

    if (success) {
      if (onSuccess) onSuccess();
      onClose();
    }
  };

  const effectiveLimit = getEffectiveLimit();
  const totalSpecificSelected =
    allSelectedCodes.length > 0
      ? allSelectedCodes.length
      : selectedLeadIds.length;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div
        role="dialog"
        aria-modal="true"
        className="bg-card dark:bg-slate-900 rounded-lg p-6 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col gap-4 text-left"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/50">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Export Leads Data
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Download selected leads or top quantity records as Excel (.xlsx)
                or CSV
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isExporting}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleExport} className="flex flex-col gap-4">
          {/* Option 1 vs Option 2: Mode Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Choose Export Option:
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {/* Option A: Selected / Specific Leads */}
              <button
                type="button"
                onClick={() => setExportMode("SELECTED")}
                className={`p-3 rounded-lg border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                  exportMode === "SELECTED"
                    ? "bg-blue-50/90 border-blue-400 dark:bg-blue-950/50 dark:border-blue-600 text-blue-950 dark:text-blue-200 ring-2 ring-blue-500/20"
                    : "bg-white hover:bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                }`}
              >
                <CheckSquare className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold flex items-center gap-1.5 text-slate-900 dark:text-slate-100">
                    <span>1. Selected Leads</span>
                    {totalSpecificSelected > 0 && (
                      <span className="px-1.5 py-0.2 bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 rounded-md text-[10px] font-bold">
                        {totalSpecificSelected}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {totalSpecificSelected > 0
                      ? `${totalSpecificSelected} lead(s) targeted`
                      : "Choose or enter lead codes"}
                  </div>
                </div>
              </button>

              {/* Option B: Top / Quantity Leads */}
              <button
                type="button"
                onClick={() => setExportMode("TOP_QUANTITY")}
                className={`p-3 rounded-lg border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                  exportMode === "TOP_QUANTITY"
                    ? "bg-blue-50/90 border-blue-400 dark:bg-blue-950/50 dark:border-blue-600 text-blue-950 dark:text-blue-200 ring-2 ring-blue-500/20"
                    : "bg-white hover:bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                }`}
              >
                <ListOrdered className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">2. Top N / Filtered</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Top 10, 20, 30, 40, 50, 100+
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Option 1 View: Selected Leads & Manual Code Input */}
          {exportMode === "SELECTED" && (
            <div className="flex flex-col gap-2.5 p-3 bg-slate-50/80 dark:bg-slate-800/40 rounded-lg border border-slate-200/80 dark:border-slate-800 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Target Specific Leads ({totalSpecificSelected}):
                </span>
                {allSelectedCodes.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setCustomLeadCodes([])}
                    className="text-[10px] text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                  >
                    Clear extra
                  </button>
                )}
              </div>

              {/* Badges of selected lead codes */}
              {allSelectedCodes.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  {allSelectedCodes.map((code) => {
                    const isCustom = customLeadCodes.includes(code);
                    return (
                      <span
                        key={code}
                        className="inline-flex items-center gap-1 px-2 py-0.5 font-mono text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 rounded-md border border-blue-100 dark:border-blue-900"
                      >
                        <span>{code}</span>
                        {isCustom && (
                          <button
                            type="button"
                            onClick={() => handleRemoveCustomCode(code)}
                            className="hover:text-rose-600 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </span>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                  No leads checked from table. Add lead codes below or check
                  rows in directory.
                </p>
              )}

              {/* Add Lead Code Input */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={manualCodeInput}
                  onChange={(e) => setManualCodeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddManualLeadCode();
                    }
                  }}
                  placeholder="Add code (e.g. CRM-000001, CRM-000002)..."
                  className="flex-1 h-8 px-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={handleAddManualLeadCode}
                  disabled={!manualCodeInput.trim()}
                  className="h-8 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold transition-all cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>
          )}

          {/* Option 2 View: Top Quantity Presets */}
          {exportMode === "TOP_QUANTITY" && (
            <div className="flex flex-col gap-2 p-3 bg-slate-50/80 dark:bg-slate-800/40 rounded-lg border border-slate-200/80 dark:border-slate-800 animate-in fade-in duration-150">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Select Quantity to Export:
              </label>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap gap-1.5">
                {TOP_COUNT_PRESETS.map((preset) => {
                  const isSelected =
                    !isCustomCount && selectedTopCount === preset;
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handlePresetSelect(preset)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-blue-600 border-blue-600 text-white shadow-xs"
                          : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-300 dark:hover:border-blue-600"
                      }`}
                    >
                      Top {preset}
                    </button>
                  );
                })}

                {/* All Filtered Leads Preset */}
                <button
                  type="button"
                  onClick={() => handlePresetSelect("ALL")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    !isCustomCount && selectedTopCount === "ALL"
                      ? "bg-blue-600 border-blue-600 text-white shadow-xs"
                      : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-300 dark:hover:border-blue-600"
                  }`}
                >
                  All (
                  {totalMatchingCount !== undefined
                    ? `${totalMatchingCount}`
                    : "Filtered"}
                  )
                </button>
              </div>

              {/* Custom Quantity Input */}
              <div className="flex items-center gap-2 mt-1 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  Or Custom:
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={customCountInput}
                  onChange={(e) => handleCustomCountChange(e.target.value)}
                  placeholder="e.g. 75, 150..."
                  className="h-8 w-28 px-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                />
                <span className="text-[11px] text-slate-500 dark:text-slate-400">leads</span>
              </div>
            </div>
          )}

          {/* File Format Options (Excel vs CSV) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Select Export Format:
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setFormat("xlsx")}
                className={`p-3.5 rounded-lg border text-left flex items-start gap-3 transition-all cursor-pointer ${
                  format === "xlsx"
                    ? "bg-emerald-50/90 border-emerald-400 dark:bg-emerald-950/40 dark:border-emerald-700 text-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-500/20"
                    : "bg-white hover:bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Excel (.xlsx)
                    </span>
                    {format === "xlsx" && (
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Styled headers, formatted numbers & dates
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormat("csv")}
                className={`p-3.5 rounded-lg border text-left flex items-start gap-3 transition-all cursor-pointer ${
                  format === "csv"
                    ? "bg-blue-50/90 border-blue-400 dark:bg-blue-950/40 dark:border-blue-700 text-blue-950 dark:text-blue-200 ring-2 ring-blue-500/20"
                    : "bg-white hover:bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      CSV (.csv)
                    </span>
                    {format === "csv" && (
                      <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Universal raw format with UTF-8 BOM
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isExporting}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-card dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isExporting}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {isExporting ? (
                <>
                  <Download className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating {format.toUpperCase()}...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>
                    Download {format.toUpperCase()} (
                    {exportMode === "SELECTED"
                      ? totalSpecificSelected > 0
                        ? `${totalSpecificSelected} Selected`
                        : "Specific Leads"
                      : effectiveLimit
                        ? `Top ${effectiveLimit}`
                        : totalMatchingCount !== undefined
                          ? `${totalMatchingCount} Leads`
                          : "All Filtered"}
                    )
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExportLeadsModal;
