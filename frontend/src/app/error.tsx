"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  RefreshCw,
  Home,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
} from "lucide-react";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    console.error("[Root Route Error caught]:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-lg w-full bg-card rounded-xl border border-slate-200 shadow-xl p-8 text-center flex flex-col items-center">
        <div className="w-16 h-16 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-5 border border-amber-100 shadow-xs">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Page Rendering Error
        </h1>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 mb-6 max-w-sm leading-relaxed">
          We encountered an unexpected error while preparing this page. Your
          data is safe in the database.
        </p>

        {error.digest && (
          <div className="mb-4 px-3 py-1.5 rounded-lg bg-card text-[11px] font-mono text-slate-600">
            Digest Code: {error.digest}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full mb-4">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-1/2 py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Try Again
          </button>

          <Link
            href="/dashboard"
            className="w-full sm:w-1/2 py-2.5 px-4 rounded-lg bg-card hover:bg-card/70 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors flex items-center justify-center gap-2 text-center"
          >
            <Home className="w-3.5 h-3.5" />
            CRM Dashboard
          </Link>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-2">
          <button
            type="button"
            onClick={() =>
              typeof window !== "undefined" && window.history.back()
            }
            className="inline-flex items-center gap-1 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3 h-3" /> Go back
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="inline-flex items-center gap-1 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <span>
              {showDetails ? "Hide technical details" : "Technical details"}
            </span>
            {showDetails ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
        </div>

        {showDetails && (
          <div className="w-full text-left mt-4 p-4 rounded-lg bg-slate-900 text-slate-200 text-xs font-mono overflow-x-auto max-h-48 border border-slate-800">
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
