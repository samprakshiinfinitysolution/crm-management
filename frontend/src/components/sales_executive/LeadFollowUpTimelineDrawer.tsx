"use client";

import React, { useState } from "react";
import {
  X,
  Clock,
  Phone,
  Users,
  Mail,
  MessageSquare,
  Plus,
} from "lucide-react";
import { useGetLeadByIdQuery } from "@/store/api/leadApi";
import { useGetLeadFollowUpsQuery } from "@/store/api/followUpApi";
import type { FollowUpItem } from "@/types/api.types";
import ScheduleFollowUpModal from "./ScheduleFollowUpModal";
import CompleteFollowUpModal from "./CompleteFollowUpModal";
import RescheduleFollowUpModal from "./RescheduleFollowUpModal";

interface LeadFollowUpTimelineDrawerProps {
  leadId: string | null;
  onClose: () => void;
}

export default function LeadFollowUpTimelineDrawer({
  leadId,
  onClose,
}: LeadFollowUpTimelineDrawerProps) {
  const { data: leadData } = useGetLeadByIdQuery(leadId || "", {
    skip: !leadId,
  });
  const { data: followUpsData, isLoading: isTimelineLoading } =
    useGetLeadFollowUpsQuery(leadId || "", { skip: !leadId });

  const lead = leadData?.data;
  const followUps = followUpsData?.data || [];

  const [isScheduling, setIsScheduling] = useState(false);
  const [completingItem, setCompletingItem] = useState<FollowUpItem | null>(
    null,
  );
  const [reschedulingItem, setReschedulingItem] = useState<FollowUpItem | null>(
    null,
  );

  if (!leadId) return null;

  const getChannelIcon = (type: string) => {
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

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-card border-l border-crm-subtle shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 border-b border-crm-subtle flex items-center justify-between bg-crm-subtle/80 backdrop-blur">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-card text-(--crm-brand-primary) font-bold border border-crm-subtle shadow-2xs">
                {lead?.leadCode || "Loading..."}
              </span>
              <span className="text-sm font-bold text-crm-primary">
                {lead?.customerName || "Customer Detail"}
              </span>
            </div>
            <p className="text-[11px] text-crm-muted mt-1">
              Lead Activity & Scheduled Touchpoint Timeline
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-crm-muted hover:text-crm-primary hover:bg-crm-muted transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lead Profile Glance */}
        {lead && (
          <div className="p-4 bg-crm-subtle border-b border-crm-subtle text-xs flex flex-wrap gap-x-6 gap-y-2 text-crm-secondary">
            <div>
              <span className="text-crm-muted">Phone: </span>
              <a
                href={`tel:${lead.mobile}`}
                className="text-emerald-700 font-medium hover:underline"
              >
                {lead.mobile}
              </a>
            </div>
            {lead.email && (
              <div>
                <span className="text-crm-muted">Email: </span>
                <span className="text-crm-secondary">{lead.email}</span>
              </div>
            )}
            {lead.companyName && (
              <div>
                <span className="text-crm-muted">Company: </span>
                <span className="text-crm-secondary">{lead.companyName}</span>
              </div>
            )}
            <div>
              <span className="text-crm-muted">Status: </span>
              <span className="font-bold text-crm-primary">{lead.status}</span>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-crm-muted uppercase tracking-wider">
              Follow-Up History & Schedule
            </h4>
            <button
              type="button"
              onClick={() => setIsScheduling(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-crm-brand hover:bg-crm-brand-hover text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Schedule Follow-Up</span>
            </button>
          </div>

          {/* Timeline */}
          {isTimelineLoading ? (
            <div className="flex flex-col gap-3 py-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 bg-crm-muted/50 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : followUps.length === 0 ? (
            <div className="py-12 text-center text-crm-muted text-xs">
              No follow-ups recorded yet for this lead. Click above to schedule
              the first one.
            </div>
          ) : (
            <div className="relative pl-6 border-l border-crm-subtle flex flex-col gap-5 py-2">
              {followUps.map((item) => {
                const isCompleted = item.status === "COMPLETED";
                const isOverdue =
                  item.status === "PENDING" &&
                  new Date(item.scheduledAt) < new Date();

                return (
                  <div key={item.id} className="relative">
                    {/* Timeline Node Dot */}
                    <div
                      className={`absolute -left-7.75 top-1 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        isCompleted
                          ? "bg-emerald-500 border-white ring-2 ring-emerald-200"
                          : isOverdue
                            ? "bg-rose-500 border-white ring-2 ring-rose-200"
                            : "bg-blue-600 border-white ring-2 ring-blue-200"
                      }`}
                    />

                    {/* Content Box */}
                    <div
                      className={`p-3.5 rounded-lg border ${
                        isCompleted
                          ? "bg-crm-subtle border-crm-subtle"
                          : isOverdue
                            ? "bg-rose-50/50 border-rose-200"
                            : "bg-card border-crm-subtle shadow-2xs"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className="p-1 rounded bg-crm-subtle border border-crm-subtle">
                            {getChannelIcon(item.type)}
                          </div>
                          <span className="text-xs font-bold text-crm-primary">
                            {item.type} Touchpoint
                          </span>
                        </div>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase border ${
                            isCompleted
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : isOverdue
                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {isCompleted
                            ? "Completed"
                            : isOverdue
                              ? "Overdue"
                              : "Pending"}
                        </span>
                      </div>

                      <div className="text-[11px] text-crm-muted flex items-center gap-2 mb-1">
                        <Clock className="w-3 h-3 text-crm-muted" />
                        <span>
                          Scheduled:{" "}
                          {new Date(item.scheduledAt).toLocaleString("en-IN")}
                        </span>
                        {item.completedAt && (
                          <span className="text-emerald-700 font-medium">
                            · Completed:{" "}
                            {new Date(item.completedAt).toLocaleTimeString(
                              "en-IN",
                            )}
                          </span>
                        )}
                      </div>

                      {item.notes && (
                        <p className="text-xs text-crm-secondary mt-2 bg-crm-subtle p-2.5 rounded-lg border border-crm-subtle">
                          {item.notes}
                        </p>
                      )}

                      {!isCompleted && (
                        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-crm-subtle justify-end">
                          <button
                            type="button"
                            onClick={() => setReschedulingItem(item)}
                            className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[11px] font-medium transition-colors cursor-pointer"
                          >
                            Reschedule
                          </button>
                          <button
                            type="button"
                            onClick={() => setCompletingItem(item)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold transition-colors cursor-pointer shadow-2xs"
                          >
                            Mark Completed
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modals */}
        {isScheduling && lead && (
          <ScheduleFollowUpModal
            leadId={lead.id}
            leadCode={lead.leadCode}
            customerName={lead.customerName}
            open={isScheduling}
            onClose={() => setIsScheduling(false)}
          />
        )}

        {completingItem && (
          <CompleteFollowUpModal
            followUp={completingItem}
            open={!!completingItem}
            onClose={() => setCompletingItem(null)}
          />
        )}

        {reschedulingItem && (
          <RescheduleFollowUpModal
            followUp={reschedulingItem}
            open={!!reschedulingItem}
            onClose={() => setReschedulingItem(null)}
          />
        )}
      </div>
    </div>
  );
}
