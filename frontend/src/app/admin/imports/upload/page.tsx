"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, UploadCloud, Download } from "lucide-react";
import { toast } from "sonner";
import {
  IntakeStatsCards,
  SheetUploadZone,
  SheetPreviewTable,
  StagedLeadRow,
} from "@/components/team_leader/intake";
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
      }).unwrap();

      toast.success(
        `Successfully ingested ${res.data?.importedCount || valid} leads into the unassigned intake pool.`
      );
      refetchLeads();
      router.push("/admin/imports");
    } catch (err) {
      handleApiError(err, "Failed to commit staged leads to intake pool.");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full animate-in fade-in duration-200">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/imports"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-0.5">
              <Link href="/admin" className="hover:underline">Admin</Link>
              <span>/</span>
              <Link href="/admin/imports" className="hover:underline">Imports</Link>
              <span>/</span>
              <span className="text-blue-600 dark:text-blue-400 font-semibold">Upload</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <UploadCloud className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <span>Spreadsheet Ingestion & Validation</span>
            </h1>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDownloadSample}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Download Clean Template</span>
        </button>
      </div>

      {/* Upload Zone */}
      <SheetUploadZone
        currentFile={currentFile}
        onFileSelect={handleFileSelect}
      />

      {/* Staged Data Preview & Verification */}
      {stagedRows.length > 0 && (
        <div className="space-y-6">
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
