"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { UserRole } from "@/types/api.types";
import { useGetSalesExecutivesQuery } from "@/store";
import { PageHeader } from "@/components/shared/PageHeader";

export default function DistributionDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const { data: execsData } = useGetSalesExecutivesQuery();
  const executives = execsData?.data || [];

  return (
    <ProtectedRoute allowedRoles={[UserRole.TEAM_LEADER, UserRole.ADMIN]}>
      <div className="mx-auto flex flex-col gap-6">
        <PageHeader
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Distributions", href: "/dashboard/distributions" },
            { label: `Batch #${id.slice(0, 8)}` },
          ]}
          title={`Distribution Batch #${id.slice(0, 8)}`}
          description="Historical distribution run and allocation breakdown."
          actions={
            <Link
              href="/dashboard/distributions"
              className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-2xs"
              title="Back to Distributions"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
          }
        />

        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-800 shadow-xs p-6 flex flex-col gap-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                COMPLETED & COMMITTED
              </span>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              ACID Transaction Validated
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase block">
                Mode
              </span>
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                EQUAL / CUSTOM
              </span>
            </div>
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase block">
                Target Executives
              </span>
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                {executives.length} Staff Members
              </span>
            </div>
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase block">
                Audit Verification
              </span>
              <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                Verified
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
            <Link
              href="/dashboard/distributions"
              className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 text-xs font-semibold transition-colors"
            >
              Back to Distributions
            </Link>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
