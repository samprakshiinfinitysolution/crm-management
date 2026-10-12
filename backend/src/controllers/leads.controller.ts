import { Response, NextFunction } from "express";
import { bulkLeadStatusSchema, LeadService } from "../services/lead.service.js";
import { NotificationService } from "../services/notification.service.js";
import {
  ApiResponse,
  AuthRequest,
  AssignLeadInput,
  UserRole,
  BulkLeadStatusInput,
} from "../types/index.js";
import { getAuthUser } from "../utils/auth.helper.js";
import { AppError } from "../middleware/errorHandler.js";

export const getLeadsWithFilter = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = getAuthUser(req);
    const {
      status,
      source,
      city,
      sortBy,
      page,
      limit,
      assignedToUserId,
      search,
      priority,
    } = req.query;

    const result = await LeadService.getLeadWithFilter(
      user.id,
      typeof status === "string" && status !== "ALL" ? status : undefined,
      typeof source === "string" && source !== "ALL" ? source : undefined,
      typeof city === "string" ? city : undefined,
      typeof sortBy === "string" ? sortBy : undefined,
      page ? Number(page) : 1,
      limit ? Number(limit) : 25,
      typeof assignedToUserId === "string" ? assignedToUserId : undefined,
      typeof search === "string" ? search : undefined,
      typeof priority === "string" && priority !== "ALL" ? priority : undefined,
      user.role, // B1: pass role from req.user — avoids extra prisma.user.findUnique()
    );

    const response: ApiResponse = {
      success: true,
      message: "Leads retrieved successfully",
      data: result.leads,
      pagination: result.pagination,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller endpoint: POST /api/leads/assign (and POST /api/leads/distribute)
 * Executes atomic lead distribution/assignment in EQUAL, CUSTOM, or EXPLICIT modes.
 */
export const assignLeads = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = getAuthUser(req);

    const {
      mode = "EQUAL",
      leadIds,
      executiveIds,
      allocations,
      assignments,
      reason,
    } = req.body as AssignLeadInput;

    const result = await LeadService.assignLeads(
      {
        mode,
        leadIds,
        executiveIds,
        allocations,
        assignments,
        reason,
      },
      user.id,
    );

    // Reusable NotificationService handles executive assignments, TL notifications & real-time WS events
    await NotificationService.notifyLeadsDistributed({
      allocations: result.allocations,
      actorUserId: user.id,
      actorName: user.name,
      actorRole: user.role,
      reason,
    });

    const response: ApiResponse = {
      success: true,
      message: `Successfully assigned ${result.assignedCount} leads across ${result.allocations.length} executives`,
      data: result,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getLeadById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = getAuthUser(req);
    const { id } = req.params;
    const lead = await LeadService.getLeadById(id, {
      id: user.id,
      role: user.role,
    });

    res.status(200).json({
      success: true,
      message: "Lead retrieved successfully",
      data: lead,
    });
  } catch (error) {
    next(error);
  }
};

export const createLead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = getAuthUser(req);
    if (user.role !== UserRole.TEAM_LEADER) {
      throw new AppError(
        "Only Team Leaders are authorized to create leads",
        403,
        "FORBIDDEN",
      );
    }
    const lead = await LeadService.createLead(req.body, user.id, user.role);

    // Reusable NotificationService resolves creator & emits notifications
    await NotificationService.notifyLeadCreated(lead, user);

    res.status(201).json({
      success: true,
      message: "Lead created successfully",
      data: lead,
    });
  } catch (error) {
    next(error);
  }
};

export const updateLeadStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = getAuthUser(req);
    const { id } = req.params;
    const { status, note } = req.body;

    const result = await LeadService.updateLeadStatus(
      id,
      status,
      note,
      user.id,
      user.role,
    );

    // Non-blocking notification dispatch
    NotificationService.notifyLeadStatusUpdated({
      lead: result.lead,
      oldStatus: result.oldStatus,
      newStatus: status,
      actorUserId: user.id,
      actorName: user.name,
      actorRole: user.role,
      note,
    }).catch((err) => {
      console.error("Non-fatal notification error in updateLeadStatus:", err);
    });

    res.status(200).json({
      success: true,
      message: "Lead status updated successfully",
      data: result.lead,
    });
  } catch (error) {
    next(error);
  }
};

export const updateBulkLeadStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = getAuthUser(req);

    const { leadIds, status, note } = bulkLeadStatusSchema.parse(req.body);

    const result = await LeadService.updateBulkLeadStatus(
      leadIds,
      status,
      note,
      user.id,
      user.role,
    );

    Promise.all(
      result.leads.map((lead) =>
        NotificationService.notifyLeadStatusUpdated({
          lead,
          oldStatus: lead.status,
          newStatus: result.status,
          actorUserId: user.id,
          actorName: user.name,
          actorRole: user.role,
          note: result.note,
        }),
      ),
    ).catch((err) => {
      console.error(
        "Non-fatal notification error in updateBulkLeadStatus:",
        err,
      );
    });

    res.status(200).json({
      success: true,
      message: `Successfully updated status for ${result.updatedCount} lead(s)`,
      data: {
        updatedCount: result.updatedCount,
        status: result.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const recallLeads = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = getAuthUser(req);
    const { leadIds, reason } = req.body;
    const result = await LeadService.recallLeads(leadIds, user.id, reason);

    // Reusable NotificationService handles previous assignee notifications
    await NotificationService.notifyLeadsRecalled({
      count: result.recalledCount,
      previousAssigneeMap: result.previousAssigneeMap || {},
      actorUserId: user.id,
      actorName: user.name,
      actorRole: user.role,
      reason,
    });

    res.status(200).json({
      success: true,
      message: `Successfully recalled ${result.recalledCount} leads`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const reassignLeads = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = getAuthUser(req);
    const { leadIds, targetExecutiveId, reason } = req.body;
    const result = await LeadService.reassignLeads(
      leadIds,
      targetExecutiveId,
      user.id,
      reason,
    );

    // Reusable NotificationService handles target & previous assignee notifications
    await NotificationService.notifyLeadsReassigned({
      leadIds,
      targetExecutiveId,
      targetExecutiveName: result.targetExecutive,
      previousAssigneeMap: result.previousAssigneeMap || {},
      actorUserId: user.id,
      actorName: user.name,
      actorRole: user.role,
      reason,
    });

    res.status(200).json({
      success: true,
      message: `Successfully reassigned ${result.reassignedCount} leads to ${result.targetExecutive}`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const addLeadNote = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = getAuthUser(req);
    const { id } = req.params;
    const { note } = req.body;
    const result = await LeadService.addLeadNote(id, note, user.id, user.role);

    res.status(200).json({
      success: true,
      message: "Note added successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
