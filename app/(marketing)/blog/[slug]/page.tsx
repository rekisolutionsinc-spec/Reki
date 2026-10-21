import type { Metadata } from "next";
import Image from "next/image";
import { PortableText } from "@portabletext/react";
import parse from "html-react-parser";
import sanitizeHtml from "sanitize-html";
import { notFound } from "next/navigation";
import Link from "next/link";
import { legacyBlogPosts } from "@/lib/legacy-blog";
import { getPostBySlug, getPosts, getPostSlugs, getSanityImageUrl, type BlogPost, type SanityImage, type SanityImageGallery } from "@/lib/sanity";
import "../blog.css";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

type PageProps = { params: Promise<{ slug: string }> };

const programmeLabels: Record<string, string> = {
  education: "Education",
  "health-wellbeing": "Health & Wellbeing",
  "community-development": "Community Development",
  "policy-advocacy": "Policy & Advocacy",
};

function getCoverImage(post: BlogPost, width: number) {
  return getSanityImageUrl(post.mainImage, width) ?? post.mainImage?.asset?.url;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export async function generateStaticParams() {
  const posts = await getPostSlugs();
  return posts.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Story not found", robots: { index: false, follow: false } };

  const image = getCoverImage(post, 1200);
  return {
    title: post.title,
    description: post.excerpt ?? "Updates from Spursbase Foundation.",
    alternates: { canonical: `/blog/${post.slug.current}` },
    openGraph: {
      type: "article",
      url: `/blog/${post.slug.current}`,
      title: post.title,
      description: post.excerpt ?? "Updates from Spursbase Foundation.",
      publishedTime: post.publishedAt,
      ...(image ? { images: [{ url: image, alt: post.mainImage?.alt ?? post.title }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt ?? "Updates from Spursbase Foundation.",
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const [post, publishedPosts] = await Promise.all([getPostBySlug(slug), getPosts()]);
  if (!post) notFound();

  const coverImage = getCoverImage(post, 1600);
  const coverBlur = getSanityImageUrl(post.mainImage, 32);
  const knownSlugs = new Set(publishedPosts.map((item) => item.slug.current));
  const relatedPosts = [
    ...publishedPosts,
    ...legacyBlogPosts.filter((item) => !knownSlugs.has(item.slug.current)),
  ]
    .filter((item) => item.slug.current !== slug)
    .sort((a, b) => Number((b.programme === post.programme)) - Number((a.programme === post.programme)) || b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, 3);
  const portableTextComponents = {
    types: {
      image: ({ value }: { value: SanityImage }) => {
        const src = getSanityImageUrl(value, 1400);
        const blurDataURL = getSanityImageUrl(value, 32);
        if (!src) return null;
        return (
          <figure className="article-inline-image">
            <Image src={src} alt={value.alt ?? ""} width={1400} height={900} quality={80} {...(blurDataURL ? { placeholder: "blur" as const, blurDataURL } : {})} sizes="(max-width: 760px) 90vw, 720px" />
            {value.alt && <figcaption>{value.alt}</figcaption>}
          </figure>
        );
      },
      imageGallery: ({ value }: { value: SanityImageGallery }) => {
        const images = (value.images ?? []).flatMap((image) => {
          const src = getSanityImageUrl(image, 1000) ?? image.asset?.url;
          return src ? [{ image, src, blurDataURL: getSanityImageUrl(image, 32) }] : [];
        });
        if (!images.length) return null;

        return (
          <div className="article-image-gallery" data-count={images.length}>
            {images.map(({ image, src, blurDataURL }, index) => (
              <figure className="article-image-gallery__item" key={image._key ?? image.asset?._ref ?? index}>
                <Image src={src} alt={image.alt ?? ""} fill quality={80} {...(blurDataURL ? { placeholder: "blur" as const, blurDataURL } : {})} sizes="(max-width: 760px) 90vw, 720px" />
                {image.alt && <figcaption>{image.alt}</figcaption>}
              </figure>
            ))}
          </div>
        );
      },
    },
    marks: {
      link: ({ children, value }: { children: React.ReactNode; value?: { href?: string } }) => (
        <a href={value?.href} target={value?.href?.startsWith("http") ? "_blank" : undefined} rel={value?.href?.startsWith("http") ? "noreferrer" : undefined}>{children}</a>
      ),
    },
  };

  return (
    <main id="main-content" className="article-page">
      <article className="article-story">
        {coverImage && (
          <figure className="article-story__cover">
            <Image src={coverImage} alt={post.mainImage?.alt ?? post.title} fill priority quality={80} {...(coverBlur ? { placeholder: "blur" as const, blurDataURL: coverBlur } : {})} sizes="100vw" />
          </figure>
        )}
        <nav className="article-breadcrumbs" aria-label="Breadcrumb">
          <ol>
            <li><Link href="/">Home</Link></li>
            <li><Link href="/blog">Blog</Link></li>
            <li aria-current="page">{post.title}</li>
          </ol>
        </nav>
        <header className="article-story__header">
          <span className="article-story__programme">
            {post.categoryType === "news" ? "News" : programmeLabels[post.programme ?? ""] ?? "Spursbase Foundation"}
          </span>
          <h1>{post.title}</h1>
          {post.excerpt && <p className="article-story__excerpt">{post.excerpt}</p>}
          <div className="article-story__meta">
            <span>{post.author ?? "Spursbase Foundation"}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
          </div>
        </header>
        <div className="article-story__body prose prose-lg">
          {post.bodyHtml
            ? parse(sanitizeHtml(post.bodyHtml, {
                allowedTags: [
                  "p", "h2", "h3", "h4", "ul", "ol", "li", "blockquote",
                  "strong", "b", "em", "i", "a", "figure", "figcaption", "img", "br",
                ],
                allowedAttributes: {
                  a: ["href", "name", "target", "rel"],
                  img: ["src", "alt", "width", "height"],
                },
                allowedSchemes: ["https", "mailto"],
              }))
            : <PortableText value={post.body as never} components={portableTextComponents} />}
        </div>
        <footer className="article-story__footer">
          <p>More stories from Spursbase Foundation</p>
          <Link href="/blog">Explore all stories</Link>
        </footer>
      </article>

      {relatedPosts.length > 0 && (
        <aside className="article-related" aria-labelledby="related-stories-title">
          <div className="article-related__heading">
            <span>Keep exploring</span>
            <h2 id="related-stories-title">More stories</h2>
          </div>
          <div className="article-related__grid">
            {relatedPosts.map((item) => {
              const image = getCoverImage(item, 640);
              return (
                <Link href={`/blog/${item.slug.current}`} className="article-related-card" key={item._id}>
                  {image && <span className="article-related-card__image"><Image src={image} alt={item.mainImage?.alt ?? ""} fill sizes="(max-width: 700px) 80vw, 300px" /></span>}
                  <span className="article-related-card__programme">{programmeLabels[item.programme ?? ""] ?? "Story"}</span>
                  <strong>{item.title}</strong>
                  <span className="article-related-card__link">Read story</span>
                </Link>
              );
            })}
          </div>
        </aside>
      )}
    </main>
  );
}