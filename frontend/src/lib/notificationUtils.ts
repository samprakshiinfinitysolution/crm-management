import {
  Bell,
  CalendarClock,
  UserCheck,
  ArrowRightLeft,
  RotateCcw,
  UserPlus,
  FileSpreadsheet,
  PieChart,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface NotificationMeta {
  Icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  category: string;
}

/**
 * Returns icon component, badge styling, and category metadata for a notification type.
 */
export const getNotificationMeta = (type: string): NotificationMeta => {
  const t = (type || "").toUpperCase();

  if (t.includes("REASSIGN")) {
    return {
      Icon: ArrowRightLeft,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
      category: "Reassignment",
    };
  }

  if (t.includes("RECALL")) {
    return {
      Icon: RotateCcw,
      iconBg: "bg-rose-50",
      iconColor: "text-rose-600",
      category: "Recall",
    };
  }

  if (t.includes("LEAD_CREATED") || t.includes("NEW_LEAD")) {
    return {
      Icon: UserPlus,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      category: "New Lead",
    };
  }

  if (t === "ASSIGNMENT" || t.includes("LEAD")) {
    return {
      Icon: UserCheck,
      iconBg: "bg-blue-50 dark:bg-blue-950/60",
      iconColor: "text-blue-600 dark:text-blue-400",
      category: "Lead Assignment",
    };
  }

  if (t === "FOLLOW_UP" || t.includes("FOLLOWUP") || t.includes("DUE")) {
    return {
      Icon: CalendarClock,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      category: "Follow-up",
    };
  }

  if (t.includes("IMPORT")) {
    return {
      Icon: FileSpreadsheet,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      category: "Import Batch",
    };
  }

  if (t.includes("REPORT") || t.includes("METRIC")) {
    return {
      Icon: PieChart,
      iconBg: "bg-cyan-50",
      iconColor: "text-cyan-600",
      category: "Reports & KPIs",
    };
  }

  if (t.includes("AUDIT")) {
    return {
      Icon: ShieldCheck,
      iconBg: "bg-card",
      iconColor: "text-slate-600",
      category: "Security & Audit",
    };
  }

  if (t.includes("USER") || t.includes("TEAM")) {
    return {
      Icon: Users,
      iconBg: "bg-teal-50",
      iconColor: "text-teal-600",
      category: "Team Member",
    };
  }

  return {
    Icon: Bell,
    iconBg: "bg-card",
    iconColor: "text-slate-600",
    category: "System Alert",
  };
};

/**
 * Resolves the target destination URL for a notification item.
 */
export const getNotificationLink = (
  item: {
    type?: string;
    title?: string;
    message?: string;
    link?: string | null;
  },
  isTL: boolean = false,
): string => {
  if (item.link) return item.link;

  const typeUpper = (item.type || "").toUpperCase();
  const titleLower = (item.title || "").toLowerCase();
  const messageLower = (item.message || "").toLowerCase();

  // Follow-ups
  if (
    typeUpper === "FOLLOW_UP" ||
    typeUpper.includes("FOLLOWUP") ||
    titleLower.includes("follow-up") ||
    titleLower.includes("followup") ||
    messageLower.includes("follow-up") ||
    messageLower.includes("followup")
  ) {
    return "/dashboard/follow-ups";
  }

  // Assignment / Leads
  if (
    typeUpper === "ASSIGNMENT" ||
    typeUpper.includes("LEAD") ||
    titleLower.includes("lead") ||
    messageLower.includes("lead") ||
    titleLower.includes("assigned")
  ) {
    return isTL ? "/dashboard/leads" : "/dashboard/my-leads";
  }

  // Imports
  if (
    typeUpper.includes("IMPORT") ||
    titleLower.includes("import") ||
    messageLower.includes("import")
  ) {
    return "/dashboard/imports";
  }

  // Distribution
  if (
    typeUpper.includes("DISTRIBUTION") ||
    titleLower.includes("distribution") ||
    messageLower.includes("distribution")
  ) {
    return "/dashboard/distributions";
  }

  // Reports
  if (
    typeUpper.includes("REPORT") ||
    titleLower.includes("report") ||
    messageLower.includes("report")
  ) {
    return "/dashboard/reports";
  }

  // Audit logs
  if (
    typeUpper.includes("AUDIT") ||
    titleLower.includes("audit") ||
    messageLower.includes("audit")
  ) {
    return "/dashboard/audit-logs";
  }

  // Users
  if (
    typeUpper.includes("USER") ||
    typeUpper.includes("TEAM") ||
    titleLower.includes("team") ||
    messageLower.includes("team")
  ) {
    return "/dashboard/users";
  }

  return "/dashboard";
};
