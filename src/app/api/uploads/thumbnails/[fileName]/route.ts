import { readFile } from "fs/promises";
import { join } from "path";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ fileName: string }> },
) {
  try {
    const { fileName } = await params;
    const filePath = join(process.cwd(), "uploads", "thumbnails", decodeURIComponent(fileName));

    const image = await readFile(filePath);

    return new NextResponse(image, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Thumbnail not found" }, { status: 404 });
  }
}