export enum UserRole {
  ADMIN = "ADMIN",
  TEAM_LEADER = "TEAM_LEADER",
  SALES_EXECUTIVE = "SALES_EXECUTIVE",
}

export enum PriorityLevel {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

export enum LeadStatus {
  NEW = "NEW",
  ASSIGNED = "ASSIGNED",
  CONTACTED = "CONTACTED",
  INTERESTED = "INTERESTED",
  FOLLOW_UP = "FOLLOW_UP",
  QUALIFIED = "QUALIFIED",
  PROPOSAL_QUOTATION = "PROPOSAL_QUOTATION",
  NEGOTIATION = "NEGOTIATION",
  WON_SOLD = "WON_SOLD",
  NOT_INTERESTED = "NOT_INTERESTED",
  NO_RESPONSE = "NO_RESPONSE",
  WRONG_NUMBER = "WRONG_NUMBER",
  INVALID = "INVALID",
  DUPLICATE = "DUPLICATE",
  ON_HOLD = "ON_HOLD",
  LOST = "LOST",
  UNASSIGNED = "UNASSIGNED",
}

export enum FollowUpStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  MISSED = "MISSED",
}

// -------------------------------------------------------------
// Standard API Envelope
// -------------------------------------------------------------
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: {
    code: string;
    message?: string;
    details?: unknown;
  };
}

// -------------------------------------------------------------
// Auth Types
// -------------------------------------------------------------
export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  token?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponseData {
  user: AuthUser;
  token?: string;
  accessToken?: string;
}

export type AuthResponse = ApiResponse<AuthResponseData>;

