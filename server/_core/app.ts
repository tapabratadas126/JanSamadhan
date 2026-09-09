import { createExpressMiddleware } from "@trpc/server/adapters/express";
import express, { type Express } from "express";
import { registerBlobUpload } from "../blobUpload";
import { appRouter } from "../routers";
import { createContext } from "./context";

/**
 * Builds the Express app with just the API surface (JSON body parsing,
 * the Blob upload endpoint, and tRPC). Static file serving / Vite dev
 * middleware is layered on separately by server/_core/index.ts for local
 * development — on Vercel, static files are served directly by the
 * platform, not by this app.
 */
export function createApp(): Express {
  const app = express();

  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ limit: "10mb", extended: true }));

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  registerBlobUpload(app);

  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  return app;
}
