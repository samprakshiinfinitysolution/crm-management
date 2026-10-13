"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Phone,
  Mail,
  Video,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  MessageSquare,
  ListTodo,
} from "lucide-react";
import { format, isPast } from "date-fns";
import { SalesExecutiveFollowUpItem } from "@/types/api.types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserFollowUpsTabProps {
  followUps: SalesExecutiveFollowUpItem[];
}

export const UserFollowUpsTab: React.FC<UserFollowUpsTabProps> = ({
  followUps = [],
}) => {
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredFollowUps = useMemo(() => {
    return followUps.filter((item) => {
      if (statusFilter !== "ALL" && item.status !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [followUps, statusFilter]);

  const getTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case "call":
        return <Phone className="w-3.5 h-3.5" />;
      case "email":
        return <Mail className="w-3.5 h-3.5" />;
      case "meeting":
        return <Video className="w-3.5 h-3.5" />;
      default:
        return <Calendar className="w-3.5 h-3.5" />;
    }
  };

  const getStatusBadge = (status: string, scheduledAt: string) => {
    const isOverdue =
      status === "PENDING" && scheduledAt && isPast(new Date(scheduledAt));

    if (isOverdue || status === "MISSED") {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900">
          <AlertTriangle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
          {status === "MISSED" ? "Missed" : "Overdue"}
        </span>
      );
    }

    if (status === "COMPLETED") {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          Completed
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800">
        <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
        Pending
      </span>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ListTodo className="w-4 h-4 text-blue-600" />
            Scheduled Follow-ups ({followUps.length})
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Active commitments, call reminders, and scheduled touchpoints
          </p>
        </div>

        <Select
          value={statusFilter}
          onValueChange={(val) => {
            if (val) setStatusFilter(val);
          }}
        >
          <SelectTrigger className="h-8 text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer">
            <SelectValue placeholder="All Follow-ups" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Follow-ups</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="MISSED">Missed / Overdue</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Follow-up Cards */}
      {filteredFollowUps.length === 0 ? (
        <div className="py-12 text-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
          <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="font-medium text-slate-600 dark:text-slate-300">
            No follow-ups recorded for this filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredFollowUps.map((item) => {
            const scheduledDate = item.scheduledAt
              ? new Date(item.scheduledAt)
              : null;
            const isOverdue =
              item.status === "PENDING" &&
              scheduledDate &&
              isPast(scheduledDate);

            return (
              <div
                key={item.id}
                className={`rounded-xl border p-4 transition-all ${
                  isOverdue || item.status === "MISSED"
                    ? "border-rose-200 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/20"
                    : "border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-blue-100/80 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300">
                      {getTypeIcon(item.type)}
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                      {item.type || "Call"}
                    </span>
                  </div>
                  {getStatusBadge(item.status, item.scheduledAt)}
                </div>

                <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-medium">
                    {scheduledDate
                      ? format(scheduledDate, "EEEE, dd MMM yyyy 'at' p")
                      : "No date specified"}
                  </span>
                </div>

                {/* Lead context */}
                {item.lead && (
                  <div className="mt-3 pt-3 border-t border-slate-200/70 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {item.lead.customerName}
                      </span>
                      {item.lead.mobile && (
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                          {item.lead.mobile}
                        </span>
                      )}
                    </div>
                    <Link
                      href={`/admin/leads/${item.lead.id}`}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-mono inline-flex items-center gap-1"
                    >
                      {item.lead.leadCode}
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                )}

                {/* Notes */}
                {item.notes && (
                  <div className="mt-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                    <MessageSquare className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <p className="italic">&ldquo;{item.notes}&rdquo;</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
