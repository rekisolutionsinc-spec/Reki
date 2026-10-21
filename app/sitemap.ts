import type { MetadataRoute } from "next";
import { getLegacyRoutes } from "@/lib/legacy-pages";
import { getPostSlugs } from "@/lib/sanity";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.spursbasefoundation.org";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const currentDate = new Date();
  const staticRoutes = ["", "/blog"];
  const baseEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: route === "/blog" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
  const posts = await getPostSlugs();
  const legacyRoutes = await getLegacyRoutes();

  return [
    ...baseEntries,
    ...legacyRoutes.map(({ slug }) => ({
      url: `${siteUrl}/${slug.map(encodeURIComponent).join("/")}`,
      lastModified: currentDate,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
    ...posts.map(({ slug }) => ({
      url: `${siteUrl}/blog/${encodeURIComponent(slug)}`,
      lastModified: currentDate,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}