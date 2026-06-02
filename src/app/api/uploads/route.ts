import { mkdir, writeFile } from "fs/promises";
import { execFile } from "child_process";
import { promisify } from "util";
import { join } from "path";
import { NextResponse } from "next/server";

const execFileAsync = promisify(execFile);

function isVideo(fileName: string) {
  return /\.(mp4|webm|mov|mkv|avi)$/i.test(fileName);
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
    const thumbDir = join(uploadDir, "thumbnails");

    await mkdir(uploadDir, { recursive: true });
    await mkdir(thumbDir, { recursive: true });

    const filePath = join(uploadDir, safeFileName);
    await writeFile(filePath, bytes);

    let thumbnailUrl = null;

    if (isVideo(file.name)) {
      const thumbPath = join(thumbDir, `${safeFileName}.png`);

      try {
        const ffmpegPath =
            process.env.FFMPEG_PATH ||
            "/opt/homebrew/bin/ffmpeg" ||
            "/usr/local/bin/ffmpeg" ||
            "ffmpeg";

            await execFileAsync(ffmpegPath, [
            "-y",
            "-i", filePath,
            "-frames:v", "1",
            "-an",
            "-vf", "scale=160:90",
            thumbPath,
            ]);
        thumbnailUrl = `/api/uploads/thumbnails/${encodeURIComponent(`${safeFileName}.png`)}`;
        console.log("Thumbnail generated at:", thumbPath);
      } catch (err) {
        console.error("Thumbnail generation failed:", err);
      }
    }

    return NextResponse.json({
      ok: true,
      fileName: safeFileName,
      originalName: file.name,
      size: bytes.length,
      thumbnailUrl,
    });
  } catch (error) {
    console.error("Upload failed:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}