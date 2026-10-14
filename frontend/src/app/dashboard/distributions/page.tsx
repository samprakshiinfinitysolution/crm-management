"use client";

import React from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { UserRole } from "@/types/api.types";
import { DistributionsView } from "@/components/shared";

export default function DistributionsOverviewPage() {
  return (
    <ProtectedRoute allowedRoles={[UserRole.TEAM_LEADER, UserRole.ADMIN]}>
      <DistributionsView
        distributeHref="/dashboard/distributions/create"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Distributions" },
        ]}
      />
    </ProtectedRoute>
  );
}
