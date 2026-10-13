"use client";

import React, { useState } from "react";
import { Search, Phone, Calendar, Building } from "lucide-react";
import { useGetLeadsQuery } from "@/store/api/leadApi";
import type { LeadItem, LeadStatus } from "@/types/api.types";
import ScheduleFollowUpModal from "./ScheduleFollowUpModal";
import { TableSkeletonRows } from "../ui/TableSkeletonRows";
import { useDebounce } from "@/lib/useDebounce";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui";

interface AssignedLeadsTableProps {
  onSelectLead?: (leadId: string) => void;
}

const options = [
  { value: "ALL", label: "All Statuses" },
  { value: "NEW", label: "New" },
  { value: "ASSIGNED", label: "Assigned" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "INTERESTED", label: "Interested" },
  { value: "FOLLOW_UP", label: "Follow-Up" },
  { value: "QUALIFIED", label: "Qualified" },
  { value: "WON_SOLD", label: "Won / Sold" },
  { value: "LOST", label: "Lost" },
];

export default function AssignedLeadsTable({
  onSelectLead,
}: AssignedLeadsTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  // Debounce search input by 400ms to avoid flooding backend requests
  const debouncedSearch = useDebounce(search, 400);

  const { data, isLoading } = useGetLeadsQuery({
    search: debouncedSearch.trim() || undefined,
    status: statusFilter !== "ALL" ? statusFilter : undefined,
    page,
    limit: 10,
  });

  const leads = data?.data || [];
  const pagination = data?.pagination;

  const [schedulingLead, setSchedulingLead] = useState<LeadItem | null>(null);

  return (
    <div className="bg-crm-card border border-crm-subtle rounded-lg p-5 shadow-xs">
      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-bold text-crm-primary flex items-center gap-2">
            <span>My Assigned Leads Pool</span>
            <span className="text-xs font-normal text-crm-muted">
              ({pagination?.total ?? leads.length} active leads)
            </span>
          </h3>
          <p className="text-[11px] text-crm-muted">
            Strictly scoped to your assigned portfolio. Pick any lead to
            schedule a follow-up.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-crm-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search name, phone, code..."
              className="w-full bg-card border border-crm-subtle rounded-lg pl-8 pr-3 py-1.5 text-xs text-crm-primary placeholder:text-crm-muted focus:outline-none focus:border-crm-brand shadow-2xs"
            />
          </div>

          {/* Status Filter */}
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value as LeadStatus);
              setPage(1);
            }}
          >
            <SelectTrigger className="bg-card border border-crm-subtle rounded-lg px-2.5 py-1.5 text-xs text-crm-secondary focus:outline-none focus:border-crm-brand shadow-2xs cursor-pointer">
              <SelectValue placeholder={"Select Status"} />
            </SelectTrigger>
            <SelectContent className="bg-card border border-crm-subtle rounded-lg px-0.5 py-1.5 text-xs text-crm-secondary shadow-2xs cursor-pointer">
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value} className="bg-card px-2.5 py-1.5 text-xs text-crm-secondary hover:bg-crm-brand-subtle! cursor-pointer">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="overflow-x-auto rounded-lg border border-crm-subtle">
        <table className="w-full text-left text-xs text-crm-secondary">
          <thead className="bg-crm-subtle text-[11px] uppercase tracking-wider text-crm-muted border-b border-crm-subtle font-bold">
            <tr>
              <th className="px-4 py-3">Lead Code</th>
              <th className="px-4 py-3">Customer Details</th>
              <th className="px-4 py-3">Requirement</th>
              <th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-crm-subtle font-normal">
            {isLoading ? (
              <TableSkeletonRows columns={6} />
            ) : leads.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-crm-muted"
                >
                  No assigned leads match the current search or filters.
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr
                  key={lead.id}
                  className="hover:bg-crm-subtle/50 transition-colors cursor-pointer"
                  onClick={() => onSelectLead?.(lead.id)}
                >
                  <td className="px-4 py-3 font-mono font-bold text-crm-primary">
                    {lead.leadCode}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-crm-primary">
                      {lead.customerName}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-crm-muted mt-0.5">
                      <a
                        href={`tel:${lead.mobile}`}
                        onClick={(e) => e.stopPropagation()}
                        className="hover:text-emerald-600 flex items-center gap-1 font-medium text-crm-secondary transition-colors"
                      >
                        <Phone className="w-3 h-3 text-emerald-600" />
                        {lead.mobile}
                      </a>
                      {lead.companyName && (
                        <span className="flex items-center gap-1 text-crm-muted">
                          <Building className="w-3 h-3 text-crm-muted" />
                          {lead.companyName}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 max-w-50 truncate text-crm-secondary">
                    {lead.requirement || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase border text-accent-foreground/60"
                          "
                      }`}
                    >
                      {lead.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3 ">
                    <span
                      className={`text-[10px] flex flex-wrap text-center font-semibold px-2 py-0.5`}
                    >
                      {lead.status.replace("_", " ")}
                    </span>
                  </td>
                  <td
                    className="px-4 py-3 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => setSchedulingLead(lead)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 hover:text-blue-900 text-[11px] font-semibold transition-all cursor-pointer shadow-2xs"
                    >
                      <Calendar className="w-3 h-3 text-blue-600" />
                      <span>Follow-Up</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-3 text-xs text-crm-muted">
          <div>
            Page {pagination.page} of {pagination.totalPages}
          </div>
          <div className="flex gap-1.5">
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1 rounded-lg bg-crm-subtle border border-crm-subtle disabled:opacity-40 hover:bg-crm-muted text-crm-primary font-medium cursor-pointer transition-colors"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-2.5 py-1 rounded-lg bg-crm-subtle border border-crm-subtle disabled:opacity-40 hover:bg-crm-muted text-crm-primary font-medium cursor-pointer transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Schedule Follow-Up Modal */}
      {schedulingLead && (
        <ScheduleFollowUpModal
          leadId={schedulingLead.id}
          leadCode={schedulingLead.leadCode}
          customerName={schedulingLead.customerName}
          open={!!schedulingLead}
          onClose={() => setSchedulingLead(null)}
        />
      )}
    </div>
  );
}
