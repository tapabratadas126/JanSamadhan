import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import type { Express, Request, Response } from "express";
import { getAppSessionUser } from "./auth";
import { ENV } from "./_core/env";

const ALLOWED_CONTENT_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Registers POST /api/blob-upload, which the browser calls (via
 * `@vercel/blob/client`'s `upload()`) to get a short-lived token to upload a
 * challenge photo directly to Vercel Blob. The actual file bytes never pass
 * through this server / serverless function, which matters because Vercel
 * serverless functions cap request bodies at 4.5 MB — too small for several
 * 5 MB photos sent together.
 */
export function registerBlobUpload(app: Express) {
  app.post("/api/blob-upload", async (req: Request, res: Response) => {
    const user = await getAppSessionUser(req);
    if (!user) {
      res.status(401).json({ error: "Please sign in to upload photos." });
      return;
    }

    try {
      const jsonResponse = await handleUpload({
        body: req.body as HandleUploadBody,
        request: req,
        token: ENV.blobReadWriteToken || undefined,
        onBeforeGenerateToken: async pathname => {
          // Restrict uploads to this user's own folder so one signed-in
          // user can't overwrite another user's challenge photos.
          if (!pathname.startsWith(`challenge-photos/${user.id}/`)) {
            throw new Error("Invalid upload path for this user.");
          }

          return {
            allowedContentTypes: ALLOWED_CONTENT_TYPES,
            maximumSizeInBytes: MAX_UPLOAD_BYTES,
            addRandomSuffix: true,
          };
        },
      });

      res.json(jsonResponse);
    } catch (error) {
      console.error("[BlobUpload] failed:", error);
      res.status(400).json({
        error: error instanceof Error ? error.message : "Upload failed",
      });
    }
  });
}
