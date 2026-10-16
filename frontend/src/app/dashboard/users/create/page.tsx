"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Loader2,
  ChevronRight,
  UserPlus,
  Info,
  User,
  Mail,
  Lock,
  ShieldCheck,
} from "lucide-react";
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
      <div className="space-y-4 animate-in fade-in duration-150 select-none pb-12 mx-auto">
        {/* Breadcrumb Navigation matching CRM Management Hub */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Link
            href="/dashboard"
            className="text-[#2874f0] hover:underline font-medium"
          >
            Home
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <Link
            href="/dashboard/users"
            className="text-[#2874f0] hover:underline font-medium"
          >
            Staff Directory
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="text-slate-700 dark:text-slate-300 font-medium">
            Add Staff Member
          </span>
        </div>

        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e0e0e0] dark:border-slate-800 pb-3">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-[#2874f0]" />
              <span>ADD STAFF MEMBER</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Provision account credentials and access permissions for a new
              Sales Executive or Team Leader.
            </p>
          </div>

          <Link
            href="/dashboard/users"
            className="h-8.5 px-3 rounded-sm bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 flex items-center gap-1.5 transition-colors shadow-2xs self-start sm:self-auto"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Directory</span>
          </Link>
        </div>

        {/* Marketplace Guidance Alert Banner */}
        <div className="bg-card border border-blue-200 rounded-sm p-3.5 flex items-start gap-3 shadow-2xs">
          <Info className="w-4 h-4 text-[#2874f0] shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <p className="font-bold text-accent-foreground uppercase tracking-wide">
              Role Hierarchy & Provisioning Guidelines
            </p>
            <div className="text-slate-600 dark:text-slate-300 space-y-0.5">
              <p>
                •{" "}
                <strong className="text-slate-800 dark:text-slate-200">
                  Sales Executive:
                </strong>{" "}
                Field recipient assigned to receive leads, follow up, log
                calls/emails, and update prospect statuses.
              </p>
              <p>
                •{" "}
                <strong className="text-slate-800 dark:text-slate-200">
                  Team Leader:
                </strong>{" "}
                Supervisory role with access to the unassigned intake pool,
                automated/custom distribution algorithms, and team reassignment
                consoles.
              </p>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 rounded-sm shadow-2xs overflow-hidden"
        >
          {/* Panel Header */}
          <div className="p-3.5 border-b border-[#e0e0e0] dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
            <div className="flex items-center gap-2">
              <span className="w-1 h-3.5 bg-[#2874f0] rounded-xs" />
              <h2 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                Account Credentials & Role Configuration
              </h2>
            </div>
          </div>

          <div className="p-4 sm:p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  <User className="w-3 h-3 text-[#2874f0]" />
                  <span>Full Name</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. John Doe"
                  className={cn(
                    "w-full h-8.5 px-3 rounded-sm bg-white dark:bg-slate-800 border text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 transition-colors",
                    errors.name
                      ? "border-rose-400 focus:ring-rose-500 bg-rose-50/20"
                      : "border-[#e0e0e0] dark:border-slate-700 focus:ring-[#2874f0] focus:border-[#2874f0]",
                  )}
                />
                {errors.name && (
                  <p className="text-[11px] text-rose-500 mt-1 font-medium">
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Work Email Address */}
              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  <Mail className="w-3 h-3 text-[#2874f0]" />
                  <span>Work Email Address</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. john.doe@company.com"
                  className={cn(
                    "w-full h-8.5 px-3 rounded-sm bg-white dark:bg-slate-800 border text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 transition-colors",
                    errors.email
                      ? "border-rose-400 focus:ring-rose-500 bg-rose-50/20"
                      : "border-[#e0e0e0] dark:border-slate-700 focus:ring-[#2874f0] focus:border-[#2874f0]",
                  )}
                />
                {errors.email && (
                  <p className="text-[11px] text-rose-500 mt-1 font-medium">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Initial Password */}
              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  <Lock className="w-3 h-3 text-[#2874f0]" />
                  <span>Initial Password</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Leave blank for default (LeadFlow#2026)"
                  className={cn(
                    "w-full h-8.5 px-3 rounded-sm bg-white dark:bg-slate-800 border text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 transition-colors",
                    errors.password
                      ? "border-rose-400 focus:ring-rose-500 bg-rose-50/20"
                      : "border-[#e0e0e0] dark:border-slate-700 focus:ring-[#2874f0] focus:border-[#2874f0]",
                  )}
                />
                {errors.password ? (
                  <p className="text-[11px] text-rose-500 mt-1 font-medium">
                    {errors.password}
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                    Optional: User can reset their temporary password upon
                    initial login.
                  </p>
                )}
              </div>

              {/* Assigned Role */}
              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  <ShieldCheck className="w-3 h-3 text-[#2874f0]" />
                  <span>Assigned Role</span>
                  <span className="text-rose-500">*</span>
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
                      "w-full h-8.5 px-3 rounded-sm bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:ring-1",
                      errors.role
                        ? "border-rose-400 focus:ring-rose-500 bg-rose-50/20"
                        : "border-[#e0e0e0] dark:border-slate-700 focus:ring-[#2874f0] focus:border-[#2874f0]",
                    )}
                  >
                    <SelectValue placeholder="Select assigned role" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 text-slate-800 dark:text-slate-200">
                    <SelectItem value={UserRole.SALES_EXECUTIVE}>
                      Sales Executive (SE) — Field Agent & Lead Recipient
                    </SelectItem>
                    <SelectItem value={UserRole.TEAM_LEADER}>
                      Team Leader (TL) — Manager & Lead Distributor
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
          </div>

          {/* Form Actions Footer */}
          <div className="p-3.5 border-t border-[#e0e0e0] dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-end gap-2.5">
            <Link
              href="/dashboard/users"
              className="h-8.5 px-4 rounded-sm border border-[#e0e0e0] dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold uppercase tracking-wider flex items-center transition-colors shadow-2xs"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="h-8.5 px-5 rounded-sm bg-[#fb641b] hover:bg-[#e85a15] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-2xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
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
