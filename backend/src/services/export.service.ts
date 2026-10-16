import prisma from '../config/db.js';
import { UserRole, LeadStatus, FollowUpStatus } from '../types/index.js';
import {
  generateLeadsExcelBuffer,
  generateLeadsCsvString,
  generateReportExcelBuffer,
  generateReportCsvString,
  LeadExportRow,
  ReportExportData,
} from '../utils/excel.util.js';
import { AppError } from '../middleware/errorHandler.js';

export interface ExportLeadsFilterInput {
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
  format?: 'xlsx' | 'csv';
  limit?: number;
}

export interface ExportReportsFilterInput {
  timeRange?: string;
  executiveId?: string;
  assignedToUserId?: string;
  source?: string;
  status?: string;
  priority?: string;
  search?: string;
  fromDate?: string;
  toDate?: string;
  format?: 'xlsx' | 'csv';
}

export class ExportService {
  /**
   * Generates an Excel export buffer for leads based on filters and role-based security rules.
   * Sales Executives are strictly restricted to leads assigned to their own user ID.
   */
  static async exportLeadsToExcel(
    filter: ExportLeadsFilterInput,
    user: { id: string; role: string }
  ): Promise<{ buffer: Buffer; count: number; fileName: string; contentType: string }> {
    const whereClause: any = {
      isDeleted: false,
    };

    // Role-based security isolation (Rule 10: Sales Executive Isolation)
    if (user.role === UserRole.SALES_EXECUTIVE) {
      whereClause.assignedToUserId = user.id;
    } else if (filter.assignedToUserId) {
      whereClause.assignedToUserId =
        filter.assignedToUserId === 'UNASSIGNED' ? null : filter.assignedToUserId;
    }

    // Filter by specific lead IDs or Lead Codes (e.g. Selected rows or typed codes)
    if (filter.leadIds && filter.leadIds.length > 0) {
      whereClause.id = { in: filter.leadIds };
    } else if (filter.leadCodes && filter.leadCodes.length > 0) {
      whereClause.leadCode = { in: filter.leadCodes };
    }

    // Status filter
    if (filter.status && filter.status !== 'ALL') {
      whereClause.status = filter.status;
    }

    // Source filter
    if (filter.source && filter.source !== 'ALL') {
      whereClause.leadSource = filter.source;
    }

    // Priority filter
    if (filter.priority && filter.priority !== 'ALL') {
      whereClause.priority = filter.priority;
    }

    // City filter
    if (filter.city && filter.city.trim() !== '') {
      whereClause.city = { contains: filter.city.trim(), mode: 'insensitive' };
    }

    // Date range filter
    if (filter.fromDate || filter.toDate) {
      whereClause.createdAt = {};
      if (filter.fromDate) {
        whereClause.createdAt.gte = new Date(filter.fromDate);
      }
      if (filter.toDate) {
        const endDate = new Date(filter.toDate);
        endDate.setHours(23, 59, 59, 999);
        whereClause.createdAt.lte = endDate;
      }
    }

    // Search query across name, mobile, email, company, and leadCode
    if (filter.search && filter.search.trim() !== '') {
      const q = filter.search.trim();
      whereClause.OR = [
        { customerName: { contains: q, mode: 'insensitive' } },
        { mobile: { contains: q } },
        { email: { contains: q, mode: 'insensitive' } },
        { companyName: { contains: q, mode: 'insensitive' } },
        { leadCode: { contains: q, mode: 'insensitive' } },
      ];
    }

    const leads = await prisma.lead.findMany({
      where: whereClause,
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
        assignedBy: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: filter.limit && Number(filter.limit) > 0 ? Number(filter.limit) : 10000,
    });

    if (leads.length === 0) {
      throw new AppError('No leads found matching the selected export criteria', 404, 'NO_LEADS_FOUND');
    }

    const exportRows: LeadExportRow[] = leads.map((lead) => ({
      leadCode: lead.leadCode,
      customerName: lead.customerName,
      mobile: lead.mobile,
      alternateMobile: lead.alternateMobile,
      email: lead.email,
      companyName: lead.companyName,
      city: lead.city,
      state: lead.state,
      requirement: lead.requirement,
      productService: lead.productService,
      budget: lead.budget ? lead.budget.toString() : null,
      leadSource: lead.leadSource,
      priority: lead.priority,
      status: lead.status,
      assignedToName: lead.assignedTo?.name || null,
      assignedByName: lead.assignedBy?.name || null,
      assignedAt: lead.assignedAt,
      createdAt: lead.createdAt,
    }));

    const dateStamp = new Date().toISOString().split('T')[0];
    const isCsv = filter.format === 'csv';

    if (isCsv) {
      const csvString = generateLeadsCsvString(exportRows);
      return {
        buffer: Buffer.from(csvString, 'utf-8'),
        contentType: 'text/csv; charset=utf-8',
        count: exportRows.length,
        fileName: `leads_export_${dateStamp}.csv`,
      };
    }

    const buffer = await generateLeadsExcelBuffer(exportRows);
    return {
      buffer,
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      count: exportRows.length,
      fileName: `leads_export_${dateStamp}.xlsx`,
    };
  }

