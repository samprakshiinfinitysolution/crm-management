"use client";

import React from "react";
import { ArrowLeft, Bot, X } from "lucide-react";
import { useSocket } from "@/components/providers/SocketProvider";
import type { ChatContact } from "./types";

interface ChatHeaderProps {
  selectedContact: ChatContact | null;
  onBack: () => void;
  onClose: () => void;
}

export function ChatHeader({
  selectedContact,
  onBack,
  onClose,
}: ChatHeaderProps) {
  const { isUserOnline } = useSocket();
  const isOnline = selectedContact ? isUserOnline(selectedContact.id) : false;

  return (
    <div className="bg-linear-to-r from-indigo-600 via-indigo-700 to-blue-600 text-white p-3.5 flex items-center justify-between shadow-md">
      {selectedContact ? (
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="p-1 rounded-lg hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0"
            aria-label="Back to contacts list"
            title="Back to list"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="relative shrink-0">
            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md text-white font-bold flex items-center justify-center text-xs border border-white/30">
              {selectedContact.name[0]?.toUpperCase()}
            </div>
            <span
              className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-indigo-700 ${
                isOnline ? "bg-emerald-400" : "bg-slate-400"
              }`}
            />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-xs truncate leading-tight">
              {selectedContact.name}
            </h3>
            <span className="text-[10px] text-indigo-100/80 block truncate">
              {isOnline ? "Online" : "Offline"}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-xs leading-none flex items-center gap-1.5">
              Team Workspace Chat
            </h3>
            <span className="text-[10px] text-indigo-100/80">
              Connect with executives & managers
            </span>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={onClose}
        className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0"
        aria-label="Close Chat"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
