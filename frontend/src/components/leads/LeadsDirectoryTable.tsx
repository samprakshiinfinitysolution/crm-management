"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Eye,
  Building,
  Phone,
  RotateCcw,
  UserCheck,
  CheckSquare,
  Square,
  MoreVertical,
} from "lucide-react";
import type { LeadItem } from "@/types/api.types";
import { Pagination } from "@/components/ui/Pagination";
import { TableSkeletonRows } from "../ui/TableSkeletonRows";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { LeadStatusBadge, LeadPriorityBadge } from "./LeadBadges";

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface LeadsDirectoryTableProps {
  leads: LeadItem[];
  isLoading: boolean;
  selectedLeadIds: string[];
  isTL: boolean;
  search: string;
  statusFilter: string;
  sourceFilter: string;
  pagination?: PaginationInfo;
  page: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  limit?: number;
  onToggleSelectLead: (id: string) => void;
  onToggleSelectAll: () => void;
  onTriggerSingleRecall?: (lead: LeadItem, e: React.MouseEvent) => void;
  onTriggerSingleReassign?: (lead: LeadItem, e: React.MouseEvent) => void;
}

export function LeadsDirectoryTable({
  leads,
  isLoading,
  selectedLeadIds,
  isTL,
  search,
  statusFilter,
  sourceFilter,
  pagination,
  page,
  onPageChange,
  onPageSizeChange,
  limit,
  onToggleSelectLead,
  onToggleSelectAll,
  onTriggerSingleRecall,
  onTriggerSingleReassign,
}: LeadsDirectoryTableProps) {
  const router = useRouter();

  const isAllSelected =
    selectedLeadIds.length === leads.length && leads.length > 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
          <thead className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4 w-10 text-center">
                <button
                  type="button"
                  onClick={onToggleSelectAll}
                  className="p-1 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                  title={isAllSelected ? "Deselect all" : "Select all on page"}
                >
                  {isAllSelected ? (
                    <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
              </th>
              <th className="py-3 px-4">Lead Code</th>
              <th className="py-3 px-4">Customer Details</th>
              <th className="py-3 px-4">Requirement</th>
              <th className="py-3 px-4">Source</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Assigned To</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {isLoading ? (
              <TableSkeletonRows />
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-slate-400 dark:text-slate-500">
                    <Users className="w-8 h-8 stroke-[1.5]" />
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                      No leads found
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {search ||
                      statusFilter !== "ALL" ||
                      sourceFilter !== "ALL"
                        ? "Try adjusting your search criteria or filter tags"
                        : "No leads currently registered in the database"}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              leads.map((lead) => {
                const isSelected = selectedLeadIds.includes(lead.id);
                const isAssigned = Boolean(
                  lead.assignedTo || lead.status !== "NEW",
                );

                return (
                  <tr
                    key={lead.id}
                    onClick={() => router.push(`/dashboard/leads/${lead.id}`)}
                    className={`hover:bg-blue-50/40 dark:hover:bg-slate-800/60 cursor-pointer transition-colors ${
                      isSelected ? "bg-blue-50/50 dark:bg-blue-950/40" : ""
                    }`}
                  >
                    <td
                      className="py-3 px-4 w-10 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => onToggleSelectLead(lead.id)}
                        className="p-1 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-blue-600 dark:text-blue-400">
                      {lead.leadCode}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {lead.customerName}
                        </span>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                            {lead.mobile}
                          </span>
                          {lead.companyName && (
                            <span className="flex items-center gap-1 truncate max-w-32">
                              <Building className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                              {lead.companyName}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <p
                        className="truncate font-medium text-slate-800 dark:text-slate-200"
                        title={lead.requirement}
                      >
                        {lead.requirement}
                      </p>
                      {lead.budget && (
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                          ₹{Number(lead.budget).toLocaleString("en-IN")}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-semibold border border-slate-200/60 dark:border-slate-700">
                        {lead.leadSource}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <LeadPriorityBadge priority={lead.priority} />
                    </td>
                    <td className="py-3 px-4">
                      <LeadStatusBadge status={lead.status} />
                    </td>
                    <td className="py-3 px-4">
                      {lead.assignedTo ? (
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {lead.assignedTo.name}
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-28">
                            {lead.assignedTo.email}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500 italic">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td
                      className="py-3 px-4 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer"
                            title="Lead actions"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="min-w-40 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg rounded-lg"
                          >
                            <DropdownMenuGroup>
                              {isTL && onTriggerSingleReassign && (
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onTriggerSingleReassign(lead, e);
                                  }}
                                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 rounded-md cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 dark:hover:text-blue-400 focus:bg-blue-50 dark:focus:bg-blue-950/50 focus:text-blue-600 dark:focus:text-blue-400 transition-colors"
                                >
                                  <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                  <span>
                                    {isAssigned
                                      ? "Reassign Lead"
                                      : "Assign Lead"}
                                  </span>
                                </DropdownMenuItem>
                              )}

                              {isTL && isAssigned && onTriggerSingleRecall && (
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onTriggerSingleRecall(lead, e);
                                  }}
                                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 rounded-md cursor-pointer hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:text-rose-700 dark:hover:text-rose-300 focus:bg-rose-50 dark:focus:bg-rose-950/50 focus:text-rose-700 dark:focus:text-rose-300 transition-colors"
                                >
                                  <RotateCcw className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                                  <span>Recall to Pool</span>
                                </DropdownMenuItem>
                              )}

                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/dashboard/leads/${lead.id}`);
                                }}
                                className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 rounded-md cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 focus:bg-slate-100 dark:focus:bg-slate-800 focus:text-slate-900 dark:focus:text-slate-100 transition-colors"
                              >
                                <Eye className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                <span>View Details</span>
                              </DropdownMenuItem>
                            </DropdownMenuGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {pagination && pagination.totalPages > 1 && (
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Showing page {pagination.page} of {pagination.totalPages} (
            {pagination.total} total leads)
          </span>
          <Pagination
            currentPage={page}
            totalPages={pagination.totalPages}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            pageSize={limit}
            pageSizeOptions={[10, 20, 50, 100]}
          />
        </div>
      )}
    </div>
  );
}
