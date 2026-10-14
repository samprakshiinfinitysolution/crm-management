"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Building,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Layers,
  RotateCcw,
} from "lucide-react";
import { format } from "date-fns";
import { LeadItem } from "@/types/api.types";
import { Pagination } from "@/components/ui/Pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserLeadsTabProps {
  leads: LeadItem[];
}

export const UserLeadsTab: React.FC<UserLeadsTabProps> = ({ leads = [] }) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const formatCurrency = (val: number | string | null | undefined) => {
    if (val === null || val === undefined || val === "") return "—";
    const num = typeof val === "string" ? Number(val) : val;
    if (isNaN(num)) return "—";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Status Badge styling helper
  const getStatusBadge = (status: string) => {
    const map: Record<string, { bg: string; text: string; border: string }> = {
      NEW: {
        bg: "bg-blue-50 dark:bg-blue-950/50",
        text: "text-blue-700 dark:text-blue-300",
        border: "border-blue-200 dark:border-blue-800",
      },
      ASSIGNED: {
        bg: "bg-sky-50 dark:bg-sky-950/50",
        text: "text-sky-700 dark:text-sky-300",
        border: "border-sky-200 dark:border-sky-800",
      },
      CONTACTED: {
        bg: "bg-blue-50 dark:bg-blue-950/50",
        text: "text-blue-700 dark:text-blue-300",
        border: "border-blue-200 dark:border-blue-800",
      },
      IN_PROGRESS: {
        bg: "bg-amber-50 dark:bg-amber-950/50",
        text: "text-amber-700 dark:text-amber-300",
        border: "border-amber-200 dark:border-amber-800",
      },
      QUALIFIED: {
        bg: "bg-purple-50 dark:bg-purple-950/50",
        text: "text-purple-700 dark:text-purple-300",
        border: "border-purple-200 dark:border-purple-800",
      },
      WON: {
        bg: "bg-emerald-50 dark:bg-emerald-950/50",
        text: "text-emerald-700 dark:text-emerald-300",
        border: "border-emerald-200 dark:border-emerald-800",
      },
      LOST: {
        bg: "bg-rose-50 dark:bg-rose-950/50",
        text: "text-rose-700 dark:text-rose-300",
        border: "border-rose-200 dark:border-rose-800",
      },
    };

    const config = map[status] || {
      bg: "bg-slate-50 dark:bg-slate-800",
      text: "text-slate-700 dark:text-slate-300",
      border: "border-slate-200 dark:border-slate-700",
    };

    return (
      <span
        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${config.bg} ${config.text} ${config.border}`}
      >
        {status}
      </span>
    );
  };

  // Priority Badge styling helper
  const getPriorityBadge = (priority: string) => {
    const map: Record<string, { bg: string; text: string; border: string }> = {
      URGENT: {
        bg: "bg-rose-100 dark:bg-rose-950/70",
        text: "text-rose-700 dark:text-rose-300",
        border: "border-rose-300 dark:border-rose-800",
      },
      HIGH: {
        bg: "bg-amber-100 dark:bg-amber-950/70",
        text: "text-amber-700 dark:text-amber-300",
        border: "border-amber-300 dark:border-amber-800",
      },
      MEDIUM: {
        bg: "bg-blue-100 dark:bg-blue-950/70",
        text: "text-blue-700 dark:text-blue-300",
        border: "border-blue-300 dark:border-blue-800",
      },
      LOW: {
        bg: "bg-slate-100 dark:bg-slate-800",
        text: "text-slate-700 dark:text-slate-300",
        border: "border-slate-300 dark:border-slate-700",
      },
    };

    const config = map[priority] || {
      bg: "bg-slate-100 dark:bg-slate-800",
      text: "text-slate-700 dark:text-slate-300",
      border: "border-slate-200 dark:border-slate-700",
    };

    return (
      <span
        className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase ${config.bg} ${config.text} ${config.border}`}
      >
        {priority}
      </span>
    );
  };

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (statusFilter !== "ALL" && lead.status !== statusFilter) {
        return false;
      }
      if (priorityFilter !== "ALL" && lead.priority !== priorityFilter) {
        return false;
      }
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesName = lead.customerName?.toLowerCase().includes(query);
        const matchesCode = lead.leadCode?.toLowerCase().includes(query);
        const matchesCompany = lead.companyName?.toLowerCase().includes(query);
        const matchesMobile = lead.mobile?.includes(query);
        const matchesEmail = lead.email?.toLowerCase().includes(query);
        const matchesReq = lead.requirement?.toLowerCase().includes(query);

        if (
          !matchesName &&
          !matchesCode &&
          !matchesCompany &&
          !matchesMobile &&
          !matchesEmail &&
          !matchesReq
        ) {
          return false;
        }
      }
      return true;
    });
  }, [leads, search, statusFilter, priorityFilter]);

  // Paginated slice
  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLeads.slice(start, start + pageSize);
  }, [filteredLeads, currentPage, pageSize]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
      {/* Search & Filters Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search leads by customer, code, phone, company..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Select */}
          <Select
            value={statusFilter}
            onValueChange={(val) => {
              if (val) {
                setStatusFilter(val);
                setCurrentPage(1);
              }
            }}
          >
            <SelectTrigger className="h-8 text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="NEW">New</SelectItem>
              <SelectItem value="ASSIGNED">Assigned</SelectItem>
              <SelectItem value="CONTACTED">Contacted</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="QUALIFIED">Qualified</SelectItem>
              <SelectItem value="WON">Won</SelectItem>
              <SelectItem value="LOST">Lost</SelectItem>
            </SelectContent>
          </Select>

          {/* Priority Select */}
          <Select
            value={priorityFilter}
            onValueChange={(val) => {
              if (val) {
                setPriorityFilter(val);
                setCurrentPage(1);
              }
            }}
          >
            <SelectTrigger className="h-8 text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer">
              <SelectValue placeholder="All Priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Priorities</SelectItem>
              <SelectItem value="URGENT">Urgent</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
            </SelectContent>
          </Select>

          {(search.trim() || statusFilter !== "ALL" || priorityFilter !== "ALL") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("ALL");
                setPriorityFilter("ALL");
                setCurrentPage(1);
              }}
              className="h-8 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs shrink-0"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">Lead Code</th>
              <th className="py-3 px-4">Customer / Company</th>
              <th className="py-3 px-4">Contact</th>
              <th className="py-3 px-4">Requirement / Product</th>
              <th className="py-3 px-4">Budget</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Assigned At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {paginatedLeads.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  <Layers className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="font-medium text-slate-600 dark:text-slate-300">
                    No leads found matching your criteria.
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Try adjusting search query or filters.
                  </p>
                </td>
              </tr>
            ) : (
              paginatedLeads.map((lead) => (
                <tr
                  key={lead.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  {/* Lead Code */}
                  <td className="py-3 px-4 font-mono font-semibold text-blue-600 dark:text-blue-400">
                    <Link
                      href={`/admin/leads/${lead.id}`}
                      className="hover:underline inline-flex items-center gap-1"
                    >
                      {lead.leadCode}
                      <ExternalLink className="w-3 h-3 opacity-60" />
                    </Link>
                  </td>

                  {/* Customer / Company */}
                  <td className="py-3 px-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {lead.customerName}
                      </span>
                      {lead.companyName && (
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Building className="w-3 h-3 text-slate-400" />
                          {lead.companyName}
                        </span>
                      )}
                      {(lead.city || lead.state) && (
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-2.5 h-2.5" />
                          {[lead.city, lead.state].filter(Boolean).join(", ")}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="py-3 px-4">
                    <div className="flex flex-col gap-0.5 text-[11px]">
                      {lead.mobile && (
                        <a
                          href={`tel:${lead.mobile}`}
                          className="text-slate-700 dark:text-slate-300 hover:text-blue-600 flex items-center gap-1 font-mono"
                        >
                          <Phone className="w-3 h-3 text-slate-400" />
                          {lead.mobile}
                        </a>
                      )}
                      {lead.email && (
                        <a
                          href={`mailto:${lead.email}`}
                          className="text-slate-500 dark:text-slate-400 hover:text-blue-600 flex items-center gap-1 truncate max-w-[140px]"
                        >
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{lead.email}</span>
                        </a>
                      )}
                    </div>
                  </td>

                  {/* Requirement / Product */}
                  <td className="py-3 px-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {lead.requirement || "General Requirement"}
                      </span>
                      {lead.productService && (
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {lead.productService}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Budget */}
                  <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                    {formatCurrency(lead.budget)}
                  </td>

                  {/* Priority */}
                  <td className="py-3 px-4">
                    {getPriorityBadge(lead.priority || "MEDIUM")}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4">
                    {getStatusBadge(lead.status)}
                  </td>

                  {/* Assigned At */}
                  <td className="py-3 px-4 text-slate-500 dark:text-slate-400 text-[11px]">
                    {lead.assignedAt
                      ? format(new Date(lead.assignedAt), "dd MMM yyyy, p")
                      : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredLeads.length > pageSize && (
        <div className="mt-4 pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredLeads.length / pageSize)}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
};
