"use client";

import React, { useRef } from "react";
import { Send, Paperclip, Image as ImageIcon } from "lucide-react";

interface ChatInputBarProps {
  input: string;
  contactName: string;
  onInputChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  /** Called when the user picks an image or file to attach. */
  onAttach?: (file: File) => void;
  /** Disables send/attach while an attachment is uploading. */
  isUploading?: boolean;
}

export function ChatInputBar({
  input,
  contactName,
  onInputChange,
  onSubmit,
  onAttach,
  isUploading = false,
}: ChatInputBarProps) {
  const shortName = contactName ? contactName.split(" ")[0] : "user";
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    // Reset so selecting the same file again still fires a change event.
    e.target.value = "";
    if (file && onAttach) {
      onAttach(file);
    }
  };

  const canSend = input.trim().length > 0;

  return (
    <form
      onSubmit={onSubmit}
      className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
    >
      {onAttach && (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            disabled={isUploading}
            className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 disabled:opacity-40 transition-colors cursor-pointer"
            aria-label="Attach image"
            title="Send image"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 disabled:opacity-40 transition-colors cursor-pointer"
            aria-label="Attach file"
            title="Send file"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,application/pdf"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      )}
      <input
        type="text"
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
        placeholder={`Message ${shortName}...`}
        className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none transition-all"
        autoFocus
      />
      <button
        type="submit"
        disabled={!canSend || isUploading}
        className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 disabled:hover:bg-indigo-600 transition-colors shadow-xs cursor-pointer"
        aria-label="Send Message"
      >
        <Send className="w-4 h-4" />
      </button>
    </form>
  );
}
