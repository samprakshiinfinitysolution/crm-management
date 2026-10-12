import { Router, Request, Response } from "express";

const docsRouter = Router();

export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "CRM Lead Management & Sales Distribution Enterprise REST API",
    version: "1.0.0",
    description:
      "## CRM Backend-Authoritative REST API\nThis documentation covers the full API contract for the Enterprise CRM Lead Management & Sales Distribution System.\nAll business rules, authorization, data integrity, audit logging, and transactional consistency are enforced server-side.\n\n### Key Architectural Boundaries\n- **System of Record:** PostgreSQL (Prisma ORM).\n- **Security & RBAC:** Verified JWT via Authorization Bearer header or HTTP-only cookies.\n- **Sales Executive Isolation:** Sales Executives are strictly restricted to leads assigned to their own `userId`.\n- **Team Leader Authority:** Only Team Leaders can distribute, reassign, recall, import, and view all leads.\n- **Transactions:** Multi-record allocations, reassignments, recalls, and imports are executed inside ACID transactions.\n- **Excel Rules:** Excel is strictly a transport format (Import / Export), not a data store.",
    contact: {
      name: "CRM Engineering & Architecture Team",
    },
    license: {
      name: "Proprietary",
    },
  },
  servers: [
    {
      url: "/api",
      description: "Current Environment API Server",
    },
    {
      url: "http://localhost:5000/api",
      description: "Local Development Server",
    },
  ],
  tags: [
    {
      name: "System",
      description: "System health check and diagnostic endpoints",
    },
    {
      name: "Authentication",
      description: "User login, session termination, and profile inspection",
    },
    {
      name: "Users & Staff",
      description:
        "Staff directory, Sales Executive roster, and active state management (Team Leader)",
    },
    {
      name: "Leads Directory",
      description:
        "Lead query, creation, detail, lifecycle transition, and note logging",
    },
    {
      name: "Distribution & Allocation",
      description:
        "Equal split, custom quota, manual picking, reassignment, and recall engines (Team Leader)",
    },
    {
      name: "Follow-ups & Tasks",
      description:
        "Task scheduling, upcoming/overdue summaries, completion, and rescheduling",
    },
    {
      name: "Excel Ingestion Engine",
      description:
        "Multi-stage Excel/CSV intake, validation preview, atomic commit, and error export",
    },
    {
      name: "Data Export Engine",
      description:
        "Filtered Excel (.xlsx) and CSV extraction with role-based isolation",
    },
    {
      name: "Reports & Analytics",
      description:
        "Supervisory dashboards, pipeline funnels, and executive scorecards",
    },
    {
      name: "Real-time Notifications",
      description:
        "Operational event alerts, unread counters, and status updates",
    },
    {
      name: "Audit & Compliance",
      description: "Immutable system audit trail tracking sensitive mutations",
    },
    {
      name: "Conversations & Messaging",
      description:
        "Direct workspace chat, real-time messaging, image/file attachments (Cloudinary), participant read tracking, and notifications",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Provide JWT token as `Bearer <token>`",
      },
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "token",
        description: "HTTP-only session cookie set automatically on login",
      },
    },
    schemas: {
      StandardApiResponse: {
        type: "object",
        required: ["success", "message"],
        properties: {
          success: {
            type: "boolean",
            example: true,
          },
          message: {
            type: "string",
            example: "Operation executed successfully",
          },
          data: {
            type: "object",
            description: "Result payload",
          },
          pagination: {
            $ref: "#/components/schemas/PaginationMetadata",
          },
        },
      },
      StandardErrorResponse: {
        type: "object",
        required: ["success", "message", "error"],
        properties: {
          success: {
            type: "boolean",
            example: false,
          },
          message: {
            type: "string",
            example: "Validation failed or resource not found",
          },
          error: {
            type: "object",
            properties: {
              code: {
                type: "string",
                example: "VALIDATION_ERROR",
              },
              details: {
                type: "object",
              },
            },
          },
        },
      },
      PaginationMetadata: {
        type: "object",
        properties: {
          page: {
            type: "integer",
            example: 1,
          },
          limit: {
            type: "integer",
            example: 25,
          },
          total: {
            type: "integer",
            example: 142,
          },
          totalPages: {
            type: "integer",
            example: 6,
          },
        },
      },
      UserRole: {
        type: "string",
        enum: ["ADMIN", "TEAM_LEADER", "SALES_EXECUTIVE"],
        example: "ADMIN",
      },
      LeadStatus: {
        type: "string",
        enum: [
          "NEW",
          "ASSIGNED",
          "CONTACTED",
          "INTERESTED",
          "FOLLOW_UP",
          "QUALIFIED",
          "PROPOSAL_QUOTATION",
          "NEGOTIATION",
          "WON_SOLD",
          "NOT_INTERESTED",
          "NO_RESPONSE",
          "WRONG_NUMBER",
          "INVALID",
          "DUPLICATE",
          "ON_HOLD",
          "LOST",
        ],
        example: "NEW",
      },
      PriorityLevel: {
        type: "string",
        enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
        example: "HIGH",
      },
      FollowUpType: {
        type: "string",
        enum: ["CALL", "MEETING", "EMAIL", "WHATSAPP"],
        example: "CALL",
      },
      FollowUpStatus: {
        type: "string",
        enum: ["PENDING", "COMPLETED", "MISSED"],
        example: "PENDING",
      },
      DistributionMode: {
        type: "string",
        enum: ["EQUAL", "CUSTOM", "EXPLICIT"],
        example: "EQUAL",
      },
      UserProfile: {
        type: "object",
        properties: {
          id: {
            type: "string",
            format: "uuid",
            example: "e3b0c442-98fc-1c14-9af0-2a3b95ff1d11",
          },
          name: {
            type: "string",
            example: "Aditi Sharma",
          },
          email: {
            type: "string",
            format: "email",
            example: "aditi@crm.com",
          },
          role: {
            $ref: "#/components/schemas/UserRole",
          },
          isActive: {
            type: "boolean",
            example: true,
          },
          createdAt: {
            type: "string",
            format: "date-time",
          },
        },
      },
      LeadItem: {
        type: "object",
        properties: {
          id: {
            type: "string",
            format: "uuid",
          },
          leadCode: {
            type: "string",
            example: "CRM-000104",
          },
          customerName: {
            type: "string",
            example: "Vikram Malhotra",
          },
          mobile: {
            type: "string",
            example: "+91 98765 43210",
          },
          alternateMobile: {
            type: "string",
            nullable: true,
          },
          email: {
            type: "string",
            format: "email",
            nullable: true,
          },
          companyName: {
            type: "string",
            nullable: true,
          },
          city: {
            type: "string",
            example: "Mumbai",
          },
          state: {
            type: "string",
            example: "Maharashtra",
          },
          requirement: {
            type: "string",
            example: "Enterprise Cloud ERP Deployment",
          },
          productService: {
            type: "string",
            example: "Cloud ERP",
          },
          budget: {
            type: "number",
            example: 500000,
          },
          leadSource: {
            type: "string",
            example: "Google Ads",
          },
          priority: {
            $ref: "#/components/schemas/PriorityLevel",
          },
          status: {
            $ref: "#/components/schemas/LeadStatus",
          },
          assignedToUserId: {
            type: "string",
            nullable: true,
          },
          assignedTo: {
            $ref: "#/components/schemas/UserProfile",
          },
          assignedAt: {
            type: "string",
            format: "date-time",
            nullable: true,
          },
          createdAt: {
            type: "string",
            format: "date-time",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
          },
        },
      },
      ConversationType: {
        type: "string",
        enum: ["DIRECT", "GROUP"],
        example: "DIRECT",
      },
      MessageType: {
        type: "string",
        enum: ["TEXT", "IMAGE", "FILE", "SYSTEM"],
        example: "TEXT",
      },
      ConversationRole: {
        type: "string",
        enum: ["MEMBER", "ADMIN"],
        example: "MEMBER",
      },
      ConversationUserProfile: {
        type: "object",
        properties: {
          id: {
            type: "string",
            format: "uuid",
            example: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
          },
          name: {
            type: "string",
            example: "Sarah Jenkins",
          },
          email: {
            type: "string",
            format: "email",
            example: "sarah.lead@leadflow.io",
          },
          role: {
            $ref: "#/components/schemas/UserRole",
          },
          isActive: {
            type: "boolean",
            example: true,
          },
        },
      },
      ConversationParticipant: {
        type: "object",
        properties: {
          id: {
            type: "string",
            format: "uuid",
            example: "c7b5a83e-3b2d-4ecf-91cb-7104b9015942",
          },
          conversationId: {
            type: "string",
            format: "uuid",
            example: "f8b9e63e-72bc-4541-b842-88229fb63d27",
          },
          userId: {
            type: "string",
            format: "uuid",
            example: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
          },
          role: {
            $ref: "#/components/schemas/ConversationRole",
          },
          joinedAt: {
            type: "string",
            format: "date-time",
          },
          lastReadAt: {
            type: "string",
            format: "date-time",
            nullable: true,
          },
          isArchived: {
            type: "boolean",
            example: false,
          },
          isMuted: {
            type: "boolean",
            example: false,
          },
          user: {
            $ref: "#/components/schemas/ConversationUserProfile",
          },
        },
      },
      ChatMessage: {
        type: "object",
        properties: {
          id: {
            type: "string",
            format: "uuid",
            example: "a1c2e3f4-5678-90ab-cdef-1234567890ab",
          },
          conversationId: {
            type: "string",
            format: "uuid",
            example: "f8b9e63e-72bc-4541-b842-88229fb63d27",
          },
          senderId: {
            type: "string",
            format: "uuid",
            example: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
          },
          type: {
            $ref: "#/components/schemas/MessageType",
          },
          content: {
            type: "string",
            example: "Hey, can you follow up on lead CRM-000142 today?",
          },
          createdAt: {
            type: "string",
            format: "date-time",
          },
          editedAt: {
            type: "string",
            format: "date-time",
            nullable: true,
          },
          deletedAt: {
            type: "string",
            format: "date-time",
            nullable: true,
          },
          isRead: {
            type: "boolean",
            example: false,
          },
          readAt: {
            type: "string",
            format: "date-time",
            nullable: true,
          },
          sender: {
            $ref: "#/components/schemas/ConversationUserProfile",
          },
        },
      },
      Conversation: {
        type: "object",
        properties: {
          id: {
            type: "string",
            format: "uuid",
            example: "f8b9e63e-72bc-4541-b842-88229fb63d27",
          },
          type: {
            $ref: "#/components/schemas/ConversationType",
          },
          title: {
            type: "string",
            nullable: true,
            example: null,
          },
          directKey: {
            type: "string",
            nullable: true,
            example: "user1_uuid:user2_uuid",
          },
          createdById: {
            type: "string",
            nullable: true,
            example: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
          },
          createdAt: {
            type: "string",
            format: "date-time",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
          },
          participants: {
            type: "array",
            items: {
              $ref: "#/components/schemas/ConversationParticipant",
            },
          },
          messages: {
            type: "array",
            items: {
              $ref: "#/components/schemas/ChatMessage",
            },
          },
        },
      },
    },
    responses: {
      UnauthorizedError: {
        description:
          "401 Unauthorized — Authentication required. Bearer JWT token is missing, invalid, or expired. Attempting to access without a valid login token is rejected.",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/StandardErrorResponse",
            },
            example: {
              success: false,
              message:
                "Authentication token required or session expired. Please log in via POST /api/auth/login.",
              error: {
                code: "UNAUTHORIZED",
              },
            },
          },
        },
      },
      ForbiddenError: {
        description:
          "403 Forbidden — Insufficient role permissions or ownership violation (e.g. Action requires TEAM_LEADER authority, or a Sales Executive attempted to access another executive's lead).",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/StandardErrorResponse",
            },
            example: {
              success: false,
              message:
                "Access forbidden: Insufficient permissions or resource boundary violated.",
              error: {
                code: "FORBIDDEN",
              },
            },
          },
        },
      },
    },
  },
  paths: {
    "/health": {
      get: {
        tags: ["System"],
        summary: "Check API and Database Health Status (Public)",
        description:
          "> 🌐 **PUBLIC ENDPOINT** — No authentication token required.\n\nReturns real-time operational status, database connectivity, timestamp, and environment metadata.",
        security: [],
        responses: {
          "200": {
            description: "System healthy",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      example: "ok",
                    },
                    uptime: {
                      type: "number",
                      example: 3600,
                    },
                    timestamp: {
                      type: "string",
                      format: "date-time",
                    },
                    database: {
                      type: "string",
                      example: "connected",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/auth/register": {
      post: {
        tags: ["Authentication"],
        summary: "Register New User Account (Public)",
        description:
          "> 🌐 **PUBLIC ENDPOINT** — No authentication token required.\n\nRegisters a new user (Sales Executive or Team Leader) into PostgreSQL. Generates an active session JWT and sets cookie.",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password"],
                properties: {
                  name: {
                    type: "string",
                    example: "Alex Rivera",
                  },
                  email: {
                    type: "string",
                    format: "email",
                    example: "alex.sales@leadflow.io",
                  },
                  password: {
                    type: "string",
                    example: "Password@123",
                  },
                  role: {
                    $ref: "#/components/schemas/UserRole",
                    default: "SALES_EXECUTIVE",
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "User registered successfully with JWT session",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/StandardApiResponse",
                },
              },
            },
          },
          "400": {
            description: "Validation error (invalid format or weak password)",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/StandardErrorResponse",
                },
              },
            },
          },
          "409": {
            description: "Conflict: Email address already registered",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/StandardErrorResponse",
                },
              },
            },
          },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "Authenticate User and Receive JWT (Public)",
        description:
          "> 🌐 **PUBLIC ENDPOINT** — No authentication token required.\n\nAuthenticates a user with email and password. Returns JWT token and sets secure HTTP-only session cookie.",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                    example: "teamleader@leadflow.io",
                  },
                  password: {
                    type: "string",
                    example: "Password@123",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Authentication successful",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/StandardApiResponse",
                },
              },
            },
          },
          "401": {
            description: "Invalid credentials",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/StandardErrorResponse",
                },
              },
            },
          },
        },
      },
    },
    "/auth/refresh-token": {
      post: {
        tags: ["Authentication"],
        summary: "🔒 Refresh Active JWT Session Token",
        description:
          "> 🔒 **PROTECTED ROUTE** — Requires `Authorization: Bearer <jwt_token>`.\n\nIssues an updated JWT access token for active session maintenance.",
        security: [
          {
            bearerAuth: [],
          },
          {
            cookieAuth: [],
          },
        ],
        responses: {
          "200": {
            description: "Token refreshed successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/StandardApiResponse",
                },
              },
            },
          },
          "401": {
            $ref: "#/components/responses/UnauthorizedError",
          },
        },
      },
    },
    "/auth/change-password": {
      post: {
        tags: ["Authentication"],
        summary: "🔒 Update Authenticated User Password",
        description:
          "> 🔒 **PROTECTED ROUTE** — Requires `Authorization: Bearer <jwt_token>`.\n\nValidates current password and updates to new password with complexity enforcement.",
        security: [
          {
            bearerAuth: [],
          },
          {
            cookieAuth: [],
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["currentPassword", "newPassword"],
                properties: {
                  currentPassword: {
                    type: "string",
                    example: "Password@123",
                  },
                  newPassword: {
                    type: "string",
                    example: "NewPassword@123",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Password changed successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/StandardApiResponse",
                },
              },
            },
          },
          "400": {
            description: "Validation error or invalid current password",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/StandardErrorResponse",
                },
              },
            },
          },
          "401": {
            $ref: "#/components/responses/UnauthorizedError",
          },
        },
      },
    },
    "/auth/logout": {
      post: {
        tags: ["Authentication"],
        summary: "🔒 Terminate User Session",
        description:
          "> 🔒 **PROTECTED ROUTE** — Requires `Authorization: Bearer <jwt_token>`.\n\nClears the authenticated HTTP-only cookie and revokes session state.",
        security: [
          {
            bearerAuth: [],
          },
          {
            cookieAuth: [],
          },
        ],
        responses: {
          "200": {
            description: "Logged out successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/StandardApiResponse",
                },
              },
            },
          },
          "401": {
            $ref: "#/components/responses/UnauthorizedError",
          },
        },
      },
    },
    "/auth/me": {
      get: {
        tags: ["Authentication"],
        summary: "🔒 Inspect Authenticated Identity",
        description:
          "> 🔒 **PROTECTED ROUTE** — Requires `Authorization: Bearer <jwt_token>`.\n\nReturns the current authenticated caller identity, permissions, and role.",
        security: [
          {
            bearerAuth: [],
          },
          {
            cookieAuth: [],
          },
        ],
        responses: {
          "200": {
            description: "Identity resolved",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/StandardApiResponse",
                },
              },
            },
          },
          "401": {
            $ref: "#/components/responses/UnauthorizedError",
          },
        },
      },
    },
    "/users": {
      get: {
        tags: ["Users & Staff"],
        summary: "🔒 List All Staff Members (Team Leader)",
        security: [
          {
            bearerAuth: [],
          },
          {
            cookieAuth: [],
          },
        ],
        parameters: [
          {
            name: "role",
            in: "query",
            schema: {
              $ref: "#/components/schemas/UserRole",
            },
          },
          {
            name: "search",
            in: "query",
            schema: {
              type: "string",
            },
          },
          {
            name: "page",
            in: "query",
            schema: {
              type: "integer",
              default: 1,
            },
          },
          {
            name: "limit",
            in: "query",
            schema: {
              type: "integer",
              default: 25,
            },
          },
        ],
        responses: {
          "200": {
            description: "Staff members retrieved",
          },
          "401": {
            $ref: "#/components/responses/UnauthorizedError",
          },
          "403": {
            $ref: "#/components/responses/ForbiddenError",
          },
        },
        description:
          "> 🔒 **PROTECTED ROUTE (TEAM_LEADER ONLY)** — Requires \\`Authorization: Bearer <jwt_token>\\`.\\n> ⚠️ **Direct access without logging in will return 401 Unauthorized.** Users with \\`SALES_EXECUTIVE\\` role will return **403 Forbidden**.\\n\\nList All Staff Members (Team Leader)",
      },
      post: {
        tags: ["Users & Staff"],
        summary: "🔒 Register New Staff Member (Team Leader)",
        security: [
          {
            bearerAuth: [],
          },
          {
            cookieAuth: [],
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password", "role"],
                properties: {
                  name: {
                    type: "string",
                    example: "Rohan Mehra",
                  },
                  email: {
                    type: "string",
                    format: "email",
                    example: "rohan@crm.com",
                  },
                  password: {
                    type: "string",
                    example: "SecurePassword123!",
                  },
                  role: {
                    $ref: "#/components/schemas/UserRole",
                  },
                  mobile: {
                    type: "string",
                    example: "+91 98111 22334",
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "User created successfully",
          },
          "401": {
            $ref: "#/components/responses/UnauthorizedError",
          },
          "403": {
            $ref: "#/components/responses/ForbiddenError",
          },
        },
        description:
          "> 🔒 **PROTECTED ROUTE (TEAM_LEADER ONLY)** — Requires \\`Authorization: Bearer <jwt_token>\\`.\\n> ⚠️ **Direct access without logging in will return 401 Unauthorized.** Users with \\`SALES_EXECUTIVE\\` role will return **403 Forbidden**.\\n\\nRegister New Staff Member (Team Leader)",
      },
    },
    "/users/sales-executives": {
      get: {
        tags: ["Users & Staff"],
        summary:
          "🔒 List Active Sales Executives with Live Workload Roster (Team Leader)",
        security: [
          {
            bearerAuth: [],
          },
          {
            cookieAuth: [],
          },
        ],
        responses: {
          "200": {
            description: "Roster of Sales Executives with assigned lead counts",
          },
          "401": {
            $ref: "#/components/responses/UnauthorizedError",
          },
          "403": {
            $ref: "#/components/responses/ForbiddenError",
          },
        },
        description:
          "> 🔒 **PROTECTED ROUTE (TEAM_LEADER ONLY)** — Requires \\`Authorization: Bearer <jwt_token>\\`.\\n> ⚠️ **Direct access without logging in will return 401 Unauthorized.** Users with \\`SALES_EXECUTIVE\\` role will return **403 Forbidden**.\\n\\nList Active Sales Executives with Live Workload Roster (Team Leader)",
      },
    },
    "/users/sales-executives/{id}": {
      get: {
        tags: ["Users & Staff"],
        summary:
          "🔒 Get Detailed Executive Profile & Capacity Statistics (Team Leader)",
        security: [
          {
            bearerAuth: [],
          },
          {
            cookieAuth: [],
          },
        ],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          "200": {
            description: "Sales executive detail object",
          },
          "401": {
            $ref: "#/components/responses/UnauthorizedError",
          },
          "403": {
            $ref: "#/components/responses/ForbiddenError",
          },
        },
        description:
          "> 🔒 **PROTECTED ROUTE (TEAM_LEADER ONLY)** — Requires \\`Authorization: Bearer <jwt_token>\\`.\\n> ⚠️ **Direct access without logging in will return 401 Unauthorized.** Users with \\`SALES_EXECUTIVE\\` role will return **403 Forbidden**.\\n\\nGet Detailed Executive Profile & Capacity Statistics (Team Leader)",
      },
    },
    "/users/sales-executives/{id}/status": {
      patch: {
        tags: ["Users & Staff"],
        summary:
          "🔒 Toggle Representative Active / Inactive Status (Team Leader)",
        security: [
          {
            bearerAuth: [],
          },
          {
            cookieAuth: [],
          },
        ],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["isActive"],
                properties: {
                  isActive: {
                    type: "boolean",
                    example: false,
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Status updated",
          },
          "401": {
            $ref: "#/components/responses/UnauthorizedError",
          },
          "403": {
            $ref: "#/components/responses/ForbiddenError",
          },
        },
        description:
          "> 🔒 **PROTECTED ROUTE (TEAM_LEADER ONLY)** — Requires \\`Authorization: Bearer <jwt_token>\\`.\\n> ⚠️ **Direct access without logging in will return 401 Unauthorized.** Users with \\`SALES_EXECUTIVE\\` role will return **403 Forbidden**.\\n\\nToggle Representative Active / Inactive Status (Team Leader)",
      },
    },
    "/leads": {
      get: {
        tags: ["Leads Directory"],
        summary: "🔒 Search and Filter Leads Directory",
        description:
          "> 🔒 **PROTECTED ROUTE** — Requires \\`Authorization: Bearer <jwt_token>\\`.\\n> ⚠️ **Direct access without logging in will return 401 Unauthorized.** Sales Executive caller isolation and ownership boundaries strictly enforced.\\n\\nServer-side paginated lead query. Sales Executives are automatically scoped to own assigned leads. Team Leaders can inspect all or filter by executive.",
        security: [
          {
            bearerAuth: [],
          },
          {
            cookieAuth: [],
          },
        ],
        parameters: [
          {
            name: "search",
            in: "query",
            schema: {
              type: "string",
            },
            description: "Query name, phone, leadCode, company, email",
          },
          {
            name: "status",
            in: "query",
            description:
              "Filter leads by status or pass 'UNASSIGNED' to fetch all unassigned pool leads (where assignedToUserId is null)",
            schema: {
              type: "string",
              enum: [
                "ALL",
                "UNASSIGNED",
                "NEW",
                "ASSIGNED",
                "CONTACTED",
                "INTERESTED",
                "FOLLOW_UP",
                "QUALIFIED",
                "PROPOSAL_QUOTATION",
                "NEGOTIATION",
                "WON_SOLD",
                "NOT_INTERESTED",
                "NO_RESPONSE",
                "WRONG_NUMBER",
                "INVALID",
                "DUPLICATE",
                "ON_HOLD",
                "LOST",
              ],
              default: "ALL",
            },
          },
          {
            name: "source",
            in: "query",
            schema: {
              type: "string",
            },
          },
          {
            name: "city",
            in: "query",
            schema: {
              type: "string",
            },
          },
          {
            name: "priority",
            in: "query",
            schema: {
              $ref: "#/components/schemas/PriorityLevel",
            },
          },
          {
            name: "assignedToUserId",
            in: "query",
            schema: {
              type: "string",
            },
            description: 'UUID or "UNASSIGNED"',
          },
          {
            name: "sortBy",
            in: "query",
            schema: {
              type: "string",
              example: "createdAt:desc",
            },
          },
          {
            name: "page",
            in: "query",
            schema: {
              type: "integer",
              default: 1,
            },
          },
          {
            name: "limit",
            in: "query",
            schema: {
              type: "integer",
              default: 25,
            },
          },
        ],
        responses: {
          "200": {
            description: "Paginated lead collection",
          },
          "401": {
            $ref: "#/components/responses/UnauthorizedError",
          },
        },
      },
      post: {
        tags: ["Leads Directory"],
        summary: "🔒 Create Individual Lead Manually (Team Leader)",
        security: [
          {
            bearerAuth: [],
          },
          {
            cookieAuth: [],
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["customerName", "mobile", "requirement"],
                properties: {
                  customerName: {
                    type: "string",
                    example: "Pooja Hegde",
                  },
                  mobile: {
                    type: "string",
                    example: "+91 99887 76655",
                  },
                  email: {
                    type: "string",
                    format: "email",
                    example: "pooja@enterprise.com",
                  },
                  companyName: {
                    type: "string",
                    example: "TechCorp Pvt Ltd",
                  },
                  city: {
                    type: "string",
                    example: "Bengaluru",
                  },
                  state: {
                    type: "string",
                    example: "Karnataka",
                  },
                  requirement: {
                    type: "string",
                    example: "Migration of 500 mailboxes to cloud",
                  },
                  productService: {
                    type: "string",
                    example: "Cloud Migration",
                  },
                  budget: {
                    type: "number",
                    example: 750000,
                  },
                  leadSource: {
                    type: "string",
                    example: "Referral",
                  },
                  priority: {
                    $ref: "#/components/schemas/PriorityLevel",
                  },
                  remarks: {
                    type: "string",
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Lead created with stable CRM-XXXXXX code",
          },
          "401": {
            $ref: "#/components/responses/UnauthorizedError",
          },
        },
        description:
          "> 🔒 **PROTECTED ROUTE** — Requires \\`Authorization: Bearer <jwt_token>\\`.\\n> ⚠️ **Direct access without logging in will return 401 Unauthorized.** Sales Executive caller isolation and ownership boundaries strictly enforced.\\n\\nCreate Individual Lead Manually (Team Leader)",
      },
    },
    "/leads/{id}": {
      get: {
        tags: ["Leads Directory"],
        summary:
          "🔒 Get Lead Details, Historical Status Ledger & Activity Timeline",
        security: [
          {
            bearerAuth: [],
          },
          {
            cookieAuth: [],
          },
        ],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
            description: "UUID or leadCode (e.g. CRM-000045)",
          },
        ],
        responses: {
          "200": {
            description:
              "Full lead record with customer profile, assignments, and notes",
          },
          "401": {
            $ref: "#/components/responses/UnauthorizedError",
          },
          "403": {
            $ref: "#/components/responses/ForbiddenError",
          },
          "404": {
            description: "Lead not found",
          },
        },
        description:
          "> 🔒 **PROTECTED ROUTE** — Requires \\`Authorization: Bearer <jwt_token>\\`.\\n> ⚠️ **Direct access without logging in will return 401 Unauthorized.** Sales Executive caller isolation and ownership boundaries strictly enforced.\\n\\nGet Lead Details, Historical Status Ledger & Activity Timeline",
      },
    },
    "/leads/{id}/status": {
      patch: {
        tags: ["Leads Directory"],
        summary: "🔒 Update Lead Lifecycle Status",
        description:
          "> 🔒 **PROTECTED ROUTE** — Requires \\`Authorization: Bearer <jwt_token>\\`.\\n> ⚠️ **Direct access without logging in will return 401 Unauthorized.** Sales Executive caller isolation and ownership boundaries strictly enforced.\\n\\nEnforces business rules state machine. Protected terminal deals (WON_SOLD, LOST) require supervisor rights. Creates LeadStatusHistory record and audit entry.",
        security: [
          {
            bearerAuth: [],
          },
          {
            cookieAuth: [],
          },
        ],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["status"],
                properties: {
                  status: {
                    $ref: "#/components/schemas/LeadStatus",
                  },
                  note: {
                    type: "string",
                    example: "Client requested formal pricing agreement",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Status updated",
          },
          "401": {
            $ref: "#/components/responses/UnauthorizedError",
          },
          "403": {
            $ref: "#/components/responses/ForbiddenError",
          },
        },
      },
    },
    "/leads/{id}/notes": {
      post: {
        tags: ["Leads Directory"],
        summary: "🔒 Append Qualitative Interaction Note to Lead",
        security: [
          {
            bearerAuth: [],
          },
          {
            cookieAuth: [],
          },
        ],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["note"],
                properties: {
                  note: {
                    type: "string",
                    example:
                      "Followed up via telephone. Spoke with Procurement Lead.",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Note persisted in LeadNote table",
          },
          "401": {
            $ref: "#/components/responses/UnauthorizedError",
          },
          "403": {
            $ref: "#/components/responses/ForbiddenError",
          },
        },
        description:
          "> 🔒 **PROTECTED ROUTE** — Requires \\`Authorization: Bearer <jwt_token>\\`.\\n> ⚠️ **Direct access without logging in will return 401 Unauthorized.** Sales Executive caller isolation and ownership boundaries strictly enforced.\\n\\nAppend Qualitative Interaction Note to Lead",
      },
    },
    "/leads/bulk/status": {
      patch: {
        tags: ["Leads Directory"],
        summary: "🔒 Atomic Bulk Lead Status Transition",
        description:
          "> 🔒 **PROTECTED ROUTE (TEAM_LEADER ONLY)** — Requires \\`Authorization: Bearer <jwt_token>\\`.\\n> ⚠️ **Direct access without logging in will return 401 Unauthorized.** Users with \\`SALES_EXECUTIVE\\` role will return **403 Forbidden**.\\n\\nUpdates lifecycle status across an array of leads in a single ACID transaction with status history and audit entries.",
        security: [
          {
            bearerAuth: [],
          },
          {
            cookieAuth: [],
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["leadIds", "status", "note"],
                properties: {
                  leadIds: {
                    type: "array",
                    items: {
                      type: "string",
                    },
                  },
                  status: {
                    $ref: "#/components/schemas/LeadStatus",
                  },
                  note: {
                    type: "string",
                    example: "Bulk status update: campaign disqualified",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Bulk status updated atomically",
          },
          "401": {
            $ref: "#/components/responses/UnauthorizedError",
          },
          "403": {
            $ref: "#/components/responses/ForbiddenError",
          },
        },
      },
    },
    "/leads/{leadId}/followups": {
      get: {
        tags: ["Leads Directory"],
        summary: "🔒 List Follow-up History and Tasks for Lead",
        security: [
          {
            bearerAuth: [],
          },
          {
            cookieAuth: [],
          },
        ],
        parameters: [
          {
            name: "leadId",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          "200": {
            description: "Follow-up timeline for lead",
          },
          "401": {
            $ref: "#/components/responses/UnauthorizedError",
          },
          "403": {
            $ref: "#/components/responses/ForbiddenError",
          },
        },
        description:
          "> 🔒 **PROTECTED ROUTE** — Requires \\`Authorization: Bearer <jwt_token>\\`.\\n> ⚠️ **Direct access without logging in will return 401 Unauthorized.** Sales Executive caller isolation and ownership boundaries strictly enforced.\\n\\nList Follow-up History and Tasks for Lead",
      },
    },
    "/leads/distribute": {
      post: {
        tags: ["Distribution & Allocation"],
        summary: "🔒 Distribute Leads via EQUAL or CUSTOM Quotas (Team Leader)",
        description:
          "> 🔒 **PROTECTED ROUTE (TEAM_LEADER ONLY)** — Requires \\`Authorization: Bearer <jwt_token>\\`.\\n> ⚠️ **Direct access without logging in will return 401 Unauthorized.** Users with \\`SALES_EXECUTIVE\\` role will return **403 Forbidden**.\\n\\nDistributes pool leads among selected sales executives inside an ACID transaction with deterministic remainder assignment and ledger tracking.",
        security: [
          {
            bearerAuth: [],
          },
          {
            cookieAuth: [],
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["mode"],
                properties: {
                  mode: {
                    $ref: "#/components/schemas/DistributionMode",
                  },
                  leadIds: {
                    type: "array",
                    items: {
                      type: "string",
                    },
                  },
                  executiveIds: {
                    type: "array",
                    items: {
                      type: "string",
                    },
                  },
                  allocations: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        salesExecutiveId: {
                          type: "string",
                        },
                        count: {
                          type: "integer",
                        },
                      },
                    },
                  },
                  reason: {
                    type: "string",
                    example: "Q3 Territory Campaign Distribution",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Distribution executed atomically",
          },
          "401": {
            $ref: "#/components/responses/UnauthorizedError",
          },
          "403": {
            $ref: "#/components/responses/ForbiddenError",
          },
        },
      },
    },
    "/leads/assign": {
      post: {
        tags: ["Distribution & Allocation"],
        summary: "🔒 Explicit 1:1 Lead Assignment (Team Leader)",
        security: [
          {
            bearerAuth: [],
          },
          {
            cookieAuth: [],
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  mode: {
                    type: "string",
                    default: "EXPLICIT",
                  },
                  assignments: {
                    type: "array",
                    items: {
                      type: "object",
                      required: ["leadId", "salesExecutiveId"],
                      properties: {
                        leadId: {
                          type: "string",
                        },
                        salesExecutiveId: {
                          type: "string",
                        },
                      },
                    },
                  },
                  reason: {
                    type: "string",
                    example: "Direct specialist assignment",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Assigned successfully",
          },
          "401": {
            $ref: "#/components/responses/UnauthorizedError",
          },
          "403": {
            $ref: "#/components/responses/ForbiddenError",
          },
        },
        description:
          "> 🔒 **PROTECTED ROUTE (TEAM_LEADER ONLY)** — Requires \\`Authorization: Bearer <jwt_token>\\`.\\n> ⚠️ **Direct access without logging in will return 401 Unauthorized.** Users with \\`SALES_EXECUTIVE\\` role will return **403 Forbidden**.\\n\\nExplicit 1:1 Lead Assignment (Team Leader)",
      },
    },
    "/leads/reassign": {
      post: {
        tags: ["Distribution & Allocation"],
        summary:
          "🔒 Reassign Active Leads Between Representatives (Team Leader)",
        description:
          "> 🔒 **PROTECTED ROUTE (TEAM_LEADER ONLY)** — Requires \\`Authorization: Bearer <jwt_token>\\`.\\n> ⚠️ **Direct access without logging in will return 401 Unauthorized.** Users with \\`SALES_EXECUTIVE\\` role will return **403 Forbidden**.\\n\\nTransfers assigned leads from one or more representatives to a target executive, updating the historical LeadAssignment ledger and dispatching notifications.",
        security: [
          {
            bearerAuth: [],
          },
          {
            cookieAuth: [],
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["leadIds", "targetExecutiveId"],
                properties: {
                  leadIds: {
                    type: "array",
                    items: {
                      type: "string",
                    },
                  },
                  targetExecutiveId: {
                    type: "string",
                  },
                  reason: {
                    type: "string",
                    example: "Workload rebalancing",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Reassigned successfully",
          },
          "401": {
            $ref: "#/components/responses/UnauthorizedError",
          },
          "403": {
            $ref: "#/components/responses/ForbiddenError",
          },
        },
      },
    },
    "/leads/recall": {
      post: {
        tags: ["Distribution & Allocation"],
        summary:
          "🔒 Recall Assigned Leads Back to Unassigned Pool (Team Leader)",
        description:
          "> 🔒 **PROTECTED ROUTE (TEAM_LEADER ONLY)** — Requires \\`Authorization: Bearer <jwt_token>\\`.\\n> ⚠️ **Direct access without logging in will return 401 Unauthorized.** Users with \\`SALES_EXECUTIVE\\` role will return **403 Forbidden**.\\n\\nRecalls leads back to the unassigned pool (status: NEW, assignedToUserId: null), closing active assignments in the ledger.",
        security: [
          {
            bearerAuth: [],
          },
          {
            cookieAuth: [],
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["leadIds"],
                properties: {
                  leadIds: {
                    type: "array",
                    items: {
                      type: "string",
                    },
                  },
                  reason: {
                    type: "string",
                    example: "Representative on extended leave",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Recalled successfully",
          },
          "401": {
            $ref: "#/components/responses/UnauthorizedError",
          },
          "403": {
            $ref: "#/components/responses/ForbiddenError",
          },
        },
      },
    },
    "/followups": {
      get: {
        tags: ["Follow-ups & Tasks"],
        summary: "🔒 List Follow-up Schedule (Role-Scoped)",
        security: [
          {
            bearerAuth: [],
          },
          {
            cookieAuth: [],
          },
        ],
        parameters: [
          {
            name: "status",
            in: "query",
            schema: {
              $ref: "#/components/schemas/FollowUpStatus",
            },
          },
          {
            name: "type",
            in: "query",
            schema: {
              $ref: "#/components/schemas/FollowUpType",
            },
          },
          {
            name: "executiveId",
            in: "query",
            schema: {
              type: "string",
            },
          },
          {
            name: "startDate",
            in: "query",
            schema: {
              type: "string",
              format: "date",
            },
          },
          {
            name: "endDate",
            in: "query",
            schema: {
              type: "string",
              format: "date",
            },
          },
          {
            name: "page",
            in: "query",
            schema: {
              type: "integer",
              default: 1,
            },
          },
          {
            name: "limit",
            in: "query",
            schema: {
              type: "integer",
              default: 25,
            },
          },
        ],
        responses: {
          "200": {
            description: "List of follow-up tasks",
          },
          "401": {
            $ref: "#/components/responses/UnauthorizedError",
          },
        },
        description:
          "> 🔒 **PROTECTED ROUTE** — Requires \\`Authorization: Bearer <jwt_token>\\`.\\n> ⚠️ **Direct access without logging in will return 401 Unauthorized.** Sales Executive caller isolation and ownership boundaries strictly enforced.\\n\\nList Follow-up Schedule (Role-Scoped)",
      },
      post: {
        tags: ["Follow-ups & Tasks"],
        summary: "🔒 Schedule Follow-up Task",
        security: [
          {
            bearerAuth: [],
          },
          {
            cookieAuth: [],
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["leadId", "scheduledAt", "type"],
                properties: {
                  leadId: {
                    type: "string",
                  },
                  scheduledAt: {
                    type: "string",
                    format: "date-time",
                  },
                  type: {
                    $ref: "#/components/schemas/FollowUpType",
                  },
                  notes: {
                    type: "string",
                    example: "Discuss revised pricing proposal",
                  },
                  assignedToUserId: {
                    type: "string",
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Follow-up task scheduled",
          },
          "401": {
            $ref: "#/components/responses/UnauthorizedError",
          },
        },
        description:
          "> 🔒 **PROTECTED ROUTE** — Requires \\`Authorization: Bearer <jwt_token>\\`.\\n> ⚠️ **Direct access without logging in will return 401 Unauthorized.** Sales Executive caller isolation and ownership boundaries strictly enforced.\\n\\nSchedule Follow-up Task",
      },
    },
    "/followups/summary": {
      get: {
        tags: ["Follow-ups & Tasks"],
        summary:
          "🔒 Aggregated Task Counters (Due Today, Upcoming, Overdue, Completed)",
        security: [
          {
            bearerAuth: [],
          },
          {
            cookieAuth: [],
          },
        ],
        parameters: [
          {
            name: "executiveId",
            in: "query",
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          "200": {
            description: "Summary statistics",
          },
          "401": {
            $ref: "#/components/responses/UnauthorizedError",
          },
        },
        description:
          "> 🔒 **PROTECTED ROUTE** — Requires \\`Authorization: Bearer <jwt_token>\\`.\\n> ⚠️ **Direct access without logging in will return 401 Unauthorized.** Sales Executive caller isolation and ownership boundaries strictly enforced.\\n\\nAggregated Task Counters (Due Today, Upcoming, Overdue, Completed)",
      },
    },
    "/followups/{id}/complete": {
      patch: {
        tags: ["Follow-ups & Tasks"],
        summary:
          "🔒 Mark Follow-up as Completed with Outcome and Optional Status Transition",
        security: [
          {
            bearerAuth: [],
          },
          {
            cookieAuth: [],
          },
        ],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["outcome"],
                properties: {
                  outcome: {
                    type: "string",
                    example: "Demo completed successfully. Client interested.",
                  },
                  notes: {
                    type: "string",
                  },
                  statusUpdate: {
                    $ref: "#/components/schemas/LeadStatus",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Follow-up completed",
          },
          "401": {
            $ref: "#/components/responses/UnauthorizedError",
          },
        },
        description:
          "> 🔒 **PROTECTED ROUTE** — Requires \\`Authorization: Bearer <jwt_token>\\`.\\n> ⚠️ **Direct access without logging in will return 401 Unauthorized.** Sales Executive caller isolation and ownership boundaries strictly enforced.\\n\\nMark Follow-up as Completed with Outcome and Optional Status Transition",
      },
    },
    "/followups/{id}/reschedule": {
      patch: {
        tags: ["Follow-ups & Tasks"],
        summary: "🔒 Reschedule Follow-up to New Timestamp",
        security: [
          {
            bearerAuth: [],
          },
          {
            cookieAuth: [],
          },
        ],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["scheduledAt"],
                properties: {
                  scheduledAt: {
                    type: "string",
                    format: "date-time",
                  },
                  reason: {
                    type: "string",
                    example: "Client requested reschedule to next Tuesday",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Follow-up rescheduled",
          },
          "401": {
            $ref: "#/components/responses/UnauthorizedError",
          },
        },
        description:
          "> 🔒 **PROTECTED ROUTE** — Requires \\`Authorization: Bearer <jwt_token>\\`.\\n> ⚠️ **Direct access without logging in will return 401 Unauthorized.** Sales Executive caller isolation and ownership boundaries strictly enforced.\\n\\nReschedule Follow-up to New Timestamp",
      },
    },
    "/followups/{id}": {
      delete: {
        tags: ["Follow-ups & Tasks"],
        summary: "🔒 Soft-Delete Follow-up Task",
        security: [
          {
            bearerAuth: [],
          },
          {
            cookieAuth: [],
          },
        ],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          "200": {
            description: "Task soft-deleted",
          },
          "401": {
            $ref: "#/components/responses/UnauthorizedError",
          },
        },
        description:
          "> 🔒 **PROTECTED ROUTE** — Requires \\`Authorization: Bearer <jwt_token>\\`.\\n> ⚠️ **Direct access without logging in will return 401 Unauthorized.** Sales Executive caller isolation and ownership boundaries strictly enforced.\\n\\nSoft-Delete Follow-up Task",
      },
    },
    "/imports/template": {
      get: {
        tags: ["Excel Ingestion Engine"],
        summary: "🔒 Download Standardized CRM Leads Template (.xlsx)",
        description:
          "> 🔒 **PROTECTED ROUTE (TEAM_LEADER ONLY)** — Requires \\`Authorization: Bearer <jwt_token>\\`.\\n> ⚠️ **Direct access without logging in will return 401 Unauthorized.** Users with \\`SALES_EXECUTIVE\\` role will return **403 Forbidden**.\\n\\nDownloads an official template with suggested column headers and optional dummy sample rows.",
        parameters: [
          {
            name: "sample",
            in: "query",
            schema: {
              type: "boolean",
              default: true,
            },
          },
        ],
        responses: {
          "200": {
            description: "Excel template stream",
          },
          "401": {
            $ref: "#/components/responses/UnauthorizedError",
          },
          "403": {
            $ref: "#/components/responses/ForbiddenError",
          },
        },
        security: [
          {
            bearerAuth: [],
          },
          {
            cookieAuth: [],
          },
        ],
      },
    },
    "/imports/upload": {
      post: {
        tags: ["Excel Ingestion Engine"],
        summary:
          "🔒 Upload & Staged Extraction of Excel/CSV Sheet (Team Leader)",
        description:
          "> 🔒 **PROTECTED ROUTE (TEAM_LEADER ONLY)** — Requires \\`Authorization: Bearer <jwt_token>\\`.\\n> ⚠️ **Direct access without logging in will return 401 Unauthorized.** Users with \\`SALES_EXECUTIVE\\` role will return **403 Forbidden**.\\n\\nParses sheet, validates headers and rows, detects database duplicates by mobile/email, and returns preview statistics before commit.",
        security: [
          {
            bearerAuth: [],
          },
          {
            cookieAuth: [],
          },
        ],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["file"],
                properties: {
                  file: {
                    type: "string",
                    format: "binary",
                    description: ".xlsx, .xls, or .csv sheet",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Staged batch with preview breakdown",
          },
          "401": {
            $ref: "#/components/responses/UnauthorizedError",
          },
          "403": {
            $ref: "#/components/responses/ForbiddenError",
          },
        },
      },
    },
    "/imports/commit": {
      post: {
        tags: ["Excel Ingestion Engine"],
        summary: "🔒 Commit Staged Leads Batch into CRM (Team Leader)",
        description:
          "> 🔒 **PROTECTED ROUTE (TEAM_LEADER ONLY)** — Requires \\`Authorization: Bearer <jwt_token>\\`.\\n> ⚠️ **Direct access without logging in will return 401 Unauthorized.** Users with \\`SALES_EXECUTIVE\\` role will return **403 Forbidden**.\\n\\nPersists validated rows into PostgreSQL within an ACID transaction and stores row-level errors in ImportError.",
        security: [
          {
            bearerAuth: [],
          },
          {
            cookieAuth: [],
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["leads"],
                properties: {
                  fileName: {
                    type: "string",
                  },
                  leads: {
                    type: "array",
                    items: {
                      type: "object",
                    },
                  },
                  errors: {
                    type: "array",
                    items: {
                      type: "object",
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Batch committed to unassigned pool",
          },
          "401": {
            $ref: "#/components/responses/UnauthorizedError",
          },
          "403": {
            $ref: "#/components/responses/ForbiddenError",
          },
        },
      },
    },
    "/imports/batches": {
      get: {
        tags: ["Excel Ingestion Engine"],
        summary: "🔒 List Historical Import Batches (Team Leader)",
        security: [
          {
            bearerAuth: [],
          },
          {
            cookieAuth: [],
          },
        ],
        parameters: [
          {
            name: "page",
            in: "query",
            schema: {
              type: "integer",
              default: 1,
            },
          },
          {
            name: "limit",
            in: "query",
            schema: {
              type: "integer",
              default: 20,
            },
          },
        ],
        responses: {
          "200": {
            description: "Batch history",
          },
          "401": {
            $ref: "#/components/responses/UnauthorizedError",
          },
          "403": {
            $ref: "#/components/responses/ForbiddenError",
          },
        },
        description:
          "> 🔒 **PROTECTED ROUTE (TEAM_LEADER ONLY)** — Requires \\`Authorization: Bearer <jwt_token>\\`.\\n> ⚠️ **Direct access without logging in will return 401 Unauthorized.** Users with \\`SALES_EXECUTIVE\\` role will return **403 Forbidden**.\\n\\nList Historical Import Batches (Team Leader)",
      },
    },
    "/imports/batches/{id}": {
      get: {
        tags: ["Excel Ingestion Engine"],
        summary: "🔒 Get Specific Batch Details and Row Errors (Team Leader)",
        security: [
          {
            bearerAuth: [],
          },
          {
            cookieAuth: [],
          },
        ],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          "200": {
            description: "Batch error logs",
          },
          "401": {
            $ref: "#/components/responses/UnauthorizedError",
          },
          "403": {
            $ref: "#/components/responses/ForbiddenError",
          },
        },
        description:
          "> 🔒 **PROTECTED ROUTE (TEAM_LEADER ONLY)** — Requires \\`Authorization: Bearer <jwt_token>\\`.\\n> ⚠️ **Direct access without logging in will return 401 Unauthorized.** Users with \\`SALES_EXECUTIVE\\` role will return **403 Forbidden**.\\n\\nGet Specific Batch Details and Row Errors (Team Leader)",
      },
    },
    "/imports/batches/{id}/errors/export": {
      get: {
        tags: ["Excel Ingestion Engine"],
        summary:
          "🔒 Download Import Rejected Rows (.xlsx) Workbook (Team Leader)",
        description:
          "> 🔒 **PROTECTED ROUTE (TEAM_LEADER ONLY)** — Requires \\`Authorization: Bearer <jwt_token>\\`.\\n> ⚠️ **Direct access without logging in will return 401 Unauthorized.** Users with \\`SALES_EXECUTIVE\\` role will return **403 Forbidden**.\\n\\nGenerates an Excel workbook containing the rejected rows and specific error reasons for quick correction and re-upload.",
        security: [
          {
            bearerAuth: [],
          },
          {
            cookieAuth: [],
          },
        ],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          "200": {
            description: "Downloadable error workbook",
          },
          "401": {
            $ref: "#/components/responses/UnauthorizedError",
          },
          "403": {
            $ref: "#/components/responses/ForbiddenError",
          },
        },
      },
    },
    "/exports/leads": {
      post: {
        tags: ["Data Export Engine"],
        summary: "🔒 Export Filtered Leads Dataset to Excel (.xlsx) or CSV",
        description:
          "> 🔒 **PROTECTED ROUTE (TEAM_LEADER ONLY)** — Requires \\`Authorization: Bearer <jwt_token>\\`.\\n> ⚠️ **Direct access without logging in will return 401 Unauthorized.** Users with \\`SALES_EXECUTIVE\\` role will return **403 Forbidden**.\\n\\nExports filtered or selected leads into an Excel or CSV file. Sales Executives are strictly restricted to leads assigned to their user ID.",
        security: [
          {
            bearerAuth: [],
          },
          {
            cookieAuth: [],
          },
        ],
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  leadIds: {
                    type: "array",
                    items: {
                      type: "string",
                    },
                  },
                  leadCodes: {
                    type: "array",
                    items: {
                      type: "string",
                    },
                  },
                  status: {
                    type: "string",
                  },
                  source: {
                    type: "string",
                  },
                  city: {
                    type: "string",
                  },
                  priority: {
                    type: "string",
                  },
                  assignedToUserId: {
                    type: "string",
                  },
                  search: {
                    type: "string",
                  },
                  fromDate: {
                    type: "string",
                    format: "date",
                  },
                  toDate: {
                    type: "string",
                    format: "date",
                  },
                  format: {
                    type: "string",
                    enum: ["xlsx", "csv"],
                    default: "xlsx",
                  },
                  limit: {
                    type: "integer",
                    default: 5000,
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description:
              "Spreadsheet stream with Content-Disposition attachment",
          },
          "401": {
            $ref: "#/components/responses/UnauthorizedError",
          },
          "403": {
            $ref: "#/components/responses/ForbiddenError",
          },
        },
      },
      get: {
        tags: ["Data Export Engine"],
        summary: "🔒 Alternative Query-Driven Leads Export Endpoint",
        security: [
          {
            bearerAuth: [],
          },
          {
            cookieAuth: [],
          },
        ],
        parameters: [
          {
            name: "format",
            in: "query",
            schema: {
              type: "string",
              enum: ["xlsx", "csv"],
            },
          },
          {
            name: "status",
            in: "query",
            schema: {
              type: "string",
            },
          },
          {
            name: "source",
            in: "query",
            schema: {
              type: "string",
            },
          },
          {
            name: "assignedToUserId",
            in: "query",
            schema: {
              type: "string",
            },
          },
          {
            name: "search",
            in: "query",
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          "200": {
            description: "Spreadsheet stream",
          },
          "401": {
            $ref: "#/components/responses/UnauthorizedError",
          },
          "403": {
            $ref: "#/components/responses/ForbiddenError",
          },
        },
        description:
          "> 🔒 **PROTECTED ROUTE (TEAM_LEADER ONLY)** — Requires \\`Authorization: Bearer <jwt_token>\\`.\\n> ⚠️ **Direct access without logging in will return 401 Unauthorized.** Users with \\`SALES_EXECUTIVE\\` role will return **403 Forbidden**.\\n\\nAlternative Query-Driven Leads Export Endpoint",
      },
    },
    "/exports/reports": {
      post: {
        tags: ["Data Export Engine", "Reports & Analytics"],
        summary: "🔒 Export Comprehensive Intelligence & Performance Report to Excel (.xlsx)",
        description:
          "> 🔒 **PROTECTED ROUTE** — Requires \\`Authorization: Bearer <jwt_token>\\`.\\n> ⚠️ **Direct access without logging in will return 401 Unauthorized.** Sales Executives are isolated to their assigned data.\\n\\nGenerates and downloads a multi-sheet Excel (.xlsx) report containing Executive Summary KPIs, Sales Executive Performance Matrix, Pipeline Funnel Breakdown, Lead Sources, and Detailed Lead records.",
        security: [
          {
            bearerAuth: [],
          },
          {
            cookieAuth: [],
          },
        ],
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  timeRange: {
                    type: "string",
                    example: "7d",
                    description: "Time range (today, 7d, 30d, quarter, year, all)",
                  },
                  executiveId: {
                    type: "string",
                    description: "Filter by specific executive ID (Team Leader only)",
                  },
                  source: {
                    type: "string",
                    description: "Filter by lead source",
                  },
                  status: {
                    type: "string",
                    description: "Filter by lead status",
                  },
                  priority: {
                    type: "string",
                    description: "Filter by lead priority",
                  },
                  search: {
                    type: "string",
                    description: "Text search across customer name, mobile, email, company, and lead code",
                  },
                  fromDate: {
                    type: "string",
                    format: "date",
                  },
                  toDate: {
                    type: "string",
                    format: "date",
                  },
                  format: {
                    type: "string",
                    enum: ["xlsx", "csv"],
                    default: "xlsx",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description:
              "Excel workbook stream with Content-Disposition attachment",
            content: {
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
                schema: {
                  type: "string",
                  format: "binary",
                },
              },
            },
          },
          "401": {
            $ref: "#/components/responses/UnauthorizedError",
          },
          "403": {
            $ref: "#/components/responses/ForbiddenError",
          },
        },
      },
      get: {
        tags: ["Data Export Engine", "Reports & Analytics"],
        summary: "🔒 Export Comprehensive Intelligence & Performance Report via Query Parameters",
        description:
          "> 🔒 **PROTECTED ROUTE** — Requires \\`Authorization: Bearer <jwt_token>\\`.\\n> ⚠️ **Direct access without logging in will return 401 Unauthorized.** Sales Executives are isolated to their assigned data.\\n\\nGenerates and downloads a multi-sheet Excel (.xlsx) report containing Executive Summary KPIs, Sales Executive Performance Matrix, Pipeline Funnel Breakdown, Lead Sources, and Detailed Lead records.",
        security: [
          {
            bearerAuth: [],
          },
          {
            cookieAuth: [],
          },
        ],
        parameters: [
          {
            name: "timeRange",
            in: "query",
            schema: {
              type: "string",
              example: "7d",
            },
            description: "Time range filter (today, 7d, 30d, quarter, year, all)",
          },
          {
            name: "executiveId",
            in: "query",
            schema: {
              type: "string",
            },
            description: "Filter by specific executive ID",
          },
          {
            name: "source",
            in: "query",
            schema: {
              type: "string",
            },
            description: "Filter by lead source",
          },
          {
            name: "status",
            in: "query",
            schema: {
              type: "string",
            },
            description: "Filter by lead status",
          },
          {
            name: "priority",
            in: "query",
            schema: {
              type: "string",
            },
            description: "Filter by lead priority",
          },
          {
            name: "search",
            in: "query",
            schema: {
              type: "string",
            },
            description: "Search text",
          },
          {
            name: "fromDate",
            in: "query",
            schema: {
              type: "string",
              format: "date",
            },
          },
          {
            name: "toDate",
            in: "query",
            schema: {
              type: "string",
              format: "date",
            },
          },
        ],
        responses: {
          "200": {
            description: "Excel workbook stream",
            content: {
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
                schema: {
                  type: "string",
                  format: "binary",
                },
              },
            },
          },
          "401": {
            $ref: "#/components/responses/UnauthorizedError",
          },
          "403": {
            $ref: "#/components/responses/ForbiddenError",
          },
        },
      },
    },
    "/reports/dashboard-metrics/admin": {
      get: {
        tags: ["Reports & Analytics"],
        summary: "🔒 System-Wide Governance & Administrative Live Dashboard Metrics (Admin Only)",
        description:
          "> 🔒 **PROTECTED ROUTE (ADMIN ONLY)** — Requires \\`Authorization: Bearer <jwt_token>\\`.\\n> ⚠️ **Direct access without logging in will return 401 Unauthorized.** Non-admin roles will return **403 Forbidden**.\\n\\nReturns system-wide pipeline health, organization user breakdown, revenue, SLA compliance, and executive performance metrics.",
        security: [
          {
            bearerAuth: [],
          },
          {
            cookieAuth: [],
          },
        ],
        responses: {
          "200": {
            description: "Admin KPIs, system lead inventory, user breakdown, and executive workload analytics",
          },
          "401": {
            $ref: "#/components/responses/UnauthorizedError",
          },
          "403": {
            $ref: "#/components/responses/ForbiddenError",
          },
        },
      },
    },
    "/reports/dashboard-metrics/team-lead": {
      get: {
        tags: ["Reports & Analytics"],
        summary:
          "🔒 Supervisory Team Leader Live Dashboard Metrics (Team Leader)",
        security: [
          {
            bearerAuth: [],
          },
          {
            cookieAuth: [],
          },
        ],
        responses: {
          "200": {
            description:
              "TL KPIs, unassigned pool volume, team conversion, and workload distribution",
          },
          "401": {
            $ref: "#/components/responses/UnauthorizedError",
          },
          "403": {
            $ref: "#/components/responses/ForbiddenError",
          },
        },
        description:
          "> 🔒 **PROTECTED ROUTE (TEAM_LEADER ONLY)** — Requires \\`Authorization: Bearer <jwt_token>\\`.\\n> ⚠️ **Direct access without logging in will return 401 Unauthorized.** Users with \\`SALES_EXECUTIVE\\` role will return **403 Forbidden**.\\n\\nSupervisory Team Leader Live Dashboard Metrics (Team Leader)",
      },
    },
    "/reports/dashboard-metrics/sales-executive": {
      get: {
        tags: ["Reports & Analytics"],
        summary: "🔒 Personal Work Queue & KPI Metrics (Sales Executive)",
        security: [
          {
            bearerAuth: [],
          },
          {
            cookieAuth: [],
          },
        ],
        responses: {
          "200": {
            description:
              "Assigned leads, conversion rate, today's follow-ups, and overdue counter",
          },
          "401": {
            $ref: "#/components/responses/UnauthorizedError",
          },
          "403": {
            $ref: "#/components/responses/ForbiddenError",
          },
        },
        description:
          "> 🔒 **PROTECTED ROUTE (SALES_EXECUTIVE ONLY)** — Requires \\`Authorization: Bearer <jwt_token>\\`.\\n> ⚠️ **Direct access without logging in will return 401 Unauthorized.** Executive personal metrics isolation enforced.\\n\\nPersonal Work Queue & KPI Metrics (Sales Executive)",
      },
    },
    "/reports/leads": {
      get: {
        tags: ["Reports & Analytics"],
        summary: "🔒 Pipeline Funnel & Conversion Analytics (Team Leader)",
        security: [
          {
            bearerAuth: [],
          },
          {
            cookieAuth: [],
          },
        ],
        parameters: [
          {
            name: "timeRange",
            in: "query",
            schema: {
              type: "string",
              example: "7d",
            },
          },
          {
            name: "executiveId",
            in: "query",
            schema: {
              type: "string",
            },
          },
          {
            name: "source",
            in: "query",
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          "200": {
            description: "Funnel analytics",
          },
          "401": {
            $ref: "#/components/responses/UnauthorizedError",
          },
          "403": {
            $ref: "#/components/responses/ForbiddenError",
          },
        },
        description:
          "> 🔒 **PROTECTED ROUTE (TEAM_LEADER ONLY)** — Requires \\`Authorization: Bearer <jwt_token>\\`.\\n> ⚠️ **Direct access without logging in will return 401 Unauthorized.** Users with \\`SALES_EXECUTIVE\\` role will return **403 Forbidden**.\\n\\nPipeline Funnel & Conversion Analytics (Team Leader)",
      },
    },
    "/reports/performance": {
      get: {
        tags: ["Reports & Analytics"],
        summary: "🔒 Executive Performance Scorecards Report (Team Leader)",
        security: [
          {
            bearerAuth: [],
          },
          {
            cookieAuth: [],
          },
        ],
        parameters: [
          {
            name: "timeRange",
            in: "query",
            schema: {
              type: "string",
              example: "30d",
            },
          },
          {
            name: "executiveId",
            in: "query",
            schema: {
              type: "string",
            },
          },
          {
            name: "fromDate",
            in: "query",
            schema: {
              type: "string",
              format: "date",
            },
          },
          {
            name: "toDate",
            in: "query",
            schema: {
              type: "string",
              format: "date",
            },
          },
        ],
        responses: {
          "200": {
            description: "Performance scorecards",
          },
          "401": {
            $ref: "#/components/responses/UnauthorizedError",
          },
          "403": {
            $ref: "#/components/responses/ForbiddenError",
          },
        },
        description:
          "> 🔒 **PROTECTED ROUTE (TEAM_LEADER ONLY)** — Requires \\`Authorization: Bearer <jwt_token>\\`.\\n> ⚠️ **Direct access without logging in will return 401 Unauthorized.** Users with \\`SALES_EXECUTIVE\\` role will return **403 Forbidden**.\\n\\nExecutive Performance Scorecards Report (Team Leader)",
      },
    },
    "/notifications": {
      get: {
        tags: ["Real-time Notifications"],
        summary: "🔒 Get User Operational Notifications Stream",
        security: [
          {
            bearerAuth: [],
          },
          {
            cookieAuth: [],
          },
        ],
        responses: {
          "200": {
            description: "List of notifications",
          },
          "401": {
            $ref: "#/components/responses/UnauthorizedError",
          },
        },
        description:
          "> 🔒 **PROTECTED ROUTE** — Requires \\`Authorization: Bearer <jwt_token>\\`.\\n> ⚠️ **Direct access without logging in will return 401 Unauthorized.** Sales Executive caller isolation and ownership boundaries strictly enforced.\\n\\nGet User Operational Notifications Stream",
      },
    },
    "/notifications/{id}/read": {
      patch: {
        tags: ["Real-time Notifications"],
        summary: "🔒 Mark Notification as Read",
        security: [
          {
            bearerAuth: [],
          },
          {
            cookieAuth: [],
          },
        ],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          "200": {
            description: "Marked as read",
          },
          "401": {
            $ref: "#/components/responses/UnauthorizedError",
          },
        },
        description:
          "> 🔒 **PROTECTED ROUTE** — Requires \\`Authorization: Bearer <jwt_token>\\`.\\n> ⚠️ **Direct access without logging in will return 401 Unauthorized.** Sales Executive caller isolation and ownership boundaries strictly enforced.\\n\\nMark Notification as Read",
      },
    },
    "/notifications/read-all": {
      patch: {
        tags: ["Real-time Notifications"],
        summary: "🔒 Mark All Notifications as Read",
        security: [
          {
            bearerAuth: [],
          },
          {
            cookieAuth: [],
          },
        ],
        responses: {
          "200": {
            description: "All marked as read",
          },
          "401": {
            $ref: "#/components/responses/UnauthorizedError",
          },
        },
        description:
          "> 🔒 **PROTECTED ROUTE** — Requires \\`Authorization: Bearer <jwt_token>\\`.\\n> ⚠️ **Direct access without logging in will return 401 Unauthorized.** Sales Executive caller isolation and ownership boundaries strictly enforced.\\n\\nMark All Notifications as Read",
      },
    },
    "/audit-logs": {
      get: {
        tags: ["Audit & Compliance"],
        summary: "🔒 Query Immutable System Audit Trail (Team Leader)",
        security: [
          {
            bearerAuth: [],
          },
          {
            cookieAuth: [],
          },
        ],
        parameters: [
          {
            name: "page",
            in: "query",
            schema: {
              type: "integer",
              default: 1,
            },
          },
          {
            name: "limit",
            in: "query",
            schema: {
              type: "integer",
              default: 25,
            },
          },
        ],
        responses: {
          "200": {
            description:
              "Audit log entries with actor, action, previous/new values, IP, and timestamp",
          },
          "401": {
            $ref: "#/components/responses/UnauthorizedError",
          },
          "403": {
            $ref: "#/components/responses/ForbiddenError",
          },
        },
        description:
          "> 🔒 **PROTECTED ROUTE (TEAM_LEADER ONLY)** — Requires \\`Authorization: Bearer <jwt_token>\\`.\\n> ⚠️ **Direct access without logging in will return 401 Unauthorized.** Users with \\`SALES_EXECUTIVE\\` role will return **403 Forbidden**.\\n\\nQuery Immutable System Audit Trail (Team Leader)",
      },
    },
    "/conversations": {
      get: {
        tags: ["Conversations & Messaging"],
        summary: "🔒 List User Conversations",
        description:
          "> 🔒 **PROTECTED ROUTE** — Requires \\`Authorization: Bearer <jwt_token>\\` or session cookie.\\n\\nLists conversations for the authenticated user, ordered by recent activity (\\`updatedAt desc\\`). Includes participant profiles and the latest message snippet.",
        parameters: [
          {
            name: "limit",
            in: "query",
            description: "Number of conversations to return",
            schema: {
              type: "integer",
              default: 10,
            },
          },
          {
            name: "cursor",
            in: "query",
            description: "Pagination cursor (Conversation ID)",
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          "200": {
            description: "Conversations retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },
                    data: {
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/Conversation",
                      },
                    },
                  },
                },
              },
            },
          },
          "401": {
            $ref: "#/components/responses/UnauthorizedError",
          },
        },
      },
    },
    "/conversations/direct": {
      post: {
        tags: ["Conversations & Messaging"],
        summary: "🔒 Create or Retrieve Direct Conversation",
        description:
          "> 🔒 **PROTECTED ROUTE** — Requires \\`Authorization: Bearer <jwt_token>\\` or session cookie.\\n\\nInitializes a 1-on-1 direct conversation with the target user or retrieves the existing conversation if one already exists.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["toUserId"],
                properties: {
                  toUserId: {
                    type: "string",
                    format: "uuid",
                    example: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
                    description: "Target user ID for the direct conversation",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Existing direct conversation retrieved",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },
                    data: {
                      $ref: "#/components/schemas/Conversation",
                    },
                  },
                },
              },
            },
          },
          "201": {
            description: "New direct conversation created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },
                    data: {
                      $ref: "#/components/schemas/Conversation",
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "Missing or invalid target user ID",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/StandardErrorResponse",
                },
              },
            },
          },
          "401": {
            $ref: "#/components/responses/UnauthorizedError",
          },
        },
      },
    },
    "/conversations/{id}/messages": {
      get: {
        tags: ["Conversations & Messaging"],
        summary: "🔒 Fetch Conversation Messages",
        description:
          "> 🔒 **PROTECTED ROUTE** — Requires \\`Authorization: Bearer <jwt_token>\\` or session cookie.\\n\\nReturns chronological message history for the specified conversation. Caller must be a conversation participant.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Conversation ID",
            schema: {
              type: "string",
              format: "uuid",
            },
          },
          {
            name: "limit",
            in: "query",
            description: "Maximum number of messages to return",
            schema: {
              type: "integer",
              default: 100,
            },
          },
          {
            name: "cursor",
            in: "query",
            description: "Message ID cursor for pagination",
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          "200": {
            description: "Messages fetched successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },
                    data: {
                      type: "array",
                      items: {
                        $ref: "#/components/schemas/ChatMessage",
                      },
                    },
                  },
                },
              },
            },
          },
          "401": {
            $ref: "#/components/responses/UnauthorizedError",
          },
          "403": {
            $ref: "#/components/responses/ForbiddenError",
          },
          "404": {
            description: "Conversation not found",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/StandardErrorResponse",
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Conversations & Messaging"],
        summary: "🔒 Send Message to Conversation",
        description:
          "> 🔒 **PROTECTED ROUTE** — Requires \\`Authorization: Bearer <jwt_token>\\` or session cookie.\\n\\nPersists a new message in the specified conversation and broadcasts real-time WebSocket notifications to other participants.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Conversation ID",
            schema: {
              type: "string",
              format: "uuid",
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["content"],
                properties: {
                  content: {
                    type: "string",
                    minLength: 1,
                    maxLength: 10000,
                    example: "Hello team, let's review the lead allocations.",
                  },
                  type: {
                    $ref: "#/components/schemas/MessageType",
                    default: "TEXT",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Message sent successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },
                    message: {
                      type: "string",
                      example: "Message sent successfully",
                    },
                    data: {
                      $ref: "#/components/schemas/ChatMessage",
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "Empty or invalid message content",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/StandardErrorResponse",
                },
              },
            },
          },
          "401": {
            $ref: "#/components/responses/UnauthorizedError",
          },
          "403": {
            $ref: "#/components/responses/ForbiddenError",
          },
          "404": {
            description: "Conversation not found",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/StandardErrorResponse",
                },
              },
            },
          },
        },
      },
    },
    "/conversations/{id}/attachments": {
      post: {
        tags: ["Conversations & Messaging"],
        summary: "🔒 Send Image/File Attachment (Cloudinary)",
        description:
          "> 🔒 **PROTECTED ROUTE** — Requires `Authorization: Bearer <jwt_token>` or session cookie.\n\nUploads an image or document (`multipart/form-data`, field name `file`) which is stored on Cloudinary and persisted as an `IMAGE` or `FILE` message. The attachment metadata (URL, file name, size, MIME type) is stored as JSON in the message `content` field.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Conversation ID",
            schema: {
              type: "string",
              format: "uuid",
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["file"],
                properties: {
                  file: {
                    type: "string",
                    format: "binary",
                    description:
                      "Image (JPG, PNG, GIF, WEBP) or document (PDF, DOC, XLS, PPT, TXT, CSV, ZIP). Max 10 MB.",
                  },
                  caption: {
                    type: "string",
                    description: "Optional caption sent alongside the attachment.",
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Attachment uploaded and message created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: {
                      type: "string",
                      example: "Attachment sent successfully",
                    },
                    data: { $ref: "#/components/schemas/ChatMessage" },
                  },
                },
              },
            },
          },
          "400": {
            description: "No file provided or unsupported file type",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/StandardErrorResponse",
                },
              },
            },
          },
          "401": { $ref: "#/components/responses/UnauthorizedError" },
          "403": { $ref: "#/components/responses/ForbiddenError" },
          "404": {
            description: "Conversation not found",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/StandardErrorResponse",
                },
              },
            },
          },
          "503": {
            description: "Cloudinary storage not configured on the server",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/StandardErrorResponse",
                },
              },
            },
          },
        },
      },
    },

    "/conversations/{id}/read": {
      patch: {
        tags: ["Conversations & Messaging"],
        summary: "🔒 Update User Read Position (Mark as Read)",
        description:
          "> 🔒 **PROTECTED ROUTE** — Requires \\`Authorization: Bearer <jwt_token>\\` or session cookie.\\n\\nUpdates the authenticated user's read cursor (\\`lastReadAt = now()\\`) on their participant record, clearing unread status.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Conversation ID",
            schema: {
              type: "string",
              format: "uuid",
            },
          },
        ],
        responses: {
          "200": {
            description: "Read position updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },
                    message: {
                      type: "string",
                      example: "Message read successfully",
                    },
                    data: {
                      type: "object",
                      properties: {
                        success: {
                          type: "boolean",
                          example: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "401": {
            $ref: "#/components/responses/UnauthorizedError",
          },
          "404": {
            description: "Conversation not found",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/StandardErrorResponse",
                },
              },
            },
          },
        },
      },
    },
    "/conversations/{id}/archive": {
      patch: {
        tags: ["Conversations & Messaging"],
        summary: "🔒 Archive / Unarchive Conversation",
        description:
          "> 🔒 **PROTECTED ROUTE** — Requires \\`Authorization: Bearer <jwt_token>\\` or session cookie.\\n\\nToggles \\`isArchived\\` status for the authenticated user within this conversation.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Conversation ID",
            schema: {
              type: "string",
              format: "uuid",
            },
          },
        ],
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  isArchived: {
                    type: "boolean",
                    default: true,
                    example: true,
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Archive state updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },
                    isArchived: {
                      type: "boolean",
                      example: true,
                    },
                  },
                },
              },
            },
          },
          "401": {
            $ref: "#/components/responses/UnauthorizedError",
          },
        },
      },
    },
    "/conversations/{id}/mute": {
      patch: {
        tags: ["Conversations & Messaging"],
        summary: "🔒 Mute / Unmute Conversation Notifications",
        description:
          "> 🔒 **PROTECTED ROUTE** — Requires \\`Authorization: Bearer <jwt_token>\\` or session cookie.\\n\\nToggles \\`isMuted\\` status for the authenticated user within this conversation.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Conversation ID",
            schema: {
              type: "string",
              format: "uuid",
            },
          },
        ],
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  isMuted: {
                    type: "boolean",
                    default: true,
                    example: true,
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Mute state updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },
                    isMuted: {
                      type: "boolean",
                      example: true,
                    },
                  },
                },
              },
            },
          },
          "401": {
            $ref: "#/components/responses/UnauthorizedError",
          },
        },
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
    {
      cookieAuth: [],
    },
  ],
};

