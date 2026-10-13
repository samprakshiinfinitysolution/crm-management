import type { Request } from "express";
import {
  UserRole,
  LeadStatus,
  PriorityLevel,
  FollowUpStatus,
  FollowUpOutcome,
} from "@prisma/client";

export {
  UserRole,
  LeadStatus,
  PriorityLevel,
  FollowUpStatus,
  FollowUpOutcome,
};



export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthenticatedUser {
  id: string;
  name?: string;
  email: string;
  role: UserRole;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

export interface ExecutiveMetrics {
  totalAssignedLeads: number;
  activeLeads: number;
  convertedLeads: number;
  lostLeads: number;
  followUpsPending: number;
  followUpsOverdue: number;
  conversionRate: number;
  capacityPercentage: number;
  totalPipelineValue: number;
  workloadStatus: "OPTIMAL" | "NEAR_CAPACITY" | "OVERLOADED";
  statusBreakdown?: Record<string, number>;
}

export interface SalesExecutiveSummary {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  isOnline?: boolean;
  createdAt: Date | string;
  totalAssignedLeads: number;
  activeLeads: number;
  convertedLeads: number;
  lostLeads: number;
  followUpsPending: number;
  followUpsOverdue: number;
  conversionRate: number;
  capacityPercentage: number;
  totalPipelineValue: number;
  workloadStatus: "OPTIMAL" | "NEAR_CAPACITY" | "OVERLOADED";
}

export interface SalesExecutiveDetail extends SalesExecutiveSummary {
  statusBreakdown: Record<string, number>;
  leads: any[];
  recentActivities: any[];
  upcomingFollowUps: any[];
}

export interface StagedLeadRow {
  rowNumber: number;
  customerName: string;
  mobile: string;
  alternateMobile?: string | null;
  email?: string | null;
  companyName?: string | null;
  city?: string | null;
  state?: string | null;
  requirement: string;
  productService?: string | null;
  budget?: number | null;
  leadSource?: string | null;
  priority: PriorityLevel;
  remarks?: string | null;
  status: "VALID" | "DUPLICATE" | "INVALID";
  validationNote: string;
  duplicateWithLeadCode?: string | null;
  rawRowData?: Record<string, any>;
}

export interface ImportPreviewResult {
  fileName: string;
  totalRows: number;
  validCount: number;
  duplicateCount: number;
  invalidCount: number;
  headersDetected: string[];
  rows: StagedLeadRow[];
}

export interface CommitImportPayload {
  fileName?: string;
  skipDuplicates?: boolean;
  rows?: StagedLeadRow[];
}

export interface CommitImportResult {
  batchId: string;
  fileName: string;
  totalRows: number;
  importedCount: number;
  duplicateCount: number;
  failedCount: number;
  importedLeadCodes: string[];
}

export type AssignMode = "EQUAL" | "CUSTOM" | "EXPLICIT";

export interface CustomAllocation {
  salesExecutiveId: string;
  count: number;
}

export interface ExplicitAssignment {
  leadId: string;
  salesExecutiveId: string;
}

export interface AssignLeadInput {
  mode: AssignMode;
  leadIds?: string[];
  executiveIds?: string[];
  allocations?: CustomAllocation[];
  assignments?: ExplicitAssignment[];
  reason?: string;
}

export interface LeadAssignmentPair {
  leadId: string;
  salesExecutiveId: string;
}

export interface AssignLeadsResult {
  assignedCount: number;
  mode: AssignMode;
  allocations: {
    salesExecutiveId: string;
    executiveName: string;
    count: number;
  }[];
  assignments: LeadAssignmentPair[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code?: string;
    details?: any;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TLDashboardSupervisor {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  shiftStatus?: string;
  currentDate: string;
  quickCounts: {
    unassignedCount: number;
    lastBatchInfo: {
      id: string;
      fileName: string;
      totalRows: number;
      importedCount: number;
      createdAt: Date | string;
    } | null;
  };
}

export interface TLDashboardUrgentAttention {
  unassignedCount: number;
  latestBatch: {
    id: string;
    fileName: string;
    totalRows: number;
    importedCount: number;
    createdAt: Date | string;
  } | null;
  activeExecutivesCount: number;
}

export interface TLDashboardPipelineHealth {
  totalPool: {
    value: number;
    formattedValue: string;
    change?: string;
    subtext?: string;
    isPositive?: boolean;
  };
  activeInFlight: {
    value: number;
    formattedValue: string;
    callsToday: number;
    subtext: string;
  };
  wonARR: {
    value: number;
    formattedValue: string;
    wonCount: number;
    conversionRate: number;
    subtext: string;
  };
  slaAdherence: {
    value: number;
    formattedValue: string;
    overdueCount: number;
    alertBadge?: string;
  };
}

export interface TLDashboardFunnelStage {
  key: string;
  label: string;
  count: number;
  pct: number;
  totalValue: number;
  colorClass: string;
  dotBg: string;
}

export interface TLDashboardFunnelBreakdown {
  totalMappedLeads: number;
  stages: TLDashboardFunnelStage[];
}

export interface TLDashboardExecutiveWorkload {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  roleBadge?: string;
  statusText: string;
  isStatusPositive?: boolean;
  isOnline: boolean;
  wonAmount: number;
  formattedWonAmount: string;
  wonCount: number;
  activeCount: number;
  dueTodayCount: number;
  overdueCount: number;
  slaPercent: number;
  capacityPercent: number;
  capacityWarning: boolean;
  actionType: "assign" | "nudge" | "reassign";
}

export interface TLDashboardCriticalEscalation {
  id: string;
  leadId?: string;
  leadCode: string;
  companyName: string;
  customerName: string;
  stageInfo: string;
  arrAmount: number;
  formattedArrAmount: string;
  overdueHours: number;
  ownerId: string;
  ownerName: string;
  priority: PriorityLevel | string;
  scheduledAt: Date | string;
}

export interface TLDashboardRecentIntake {
  batchId: string;
  batchCode: string;
  fileName: string;
  totalRows: number;
  importedCount: number;
  duplicateCount: number;
  failedCount: number;
  uploadedBy: {
    id: string;
    name: string;
  };
  createdAt: Date | string;
  integrityStatus?: string;
}

export interface DashboardMonthlySalesItem {
  month: string;
  year: number;
  totalLeads: number;
  wonLeads: number;
  grossAmount: number;
  netAmount: number;
  height: number;
  formattedValue: string;
}

export interface DashboardCategoryShareItem {
  label: string;
  count: number;
  percentage: number;
  color: string;
  dotColor: string;
}

export interface DashboardDealItem {
  id: string;
  leadCode: string;
  name: string;
  category: string;
  amount: string;
  budget: number;
  dotColor: string;
  status: string;
}

export interface TLDashboardMetrics {
  supervisor: TLDashboardSupervisor;
  urgentAttention: TLDashboardUrgentAttention;
  pipelineHealth: TLDashboardPipelineHealth;
  funnelBreakdown: TLDashboardFunnelBreakdown;
  executiveWorkload: TLDashboardExecutiveWorkload[];
  criticalEscalations: TLDashboardCriticalEscalation[];
  recentIntake: TLDashboardRecentIntake | null;
  monthlySales?: DashboardMonthlySalesItem[];
  categoryBreakdown?: DashboardCategoryShareItem[];
  topDeals?: DashboardDealItem[];
  recentLeads?: DashboardDealItem[];
}

export interface AdminDashboardMetrics {
  admin: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
  overview: {
    totalLeads: number;
    unassignedLeads: number;
    assignedLeads: number;
    activeLeads: number;
    wonLeads: number;
    lostLeads: number;
    totalUsers: number;
    totalAdmins: number;
    totalTeamLeaders: number;
    totalSalesExecutives: number;
    conversionRate: number;
    totalPipelineValue: number;
    formattedPipelineValue: string;
    totalWonRevenue: number;
    formattedWonRevenue: string;
    avgDealSize: number;
    formattedAvgDealSize: string;
    leadGrowthRateWoW: number;
  };
  followUps: {
    total: number;
    pending: number;
    completed: number;
    dueToday: number;
    overdue: number;
    slaComplianceRate: number;
  };
  pipelineHealth: TLDashboardPipelineHealth;
  funnelBreakdown: TLDashboardFunnelBreakdown;
  executiveWorkload: TLDashboardExecutiveWorkload[];
  criticalEscalations: TLDashboardCriticalEscalation[];
  recentIntake: TLDashboardRecentIntake | null;
  monthlySales?: DashboardMonthlySalesItem[];
  categoryBreakdown?: DashboardCategoryShareItem[];
  topDeals?: DashboardDealItem[];
  recentLeads?: DashboardDealItem[];
}

export interface SEDashboardMetrics {
  totalAssigned: number;
  activeCount: number;
  newCount: number;
  wonCount: number;
  lostCount: number;
  todayFollowUpsCount: number;
  overdueFollowUpsCount: number;
  totalPipelineValue?: number;
  formattedPipelineValue?: string;
  wonValue?: number;
  formattedWonValue?: string;
  conversionRate?: number;
  monthlySales?: DashboardMonthlySalesItem[];
  categoryBreakdown?: DashboardCategoryShareItem[];
  topDeals?: DashboardDealItem[];
  recentLeads?: DashboardDealItem[];
}

export interface ExecutivePerformanceScorecard {
  id: string;
  name: string;
  email: string;
  totalAssigned: number;
  activeLeads: number;
  wonLeads: number;
  lostLeads: number;
  conversionRate: number;
  avgResponseHours: number;
  slaBreaches: number;
  slaComplianceRate: number;
  throughputScore: number;
  responseVelocityRating: 'FAST' | 'AVERAGE' | 'SLOW';
  pipelineValue: number;
  wonRevenue: number;
}

export interface PerformanceReportSummary {
  totalExecutives: number;
  totalAssigned: number;
  totalWon: number;
  totalLost: number;
  overallConversionRate: number;
  overallAvgResponseHours: number;
  totalSlaBreaches: number;
  overallSlaComplianceRate: number;
  totalWonRevenue: number;
  totalPipelineValue: number;
  timeRange: string;
  timeRangeLabel: string;
}

export interface PerformanceReportData {
  summary: PerformanceReportSummary;
  executives: ExecutivePerformanceScorecard[];
}

export interface BulkLeadStatusInput {
  leadIds: string[];
  status: LeadStatus;
  note?: string;
}
