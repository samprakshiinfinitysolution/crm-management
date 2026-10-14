"use client";

import React, { useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  isLoading?: boolean;
  showPageSizeSelector?: boolean;
  showTotalInfo?: boolean;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize = 10,
  pageSizeOptions = [10, 25, 50, 100],
  onPageChange,
  onPageSizeChange,
  isLoading = false,
  showPageSizeSelector = true,
  showTotalInfo = true,
  className,
}) => {
  const safeTotalPages = Math.max(1, totalPages || 1);
  const safeCurrentPage = Math.min(Math.max(1, currentPage), safeTotalPages);

  // Calculate start & end indices for total items info
  const startItem =
    totalItems !== undefined && totalItems > 0
      ? (safeCurrentPage - 1) * pageSize + 1
      : 0;
  const endItem =
    totalItems !== undefined
      ? Math.min(safeCurrentPage * pageSize, totalItems)
      : 0;

  // Generate pagination items with intelligent ellipsis
  const paginationRange = useMemo<(number | "ellipsis")[]>(() => {
    const totalNumbers = 5; // e.g. 1 ... 4 5 6 ... 10
    const totalBlocks = totalNumbers + 2;

    if (safeTotalPages <= totalBlocks) {
      return Array.from({ length: safeTotalPages }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(safeCurrentPage - 1, 1);
    const rightSiblingIndex = Math.min(safeCurrentPage + 1, safeTotalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < safeTotalPages - 2;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2;
      const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
      return [...leftRange, "ellipsis", safeTotalPages];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2;
      const rightRange = Array.from(
        { length: rightItemCount },
        (_, i) => safeTotalPages - rightItemCount + i + 1,
      );
      return [1, "ellipsis", ...rightRange];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = [
        leftSiblingIndex,
        safeCurrentPage,
        rightSiblingIndex,
      ];
      return [1, "ellipsis", ...middleRange, "ellipsis", safeTotalPages];
    }

    return Array.from({ length: safeTotalPages }, (_, i) => i + 1);
  }, [safeCurrentPage, safeTotalPages]);

  return (
    <nav
      aria-label="Pagination Navigation"
      className={cn(
        "w-full flex flex-col flex-wrap sm:flex-row items-center justify-between gap-3 min-[300px]:px-4 py-3 bg-card dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 select-none transition-all",
        className,
      )}
    >
      {/* Left: Total Items Summary & Page Size Selector */}
      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 w-full sm:w-auto">
        {showTotalInfo && totalItems !== undefined && (
          <p className="font-medium text-slate-700 dark:text-slate-200 text-center sm:text-left">
            Showing{" "}
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {startItem}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {endItem}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {totalItems}
            </span>{" "}
            results
          </p>
        )}

        {showPageSizeSelector && onPageSizeChange && (
          <div className="flex items-center gap-1.5">
            <span className="text-slate-700 dark:text-slate-200 font-semibold text-xs">
              Rows:
            </span>

            <Select
              value={pageSize.toString()}
              onValueChange={(val) => onPageSizeChange(Number(val))}
            >
              <SelectTrigger className="h-7 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                <SelectValue placeholder="Rows per page" />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size} / page
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Right: Navigation Controls */}
      <div className="flex items-center justify-center gap-1 w-full sm:w-auto">
        {/* First Page */}
        <Button
          variant="outline"
          size="sm"
          disabled={safeCurrentPage <= 1 || isLoading}
          onClick={() => onPageChange(1)}
          aria-label="Go to first page"
          className="h-8 w-8 p-0 rounded-lg border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
        >
          <ChevronsLeft className="w-4 h-4" />
        </Button>

        {/* Previous Page */}
        <Button
          variant="outline"
          size="sm"
          disabled={safeCurrentPage <= 1 || isLoading}
          onClick={() => onPageChange(safeCurrentPage - 1)}
          aria-label="Go to previous page"
          className="h-8 w-8 p-0 rounded-lg border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {/* Mobile Page indicator (sm:hidden) */}
        <div className="flex sm:hidden items-center px-2 font-medium text-xs text-slate-700 dark:text-slate-300">
          Page {safeCurrentPage} of {safeTotalPages}
        </div>

        {/* Desktop Page Numbers (hidden sm:flex) */}
        <div className="hidden sm:flex items-center gap-1">
          {paginationRange.map((pageNumber, index) => {
            if (pageNumber === "ellipsis") {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="w-8 h-8 flex items-center justify-center text-slate-400 text-xs"
                >
                  •••
                </span>
              );
            }

            const isActive = pageNumber === safeCurrentPage;

            return (
              <button
                key={pageNumber}
                type="button"
                disabled={isLoading}
                onClick={() => onPageChange(pageNumber)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "h-8 min-w-8 px-2.5 rounded-lg text-xs font-semibold transition-all outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40",
                  isActive
                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm ring-1 ring-blue-600"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent",
                )}
              >
                {pageNumber}
              </button>
            );
          })}
        </div>

        {/* Next Page */}
        <Button
          variant="outline"
          size="sm"
          disabled={safeCurrentPage >= safeTotalPages || isLoading}
          onClick={() => onPageChange(safeCurrentPage + 1)}
          aria-label="Go to next page"
          className="h-8 w-8 p-0 rounded-lg border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>

        {/* Last Page */}
        <Button
          variant="outline"
          size="sm"
          disabled={safeCurrentPage >= safeTotalPages || isLoading}
          onClick={() => onPageChange(safeTotalPages)}
          aria-label="Go to last page"
          className="h-8 w-8 p-0 rounded-lg border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
        >
          <ChevronsRight className="w-4 h-4" />
        </Button>
      </div>
    </nav>
  );
};
