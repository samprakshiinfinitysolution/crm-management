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
    <div className="p-6 rounded-lg bg-card/3 border border-white/10 space-y-5">
      {/* Top Bar: Search, Filter Tabs & Ingest CTA */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-card/5 rounded-lg border border-crm-brand/70 overflow-x-auto">
          <button
            type="button"
            onClick={() => {
              setFilterTab("ALL");
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filterTab === "ALL"
                ? "bg-blue-600 text-card shadow-md"
                : "text-crm-brand hover:text-crm-brand/40 hover:bg-card/5"
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
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filterTab === "VALID"
                ? "bg-emerald-600 text-card shadow-md"
                : "text-crm-brand hover:text-crm-brand/40 hover:bg-card/5"
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
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filterTab === "DUPLICATE"
                ? "bg-amber-600 text-card shadow-md"
                : "text-crm-brand hover:text-crm-brand/40 hover:bg-card/5"
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
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filterTab === "INVALID"
                ? "bg-rose-600 text-card shadow-md"
                : "text-crm-brand hover:text-crm-brand/40 hover:bg-card/5"
            }`}
          >
            Errors ({rows.filter((r) => r.status === "INVALID").length})
          </button>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-crm-brand absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-8 pr-3 py-1.5 bg-card/5 border border-crm-brand/10 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-crm-brand w-44 sm:w-56"
            />
          </div>

          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setCurrentPage(1);
              }}
              className="h-8 px-2 rounded-lg bg-card/10 hover:bg-card/20 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer shadow-2xs shrink-0"
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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50"
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
        <table className="w-full text-left border-collapse ">
          <thead className="border-b border-crm-brand-subtle">
            <tr className="border-b border-crm-brand-subtle text-[11px] font-semibold uppercase tracking-wider text-accent-foreground/60">
              <th className="pb-3 pl-2">#</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Customer Name</th>
              <th className="pb-3">Mobile</th>
              <th className="pb-3">Email</th>
              <th className="pb-3">City</th>
              <th className="pb-3">Requirement</th>
              <th className="pb-3">Budget</th>
              <th className="pb-3 pr-2">Source</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm">
            {paginatedRows.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="py-12 text-center text-xs text-slate-500"
                >
                  No records match your filter criteria.
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
                    className="hover:bg-card/2 transition-colors"
                  >
                    <td className="py-3.5 pl-2 text-xs font-mono text-slate-500">
                      {globalIndex}
                    </td>
                    <td className="py-3.5">
                      {row.status === "VALID" && (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
                          <CheckCircle2 className="w-3 h-3" /> Valid
                        </span>
                      )}
                      {row.status === "DUPLICATE" && (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full font-medium">
                          <AlertTriangle className="w-3 h-3" /> Duplicate
                        </span>
                      )}
                      {row.status === "INVALID" && (
                        <span
                          className="inline-flex items-center gap-1 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full font-medium"
                          title={row.validationNote}
                        >
                          <AlertCircle className="w-3 h-3" /> Incomplete
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 font-medium text-slate-900 dark:text-accent-foreground dark:text-accent-foreground dark:text-white">
                      {row.customerName}
                    </td>
                    <td className="py-3.5 font-mono text-xs text-muted-foreground/70">
                      {row.mobile}
                    </td>
                    <td className="py-3.5 text-xs text-muted-foreground">
                      {row.email || "—"}
                    </td>
                    <td className="py-3.5 text-xs text-muted-foreground">
                      {row.city || "—"}
                    </td>
                    <td className="py-3.5 text-xs text-muted-foreground max-w-37.5 truncate">
                      {row.requirement || "—"}
                    </td>
                    <td className="py-3.5 text-xs text-crm-muted">
                      {row.budget || "—"}
                    </td>
                    <td className="py-3.5 pr-2">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
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
        <div className="flex items-center justify-between pt-4 border-t border-crm-brand-subtle text-xs text-slate-400">
          <div>
            Showing {(currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, filteredRows.length)} of{" "}
            {filteredRows.length} records
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg bg-card/5 hover:bg-card/10 border border-white/10 disabled:opacity-30 transition-all text-slate-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg bg-card/5 hover:bg-card/10 border border-white/10 disabled:opacity-30 transition-all text-slate-300"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
