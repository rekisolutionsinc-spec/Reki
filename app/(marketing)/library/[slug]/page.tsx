import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PortableText } from "@portabletext/react";
import { notFound } from "next/navigation";
import { getLibraryResourceBySlug, getLibraryResourceSlugs, getSanityImageUrl, type SanityImage } from "@/lib/sanity";

export const revalidate = 3600;
export const dynamicParams = true;

type PageProps = { params: Promise<{ slug: string }> };

const categoryLabels: Record<string, string> = {
  programmes: "Programmes",
  "impact-reports": "Impact reports",
  research: "Research & insights",
  stories: "Stories",
  toolkits: "Guides & toolkits",
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export async function generateStaticParams() {
  const resources = await getLibraryResourceSlugs();
  return resources.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const resource = await getLibraryResourceBySlug(slug);
  if (!resource) return { title: "Resource not found", robots: { index: false, follow: false } };

  const description = resource.summary;
  const image = getSanityImageUrl(resource.coverImage, 1200);
  return {
    title: resource.title,
    description,
    alternates: { canonical: `/library/${resource.slug.current}` },
    openGraph: {
      title: resource.title,
      description,
      url: `/library/${resource.slug.current}`,
      type: "article",
      ...(image ? { images: [{ url: image, alt: resource.coverImage?.alt ?? resource.title }] } : {}),
    },
  };
}

export default async function LibraryResourcePage({ params }: PageProps) {
  const { slug } = await params;
  const resource = await getLibraryResourceBySlug(slug);
  if (!resource) notFound();

  const coverImage = getSanityImageUrl(resource.coverImage, 1500);
  const blurImage = getSanityImageUrl(resource.coverImage, 32);
  const bodyComponents = {
    types: {
      image: ({ value }: { value: SanityImage }) => {
        const src = getSanityImageUrl(value, 1200);
        const blurDataURL = getSanityImageUrl(value, 32);
        if (!src) return null;
        return (
          <figure className="article-inline-image">
            <Image src={src} alt={value.alt ?? ""} width={1200} height={800} quality={80} placeholder="blur" blurDataURL={blurDataURL} sizes="(max-width: 820px) 100vw, 720px" />
            {value.alt && <figcaption>{value.alt}</figcaption>}
          </figure>
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
    <main id="main-content" className="article-shell library-resource-page">
      <article>
        <Link className="library-back-link" href="/library">← Back to the Library</Link>
        <p className="eyebrow">{categoryLabels[resource.category] ?? "Library resource"}</p>
        <h1>{resource.title}</h1>
        <p className="article-date"><time dateTime={resource.publishedAt}>{formatDate(resource.publishedAt)}</time></p>
        {coverImage && (
          <div className="article-cover">
            <Image src={coverImage} alt={resource.coverImage?.alt ?? ""} fill priority quality={80} placeholder="blur" blurDataURL={blurImage} sizes="(max-width: 820px) 100vw, 820px" />
          </div>
        )}
        <p className="article-excerpt">{resource.summary}</p>
        {(resource.file?.asset?.url || resource.externalUrl) && (
          <p className="library-resource-action">
            <a className="button button--dark" href={resource.file?.asset?.url ?? resource.externalUrl} target="_blank" rel="noreferrer">
              {resource.file?.asset?.url ? "Download resource" : "Open related page"}<span aria-hidden="true">↗</span>
            </a>
          </p>
        )}
        {resource.body?.length ? (
          <div className="prose prose-lg">
            <PortableText value={resource.body as never} components={bodyComponents} />
          </div>
        ) : null}
      </article>
    </main>
  );
}