import type { Metadata } from "next";
import Image from "next/image";
import { LibraryBrowser, type LibraryCardItem } from "@/components/library/library-browser";
import { getLibraryResources, getSanityImageUrl } from "@/lib/sanity";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Library",
  description: "Explore Spursbase Foundation programmes, impact reports, research, stories, and practical resources.",
  alternates: { canonical: "/library" },
  openGraph: {
    title: "Library | Spursbase Foundation",
    description: "Programmes, evidence, and stories from Spursbase Foundation.",
    url: "/library",
    type: "website",
  },
};

export default async function LibraryPage() {
  const resources = await getLibraryResources();
  const cards: LibraryCardItem[] = resources.map((resource) => ({
    slug: resource.slug.current,
    title: resource.title,
    category: resource.category,
    summary: resource.summary,
    publishedAt: resource.publishedAt,
    imageUrl: getSanityImageUrl(resource.coverImage, 1000),
    imageAlt: resource.coverImage?.alt ?? "",
  }));

  return (
    <main id="main-content" className="library-page">
      <section className="library-hero page-hero">
        <Image src="/img/DSC03825.jpg" alt="Spursbase Foundation community members learning together" fill priority quality={80} sizes="100vw" />
        <div className="library-hero__shade" />
        <div className="library-hero__content">
          <p className="library-kicker">Spursbase Foundation · Knowledge &amp; impact</p>
          <h1>The Library</h1>
          <p>Programmes, evidence, and stories from the communities we work alongside.</p>
        </div>
      </section>
      <div className="library-main">
        <header className="library-heading">
          <div>
            <span className="library-section-label">Explore our work</span>
            <h2>Ideas and action, gathered in one place.</h2>
          </div>
          <p>Browse the programmes, reports, research, and resources shaping opportunity for children and families.</p>
        </header>
        <LibraryBrowser resources={cards} />
      </div>
    </main>
  );
}