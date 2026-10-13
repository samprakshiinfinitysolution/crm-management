"use client";

import React, { useState } from "react";
import { Bell, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { useAppSelector } from "@/store";
import { performLogout } from "@/lib/authService";
import LogOutPopUp from "../LogOutPopUp";

export default function TLHeader() {
  const { user } = useAppSelector((state) => state.auth);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true);
      await performLogout({ callBackend: true, redirectTo: "/" });
    } catch {
      await performLogout({ callBackend: false, redirectTo: "/" });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "TL";

  return (
    <header className="fixed top-0 w-full z-50 bg-(--crm-brand-primary) backdrop-blur-xl border-b border-crm-subtle shadow-xs">
      <div className="max-w-7xl mx-auto h-16 px-4 flex items-center justify-between gap-3">
        {/* Brand & Team Leader Context */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-lg bg-card shadow-xs border border-crm-subtle flex items-center justify-center p-1.5 shrink-0">
            <div className="w-full h-full rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-inner">
              LF
            </div>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-white tracking-tight truncate leading-tight">
                LeadFlow
              </span>
              <span className="px-2 py-0.5 rounded-full bg-crm-warning text-crm-dark text-[10px] font-bold tracking-wide leading-none shrink-0">
                TL/OPS
              </span>
            </div>
            <div className="flex items-center gap-1 cursor-pointer text-white hover:text-crm-primary transition-colors">
              <span className="text-xs font-medium truncate max-w-30">
                Supervisor Workspace
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
        </div>

        {/* Action Controls, Avatar & Logout */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            aria-label="Notifications"
            onClick={() =>
              toast.info("System Alert: 184 leads pending assignment")
            }
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-crm-info text-crm-dark hover:text-crm-brand hover:border-crm-brand hover:bg-crm-muted relative active:scale-95 transition-all border border-crm-subtle"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white"></span>
          </button>

          <div
            className="w-9 h-9 rounded-lg bg-crm-dark text-crm-inverse flex items-center justify-center font-bold text-xs shadow-xs"
            title={`Logged in as ${user?.name || "Team Leader"}`}
          >
            {initials}
          </div>

          <LogOutPopUp
            open={isLoggingOut}
            setOpen={setIsLoggingOut}
            onLogout={handleSignOut}
            onClose={() => setIsLoggingOut(false)}
            isPending={isLoggingOut}
          />
        </div>
      </div>
    </header>
  );
}
