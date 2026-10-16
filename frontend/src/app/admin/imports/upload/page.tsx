"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, ChevronRight, Info, UploadCloud, Layers } from "lucide-react";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import {
  IntakeStatsCards,
  SheetUploadZone,
  type StagedLeadRow,
} from "@/components/team_leader/intake";

// Code splitting: Sheet preview table is only loaded when file is staged
const SheetPreviewTable = dynamic(
  () =>
    import("@/components/team_leader/intake/SheetPreviewTable").then(
      (m) => m.SheetPreviewTable
    ),
  {
    loading: () => (
      <div className="h-64 animate-pulse bg-slate-100 dark:bg-slate-800 rounded-sm" />
    ),
    ssr: false,
  }
);
import { useCommitImportMutation, useGetLeadsQuery } from "@/store";
import { handleApiError } from "@/lib/errorHandler";
import { downloadImportTemplate } from "@/lib/exportUtils";

export default function AdminImportUploadPage() {
  const router = useRouter();
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [stagedRows, setStagedRows] = useState<StagedLeadRow[]>([]);

  const [commitImport, { isLoading: isCommitting }] = useCommitImportMutation();
  const { refetch: refetchLeads } = useGetLeadsQuery({ limit: 1 });

  const total = stagedRows.length;
  const valid = stagedRows.filter((r) => r.status === "VALID").length;
  const duplicates = stagedRows.filter((r) => r.status === "DUPLICATE").length;
  const invalid = stagedRows.filter((r) => r.status === "INVALID").length;

  const handleFileSelect = (file: File | null, data: StagedLeadRow[]) => {
    setCurrentFile(file);
    setStagedRows(data);
  };

  const handleDownloadSample = async () => {
    await downloadImportTemplate(true);
  };

  const handleCommitIngest = async () => {
    if (valid === 0) {
      toast.error("No valid leads available to ingest");
      return;
    }

    try {
      const res = await commitImport({
        fileName: currentFile?.name || "leads_import.xlsx",
        rows: stagedRows,
        skipDuplicates: true,
      }).unwrap();

      toast.success(
        res?.message ||
          `Successfully ingested ${res?.data?.importedCount ?? valid} leads into the unassigned intake pool.`
      );
      refetchLeads();
      router.push("/admin/imports");
    } catch (err) {
      handleApiError(err, "Failed to commit staged leads to intake pool.");
    }
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto w-full animate-in fade-in duration-200">
      {/* 1. Breadcrumb Navigation */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
        <Link href="/admin" className="hover:text-[#2874f0] transition-colors">
          Admin Panel
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <Link href="/admin/imports" className="hover:text-[#2874f0] transition-colors">
          Imports & Intake
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <span className="text-slate-700 dark:text-slate-300 font-medium">
          Upload Spreadsheet
        </span>
      </div>

      {/* 2. Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e0e0e0] dark:border-slate-800 pb-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            Spreadsheet Ingestion & Validation
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Drag-and-drop your .xlsx or .csv batch file for instant schema validation and automated duplicate detection
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/imports"
            className="h-8 px-3 rounded-sm bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Imports</span>
          </Link>
          <button
            type="button"
            onClick={handleDownloadSample}
            className="h-8 px-3.5 rounded-sm bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#2874f0]" />
            <span>Download Template</span>
          </button>
        </div>
      </div>

      {/* 3. Guidelines Notice Banner */}
      <div className="px-4 py-3 bg-[#eaf4fe] dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-sm flex items-start gap-3 text-xs">
        <Info className="w-4 h-4 text-[#2874f0] shrink-0 mt-0.5" />
        <div className="space-y-0.5 text-slate-700 dark:text-slate-300">
          <p className="font-semibold text-slate-900 dark:text-white">
            Bulk Spreadsheet Ingestion Protocol
          </p>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
            Ensure uploaded spreadsheets include standard columns: <strong className="font-semibold text-slate-800 dark:text-slate-200">Customer Name, Mobile Number, City, Requirement</strong>, and <strong className="font-semibold text-slate-800 dark:text-slate-200">Budget</strong>. Duplicate detection automatically flags matching telephone numbers and emails against active database records.
          </p>
        </div>
      </div>

      {/* 4. Upload Zone Modular Card */}
      <div className="bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 rounded-sm shadow-2xs p-4 sm:p-5 space-y-3.5">
        <div className="flex items-center justify-between pb-2.5 border-b border-[#e0e0e0] dark:border-slate-800">
          <h2 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide flex items-center gap-1.5">
            <UploadCloud className="w-3.5 h-3.5 text-[#2874f0]" />
            <span>Spreadsheet Upload & Parsing Engine</span>
          </h2>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Accepts .xlsx, .xls, .csv (Max 15MB)
          </span>
        </div>

        <SheetUploadZone
          currentFile={currentFile}
          onFileSelect={handleFileSelect}
        />
      </div>

      {/* 5. Staged Data Verification & Preview */}
      {stagedRows.length > 0 && (
        <div className="space-y-4 pt-1">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#2874f0]" />
              <span>Staged Validation Metrics</span>
            </h2>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {valid} of {total} records eligible for immediate injection
            </span>
          </div>

          <IntakeStatsCards
            total={total}
            valid={valid}
            duplicates={duplicates}
            invalid={invalid}
          />

          <SheetPreviewTable
            rows={stagedRows}
            onCommit={handleCommitIngest}
            isCommitting={isCommitting}
          />
        </div>
      )}
    </div>
  );
}
