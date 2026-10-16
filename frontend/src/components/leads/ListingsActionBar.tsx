"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  Download,
  GitFork,
  RotateCcw,
  Tag,
} from "lucide-react";
import Link from "next/link";

interface ListingsActionBarProps {
  selectedCount: number;
  onBulkAssign?: () => void;
  onBulkStatusChange?: () => void;
  onBulkRecall?: () => void;
  onRequestDownload: (format: "csv" | "excel") => void;
  onSortChange: (sortVal: string) => void;
  currentSort: string;
  isElevatedUser?: boolean;
}

export function ListingsActionBar({
  selectedCount,
  onBulkAssign,
  onBulkStatusChange,
  onBulkRecall,
  onRequestDownload,
  onSortChange,
  currentSort,
  isElevatedUser = true,
}: ListingsActionBarProps) {
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isColumnsOpen, setIsColumnsOpen] = useState(false);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
      {/* Left Action Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Bulk Actions Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsBulkOpen(!isBulkOpen)}
            className="h-8 px-3 rounded-sm bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Bulk Actions</span>
            {selectedCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#2874f0] text-white text-[10px] font-bold flex items-center justify-center">
                {selectedCount}
              </span>
            )}
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isBulkOpen && (
            <div className="absolute top-9 left-0 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-sm py-1.5 z-30 animate-in fade-in duration-100">
              {isElevatedUser && (
                <button
                  type="button"
                  disabled={selectedCount === 0}
                  onClick={() => {
                    setIsBulkOpen(false);
                    onBulkAssign?.();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-[#f2f7fe] dark:hover:bg-slate-800 hover:text-[#2874f0] disabled:opacity-50 text-left cursor-pointer"
                >
                  <GitFork className="w-3.5 h-3.5 text-purple-600" />
                  <span>Distribute Selected ({selectedCount})</span>
                </button>
              )}

              <button
                type="button"
                disabled={selectedCount === 0}
                onClick={() => {
                  setIsBulkOpen(false);
                  onBulkStatusChange?.();
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-[#f2f7fe] dark:hover:bg-slate-800 hover:text-[#2874f0] disabled:opacity-50 text-left cursor-pointer"
              >
                <Tag className="w-3.5 h-3.5 text-blue-600" />
                <span>Update Status ({selectedCount})</span>
              </button>

              {isElevatedUser && (
                <button
                  type="button"
                  disabled={selectedCount === 0}
                  onClick={() => {
                    setIsBulkOpen(false);
                    onBulkRecall?.();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-50 text-left cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Recall Selected ({selectedCount})</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Split Button: Request Download ▾ */}
        <div className="relative inline-flex rounded-sm shadow-2xs">
          <button
            type="button"
            onClick={() => onRequestDownload("excel")}
            className="h-8 px-3 rounded-l-sm bg-[#2874f0] hover:bg-[#1a5bb8] text-white font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Request Download</span>
          </button>
          <button
            type="button"
            onClick={() => setIsDownloadOpen(!isDownloadOpen)}
            className="h-8 px-2 rounded-r-sm bg-[#1a5bb8] hover:bg-[#13448a] text-white border-l border-blue-400/30 flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {isDownloadOpen && (
            <div className="absolute top-9 left-0 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-sm py-1 z-30 animate-in fade-in duration-100">
              <button
                type="button"
                onClick={() => {
                  setIsDownloadOpen(false);
                  onRequestDownload("excel");
                }}
                className="w-full px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-[#f2f7fe] dark:hover:bg-slate-800 hover:text-[#2874f0] text-left cursor-pointer flex items-center gap-2"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>Export as Excel (.xlsx)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsDownloadOpen(false);
                  onRequestDownload("csv");
                }}
                className="w-full px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-[#f2f7fe] dark:hover:bg-slate-800 hover:text-[#2874f0] text-left cursor-pointer flex items-center gap-2"
              >
                <Download className="w-3.5 h-3.5 text-blue-600" />
                <span>Export as CSV</span>
              </button>
            </div>
          )}
        </div>

        {/* Upload Button */}
        {isElevatedUser && (
          <Link
            href="/dashboard/imports/upload"
            className="h-8 px-3 rounded-sm bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium flex items-center gap-1.5 transition-colors"
          >
            <span>Upload</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </Link>
        )}

        {/* Download Ready Button */}
        <div className="hidden sm:inline-flex items-center gap-1.5 h-8 px-3 rounded-sm bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 text-slate-700 dark:text-slate-200 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Download Ready</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </div>
      </div>

      {/* Right Controls: Sort By & Customize Columns */}
      <div className="flex items-center gap-2">
        {/* Sort By Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsSortOpen(!isSortOpen)}
            className="h-8 px-3 rounded-sm bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Sort By</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isSortOpen && (
            <div className="absolute top-9 right-0 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-sm py-1.5 z-30 animate-in fade-in duration-100">
              <button
                type="button"
                onClick={() => {
                  onSortChange("newest");
                  setIsSortOpen(false);
                }}
                className={`w-full px-3 py-1.5 text-xs text-left cursor-pointer ${
                  currentSort === "newest"
                    ? "bg-[#f2f7fe] dark:bg-blue-950/60 text-[#2874f0] font-semibold"
                    : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                Newest First
              </button>
              <button
                type="button"
                onClick={() => {
                  onSortChange("oldest");
                  setIsSortOpen(false);
                }}
                className={`w-full px-3 py-1.5 text-xs text-left cursor-pointer ${
                  currentSort === "oldest"
                    ? "bg-[#f2f7fe] dark:bg-blue-950/60 text-[#2874f0] font-semibold"
                    : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                Oldest First
              </button>
              <button
                type="button"
                onClick={() => {
                  onSortChange("price_high");
                  setIsSortOpen(false);
                }}
                className={`w-full px-3 py-1.5 text-xs text-left cursor-pointer ${
                  currentSort === "price_high"
                    ? "bg-[#f2f7fe] dark:bg-blue-950/60 text-[#2874f0] font-semibold"
                    : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                Highest Listing Price
              </button>
              <button
                type="button"
                onClick={() => {
                  onSortChange("price_low");
                  setIsSortOpen(false);
                }}
                className={`w-full px-3 py-1.5 text-xs text-left cursor-pointer ${
                  currentSort === "price_low"
                    ? "bg-[#f2f7fe] dark:bg-blue-950/60 text-[#2874f0] font-semibold"
                    : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                Lowest Listing Price
              </button>
            </div>
          )}
        </div>

        {/* Customize Columns */}
        <button
          type="button"
          onClick={() => setIsColumnsOpen(!isColumnsOpen)}
          className="h-8 px-3 rounded-sm bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <span>Customize Columns</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>
    </div>
  );
}
