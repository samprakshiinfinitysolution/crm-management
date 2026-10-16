"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { toast } from "sonner";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { UserRole } from "@/types/api.types";
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
import { PageHeader } from "@/components/shared/PageHeader";

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
      <div className="max-w-6xl mx-auto flex flex-col gap-3.5">
        {/* Header */}
        <PageHeader
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Imports", href: "/dashboard/imports" },
            { label: "Upload" },
          ]}
          title="Upload & Stage Leads Spreadsheet"
          description="Drag-and-drop your .xlsx / .csv file for instant schema validation and duplicate detection."
          actions={
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard/imports"
                className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-2xs"
                title="Back to Imports"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <button
                type="button"
                onClick={handleDownloadSample}
                className="px-3.5 py-2 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Download Sample Template</span>
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
    </ProtectedRoute>
  );
}
