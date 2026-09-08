import express from "express";
import { handleUpload } from "@vercel/blob/client";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../server/routers";
import { getAppSessionUser } from "../server/auth";
import { createContext } from "../server/_core/context";

const app = express();

// Keep API JSON requests small. Challenge images are uploaded directly from the
// browser to Vercel Blob, so they never pass through this request body parser.
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ limit: "1mb", extended: true }));

app.post("/api/upload", async (req, res) => {
  const user = await getAppSessionUser(req);
  if (!user) {
    res.status(401).json({ error: "You must be signed in to upload files." });
    return;
  }

  try {
    const body = req.body;
    const response = await handleUpload({
      body,
      request: req as unknown as Request,
      onBeforeGenerateToken: async pathname => {
        const expectedPrefix = `challenge-photos/${user.id}/`;
        if (!pathname.startsWith(expectedPrefix)) {
          throw new Error("Invalid upload path.");
        }

        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
          maximumSizeInBytes: 5 * 1024 * 1024,
          addRandomSuffix: false,
          tokenPayload: JSON.stringify({ userId: user.id }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log("[Blob] Upload completed", {
          url: blob.url,
          tokenPayload,
        });
      },
    });

    res.status(200).json(response);
  } catch (error) {
    console.error("[Blob] Upload token generation failed", error);
    res.status(400).json({ error: "Unable to prepare the file upload." });
  }
});

app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  }),
);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

export default app;
