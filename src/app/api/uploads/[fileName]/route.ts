import { readFile } from "fs/promises";
import { join } from "path";
import { NextResponse } from "next/server";

function getContentType(fileName: string) {
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
      return "application/octet-stream";
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ fileName: string }> },
) {
  try {
    const { fileName } = await params;
    const filePath = join(process.cwd(), "uploads", decodeURIComponent(fileName));
    const content = await readFile(filePath);
    const total = content.length;
    const contentType = getContentType(fileName);
    const range = request.headers.get("range");

    if (!range) {
      return new NextResponse(content, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Content-Length": String(total),
          "Accept-Ranges": "bytes",
        },
      });
    }

    const [startPart, endPart] = range.replace("bytes=", "").split("-");
    const start = Number.parseInt(startPart, 10);
    const end = endPart ? Number.parseInt(endPart, 10) : total - 1;

    if (Number.isNaN(start) || start < 0 || start >= total || start > end) {
      return new NextResponse(null, {
        status: 416,
        headers: {
          "Content-Range": `bytes */${total}`,
          "Accept-Ranges": "bytes",
        },
      });
    }

    const chunk = content.subarray(start, end + 1);

    return new NextResponse(chunk, {
      status: 206,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(chunk.length),
        "Content-Range": `bytes ${start}-${end}/${total}`,
        "Accept-Ranges": "bytes",
      },
    });
  } catch (error) {
    console.error("Fetch failed:", error);
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
