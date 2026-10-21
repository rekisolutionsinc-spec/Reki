import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegacyPage } from "@/components/legacy-page";
import { getLegacyPage } from "@/lib/legacy-pages";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getLegacyPage(["impact"]);
  return {
    title: page?.title ?? "Our Impact",
    description: page?.description,
  };
}

export default async function ImpactPage() {
  const page = await getLegacyPage(["impact"]);
  if (!page) notFound();

  return (
    <main id="main-content" className="legacy-route legacy-route--impact">
      <LegacyPage html={page.html} stylesheets={page.stylesheets} />
    </main>
  );
}
