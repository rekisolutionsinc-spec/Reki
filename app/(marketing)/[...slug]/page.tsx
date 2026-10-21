import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegacyPage } from "@/components/legacy-page";
import { getLegacyPage, getLegacyRoutes } from "@/lib/legacy-pages";

export const dynamicParams = false;

type PageProps = { params: Promise<{ slug: string[] }> };

export async function generateStaticParams() {
  return getLegacyRoutes();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getLegacyPage(slug);
  if (!page) return { title: "Page not found", robots: { index: false, follow: false } };

  const canonical = `/${page.route.join("/")}`;
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical },
    openGraph: { title: page.title, description: page.description, url: canonical, type: "website" },
    twitter: { card: "summary_large_image", title: page.title, description: page.description },
  };
}

export default async function LegacyRoutePage({ params }: PageProps) {
  const { slug } = await params;
  const page = await getLegacyPage(slug);
  if (!page) notFound();

  return (
    <main id="main-content" className="legacy-route">
      <LegacyPage html={page.html} stylesheets={page.stylesheets} />
    </main>
  );
}