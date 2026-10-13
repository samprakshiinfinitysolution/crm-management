"use client";

import React, { useState } from "react";
import { RotateCcw, AlertTriangle, X, Check } from "lucide-react";
import { toast } from "sonner";
import { useRecallLeadsMutation } from "@/store";

interface RecallLeadModalProps {
  open: boolean;
  onClose: () => void;
  leadIds: string[];
  leadCodes?: string[];
  assignedExecutiveName?: string;
  onSuccess?: () => void;
}

const PRESET_REASONS = [
  "Workload rebalancing",
  "Sales executive unavailable / on leave",
  "Lead re-allocation needed",
  "Customer requested new representative",
  "SLA turnaround time overdue",
];

export const RecallLeadModal: React.FC<RecallLeadModalProps> = ({
  open,
  onClose,
  leadIds,
  leadCodes = [],
  assignedExecutiveName,
  onSuccess,
}) => {
  const [recallLeads, { isLoading }] = useRecallLeadsMutation();
  const [reason, setReason] = useState<string>("Workload rebalancing");
  const [customNote, setCustomNote] = useState<string>("");

  if (!open || leadIds.length === 0) return null;

  const handlePresetSelect = (preset: string) => {
    setReason(preset);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (leadIds.length === 0) return;

    const finalReason = customNote.trim()
      ? `${reason}: ${customNote.trim()}`
      : reason;

    try {
      const res = await recallLeads({
        leadIds,
        reason: finalReason,
      }).unwrap();

      toast.success(
        res.message ||
          `Successfully recalled ${leadIds.length} lead${
            leadIds.length > 1 ? "s" : ""
          } back to unassigned pool`,
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
        "Failed to recall lead(s) to unassigned pool";
      toast.error(errorMessage);
    }
  };

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
            <div className="w-10 h-10 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-100 dark:border-rose-900/50">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Recall Lead{leadIds.length > 1 ? "s" : ""} to Pool
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Revoke assignment and return{" "}
                {leadIds.length === 1 ? "lead" : `${leadIds.length} leads`} back
                to the unassigned queue
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-card dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Informational Banner */}
        <div className="p-3.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
            <span className="font-semibold">Important: </span>
            {assignedExecutiveName ? (
              <>
                This will unassign the lead from{" "}
                <span className="font-bold underline">
                  {assignedExecutiveName}
                </span>
                .
              </>
            ) : (
              "This will revoke existing executive ownership."
            )}{" "}
            An immutable audit record will be logged in the lead activity
            timeline.
          </div>
        </div>

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
          {/* Preset Reasons */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Reason for Recall:
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
                        ? "bg-rose-50 border-rose-300 text-rose-700 dark:bg-rose-950/60 dark:border-rose-700 dark:text-rose-300 font-semibold"
                        : "bg-slate-50 hover:bg-card border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400"
                    }`}
                  >
                    {isSelected && (
                      <Check className="w-3 h-3 text-rose-600 dark:text-rose-400" />
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
              Additional Note / Context (Optional):
            </label>
            <textarea
              rows={2}
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="e.g. Sales executive is on medical leave until next Monday..."
              className="w-full p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all resize-none"
            />
          </div>

          {/* Modal Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-card dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                  <span>Recalling...</span>
                </>
              ) : (
                <>
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>
                    Confirm Recall ({leadIds.length} Lead
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

export default RecallLeadModal;
