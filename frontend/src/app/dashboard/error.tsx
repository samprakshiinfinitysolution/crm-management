"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  RefreshCw,
  Layers,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
} from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    console.error("[Dashboard Error caught]:", error);
  }, [error]);

  return (
    <div className="flex-1 min-h-[70vh] flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 text-center flex flex-col items-center">
        <div className="w-14 h-14 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4 border border-rose-100 dark:border-rose-900/50 shadow-2xs">
          <AlertCircle className="w-7 h-7" />
        </div>

        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Failed to load dashboard module
        </h2>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 mb-6 max-w-sm leading-relaxed">
          The requested dashboard view ran into an issue while loading data. You
          can attempt to reload the module or return to the main leads console.
        </p>

        {error.digest && (
          <div className="mb-5 px-3 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-300">
            Error Ref: {error.digest}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full mb-4">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-1/2 py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reload Module
          </button>

          <Link
            href="/dashboard/leads"
            className="w-full sm:w-1/2 py-2.5 px-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors flex items-center justify-center gap-2 text-center"
          >
            <Layers className="w-3.5 h-3.5" />
            Leads Console
          </Link>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500">
          <button
            type="button"
            onClick={() =>
              typeof window !== "undefined" && window.history.back()
            }
            className="inline-flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-300 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3 h-3" /> Back
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="inline-flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-300 transition-colors cursor-pointer"
          >
            <span>
              {showDetails ? "Hide technical trace" : "Show technical trace"}
            </span>
            {showDetails ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
        </div>

        {showDetails && (
          <div className="w-full text-left mt-4 p-3.5 rounded-lg bg-slate-900 text-slate-200 text-xs font-mono overflow-x-auto max-h-40 border border-slate-800">
            <div className="font-bold text-rose-400 mb-1">
              {error.name}: {error.message}
            </div>
            {error.stack && (
              <pre className="text-[11px] text-slate-400 whitespace-pre-wrap leading-relaxed">
                {error.stack}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
