import type { Express } from "express";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { getAppSessionUser } from "./auth";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

/**
 * Token endpoint for browser -> Vercel Blob client uploads.
 * The browser never sends the image through a Vercel Function.
 */
export function registerBlobUploadRoute(app: Express) {
  app.post("/api/blob-upload", async (req, res) => {
    try {
      const user = await getAppSessionUser(req);
      if (!user) {
        res.status(401).json({ error: "Please login" });
        return;
      }

      const body = req.body as HandleUploadBody;

      const response = await handleUpload({
        body,
        request: req,
        onBeforeGenerateToken: async (pathname, _clientPayload, multipart) => {
          const expectedPrefix = `challenge-photos/${user.id}/`;
          if (!pathname.startsWith(expectedPrefix)) {
            throw new Error("Invalid upload path");
          }

          return {
            allowedContentTypes: ALLOWED_TYPES,
            maximumSizeInBytes: MAX_IMAGE_BYTES,
            addRandomSuffix: false,
            tokenPayload: JSON.stringify({ userId: user.id, pathname, multipart: Boolean(multipart) }),
          };
        },
        onUploadCompleted: async () => {
          // The challenge mutation stores the returned Blob URL in TiDB.
          // Nothing needs to be written here because the upload and DB mutation
          // are intentionally separate operations.
        },
      });

      res.status(200).json(response);
    } catch (error) {
      console.error("[Blob] Upload token error:", error);
      res.status(400).json({
        error: error instanceof Error ? error.message : "Blob upload failed",
      });
    }
  });
}
