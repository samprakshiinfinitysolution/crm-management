"use client";

import React, { useState, useMemo } from "react";
import {
  ShieldCheck,
  RefreshCw,
  Filter,
  Eye,
  X,
  Copy,
  Check,
  Database,
} from "lucide-react";
import { useGetAuditLogsQuery, type AuditLogItem } from "@/store";
import { DataTable, type ColumnDef } from "@/components/ui/DataTable";
import { PageHeader, BreadcrumbItem } from "./PageHeader";
import { FilterToolbar } from "./FilterToolbar";
import { SearchInput } from "./SearchInput";
import { FilterSelect, FilterOption } from "./FilterSelect";
import { useDebounce } from "@/lib/useDebounce";
import { format } from "date-fns";

export interface AuditLogsViewProps {
  title?: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
}

const ACTION_OPTIONS: FilterOption[] = [
  { value: "ALL", label: "All Actions" },
  { value: "CREATE", label: "CREATE" },
  { value: "STATUS_CHANGE", label: "STATUS_CHANGE" },
  { value: "STATUS_UPDATE", label: "STATUS_UPDATE" },
  { value: "ASSIGN", label: "ASSIGN" },
  { value: "REASSIGN", label: "REASSIGN" },
  { value: "RECALL", label: "RECALL" },
  { value: "IMPORT_PREVIEW", label: "IMPORT_PREVIEW" },
  { value: "IMPORT_COMMIT", label: "IMPORT_COMMIT" },
  { value: "EXPORT", label: "EXPORT" },
  { value: "LOGIN", label: "LOGIN" },
  { value: "LOGOUT", label: "LOGOUT" },
  { value: "PASSWORD_CHANGE", label: "PASSWORD_CHANGE" },
  { value: "DELETE", label: "DELETE" },
];

const ENTITY_OPTIONS: FilterOption[] = [
  { value: "ALL", label: "All Entities" },
  { value: "Lead", label: "Lead" },
  { value: "FollowUp", label: "FollowUp" },
  { value: "User", label: "User" },
  { value: "ImportBatch", label: "ImportBatch" },
];

