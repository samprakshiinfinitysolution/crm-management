export type TabType = "employees" | "admin_tl";

/** Metadata for a chat attachment (image or file) stored on Cloudinary. */
export interface ChatAttachment {
  url: string;
  secureUrl?: string;
  publicId?: string;
  resourceType?: string;
  format?: string;
  bytes?: number;
  width?: number;
  height?: number;
  fileName?: string;
  mimeType?: string;
  caption?: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "other" | "assistant";
  text: string;
  timestamp: string;
  rawCreatedAt?: string | number | Date;
  /** Message kind. Defaults to TEXT for backward compatibility. */
  type?: "TEXT" | "IMAGE" | "FILE" | "SYSTEM";
  /** Present when type is IMAGE or FILE. */
  attachment?: ChatAttachment;
  /** True while an attachment is still uploading (optimistic UI). */
  isUploading?: boolean;
}

export interface ChatContact {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  activeLeads?: number;
  conversationId?: string;
}

export interface LatestMessageInfo {
  text: string;
  timestamp: string;
  timeMs: number;
}
