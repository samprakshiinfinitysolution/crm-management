"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Phone,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Clock,
  CalendarCheck,
  User,
  ArrowUpRight,
} from "lucide-react";
import { useGetFollowUpsQuery } from "@/store/api/followUpApi";
import CompleteFollowUpModal from "@/components/sales_executive/CompleteFollowUpModal";
import RescheduleFollowUpModal from "@/components/sales_executive/RescheduleFollowUpModal";

export default function FollowUpDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const { data: followUpsData, isLoading, refetch } = useGetFollowUpsQuery();
  const followUp = followUpsData?.data?.find((f) => f.id === id);

  const [isCompleteOpen, setIsCompleteOpen] = useState(false);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-2 text-slate-500">
        <Clock className="w-8 h-8 animate-spin text-[#2874f0]" />
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
          Loading task details...
        </span>
      </div>
    );
  }

  if (!followUp) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center">
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-sm p-6 flex flex-col items-center gap-3 shadow-2xs">
          <AlertCircle className="w-8 h-8 text-amber-600" />
          <h2 className="text-sm font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wide">
            Follow-up Task Not Found
          </h2>
          <p className="text-xs text-amber-700 dark:text-amber-300">
            This task may have already been completed, reassigned, or removed.
          </p>
          <Link
            href="/dashboard/follow-ups"
            className="h-8.5 px-4 rounded-sm bg-[#2874f0] text-white text-xs font-bold uppercase tracking-wide hover:bg-[#1a5bb8] flex items-center transition-colors shadow-2xs"
          >
            Back to Follow-up Queue
          </Link>
        </div>
      </div>
    );
  }

  const isCompleted = followUp.status === "COMPLETED";
  const isOverdue =
    followUp.status === "PENDING" &&
    new Date(followUp.scheduledAt) < new Date();

  return (
    <div className="space-y-4 animate-in fade-in duration-150 select-none pb-12">
      {/* Breadcrumb Navigation matching CRM Management Hub */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
        <Link
          href="/dashboard"
          className="text-[#2874f0] hover:underline font-medium"
        >
          Home
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <Link
          href="/dashboard/follow-ups"
          className="text-[#2874f0] hover:underline font-medium"
        >
          Follow-Up Task Queue
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <span className="text-slate-700 dark:text-slate-300 font-medium">
          {followUp.type} Task Details
        </span>
      </div>

      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e0e0e0] dark:border-slate-800 pb-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-[#2874f0]" />
              <span>{followUp.type} Follow-up Details</span>
            </h1>
            {followUp.lead?.leadCode && (
              <span className="px-2 py-0.5 rounded-xs text-xs font-mono font-bold bg-[#eaf4fe] text-[#2874f0] border border-blue-200">
                {followUp.lead.leadCode}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Scheduled Target:{" "}
            <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
              {new Date(followUp.scheduledAt).toLocaleString("en-IN", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </span>
          </p>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            href="/dashboard/follow-ups"
            className="h-8.5 px-3 rounded-sm bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Queue</span>
          </Link>

          {!isCompleted && (
            <>
              <button
                type="button"
                onClick={() => setIsRescheduleOpen(true)}
                className="h-8.5 px-3 rounded-sm bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                Reschedule
              </button>
              <button
                type="button"
                onClick={() => setIsCompleteOpen(true)}
                className="h-8.5 px-4 rounded-sm bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark Complete</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Task Summary Strip (Flipkart Order Overview Style) */}
      <div className="bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 rounded-sm shadow-2xs p-3.5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="border-r border-[#e0e0e0] dark:border-slate-800 pr-3">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
            Task Status
          </span>
          <span
            className={`inline-block mt-1 px-2 py-0.5 rounded-xs font-bold text-[11px] border ${
              isCompleted
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : isOverdue
                  ? "bg-rose-100 text-rose-800 border-rose-300 font-bold"
                  : "bg-amber-50 text-amber-700 border-amber-200"
            }`}
          >
            {isOverdue ? "OVERDUE SLA" : followUp.status}
          </span>
        </div>

        <div className="border-r border-[#e0e0e0] dark:border-slate-800 pr-3">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
            Communication Channel
          </span>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block mt-1">
            {followUp.type} Touchpoint
          </span>
        </div>

        <div className="border-r border-[#e0e0e0] dark:border-slate-800 pr-3">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
            Scheduled Time
          </span>
          <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 block mt-1">
            {new Date(followUp.scheduledAt).toLocaleDateString()}
          </span>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
            Associated Client
          </span>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block mt-1 truncate">
            {followUp.lead?.customerName || "Customer"}
          </span>
        </div>
      </div>

      {/* Main Info Card */}
      <div className="space-y-4">
        {/* Lead Details */}
        {followUp.lead && (
          <div className="bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 rounded-sm shadow-2xs p-4 sm:p-5">
            <div className="flex items-center justify-between pb-2.5 mb-3.5 border-b border-[#e0e0e0] dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-1 h-3.5 bg-[#2874f0] rounded-xs" />
                <h2 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#2874f0]" />
                  <span>Associated Listing Profile</span>
                </h2>
              </div>
            </div>

            <div className="p-3.5 rounded-sm bg-slate-50/70 dark:bg-slate-800/60 border border-[#e0e0e0] dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Customer Name
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100 block">
                  {followUp.lead.customerName}
                </span>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                  <span className="font-mono font-bold text-[#2874f0]">
                    {followUp.lead.leadCode}
                  </span>
                  <a
                    href={`tel:${followUp.lead.mobile}`}
                    className="flex items-center gap-1 font-mono text-[#2874f0] hover:underline font-semibold"
                  >
                    <Phone className="w-3 h-3 text-[#2874f0]" />
                    {followUp.lead.mobile}
                  </a>
                  {followUp.lead.companyName && (
                    <span className="text-slate-600 dark:text-slate-400">
                      {followUp.lead.companyName}
                    </span>
                  )}
                </div>
              </div>

              <Link
                href={`/dashboard/leads/${followUp.lead.id}`}
                className="h-8.5 px-3.5 rounded-sm bg-white dark:bg-slate-800 border border-[#e0e0e0] dark:border-slate-700 text-xs font-semibold text-[#2874f0] hover:bg-slate-50 transition-colors shadow-2xs flex items-center gap-1.5 self-start sm:self-auto"
              >
                <span>View Full Listing Profile</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* Task Notes Card */}
        <div className="bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 rounded-sm shadow-2xs p-4 sm:p-5">
          <div className="flex items-center justify-between pb-2.5 mb-3.5 border-b border-[#e0e0e0] dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-1 h-3.5 bg-[#2874f0] rounded-xs" />
              <h2 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                Task Instructions & Log Remarks
              </h2>
            </div>
          </div>

          <div className="p-3.5 rounded-sm bg-slate-50/70 dark:bg-slate-800/60 border border-[#e0e0e0] dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
            {followUp.notes ||
              "No specific instructions or remarks recorded for this follow-up."}
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
