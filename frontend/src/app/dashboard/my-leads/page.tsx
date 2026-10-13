"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Briefcase } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { UserRole } from "@/types/api.types";
import { useAppSelector } from "@/store";
import AssignedLeadsTable from "@/components/sales_executive/AssignedLeadsTable";
import LeadFollowUpTimelineDrawer from "@/components/sales_executive/LeadFollowUpTimelineDrawer";

export default function MyLeadsPage() {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  return (
    <ProtectedRoute allowedRoles={[UserRole.SALES_EXECUTIVE]}>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <section className="bg-white dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-800/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                My Assigned Leads
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Active customer inquiries assigned to you (
                {user?.name || "Sales Rep"}). Update statuses and schedule
                follow-ups.
              </p>
            </div>
          </div>
        </section>

        {/* Assigned Leads Table */}
        <AssignedLeadsTable
          onSelectLead={(leadId) => router.push(`/dashboard/leads/${leadId}`)}
        />

        {/* Lead Follow-Up Timeline Drawer */}
        {selectedLeadId && (
          <LeadFollowUpTimelineDrawer
            leadId={selectedLeadId}
            onClose={() => setSelectedLeadId(null)}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
