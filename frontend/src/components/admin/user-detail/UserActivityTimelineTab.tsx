"use client";

import React from "react";
import Link from "next/link";
import {
  History,
  PhoneCall,
  Calendar,
  FileText,
  Tag,
  ExternalLink,
  Clock,
  Activity,
  ArrowRightLeft,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { SalesExecutiveActivityItem } from "@/types/api.types";

interface UserActivityTimelineTabProps {
  activities: SalesExecutiveActivityItem[];
}

export const UserActivityTimelineTab: React.FC<
  UserActivityTimelineTabProps
> = ({ activities = [] }) => {
  const getActionDetails = (actionType: string) => {
    switch (actionType) {
      case "NOTE_ADDED":
        return {
          icon: <FileText className="w-3.5 h-3.5" />,
          color: "bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300",
          border: "border-blue-200 dark:border-blue-800",
          label: "Note Added",
        };
      case "FOLLOW_UP_SCHEDULED":
        return {
          icon: <Calendar className="w-3.5 h-3.5" />,
          color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300",
          border: "border-emerald-200 dark:border-emerald-800",
          label: "Follow-up Scheduled",
        };
      case "FOLLOW_UP_RESCHEDULED":
        return {
          icon: <Clock className="w-3.5 h-3.5" />,
          color: "bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300",
          border: "border-amber-200 dark:border-amber-800",
          label: "Follow-up Rescheduled",
        };
      case "CALL_LOGGED":
        return {
          icon: <PhoneCall className="w-3.5 h-3.5" />,
          color: "bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300",
          border: "border-purple-200 dark:border-purple-800",
          label: "Call Logged",
        };
      case "STATUS_CHANGED":
      case "STATUS_UPDATE":
        return {
          icon: <Tag className="w-3.5 h-3.5" />,
          color: "bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300",
          border: "border-blue-200 dark:border-blue-800",
          label: "Status Changed",
        };
      case "LEAD_ASSIGNED":
      case "LEAD_REASSIGNED":
        return {
          icon: <ArrowRightLeft className="w-3.5 h-3.5" />,
          color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950/80 dark:text-cyan-300",
          border: "border-cyan-200 dark:border-cyan-800",
          label: "Lead Assignment",
        };
      default:
        return {
          icon: <Activity className="w-3.5 h-3.5" />,
          color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
          border: "border-slate-200 dark:border-slate-700",
          label: actionType?.replace(/_/g, " ") || "Activity",
        };
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
      <div className="mb-6">
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <History className="w-4 h-4 text-blue-600" />
          Recent Activity Timeline ({activities.length})
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Chronological log of notes, calls, follow-up events, and status updates
        </p>
      </div>

      {activities.length === 0 ? (
        <div className="py-12 text-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
          <History className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="font-medium text-slate-600 dark:text-slate-300">
            No recent activity recorded.
          </p>
        </div>
      ) : (
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
          {activities.map((item) => {
            const details = getActionDetails(item.actionType);
            const date = new Date(item.createdAt);
            const timeAgo = formatDistanceToNow(date, { addSuffix: true });
            const fullDate = format(date, "dd MMM yyyy, p");

            return (
              <div key={item.id} className="relative group">
                {/* Timeline node icon */}
                <div
                  className={`absolute -left-[27px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center border shadow-xs ${details.color} ${details.border}`}
                >
                  {details.icon}
                </div>

                {/* Content Card */}
                <div className="bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors border border-slate-200 dark:border-slate-800/80 rounded-xl p-3.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {details.label}
                      </span>
                      {item.lead && (
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          on{" "}
                          <strong className="text-slate-700 dark:text-slate-300">
                            {item.lead.customerName}
                          </strong>
                        </span>
                      )}
                    </div>
                    <span
                      className="text-[11px] text-slate-400 dark:text-slate-500 font-medium"
                      title={fullDate}
                    >
                      {timeAgo}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {item.description}
                  </p>

                  {item.lead && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">
                        Lead: {item.lead.customerName}
                      </span>
                      <Link
                        href={`/admin/leads/${item.lead.id}`}
                        className="text-blue-600 dark:text-blue-400 hover:underline font-mono inline-flex items-center gap-1"
                      >
                        {item.lead.leadCode}
                        <ExternalLink className="w-3 h-3 opacity-70" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
