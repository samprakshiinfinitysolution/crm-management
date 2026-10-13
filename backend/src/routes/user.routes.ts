import { Router } from "express";
import {
  getUsers,
  getUserById,
  getSalesExecutives,
  getSalesExecutiveById,
  toggleExecutiveStatus,
  toggleUserStatus,
  createUser,
  getOnlineUsers,
} from "../controllers/user.controller.js";
import {
  authenticateUser,
  requireRole,
} from "../middleware/auth.middleware.js";
import { UserRole } from "../types/index.js";

const userRouter = Router();

// Require authenticated user for all user management queries
userRouter.use(authenticateUser);

// Allow all authenticated users to retrieve currently online user IDs
userRouter.get("/online", getOnlineUsers);

// Allow all authenticated users (Admin, Team Leader, Sales Executive) to search active directory users
userRouter.get(
  "/",
  requireRole(UserRole.ADMIN, UserRole.TEAM_LEADER, UserRole.SALES_EXECUTIVE),
  getUsers,
);

// Privileged management actions require Team Leader or Admin authority
userRouter.use(requireRole(UserRole.TEAM_LEADER, UserRole.ADMIN));

userRouter.post("/", createUser);
userRouter.get("/", getUsers);
userRouter.get("/sales-executives", getSalesExecutives);
userRouter.get("/sales-executives/:id", getSalesExecutiveById);
userRouter.patch("/sales-executives/:id/status", toggleExecutiveStatus);
userRouter.patch("/:id/status", toggleUserStatus);
userRouter.get("/:id", getUserById);

export default userRouter;
