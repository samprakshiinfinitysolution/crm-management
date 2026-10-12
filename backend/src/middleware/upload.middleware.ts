import multer from "multer";
import path from "path";
import { Request } from "express";
import { AppError } from "./errorHandler.js";

// Use memory storage for direct buffer processing and cloud container safety
const storage = multer.memoryStorage();

const allowedFileTypes: Record<string, string[]> = {
  ".xlsx": [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/octet-stream",
    "application/x-zip-compressed",
    "application/zip",
  ],
  ".xls": [
    "application/vnd.ms-excel",
    "application/msexcel",
    "application/x-msexcel",
    "application/x-ms-excel",
    "application/x-excel",
    "application/x-dos_ms_excel",
    "application/xls",
    "application/x-xls",
    "application/octet-stream",
  ],
  ".csv": [
    "text/csv",
    "application/csv",
    "text/plain",
    "text/x-csv",
    "application/vnd.ms-excel",
    "text/comma-separated-values",
    "application/octet-stream",
  ],
};

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedMimeTypes = allowedFileTypes[ext];

  if (!allowedMimeTypes) {
    return cb(
      new AppError(
        `Unsupported file extension "${ext || "unknown"}". Please upload an Excel (.xlsx, .xls) or CSV file.`,
        400,
        "INVALID_FILE_TYPE",
      ),
    );
  }

  // If MIME type is present, ensure it matches common expected types or generic binary
  if (file.mimetype && !allowedMimeTypes.includes(file.mimetype) && file.mimetype !== "application/octet-stream") {
    return cb(
      new AppError(
        `Invalid MIME type "${file.mimetype}" for "${ext}" file. Please ensure you upload a valid Excel or CSV file.`,
        400,
        "INVALID_FILE_TYPE",
      ),
    );
  }

  cb(null, true);
};

export const uploadLeadSheet = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15 MB
    files: 1,
  },
  fileFilter,
});

// ---------------------------------------------------------------------------
// Chat attachments (images + documents)
// ---------------------------------------------------------------------------

// Maximum chat attachment size (10 MB). Kept smaller than the Excel import
// limit because media is proxied to Cloudinary in a single request.
const CHAT_ATTACHMENT_MAX_BYTES = 10 * 1024 * 1024;

// Allowed image MIME types for chat.
const allowedImageMimeTypes = new Set<string>([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/bmp",
  "image/svg+xml",
]);

// Allowed document / file MIME types for chat.
const allowedFileMimeTypes = new Set<string>([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/csv",
  "application/zip",
  "application/x-zip-compressed",
  // Generic binary is tolerated so valid files with mis-reported MIME types
  // still upload; Cloudinary performs authoritative classification.
  "application/octet-stream",
]);

const chatFileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  const mime = (file.mimetype || "").toLowerCase();
  if (allowedImageMimeTypes.has(mime) || allowedFileMimeTypes.has(mime)) {
    return cb(null, true);
  }
  return cb(
    new AppError(
      `Unsupported file type "${mime || "unknown"}". Allowed: images (JPG, PNG, GIF, WEBP) and documents (PDF, DOC, XLS, PPT, TXT, CSV, ZIP).`,
      400,
      "INVALID_FILE_TYPE",
    ),
  );
};

/**
 * Multer instance for chat attachments. Accepts a single file under the
 * "file" field, stored in memory for direct streaming to Cloudinary.
 */
export const uploadChatAttachment = multer({
  storage,
  limits: {
    fileSize: CHAT_ATTACHMENT_MAX_BYTES,
    files: 1,
  },
  fileFilter: chatFileFilter,
});
