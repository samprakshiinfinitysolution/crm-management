"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, UserPlus, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { UserRole } from "@/types/api.types";
import { useCreateUserMutation } from "@/store";
import { handleApiError } from "@/lib/errorHandler";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createUserSchema, cn } from "@/lib/utils";

export default function CreateUserPage() {
  const router = useRouter();
  const [createUser, { isLoading }] = useCreateUserMutation();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: UserRole.SALES_EXECUTIVE,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFieldChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    handleFieldChange(name, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = createUserSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path[0];
        if (path && typeof path === "string" && !fieldErrors[path]) {
          fieldErrors[path] = issue.message;
        }
      });
      setErrors(fieldErrors);
      toast.error("Please resolve the highlighted form errors");
      return;
    }

    const { name, email, password, role } = result.data;

    try {
      const res = await createUser({
        name: name.trim(),
        email: email.trim(),
        password: password || undefined,
        role: role,
      }).unwrap();

      if (res.success) {
        toast.success(res.message || "Staff member added successfully!");
        router.push("/dashboard/users");
      } else {
        toast.error(res.message || "Failed to create user account");
      }
    } catch (err) {
      handleApiError(err, "Failed to create user account");
    }
  };

  return (
    <ProtectedRoute allowedRoles={[UserRole.TEAM_LEADER, UserRole.ADMIN]}>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/users"
            className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-750 transition-all shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>Add Staff Member</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Provision account access for a new Sales Executive or Team Leader
            </p>
          </div>
        </div>

        {/* Form Container */}
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-6 flex flex-col gap-5"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                required
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. John Doe"
                className={cn(
                  "w-full h-10 px-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border text-xs text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 transition-all",
                  errors.name
                    ? "border-rose-300 focus:ring-rose-500 bg-rose-50/20"
                    : "border-slate-200 dark:border-slate-700 focus:ring-blue-600",
                )}
              />
              {errors.name && (
                <p className="text-[11px] text-rose-500 mt-1 font-medium">
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Work Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                required
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. john.doe@company.com"
                className={cn(
                  "w-full h-10 px-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border text-xs text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 transition-all",
                  errors.email
                    ? "border-rose-300 focus:ring-rose-500 bg-rose-50/20"
                    : "border-slate-200 dark:border-slate-700 focus:ring-blue-600",
                )}
              />
              {errors.email && (
                <p className="text-[11px] text-rose-500 mt-1 font-medium">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Initial Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Leave blank for default (LeadFlow#2026)"
                className={cn(
                  "w-full h-10 px-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border text-xs text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 transition-all",
                  errors.password
                    ? "border-rose-300 focus:ring-rose-500 bg-rose-50/20"
                    : "border-slate-200 dark:border-slate-700 focus:ring-blue-600",
                )}
              />
              {errors.password ? (
                <p className="text-[11px] text-rose-500 mt-1 font-medium">
                  {errors.password}
                </p>
              ) : (
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                  Optional: User can reset their password on first login.
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Assigned Role <span className="text-rose-500">*</span>
              </label>
              <Select
                value={formData.role}
                onValueChange={(val) =>
                  handleFieldChange(
                    "role",
                    (val as UserRole) || UserRole.SALES_EXECUTIVE,
                  )
                }
              >
                <SelectTrigger
                  className={cn(
                    "w-full h-10 px-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:ring-2",
                    errors.role
                      ? "border-rose-300 focus:ring-rose-500 bg-rose-50/20"
                      : "border-slate-200 dark:border-slate-700 focus:ring-blue-600",
                  )}
                >
                  <SelectValue placeholder="Select assigned role" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200">
                  <SelectItem value={UserRole.SALES_EXECUTIVE}>
                    Sales Executive (SE) — Lead recipient & converter
                  </SelectItem>
                  <SelectItem value={UserRole.TEAM_LEADER}>
                    Team Leader (TL) — Manager & Lead distributor
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-[11px] text-rose-500 mt-1 font-medium">
                  {errors.role}
                </p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <Link
              href="/dashboard/users"
              className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Staff Member</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
}
