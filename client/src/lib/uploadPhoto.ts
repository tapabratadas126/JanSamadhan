import { upload } from "@vercel/blob/client";

export type UploadedPhoto = { url: string; fileKey: string };

/**
 * Uploads an image file directly from the browser to Vercel Blob, getting a
 * short-lived token from POST /api/blob-upload first. The file bytes never
 * pass through our own server, so this isn't limited by the ~4.5 MB request
 * body cap on Vercel serverless functions.
 */
export async function uploadChallengePhoto(
  userId: number,
  file: File
): Promise<UploadedPhoto> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const pathname = `challenge-photos/${userId}/${Date.now()}-${safeName}`;

  const blob = await upload(pathname, file, {
    access: "public",
    handleUploadUrl: "/api/blob-upload",
  });

  return { url: blob.url, fileKey: blob.pathname };
}
