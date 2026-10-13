import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { put } from "@vercel/blob";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const ext = path.extname(file.name) || ".jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;

  // Look for BLOB_READ_WRITE_TOKEN or any store-prefixed token like JAN_SAMADHAN_BLOB_READ_WRITE_TOKEN
  const blobToken =
    process.env.BLOB_READ_WRITE_TOKEN ||
    Object.entries(process.env).find(([k]) => k.endsWith("READ_WRITE_TOKEN"))?.[1];

  // If Vercel Blob token is configured (e.g. deployed on Vercel), upload to Vercel Blob
  if (blobToken) {
    try {
      const blob = await put(`uploads/${filename}`, file, {
        access: "public",
        token: blobToken,
      });
      return NextResponse.json({ url: blob.url });
    } catch (blobError: any) {
      console.error("Vercel Blob upload failed:", blobError);
      return NextResponse.json(
        { error: blobError?.message || "Failed to upload image to blob storage" },
        { status: 500 }
      );
    }
  }


  // Fallback to local filesystem for offline development without Vercel Blob token
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);

    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch (fsError) {
    console.error("Local file upload failed:", fsError);
    return NextResponse.json(
      { error: "Failed to save file locally" },
      { status: 500 }
    );
  }
}