const getActionBadgeClass = (action: string) => {
  switch (action) {
    case "CREATE":
      return "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
    case "STATUS_CHANGE":
    case "STATUS_UPDATE":
      return "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800";
    case "ASSIGN":
      return "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800";
    case "REASSIGN":
      return "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800";
    case "RECALL":
      return "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800";
    case "DELETE":
      return "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800";
    case "EXPORT":
      return "bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800";
    case "IMPORT_PREVIEW":
    case "IMPORT_COMMIT":
      return "bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-800";
    case "LOGIN":
    case "LOGOUT":
      return "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700";
    case "PASSWORD_CHANGE":
      return "bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-800";
    default:
      return "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700";
  }
};

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({
  title = "Security & Audit Logs",
  description = "Immutable, server-authoritative audit trail of sensitive mutations, imports, exports, and status transitions.",
  breadcrumbs,
}) => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [entityFilter, setEntityFilter] = useState("ALL");
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);
  const [copied, setCopied] = useState(false);

  // Debounced search query
  const debouncedSearch = useDebounce(search, 400);

  // Applied query parameters
  const queryParams = useMemo(() => {
    return {
      page,
      limit,
      search: debouncedSearch.trim() || undefined,
      action: actionFilter !== "ALL" ? actionFilter : undefined,
      entityType: entityFilter !== "ALL" ? entityFilter : undefined,
    };
  }, [page, limit, debouncedSearch, actionFilter, entityFilter]);

  const {
    data: logsRes,
    isLoading,
    isFetching,
    refetch,
  } = useGetAuditLogsQuery(queryParams);

  const logs = logsRes?.data || [];
  const pagination = logsRes?.pagination;

  const handleCopyPayload = (data: unknown) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Define reusable Table columns
  const columns = useMemo<ColumnDef<AuditLogItem>[]>(
    () => [
      {
        id: "timestamp",
        header: "Timestamp",
        className: "whitespace-nowrap font-mono text-[11px] text-slate-500 dark:text-slate-400",
        cell: ({ row }) => {
          const createdAtDate = new Date(row.createdAt);
          return !isNaN(createdAtDate.getTime())
            ? format(createdAtDate, "dd MMM yyyy, HH:mm:ss")
            : "—";
        },
      },
      {
        id: "actor",
        header: "Actor",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {row.actor?.name || "System"}
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">
              {row.actor?.email || (row.actorUserId ? row.actorUserId : "Automated Job")}
            </span>
          </div>
        ),
      },
      {
        id: "action",
        header: "Action",
        cell: ({ row }) => (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${getActionBadgeClass(
              row.action
            )}`}
          >
            {row.action}
          </span>
        ),
      },
      {
        id: "entity",
        header: "Entity",
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {row.entityType}
            </span>
            {row.entityId && (
              <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.2 rounded">
                {row.entityId}
              </span>
            )}
          </div>
        ),
      },
      {
        id: "ipAddress",
        header: "IP Address",
        className: "font-mono text-[11px] text-slate-500 dark:text-slate-400",
        cell: ({ row }) => row.ipAddress || "Internal",
      },
      {
        id: "actions",
        header: "Details",
        align: "right",
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => setSelectedLog(row)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Inspect</span>
          </button>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      {/* Reusable Page Header */}
      <PageHeader
        title={title}
        description={description}
        icon={<ShieldCheck className="w-6 h-6" />}
        breadcrumbs={breadcrumbs}
        actions={
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${
                isFetching ? "animate-spin text-blue-600 dark:text-blue-400" : ""
              }`}
            />
            <span>Refresh</span>
          </button>
        }
      />

      {/* Reusable Filter Toolbar */}
      <FilterToolbar
        showReset={Boolean(search || actionFilter !== "ALL" || entityFilter !== "ALL")}
        onReset={() => {
          setSearch("");
          setActionFilter("ALL");
          setEntityFilter("ALL");
          setPage(1);
        }}
      >
        {/* Reusable Search Input */}
        <SearchInput
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Search by actor name, email, or entity ID..."
        />

        {/* Reusable Filter Select: Actions */}
        <FilterSelect
          value={actionFilter}
          onChange={(val) => {
            setActionFilter(val);
            setPage(1);
          }}
          options={ACTION_OPTIONS}
          icon={<Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
          placeholder="All Actions"
        />

        {/* Reusable Filter Select: Entities */}
        <FilterSelect
          value={entityFilter}
          onChange={(val) => {
            setEntityFilter(val);
            setPage(1);
          }}
          options={ENTITY_OPTIONS}
          icon={<Database className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
          placeholder="All Entities"
        />
      </FilterToolbar>

      {/* Shared Generic DataTable */}
      <DataTable
        columns={columns}
        data={logs}
        isLoading={isLoading}
        isFetching={isFetching}
        emptyTitle="No audit events match your filters"
        emptyDescription="Try adjusting the search query, action filter, or date range."
        emptyIcon={<ShieldCheck className="w-8 h-8 stroke-[1.5]" />}
        pagination={
          pagination && pagination.totalPages > 1
            ? {
                currentPage: page,
                totalPages: pagination.totalPages,
                onPageChange: setPage,
              }
            : undefined
        }
      />

      {/* JSON Payload Inspection Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Audit Entry Details
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200/80 dark:border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">
                    Action
                  </span>
                  <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                    {selectedLog.action}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">
                    Entity
                  </span>
                  <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                    {selectedLog.entityType}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">
                    Actor
                  </span>
                  <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                    {selectedLog.actor?.name || "System"}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">
                    Timestamp
                  </span>
                  <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 font-mono">
                    {format(new Date(selectedLog.createdAt), "HH:mm:ss")}
                  </p>
                </div>
              </div>

              {/* Old Value */}
              {selectedLog.oldValue && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Previous State (Old Value)
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyPayload(selectedLog.oldValue)}
                      className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {copied ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>{copied ? "Copied" : "Copy JSON"}</span>
                    </button>
                  </div>
                  <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg font-mono text-[11px] overflow-x-auto max-h-44">
                    {JSON.stringify(selectedLog.oldValue, null, 2)}
                  </pre>
                </div>
              )}

              {/* New Value */}
              {selectedLog.newValue && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Resulting State (New Value)
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyPayload(selectedLog.newValue)}
                      className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {copied ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>{copied ? "Copied" : "Copy JSON"}</span>
                    </button>
                  </div>
                  <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg font-mono text-[11px] overflow-x-auto max-h-44">
                    {JSON.stringify(selectedLog.newValue, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
