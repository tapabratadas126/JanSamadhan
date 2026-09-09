import "dotenv/config";
import { createApp } from "../server/_core/app";

// Vercel's Node.js runtime treats a default-exported Express app as a
// request handler: it calls app(req, res) directly, so there is no
// app.listen() here — that's only needed for the local dev server in
// server/_core/index.ts.
export default createApp();
