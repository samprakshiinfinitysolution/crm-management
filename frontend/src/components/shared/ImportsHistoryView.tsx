"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  UploadCloud,
  FileSpreadsheet,
  Plus,
  Eye,
  Download,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  ExternalLink,
} from "lucide-react";
import { type ImportBatchSummary } from "@/types/api.types";
import { useGetImportBatchesQuery } from "@/store";
import { DataTable, type ColumnDef } from "@/components/ui/DataTable";
import { PageHeader, BreadcrumbItem } from "./PageHeader";
import { downloadImportErrors } from "@/lib/exportUtils";
import { format } from "date-fns";

export interface ImportsHistoryViewProps {
  title?: string;
  description?: string;
  uploadHref?: string;
  batchDetailsHrefPrefix?: string;
  breadcrumbs?: BreadcrumbItem[];
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "COMPLETED":
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          Committed
        </span>
      );
    case "PARTIALLY_COMMITTED":
    case "PARTIAL":
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800">
          <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
          Partial
        </span>
      );
    case "FAILED":
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800">
          <XCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
          Failed
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800">
          <Clock className="w-3 h-3 text-blue-600 dark:text-blue-400" />
          {status || "Staged"}
        </span>
      );
  }
};

export const ImportsHistoryView: React.FC<ImportsHistoryViewProps> = ({
  title = "Excel Import History & Staged Batches",
  description = "Audit past spreadsheet uploads, inspect row-level validations, and monitor pool injections.",
  uploadHref = "/dashboard/imports/upload",
  batchDetailsHrefPrefix = "/dashboard/imports/batches",
  breadcrumbs,
}) => {
  const [page, setPage] = useState(1);
  const limit = 10;
  const { data: batchesRes, isLoading } = useGetImportBatchesQuery();
  const batches = batchesRes?.data || [];

  // Define Columns for DataTable
  const columns = useMemo<ColumnDef<ImportBatchSummary>[]>(
    () => [
      {
        id: "batchId",
        header: "Batch ID & File",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <Link
              href={`${batchDetailsHrefPrefix}/${row.id}`}
              className="font-mono font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
            >
              {row.id.substring(0, 10)}...
              <ExternalLink className="w-3 h-3 opacity-60" />
            </Link>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
              <FileSpreadsheet className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate max-w-[150px]">{row.fileName}</span>
            </span>
          </div>
        ),
      },
      {
        id: "uploadedBy",
        header: "Uploaded By",
        cell: ({ row }) => (
          <span className="font-medium text-slate-800 dark:text-slate-200">
            {row.uploadedBy?.name || "System"}
          </span>
        ),
      },
      {
        id: "totalRows",
        header: "Total Rows",
        accessorKey: "totalRows",
        className: "font-semibold text-slate-900 dark:text-slate-100",
      },
      {
        id: "importedCount",
        header: "Imported",
        cell: ({ row }) => (
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
            {row.importedCount ?? 0}
          </span>
        ),
      },
      {
        id: "duplicateCount",
        header: "Duplicates",
        cell: ({ row }) => (
          <span className="text-amber-600 dark:text-amber-400 font-semibold">
            {row.duplicateCount ?? 0}
          </span>
        ),
      },
      {
        id: "failedCount",
        header: "Errors",
        cell: ({ row }) => (
          <span className="text-rose-600 dark:text-rose-400 font-semibold">
            {row.failedCount ?? (row.errors ? row.errors.length : 0)}
          </span>
        ),
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => getStatusBadge(row.status),
      },
      {
        id: "createdAt",
        header: "Ingested Date",
        className: "text-slate-500 dark:text-slate-400 whitespace-nowrap text-[11px]",
        cell: ({ row }) =>
          row.createdAt ? format(new Date(row.createdAt), "dd MMM yyyy, p") : "—",
      },
      {
        id: "actions",
        header: "Actions",
        align: "right",
        cell: ({ row }) => {
          const hasErrors =
            (row.failedCount && row.failedCount > 0) ||
            (row.errors && row.errors.length > 0);

          return (
            <div className="flex items-center justify-end gap-1.5">
              {hasErrors && (
                <button
                  type="button"
                  onClick={() => downloadImportErrors(row.id, row.fileName)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded transition-colors cursor-pointer"
                  title="Download Error Report"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Errors</span>
                </button>
              )}
              <Link
                href={`${batchDetailsHrefPrefix}/${row.id}`}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Inspect</span>
              </Link>
            </div>
          );
        },
      },
    ],
    [batchDetailsHrefPrefix]
  );

  return (
    <div className="space-y-3.5 animate-in fade-in duration-200">
      {/* Page Header */}
      <PageHeader
        title={title}
        description={description}
        icon={<UploadCloud className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
        breadcrumbs={breadcrumbs}
        actions={
          uploadHref ? (
            <Link
              href={uploadHref}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Upload Spreadsheet</span>
            </Link>
          ) : undefined
        }
      />

      {/* Generic Shared DataTable */}
      <DataTable
        columns={columns}
        data={batches}
        isLoading={isLoading}
        emptyTitle="No batch imports found"
        emptyDescription="Upload your first Excel or CSV sheet to begin bulk lead intake."
        emptyIcon={<FileSpreadsheet className="w-8 h-8 stroke-[1.5]" />}
        pagination={
          batches.length > limit
            ? {
                currentPage: page,
                totalPages: Math.ceil(batches.length / limit),
                onPageChange: setPage,
              }
            : undefined
        }
      />
    </div>
  );
};
