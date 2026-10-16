"use client";

import React, { useState } from "react";
import {
  Phone,
  Users,
  Mail,
  MessageSquare,
  CheckCircle2,
  CalendarClock,
  Clock,
  Trash2,
  AlertCircle,
  Building,
  ArrowUpRight,
} from "lucide-react";
import {
  useGetFollowUpsQuery,
  useDeleteFollowUpMutation,
} from "@/store/api/followUpApi";
import { toast } from "sonner";
import type {
  FollowUpItem,
  FollowUpScope,
  FollowUpType,
} from "@/types/api.types";
import dynamic from "next/dynamic";
import { Pagination } from "@/components/ui/Pagination";

// Code splitting: Modals are only loaded on-demand when user completes or reschedules
const CompleteFollowUpModal = dynamic(
  () => import("./CompleteFollowUpModal"),
  { ssr: false }
);

const RescheduleFollowUpModal = dynamic(
  () => import("./RescheduleFollowUpModal"),
  { ssr: false }
);

interface FollowUpWorkQueueProps {
  scope: FollowUpScope;
  onScopeChange: (scope: FollowUpScope) => void;
  onSelectLead?: (leadId: string) => void;
}

export default function FollowUpWorkQueue({
  scope,
  onScopeChange,
  onSelectLead,
}: FollowUpWorkQueueProps) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [prevScope, setPrevScope] = useState(scope);

  if (prevScope !== scope) {
    setPrevScope(scope);
    setPage(1);
  }

  const { data, isLoading, refetch } = useGetFollowUpsQuery({
    scope,
    page,
    limit,
  });
  const followUps = data?.data || [];
  const pagination = data?.pagination;

  const [deleteFollowUp] = useDeleteFollowUpMutation();

  const [completingFollowUp, setCompletingFollowUp] =
    useState<FollowUpItem | null>(null);
  const [reschedulingFollowUp, setReschedulingFollowUp] =
    useState<FollowUpItem | null>(null);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this scheduled follow-up?"))
      return;

    try {
      await deleteFollowUp(id).unwrap();
      toast.success("Follow-up removed.");
      refetch();
    } catch {
      toast.error("Failed to delete follow-up.");
    }
  };

  const getChannelIcon = (type: FollowUpType) => {
    switch (type) {
      case "Call":
        return <Phone className="w-3.5 h-3.5 text-emerald-600" />;
      case "Meeting":
        return <Users className="w-3.5 h-3.5 text-[#2874f0]" />;
      case "Email":
        return <Mail className="w-3.5 h-3.5 text-[#2874f0]" />;
      case "WhatsApp":
        return <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const formatScheduledTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString("en-IN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 rounded-sm overflow-hidden p-4 sm:p-5 shadow-2xs space-y-4">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e0e0e0] dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-1 h-3.5 bg-[#2874f0] rounded-xs" />
          <div>
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide flex items-center gap-2">
              <span>Follow-Up Task Queue</span>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-xs bg-[#eaf4fe] text-[#2874f0] border border-blue-200">
                {pagination?.total ?? followUps.length} items
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Action items requiring client touchpoint and conversation logging
            </p>
          </div>
        </div>

        {/* Scope Tabs in CRM Management Hub tab bar style */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-sm text-xs shrink-0 self-start sm:self-auto overflow-x-auto max-w-full">
          {(
            [
              "today",
              "overdue",
              "upcoming",
              "completed",
              "all",
            ] as FollowUpScope[]
          ).map((tabKey) => (
            <button
              key={tabKey}
              type="button"
              onClick={() => {
                onScopeChange(tabKey);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xs text-xs font-bold capitalize transition-all cursor-pointer whitespace-nowrap ${
                scope === tabKey
                  ? "bg-[#2874f0] text-white shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              {tabKey === "today" ? "Due Today" : tabKey}
            </button>
          ))}
        </div>
      </div>

      {/* List of Follow-ups */}
      {isLoading ? (
        <div className="space-y-2.5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-18 bg-slate-100 dark:bg-slate-800/60 rounded-sm animate-pulse border border-[#e0e0e0] dark:border-slate-800"
            />
          ))}
        </div>
      ) : followUps.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-xs bg-[#eaf4fe] border border-blue-200 flex items-center justify-center text-[#2874f0] mb-3">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide mb-1">
            {scope === "today"
              ? "All caught up for today!"
              : scope === "overdue"
                ? "No overdue follow-ups!"
                : "No follow-up items found"}
          </h4>
          <p className="text-xs text-slate-500 max-w-sm">
            {scope === "today"
              ? "You have completed or cleared all follow-ups scheduled for today."
              : scope === "overdue"
                ? "Great job maintaining SLA compliance across your pipeline."
                : "Select a lead from your work pool to schedule a touchpoint."}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {followUps.map((item) => {
            const isCompleted = item.status === "COMPLETED";
            const isOverdue =
              item.status === "PENDING" &&
              new Date(item.scheduledAt) < new Date();

            return (
              <div
                key={item.id}
                className={`p-3 rounded-sm border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  isOverdue
                    ? "bg-rose-50/40 border-rose-200 hover:border-rose-300"
                    : isCompleted
                      ? "bg-slate-50/60 dark:bg-slate-800/40 border-[#e0e0e0] opacity-75"
                      : "bg-white dark:bg-slate-800/80 border-[#e0e0e0] dark:border-slate-700 hover:border-slate-300 shadow-2xs"
                }`}
              >
                {/* Left Info */}
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-2 rounded-xs bg-[#eaf4fe] dark:bg-blue-950/60 border border-blue-200 shrink-0">
                    {getChannelIcon(item.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                        {item.lead?.customerName || "Customer"}
                      </span>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-xs bg-[#eaf4fe] text-[#2874f0] border border-blue-200">
                        {item.lead?.leadCode}
                      </span>
                      {item.lead?.priority && (
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-xs uppercase ${
                            item.lead.priority === "URGENT"
                              ? "bg-rose-100 text-rose-800 border border-rose-300"
                              : item.lead.priority === "HIGH"
                                ? "bg-orange-100 text-orange-800 border border-orange-300"
                                : "bg-blue-100 text-[#2874f0] border border-blue-300"
                          }`}
                        >
                          {item.lead.priority}
                        </span>
                      )}
                      {isOverdue && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-xs bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
                          <AlertCircle className="w-2.5 h-2.5 text-rose-600" />
                          OVERDUE SLA
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1 flex-wrap font-mono">
                      <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {formatScheduledTime(item.scheduledAt)}
                      </span>
                      {item.lead?.mobile && (
                        <a
                          href={`tel:${item.lead.mobile}`}
                          className="flex items-center gap-1 text-[#2874f0] hover:underline font-semibold"
                        >
                          <Phone className="w-3 h-3 text-[#2874f0]" />
                          {item.lead.mobile}
                        </a>
                      )}
                      {item.lead?.companyName && (
                        <span className="flex items-center gap-1 text-slate-500 font-sans">
                          <Building className="w-3 h-3 text-slate-400" />
                          {item.lead.companyName}
                        </span>
                      )}
                    </div>

                    {item.notes && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1.5 italic bg-slate-50 dark:bg-slate-800/60 px-2 py-0.5 rounded-xs border border-[#e0e0e0] dark:border-slate-700 inline-block">
                        &ldquo;{item.notes}&rdquo;
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {onSelectLead && item.leadId && (
                    <button
                      type="button"
                      onClick={() => onSelectLead(item.leadId)}
                      title="View Lead Details"
                      className="h-7.5 px-2.5 rounded-sm bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-300 border border-[#e0e0e0] dark:border-slate-700 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span className="text-[11px]">View Listing</span>
                    </button>
                  )}

                  {!isCompleted && (
                    <>
                      <button
                        type="button"
                        onClick={() => setReschedulingFollowUp(item)}
                        className="h-7.5 px-2.5 rounded-sm bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <CalendarClock className="w-3.5 h-3.5 text-amber-600" />
                        <span className="text-[11px]">Reschedule</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCompletingFollowUp(item)}
                        className="h-7.5 px-3 rounded-sm bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span className="text-[11px]">Complete</span>
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={(e) => handleDelete(item.id, e)}
                    title="Delete Follow-Up"
                    className="p-1.5 rounded-sm bg-white dark:bg-slate-800 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-[#e0e0e0] dark:border-slate-700 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && (
        <div className="pt-3 border-t border-[#e0e0e0] dark:border-slate-800 mt-3">
          <Pagination
            currentPage={page}
            totalPages={Math.max(1, pagination?.totalPages || 1)}
            totalItems={pagination?.total ?? followUps.length}
            pageSize={limit}
            onPageChange={setPage}
            onPageSizeChange={(newLimit) => {
              setLimit(newLimit);
              setPage(1);
            }}
            showPageSizeSelector
          />
        </div>
      )}

      {/* Complete Modal */}
      {completingFollowUp && (
        <CompleteFollowUpModal
          followUp={completingFollowUp}
          open={!!completingFollowUp}
          onClose={() => {
            setCompletingFollowUp(null);
            refetch();
          }}
        />
      )}

      {/* Reschedule Modal */}
      {reschedulingFollowUp && (
        <RescheduleFollowUpModal
          followUp={reschedulingFollowUp}
          open={!!reschedulingFollowUp}
          onClose={() => {
            setReschedulingFollowUp(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}
