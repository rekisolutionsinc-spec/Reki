import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";
import { unstable_cache } from "next/cache";
import { getLegacyBlogPost, legacyBlogPosts } from "@/lib/legacy-blog";
import { readLocalBlogPosts, toBlogPost } from "@/lib/local-blog";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;

export const hasSanityConfig = Boolean(projectId);

const client = projectId
  ? createClient({
      projectId,
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
      apiVersion: "2026-10-19",
      useCdn: true,
      token: process.env.SANITY_API_READ_TOKEN,
    })
  : null;
const imageBuilder = client ? imageUrlBuilder(client) : null;

export type SanityImage = {
  _key?: string;
  asset?: { _ref?: string; url?: string };
  alt?: string;
};

export type SanityImageGallery = {
  images?: SanityImage[];
};

export type BlogPost = {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt?: string;
  publishedAt: string;
  mainImage?: SanityImage;
  body?: unknown[];
  programme?: string;
  focusArea?: string;
  author?: string;
  featured?: boolean;
  categoryType?: "blog" | "news";
  bodyHtml?: string;
};

export type LibraryCategory = "programmes" | "impact-reports" | "research" | "stories" | "toolkits";

export type LibraryResource = {
  _id: string;
  title: string;
  slug: { current: string };
  category: LibraryCategory;
  summary: string;
  publishedAt: string;
  coverImage?: SanityImage;
  file?: { asset?: { url?: string; originalFilename?: string } };
  externalUrl?: string;
  body?: unknown[];
};

const postsQuery = `*[_type == "post" && defined(slug.current)] | order(publishedAt desc) {
  _id, title, slug, excerpt, publishedAt, mainImage { ..., alt }, body,
  programme, focusArea, author, featured
}`;

const postBySlugQuery = `*[_type == "post" && slug.current == $slug][0] {
  _id, title, slug, excerpt, publishedAt, mainImage { ..., alt }, body,
  programme, focusArea, author, featured
}`;

const libraryResourcesQuery = `*[_type == "libraryResource" && defined(slug.current)] | order(publishedAt desc) {
  _id, title, slug, category, summary, publishedAt,
  coverImage { ..., alt },
  file { asset->{url, originalFilename} }, externalUrl
}`;

const libraryResourceBySlugQuery = `*[_type == "libraryResource" && slug.current == $slug][0] {
  _id, title, slug, category, summary, publishedAt,
  coverImage { ..., alt },
  file { asset->{url, originalFilename} }, externalUrl, body
}`;

const libraryResourceSlugsQuery = `*[_type == "libraryResource" && defined(slug.current)]{ "slug": slug.current }`;

export async function getPosts() {
  const [sanityPosts, localPosts] = await Promise.all([
    client
      ? unstable_cache(
          () => client.fetch<BlogPost[]>(postsQuery),
          ["sanity-posts"],
          { revalidate: 3600, tags: ["sanity-posts"] },
        )()
      : Promise.resolve([]),
    readLocalBlogPosts(),
  ]);
  const sanitySlugs = new Set(sanityPosts.map((post) => post.slug.current));
  return [
    ...sanityPosts,
    ...localPosts
      .filter((post) => !sanitySlugs.has(post.slug))
      .map(toBlogPost),
  ].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export async function getPostBySlug(slug: string) {
  const post = client
    ? await unstable_cache(
        () => client.fetch<BlogPost | null>(postBySlugQuery, { slug }),
        ["sanity-post", slug],
        { revalidate: 3600, tags: [`sanity-post-${slug}`] },
      )()
    : null;
  if (post) return post;
  const localPost = (await readLocalBlogPosts()).find((item) => item.slug === slug);
  return localPost ? toBlogPost(localPost) : getLegacyBlogPost(slug);
}

export async function getPostSlugs() {
  const posts = client
    ? await unstable_cache(
        () => client.fetch<Array<{ slug: string }>>(`*[_type == "post" && defined(slug.current)]{ "slug": slug.current }`),
        ["sanity-post-slugs"],
        { revalidate: 3600, tags: ["sanity-post-slugs"] },
      )()
    : [];
  const localPosts = await readLocalBlogPosts();
  const slugs = new Set(posts.map(({ slug }) => slug));
  for (const post of localPosts) slugs.add(post.slug);
  return [
    ...posts,
    ...localPosts
      .map((post) => ({ slug: post.slug }))
      .filter(({ slug }) => !posts.some((post) => post.slug === slug)),
    ...legacyBlogPosts
      .map((post) => ({ slug: post.slug.current }))
      .filter(({ slug }) => !slugs.has(slug)),
  ];
}

export async function getLibraryResources() {
  if (!client) return [];
  return unstable_cache(
    () => client.fetch<LibraryResource[]>(libraryResourcesQuery),
    ["sanity-library-resources"],
    { revalidate: 3600, tags: ["sanity-library-resources"] },
  )();
}

export async function getLibraryResourceBySlug(slug: string) {
  if (!client) return null;
  return unstable_cache(
    () => client.fetch<LibraryResource | null>(libraryResourceBySlugQuery, { slug }),
    ["sanity-library-resource", slug],
    { revalidate: 3600, tags: [`sanity-library-resource-${slug}`] },
  )();
}

export async function getLibraryResourceSlugs() {
  if (!client) return [];
  return unstable_cache(
    () => client.fetch<Array<{ slug: string }>>(libraryResourceSlugsQuery),
    ["sanity-library-resource-slugs"],
    { revalidate: 3600, tags: ["sanity-library-resource-slugs"] },
  )();
}

export function getSanityImageUrl(image: SanityImage | undefined, width: number) {
  if (!image || !imageBuilder) return undefined;
  return imageBuilder.image(image).width(width).auto("format").url();
}