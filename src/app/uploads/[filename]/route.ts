import { NextRequest, NextResponse } from "next/server";
import { imageMimeTypes, uploadDir } from "@/lib/uploads";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

interface Props {
  params: Promise<{ filename: string }>;
}

export async function GET(_request: NextRequest, { params }: Props) {
  const { filename } = await params;

  if (!filename || filename.includes("..") || filename.includes("/")) {
    return new NextResponse("Invalid file name", { status: 400 });
  }

  const filePath = path.join(uploadDir, filename);

  if (!existsSync(filePath)) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const ext = path.extname(filename).toLowerCase();
  const contentType = imageMimeTypes[ext] || "application/octet-stream";
  const data = await readFile(filePath);

  return new NextResponse(data, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
