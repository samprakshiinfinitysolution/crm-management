"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
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
import { PageHeader } from "@/components/shared/PageHeader";

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
    <div className="space-y-3.5 max-w-7xl mx-auto w-full animate-in fade-in duration-200">
      {/* Top Header & Breadcrumb */}
      <PageHeader
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Imports", href: "/admin/imports" },
          { label: "Upload" },
        ]}
        title="Spreadsheet Ingestion & Validation"
        description="Drag-and-drop your .xlsx / .csv file for instant schema validation and duplicate detection."
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/admin/imports"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
              title="Back to Imports"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <button
              type="button"
              onClick={handleDownloadSample}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-xs transition-colors self-start sm:self-auto"
            >
              <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Download Clean Template</span>
            </button>
          </div>
        }
      />

      {/* Upload Zone */}
      <SheetUploadZone
        currentFile={currentFile}
        onFileSelect={handleFileSelect}
      />

      {/* Staged Data Preview & Verification */}
      {stagedRows.length > 0 && (
        <div className="space-y-3.5">
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
