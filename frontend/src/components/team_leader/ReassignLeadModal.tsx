"use client";

import React, { useState } from "react";
import { UserCheck, ArrowRight, X, Check, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useReassignLeadsMutation, useGetSalesExecutivesQuery } from "@/store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ReassignLeadModalProps {
  open: boolean;
  onClose: () => void;
  leadIds: string[];
  leadCodes?: string[];
  currentAssigneeId?: string | null;
  currentAssigneeName?: string | null;
  onSuccess?: () => void;
}

const PRESET_REASONS = [
  "Workload rebalancing",
  "Sales executive unavailable / on leave",
  "Territory / Domain alignment",
  "Customer requested new representative",
  "Follow-up SLA escalation",
];

export const ReassignLeadModal: React.FC<ReassignLeadModalProps> = ({
  open,
  onClose,
  leadIds,
  leadCodes = [],
  currentAssigneeId,
  currentAssigneeName,
  onSuccess,
}) => {
  const [reassignLeads, { isLoading: isSubmitting }] =
    useReassignLeadsMutation();
  const { data: execsResponse, isLoading: isLoadingExecs } =
    useGetSalesExecutivesQuery();
  const executives = execsResponse?.data || [];

  const [targetExecutiveId, setTargetExecutiveId] = useState<string>("");
  const [reason, setReason] = useState<string>("Workload rebalancing");
  const [customNote, setCustomNote] = useState<string>("");

  if (!open || leadIds.length === 0) return null;

  const handlePresetSelect = (preset: string) => {
    setReason(preset);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (leadIds.length === 0) return;

    if (!targetExecutiveId) {
      toast.error("Please select a target sales executive for reassignment");
      return;
    }

    if (currentAssigneeId && targetExecutiveId === currentAssigneeId) {
      toast.error(
        "Target executive cannot be the same as the current assignee",
      );
      return;
    }

    const finalReason = customNote.trim()
      ? `${reason}: ${customNote.trim()}`
      : reason;

    try {
      const res = await reassignLeads({
        leadIds,
        targetExecutiveId,
        reason: finalReason,
      }).unwrap();

      const targetExecName =
        res.data?.targetExecutive ||
        executives.find((e) => e.id === targetExecutiveId)?.name ||
        "target executive";

      toast.success(
        res.message ||
          `Successfully reassigned ${leadIds.length} lead${
            leadIds.length > 1 ? "s" : ""
          } to ${targetExecName}`,
      );

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
        "Failed to reassign lead(s)";
      toast.error(errorMessage);
    }
  };

  const selectedExec = executives.find((e) => e.id === targetExecutiveId);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div
        role="dialog"
        aria-modal="true"
        className="bg-card dark:bg-slate-900 rounded-lg p-6 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col gap-4 text-left"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/50">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Reassign Lead{leadIds.length > 1 ? "s" : ""}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Transfer{" "}
                {leadIds.length === 1 ? "lead" : `${leadIds.length} leads`} to a
                new sales representative
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-card dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Informational Banner */}
        {currentAssigneeName && (
          <div className="p-3 rounded-lg bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
              <span className="text-slate-400 font-medium">
                Current Assignee:
              </span>
              <span className="font-bold text-blue-700 dark:text-blue-400">
                {currentAssigneeName}
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
            <div className="text-xs text-slate-700 dark:text-slate-300">
              <span className="text-slate-400 font-medium">Transfer To:</span>{" "}
              <span className="font-bold text-slate-900 dark:text-white">
                {selectedExec ? selectedExec.name : "Select Target"}
              </span>
            </div>
          </div>
        )}

        {/* Selected Leads Display */}
        {leadCodes.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Selected Lead Reference{leadCodes.length > 1 ? "s" : ""}:
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200/80 dark:border-slate-800">
              {leadCodes.map((code) => (
                <span
                  key={code}
                  className="px-2 py-0.5 font-mono text-[11px] font-semibold bg-card dark:bg-slate-800 text-blue-700 dark:text-blue-400 rounded-md border border-slate-200 dark:border-slate-700 shadow-2xs"
                >
                  {code}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Target Executive Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Assign to Representative <span className="text-rose-500">*</span>:
            </label>
            {isLoadingExecs ? (
              <div className="h-10 rounded-lg bg-card flex items-center justify-center text-xs text-slate-400 gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Loading available sales executives...</span>
              </div>
            ) : (
              <Select
                value={targetExecutiveId}
                onValueChange={(val: string | null) =>
                  setTargetExecutiveId(val || "")
                }
              >
                <SelectTrigger className="w-full text-xs h-10 rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:bg-card focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium">
                  <SelectValue placeholder="Select target sales representative" />
                </SelectTrigger>
                <SelectContent className="border border-slate-200 bg-card dark:bg-slate-800 shadow-md max-h-56">
                  {executives.map((exec) => {
                    const isCurrent = exec.id === currentAssigneeId;
                    return (
                      <SelectItem
                        key={exec.id}
                        value={exec.id}
                        disabled={isCurrent}
                        className="text-xs cursor-pointer"
                      >
                        <div className="flex items-center justify-between w-full gap-4">
                          <span
                            className={
                              isCurrent
                                ? "text-slate-400 line-through"
                                : "font-medium"
                            }
                          >
                            {exec.name} {isCurrent ? "(Current)" : ""}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-card dark:bg-slate-700 text-slate-500">
                            {exec.activeLeads || 0} active
                          </span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Preset Reasons */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Reason for Reassignment:
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {PRESET_REASONS.map((preset) => {
                const isSelected = reason === preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handlePresetSelect(preset)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer flex items-center gap-1 ${
                      isSelected
                        ? "bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-950/60 dark:border-blue-700 dark:text-blue-300 font-semibold"
                        : "bg-slate-50 hover:bg-card border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400"
                    }`}
                  >
                    {isSelected && (
                      <Check className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                    )}
                    <span>{preset}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Note */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Additional Transfer Context (Optional):
            </label>
            <textarea
              rows={2}
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="e.g. Lead requested technical architect consultation..."
              className="w-full p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all resize-none"
            />
          </div>

          {/* Modal Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-card dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !targetExecutiveId || isLoadingExecs}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Reassigning...</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>
                    Confirm Reassignment ({leadIds.length} Lead
                    {leadIds.length > 1 ? "s" : ""})
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReassignLeadModal;
