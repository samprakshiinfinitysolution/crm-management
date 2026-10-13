"use client";

import React from "react";
import { Search, ShieldAlert, Users } from "lucide-react";
import { useSocket } from "@/components/providers/SocketProvider";
import type { ChatContact, LatestMessageInfo, TabType } from "./types";

interface ChatContactListProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  employeesCount: number;
  adminTlCount: number;
  contacts: ChatContact[];
  unreadContactIds: string[];
  getContactLatestMessage: (contact: ChatContact) => LatestMessageInfo;
  onSelectContact: (contact: ChatContact) => void;
}

export function ChatContactList({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  employeesCount,
  adminTlCount,
  contacts,
  unreadContactIds,
  getContactLatestMessage,
  onSelectContact,
}: ChatContactListProps) {
  const { isUserOnline } = useSocket();
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50 dark:bg-slate-950/40">
      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-1.5 gap-1">
        <button
          type="button"
          onClick={() => {
            onTabChange("employees");
            onSearchChange("");
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === "employees"
              ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs border border-slate-200/80 dark:border-slate-700"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Employees ({employeesCount})</span>
        </button>
        <button
          type="button"
          onClick={() => {
            onTabChange("admin_tl");
            onSearchChange("");
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === "admin_tl"
              ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs border border-slate-200/80 dark:border-slate-700"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60"
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Admin + TL ({adminTlCount})</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="p-2.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={
              activeTab === "employees"
                ? "Search sales executives..."
                : "Search managers & admins..."
            }
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 p-1 no-scrollbar">
        {contacts.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 dark:text-slate-500">
            No contacts found matching &ldquo;{searchQuery}&rdquo;
          </div>
        ) : (
          contacts.map((contact) => {
            const latest = getContactLatestMessage(contact);
            return (
              <button
                key={contact.id}
                type="button"
                onClick={() => onSelectContact(contact)}
                className="w-full text-left p-3 hover:bg-white dark:hover:bg-slate-800/80 rounded-xl transition-all flex items-center gap-3 group cursor-pointer"
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="w-9 h-9 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-xs border border-indigo-200 dark:border-indigo-800/80 group-hover:scale-105 transition-transform">
                    {contact.name[0]?.toUpperCase()}
                  </div>
                  <span
                    title={isUserOnline(contact.id) ? "Online" : "Offline"}
                    className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900 ${
                      isUserOnline(contact.id)
                        ? "bg-emerald-500"
                        : "bg-slate-300 dark:bg-slate-600"
                    }`}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                      {contact.name}
                      {unreadContactIds.includes(contact.id) && (
                        <span
                          className="w-2 h-2 rounded-full bg-sky-500 animate-pulse shrink-0"
                          title="New unread message"
                        />
                      )}
                    </h4>
                    {latest.timestamp && (
                      <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                        {latest.timestamp}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {latest.text || contact.email || "Tap to start conversation"}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
