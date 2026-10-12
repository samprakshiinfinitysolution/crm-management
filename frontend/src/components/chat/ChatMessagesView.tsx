"use client";

import React from "react";
import { CheckCheck, MessageSquare, FileText, Download, Loader2 } from "lucide-react";
import type { ChatContact, ChatMessage } from "./types";

interface ChatMessagesViewProps {
  isLoading: boolean;
  messages: ChatMessage[];
  selectedContact: ChatContact;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

/** Human-readable file size from a byte count. */
function formatBytes(bytes?: number): string {
  if (!bytes || bytes <= 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, i);
  return `${value >= 10 || i === 0 ? Math.round(value) : value.toFixed(1)} ${units[i]}`;
}

export function ChatMessagesView({
  isLoading,
  messages,
  selectedContact,
  messagesEndRef,
}: ChatMessagesViewProps) {
  if (isLoading && messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-xs py-10">
        <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-2" />
        <span>Loading messages...</span>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-xs py-10 text-center px-4">
        <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center mb-2 text-indigo-500">
          <MessageSquare className="w-5 h-5" />
        </div>
        <p className="font-semibold text-slate-700 dark:text-slate-200">
          No messages yet
        </p>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Start a conversation with {selectedContact.name} below.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 p-3.5 overflow-y-auto space-y-3 no-scrollbar">
      {messages.map((msg) => {
        const isUser = msg.sender === "user";
        const isImage = msg.type === "IMAGE" && !!msg.attachment?.url;
        const isFile = msg.type === "FILE" && !!msg.attachment?.url;
        return (
        <div
          key={msg.id}
          className={`flex gap-2 text-xs ${
            isUser ? "justify-end" : "justify-start"
          }`}
        >
          {!isUser && (
            <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 border border-indigo-200 dark:border-indigo-800">
              {selectedContact.name[0]?.toUpperCase()}
            </div>
          )}
          <div
            className={`max-w-[78%] rounded-2xl shadow-2xs overflow-hidden ${
              isUser
                ? "bg-indigo-600 text-white rounded-br-xs"
                : "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-800 rounded-bl-xs"
            }`}
          >
            {isImage && (
              <a
                href={msg.attachment!.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <img
                  src={msg.attachment!.url}
                  alt={msg.attachment?.fileName || "Shared image"}
                  loading="lazy"
                  className="max-w-full max-h-56 object-cover"
                />
              </a>
            )}

            {isFile && (
              <a
                href={msg.attachment!.url}
                target="_blank"
                rel="noopener noreferrer"
                download={msg.attachment?.fileName || true}
                className={`flex items-center gap-2.5 p-3 ${
                  isUser
                    ? "text-white"
                    : "text-slate-700 dark:text-slate-200"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    isUser
                      ? "bg-white/20"
                      : "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium truncate">
                    {msg.attachment?.fileName || "Attachment"}
                  </p>
                  {msg.attachment?.bytes ? (
                    <p
                      className={`text-[10px] mt-0.5 ${
                        isUser ? "text-indigo-200" : "text-slate-400"
                      }`}
                    >
                      {formatBytes(msg.attachment.bytes)}
                      {msg.attachment.format
                        ? ` • ${msg.attachment.format.toUpperCase()}`
                        : ""}
                    </p>
                  ) : null}
                </div>
                <Download className="w-4 h-4 shrink-0 opacity-70" />
              </a>
            )}

            {msg.isUploading && !isImage && !isFile && (
              <div className="flex items-center gap-2 p-3">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-xs opacity-80">Uploading…</span>
              </div>
            )}

            {msg.text && (
              <p className="leading-relaxed whitespace-pre-wrap px-3 pt-2">
                {msg.text}
              </p>
            )}

            <div
              className={`flex items-center justify-end gap-1 text-[9px] px-3 pb-2 ${
                msg.text || isImage || isFile ? "pt-1" : ""
              } ${
                isUser
                  ? "text-indigo-200"
                  : "text-slate-400 dark:text-slate-500"
              }`}
            >
              <span>{msg.timestamp}</span>
              {isUser && <CheckCheck className="w-3 h-3 text-indigo-200" />}
            </div>
          </div>
        </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}
