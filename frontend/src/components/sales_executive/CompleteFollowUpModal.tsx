"use client";

import React, { useState } from "react";
import {
  X,
  CheckCircle2,
  ArrowRight,
  MessageSquare,
  Calendar,
} from "lucide-react";
import { useCompleteFollowUpMutation } from "@/store/api/followUpApi";
import { toast } from "sonner";
import { LeadStatus } from "@/types/api.types";
import { DatePicker } from "@/components/ui/DatePicker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CompleteFollowUpModalProps {
  followUp: {
    id: string;
    type: string;
    lead?: {
      id: string;
      leadCode: string;
      customerName: string;
      status: LeadStatus;
    } | null;
  } | null;
  open: boolean;
  onClose: () => void;
}

const NEXT_STATUS_OPTIONS: {
  value: LeadStatus;
  label: string;
  description: string;
}[] = [
  {
    value: LeadStatus.INTERESTED,
    label: "Interested",
    description: "Prospect expressed interest in our offerings",
  },
  {
    value: LeadStatus.QUALIFIED,
    label: "Qualified",
    description: "Budget and timeline criteria verified",
  },
  {
    value: LeadStatus.PROPOSAL_QUOTATION,
    label: "Proposal / Quote",
    description: "Quotation or proposal is being sent",
  },
  {
    value: LeadStatus.NEGOTIATION,
    label: "Negotiation",
    description: "Active negotiation on pricing / terms",
  },
  {
    value: LeadStatus.WON_SOLD,
    label: "Won / Sold",
    description: "Customer agreed and transaction completed",
  },
  {
    value: LeadStatus.FOLLOW_UP,
    label: "Follow-up Again",
    description: "Needs another touchpoint later",
  },
  {
    value: LeadStatus.ON_HOLD,
    label: "On Hold",
    description: "Postponed by customer for a later date",
  },
  {
    value: LeadStatus.NOT_INTERESTED,
    label: "Not Interested",
    description: "Customer declined offering",
  },
  {
    value: LeadStatus.NO_RESPONSE,
    label: "No Response",
    description: "Multiple attempts without response",
  },
  {
    value: LeadStatus.LOST,
    label: "Lost",
    description: "Chose competitor or canceled requirement",
  },
];

export default function CompleteFollowUpModal({
  followUp,
  open,
  onClose,
}: CompleteFollowUpModalProps) {
  const [notes, setNotes] = useState("");
  const [nextStatus, setNextStatus] = useState<LeadStatus | "">("");
  const [scheduleNext, setScheduleNext] = useState(false);
  const [nextFollowUpAt, setNextFollowUpAt] = useState("");

  const [completeFollowUp, { isLoading }] = useCompleteFollowUpMutation();

  if (!open || !followUp) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!notes.trim()) {
      toast.error("Please add interaction outcome notes before completing.");
      return;
    }

    if (scheduleNext && !nextFollowUpAt) {
      toast.error("Please select a date and time for the next follow-up.");
      return;
    }

    try {
      await completeFollowUp({
        id: followUp.id,
        notes: notes.trim(),
        nextStatus: nextStatus ? (nextStatus as LeadStatus) : undefined,
        nextFollowUpAt:
          scheduleNext && nextFollowUpAt
            ? new Date(nextFollowUpAt).toISOString()
            : undefined,
      }).unwrap();

      toast.success("Follow-up logged and marked complete!");
      setNotes("");
      setNextStatus("");
      setScheduleNext(false);
      setNextFollowUpAt("");
      onClose();
    } catch (err: unknown) {
      const errorObj = err as { data?: { message?: string } };
      toast.error(
        errorObj?.data?.message ||
          "Failed to complete follow-up. Please try again.",
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="relative bg-card border border-crm-subtle rounded-lg shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-crm-subtle">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shadow-2xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-crm-primary">
                Log & Complete Follow-Up
              </h2>
              <p className="text-[11px] text-crm-muted">
                {followUp.lead?.leadCode} · {followUp.lead?.customerName} (
                {followUp.type})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-crm-muted hover:text-crm-primary hover:bg-crm-muted transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-5 flex flex-col gap-4 max-h-[80vh] overflow-y-auto"
        >
          {/* Outcome Notes */}
          <div>
            <label className="block text-xs font-semibold text-crm-secondary mb-1.5">
              <MessageSquare className="w-3.5 h-3.5 inline mr-1 opacity-70" />
              Outcome & Discussion Summary{" "}
              <span className="text-rose-600">*</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What was discussed? Customer response, objections, or next expectations..."
              rows={3}
              required
              maxLength={2000}
              className="w-full bg-card border border-crm-subtle rounded-lg px-3 py-2.5 text-sm text-crm-primary placeholder:text-crm-muted focus:outline-none focus:border-emerald-600 transition-colors resize-none"
            />
          </div>

          {/* Next Lead Stage */}
          <div>
            <label className="block text-xs font-semibold text-crm-secondary mb-1.5">
              <ArrowRight className="w-3.5 h-3.5 inline mr-1 opacity-70" />
              Update Lead Pipeline Stage (Optional)
            </label>
            <Select
              value={nextStatus || "UNCHANGED"}
              onValueChange={(val) => {
                if (!val || val === "UNCHANGED") {
                  setNextStatus("");
                } else {
                  setNextStatus(val as LeadStatus);
                }
              }}
            >
              <SelectTrigger className="w-full h-10 bg-card border border-crm-subtle rounded-lg px-3 py-2 text-xs text-crm-secondary focus:outline-none focus:border-emerald-600 transition-colors cursor-pointer">
                <SelectValue placeholder={`Keep current status (${followUp.lead?.status || "UNCHANGED"})`} />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto">
                <SelectItem value="UNCHANGED">
                  Keep current status ({followUp.lead?.status || "UNCHANGED"})
                </SelectItem>
                {NEXT_STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <span>{opt.label}</span>
                    <span className="text-crm-muted text-[11px] ml-1">
                      ({opt.description})
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Schedule Next Touchpoint */}
          <div className="pt-2 border-t border-crm-subtle">
            <label className="flex items-center gap-2 cursor-pointer select-none mb-3">
              <input
                type="checkbox"
                checked={scheduleNext}
                onChange={(e) => setScheduleNext(e.target.checked)}
                className="w-4 h-4 rounded border-crm-subtle text-emerald-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
              <span className="text-xs font-semibold text-crm-secondary">
                Immediately schedule next follow-up touchpoint
              </span>
            </label>

            {scheduleNext && (
              <div className="bg-crm-subtle border border-crm-subtle rounded-lg p-3.5 flex flex-col gap-2.5">
                <label className="text-[11px] font-medium text-crm-secondary flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                  Next Scheduled Date & Time{" "}
                  <span className="text-rose-600">*</span>
                </label>
                <DatePicker
                  value={nextFollowUpAt}
                  onChange={(val) => setNextFollowUpAt(val)}
                  minDate={new Date()}
                  placeholder="Select next follow-up date & time"
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-3 border-t border-crm-subtle">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg bg-crm-subtle border border-crm-subtle text-sm text-crm-secondary hover:bg-crm-muted transition-colors font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isLoading ? "Saving..." : "Mark Completed"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
