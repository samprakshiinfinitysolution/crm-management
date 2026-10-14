"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  AlertTriangle,
  ShieldAlert,
  Download,
} from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { UserRole } from "@/types/api.types";
import { Pagination } from "@/components/ui/Pagination";
import { useGetImportBatchByIdQuery } from "@/store";
import { downloadImportErrors } from "@/lib/exportUtils";
import { TableSkeletonRows } from "@/components/ui/TableSkeletonRows";
import { PageHeader } from "./PageHeader";

export interface ImportErrorRow {
  id?: string;
  rowNumber?: number;
  row?: number;
  columnName?: string;
  field?: string;
  errorMessage?: string;
  message?: string;
  rawRowData?: Record<string, unknown>;
}

export interface ImportBatchDetailViewProps {
  batchId?: string;
  backHref?: string;
}

export function ImportBatchDetailView({
  batchId: propBatchId,
  backHref = "/dashboard/imports",
}: ImportBatchDetailViewProps) {
  const params = useParams();
  const id = propBatchId || (params?.id as string);
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [isExporting, setIsExporting] = useState(false);

  const {
    data: batchRes,
    isLoading,
    isError,
  } = useGetImportBatchByIdQuery(id, { skip: !id });
  const batch = batchRes?.data;

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={[UserRole.TEAM_LEADER, UserRole.ADMIN]}>
        <div className="space-y-3.5 animate-pulse">
          {/* Header Skeleton */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-lg bg-card/70 border border-slate-200" />
              <div className="space-y-2">
                <div className="h-6 w-48 bg-card/70 rounded-md" />
                <div className="h-3 w-64 bg-card/70 rounded-sm" />
              </div>
            </div>
            <div className="h-9 w-48 bg-card/70 rounded-lg self-start sm:self-auto" />
          </div>

          {/* Overview Stats Skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2"
              >
                <div className="h-3 w-20 bg-slate-100 dark:bg-slate-800 rounded" />
                <div className="h-8 w-16 bg-slate-100 dark:bg-slate-800 rounded-md" />
              </div>
            ))}
          </div>

          {/* Failed Row Breakdown Table Skeleton */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="h-4 w-52 bg-slate-100 dark:bg-slate-800 rounded" />
              <div className="h-7 w-28 bg-slate-100 dark:bg-slate-800 rounded-lg" />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Row #</th>
                    <th className="py-3 px-4">Column / Field</th>
                    <th className="py-3 px-4">Error Reason</th>
                    <th className="py-3 px-4">Raw Staged Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <TableSkeletonRows rows={6} columns={4} />
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (isError || !batch) {
    return (
      <ProtectedRoute allowedRoles={[UserRole.TEAM_LEADER, UserRole.ADMIN]}>
        <div className="p-8 text-center bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg text-rose-700 dark:text-rose-300">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
          <p className="font-semibold">
            Batch Not Found or Error Loading Details
          </p>
          <Link
            href={backHref}
            className="text-xs underline mt-2 inline-block"
          >
            Back to Imports
          </Link>
        </div>
      </ProtectedRoute>
    );
  }

  const rawErrors = (batch.errors || []) as unknown as ImportErrorRow[];

  const handleDownloadErrors = async () => {
    setIsExporting(true);
    try {
      await downloadImportErrors(batch.id, batch.fileName);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={[UserRole.TEAM_LEADER, UserRole.ADMIN]}>
      <div className="space-y-3.5">
        {/* Header */}
        <PageHeader
          breadcrumbs={[
            {
              label: backHref.includes("admin") ? "Admin" : "Dashboard",
              href: backHref.includes("admin") ? "/admin" : "/dashboard",
            },
            { label: "Imports", href: backHref },
            { label: batch.fileName },
          ]}
          title={batch.fileName}
          description={`Batch Code: ${batch.batchCode || batch.id} · Uploaded ${new Date(batch.createdAt).toLocaleString()}`}
          actions={
            <div className="flex items-center gap-2">
              <Link
                href={backHref}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer shadow-2xs"
                title="Back to Imports"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              {rawErrors.length > 0 && (
                <button
                  type="button"
                  onClick={handleDownloadErrors}
                  disabled={isExporting}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-400 text-xs font-semibold shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>
                    {isExporting ? "Generating..." : "Download Error Logs (.xlsx)"}
                  </span>
                </button>
              )}
            </div>
          }
        />

        {/* Overview Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
              Total Rows
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              {batch.totalRows}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Imported
            </p>
            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">
              {batch.importedCount}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
            <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Duplicates
            </p>
            <p className="text-2xl font-bold text-amber-700 dark:text-amber-400 mt-1">
              {batch.duplicateCount}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
            <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
              Failed Rows
            </p>
            <p className="text-2xl font-bold text-rose-700 dark:text-rose-400 mt-1">
              {batch.failedCount}
            </p>
          </div>
        </div>

        {/* Failed Row Breakdown Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              Validation & Ingestion Errors ({rawErrors.length})
            </h2>

            {rawErrors.length > 0 && (
              <button
                type="button"
                onClick={handleDownloadErrors}
                disabled={isExporting}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span>Export (.xlsx)</span>
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50/80 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Row #</th>
                  <th className="py-3 px-4">Column / Field</th>
                  <th className="py-3 px-4">Error Reason</th>
                  <th className="py-3 px-4">Raw Staged Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {rawErrors.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-8 text-center text-slate-400 dark:text-slate-500"
                    >
                      Zero row-level errors recorded for this batch.
                    </td>
                  </tr>
                ) : (
                  rawErrors
                    .slice(
                      (Math.min(
                        page,
                        Math.max(1, Math.ceil(rawErrors.length / limit)),
                      ) -
                        1) *
                        limit,
                      Math.min(
                        page,
                        Math.max(1, Math.ceil(rawErrors.length / limit)),
                      ) * limit,
                    )
                    .map((err, idx) => (
                      <tr
                        key={err.id || `err-${idx}`}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="py-3 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                          Row {err.rowNumber || err.row || idx + 1}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                          {err.columnName || err.field || "General"}
                        </td>
                        <td className="py-3 px-4 text-rose-600 dark:text-rose-400 font-semibold">
                          {err.errorMessage ||
                            err.message ||
                            "Validation error"}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400 max-w-xs truncate">
                          {err.rawRowData
                            ? JSON.stringify(err.rawRowData)
                            : "-"}
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>

          {rawErrors.length > 0 && (
            <Pagination
              currentPage={Math.min(
                page,
                Math.max(1, Math.ceil(rawErrors.length / limit)),
              )}
              totalPages={Math.max(1, Math.ceil(rawErrors.length / limit))}
              totalItems={rawErrors.length}
              pageSize={limit}
              onPageChange={setPage}
              onPageSizeChange={(newLimit) => {
                setLimit(newLimit);
                setPage(1);
              }}
            />
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
