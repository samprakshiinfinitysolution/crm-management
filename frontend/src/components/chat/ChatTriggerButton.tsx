"use client";

import React from "react";
import { MessageSquare, X } from "lucide-react";

interface ChatTriggerButtonProps {
  isOpen: boolean;
  hasNewMessage: boolean;
  unreadCount?: number;
  onToggle: () => void;
}

export function ChatTriggerButton({
  isOpen,
  hasNewMessage,
  unreadCount = 0,
  onToggle,
}: ChatTriggerButtonProps) {
  const showBadge = !isOpen && (hasNewMessage || unreadCount > 0);

  return (
    <button
      type="button"
      onClick={onToggle}
      className="group relative p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-blue-500/25 transition-all duration-200 active:scale-95 flex items-center justify-center cursor-pointer"
      aria-label="Open Workspace Chat"
    >
      <MessageSquare
        className={`w-6 h-6 transition-transform duration-200 ${
          isOpen ? "rotate-90 scale-0 opacity-0 absolute" : "scale-100 opacity-100"
        }`}
      />
      <X
        className={`w-6 h-6 transition-transform duration-200 ${
          isOpen
            ? "scale-100 opacity-100 rotate-0"
            : "-rotate-90 scale-0 opacity-0 absolute"
        }`}
      />

      {/* Pulse Indicator badge */}
      {showBadge && (
        <span className="absolute -top-1 -right-1 flex items-center justify-center pointer-events-none">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
          {unreadCount > 0 ? (
            <span className="relative inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full text-[10px] font-extrabold bg-rose-500 text-white border-2 border-white dark:border-slate-900 shadow-md">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : (
            <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-rose-500 border-2 border-white dark:border-slate-900 shadow-md" />
          )}
        </span>
      )}
    </button>
  );
}
