"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Briefcase } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { UserRole } from "@/types/api.types";
import { useAppSelector } from "@/store";
import AssignedLeadsTable from "@/components/sales_executive/AssignedLeadsTable";
import LeadFollowUpTimelineDrawer from "@/components/sales_executive/LeadFollowUpTimelineDrawer";
import { PageHeader } from "@/components/shared/PageHeader";

export default function MyLeadsPage() {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  return (
    <ProtectedRoute allowedRoles={[UserRole.SALES_EXECUTIVE]}>
      <div className="flex flex-col gap-3.5">
        {/* Page Header */}
        <PageHeader
          title="My Assigned Leads"
          description={`Active customer inquiries assigned to you (${
            user?.name || "Sales Rep"
          }). Update statuses and schedule follow-ups.`}
          icon={<Briefcase className="w-6 h-6" />}
        />

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
