"use client";

import React, { useRef, useState } from "react";
import {
  UploadCloud,
  FileSpreadsheet,
  X,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { usePostImportFileMutation } from "@/store";
import { handleApiError } from "@/lib/errorHandler";

export interface StagedLeadRow {
  id: string;
  rowNumber?: number;
  customerName: string;
  mobile: string;
  alternateMobile?: string | null;
  email?: string;
  companyName?: string | null;
  city?: string;
  requirement?: string;
  budget?: string;
  source?: string;
  leadSource?: string | null;
  status: "VALID" | "DUPLICATE" | "INVALID";
  validationNote?: string;
}

interface SheetUploadZoneProps {
  currentFile: File | null;
  onFileSelect: (file: File | null, data: StagedLeadRow[]) => void;
}

export const SheetUploadZone: React.FC<SheetUploadZoneProps> = ({
  currentFile,
  onFileSelect,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [postImportFile, { isLoading: isPostImportFilePending }] =
    usePostImportFileMutation();

  const isBusy = isProcessing || isPostImportFilePending;

  const processFile = async (file: File) => {
    // Validate file type before parsing
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
    ];
    if (
      !validTypes.includes(file.type) &&
      !file.name.endsWith(".csv") &&
      !file.name.endsWith(".xlsx") &&
      !file.name.endsWith(".xls")
    ) {
      toast.error(
        "Invalid file type. Please upload a .xlsx, .xls, or .csv file.",
      );
      return;
    }

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await postImportFile(formData).unwrap();
      const rawRows = res?.data?.rows || [];

      const formattedRows: StagedLeadRow[] = rawRows.map((r, idx) => ({
        id: r.id || `staged-${r.rowNumber || idx + 1}-${Date.now()}`,
        rowNumber: r.rowNumber,
        customerName: r.customerName || "N/A",
        mobile: r.mobile || "",
        alternateMobile: r.alternateMobile,
        email: r.email || undefined,
        companyName: r.companyName,
        city: r.city || undefined,
        requirement: r.requirement || undefined,
        budget:
          r.budget !== null && r.budget !== undefined
            ? String(r.budget)
            : undefined,
        source: r.source || r.leadSource || "EXCEL",
        leadSource: r.leadSource,
        status: r.status,
        validationNote: r.validationNote || undefined,
      }));

      onFileSelect(file, formattedRows);
      toast.success(
        res?.message ||
          `Parsed and extracted ${formattedRows.length} rows from ${file.name}`,
      );
    } catch (err: unknown) {
      handleApiError(
        err,
        "Failed to parse spreadsheet. Please ensure a valid .xlsx or .csv file.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileSelect(null, []);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    // Moving drag events to the wrapper lets users drop files even if a file is already loaded
    <div
      className="w-full"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={handleInputChange}
      />

      {!currentFile ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`p-8 sm:p-10 border-2 border-dashed rounded-sm transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
            isDragging
              ? "border-[#2874f0] bg-[#eaf4fe]/50 dark:bg-blue-950/30"
              : "border-slate-300 dark:border-slate-700 hover:border-[#2874f0] bg-slate-50/50 dark:bg-slate-800/20"
          }`}
        >
          <div className="p-3 bg-[#eaf4fe] dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 rounded-sm text-[#2874f0] mb-3">
            {isBusy ? (
              <RefreshCw className="w-6 h-6 animate-spin" />
            ) : (
              <UploadCloud className="w-6 h-6" />
            )}
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1">
            {isBusy
              ? "Parsing & Validating Spreadsheet..."
              : "Click or Drag & Drop spreadsheet here"}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 max-w-md">
            Supports{" "}
            <span className="text-[#2874f0] font-semibold">.xlsx, .xls, .csv</span>{" "}
            files with standard columns: Customer Name, Mobile, Email, City, Requirement, Budget.
          </p>
          <div className="flex items-center gap-2">
            <span className="h-8 px-3.5 rounded-sm bg-white dark:bg-slate-800 border border-[#e0e0e0] dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-2xs hover:bg-slate-50 flex items-center justify-center">
              Browse Files from Computer
            </span>
          </div>
        </div>
      ) : (
        <div
          className={`p-4 sm:p-5 rounded-sm bg-slate-50/60 dark:bg-slate-800/30 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            isDragging
              ? "border-[#2874f0] bg-[#eaf4fe]/50 dark:bg-blue-950/30 animate-pulse"
              : "border-[#e0e0e0] dark:border-slate-800"
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 rounded-sm">
              {isBusy ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <FileSpreadsheet className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate max-w-xs sm:max-w-md">
                  {isBusy ? "Processing File Structure..." : currentFile.name}
                </h4>
                {!isBusy && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-xs bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle className="w-3 h-3" /> Ready
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {(currentFile.size / 1024).toFixed(1)} KB •{" "}
                {isDragging
                  ? "Drop to replace active file"
                  : "Drag a new file or click replace"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isBusy}
              onClick={() => fileInputRef.current?.click()}
              className="h-8 px-3 rounded-sm bg-white dark:bg-slate-800 border border-[#e0e0e0] dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 shadow-2xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              Replace Sheet
            </button>
            <button
              type="button"
              disabled={isBusy}
              onClick={handleRemove}
              className="h-8 w-8 rounded-sm bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center justify-center hover:bg-rose-100 shadow-2xs transition-colors disabled:opacity-50 cursor-pointer"
              title="Remove File"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
