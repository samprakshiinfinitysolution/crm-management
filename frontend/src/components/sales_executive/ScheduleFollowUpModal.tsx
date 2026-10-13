"use client";

import React, { useState } from "react";
import {
  X,
  Calendar,
  Phone,
  Users,
  Mail,
  MessageSquare,
  Clock,
} from "lucide-react";
import { useCreateFollowUpMutation } from "@/store/api/followUpApi";
import { toast } from "sonner";
import type { FollowUpType } from "@/types/api.types";
import { DatePicker } from "@/components/ui/DatePicker";

interface ScheduleFollowUpModalProps {
  leadId: string;
  leadCode: string;
  customerName: string;
  open: boolean;
  onClose: () => void;
}

const FOLLOW_UP_TYPES: {
  value: FollowUpType;
  label: string;
  icon: React.ReactNode;
}[] = [
  { value: "Call", label: "Phone Call", icon: <Phone className="w-4 h-4" /> },
  { value: "Meeting", label: "Meeting", icon: <Users className="w-4 h-4" /> },
  { value: "Email", label: "Email", icon: <Mail className="w-4 h-4" /> },
  {
    value: "WhatsApp",
    label: "WhatsApp",
    icon: <MessageSquare className="w-4 h-4" />,
  },
];

function getTomorrowISO() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(10, 0, 0, 0);
  return d.toISOString().slice(0, 16);
}

export default function ScheduleFollowUpModal({
  leadId,
  leadCode,
  customerName,
  open,
  onClose,
}: ScheduleFollowUpModalProps) {
  const [type, setType] = useState<FollowUpType>("Call");
  const [scheduledAt, setScheduledAt] = useState<string>(getTomorrowISO());
  const [notes, setNotes] = useState<string>("");

  const [createFollowUp, { isLoading }] = useCreateFollowUpMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduledAt) {
      toast.error("Please select a date and time for the follow-up.");
      return;
    }

    const scheduledDate = new Date(scheduledAt);
    if (isNaN(scheduledDate.getTime())) {
      toast.error("Invalid date/time selected.");
      return;
    }

    try {
      await createFollowUp({
        leadId,
        scheduledAt: scheduledDate.toISOString(),
        type,
        notes: notes.trim() || undefined,
      }).unwrap();

      toast.success("Follow-up scheduled successfully!");
      setNotes("");
      onClose();
    } catch (err: unknown) {
      const errorObj = err as { data?: { message?: string } };
      toast.error(
        errorObj?.data?.message ||
          "Failed to schedule follow-up. Please try again.",
      );
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="relative bg-card border border-crm-subtle rounded-lg shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-crm-subtle">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shadow-2xs">
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-crm-primary">
                Schedule Follow-Up
              </h2>
              <p className="text-[11px] text-crm-muted">
                {leadCode} · {customerName}
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
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          {/* Interaction Type */}
          <div>
            <label className="block text-xs font-semibold text-crm-secondary mb-2">
              Interaction Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {FOLLOW_UP_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                    type === t.value
                      ? "bg-blue-50 border-blue-300 text-blue-700 shadow-2xs font-semibold"
                      : "bg-card border-crm-subtle text-crm-secondary hover:bg-crm-subtle"
                  }`}
                >
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date & Time */}
          <div>
            <label className="block text-xs font-semibold text-crm-secondary mb-2">
              <Clock className="w-3.5 h-3.5 inline mr-1.5 opacity-70" />
              Date & Time
            </label>
            <DatePicker
              value={scheduledAt}
              onChange={(val) => setScheduledAt(val)}
              minDate={new Date()}
              placeholder="Select follow-up date & time"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-crm-secondary mb-2">
              Agenda / Notes{" "}
              <span className="text-crm-muted font-normal">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What is the objective of this follow-up?"
              rows={3}
              maxLength={2000}
              className="w-full bg-card border border-crm-subtle rounded-lg px-3 py-2.5 text-sm text-crm-primary placeholder:text-crm-muted focus:outline-none focus:border-crm-brand transition-colors resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
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
              className="flex-1 px-4 py-2.5 rounded-lg bg-crm-brand hover:bg-crm-brand-hover disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors cursor-pointer shadow-xs"
            >
              {isLoading ? "Scheduling..." : "Schedule Follow-Up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
