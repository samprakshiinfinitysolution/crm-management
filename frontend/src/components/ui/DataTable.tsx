"use client";

import React from "react";
import { AlertCircle, RotateCw, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Pagination, type PaginationProps } from "./Pagination";
import { getApiErrorMessage } from "@/lib/errorHandler";

export interface ColumnDef<T> {
  id?: string;
  header: React.ReactNode | ((props: { data: T[] }) => React.ReactNode);
  accessorKey?: keyof T;
  cell?: (props: { row: T; index: number; value: unknown }) => React.ReactNode;
  headerClassName?: string;
  className?: string;
  align?: "left" | "center" | "right";
  width?: string;
  minWidth?: string;
}

export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  isLoading?: boolean;
  isFetching?: boolean;
  isError?: boolean;
  error?: unknown;
  errorMessage?: string;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: React.ReactNode;
  emptyAction?: React.ReactNode;
  skeletonRowCount?: number;
  onRowClick?: (row: T, index: number) => void;
  rowKey?: keyof T | ((row: T, index: number) => string | number);
  rowClassName?: string | ((row: T, index: number) => string);
  className?: string;
  tableClassName?: string;
  pagination?: PaginationProps;
}

/**
 * Shimmering skeleton rows for table loading state.
 */
export function TableSkeleton<T>({
  columns,
  rowCount = 6,
}: {
  columns: ColumnDef<T>[];
  rowCount?: number;
}) {
  // Pre-configured width variations for an organic skeleton appearance
  const skeletonWidths = ["w-3/4", "w-1/2", "w-5/6", "w-2/3", "w-4/5"];

  return (
    <>
      {Array.from({ length: rowCount }, (_, rowIndex) => (
        <tr
          key={`skeleton-row-${rowIndex}`}
          className="border-b border-slate-100 dark:border-slate-800/80 animate-pulse"
        >
          {columns.map((col, colIndex) => {
            const widthClass =
              skeletonWidths[(rowIndex + colIndex) % skeletonWidths.length];

            return (
              <td
                key={`skeleton-col-${col.id || colIndex}`}
                style={{ width: col.width, minWidth: col.minWidth }}
                className={cn("py-3.5 px-4", col.className)}
              >
                <div
                  className={cn(
                    "h-4 bg-card/70 dark:bg-slate-700/60 rounded-md",
                    widthClass,
                    col.align === "right" && "ml-auto",
                    col.align === "center" && "mx-auto",
                  )}
                />
              </td>
            );
          })}
        </tr>
      ))}
    </>
  );
}

/**
 * Universal, responsive Data Table component supporting arbitrary record types,
 * comprehensive loading skeleton, error fallback with retry, empty state, and pagination.
 */
