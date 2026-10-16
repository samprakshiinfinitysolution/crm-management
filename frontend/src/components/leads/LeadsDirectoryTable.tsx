"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  CheckSquare,
  Square,
  MoreVertical,
  Pencil,
  Info,
  ArrowUpDown,
  Eye,
  RotateCcw,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Package,
} from "lucide-react";
import type { LeadItem } from "@/types/api.types";
import { TableSkeletonRows } from "../ui/TableSkeletonRows";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui";

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
  onTriggerSingleStatusChange?: (lead: LeadItem, e: React.MouseEvent) => void;
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
  limit = 10,
  onToggleSelectLead,
  onToggleSelectAll,
  onTriggerSingleRecall,
  onTriggerSingleReassign,
  onTriggerSingleStatusChange,
}: LeadsDirectoryTableProps) {
  const router = useRouter();

  const isAllSelected =
    selectedLeadIds.length === leads.length && leads.length > 0;

  const totalItems = pagination?.total || leads.length;
  const startItem = totalItems === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, totalItems);
  const totalPages =
    pagination?.totalPages || Math.ceil(totalItems / limit) || 1;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-sm border border-[#e0e0e0] dark:border-slate-800 shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300 border-collapse">
          {/* Marketplace Table Header matching Image 1 */}
          <thead className="bg-[#f4f6f8] dark:bg-slate-800/80 border-b border-[#e0e0e0] dark:border-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
            <tr>
              <th className="py-2.5 px-3 w-10 text-center border-r border-[#e0e0e0]/70 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onToggleSelectAll}
                  className="p-0.5 text-slate-400 hover:text-[#2874f0] dark:hover:text-blue-400 transition-colors cursor-pointer"
                  title={isAllSelected ? "Deselect all" : "Select all on page"}
                >
                  {isAllSelected ? (
                    <CheckSquare className="w-4 h-4 text-[#2874f0] dark:text-blue-400" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
              </th>

              <th className="py-2.5 px-3 font-semibold min-w-65">
                Product Details
              </th>

              <th className="py-2.5 px-3 font-semibold text-right whitespace-nowrap min-w-27.5">
                <div className="flex items-center justify-end gap-1">
                  <span>CompanyName</span>
                  <Info className="w-3 h-3 text-slate-400" />
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              <th className="py-2.5 px-3 font-semibold text-right whitespace-nowrap min-w-23.75">
                <div className="flex items-center justify-end gap-1">
                  <span>Requirement</span>
                  <Info className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              <th className="py-2.5 px-3 font-semibold text-right whitespace-nowrap min-w-23.75">
                <div className="flex items-center justify-end gap-1">
                  <span>Budget</span>
                  <Info className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              <th className="py-2.5 px-3 font-semibold text-center whitespace-nowrap min-w-21.25">
                <div className="flex items-center justify-center gap-1">
                  <span>Service</span>
                  <Info className="w-3 h-3 text-slate-400" />
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              <th className="py-2.5 px-3 font-semibold whitespace-nowrap min-w-32.5">
                Priority
              </th>

              <th className="py-2.5 px-3 font-semibold whitespace-nowrap min-w-30">
                <div className="flex items-center gap-1">
                  <span>Status</span>
                  <Info className="w-3 h-3 text-slate-400" />
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              <th className="py-2.5 px-3 font-semibold text-center whitespace-nowrap min-w-22.5">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#e0e0e0] dark:divide-slate-800 bg-white dark:bg-slate-900">
            {isLoading ? (
              <TableSkeletonRows columns={10} rows={limit} />
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                    <Package className="w-10 h-10 mb-2 stroke-1 text-slate-300 dark:text-slate-600" />
                    <p className="font-semibold text-slate-700 dark:text-slate-200 text-sm">
                      No listings found
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {search ||
                      statusFilter !== "ALL" ||
                      sourceFilter !== "ALL"
                        ? "Try adjusting your search criteria or filter tags"
                        : "No listings currently registered in your catalog"}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              leads.map((lead) => {
                const isSelected = selectedLeadIds.includes(lead.id);

                return (
                  <tr
                    key={lead.id}
                    className={`hover:bg-[#f7f9fd] dark:hover:bg-slate-800/60 transition-colors group ${
                      isSelected ? "bg-[#f2f7fe]/70 dark:bg-blue-950/40" : ""
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-2.5 px-3 w-10 text-center border-r border-[#e0e0e0]/70 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => onToggleSelectLead(lead.id)}
                        className="p-0.5 text-slate-400 hover:text-[#2874f0] dark:hover:text-blue-400 transition-colors cursor-pointer"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-[#2874f0] dark:text-blue-400" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>

                    {/* Product Details (Thumbnail + Blue Link + SKU ID) */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="flex flex-col min-w-0">
                          <button
                            type="button"
                            onClick={() =>
                              router.push(`/dashboard/leads/${lead.id}`)
                            }
                            className="font-medium text-[#2874f0] dark:text-blue-400 hover:underline text-xs text-left truncate cursor-pointer leading-snug"
                            title={lead.customerName || lead.requirement}
                          >
                            {lead.customerName}
                            {lead.companyName ? ` - ${lead.companyName}` : ""}
                          </button>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            SKU ID: {lead.leadCode}
                            {lead.mobile ? ` • ${lead.mobile}` : ""}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* CompanyName with pencil icon */}
                    <td className="py-2.5 px-3 text-right whitespace-nowrap font-medium text-slate-800 dark:text-slate-100">
                      <div className="inline-flex items-center gap-1 justify-end">
                        <span>{lead.companyName || "-"}</span>
                        <Pencil className="w-2.5 h-2.5 text-[#2874f0] cursor-pointer hover:opacity-80" />
                      </div>
                    </td>

                    {/* Requirement */}
                    <td className="py-2.5 px-3 text-right whitespace-nowrap text-slate-600 dark:text-slate-400 max-w-40 truncate">
                      <span>{lead.requirement || "-"}</span>
                    </td>

                    {/* Budget */}
                    <td className="py-2.5 px-3 text-right whitespace-nowrap text-slate-700 dark:text-slate-300 font-medium">
                      <span>
                        {typeof lead.budget === "number"
                          ? `₹${lead.budget.toLocaleString("en-IN")}`
                          : lead.budget || "-"}
                      </span>
                    </td>

                    {/* Service */}
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {lead.productService || "-"}
                      </span>
                    </td>

                    {/* Priority */}
                    <td className="py-2.5 px-3 whitespace-nowrap text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-xs font-semibold text-[10px] ${
                          lead.priority === "URGENT"
                            ? "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-900"
                            : lead.priority === "HIGH"
                              ? "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-900"
                              : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        {lead.priority || "MEDIUM"}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-3 whitespace-nowrap text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-xs font-semibold text-[10px] ${
                          lead.status === "WON_SOLD"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900"
                            : lead.status === "LOST"
                              ? "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-900"
                              : lead.status === "NEW"
                                ? "bg-blue-50 text-[#2874f0] dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900"
                                : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        {lead.status?.replace(/_/g, " ") || "NEW"}
                      </span>
                    </td>

                    {/* Action: Edit Listing & Dropdown */}
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="More actions"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="min-w-44 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-sm z-30"
                          >
                            <DropdownMenuGroup>
                              <DropdownMenuItem
                                onClick={() =>
                                  router.push(`/dashboard/leads/${lead.id}`)
                                }
                                className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-[#f2f7fe] dark:hover:bg-slate-800 hover:text-[#2874f0] cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5 text-slate-500" />
                                <span>View Listing Details</span>
                              </DropdownMenuItem>

                              {onTriggerSingleStatusChange && (
                                <DropdownMenuItem
                                  onClick={(e) =>
                                    onTriggerSingleStatusChange(lead, e)
                                  }
                                  className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-[#f2f7fe] dark:hover:bg-slate-800 hover:text-[#2874f0] cursor-pointer"
                                >
                                  <Pencil className="w-3.5 h-3.5 text-blue-500" />
                                  <span>Update Status</span>
                                </DropdownMenuItem>
                              )}

                              {isTL && onTriggerSingleReassign && (
                                <DropdownMenuItem
                                  onClick={(e) =>
                                    onTriggerSingleReassign(lead, e)
                                  }
                                  className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-[#f2f7fe] dark:hover:bg-slate-800 hover:text-[#2874f0] cursor-pointer"
                                >
                                  <UserCheck className="w-3.5 h-3.5 text-purple-500" />
                                  <span>Reassign Lead</span>
                                </DropdownMenuItem>
                              )}
                              {isTL && onTriggerSingleRecall && (
                                <DropdownMenuItem
                                  onClick={(e) =>
                                    onTriggerSingleRecall(lead, e)
                                  }
                                  className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                                >
                                  <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
                                  <span>Recall to Unassigned Pool</span>
                                </DropdownMenuItem>
                              )}
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

      {/* Flipkart Marketplace Style Bottom Pagination Bar matching Image 1 */}
      <div className="py-2.5 px-4 border-t border-[#e0e0e0] dark:border-slate-800 bg-[#fbfcfd] dark:bg-slate-900 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
        {/* Items per page selector */}
        <div className="flex items-center gap-2">
          <Select
            value={String(limit)}
            onValueChange={(val) => onPageSizeChange?.(Number(val))}
          >
            <SelectTrigger className="h-7 px-2 rounded-sm border border-[#e0e0e0] dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-[#2874f0]">
              <SelectValue placeholder={limit.toString()} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <span>Items per page</span>
        </div>

        {/* Middle count range: e.g. 1-10 of 85 items */}
        <div className="font-medium text-slate-700 dark:text-slate-300">
          <span>
            {startItem}-{endItem} of {totalItems} items
          </span>
        </div>

        {/* Page counter and arrows: e.g. 1 of 9 pages < 1 > */}
        <div className="flex items-center gap-3">
          <span>
            {page} of {totalPages} pages
          </span>
          <div className="inline-flex items-center gap-1">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="w-6 h-6 rounded-sm bg-[#2874f0] text-white font-bold text-xs flex items-center justify-center shadow-2xs">
              {page}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
