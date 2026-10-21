import { readFile } from "node:fs/promises";
import path from "node:path";
import type { BlogPost } from "@/lib/sanity";

export type LocalBlogPost = {
  id: string;
  slug: string;
  type: "blog" | "news";
  title: string;
  program: string;
  focusArea: string;
  image: string;
  excerpt: string;
  body: string;
  publishedAt: string;
  dateLabel: string;
  author: string;
};

const postsFile = path.join(process.cwd(), "data", "posts.json");

function isLocalBlogPost(value: unknown): value is LocalBlogPost {
  if (!value || typeof value !== "object") return false;
  const post = value as Record<string, unknown>;
  return typeof post.id === "string"
    && typeof post.slug === "string"
    && (post.type === "blog" || post.type === "news")
    && typeof post.title === "string"
    && typeof post.program === "string"
    && typeof post.focusArea === "string"
    && typeof post.image === "string"
    && typeof post.excerpt === "string"
    && typeof post.body === "string"
    && typeof post.publishedAt === "string"
    && typeof post.dateLabel === "string"
    && typeof post.author === "string";
}

export async function readLocalBlogPosts(): Promise<LocalBlogPost[]> {
  let contents: string;
  try {
    contents = await readFile(postsFile, "utf8");
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") return [];
    throw error;
  }

  const data: unknown = JSON.parse(contents);
  if (!Array.isArray(data) || !data.every(isLocalBlogPost)) {
    throw new Error("data/posts.json must contain a valid array of blog posts.");
  }
  return data;
}

export function toBlogPost(post: LocalBlogPost): BlogPost {
  return {
    _id: post.id,
    title: post.title,
    slug: { current: post.slug },
    excerpt: post.excerpt,
    publishedAt: post.publishedAt,
    programme: post.program,
    focusArea: post.focusArea,
    author: post.author,
    categoryType: post.type,
    bodyHtml: post.body,
    mainImage: {
      alt: post.title,
      asset: { url: post.image },
    },
    body: [],
  };
}
