"use client";

import React, { useState } from "react";
import {
  Award,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Clock,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Pagination } from "@/components/ui/Pagination";
import type {
  ExecutivePerformanceScorecard,
} from "@/types/api.types";

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
    <Card className="p-3.5 sm:p-4.5 rounded-xl bg-card dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs h-full flex flex-col justify-between overflow-hidden">
      <div className="flex flex-col min-w-0">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
              Sales Executive Scorecard Matrix
            </h3>
            <p className="text-xs text-slate-700 dark:text-slate-200 font-medium">
              Staff throughput, conversion efficiency, response velocity, and
              SLA adherence
            </p>
          </div>
          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-800/60 text-blue-600 dark:text-blue-400 shrink-0">
            <Award className="w-4 h-4" />
          </div>
        </div>

        <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
          <table className="w-full text-left border-collapse min-w-[760px]">
            <thead className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <tr className="text-[11px] font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                <th className="py-3 px-3 pl-3 text-left whitespace-nowrap min-w-[170px]">
                  Executive
                </th>
                <th className="py-3 px-3 text-center whitespace-nowrap min-w-[100px]">
                  Throughput
                </th>
                <th className="py-3 px-3 text-center whitespace-nowrap min-w-[95px]">
                  Active Load
                </th>
                <th className="py-3 px-3 text-center whitespace-nowrap min-w-[90px]">
                  Won Deals
                </th>
                <th className="py-3 px-3 text-center whitespace-nowrap min-w-[90px]">
                  Close Rate
                </th>
                <th className="py-3 px-3 text-center whitespace-nowrap min-w-[110px]">
                  Avg Response
                </th>
                <th className="py-3 px-3 text-center whitespace-nowrap min-w-[105px]">
                  Won Revenue
                </th>
                <th className="py-3 px-3 pr-3 text-center whitespace-nowrap min-w-[130px]">
                  SLA Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {isLoading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={8} className="py-4 px-3">
                      <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded-lg w-full" />
                    </td>
                  </tr>
                ))
              ) : executives.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-8 text-center text-xs text-slate-500 dark:text-slate-400"
                  >
                    No executive records match the filter criteria.
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
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Name & Email */}
                      <td className="py-3.5 px-3 pl-3">
                        <div className="font-semibold text-slate-900 dark:text-white truncate max-w-[160px]">
                          {exec.name}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[160px]">
                          {exec.email}
                        </div>
                      </td>

                      {/* Throughput Score */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs">
                          <TrendingUp className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                          <span>{exec.throughputScore || 75}/100</span>
                        </div>
                      </td>

                      {/* Active Load */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {exec.activeLeads}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          / {totalAssigned} total
                        </span>
                      </td>

                      {/* Won Deals */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {exec.wonLeads}
                        </span>
                      </td>

                      {/* Close Rate % */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <span className="px-2 py-0.5 font-bold rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/60">
                          {exec.conversionRate}%
                        </span>
                      </td>

                      {/* Response Time & Velocity Rating */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <div className="flex flex-col items-center">
                          <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {exec.avgResponseHours}h
                          </span>
                          <span
                            className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border mt-0.5 ${velocityColor}`}
                          >
                            {velocityRating}
                          </span>
                        </div>
                      </td>

                      {/* Won Revenue */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <span className="font-bold text-slate-900 dark:text-white">
                          ₹{Number(exec.wonRevenue || 0).toLocaleString("en-IN")}
                        </span>
                      </td>

                      {/* SLA Status */}
                      <td className="py-3.5 px-3 pr-3 text-center whitespace-nowrap">
                        {exec.slaBreaches > 0 ? (
                          <span className="inline-flex items-center gap-1 text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 px-2 py-0.5 rounded-full font-medium">
                            <AlertCircle className="w-3 h-3" />{" "}
                            {exec.slaBreaches} Breaches
                          </span>
                        ) : (
                          <span className="text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded-full font-medium">
                            Compliant ({exec.slaComplianceRate ?? 100}%)
                          </span>
                        )}
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
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
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
            className="bg-transparent dark:bg-transparent border-0 px-0 py-0 text-slate-600 dark:text-slate-300"
          />
        </div>
      )}
    </Card>
  );
};