// -------------------------------------------------------------
// Lead & CRM Types
// -------------------------------------------------------------
export interface LeadItem {
  id: string;
  leadCode: string;
  customerName: string;
  mobile: string;
  alternateMobile?: string | null;
  email?: string | null;
  companyName?: string | null;
  city?: string | null;
  state?: string | null;
  requirement: string;
  productService?: string | null;
  budget?: number | string | null;
  leadSource?: string | null;
  source?: string | null;
  priority: PriorityLevel;
  status: LeadStatus;
  notes?: string | null;
  assignedToUserId?: string | null;
  assignedToId?: string | null;
  assignedTo?: {
    id: string;
    name: string;
    email: string;
  } | null;
  assignedByUserId?: string | null;
  assignedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LeadFilterParams {
  status?: LeadStatus | string;
  source?: string;
  search?: string;
  city?: string;
  sortBy?: string;
  assignedToUserId?: string;
  unassignedOnly?: boolean;
  page?: number;
  limit?: number;
  priority?: PriorityLevel | string;
}
export interface LeadNoteItem {
  id: string;
  leadId: string;
  content: string;
  authorUserId: string;
  createdAt: string;
  author?: {
    id: string;
    name: string;
    email: string;
  } | null;
  lead?: {
    id: string;
    leadCode: string;
    customerName: string;
  } | null;
}

export interface AddLeadNotePayload {
  id: string;
  note: string;
}

// -------------------------------------------------------------
// Lead Distribution Types
// -------------------------------------------------------------
export type DistributionMode = "EQUAL_SPLIT" | "FIXED_QUOTA" | "WEIGHTED_TIER";

export interface DistributionPayload {
  mode: AssignMode;
  targetExecutiveIds?: string[];
  quotas?: Record<string, number>; // Used for FIXED_QUOTA
  leadIds?: string[]; // Optional specific leads, otherwise unassigned pool is used
  maxLeads?: number;
  executiveIds?: string[];
  allocations?: { salesExecutiveId: string; count: number }[];
  assignments?: { leadId: string; salesExecutiveId: string }[];
  reason?: string;
}

export interface DistributionResult {
  distributedCount: number;
  allocations: {
    executiveId: string;
    executiveName: string;
    allocatedCount: number;
  }[];
}

// -------------------------------------------------------------
// Executive Workload & Analytics Types
// -------------------------------------------------------------
export interface ExecutiveWorkloadItem {
  id: string;
  name: string;
  email: string;
  activeLeads: number;
  conversionRate: number;
  capacityPercentage: number;
  status: "OPTIMAL" | "NEAR_CAPACITY" | "OVERLOADED";
}

export interface PipelineMetrics {
  totalLeads: number;
  unassignedCount: number;
  assignedCount: number;
  convertedCount: number;
  conversionRate: number;
  pipelineValue: number;
}

export interface CriticalEscalationItem {
  id: string;
  leadId: string;
  leadCode: string;
  customerName: string;
  reason: string;
  assignedToName: string;
  elapsedHours: number;
  severity: "HIGH" | "CRITICAL";
}

export interface SalesExecutiveSummary {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  isOnline?: boolean;
  createdAt: string;
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

export interface SalesExecutiveFollowUpItem {
  id: string;
  leadId: string;
  scheduledAt: string;
  type: string;
  status: FollowUpStatus;
  notes?: string | null;
  lead?: {
    id: string;
    leadCode: string;
    customerName: string;
    mobile: string;
    status: LeadStatus;
  } | null;
}

export interface SalesExecutiveActivityItem {
  id: string;
  actionType: string;
  description: string;
  createdAt: string;
  lead?: {
    id: string;
    leadCode: string;
    customerName: string;
  } | null;
}

export interface SalesExecutiveDetail extends SalesExecutiveSummary {
  statusBreakdown: Record<string, number>;
  leads: LeadItem[];
  upcomingFollowUps: SalesExecutiveFollowUpItem[];
  recentActivities: SalesExecutiveActivityItem[];
}

// -------------------------------------------------------------
// Report & Analytics Types
// -------------------------------------------------------------
export interface ReportKPIsData {
  totalIntake: number;
  intakeChangePercent: number;
  conversionRate: number;
  avgCycleTimeHours: number;
  slaComplianceRate: number;
  wonDealsCount: number;
  pipelineValue?: number;
}

export interface ReportFunnelStage {
  stage: string;
  count: number;
  conversionPercentage: number;
}

export interface ReportChannelSource {
  name: string;
  count: number;
  percentage: number;
  color?: string;
}

export interface ReportExecutiveScorecard {
  id: string;
  name: string;
  email: string;
  activeLeads: number;
  wonLeads: number;
  lostLeads: number;
  conversionRate: number;
  avgResponseHours: number;
  slaBreaches: number;
}

export interface ReportSummaryData {
  kpis: ReportKPIsData;
  funnel: ReportFunnelStage[];
  sources?: ReportChannelSource[];
  executives: ReportExecutiveScorecard[];
}

export interface ReportQueryParams {
  timeRange?: string;
  executiveId?: string;
  source?: string;
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

export interface TLDashboardSupervisor {
  id: string;
  name: string;
  email: string;
  role: UserRole | string;
  avatar?: string;
  shiftStatus?: string;
  currentDate?: string;
  quickCounts?: {
    unassignedCount: number;
    lastBatchInfo: {
      id: string;
      fileName: string;
      totalRows: number;
      importedCount: number;
      createdAt: string;
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
    createdAt: string;
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
  scheduledAt: string;
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
  createdAt: string;
  integrityStatus: string;
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

// -------------------------------------------------------------
// Sheet Import / Ingestion Types
// -------------------------------------------------------------
export interface StagedLeadRow {
  id?: string;
  rowNumber?: number;
  customerName: string;
  mobile: string;
  alternateMobile?: string | null;
  email?: string | null;
  companyName?: string | null;
  city?: string | null;
  state?: string | null;
  requirement?: string | null;
  productService?: string | null;
  budget?: string | number | null;
  leadSource?: string | null;
  source?: string | null;
  priority?: PriorityLevel | string;
  remarks?: string | null;
  status: "VALID" | "DUPLICATE" | "INVALID";
  validationNote?: string;
  duplicateWithLeadCode?: string | null;
  rawRowData?: Record<string, unknown>;
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
  rows: StagedLeadRow[];
}

export interface CommitImportResult {
  batchId: string;
  fileName: string;
  totalRows: number;
  importedCount: number;
  duplicateCount: number;
  failedCount: number;
}

export type AssignMode = "EQUAL" | "CUSTOM" | "EXPLICIT";

// -------------------------------------------------------------
// Follow-Up Types
// -------------------------------------------------------------
export type FollowUpType = "Call" | "Meeting" | "Email" | "WhatsApp";
export type FollowUpScope =
  | "today"
  | "upcoming"
  | "overdue"
  | "completed"
  | "all";

export interface FollowUpItem {
  id: string;
  leadId: string;
  assignedToUserId: string;
  scheduledAt: string;
  type: FollowUpType;
  status: FollowUpStatus;
  notes?: string | null;
  completedAt?: string | null;
  createdAt: string;
  lead?: {
    id: string;
    leadCode: string;
    customerName: string;
    mobile: string;
    companyName?: string | null;
    status: LeadStatus;
    priority: PriorityLevel;
  } | null;
  assignedTo?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export interface FollowUpSummary {
  dueToday: number;
  upcoming: number;
  overdue: number;
  completedThisMonth: number;
}

export interface CreateFollowUpPayload {
  leadId: string;
  scheduledAt: string;
  type: FollowUpType;
  notes?: string;
}

export interface CompleteFollowUpPayload {
  notes?: string;
  nextStatus?: LeadStatus;
  nextFollowUpAt?: string;
  nextFollowUpType?: FollowUpType;
}

export interface RescheduleFollowUpPayload {
  newScheduledAt: string;
  newType?: FollowUpType;
  reason?: string;
}

export interface FollowUpQueryParams {
  scope?: FollowUpScope;
  leadId?: string;
  executiveId?: string;
  page?: number;
  limit?: number;
}

export interface ImportBatchSummary {
  id: string;
  batchCode?: string;
  fileName: string;
  totalRows: number;
  importedCount: number;
  duplicateCount: number;
  failedCount: number;
  status: string;
  createdAt: string;
  uploadedBy?: {
    id: string;
    name: string;
    email?: string;
  } | null;
  errors?: Array<{ row?: number; message: string; field?: string }> | null;
}

export interface ExportLeadsPayload {
  leadIds?: string[];
  leadCodes?: string[];
  status?: string;
  source?: string;
  city?: string;
  priority?: string;
  assignedToUserId?: string;
  search?: string;
  fromDate?: string;
  toDate?: string;
  format?: "xlsx" | "csv";
  limit?: number;
}

export interface ExecutivePerformanceScorecard extends ReportExecutiveScorecard {
  totalAssigned?: number;
  slaComplianceRate?: number;
  throughputScore?: number;
  responseVelocityRating?: "FAST" | "AVERAGE" | "SLOW";
  pipelineValue?: number;
  wonRevenue?: number;
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

// -------------------------------------------------------------
// Chat / Conversation Types
// -------------------------------------------------------------
export type ConversationType = "DIRECT" | "GROUP";
export type ConversationRole = "MEMBER" | "ADMIN";
export type MessageType = "TEXT" | "IMAGE" | "FILE" | "SYSTEM";

/** Lightweight user profile embedded on a conversation participant. */
export interface ConversationUserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}

export interface ConversationParticipant {
  id: string;
  conversationId: string;
  userId: string;
  role: ConversationRole;
  joinedAt: string;
  lastReadAt: string | null;
  isArchived: boolean;
  isMuted: boolean;
  user?: ConversationUserProfile;
}

export interface ConversationMessage {
  id: string;
  conversationId: string;
  senderId: string;
  type: MessageType;
  content: string;
  createdAt: string;
  editedAt: string | null;
  deletedAt: string | null;
}

export interface Conversation {
  id: string;
  type: ConversationType;
  title: string | null;
  directKey: string | null;
  createdById: string | null;
  createdAt: string;
  updatedAt: string;
  participants: ConversationParticipant[];
  messages: ConversationMessage[];
}