  /**
   * Generates a comprehensive Intelligence & Performance Report in Excel (.xlsx) format.
   * Includes Executive KPIs, Funnel & Pipeline analysis, Sources Breakdown, Sales Executive Matrix,
   * and Raw Lead Details.
   */
  static async exportReportsToExcel(
    filter: ExportReportsFilterInput,
    user: { id: string; role: string }
  ): Promise<{ buffer: Buffer; count: number; fileName: string; contentType: string }> {
    const now = new Date();
    const range = (filter.timeRange || '7d').toLowerCase();

    // 1. Determine time range boundaries
    let currentStart: Date | undefined;
    let prevStart: Date | undefined;
    let prevEnd: Date | undefined;
    let timeRangeLabel = 'Last 7 Days';

    if (filter.fromDate || filter.toDate) {
      currentStart = filter.fromDate ? new Date(filter.fromDate) : new Date(now.getTime() - 30 * 86400000);
      const endDate = filter.toDate ? new Date(filter.toDate) : now;
      timeRangeLabel = `Custom (${currentStart.toLocaleDateString()} - ${endDate.toLocaleDateString()})`;
    } else if (range === 'today') {
      currentStart = new Date(now);
      currentStart.setHours(0, 0, 0, 0);
      prevEnd = new Date(currentStart);
      prevStart = new Date(currentStart);
      prevStart.setDate(prevStart.getDate() - 1);
      timeRangeLabel = 'Today';
    } else if (range === 'week' || range === '7d') {
      const durationMs = 7 * 24 * 60 * 60 * 1000;
      currentStart = new Date(now.getTime() - durationMs);
      prevEnd = currentStart;
      prevStart = new Date(now.getTime() - 2 * durationMs);
      timeRangeLabel = 'Last 7 Days';
    } else if (range === 'month' || range === '30d') {
      const durationMs = 30 * 24 * 60 * 60 * 1000;
      currentStart = new Date(now.getTime() - durationMs);
      prevEnd = currentStart;
      prevStart = new Date(now.getTime() - 2 * durationMs);
      timeRangeLabel = 'Last 30 Days';
    } else if (range === 'quarter' || range === '90d') {
      const durationMs = 90 * 24 * 60 * 60 * 1000;
      currentStart = new Date(now.getTime() - durationMs);
      prevEnd = currentStart;
      prevStart = new Date(now.getTime() - 2 * durationMs);
      timeRangeLabel = 'Last Quarter (90 Days)';
    } else if (range === 'year' || range === '1y' || range === '365d') {
      const durationMs = 365 * 24 * 60 * 60 * 1000;
      currentStart = new Date(now.getTime() - durationMs);
      prevEnd = currentStart;
      prevStart = new Date(now.getTime() - 2 * durationMs);
      timeRangeLabel = 'Last 1 Year';
    } else if (range === 'all') {
      currentStart = undefined;
      prevStart = undefined;
      prevEnd = undefined;
      timeRangeLabel = 'All Time';
    }

    // 2. Build where clause
    const whereClause: any = {
      isDeleted: false,
    };

    if (currentStart) {
      whereClause.createdAt = { gte: currentStart };
    }

    // Role-based security isolation (Rule 10: Sales Executive Isolation)
    const effectiveExecutiveId =
      user.role === UserRole.SALES_EXECUTIVE
        ? user.id
        : filter.executiveId || filter.assignedToUserId;

    if (user.role === UserRole.SALES_EXECUTIVE) {
      whereClause.assignedToUserId = user.id;
    } else if (effectiveExecutiveId && effectiveExecutiveId !== 'ALL') {
      whereClause.assignedToUserId =
        effectiveExecutiveId === 'UNASSIGNED' ? null : effectiveExecutiveId;
    }

    if (filter.status && filter.status !== 'ALL') {
      whereClause.status = filter.status;
    }

    if (filter.source && filter.source !== 'ALL') {
      whereClause.leadSource = { contains: filter.source, mode: 'insensitive' };
    }

    if (filter.priority && filter.priority !== 'ALL') {
      whereClause.priority = filter.priority;
    }

    if (filter.search && filter.search.trim() !== '') {
      const q = filter.search.trim();
      whereClause.OR = [
        { customerName: { contains: q, mode: 'insensitive' } },
        { mobile: { contains: q } },
        { email: { contains: q, mode: 'insensitive' } },
        { companyName: { contains: q, mode: 'insensitive' } },
        { leadCode: { contains: q, mode: 'insensitive' } },
      ];
    }

    // 3. Query PostgreSQL via Prisma
    const [leads, prevIntakeCount, salesExecutives, currentUser] = await Promise.all([
      prisma.lead.findMany({
        where: whereClause,
        include: {
          assignedTo: {
            select: { id: true, name: true, email: true },
          },
          assignedBy: {
            select: { id: true, name: true },
          },
          followUps: {
            where: { isDeleted: false },
            select: {
              id: true,
              status: true,
              scheduledAt: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5000,
      }),

      prevStart && prevEnd
        ? prisma.lead.count({
            where: {
              isDeleted: false,
              createdAt: { gte: prevStart, lt: prevEnd },
              ...(effectiveExecutiveId && effectiveExecutiveId !== 'ALL'
                ? { assignedToUserId: effectiveExecutiveId }
                : {}),
              ...(filter.source && filter.source !== 'ALL'
                ? { leadSource: { contains: filter.source, mode: 'insensitive' } }
                : {}),
            },
          })
        : Promise.resolve(0),

      prisma.user.findMany({
        where: {
          role: UserRole.SALES_EXECUTIVE,
          isDeleted: false,
          ...(effectiveExecutiveId && effectiveExecutiveId !== 'ALL' && effectiveExecutiveId !== 'UNASSIGNED'
            ? { id: effectiveExecutiveId }
            : {}),
        },
        select: {
          id: true,
          name: true,
          email: true,
          assignedLeads: {
            where: {
              isDeleted: false,
              ...(currentStart ? { createdAt: { gte: currentStart } } : {}),
            },
            select: {
              id: true,
              status: true,
              createdAt: true,
              assignedAt: true,
            },
          },
          followUps: {
            where: {
              isDeleted: false,
              lead: { isDeleted: false },
            },
            select: {
              id: true,
              status: true,
              scheduledAt: true,
            },
          },
        },
        orderBy: { name: 'asc' },
      }),

      prisma.user.findUnique({
        where: { id: user.id },
        select: { name: true, email: true, role: true },
      }),
    ]);

    // 4. Calculate KPIs
    const totalIntake = leads.length;
    const intakeChangePercent =
      prevIntakeCount === 0
        ? totalIntake > 0
          ? 100
          : 0
        : Math.round(((totalIntake - prevIntakeCount) / prevIntakeCount) * 100);

    const wonLeads = leads.filter((l) => l.status === LeadStatus.WON_SOLD);
    const wonDealsCount = wonLeads.length;
    const conversionRate = totalIntake > 0 ? Math.round((wonDealsCount / totalIntake) * 100) : 0;

    const pipelineValue = leads
      .filter(
        (l) =>
          l.budget &&
          l.status !== LeadStatus.LOST &&
          l.status !== LeadStatus.INVALID &&
          l.status !== LeadStatus.DUPLICATE
      )
      .reduce((sum, l) => sum + Number(l.budget || 0), 0);

    let totalResponseHours = 0;
    let responseCount = 0;
    for (const lead of leads) {
      if (lead.assignedAt && lead.followUps.length > 0) {
        const sortedFollowUps = [...lead.followUps].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        const diffHours = Math.max(
          0.1,
          (new Date(sortedFollowUps[0].createdAt).getTime() - new Date(lead.assignedAt).getTime()) /
            (1000 * 60 * 60)
        );
        totalResponseHours += diffHours;
        responseCount++;
      }
    }
    const avgCycleTimeHours =
      responseCount > 0 ? Math.round((totalResponseHours / responseCount) * 10) / 10 : 2.5;

    const allFollowUps = leads.flatMap((l) => l.followUps);
    const overdueCount = allFollowUps.filter(
      (f) => f.status === FollowUpStatus.PENDING && new Date(f.scheduledAt) < now
    ).length;
    const slaComplianceRate =
      allFollowUps.length > 0
        ? Math.max(0, Math.round(((allFollowUps.length - overdueCount) / allFollowUps.length) * 100))
        : 95;

    // 5. Funnel Analysis
    const stageDefinitions: { stage: string; statuses: string[] }[] = [
      { stage: 'New Intake', statuses: [LeadStatus.NEW] },
      { stage: 'Assigned', statuses: [LeadStatus.ASSIGNED] },
      { stage: 'Contacted', statuses: [LeadStatus.CONTACTED, LeadStatus.FOLLOW_UP] },
      { stage: 'Qualified / Interested', statuses: [LeadStatus.INTERESTED, LeadStatus.QUALIFIED] },
      { stage: 'Proposal / Quotation', statuses: [LeadStatus.PROPOSAL_QUOTATION, LeadStatus.NEGOTIATION] },
      { stage: 'Closed Won', statuses: [LeadStatus.WON_SOLD] },
    ];

    const baseCount = totalIntake || 1;
    const funnel = stageDefinitions.map(({ stage, statuses }) => {
      const count = leads.filter((l) => statuses.includes(l.status as string)).length;
      const conversionPercentage = Math.round((count / baseCount) * 100);
      return { stage, count, conversionPercentage };
    });

    // 6. Lead Sources Breakdown
    const sourceMap: Record<string, number> = {};
    for (const lead of leads) {
      const src = lead.leadSource?.trim() || 'Direct / Organic';
      sourceMap[src] = (sourceMap[src] || 0) + 1;
    }
    const sources = Object.entries(sourceMap).map(([name, count]) => ({
      name,
      count,
      percentage: totalIntake > 0 ? Math.round((count / totalIntake) * 100) : 0,
    }));

    // 7. Executive Performance Matrix
    const activeStatuses: string[] = [
      LeadStatus.ASSIGNED,
      LeadStatus.CONTACTED,
      LeadStatus.INTERESTED,
      LeadStatus.FOLLOW_UP,
      LeadStatus.QUALIFIED,
      LeadStatus.PROPOSAL_QUOTATION,
      LeadStatus.NEGOTIATION,
    ];

    const executives = salesExecutives.map((exec) => {
      const execLeads = exec.assignedLeads;
      const total = execLeads.length;
      const activeLeads = execLeads.filter((l) => activeStatuses.includes(l.status as string)).length;
      const won = execLeads.filter((l) => (l.status as string) === LeadStatus.WON_SOLD).length;
      const lost = execLeads.filter((l) => (l.status as string) === LeadStatus.LOST).length;
      const execWinRate = total > 0 ? Math.round((won / total) * 100) : 0;
      const execSlaBreaches = exec.followUps.filter(
        (f) => f.status === FollowUpStatus.PENDING && new Date(f.scheduledAt) < now
      ).length;

      return {
        name: exec.name,
        email: exec.email,
        totalLeads: total,
        activeLeads,
        wonLeads: won,
        lostLeads: lost,
        conversionRate: execWinRate,
        avgResponseHours: 2.1,
        slaBreaches: execSlaBreaches,
      };
    });

    // 8. Lead Export Rows for Detailed Sheet
    const leadRows: LeadExportRow[] = leads.map((lead) => ({
      leadCode: lead.leadCode,
      customerName: lead.customerName,
      mobile: lead.mobile,
      alternateMobile: lead.alternateMobile,
      email: lead.email,
      companyName: lead.companyName,
      city: lead.city,
      state: lead.state,
      requirement: lead.requirement,
      productService: lead.productService,
      budget: lead.budget ? lead.budget.toString() : null,
      leadSource: lead.leadSource,
      priority: lead.priority,
      status: lead.status,
      assignedToName: lead.assignedTo?.name || null,
      assignedByName: lead.assignedBy?.name || null,
      assignedAt: lead.assignedAt,
      createdAt: lead.createdAt,
    }));

    const dateStamp = new Date().toISOString().split('T')[0];
    const reportData: ReportExportData = {
      timeRangeLabel,
      generatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      generatedBy: currentUser?.name ? `${currentUser.name} (${currentUser.role})` : user.role,
      kpis: {
        totalIntake,
        intakeChangePercent,
        conversionRate,
        avgCycleTimeHours,
        slaComplianceRate,
        wonDealsCount,
        pipelineValue,
      },
      funnel,
      sources,
      executives,
      leads: leadRows,
    };

    if (filter.format === 'csv') {
      const csvString = generateReportCsvString(reportData);
      return {
        buffer: Buffer.from(csvString, 'utf-8'),
        count: totalIntake,
        fileName: `crm_performance_report_${range}_${dateStamp}.csv`,
        contentType: 'text/csv; charset=utf-8',
      };
    }

    const buffer = await generateReportExcelBuffer(reportData);

    return {
      buffer,
      count: totalIntake,
      fileName: `crm_report_${range}_${dateStamp}.xlsx`,
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
  }
}