// Route to return raw JSON schema
docsRouter.get("/json", (req: Request, res: Response) => {
  res.setHeader("Content-Type", "application/json");
  res.json(openApiSpec);
});

// Interactive HTML Swagger UI at /api/docs and /api/docs#/
const renderSwaggerDocs = (req: Request, res: Response) => {
  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <title>CRM Enterprise API Documentation & Explorer</title>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%232563eb' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><rect width='20' height='14' x='2' y='5' rx='2'/><line x1='2' x2='22' y1='10' y2='10'/></svg>">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.11.0/swagger-ui.css" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
    <style>
      :root {
        --primary-blue: #2563eb;
        --primary-dark: #1e40af;
        --slate-900: #0f172a;
        --slate-800: #1e293b;
        --slate-700: #334155;
        --slate-600: #475569;
        --slate-200: #e2e8f0;
        --slate-100: #f1f5f9;
        --slate-50: #f8fafc;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        padding: 0;
        background-color: var(--slate-50);
        color: var(--slate-800);
        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        -webkit-font-smoothing: antialiased;
      }

      /* Command Header */
      .portal-header {
        background-color: var(--slate-900);
        border-bottom: 1px solid var(--slate-800);
        position: sticky;
        top: 0;
        z-index: 100;
        box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.4);
      }
      .portal-header-container {
        max-width: 1400px;
        margin: 0 auto;
        padding: 14px 24px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
      }
      .brand-group {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .brand-icon {
        width: 36px;
        height: 36px;
        border-radius: 10px;
        background: linear-gradient(135deg, #2563eb, #3b82f6);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ffffff;
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
      }
      .brand-icon svg { width: 20px; height: 20px; }
      .brand-text h1 {
        font-size: 17px;
        font-weight: 700;
        color: #ffffff;
        margin: 0;
        letter-spacing: -0.01em;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .brand-text p {
        font-size: 12px;
        color: #94a3b8;
        margin: 2px 0 0;
      }
      .badge-pill {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 2px 8px;
        font-size: 11px;
        font-weight: 600;
        border-radius: 9999px;
        background-color: rgba(56, 189, 248, 0.12);
        color: #38bdf8;
        border: 1px solid rgba(56, 189, 248, 0.25);
      }
      .header-actions {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .action-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 7px 14px;
        font-size: 12.5px;
        font-weight: 600;
        border-radius: 8px;
        text-decoration: none;
        transition: all 0.15s ease;
        cursor: pointer;
        font-family: inherit;
      }
      .action-btn-secondary {
        background-color: rgba(255, 255, 255, 0.08);
        color: #e2e8f0;
        border: 1px solid rgba(255, 255, 255, 0.12);
      }
      .action-btn-secondary:hover {
        background-color: rgba(255, 255, 255, 0.15);
        color: #ffffff;
      }
      .action-btn-primary {
        background: linear-gradient(135deg, #2563eb, #1d4ed8);
        color: #ffffff;
        border: 1px solid #3b82f6;
        box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
      }
      .action-btn-primary:hover {
        background: linear-gradient(135deg, #1d4ed8, #1e40af);
      }

      /* Interactive Auth Console */
      .auth-console-bar {
        max-width: 1400px;
        margin: 20px auto 0;
        padding: 0 24px;
      }
      .auth-console-card {
        background: #ffffff;
        border: 1px solid #bfdbfe;
        border-radius: 12px;
        padding: 16px 20px;
        box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .auth-console-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 12px;
      }
      .auth-status-indicator {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .status-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        flex-shrink: 0;
      }
      .status-offline {
        background-color: #f43f5e;
        box-shadow: 0 0 0 3px rgba(244, 63, 94, 0.2);
      }
      .status-online {
        background-color: #10b981;
        box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
      }
      .status-labels {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .status-title {
        font-size: 14px;
        font-weight: 700;
        color: var(--slate-900);
      }
      .status-subtitle {
        font-size: 12px;
        color: var(--slate-600);
      }
      .auth-quick-actions {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }
      .btn-demo-auth {
        padding: 6px 12px;
        font-size: 12px;
        font-weight: 600;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.15s ease;
        border: 1px solid transparent;
        font-family: inherit;
      }
      .btn-tl {
        background-color: #eff6ff;
        color: #1d4ed8;
        border-color: #93c5fd;
      }
      .btn-tl:hover { background-color: #dbeafe; }
      .btn-se {
        background-color: #ecfdf5;
        color: #047857;
        border-color: #a7f3d0;
      }
      .btn-se:hover { background-color: #d1fae5; }
      .btn-toggle-form {
        background-color: #f8fafc;
        color: #475569;
        border-color: #cbd5e1;
      }
      .btn-toggle-form:hover {
        background-color: #f1f5f9;
        color: #0f172a;
      }
      .btn-clear {
        background-color: #fff1f2;
        color: #be123c;
        border-color: #fecdd3;
      }
      .btn-clear:hover { background-color: #ffe4e6; }

      /* Drawer Forms */
      .auth-forms-drawer {
        display: none;
        background-color: #f8fafc;
        border: 1px solid var(--slate-200);
        border-radius: 8px;
        padding: 16px;
        margin-top: 4px;
      }
      .auth-forms-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 16px;
      }
      .form-section-title {
        font-size: 13px;
        font-weight: 700;
        color: var(--slate-900);
        margin-bottom: 8px;
      }
      .form-row {
        display: flex;
        flex-direction: column;
        gap: 4px;
        margin-bottom: 8px;
      }
      .form-label {
        font-size: 11.5px;
        font-weight: 600;
        color: var(--slate-600);
      }
      .form-input {
        padding: 6px 10px;
        font-size: 12.5px;
        border-radius: 6px;
        border: 1px solid var(--slate-200);
        background: #ffffff;
        font-family: inherit;
        color: var(--slate-900);
      }
      .form-input:focus {
        outline: none;
        border-color: var(--primary-blue);
      }
      .btn-form-submit {
        padding: 7px 14px;
        font-size: 12px;
        font-weight: 600;
        border-radius: 6px;
        color: #ffffff;
        border: none;
        cursor: pointer;
        font-family: inherit;
      }

      /* Token Input Row */
      .auth-custom-token-row {
        display: flex;
        align-items: center;
        gap: 8px;
        padding-top: 10px;
        border-top: 1px dashed var(--slate-200);
        flex-wrap: wrap;
      }
      .token-input-prefix {
        font-size: 12px;
        font-weight: 700;
        color: var(--slate-700);
        font-family: 'JetBrains Mono', monospace;
      }
      #manual-token-input {
        flex: 1;
        min-width: 240px;
        padding: 6px 12px;
        font-size: 12px;
        border-radius: 6px;
        border: 1px solid var(--slate-200);
        font-family: 'JetBrains Mono', monospace;
        color: var(--slate-900);
      }
      #manual-token-input:focus {
        outline: none;
        border-color: var(--primary-blue);
        box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
      }
      .btn-apply-token {
        padding: 6px 14px;
        font-size: 12px;
        font-weight: 600;
        border-radius: 6px;
        background-color: var(--slate-800);
        color: #ffffff;
        border: none;
        cursor: pointer;
        font-family: inherit;
      }
      .auth-feedback-toast {
        font-size: 12px;
        padding: 4px 10px;
        border-radius: 6px;
        font-weight: 600;
      }
      .toast-success {
        background-color: #ecfdf5;
        color: #047857;
        border: 1px solid #a7f3d0;
      }
      .toast-info {
        background-color: #eff6ff;
        color: #1d4ed8;
        border: 1px solid #bfdbfe;
      }
      .toast-error {
        background-color: #fff1f2;
        color: #be123c;
        border: 1px solid #fecdd3;
      }

      /* Swagger UI container */
      .swagger-ui-container {
        max-width: 1400px;
        margin: 16px auto 60px;
        padding: 0 24px;
      }
      .swagger-ui {
        background-color: #ffffff;
        border: 1px solid var(--slate-200);
        border-radius: 14px;
        padding: 24px 20px 48px;
        box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.05);
      }
      .swagger-ui .topbar {
        display: none !important;
      }
      .swagger-ui .info {
        margin: 10px 0 24px;
      }
      .swagger-ui .info .title {
        font-size: 26px !important;
        font-weight: 800 !important;
        color: var(--slate-900) !important;
      }
    </style>
  </head>
  <body>
    <!-- Top Navigation Command Bar -->
    <header class="portal-header">
      <div class="portal-header-container">
        <div class="brand-group">
          <div class="brand-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
            </svg>
          </div>
          <div class="brand-text">
            <h1>
              CRM Enterprise REST API
              <span class="badge-pill">v1.0.0</span>
              <span class="badge-pill" style="color: #4ade80; border-color: rgba(74, 222, 128, 0.25); background: rgba(74, 222, 128, 0.1);">OpenAPI 3.0</span>
            </h1>
            <p>Authoritative Backend Engine & Interactive API Explorer</p>
          </div>
        </div>

        <div class="header-actions">
          <a href="/api/health" target="_blank" class="action-btn action-btn-secondary" title="View Server Health Status">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            System Health
          </a>
          <a href="/api/docs/json" target="_blank" class="action-btn action-btn-primary" title="Download or Inspect OpenAPI 3.0 Specification JSON">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            Raw JSON Spec
          </a>
        </div>
      </div>
    </header>

    <!-- Interactive Authentication & Account Console -->
    <div class="auth-console-bar">
      <div class="auth-console-card">
        <div class="auth-console-header">
          <div class="auth-status-indicator">
            <span class="status-dot status-offline" id="auth-status-dot"></span>
            <div class="status-labels">
              <div class="status-title" id="auth-status-title">Protected Routes Mode: Authentication Required (HTTP 401)</div>
              <div class="status-subtitle" id="auth-status-subtitle">
                All endpoints marked with lock require an active JWT Bearer token. Public endpoints like Register and Login can be tested directly below.
              </div>
            </div>
          </div>

          <div class="auth-quick-actions">
            <button type="button" class="btn-demo-auth btn-tl" title="Authenticate as Team Leader" onclick="loginDemo('teamleader@leadflow.io', 'Password@123', 'TEAM_LEADER', 'Marcus Sterling')">
              ⚡ 1-Click Login (Team Leader)
            </button>
            <button type="button" class="btn-demo-auth btn-se" title="Authenticate as Sales Executive" onclick="loginDemo('alex.sales@leadflow.io', 'Password@123', 'SALES_EXECUTIVE', 'Alex Rivera')">
              ⚡ 1-Click Login (Sales Executive)
            </button>
            <button type="button" class="btn-demo-auth btn-toggle-form" onclick="toggleAuthForms()">
              📝 Register or Login Form
            </button>
            <button type="button" class="btn-demo-auth btn-clear" title="Clear token to test unauthenticated 401 Unauthorized response" onclick="clearAuth()">
              ✕ Clear Token (Test 401)
            </button>
          </div>
        </div>

        <!-- Inline Interactive Register & Login Drawer -->
        <div id="auth-forms-drawer" class="auth-forms-drawer">
          <div class="auth-forms-grid">
            <!-- Custom Login Form -->
            <form id="custom-login-form" onsubmit="handleCustomLogin(event)">
              <div class="form-section-title">🔑 Direct User Login</div>
              <div class="form-row">
                <label class="form-label">Email Address</label>
                <input type="email" id="login-email" class="form-input" required value="teamleader@leadflow.io" />
              </div>
              <div class="form-row">
                <label class="form-label">Password</label>
                <input type="password" id="login-password" class="form-input" required value="Password@123" />
              </div>
              <button type="submit" class="btn-form-submit" style="background-color: #2563eb;">Sign In & Authorize</button>
            </form>

            <!-- User Registration Form -->
            <form id="custom-register-form" onsubmit="handleCustomRegister(event)">
              <div class="form-section-title">📝 Register New Account</div>
              <div class="form-row">
                <label class="form-label">Full Name</label>
                <input type="text" id="reg-name" class="form-input" required placeholder="e.g. Aditi Rao" />
              </div>
              <div class="form-row">
                <label class="form-label">Email Address</label>
                <input type="email" id="reg-email" class="form-input" required placeholder="aditi.rao@company.com" />
              </div>
              <div class="form-row">
                <label class="form-label">Password (Min 6, uppercase, lowercase, number, special char)</label>
                <input type="password" id="reg-password" class="form-input" required value="Password@123" />
              </div>
              <div class="form-row">
                <label class="form-label">Role</label>
                <select id="reg-role" class="form-input">
                  <option value="SALES_EXECUTIVE">Sales Executive</option>
                  <option value="TEAM_LEADER">Team Leader</option>
                </select>
              </div>
              <button type="submit" class="btn-form-submit" style="background-color: #059669;">Register & Authorize</button>
            </form>
          </div>
        </div>

        <!-- Token Injection Row -->
        <div class="auth-custom-token-row">
          <span class="token-input-prefix">Authorization: Bearer</span>
          <input type="text" id="manual-token-input" placeholder="Paste custom JWT token here..." />
          <button type="button" class="btn-apply-token" onclick="applyCustomToken()">Apply to Swagger UI</button>
          <div id="auth-feedback-toast" class="auth-feedback-toast" style="display: none;"></div>
        </div>
      </div>
    </div>

    <!-- Main Swagger UI Viewport -->
    <main class="swagger-ui-container">
      <div id="swagger-ui"></div>
    </main>

    <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.11.0/swagger-ui-standalone-preset.js"></script>
    <script>
      function toggleAuthForms() {
        const drawer = document.getElementById('auth-forms-drawer');
        if (drawer) {
          drawer.style.display = drawer.style.display === 'block' ? 'none' : 'block';
        }
      }

      function setSwaggerToken(token, role, name) {
        localStorage.setItem('crm_docs_token', token);
        localStorage.setItem('crm_docs_user', JSON.stringify({ role: role, name: name }));
        
        if (window.ui && window.ui.preauthorizeApiKey) {
          window.ui.preauthorizeApiKey('bearerAuth', 'Bearer ' + token);
        }
        
        const dot = document.getElementById('auth-status-dot');
        const title = document.getElementById('auth-status-title');
        const subtitle = document.getElementById('auth-status-subtitle');
        const input = document.getElementById('manual-token-input');
        
        if (dot) dot.className = 'status-dot status-online';
        if (title) title.innerText = 'Authenticated as ' + (name || 'Caller') + ' [' + (role || 'AUTHENTICATED') + ']';
        if (subtitle) subtitle.innerText = 'Bearer JWT active in Swagger UI headers. Protected endpoints will execute with HTTP 200.';
        if (input) input.value = token;
      }

      function clearAuth() {
        localStorage.removeItem('crm_docs_token');
        localStorage.removeItem('crm_docs_user');
        
        if (window.ui && window.ui.authActions) {
          window.ui.authActions.logout(['bearerAuth']);
        }
        
        const dot = document.getElementById('auth-status-dot');
        const title = document.getElementById('auth-status-title');
        const subtitle = document.getElementById('auth-status-subtitle');
        const input = document.getElementById('manual-token-input');
        const toast = document.getElementById('auth-feedback-toast');
        
        if (dot) dot.className = 'status-dot status-offline';
        if (title) title.innerText = 'Protected Routes Mode: Authentication Required (HTTP 401)';
        if (subtitle) subtitle.innerText = 'All endpoints marked with lock require an active JWT Bearer token. Directly accessing without login returns 401 Unauthorized.';
        if (input) input.value = '';
        
        if (toast) {
          toast.style.display = 'inline-block';
          toast.className = 'auth-feedback-toast toast-info';
          toast.innerText = 'Token cleared. Protected routes will now return 401 Unauthorized.';
        }
      }

      async function loginDemo(email, password, role, name) {
        const toast = document.getElementById('auth-feedback-toast');
        if (toast) {
          toast.style.display = 'inline-block';
          toast.className = 'auth-feedback-toast toast-info';
          toast.innerText = 'Authenticating as ' + name + '...';
        }

        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, password: password })
          });
          const result = await res.json();
          if (result.success && result.data && result.data.token) {
            setSwaggerToken(result.data.token, role, name);
            if (toast) {
              toast.className = 'auth-feedback-toast toast-success';
              toast.innerText = 'Authenticated as ' + name + ' [' + role + ']. Token active!';
            }
          } else {
            if (toast) {
              toast.className = 'auth-feedback-toast toast-error';
              toast.innerText = 'Login failed: ' + (result.message || 'Unknown error');
            }
          }
        } catch (err) {
          if (toast) {
            toast.className = 'auth-feedback-toast toast-error';
            toast.innerText = 'Request failed: ' + err.message;
          }
        }
      }

      async function handleCustomLogin(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        const toast = document.getElementById('auth-feedback-toast');

        if (toast) {
          toast.style.display = 'inline-block';
          toast.className = 'auth-feedback-toast toast-info';
          toast.innerText = 'Signing in...';
        }

        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, password: password })
          });
          const result = await res.json();
          if (result.success && result.data && result.data.token) {
            const user = result.data.user || {};
            setSwaggerToken(result.data.token, user.role, user.name);
            if (toast) {
              toast.className = 'auth-feedback-toast toast-success';
              toast.innerText = 'Signed in as ' + (user.name || email) + ' [' + (user.role || 'USER') + ']!';
            }
            toggleAuthForms();
          } else {
            if (toast) {
              toast.className = 'auth-feedback-toast toast-error';
              toast.innerText = 'Login failed: ' + (result.message || 'Invalid credentials');
            }
          }
        } catch (err) {
          if (toast) {
            toast.className = 'auth-feedback-toast toast-error';
            toast.innerText = 'Error: ' + err.message;
          }
        }
      }

      async function handleCustomRegister(e) {
        e.preventDefault();
        const name = document.getElementById('reg-name').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const password = document.getElementById('reg-password').value;
        const role = document.getElementById('reg-role').value;
        const toast = document.getElementById('auth-feedback-toast');

        if (toast) {
          toast.style.display = 'inline-block';
          toast.className = 'auth-feedback-toast toast-info';
          toast.innerText = 'Registering new account...';
        }

        try {
          const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name, email: email, password: password, role: role })
          });
          const result = await res.json();
          if (result.success && result.data && result.data.token) {
            const user = result.data.user || {};
            setSwaggerToken(result.data.token, user.role, user.name);
            if (toast) {
              toast.className = 'auth-feedback-toast toast-success';
              toast.innerText = 'Account created! Authenticated as ' + user.name + ' [' + user.role + '].';
            }
            toggleAuthForms();
          } else {
            if (toast) {
              toast.className = 'auth-feedback-toast toast-error';
              toast.innerText = 'Registration failed: ' + (result.message || 'Validation error');
            }
          }
        } catch (err) {
          if (toast) {
            toast.className = 'auth-feedback-toast toast-error';
            toast.innerText = 'Error: ' + err.message;
          }
        }
      }

      function applyCustomToken() {
        const input = document.getElementById('manual-token-input');
        const toast = document.getElementById('auth-feedback-toast');
        const token = input ? input.value.trim().replace(/^Bearer\s+/i, '') : '';
        
        if (!token) {
          if (toast) {
            toast.style.display = 'inline-block';
            toast.className = 'auth-feedback-toast toast-error';
            toast.innerText = 'Please enter a valid token.';
          }
          return;
        }

        setSwaggerToken(token, 'CUSTOM_TOKEN', 'Custom Token');
        if (toast) {
          toast.style.display = 'inline-block';
          toast.className = 'auth-feedback-toast toast-success';
          toast.innerText = 'Custom Bearer token injected into Swagger UI!';
        }
      }

      function initSwagger() {
        try {
          if (typeof SwaggerUIBundle === 'undefined') {
            setTimeout(initSwagger, 100);
            return;
          }

          window.ui = SwaggerUIBundle({
            url: '/api/docs/json',
            dom_id: '#swagger-ui',
            deepLinking: true,
            displayRequestDuration: true,
            docExpansion: 'list',
            filter: true,
            showExtensions: true,
            showCommonExtensions: true,
            persistAuthorization: true,
            tryItOutEnabled: true,
            defaultModelExpandDepth: 3,
            defaultModelsExpandDepth: 1,
            presets: [
              SwaggerUIBundle.presets.apis,
              SwaggerUIStandalonePreset
            ],
            layout: "StandaloneLayout"
          });

          // Check if token was previously saved and auto-authorize
          const savedToken = localStorage.getItem('crm_docs_token');
          const savedUserStr = localStorage.getItem('crm_docs_user');
          if (savedToken) {
            let user = { role: 'AUTHENTICATED', name: 'Saved User' };
            try { if (savedUserStr) user = JSON.parse(savedUserStr); } catch (e) {}
            setTimeout(function() {
              setSwaggerToken(savedToken, user.role, user.name);
            }, 300);
          }
        } catch (err) {
          console.error("Swagger UI initialization error:", err);
          var el = document.getElementById('swagger-ui');
          if (el) {
            el.innerHTML = '<div style="padding: 20px; color: #dc2626; font-weight: 600;">Failed to load Swagger UI: ' + err.message + '</div>';
          }
        }
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSwagger);
      } else {
        initSwagger();
      }
    </script>
  </body>
</html>`;

  res.setHeader("Content-Type", "text/html");
  res.send(html);
};

// OpenAPI Specification JSON Endpoints
docsRouter.get("/json", (req: Request, res: Response) => {
  res.setHeader("Content-Type", "application/json");
  res.json(openApiSpec);
});

docsRouter.get("/openapi.json", (req: Request, res: Response) => {
  res.setHeader("Content-Type", "application/json");
  res.json(openApiSpec);
});

// Handle both / and root path for /api/docs and /api/docs/
docsRouter.get("/", renderSwaggerDocs);
docsRouter.get("", renderSwaggerDocs);

export default docsRouter;
