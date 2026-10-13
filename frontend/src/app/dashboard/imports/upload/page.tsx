"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, UploadCloud, Download } from "lucide-react";
import { toast } from "sonner";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { UserRole } from "@/types/api.types";
import {
  IntakeStatsCards,
  SheetUploadZone,
  SheetPreviewTable,
  StagedLeadRow,
} from "@/components/team_leader/intake";
import { useCommitImportMutation, useGetLeadsQuery } from "@/store";
import { handleApiError } from "@/lib/errorHandler";
import { downloadImportTemplate } from "@/lib/exportUtils";

export default function ImportUploadPage() {
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
          `Successfully ingested ${res?.data?.importedCount ?? valid} leads into unassigned pool!`,
      );
      refetchLeads();
      router.push("/dashboard/leads");
    } catch (err: unknown) {
      handleApiError(err, "Failed to commit leads");
    }
  };

  return (
    <ProtectedRoute allowedRoles={[UserRole.TEAM_LEADER, UserRole.ADMIN]}>
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/imports"
              className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span>Upload & Stage Leads Spreadsheet</span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Drag-and-drop your .xlsx / .csv file for instant schema
                validation and duplicate detection
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDownloadSample}
            className="px-3.5 py-2 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Download Sample Template</span>
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
    </ProtectedRoute>
  );
}
