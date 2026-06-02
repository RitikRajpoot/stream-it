import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { NextResponse } from "next/server";

function getContentType(fileName: string, fallback: string) {
  const extension = fileName.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "mp4":
      return "video/mp4";
    case "webm":
      return "video/webm";
    case "mov":
      return "video/quicktime";
    case "mkv":
      return "video/x-matroska";
    case "avi":
      return "video/x-msvideo";
    default:
      return fallback;
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const safeFileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const uploadDir = join(process.cwd(), "uploads");
    const contentType = getContentType(file.name, file.type || "application/octet-stream");

    await mkdir(uploadDir, { recursive: true });
    const filePath = join(uploadDir, safeFileName);

    await writeFile(filePath, bytes);

    return NextResponse.json({
      ok: true,
      fileName: safeFileName,
      originalName: file.name,
      size: bytes.length,
      contentType,
    });
  } catch (error) {
    console.error("Upload failed:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
