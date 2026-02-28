import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";

const contentDir = path.join(process.cwd(), "content");

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
}

export interface Post extends PostMeta {
  contentHtml: string;
}

function ensureContentDir() {
  if (!fs.existsSync(contentDir)) {
    fs.mkdirSync(contentDir, { recursive: true });
  }
}

export function getAllPosts(): PostMeta[] {
  ensureContentDir();
  const files = fs.readdirSync(contentDir).filter((f) => f.endsWith(".md"));

  const posts = files.map((filename) => {
    const slug = filename.replace(/\.md$/, "");
    const filePath = path.join(contentDir, filename);
    const fileContents = fs.readFileSync(filePath, "utf-8");
    const { data } = matter(fileContents);

    return {
      slug,
      title: (data.title as string) || slug,
      date: (data.date as string) || "",
      description: (data.description as string) || "",
      tags: (data.tags as string[]) || [],
    };
  });

  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  ensureContentDir();
  const filePath = path.join(contentDir, `${slug}.md`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const fileContents = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(fileContents);

  const processedContent = await remark()
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeHighlight)
    .use(rehypeStringify)
    .process(content);

  const contentHtml = processedContent.toString();

  return {
    slug,
    title: (data.title as string) || slug,
    date: (data.date as string) || "",
    description: (data.description as string) || "",
    tags: (data.tags as string[]) || [],
    contentHtml,
  };
}

export function getAllSlugs(): string[] {
  ensureContentDir();
  return fs
    .readdirSync(contentDir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}

export function savePost(
  slug: string,
  frontmatter: Omit<PostMeta, "slug">,
  content: string,
) {
  ensureContentDir();
  const filePath = path.join(contentDir, `${slug}.md`);
  const md = matter.stringify(content, {
    title: frontmatter.title,
    date: frontmatter.date,
    description: frontmatter.description,
    tags: frontmatter.tags,
  });
  fs.writeFileSync(filePath, md, "utf-8");
}
