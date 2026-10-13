"use client";

import React, { useState } from "react";
import { CheckCheck, MessageSquare, FileText, Download, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { downloadAttachment } from "@/lib/downloadUtils";
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
  const [downloadingUrl, setDownloadingUrl] = useState<string | null>(null);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  const handleDownload = async (url: string, fileName?: string) => {
    if (!url || downloadingUrl) return;
    setDownloadingUrl(url);
    const toastId = toast.loading(`Downloading ${fileName || "file"}...`);
    try {
      const ok = await downloadAttachment(url, fileName);
      if (ok) {
        toast.success(`Downloaded ${fileName || "file"}`, { id: toastId });
      } else {
        toast.error("Download failed. Please try again.", { id: toastId });
      }
    } catch {
      toast.error("Download failed. Please try again.", { id: toastId });
    } finally {
      setDownloadingUrl(null);
    }
  };

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-xs py-10">
        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2" />
        <span>Loading messages...</span>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-xs py-10 text-center px-4">
        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center mb-2 text-blue-500">
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
        const isDownloading = downloadingUrl === msg.attachment?.url;

        return (
          <div
            key={msg.id}
            className={`flex gap-2 text-xs ${
              isUser ? "justify-end" : "justify-start"
            }`}
          >
            {!isUser && (
              <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 border border-blue-200 dark:border-blue-800">
                {selectedContact.name[0]?.toUpperCase()}
              </div>
            )}
            <div
              className={`max-w-[78%] rounded-xl shadow-2xs overflow-hidden ${
                isUser
                  ? "bg-blue-600 text-white rounded-br-xs"
                  : "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-800 rounded-bl-xs"
              }`}
            >
              {isImage && (
                <div className="relative group overflow-hidden bg-slate-950/20">
                  {!imgErrors[msg.id] ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={msg.attachment!.url}
                        alt={msg.attachment?.fileName || "Shared image"}
                        loading="lazy"
                        onError={() =>
                          setImgErrors((prev) => ({ ...prev, [msg.id]: true }))
                        }
                        className="max-w-full max-h-56 object-cover block cursor-pointer transition-opacity group-hover:opacity-95"
                        onClick={() => window.open(msg.attachment!.url, "_blank")}
                        title="Click to view full image"
                      />

                      {/* Download button on image */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(
                            msg.attachment!.url,
                            msg.attachment?.fileName ||
                              `image_${Date.now()}.${msg.attachment?.format || "png"}`,
                          );
                        }}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur-xs transition-all shadow-md group-hover:opacity-100 opacity-90 hover:scale-105 active:scale-95"
                        title="Download image"
                      >
                        {isDownloading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Download className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </>
                  ) : (
                    /* Fallback when image cannot preview directly in browser */
                    <div className="p-4 flex flex-col items-center justify-center min-w-[200px] min-h-[140px] bg-slate-900 text-white">
                      <button
                        type="button"
                        onClick={() =>
                          handleDownload(
                            msg.attachment!.url,
                            msg.attachment?.fileName ||
                              `image_${Date.now()}.${msg.attachment?.format || "png"}`,
                          )
                        }
                        className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center transition-all mb-2.5 text-white shadow-xs"
                        title="Download image"
                      >
                        {isDownloading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Download className="w-5 h-5" />
                        )}
                      </button>
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-black/60 rounded-full text-[10px] font-semibold text-white tracking-wide border border-white/10">
                        <ImageIcon className="w-3 h-3 text-emerald-400" />
                        <span>
                          IMAGE
                          {msg.attachment?.bytes
                            ? ` (${formatBytes(msg.attachment.bytes)})`
                            : ""}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {isFile && (
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() =>
                    handleDownload(
                      msg.attachment!.url,
                      msg.attachment?.fileName,
                    )
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleDownload(
                        msg.attachment!.url,
                        msg.attachment?.fileName,
                      );
                    }
                  }}
                  className={`flex items-center gap-2.5 p-3 cursor-pointer select-none transition-colors duration-150 ${
                    isUser
                      ? "text-white hover:bg-white/10"
                      : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  }`}
                  title={`Click to download ${msg.attachment?.fileName || "attachment"}`}
                >
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      isUser
                        ? "bg-white/20 text-white"
                        : "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400"
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
                          isUser ? "text-blue-200" : "text-slate-400"
                        }`}
                      >
                        {formatBytes(msg.attachment.bytes)}
                        {msg.attachment.format
                          ? ` • ${msg.attachment.format.toUpperCase()}`
                          : ""}
                      </p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(
                        msg.attachment!.url,
                        msg.attachment?.fileName,
                      );
                    }}
                    className={`p-1.5 rounded-md transition-colors ${
                      isUser
                        ? "hover:bg-white/20 text-white"
                        : "hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300"
                    }`}
                    title="Download"
                  >
                    {isDownloading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-current" />
                    ) : (
                      <Download className="w-4 h-4 text-current opacity-80 hover:opacity-100" />
                    )}
                  </button>
                </div>
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
                    ? "text-blue-200"
                    : "text-slate-400 dark:text-slate-500"
                }`}
              >
                <span>{msg.timestamp}</span>
                {isUser && <CheckCheck className="w-3 h-3 text-blue-200" />}
              </div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}

