"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Phone,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useGetFollowUpsQuery } from "@/store/api/followUpApi";
import CompleteFollowUpModal from "@/components/sales_executive/CompleteFollowUpModal";
import RescheduleFollowUpModal from "@/components/sales_executive/RescheduleFollowUpModal";
import { PageHeader } from "@/components/shared/PageHeader";

export default function FollowUpDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const { data: followUpsData, isLoading, refetch } = useGetFollowUpsQuery();
  const followUp = followUpsData?.data?.find((f) => f.id === id);

  const [isCompleteOpen, setIsCompleteOpen] = useState(false);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center">
        Loading follow-up details...
      </div>
    );
  }

  if (!followUp) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 flex flex-col items-center gap-3">
          <AlertCircle className="w-8 h-8 text-amber-600" />
          <h2 className="text-sm font-bold text-amber-900">
            Follow-up Task Not Found
          </h2>
          <p className="text-xs text-amber-700">
            This task may have already been completed or deleted.
          </p>
          <Link
            href="/dashboard/follow-ups"
            className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold"
          >
            Back to Follow-up Queue
          </Link>
        </div>
      </div>
    );
  }

  const isCompleted = followUp.status === "COMPLETED";

  return (
    <div className=" mx-auto flex flex-col gap-6">
      {/* Header */}
      <PageHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Follow-Ups", href: "/dashboard/follow-ups" },
          { label: `${followUp.type} Details` },
        ]}
        title={`${followUp.type} Follow-up Details`}
        description={`Scheduled for ${new Date(followUp.scheduledAt).toLocaleString()}`}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/follow-ups"
              className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-2xs"
              title="Back to Follow-ups"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            {!isCompleted && (
              <>
                <button
                  type="button"
                  onClick={() => setIsRescheduleOpen(true)}
                  className="px-3.5 py-2 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-all cursor-pointer"
                >
                  Reschedule
                </button>
                <button
                  type="button"
                  onClick={() => setIsCompleteOpen(true)}
                  className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark Complete</span>
                </button>
              </>
            )}
          </div>
        }
      />

      {/* Main Info Card */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-800 shadow-xs p-6 flex flex-col gap-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                isCompleted
                  ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                  : "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
              }`}
            >
              {followUp.status}
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
              {followUp.type} Action
            </span>
          </div>
        </div>

        {/* Lead Details */}
        {followUp.lead && (
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">
                Target Customer
              </span>
              <span className="text-base font-bold text-slate-900 dark:text-slate-100 block mt-0.5">
                {followUp.lead.customerName}
              </span>
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                <span className="flex items-center gap-1 font-mono text-blue-700 dark:text-blue-400">
                  {followUp.lead.leadCode}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {followUp.lead.mobile}
                </span>
              </div>
            </div>

            <Link
              href={`/dashboard/leads/${followUp.lead.id}`}
              className="px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-700 transition-all shadow-2xs self-start sm:self-auto"
            >
              View Full Lead Profile
            </Link>
          </div>
        )}

        {/* Notes */}
        <div>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block mb-2">
            Task Instructions & Remarks
          </span>
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
            {followUp.notes || "No specific notes recorded for this follow-up."}
          </div>
        </div>
      </div>

      {/* Complete Modal */}
      {isCompleteOpen && (
        <CompleteFollowUpModal
          open={isCompleteOpen}
          onClose={() => {
            setIsCompleteOpen(false);
            refetch();
          }}
          followUp={followUp}
        />
      )}

      {/* Reschedule Modal */}
      {isRescheduleOpen && (
        <RescheduleFollowUpModal
          open={isRescheduleOpen}
          onClose={() => {
            setIsRescheduleOpen(false);
            refetch();
          }}
          followUp={followUp}
        />
      )}
    </div>
  );
}
