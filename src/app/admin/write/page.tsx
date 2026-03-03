"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function AdminWritePage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Upload image and insert markdown at cursor position
  const uploadImage = useCallback(async (file: File) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml", "image/avif"];
    if (!allowedTypes.includes(file.type)) {
      setMessage("지원하지 않는 이미지 형식입니다. (jpg, png, gif, webp, svg, avif)");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setMessage("파일 크기는 10MB 이하여야 합니다.");
      return;
    }

    setUploading(true);
    setMessage("");

    // Insert uploading placeholder at cursor
    const textarea = textareaRef.current;
    const placeholder = `![업로드 중...](uploading)`;
    let insertPos = content.length;
    if (textarea) {
      insertPos = textarea.selectionStart ?? content.length;
    }
    const before = content.slice(0, insertPos);
    const after = content.slice(insertPos);
    const newLine = before.length > 0 && !before.endsWith("\n") ? "\n" : "";
    setContent(before + newLine + placeholder + "\n" + after);

    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (res.ok && data.url) {
        // Replace placeholder with actual image markdown
        setContent((prev) =>
          prev.replace(placeholder, `![${file.name}](${data.url})`)
        );
      } else {
        setContent((prev) => prev.replace(newLine + placeholder + "\n", ""));
        setMessage(data.error || "이미지 업로드에 실패했습니다.");
      }
    } catch {
      setContent((prev) => prev.replace(newLine + placeholder + "\n", ""));
      setMessage("이미지 업로드 중 오류가 발생했습니다.");
    } finally {
      setUploading(false);
    }
  }, [content]);

  // Handle paste event for clipboard images
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) uploadImage(file);
          return;
        }
      }
    };

    textarea.addEventListener("paste", handlePaste);
    return () => textarea.removeEventListener("paste", handlePaste);
  }, [uploadImage]);

  useEffect(() => {
    fetch("/api/auth-check")
      .then((res) => {
        if (!res.ok) {
          router.push("/admin");
        } else {
          setAuthenticated(true);
        }
      })
      .catch(() => router.push("/admin"));
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9가-힣\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          title,
          description,
          tags: tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          content,
        }),
      });

      if (res.ok) {
        setMessage("글이 성공적으로 저장되었습니다!");
        setTitle("");
        setDescription("");
        setTags("");
        setContent("");
        setTimeout(() => router.push(`/post/${slug}`), 1500);
      } else {
        const data = await res.json();
        setMessage(data.error || "저장 중 오류가 발생했습니다.");
      }
    } catch {
      setMessage("저장 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (authenticated === null) {
    return (
      <div className="text-center py-20 text-gray-400">로딩 중...</div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">새 글 작성</h1>
        <button
          onClick={async () => {
            await fetch("/api/logout", { method: "POST" });
            router.push("/admin");
          }}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          로그아웃
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Meta fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              제목
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="글 제목을 입력하세요"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              설명
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="글에 대한 간단한 설명"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              태그
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="태그1, 태그2 (콤마 구분)"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
            />
          </div>
        </div>

        {/* Editor + Preview */}
        <div>
          {/* Tab buttons (mobile) */}
          <div className="flex md:hidden border-b border-gray-200 mb-3">
            <button
              type="button"
              onClick={() => setActiveTab("write")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "write"
                  ? "text-gray-900 border-b-2 border-gray-900"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              작성
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "preview"
                  ? "text-gray-900 border-b-2 border-gray-900"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              미리보기
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Editor */}
            <div className={`${activeTab === "preview" ? "hidden md:block" : ""}`}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                본문 (Markdown)
              </label>
              <div
                className="relative"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDragOver(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDragOver(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDragOver(false);
                  const files = e.dataTransfer.files;
                  for (const file of Array.from(files)) {
                    if (file.type.startsWith("image/")) {
                      uploadImage(file);
                    }
                  }
                }}
              >
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Markdown으로 글을 작성하세요... (이미지를 드래그하거나 붙여넣기 하세요)"
                  rows={24}
                  className={`w-full px-4 py-3 border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition resize-y leading-relaxed ${
                    dragOver
                      ? "border-blue-400 bg-blue-50 border-dashed border-2"
                      : "border-gray-200"
                  }`}
                  required
                />
                {/* Drag overlay */}
                {dragOver && (
                  <div className="absolute inset-0 flex items-center justify-center bg-blue-50/80 rounded-lg border-2 border-dashed border-blue-400 pointer-events-none">
                    <div className="text-center">
                      <svg className="mx-auto h-10 w-10 text-blue-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm font-medium text-blue-600">이미지를 놓으세요</p>
                    </div>
                  </div>
                )}
                {/* Uploading indicator */}
                {uploading && (
                  <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-full">
                    <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    업로드 중...
                  </div>
                )}
              </div>
              {/* Image upload button */}
              <div className="mt-1.5 flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files) {
                      for (const file of Array.from(files)) {
                        uploadImage(file);
                      }
                    }
                    e.target.value = "";
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  이미지 첨부 (드래그 · 붙여넣기 · 클릭)
                </button>
              </div>
            </div>

            {/* Preview */}
            <div className={`${activeTab === "write" ? "hidden md:block" : ""}`}>
              <div className="text-sm font-medium text-gray-700 mb-1">
                미리보기
              </div>
              <div className="border border-gray-200 rounded-lg px-5 py-4 min-h-[calc(24*1.75rem+1.5rem)] overflow-y-auto bg-white">
                {content ? (
                  <div className="prose">
                    {title && (
                      <h1 style={{ marginTop: 0 }}>{title}</h1>
                    )}
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-gray-300 text-sm">
                    왼쪽에 Markdown을 입력하면 여기에 미리보기가 표시됩니다.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <p
            className={`text-sm ${
              message.includes("성공") ? "text-green-600" : "text-red-500"
            }`}
          >
            {message}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          {loading ? "저장 중..." : "글 발행하기"}
        </button>
      </form>
    </div>
  );
}
