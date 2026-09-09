// File storage helpers backed by Vercel Blob.
//
// Challenge photos are uploaded directly from the browser to Vercel Blob
// (see server/blobUpload.ts + client/src/lib/uploadPhoto.ts) so large images
// never pass through a serverless function's request body. This module is
// kept around for any server-side storage needs (e.g. deleting a blob when
// a challenge photo is removed).

import { del } from "@vercel/blob";
import { ENV } from "./_core/env";

export async function storageDelete(url: string): Promise<void> {
  await del(url, { token: ENV.blobReadWriteToken || undefined });
}
