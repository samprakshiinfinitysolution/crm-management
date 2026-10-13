import React from "react";

interface LeadStatusBadgeProps {
  status: string;
}

export function LeadStatusBadge({ status }: LeadStatusBadgeProps) {
  const getStatusClass = (val: string) => {
    switch (val) {
      case "NEW":
        return "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800";
      case "ASSIGNED":
        return "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800";
      case "CONTACTED":
        return "bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800";
      case "INTERESTED":
        return "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800";
      case "FOLLOW_UP":
        return "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800";
      case "QUALIFIED":
        return "bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800";
      case "WON_SOLD":
        return "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 font-bold";
      case "LOST":
        return "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800";
      default:
        return "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700";
    }
  };

  return (
    <span
      className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${getStatusClass(
        status,
      )}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}

interface LeadPriorityBadgeProps {
  priority: string;
}

export function LeadPriorityBadge({ priority }: LeadPriorityBadgeProps) {
  const getPriorityClass = (val: string) => {
    switch (val) {
      case "URGENT":
        return "text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 font-bold";
      case "HIGH":
        return "text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800";
      case "MEDIUM":
        return "text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800";
      default:
        return "text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700";
    }
  };

  return (
    <span
      className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${getPriorityClass(
        priority,
      )}`}
    >
      {priority}
    </span>
  );
}
