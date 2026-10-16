"use client";

import React from "react";
import { WifiOff, RefreshCw } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6">
          <WifiOff className="w-8 h-8" />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
          You are currently offline
        </h1>

        <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
          It looks like you lost your internet connection.
        </p>

        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
          Real-time CRM features and Socket.IO updates will resume automatically once you reconnect.
        </p>

        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry Connection</span>
        </button>
      </div>
    </div>
  );
}
