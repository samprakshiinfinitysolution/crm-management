"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Award,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Clock,
  Eye,
} from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";
import type { ExecutivePerformanceScorecard } from "@/types/api.types";

interface ExecutivePerformanceMatrixProps {
  executives?: ExecutivePerformanceScorecard[];
  isLoading?: boolean;
}

export const ExecutivePerformanceMatrix: React.FC<
  ExecutivePerformanceMatrixProps
> = ({ executives = [], isLoading = false }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const totalItems = executives.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedExecutives = executives.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize,
  );

  return (
    <div className="bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 rounded-sm shadow-2xs overflow-hidden flex flex-col justify-between">
      <div className="flex flex-col min-w-0">
        {/* Panel Header */}
        <div className="p-3.5 border-b border-[#e0e0e0] dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">
              Sales Executive Scorecard Matrix
            </h3>
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-xs bg-[#eaf4fe] text-[#2874f0] border border-blue-200">
              {totalItems} representatives
            </span>
          </div>
          <div className="w-7 h-7 rounded-xs bg-[#eaf4fe] flex items-center justify-center">
            <Award className="w-4 h-4 text-[#2874f0]" />
          </div>
        </div>

        {/* High Density Scorecard Table */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs min-w-[760px]">
            <thead className="border-b border-[#e0e0e0] dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80">
              <tr className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                <th className="py-2.5 px-3.5 text-left whitespace-nowrap min-w-[160px]">
                  Executive
                </th>
                <th className="py-2.5 px-3 text-center whitespace-nowrap min-w-[90px]">
                  Throughput
                </th>
                <th className="py-2.5 px-3 text-center whitespace-nowrap min-w-[90px]">
                  Active Load
                </th>
                <th className="py-2.5 px-3 text-center whitespace-nowrap min-w-[85px]">
                  Won Deals
                </th>
                <th className="py-2.5 px-3 text-center whitespace-nowrap min-w-[85px]">
                  Close Rate
                </th>
                <th className="py-2.5 px-3 text-center whitespace-nowrap min-w-[100px]">
                  Avg Response
                </th>
                <th className="py-2.5 px-3 text-right whitespace-nowrap min-w-[105px]">
                  Won Revenue
                </th>
                <th className="py-2.5 px-3 text-center whitespace-nowrap min-w-[120px]">
                  SLA Status
                </th>
                <th className="py-2.5 px-3.5 text-right whitespace-nowrap min-w-[90px]">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e0e0e0] dark:divide-slate-800 text-xs">
              {isLoading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={9} className="py-4 px-3.5">
                      <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded-sm w-full" />
                    </td>
                  </tr>
                ))
              ) : executives.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="py-12 text-center text-xs text-slate-400"
                  >
                    <AlertCircle className="w-6 h-6 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                    No executive records found for the selected time duration.
                  </td>
                </tr>
              ) : (
                paginatedExecutives.map((exec) => {
                  const totalAssigned =
                    exec.totalAssigned ??
                    exec.activeLeads + exec.wonLeads + exec.lostLeads;
                  const velocityRating =
                    exec.responseVelocityRating ?? "FAST";
                  const velocityColor =
                    velocityRating === "FAST"
                      ? "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800"
                      : velocityRating === "AVERAGE"
                        ? "text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800"
                        : "text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800";

                  return (
                    <tr
                      key={exec.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                    >
                      {/* Name & Email */}
                      <td className="py-2.5 px-3.5">
                        <div className="font-semibold text-slate-800 dark:text-slate-100 truncate max-w-[180px]">
                          {exec.name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono truncate max-w-[180px]">
                          {exec.email}
                        </div>
                      </td>

                      {/* Throughput Score */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs font-mono font-bold bg-[#eaf4fe] text-[#2874f0] border border-blue-200 text-xs">
                          <TrendingUp className="w-3 h-3 text-[#2874f0]" />
                          <span>{exec.throughputScore || 75}/100</span>
                        </div>
                      </td>

                      {/* Active Load */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-100">
                          {exec.activeLeads}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          / {totalAssigned} total
                        </span>
                      </td>

                      {/* Won Deals */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 font-mono font-bold text-emerald-600">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {exec.wonLeads}
                        </span>
                      </td>

                      {/* Close Rate % */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <span className="px-2 py-0.5 font-mono font-bold rounded-xs bg-[#eaf4fe] text-[#2874f0] border border-blue-200">
                          {exec.conversionRate}%
                        </span>
                      </td>

                      {/* Response Time & Velocity Rating */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <div className="flex flex-col items-center">
                          <span className="font-mono font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {exec.avgResponseHours}h
                          </span>
                          <span
                            className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-xs border mt-0.5 ${velocityColor}`}
                          >
                            {velocityRating}
                          </span>
                        </div>
                      </td>

                      {/* Won Revenue */}
                      <td className="py-2.5 px-3 text-right whitespace-nowrap font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        ₹{Number(exec.wonRevenue || 0).toLocaleString("en-IN")}
                      </td>

                      {/* SLA Status */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        {exec.slaBreaches > 0 ? (
                          <span className="inline-flex items-center gap-1 text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-[10px] px-2 py-0.5 rounded-xs font-bold">
                            <AlertCircle className="w-3 h-3" />
                            {exec.slaBreaches} Breaches
                          </span>
                        ) : (
                          <span className="text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-[10px] px-2 py-0.5 rounded-xs font-bold">
                            Compliant ({exec.slaComplianceRate ?? 100}%)
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-2.5 px-3.5 text-right whitespace-nowrap">
                        <Link
                          href={`/dashboard/reports/performance/${exec.id}`}
                          className="h-7 px-2.5 rounded-xs bg-white dark:bg-slate-800 hover:bg-slate-50 text-[#2874f0] border border-[#e0e0e0] text-xs font-semibold inline-flex items-center gap-1 transition-colors shadow-2xs"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!isLoading && totalItems > 0 && (
        <div className="p-3 border-t border-[#e0e0e0] dark:border-slate-800">
          <Pagination
            currentPage={safeCurrentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
          />
        </div>
      )}
    </div>
  );
};
