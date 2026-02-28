"use client";

import { useState, useEffect } from "react";
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
  const router = useRouter();

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
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Markdown으로 글을 작성하세요..."
                rows={24}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition resize-y leading-relaxed"
                required
              />
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
