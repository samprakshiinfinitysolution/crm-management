import React from "react";
import { ShieldCheck } from "lucide-react";

export default function AuthHeader() {
  return (
    <header className="flex flex-col items-center text-center mb-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-lg bg-blue-600 shadow-xs flex items-center justify-center text-white font-bold text-base">
          LF
        </div>
        <div className="text-left">
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            LeadFlow
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            CRM platform for sales teams
          </p>
        </div>
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50/80 dark:bg-blue-950/60 border border-blue-100/80 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-medium">
        <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
        <span>Welcome to your workspace</span>
      </div>
    </header>
  );
}
