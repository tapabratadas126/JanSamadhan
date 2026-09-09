import { put } from "@vercel/blob";

function normalizeKey(relKey: string) {
  return relKey.replace(/^\/+/, "");
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream",
): Promise<{ key: string; url: string }> {
  const key = `${normalizeKey(relKey)}-${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
  const body = typeof data === "string"
    ? new Blob([data], { type: contentType })
    : new Blob([data as BlobPart], { type: contentType });

  const blob = await put(key, body, {
    access: "public",
    addRandomSuffix: false,
  });

  return { key: blob.pathname, url: blob.url };
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  return { key, url: key };
}

export async function storageGetSignedUrl(relKey: string): Promise<string> {
  throw new Error(`Signed URLs are not used for JanSamadhan public media: ${relKey}`);
}
