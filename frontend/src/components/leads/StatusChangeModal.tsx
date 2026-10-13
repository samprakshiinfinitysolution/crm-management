"use client";

import React, { useState } from "react";
import { Tag, X, Check, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import {
  useUpdateLeadStatusMutation,
  useUpdateBulkLeadStatusMutation,
} from "@/store";
import { LeadStatus } from "@/types/api.types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LeadStatusBadge } from "./LeadBadges";

interface StatusChangeModalProps {
  open: boolean;
  onClose: () => void;
  leadIds: string[];
  leadCodes?: string[];
  currentStatus?: LeadStatus | string;
  onSuccess?: () => void;
}

const AVAILABLE_STATUSES: {
  value: LeadStatus;
  label: string;
  description: string;
}[] = [
  {
    value: LeadStatus.NEW,
    label: "NEW",
    description: "Newly captured lead, waiting for initial review",
  },
  {
    value: LeadStatus.ASSIGNED,
    label: "ASSIGNED",
    description: "Assigned to an executive for outreach",
  },
  {
    value: LeadStatus.CONTACTED,
    label: "CONTACTED",
    description: "First contact attempt initiated",
  },
  {
    value: LeadStatus.INTERESTED,
    label: "INTERESTED",
    description: "Prospect expressed interest in solutions",
  },
  {
    value: LeadStatus.FOLLOW_UP,
    label: "FOLLOW_UP",
    description: "Scheduled for ongoing follow-up discussion",
  },
  {
    value: LeadStatus.QUALIFIED,
    label: "QUALIFIED",
    description: "Budget and timeline verified as qualified",
  },
  {
    value: LeadStatus.PROPOSAL_QUOTATION,
    label: "PROPOSAL / QUOTATION",
    description: "Official quotation or proposal sent",
  },
  {
    value: LeadStatus.NEGOTIATION,
    label: "NEGOTIATION",
    description: "Active price or terms negotiation",
  },
  {
    value: LeadStatus.WON_SOLD,
    label: "WON / SOLD",
    description: "Deal successfully closed and won",
  },
  {
    value: LeadStatus.NOT_INTERESTED,
    label: "NOT INTERESTED",
    description: "Prospect declined or no current requirement",
  },
  {
    value: LeadStatus.NO_RESPONSE,
    label: "NO RESPONSE",
    description: "No answer after multiple reach outs",
  },
  {
    value: LeadStatus.WRONG_NUMBER,
    label: "WRONG NUMBER",
    description: "Invalid phone number or contact details",
  },
  {
    value: LeadStatus.ON_HOLD,
    label: "ON HOLD",
    description: "Temporarily paused by client request",
  },
  {
    value: LeadStatus.LOST,
    label: "LOST",
    description: "Deal lost to competition or cancelled",
  },
];

export const StatusChangeModal: React.FC<StatusChangeModalProps> = ({
  open,
  onClose,
  leadIds = [],
  leadCodes = [],
  currentStatus,
  onSuccess,
}) => {
  const [updateLeadStatus, { isLoading: isUpdatingSingle }] =
    useUpdateLeadStatusMutation();
  const [updateBulkLeadStatus, { isLoading: isUpdatingBulk }] =
    useUpdateBulkLeadStatusMutation();
  const isLoading = isUpdatingSingle || isUpdatingBulk;
  const [selectedStatus, setSelectedStatus] = useState<string>(() =>
    currentStatus ? String(currentStatus) : "",
  );
  const [note, setNote] = useState<string>("");

  if (!open || leadIds.length === 0) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStatus) {
      toast.error("Please select a target status");
      return;
    }

    try {
      if (leadIds.length === 1) {
        const res = await updateLeadStatus({
          id: leadIds[0],
          status: selectedStatus as LeadStatus,
          note: note.trim() || undefined,
        }).unwrap();

        toast.success(
          res.message || `Lead status updated to ${selectedStatus}`,
        );
      } else {
        // Atomic bulk status update via single backend transaction
        const res = await updateBulkLeadStatus({
          leadIds,
          status: selectedStatus as LeadStatus,
          note: note.trim() || "Bulk status update",
        }).unwrap();

        toast.success(
          res.message ||
            `Successfully updated status for ${leadIds.length} lead(s) to ${selectedStatus}`,
        );
      }

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err: unknown) {
      const errorObj = err as {
        data?: { message?: string; error?: { message?: string } };
      };
      const errorMessage =
        errorObj?.data?.message ||
        errorObj?.data?.error?.message ||
        "Failed to update lead status";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div
        role="dialog"
        aria-modal="true"
        className="bg-white dark:bg-slate-900 rounded-lg p-6 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col gap-4 text-left"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/50">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {leadIds.length === 1
                  ? "Update Lead Pipeline Status"
                  : `Bulk Update Status (${leadIds.length} Leads)`}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {leadIds.length === 1
                  ? "Transition this lead to a new stage in the conversion lifecycle"
                  : `Change pipeline stage across all ${leadIds.length} selected leads simultaneously`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Lead Target Information Pill */}
        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {leadIds.length === 1 ? "Target Lead:" : "Selected Leads:"}
            </span>
            <div className="flex flex-wrap items-center gap-1.5 min-w-0">
              {leadCodes.length > 0 ? (
                leadCodes.slice(0, 3).map((code) => (
                  <span
                    key={code}
                    className="font-mono text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800"
                  >
                    {code}
                  </span>
                ))
              ) : (
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {leadIds.length} leads
                </span>
              )}
              {leadCodes.length > 3 && (
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  +{leadCodes.length - 3} more
                </span>
              )}
            </div>
          </div>

          {currentStatus && (
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">
                Current:
              </span>
              <LeadStatusBadge status={currentStatus} />
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Target Pipeline Status <span className="text-rose-500">*</span>
            </label>
            <Select
              value={selectedStatus}
              onValueChange={(val) => setSelectedStatus(val || "")}
            >
              <SelectTrigger className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all">
                <SelectValue placeholder="Select target status..." />
              </SelectTrigger>
              <SelectContent className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl max-h-64">
                {AVAILABLE_STATUSES.map((st) => (
                  <SelectItem
                    key={st.value}
                    value={st.value}
                    className="text-xs cursor-pointer py-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {st.label}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-xs">
                        — {st.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Transition Note / Rationale{" "}
              <span className="text-slate-400 dark:text-slate-500 font-normal lowercase">
                (optional)
              </span>
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Log reason for status update, meeting outcome, or next steps..."
              className="w-full p-3 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all resize-none"
              disabled={isLoading}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !selectedStatus}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Update Status</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
