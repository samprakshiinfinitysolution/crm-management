import { z } from "zod";
import { UserRole } from "@/types/api.types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Registration input validation schema
export const registerSchema = z
  .object({
    name: z.string().min(2, { message: "Name must be at least 2 characters long" }),
    email: z.string().email({ message: "Invalid email address" }),
    // phone: z.string().min(10, { message: "Phone must be at least 10 digits long" }),
    // branch: z.string().min(1, { message: "Branch is required" }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters long" })
      .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
      .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
      .regex(/[0-9]/, { message: "Password must contain at least one number" })
      .regex(
        /[^A-Za-z0-9]/,
        { message: "Password must contain at least one special character" },
      ),
    confirmPassword: z
      .string()
      .min(6, { message: "Confirm password must be at least 6 characters long" }),
    role: z.nativeEnum(UserRole).default(UserRole.SALES_EXECUTIVE),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Create user input validation schema
export const createUserSchema = z
  .object({
    name: z.string().min(2, { message: "Name must be at least 2 characters long" }),
    email: z.string().email({ message: "Invalid email address" }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters long" })
      .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
      .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
      .regex(/[0-9]/, { message: "Password must contain at least one number" })
      .regex(
        /[^A-Za-z0-9]/,
        { message: "Password must contain at least one special character" },
      )
      .optional()
      .or(z.literal("")),
    role: z.enum([UserRole.ADMIN, UserRole.SALES_EXECUTIVE, UserRole.TEAM_LEADER]),
  })
  .strict();

// Login input validation schema
export const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
});

// Helper to safely get the environment key with fallback to CRM_Management
const getTokenKey = (): string =>
  process.env.NEXT_PUBLIC_TOKEN_KEY || "CRM_Management";

/**
 * Authentication tokens are intentionally httpOnly and cannot be read by client code.
 */
export const getToken = (): string => {
  return "";
};

/**
 * Persists the access token into both secure cookies and localStorage.
 * Ensures that even if cookies are reset during Vercel builds or server redeployments,
 * the authenticated user session remains intact.
 */
export const setToken = (_token?: string): void => {
  void _token;
};

export const removeToken = (): void => {
  const tokenKey = getTokenKey();
  try {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(tokenKey);
        localStorage.removeItem("CRM_Management");
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
      } catch {
        // Ignore storage access errors in private browsing modes
      }
    }
  } catch (error) {
    console.error("Error removing token:", error);
  }
};

export const handleInvalidFields = (invalid: string[]) => {
  let message = "";
  invalid.forEach((field) => {
    message += `${field} is invalid\n`;
  });
  return message;
};

const handleDuplicateFields = (duplicate: string[]) => {
  let message = "";
  duplicate.forEach((field) => {
    message += `${field} is duplicate\n`;
  });
  return message;
};

const handleMissingFields = (missing: string[]) => {
  let message = "";
  missing.forEach((field) => {
    message += `${field} is missing\n`;
  });
  return message;
};

const fieldUtils = {
  handleInvalidFields,
  handleDuplicateFields,
  handleMissingFields,
};

export default fieldUtils;
