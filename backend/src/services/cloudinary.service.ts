import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import { config } from "../config/env.js";
import { AppError } from "../middleware/errorHandler.js";

/**
 * CloudinaryService
 *
 * Backend-authoritative media storage for chat attachments (images & files).
 *
 * Design notes:
 * - Uploads happen server-side from an in-memory buffer so the Cloudinary API
 *   secret is never exposed to the browser (AGENTS.md §39 — never expose secrets).
 * - `resource_type: "auto"` lets Cloudinary classify images vs. raw files.
 * - If Cloudinary credentials are not configured, uploads fail with a clear,
 *   actionable error instead of leaking internal details.
 */

export interface CloudinaryUploadResult {
  url: string;
  secureUrl: string;
  publicId: string;
  resourceType: string;
  format: string;
  bytes: number;
  width?: number;
  height?: number;
  originalFilename?: string;
}

export class CloudinaryService {
  /** True when all required Cloudinary credentials are present. */
  static isConfigured(): boolean {
    return Boolean(
      config.cloudinary.cloudName &&
      config.cloudinary.apiKey &&
      config.cloudinary.apiSecret,
    );
  }

  /** Configure the shared Cloudinary client (idempotent). */
  private static ensureConfigured(): void {
    if (!CloudinaryService.isConfigured()) {
      throw new AppError(
        "File storage is not configured on the server. Please contact your administrator.",
        503,
        "STORAGE_NOT_CONFIGURED",
      );
    }

    cloudinary.config({
      cloud_name: config.cloudinary.cloudName,
      api_key: config.cloudinary.apiKey,
      api_secret: config.cloudinary.apiSecret,
      secure: true,
    });
  }

  /**
   * Upload a file buffer to Cloudinary.
   *
   * @param buffer        Raw file bytes (from multer memory storage).
   * @param options.originalName  Original filename (used for display + public id hint).
   * @param options.folder        Cloudinary folder override.
   */
  static async uploadBuffer(
    buffer: Buffer,
    options: { originalName?: string; folder?: string } = {},
  ): Promise<CloudinaryUploadResult> {
    CloudinaryService.ensureConfigured();

    if (!buffer || buffer.length === 0) {
      throw new AppError("Uploaded file is empty.", 400, "EMPTY_FILE");
    }

    const folder = options.folder || config.cloudinary.folder;

    return new Promise<CloudinaryUploadResult>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "auto",
          // Preserve a readable, unique public id derived from the original name.
          use_filename: true,
          unique_filename: true,
          overwrite: false,
        },
        (error, result) => {
          if (error || !result) {
            return reject(
              new AppError(
                "Failed to upload attachment to storage.",
                502,
                "UPLOAD_FAILED",
              ),
            );
          }
          resolve(CloudinaryService.normalize(result));
        },
      );

      stream.on("error", () => {
        reject(
          new AppError(
            "Failed to upload attachment to storage.",
            502,
            "UPLOAD_FAILED",
          ),
        );
      });

      stream.end(buffer);
    });
  }

  /** Best-effort deletion of a previously uploaded asset (used for cleanup). */
  static async destroy(
    publicId: string,
    resourceType = "image",
  ): Promise<void> {
    if (!CloudinaryService.isConfigured()) return;
    try {
      CloudinaryService.ensureConfigured();
      await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType as "image" | "video" | "raw",
        invalidate: true,
      });
    } catch {
      // Cleanup failures must never break the primary flow.
    }
  }

  private static normalize(result: UploadApiResponse): CloudinaryUploadResult {
    const upload = result as UploadApiResponse & {
      original_filename?: string;
    };
    return {
      url: upload.url,
      secureUrl: upload.secure_url,
      publicId: upload.public_id,
      resourceType: upload.resource_type,
      format: upload.format,
      bytes: upload.bytes,
      width: upload.width,
      height: upload.height,
      originalFilename: upload.original_filename,
    };
  }
}

export default CloudinaryService;
