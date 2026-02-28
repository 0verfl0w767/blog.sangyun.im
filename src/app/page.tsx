import Link from "next/link";
import { getAllPosts } from "@/lib/posts";

export const revalidate = 0;

export default function HomePage() {
  const posts = getAllPosts();

  return (
    <div className="max-w-3xl mx-auto">
      <section className="mb-12">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Blog</h1>
        <p className="text-gray-500">
          개발과 기술에 대한 이야기를 나누는 공간입니다.
        </p>
      </section>

      {posts.length === 0 ? (
        <p className="text-gray-400 text-center py-20">
          아직 작성된 글이 없습니다.
        </p>
      ) : (
        <div className="space-y-1">
          {posts.map((post) => (
            <article key={post.slug}>
              <Link
                href={`/post/${post.slug}`}
                className="block group py-5 -mx-4 px-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <h2 className="text-lg font-semibold group-hover:text-blue-600 transition-colors">
                    {post.title}
                  </h2>
                  <time className="text-sm text-gray-400 shrink-0">
                    {formatDate(post.date)}
                  </time>
                </div>
                {post.description && (
                  <p className="mt-1 text-gray-500 text-sm line-clamp-2">
                    {post.description}
                  </p>
                )}
                {post.tags.length > 0 && (
                  <div className="mt-2 flex gap-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
