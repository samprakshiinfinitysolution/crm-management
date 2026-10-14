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
import { Pagination } from "@/components/ui/Pagination";
import CompleteFollowUpModal from "./CompleteFollowUpModal";
import RescheduleFollowUpModal from "./RescheduleFollowUpModal";

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

  const { data, isLoading } = useGetFollowUpsQuery({ scope, page, limit });
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
    } catch {
      toast.error("Failed to delete follow-up.");
    }
  };

  const getChannelIcon = (type: FollowUpType) => {
    switch (type) {
      case "Call":
        return <Phone className="w-3.5 h-3.5 text-emerald-600" />;
      case "Meeting":
        return <Users className="w-3.5 h-3.5 text-blue-600" />;
      case "Email":
        return <Mail className="w-3.5 h-3.5 text-blue-600" />;
      case "WhatsApp":
        return <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-crm-muted" />;
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
    <div className="bg-crm-card border border-crm-subtle rounded-lg overflow-x-hidden p-4 sm:p-5 shadow-xs">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 mb-5 border-b border-crm-subtle pb-4 w-full">
        <div className="w-full sm:w-auto">
          <h3 className="text-sm font-bold text-crm-primary flex items-center gap-2 flex-wrap">
            <span>Follow-Up Work Queue</span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              ({pagination?.total ?? followUps.length} items)
            </span>
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 font-medium">
            Action items requiring client touchpoint and conversation logging
          </p>
        </div>

        {/* Scope Tabs */}
        <div className="w-full sm:w-auto max-w-full overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden flex items-center gap-1 bg-crm-muted p-1 rounded-lg border border-crm-subtle text-xs">
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
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg font-medium capitalize transition-all cursor-pointer whitespace-nowrap shrink-0 text-center ${
                scope === tabKey
                  ? "bg-card text-crm-primary shadow-xs font-semibold"
                  : "text-crm-muted hover:text-crm-primary"
              }`}
            >
              {tabKey === "today" ? "Today" : tabKey}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 bg-crm-muted/50 rounded-lg animate-pulse border border-crm-subtle"
            />
          ))}
        </div>
      ) : followUps.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-lg bg-crm-subtle border border-crm-subtle flex items-center justify-center text-crm-muted mb-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600/70" />
          </div>
          <h4 className="text-sm font-semibold text-crm-primary mb-1">
            {scope === "today"
              ? "All caught up for today!"
              : scope === "overdue"
                ? "No overdue follow-ups!"
                : "No follow-up items found"}
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm font-medium">
            {scope === "today"
              ? "You have completed or cleared all follow-ups scheduled for today."
              : scope === "overdue"
                ? "Great job maintaining SLA compliance across your pipeline."
                : "Select a lead from your work pool to schedule a touchpoint."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {followUps.map((item) => {
            const isCompleted = item.status === "COMPLETED";
            const isOverdue =
              item.status === "PENDING" &&
              new Date(item.scheduledAt) < new Date();

            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-lg border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  isOverdue
                    ? "bg-rose-50/50 border-rose-200 hover:border-rose-300"
                    : isCompleted
                      ? "bg-crm-subtle border-crm-subtle opacity-75"
                      : "bg-card border-crm-subtle hover:border-slate-300 shadow-2xs"
                }`}
              >
                {/* Left Info */}
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-2 rounded-lg bg-crm-subtle border border-crm-subtle shrink-0">
                    {getChannelIcon(item.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-crm-primary">
                        {item.lead?.customerName || "Customer"}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-crm-subtle text-crm-secondary border border-crm-subtle">
                        {item.lead?.leadCode}
                      </span>
                      {item.lead?.priority && (
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                            item.lead.priority === "URGENT"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : item.lead.priority === "HIGH"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-blue-50 text-blue-700 border border-blue-200"
                          }`}
                        >
                          {item.lead.priority}
                        </span>
                      )}
                      {isOverdue && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                          <AlertCircle className="w-2.5 h-2.5 text-rose-600" />
                          OVERDUE
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-crm-muted mt-1 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-crm-muted" />
                        {formatScheduledTime(item.scheduledAt)}
                      </span>
                      {item.lead?.mobile && (
                        <a
                          href={`tel:${item.lead.mobile}`}
                          className="flex items-center gap-1 text-crm-secondary hover:text-emerald-600 transition-colors font-medium"
                        >
                          <Phone className="w-3 h-3 text-emerald-600" />
                          {item.lead.mobile}
                        </a>
                      )}
                      {item.lead?.companyName && (
                        <span className="flex items-center gap-1 text-crm-muted">
                          <Building className="w-3 h-3 text-crm-muted" />
                          {item.lead.companyName}
                        </span>
                      )}
                    </div>

                    {item.notes && (
                      <p className="text-[11px] text-crm-secondary mt-1.5 italic bg-crm-subtle px-2 py-1 rounded border border-crm-subtle inline-block">
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
                      className="p-1.5 rounded-lg bg-crm-subtle hover:bg-crm-muted text-crm-secondary border border-crm-subtle text-xs transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span className="hidden md:inline text-[11px]">
                        View Lead
                      </span>
                    </button>
                  )}

                  {!isCompleted && (
                    <>
                      <button
                        type="button"
                        onClick={() => setReschedulingFollowUp(item)}
                        className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <CalendarClock className="w-3.5 h-3.5 text-amber-600" />
                        <span className="text-[11px]">Reschedule</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCompletingFollowUp(item)}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
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
                    className="p-1.5 rounded-lg bg-crm-subtle hover:bg-rose-50 text-crm-muted hover:text-rose-600 border border-crm-subtle transition-colors cursor-pointer"
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
        <div className="pt-4 border-t border-crm-subtle mt-4">
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
          onClose={() => setCompletingFollowUp(null)}
        />
      )}

      {/* Reschedule Modal */}
      {reschedulingFollowUp && (
        <RescheduleFollowUpModal
          followUp={reschedulingFollowUp}
          open={!!reschedulingFollowUp}
          onClose={() => setReschedulingFollowUp(null)}
        />
      )}
    </div>
  );
}
