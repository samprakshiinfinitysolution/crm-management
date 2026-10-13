"use client";

import React from "react";
import { Shield, UserCheck } from "lucide-react";
import { useAppDispatch, useAppSelector, setSelectedRole } from "@/store";

export default function RoleSelector() {
  const dispatch = useAppDispatch();
  const selectedRole = useAppSelector((state) => state.auth.selectedRole);

  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
        Select your role in the team:
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => dispatch(setSelectedRole("tl"))}
          className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
            selectedRole === "tl"
              ? "border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/40 dark:bg-blue-950/40 shadow-xs"
              : "border-slate-200 dark:border-slate-800 bg-card hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Team Leader
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Distribute leads, oversee pipeline & monitor sales activity.
          </p>
        </button>

        <button
          type="button"
          onClick={() => dispatch(setSelectedRole("exec"))}
          className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
            selectedRole === "exec"
              ? "border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/40 dark:bg-blue-950/40 shadow-xs"
              : "border-slate-200 dark:border-slate-800 bg-card hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Sales Executive
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Manage your personal leads, schedule follow-ups & close deals.
          </p>
        </button>
      </div>
    </div>
  );
}
