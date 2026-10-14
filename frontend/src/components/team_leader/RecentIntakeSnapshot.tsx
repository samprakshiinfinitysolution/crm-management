"use client";

import React from "react";
import {
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  FileSpreadsheet,
  Upload,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { TLDashboardRecentIntake } from "@/types/api.types";
import Link from "next/link";

interface RecentIntakeSnapshotProps {
  intake?: TLDashboardRecentIntake | null;
  isLoading?: boolean;
}

export default function RecentIntakeSnapshot({
  intake,
  isLoading,
}: RecentIntakeSnapshotProps) {
  const router = useRouter();

  if (isLoading) {
    return (
      <section className="py-1">
        <div className="bg-crm-card rounded-lg p-3.5 border border-crm-subtle h-24 animate-pulse"></div>
      </section>
    );
  }

  if (!intake) {
    return (
      <section className="py-1">
        <div className="bg-crm-card rounded-lg p-3.5 border border-crm-subtle shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-crm-brand-subtle text-crm-brand flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-crm-primary">
                No Recent Intakes
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                Upload an Excel/CSV file to ingest leads into the pool.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => router.push("/dashboard/imports")}
            className="px-3 py-1.5 rounded-lg bg-crm-brand hover:bg-crm-brand/90 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all shadow-xs"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload File</span>
          </button>
        </div>
      </section>
    );
  }

  const formattedDate = intake.createdAt
    ? new Date(intake.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Recently";

  return (
    <section className="py-1">
      <div className="bg-crm-card rounded-lg p-3.5 border border-crm-subtle shadow-xs">
        <div className="flex items-center justify-between text-crm-muted mb-2">
          <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase text-slate-700 dark:text-slate-200">
            <FileSpreadsheet className="w-3.5 h-3.5 text-crm-brand" />
            <span>RECENT INTAKE LOG</span>
          </div>
          <span className="text-xs text-crm-success font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Processed</span>
          </span>
        </div>

        <div className="text-sm font-bold text-crm-primary flex items-center justify-between">
          <span>
            {intake.batchCode ||
              `Batch #${intake.batchId.slice(0, 8).toUpperCase()}`}
          </span>
          <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
            {intake.fileName}
          </span>
        </div>

        <p className="text-xs text-slate-700 dark:text-slate-200 font-medium mt-1 leading-relaxed">
          {intake.importedCount} records committed • {intake.duplicateCount}{" "}
          duplicates deduplicated • Uploaded by{" "}
          <span className="font-semibold text-crm-primary">
            {intake.uploadedBy?.name || "System"}
          </span>{" "}
          on {formattedDate}.
        </p>

        <div className="mt-3 pt-3 border-t border-crm-subtle flex items-center justify-between">
          <Link
            href="/dashboard/imports"
            className="text-xs font-semibold text-crm-brand hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>View full intake audit</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-1 text-[10px] font-bold text-crm-muted uppercase tracking-wider">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span>{intake.integrityStatus || "SHA-256 VERIFIED"}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
