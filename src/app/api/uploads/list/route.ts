import { readdir, stat } from "fs/promises";
import { join } from "path";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const uploadDir = join(process.cwd(), "uploads");
    const entries = await readdir(uploadDir, { withFileTypes: true });

    const files = await Promise.all(
      entries
        .filter((entry) => entry.isFile() && !entry.name.startsWith("."))
        .map(async (entry) => {
          const filePath = join(uploadDir, entry.name);
          const { size } = await stat(filePath);

          return {
            name: entry.name,
            size,
            url: `/api/uploads/${encodeURIComponent(entry.name)}`,
            thumbnail:
              /.(mp4|webm|mov|mkv|avi)$/i.test(entry.name)
                ? `/api/uploads/thumbnails/${encodeURIComponent(`${entry.name}.png`)}`
                : null,
          };
        }),
    );

    files.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({ ok: true, files });
  } catch (error) {
    console.error("List uploads failed:", error);
    return NextResponse.json(
      { ok: false, error: "Could not list uploads" },
      { status: 500 },
    );
  }
}