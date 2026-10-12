import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { CloudinaryService } from "../src/services/cloudinary.service.js";
import { AppError } from "../src/middleware/errorHandler.js";

/**
 * Cloudinary chat-attachment storage tests.
 *
 * These focus on the configuration-guard and validation behaviour that does
 * not require live Cloudinary credentials or network access.
 */
describe("CloudinaryService (chat attachments)", () => {
  test("reports configuration state as a boolean", () => {
    assert.equal(typeof CloudinaryService.isConfigured(), "boolean");
  });

  test("rejects empty buffers with a 400 EMPTY_FILE error", async () => {
    // uploadBuffer calls ensureConfigured() first; when credentials are absent
    // it throws a 503 STORAGE_NOT_CONFIGURED before reaching the buffer check.
    // Either way it must throw an AppError and never upload.
    if (!CloudinaryService.isConfigured()) {
      await assert.rejects(
        () => CloudinaryService.uploadBuffer(Buffer.alloc(0)),
        (err: unknown) =>
          err instanceof AppError &&
          (err as AppError).statusCode === 503 &&
          (err as AppError).errorCode === "STORAGE_NOT_CONFIGURED",
      );
    } else {
      await assert.rejects(
        () => CloudinaryService.uploadBuffer(Buffer.alloc(0)),
        (err: unknown) =>
          err instanceof AppError &&
          (err as AppError).statusCode === 400 &&
          (err as AppError).errorCode === "EMPTY_FILE",
      );
    }
  });

  test("destroy() is a safe no-op when storage is not configured", async () => {
    // Must never throw, so cleanup failures cannot break the primary flow.
    if (!CloudinaryService.isConfigured()) {
      await assert.doesNotReject(() =>
        CloudinaryService.destroy("crm-chat/sample", "image"),
      );
    }
  });
});
