"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Layers,
  RotateCcw,
} from "lucide-react";
import { useDebounce } from "@/lib/useDebounce";
import { StagedLeadRow } from "./SheetUploadZone";

interface SheetPreviewTableProps {
  rows: StagedLeadRow[];
  onCommit: () => void;
  isCommitting?: boolean;
}

export const SheetPreviewTable: React.FC<SheetPreviewTableProps> = ({
  rows,
  onCommit,
  isCommitting = false,
}) => {
  const [filterTab, setFilterTab] = useState<
    "ALL" | "VALID" | "DUPLICATE" | "INVALID"
  >("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const matchesTab = filterTab === "ALL" || row.status === filterTab;
      const q = debouncedSearchTerm.toLowerCase();
      const matchesSearch =
        !debouncedSearchTerm ||
        row.customerName.toLowerCase().includes(q) ||
        row.mobile.includes(q) ||
        (row.email && row.email.toLowerCase().includes(q)) ||
        (row.city && row.city.toLowerCase().includes(q)) ||
        (row.requirement && row.requirement.toLowerCase().includes(q));

      return matchesTab && matchesSearch;
    });
  }, [rows, filterTab, debouncedSearchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const paginatedRows = filteredRows.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const validCount = rows.filter((r) => r.status === "VALID").length;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-sm border border-[#e0e0e0] dark:border-slate-800 shadow-2xs overflow-hidden">
      {/* Top Bar: Search, Filter Tabs & Ingest CTA */}
      <div className="p-3 sm:p-3.5 border-b border-[#e0e0e0] dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/20">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-sm border border-[#e0e0e0] dark:border-slate-700 overflow-x-auto">
          <button
            type="button"
            onClick={() => {
              setFilterTab("ALL");
              setCurrentPage(1);
            }}
            className={`h-7 px-2.5 rounded-xs text-xs font-bold transition-all cursor-pointer ${
              filterTab === "ALL"
                ? "bg-[#2874f0] text-white shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-700"
            }`}
          >
            All Rows ({rows.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setFilterTab("VALID");
              setCurrentPage(1);
            }}
            className={`h-7 px-2.5 rounded-xs text-xs font-bold transition-all cursor-pointer ${
              filterTab === "VALID"
                ? "bg-emerald-600 text-white shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-700"
            }`}
          >
            Valid ({rows.filter((r) => r.status === "VALID").length})
          </button>
          <button
            type="button"
            onClick={() => {
              setFilterTab("DUPLICATE");
              setCurrentPage(1);
            }}
            className={`h-7 px-2.5 rounded-xs text-xs font-bold transition-all cursor-pointer ${
              filterTab === "DUPLICATE"
                ? "bg-amber-600 text-white shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-700"
            }`}
          >
            Duplicates ({rows.filter((r) => r.status === "DUPLICATE").length})
          </button>
          <button
            type="button"
            onClick={() => {
              setFilterTab("INVALID");
              setCurrentPage(1);
            }}
            className={`h-7 px-2.5 rounded-xs text-xs font-bold transition-all cursor-pointer ${
              filterTab === "INVALID"
                ? "bg-rose-600 text-white shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-700"
            }`}
          >
            Errors ({rows.filter((r) => r.status === "INVALID").length})
          </button>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search staged rows..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="h-8 pl-8 pr-3 bg-white dark:bg-slate-800 border border-[#e0e0e0] dark:border-slate-700 rounded-sm text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#2874f0] focus:ring-1 focus:ring-[#2874f0] w-48 sm:w-60 transition-colors"
            />
          </div>

          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setCurrentPage(1);
              }}
              className="h-8 px-2 rounded-sm bg-white dark:bg-slate-800 border border-[#e0e0e0] dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs shrink-0"
              title="Reset search"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Reset</span>
            </button>
          )}

          <button
            type="button"
            onClick={onCommit}
            disabled={validCount === 0 || isCommitting}
            className="h-8 px-4 rounded-sm bg-[#2874f0] hover:bg-[#1a5bb8] active:bg-[#154b98] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>
              {isCommitting ? "Ingesting..." : `Ingest ${validCount} Leads`}
            </span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-[#e0e0e0] dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            <tr>
              <th className="py-2.5 px-3">#</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3">Customer Name</th>
              <th className="py-2.5 px-3">Mobile Number</th>
              <th className="py-2.5 px-3">Email Address</th>
              <th className="py-2.5 px-3">City</th>
              <th className="py-2.5 px-3">Requirement</th>
              <th className="py-2.5 px-3">Budget</th>
              <th className="py-2.5 px-3 text-right">Source</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e0e0e0]/70 dark:divide-slate-800/70">
            {paginatedRows.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="py-12 text-center text-xs text-slate-500 dark:text-slate-400"
                >
                  No records match the active filter or search criteria.
                </td>
              </tr>
            ) : (
              paginatedRows.map((row, idx) => {
                const globalIndex = (currentPage - 1) * pageSize + idx + 1;
                return (
                  <tr
                    key={
                      row.id ||
                      (row.rowNumber ? String(row.rowNumber) : String(idx))
                    }
                    className="hover:bg-blue-50/20 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                      {globalIndex}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {row.status === "VALID" && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-xs">
                          <CheckCircle2 className="w-3 h-3" /> Valid
                        </span>
                      )}
                      {row.status === "DUPLICATE" && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-xs">
                          <AlertTriangle className="w-3 h-3" /> Duplicate
                        </span>
                      )}
                      {row.status === "INVALID" && (
                        <span
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 px-2 py-0.5 rounded-xs"
                          title={row.validationNote}
                        >
                          <AlertCircle className="w-3 h-3" /> Incomplete
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-100">
                      {row.customerName}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {row.mobile}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                      {row.email || "—"}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                      {row.city || "—"}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 max-w-48 truncate" title={row.requirement}>
                      {row.requirement || "—"}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-700 dark:text-slate-300">
                      {row.budget || "—"}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-xs bg-[#eaf4fe] dark:bg-blue-950/40 text-[#2874f0] border border-blue-200 dark:border-blue-900 uppercase">
                        {row.source || row.leadSource || "EXCEL"}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {filteredRows.length > 0 && (
        <div className="p-3 sm:p-3.5 border-t border-[#e0e0e0] dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 bg-slate-50/40 dark:bg-slate-800/20">
          <div>
            Showing <strong className="font-semibold text-slate-800 dark:text-slate-200">{(currentPage - 1) * pageSize + 1}</strong> to{" "}
            <strong className="font-semibold text-slate-800 dark:text-slate-200">{Math.min(currentPage * pageSize, filteredRows.length)}</strong> of{" "}
            <strong className="font-semibold text-slate-800 dark:text-slate-200">{filteredRows.length}</strong> records
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="h-7 px-2 rounded-sm bg-white dark:bg-slate-800 border border-[#e0e0e0] dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-30 transition-colors text-slate-700 dark:text-slate-300 flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed shadow-2xs"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>
            <span className="text-xs px-1">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="h-7 px-2 rounded-sm bg-white dark:bg-slate-800 border border-[#e0e0e0] dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-30 transition-colors text-slate-700 dark:text-slate-300 flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed shadow-2xs"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