export function DataTable<T>({
  columns,
  data = [],
  isLoading = false,
  isFetching = false,
  isError,
  error = null,
  errorMessage,
  onRetry,
  emptyTitle = "No data available",
  emptyDescription = "There are no records matching your current filter criteria.",
  emptyIcon,
  emptyAction,
  skeletonRowCount = 6,
  onRowClick,
  rowKey,
  rowClassName,
  className,
  tableClassName,
  pagination,
}: DataTableProps<T>) {
  const hasError = isError !== undefined ? isError : Boolean(error);
  const displayErrorMessage = error
    ? getApiErrorMessage(error, errorMessage || "Failed to load records")
    : errorMessage || "An error occurred while loading data.";

  const getRowKey = (row: T, index: number): string | number => {
    if (typeof rowKey === "function") {
      return rowKey(row, index);
    }
    if (rowKey && typeof row === "object" && row !== null && rowKey in row) {
      return String((row as Record<string, unknown>)[rowKey as string]);
    }
    if (typeof row === "object" && row !== null && "id" in row) {
      return String((row as Record<string, unknown>).id);
    }
    return `row-${index}`;
  };

  const colSpan = Math.max(1, columns.length);

  return (
    <div
      className={cn(
        "w-full bg-card dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-xs flex flex-col relative",
        className,
      )}
    >
      {/* Background Fetching Status Bar */}
      {isFetching && !isLoading && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-blue-100 dark:bg-blue-950 overflow-hidden z-10">
          <div className="h-full bg-blue-600 animate-pulse w-full" />
        </div>
      )}

      {/* Responsive Horizontal Scroll Container */}
      <div className="w-full overflow-x-auto min-h-40">
        <table
          className={cn(
            "w-full text-left border-collapse text-xs md:text-sm",
            tableClassName,
          )}
        >
          {/* Table Header */}
          <thead className="bg-slate-50/90 dark:bg-slate-800/80 backdrop-blur-xs border-b border-slate-200 dark:border-slate-800 select-none">
            <tr>
              {columns.map((column, colIdx) => {
                const headerContent =
                  typeof column.header === "function"
                    ? column.header({ data })
                    : column.header;

                const alignmentClass =
                  column.align === "right"
                    ? "text-right"
                    : column.align === "center"
                      ? "text-center"
                      : "text-left";

                return (
                  <th
                    key={column.id || `col-header-${colIdx}`}
                    style={{ width: column.width, minWidth: column.minWidth }}
                    className={cn(
                      "py-3 px-4 font-semibold text-xs tracking-wider text-slate-700 dark:text-slate-200 uppercase",
                      alignmentClass,
                      column.headerClassName,
                    )}
                  >
                    {headerContent}
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            {/* 1. Loading State: Render Skeleton */}
            {isLoading ? (
              <TableSkeleton columns={columns} rowCount={skeletonRowCount} />
            ) : hasError ? (
              /* 2. Error State: Alert Box & Retry */
              <tr>
                <td colSpan={colSpan} className="py-12 px-6 text-center">
                  <div className="max-w-md mx-auto flex flex-col items-center justify-center p-6 rounded-lg bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 text-center">
                    <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-3">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-semibold text-rose-900 dark:text-rose-200 mb-1">
                      Data Loading Failed
                    </h3>
                    <p className="text-xs text-rose-700 dark:text-rose-300 font-medium mb-4 max-w-sm">
                      {displayErrorMessage}
                    </p>
                    {onRetry && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onRetry}
                        className="rounded-lg border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 gap-1.5"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                        <span>Try Again</span>
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              /* 3. Empty State */
              <tr>
                <td colSpan={colSpan} className="py-14 px-4 text-center">
                  <div className="max-w-xs mx-auto flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-lg bg-card dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-3 shadow-inner">
                      {emptyIcon || <Inbox className="w-6 h-6" />}
                    </div>
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
                      {emptyTitle}
                    </h3>
                    <p className="text-xs text-slate-700 dark:text-slate-200 font-medium mb-4">
                      {emptyDescription}
                    </p>
                    {emptyAction}
                  </div>
                </td>
              </tr>
            ) : (
              /* 4. Data Rows */
              data.map((row, index) => {
                const key = getRowKey(row, index);
                const computedRowClassName =
                  typeof rowClassName === "function"
                    ? rowClassName(row, index)
                    : rowClassName;

                return (
                  <tr
                    key={key}
                    tabIndex={onRowClick ? 0 : undefined}
                    onClick={() => onRowClick && onRowClick(row, index)}
                    onKeyDown={(e) => {
                      if (!onRowClick || e.target !== e.currentTarget) return;
                      if (e.key === "Enter") {
                        onRowClick(row, index);
                      } else if (e.key === " " || e.key === "Spacebar") {
                        e.preventDefault();
                        onRowClick(row, index);
                      }
                    }}
                    className={cn(
                      "transition-colors duration-150",
                      onRowClick
                        ? "cursor-pointer hover:bg-blue-50/50 dark:hover:bg-blue-950/20"
                        : "hover:bg-slate-50/70 dark:hover:bg-slate-800/40",
                      computedRowClassName,
                    )}
                  >
                    {columns.map((column, colIdx) => {
                      const alignmentClass =
                        column.align === "right"
                          ? "text-right"
                          : column.align === "center"
                            ? "text-center"
                            : "text-left";

                      const rawValue =
                        column.accessorKey &&
                        typeof row === "object" &&
                        row !== null &&
                        column.accessorKey in row
                          ? (row as Record<string, unknown>)[
                              column.accessorKey as string
                            ]
                          : undefined;

                      const cellContent = column.cell
                        ? column.cell({ row, index, value: rawValue })
                        : (rawValue as React.ReactNode);

                      return (
                        <td
                          key={column.id || `col-cell-${colIdx}`}
                          style={{
                            width: column.width,
                            minWidth: column.minWidth,
                          }}
                          className={cn(
                            "py-3.5 px-4 text-xs md:text-sm align-middle",
                            alignmentClass,
                            column.className,
                          )}
                        >
                          {cellContent}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Integrated Pagination Footer */}
      {pagination && !hasError && !isLoading && <Pagination {...pagination} />}
    </div>
  );
}
