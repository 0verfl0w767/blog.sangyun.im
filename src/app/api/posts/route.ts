import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { savePost } from "@/lib/posts";

export async function POST(request: NextRequest) {
  const authed = await isAuthenticated();

  if (!authed) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { slug, title, description, tags, content } = await request.json();

    if (!slug || !title || !content) {
      return NextResponse.json(
        { error: "제목과 본문은 필수입니다." },
        { status: 400 },
      );
    }

    const date = new Date().toISOString().split("T")[0];

    savePost(
      slug,
      { title, date, description: description || "", tags: tags || [] },
      content,
    );

    return NextResponse.json({ success: true, slug });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
