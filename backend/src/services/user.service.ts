import bcrypt from "bcryptjs";
import { prisma } from "../config/db.js";
import { config } from "../config/env.js";
import { isUserOnline } from "../config/socket.js";
import { AppError } from "../middleware/errorHandler.js";
import AuditService from "./audit.service.js";
import {
  UserRole,
  SalesExecutiveSummary,
  SalesExecutiveDetail,
} from "../types/index.js";
import { calculateExecutiveMetrics } from "../utils/executiveMetrics.js";
import { registerSchema } from "./auth.service.js";
import type { Prisma } from "@prisma/client";

export interface GetExecutivesFilter {
  search?: string;
  status?: "all" | "active" | "inactive";
  workloadStatus?: "OPTIMAL" | "NEAR_CAPACITY" | "OVERLOADED" | "ALL";
  page?: number;
  limit?: number;
  role?: UserRole;
}

export interface GetExecutivesResult {
  executives: SalesExecutiveSummary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class UserService {
  static calculateMetrics = calculateExecutiveMetrics;

  /**
   * Retrieves summary list of all Sales Executives with aggregated performance and workload KPIs.
   */
  static async getUsers(
    filter?: GetExecutivesFilter,
  ): Promise<GetExecutivesResult> {
    const whereClause: Prisma.UserWhereInput = {
      isDeleted: false,
      role: {
        in: ["ADMIN", "TEAM_LEADER", "SALES_EXECUTIVE"],
      },
    };

    if (
      filter?.role &&
      ["ADMIN", "TEAM_LEADER", "SALES_EXECUTIVE"].includes(filter.role)
    ) {
      whereClause.role = filter.role;
    }

    if (filter?.status === "active") {
      whereClause.isActive = true;
    } else if (filter?.status === "inactive") {
      whereClause.isActive = false;
    }

    if (filter?.search?.trim()) {
      const search = filter.search.trim();
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const total = await prisma.user.count({ where: whereClause });
    const isPaginated = Boolean(filter?.page || filter?.limit);
    const safePage = Math.max(1, Math.floor(filter?.page || 1));
    const safeLimit = filter?.limit
      ? Math.max(1, Math.min(100, Math.floor(filter.limit)))
      : isPaginated
        ? 25
        : undefined;
    const skip = safeLimit ? (safePage - 1) * safeLimit : undefined;

    const teamLeaders = await prisma.user.findMany({
      where: {
        ...whereClause,
      },
      skip,
      take: safeLimit,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        assignedLeads: {
          where: { isDeleted: false },
          select: {
            id: true,
            status: true,
            budget: true,
          },
        },
        followUps: {
          where: { isDeleted: false },
          select: {
            id: true,
            status: true,
            scheduledAt: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    const now = new Date();

    const formatted = teamLeaders.map((tl) => {
      const { statusBreakdown: _, ...metrics } = calculateExecutiveMetrics(
        tl.assignedLeads,
        tl.followUps,
        now,
      );

      return {
        id: tl.id,
        name: tl.name,
        email: tl.email,
        role: tl.role as UserRole,
        isActive: tl.isActive,
        isOnline: isUserOnline(tl.id),
        createdAt: tl.createdAt,
        ...metrics,
      };
    });

    let filtered = formatted;
    if (filter?.workloadStatus && filter.workloadStatus !== "ALL") {
      filtered = formatted.filter(
        (exec) => exec.workloadStatus === filter.workloadStatus,
      );
    }

    const effectiveTotal =
      filter?.workloadStatus && filter.workloadStatus !== "ALL"
        ? filtered.length
        : total;
    const effectiveLimit = safeLimit || effectiveTotal || 1;

    return {
      executives: filtered,
      pagination: {
        page: safePage,
        limit: effectiveLimit,
        total: effectiveTotal,
        totalPages: Math.max(1, Math.ceil(effectiveTotal / effectiveLimit)),
      },
    };
  }

  /**
   * Retrieves comprehensive details, pipeline breakdown, leads list, and follow-ups for a single Sales Executive.
   */
  static async getUserById(id: string): Promise<SalesExecutiveDetail> {
    const whereClause: Prisma.UserWhereInput = {
      isDeleted: false,
      id,
      role: {
        in: ["TEAM_LEADER", "SALES_EXECUTIVE"],
      },
    };
    const executive = await prisma.user.findFirst({
      where: {
        ...whereClause,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        assignedLeads: {
          where: { isDeleted: false },
          select: {
            id: true,
            leadCode: true,
            customerName: true,
            mobile: true,
            alternateMobile: true,
            email: true,
            companyName: true,
            city: true,
            state: true,
            requirement: true,
            productService: true,
            budget: true,
            leadSource: true,
            priority: true,
            status: true,
            assignedAt: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { updatedAt: "desc" },
        },
        followUps: {
          select: {
            id: true,
            leadId: true,
            scheduledAt: true,
            type: true,
            status: true,
            notes: true,
            lead: {
              select: {
                id: true,
                leadCode: true,
                customerName: true,
                mobile: true,
                status: true,
              },
            },
          },
          orderBy: { scheduledAt: "asc" },
        },
        activities: {
          select: {
            id: true,
            actionType: true,
            description: true,
            createdAt: true,
            lead: {
              select: {
                id: true,
                leadCode: true,
                customerName: true,
              },
            },
          },
          take: 15,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!executive) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    const metrics = calculateExecutiveMetrics(
      executive.assignedLeads,
      executive.followUps,
    );

    return {
      id: executive.id,
      name: executive.name,
      email: executive.email,
      role: executive.role as UserRole,
      isActive: executive.isActive,
      isOnline: isUserOnline(executive.id),
      createdAt: executive.createdAt,
      ...metrics,
      leads: (executive.assignedLeads || []).map((l) => ({
        ...l,
        budget: l.budget ? Number(l.budget) : null,
      })),
      upcomingFollowUps: executive.followUps || [],
      recentActivities: executive.activities || [],
    };
  }

  /**
   * Retrieves summary list of all Sales Executives with aggregated performance and workload KPIs.
   */
  static async getSalesExecutives(
    filter?: GetExecutivesFilter,
  ): Promise<GetExecutivesResult> {
    const whereClause: any = {
      role: UserRole.SALES_EXECUTIVE,
      isDeleted: false,
    };

    if (filter?.status === "active") {
      whereClause.isActive = true;
    } else if (filter?.status === "inactive") {
      whereClause.isActive = false;
    }

    if (filter?.search?.trim()) {
      const search = filter.search.trim();
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const total = await prisma.user.count({ where: whereClause });
    const isPaginated = Boolean(filter?.page || filter?.limit);
    const safePage = Math.max(1, Math.floor(filter?.page || 1));
    const safeLimit = filter?.limit
      ? Math.max(1, Math.min(100, Math.floor(filter.limit)))
      : isPaginated
        ? 25
        : undefined;
    const skip = safeLimit ? (safePage - 1) * safeLimit : undefined;

    const executives = await prisma.user.findMany({
      where: whereClause,
      skip,
      take: safeLimit,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        assignedLeads: {
          where: { isDeleted: false },
          select: {
            id: true,
            status: true,
            budget: true,
          },
        },
        followUps: {
          where: { isDeleted: false },
          select: {
            id: true,
            status: true,
            scheduledAt: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    const now = new Date();

    const formatted = executives.map((exec) => {
      const { statusBreakdown: _, ...metrics } = calculateExecutiveMetrics(
        exec.assignedLeads,
        exec.followUps,
        now,
      );

      return {
        id: exec.id,
        name: exec.name,
        email: exec.email,
        role: exec.role as UserRole,
        isActive: exec.isActive,
        isOnline: isUserOnline(exec.id),
        createdAt: exec.createdAt,
        ...metrics,
      };
    });

    let filtered = formatted;
    if (filter?.workloadStatus && filter.workloadStatus !== "ALL") {
      filtered = formatted.filter(
        (exec) => exec.workloadStatus === filter.workloadStatus,
      );
    }

    const effectiveTotal =
      filter?.workloadStatus && filter.workloadStatus !== "ALL"
        ? filtered.length
        : total;
    const effectiveLimit = safeLimit || effectiveTotal || 1;

    return {
      executives: filtered,
      pagination: {
        page: safePage,
        limit: effectiveLimit,
        total: effectiveTotal,
        totalPages: Math.max(1, Math.ceil(effectiveTotal / effectiveLimit)),
      },
    };
  }

  /**
   * Retrieves comprehensive details, pipeline breakdown, leads list, and follow-ups for a single Sales Executive.
   */
  static async getSalesExecutiveById(
    id: string,
  ): Promise<SalesExecutiveDetail> {
    const executive = await prisma.user.findFirst({
      where: {
        id,
        role: UserRole.SALES_EXECUTIVE,
        isDeleted: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        assignedLeads: {
          where: { isDeleted: false },
          select: {
            id: true,
            leadCode: true,
            customerName: true,
            mobile: true,
            alternateMobile: true,
            email: true,
            companyName: true,
            city: true,
            state: true,
            requirement: true,
            productService: true,
            budget: true,
            leadSource: true,
            priority: true,
            status: true,
            assignedAt: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { updatedAt: "desc" },
        },
        followUps: {
          select: {
            id: true,
            leadId: true,
            scheduledAt: true,
            type: true,
            status: true,
            notes: true,
            lead: {
              select: {
                id: true,
                leadCode: true,
                customerName: true,
                mobile: true,
                status: true,
              },
            },
          },
          orderBy: { scheduledAt: "asc" },
        },
        activities: {
          select: {
            id: true,
            actionType: true,
            description: true,
            createdAt: true,
            lead: {
              select: {
                id: true,
                leadCode: true,
                customerName: true,
              },
            },
          },
          take: 15,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!executive) {
      throw new AppError(
        "Sales Executive not found",
        404,
        "EXECUTIVE_NOT_FOUND",
      );
    }

    const metrics = calculateExecutiveMetrics(
      executive.assignedLeads,
      executive.followUps,
    );

    return {
      id: executive.id,
      name: executive.name,
      email: executive.email,
      role: executive.role as UserRole,
      isActive: executive.isActive,
      isOnline: isUserOnline(executive.id),
      createdAt: executive.createdAt,
      ...metrics,
      leads: (executive.assignedLeads || []).map((l) => ({
        ...l,
        budget: l.budget ? Number(l.budget) : null,
      })),
      upcomingFollowUps: executive.followUps || [],
      recentActivities: executive.activities || [],
    };
  }

  /**
   * Toggles active / inactive operational status of a Sales Executive.
   */
  static async toggleExecutiveStatus(
    id: string,
    isActive: boolean,
    actorId?: string,
  ): Promise<{ id: string; isActive: boolean }> {
    const executive = await prisma.user.findFirst({
      where: { id, role: UserRole.SALES_EXECUTIVE, isDeleted: false },
    });

    if (!executive) {
      throw new AppError(
        "Sales Executive not found",
        404,
        "EXECUTIVE_NOT_FOUND",
      );
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive },
      select: { id: true, isActive: true },
    });

    if (actorId) {
      await AuditService.log({
        actorUserId: actorId,
        action: "STATUS_UPDATE",
        entityType: "User",
        entityId: id,
        oldValue: { isActive: executive.isActive },
        newValue: { isActive },
      });
    }

    return updated;
  }

  /**
   * Toggles active / inactive operational status of any User (Admins and Team Leaders).
   */
  static async toggleUserStatus(
    id: string,
    isActive: boolean,
    actorId?: string,
  ): Promise<{ id: string; isActive: boolean }> {
    const user = await prisma.user.findFirst({
      where: { id, isDeleted: false },
    });

    if (!user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive },
      select: { id: true, isActive: true },
    });

    if (actorId) {
      await AuditService.log({
        actorUserId: actorId,
        action: "STATUS_UPDATE",
        entityType: "User",
        entityId: id,
        oldValue: { isActive: user.isActive },
        newValue: { isActive },
      });
    }

    return updated;
  }

  /**
   * Creates a new user (Sales Executive or Team Leader).
   */
  static async createUser(
    data: { name: string; email: string; password?: string; role?: UserRole },
    actorId?: string,
  ) {
    if (!data.name || !data.email) {
      throw new AppError(
        "Name and email are required",
        400,
        "VALIDATION_ERROR",
      );
    }

    const input = await registerSchema.parse(data);
    const normalizedEmail = input.email.toLowerCase().trim();

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existing) {
      throw new AppError(
        "A user with this email already exists",
        409,
        "DUPLICATE_USER",
      );
    }

    if (!input.password || input.password.length < 8) {
      throw new AppError(
        "A password of at least 8 characters is required",
        400,
        "VALIDATION_ERROR",
      );
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    const newUser = await prisma.user.create({
      data: {
        name: input.name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: input.role || UserRole.SALES_EXECUTIVE,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (actorId) {
      await AuditService.log({
        actorUserId: actorId,
        action: "CREATE",
        entityType: "User",
        entityId: newUser.id,
        newValue: {
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      });
    }

    return newUser;
  }

  /**
   * Bootstraps the initial Super User (ADMIN) account from environment configuration on server startup.
   */
  static async bootstrapAdminUser(): Promise<void> {
    const adminEmail = (config.admin?.email || "admin@leadflow.io")
      .toLowerCase()
      .trim();
    const adminName = config.admin?.name || "Admin";
    const adminPassword = config.admin?.password || "";

    // Never fall back to a hardcoded password. If ADMIN_PASSWORD is not
    // configured we cannot safely provision a superuser, so we skip bootstrap
    // instead of creating an account with a guessable credential.
    if (!adminPassword) {
      console.warn(
        "⚠️  [SuperUser Bootstrap] ADMIN_PASSWORD is not set — skipping superuser bootstrap. " +
          "Set ADMIN_PASSWORD (and ADMIN_EMAIL) in the environment, then restart.",
      );
      return;
    }

    try {
      const existingUser = await prisma.user.findUnique({
        where: { email: adminEmail },
      });

      const passwordHash = await bcrypt.hash(adminPassword, 10);

      if (!existingUser) {
        const adminUser = await prisma.user.create({
          data: {
            name: adminName,
            email: adminEmail,
            passwordHash,
            role: UserRole.ADMIN,
            isActive: true,
          },
        });
        console.log(
          `👑 [SuperUser Bootstrap] Created Super User Admin account: ${adminUser.email}`,
        );
      } else {
        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            name: adminName,
            role: UserRole.ADMIN,
            isActive: true,
            passwordHash,
          },
        });
        console.log(
          `👑 [SuperUser Bootstrap] Verified & updated Super User Admin account: ${existingUser.email}`,
        );
      }
    } catch (err) {
      console.error(
        "❌ [SuperUser Bootstrap] Failed to seed/bootstrap Super User Admin account:",
        err,
      );
    }
  }
}
