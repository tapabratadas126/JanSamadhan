import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";
import { registerBlobUploadRoute } from "../server/blobUpload";

const app = express();

// All large files bypass this API and go directly from the browser to Vercel Blob.
// Keep the API body limit small so normal tRPC requests stay well below Vercel's limit.
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ limit: "1mb", extended: true }));

app.get("/api/health", (_req, res) => {
  res.status(200).json({ ok: true });
});

registerBlobUploadRoute(app);

app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  }),
);

export default app;
