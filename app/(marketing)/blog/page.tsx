import type { Metadata } from "next";
import Image from "next/image";
import { BlogBrowser, type BlogCardData } from "@/components/blog/blog-browser";
import { legacyBlogPosts } from "@/lib/legacy-blog";
import { getPosts, getSanityImageUrl, type BlogPost } from "@/lib/sanity";
import "./blog.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "News & Stories",
  description: "Updates on Spursbase Foundation projects, events, and community impact.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "News & Stories | Spursbase Foundation",
    description: "Updates on Spursbase Foundation projects, events, and community impact.",
    url: "/blog",
    type: "website",
  },
};

function toBlogCard(post: BlogPost): BlogCardData | null {
  const imageUrl = getSanityImageUrl(post.mainImage, 1200) ?? post.mainImage?.asset?.url;
  if (!imageUrl) return null;

  return {
    slug: post.slug.current,
    title: post.title,
    excerpt: post.excerpt ?? "",
    publishedAt: post.publishedAt,
    programme: post.programme ?? "",
    focusArea: post.focusArea ?? "",
    categoryType: post.categoryType ?? "blog",
    imageUrl,
    imageAlt: post.mainImage?.alt ?? post.title,
    featured: post.featured ?? false,
  };
}

export default async function BlogPage() {
  const publishedPosts = await getPosts();
  const knownSlugs = new Set(publishedPosts.map((post) => post.slug.current));
  const posts = [
    ...publishedPosts,
    ...legacyBlogPosts.filter((post) => !knownSlugs.has(post.slug.current)),
  ].sort((a, b) => Number(b.featured ?? false) - Number(a.featured ?? false) || b.publishedAt.localeCompare(a.publishedAt));
  const cards = posts.map(toBlogCard).filter((post): post is BlogCardData => post !== null);

  return (
    <main id="main-content" className="blog-page">
      <section className="blog-hero page-hero" aria-labelledby="blog-title">
        <Image
          src="/img/IMG_0093.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
        />
        <div className="blog-hero__shade" />
        <div className="blog-hero__content">
          <h1 id="blog-title">Stories from the field</h1>
          <p>Learning, dignity, and community-led change.</p>
        </div>
      </section>
      <BlogBrowser posts={cards} />
    </main>
  );
}