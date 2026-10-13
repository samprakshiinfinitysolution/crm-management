"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store";
import {
  useGetFollowUpsQuery,
  useGetFollowUpSummaryQuery,
} from "@/store/api/followUpApi";
import {
  UserRole,
  type FollowUpItem,
  type FollowUpType,
} from "@/types/api.types";
import { Phone, MessageSquare, Mail, Users, X, Clock } from "lucide-react";
import CompleteFollowUpModal from "@/components/sales_executive/CompleteFollowUpModal";
import RescheduleFollowUpModal from "@/components/sales_executive/RescheduleFollowUpModal";

interface FollowUpLoginDialogProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

export default function FollowUpLoginDialog({
  forceOpen,
  onClose,
}: FollowUpLoginDialogProps = {}) {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const isTL = user?.role === UserRole.TEAM_LEADER;

  const [internalIsOpen, setInternalIsOpen] = useState<boolean>(() => {
    if (forceOpen !== undefined) return forceOpen;
    if (typeof window === "undefined" || !user) return false;
    const sessionKey = `crm_login_dialog_${user.id}_${new Date().toISOString().slice(0, 10)}`;
    const alreadyShown = sessionStorage.getItem(sessionKey);
    if (!alreadyShown) {
      sessionStorage.setItem(sessionKey, "true");
      return true;
    }
    return false;
  });

  const isOpen = forceOpen !== undefined ? forceOpen : internalIsOpen;

  const [userSelectedTab, setUserSelectedTab] = useState<
    "today" | "overdue" | null
  >(null);
  const [tlViewMode, setTlViewMode] = useState<"my" | "team">("my");
  const [dontShowAgain, setDontShowAgain] = useState(false);

  // Modals for actions
  const [completingFollowUp, setCompletingFollowUp] =
    useState<FollowUpItem | null>(null);
  const [reschedulingFollowUp, setReschedulingFollowUp] =
    useState<FollowUpItem | null>(null);

  const handleClose = () => {
    if (dontShowAgain && user) {
      const sessionKey = `crm_login_dialog_${user.id}_${new Date().toISOString().slice(0, 10)}`;
      sessionStorage.setItem(sessionKey, "true");
    }
    setInternalIsOpen(false);
    onClose?.();
  };

  const executiveId = isTL && tlViewMode === "my" ? user?.id : undefined;

  // Summary counts
  const { data: summaryRes } = useGetFollowUpSummaryQuery(undefined, {
    skip: !isOpen,
  });
  const summary = summaryRes?.data;

  // Today's follow-ups: scheduledAt >= startOfToday && scheduledAt < startOfTomorrow
  const { data: todayRes, isLoading: isTodayLoading } = useGetFollowUpsQuery(
    {
      scope: "today",
      executiveId,
      limit: 25,
    },
    { skip: !isOpen },
  );

  // Pending follow-ups: scheduledAt < startOfToday, status: PENDING
  const { data: overdueRes, isLoading: isOverdueLoading } =
    useGetFollowUpsQuery(
      {
        scope: "overdue",
        executiveId,
        limit: 25,
      },
      { skip: !isOpen },
    );

  const todayList = todayRes?.data || [];
  const overdueList = overdueRes?.data || [];

  const todayCount =
    isTL && tlViewMode === "team"
      ? (summary?.dueToday ?? todayList.length)
      : todayList.length;

  const overdueCount =
    isTL && tlViewMode === "team"
      ? (summary?.overdue ?? overdueList.length)
      : overdueList.length;

  // Derived active tab: defaults to "today" unless today has 0 items and pending has items
  const activeTab =
    userSelectedTab ??
    (todayCount === 0 && overdueCount > 0 ? "overdue" : "today");

  const currentList = activeTab === "today" ? todayList : overdueList;
  const isCurrentLoading =
    activeTab === "today" ? isTodayLoading : isOverdueLoading;

  const getTypeBadge = (type: FollowUpType | string) => {
    switch (type) {
      case "Call":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
            <Phone className="w-3 h-3" /> Call
          </span>
        );
      case "WhatsApp":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
            <MessageSquare className="w-3 h-3" /> WhatsApp
          </span>
        );
      case "Email":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
            <Mail className="w-3 h-3" /> Email
          </span>
        );
      case "Meeting":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
            <Users className="w-3 h-3" /> Meeting
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-card text-slate-700">
            {type}
          </span>
        );
    }
  };

  const formatTime = (isoString: string, isOverdue: boolean) => {
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return isoString;

      if (isOverdue) {
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        });
      }

      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return isoString;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-[2px] flex items-center justify-center p-4 sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h2
                id="dialog-title"
                className="text-lg font-semibold text-slate-900 dark:text-slate-100"
              >
                Follow-ups
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Review your schedule for today and any pending tasks.
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs & Filters */}
          <div className="px-6 pt-3 pb-2 bg-slate-50/70 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setUserSelectedTab("today")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === "today"
                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs border border-slate-200 dark:border-slate-700 font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                }`}
              >
                Today ({todayCount})
              </button>
              <button
                type="button"
                onClick={() => setUserSelectedTab("overdue")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === "overdue"
                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs border border-slate-200 dark:border-slate-700 font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                }`}
              >
                Pending ({overdueCount})
              </button>
            </div>

            {isTL && (
              <div className="flex items-center bg-slate-200/60 dark:bg-slate-800 p-0.5 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => setTlViewMode("my")}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    tlViewMode === "my"
                      ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-medium shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                  }`}
                >
                  My Follow-ups
                </button>
                <button
                  type="button"
                  onClick={() => setTlViewMode("team")}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    tlViewMode === "team"
                      ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-medium shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                  }`}
                >
                  Team
                </button>
              </div>
            )}
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            {isCurrentLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 animate-pulse bg-slate-50 dark:bg-slate-800/40 space-y-2"
                  >
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : currentList.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {activeTab === "today"
                    ? "No follow-ups scheduled for today"
                    : "No pending follow-ups"}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {activeTab === "today"
                    ? "You are all caught up for today."
                    : "There are no overdue items waiting for action."}
                </p>
              </div>
            ) : (
              currentList.map((item) => {
                const isItemOverdue =
                  activeTab === "overdue" ||
                  new Date(item.scheduledAt).getTime() <
                    new Date().setHours(0, 0, 0, 0);

                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {getTypeBadge(item.type)}
                        <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTime(item.scheduledAt, isItemOverdue)}
                        </span>
                        {item.lead?.leadCode && (
                          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                            {item.lead.leadCode}
                          </span>
                        )}
                      </div>

                      <div className="flex items-baseline gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            handleClose();
                            router.push(`/dashboard/leads/${item.leadId}`);
                          }}
                          className="text-sm font-semibold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left truncate"
                        >
                          {item.lead?.customerName || "Customer Lead"}
                        </button>
                        {item.lead?.companyName && (
                          <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            • {item.lead.companyName}
                          </span>
                        )}
                      </div>

                      {isTL && tlViewMode === "team" && item.assignedTo && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Assigned to:{" "}
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {item.assignedTo.name}
                          </span>
                        </p>
                      )}

                      {item.notes && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/70 p-2 rounded-lg border border-slate-100 dark:border-slate-800 mt-1 line-clamp-2">
                          {item.notes}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-1">
                        {item.lead?.mobile && (
                          <>
                            <a
                              href={`tel:${item.lead.mobile}`}
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                              title="Call"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                            <a
                              href={`https://wa.me/${item.lead.mobile.replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                              title="WhatsApp"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </a>
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setReschedulingFollowUp(item)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors"
                        >
                          Reschedule
                        </button>
                        <button
                          type="button"
                          onClick={() => setCompletingFollowUp(item)}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors"
                        >
                          Complete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex flex-col sm:flex-row items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500"
              />
              <span>Don&apos;t show again today</span>
            </label>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => {
                  handleClose();
                  router.push("/dashboard/follow-ups");
                }}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
              >
                View all in queue
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white text-xs font-semibold transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Action Modals */}
      {completingFollowUp && (
        <CompleteFollowUpModal
          followUp={completingFollowUp}
          open={!!completingFollowUp}
          onClose={() => setCompletingFollowUp(null)}
        />
      )}

      {reschedulingFollowUp && (
        <RescheduleFollowUpModal
          followUp={reschedulingFollowUp}
          open={!!reschedulingFollowUp}
          onClose={() => setReschedulingFollowUp(null)}
        />
      )}
    </>
  );
}
