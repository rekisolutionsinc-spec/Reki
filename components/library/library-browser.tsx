"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { LibraryCategory } from "@/lib/sanity";

export type LibraryCardItem = {
  slug: string;
  title: string;
  category: LibraryCategory;
  summary: string;
  publishedAt: string;
  imageUrl?: string;
  imageAlt: string;
};

const categories: Array<{ value: LibraryCategory | "all"; label: string }> = [
  { value: "all", label: "All resources" },
  { value: "programmes", label: "Programmes" },
  { value: "impact-reports", label: "Impact reports" },
  { value: "research", label: "Research & insights" },
  { value: "stories", label: "Stories" },
  { value: "toolkits", label: "Guides & toolkits" },
];

const categoryLabels = Object.fromEntries(categories.map(({ value, label }) => [value, label])) as Record<LibraryCategory, string>;

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export function LibraryBrowser({ resources }: { resources: LibraryCardItem[] }) {
  const [activeCategory, setActiveCategory] = useState<LibraryCategory | "all">("all");
  const [search, setSearch] = useState("");
  const normalizedSearch = search.trim().toLocaleLowerCase();
  const filteredResources = resources.filter((resource) => {
    const matchesCategory = activeCategory === "all" || resource.category === activeCategory;
    const matchesSearch = !normalizedSearch || `${resource.title} ${resource.summary} ${categoryLabels[resource.category]}`
      .toLocaleLowerCase()
      .includes(normalizedSearch);
    return matchesCategory && matchesSearch;
  });

  return (
    <section className="library-browser" aria-label="Browse library resources">
      <div className="library-toolbar">
        <label className="library-search">
          <span className="sr-only">Search the library</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search reports, programmes, and stories"
          />
        </label>
        <p className="library-result-count" aria-live="polite">
          {filteredResources.length} {filteredResources.length === 1 ? "resource" : "resources"}
        </p>
      </div>

      <div className="library-filters" role="group" aria-label="Filter by category">
        {categories.map(({ value, label }) => (
          <button
            key={value}
            className="library-filter"
            type="button"
            aria-pressed={activeCategory === value}
            onClick={() => setActiveCategory(value)}
          >
            {label}
          </button>
        ))}
      </div>

      {filteredResources.length ? (
        <div className="library-grid">
          {filteredResources.map((resource) => (
            <article className="library-card" key={resource.slug}>
              <Link className="library-card__link" href={`/library/${resource.slug}`}>
                <span className="library-card__image">
                  {resource.imageUrl ? (
                    <Image src={resource.imageUrl} alt={resource.imageAlt} fill quality={80} sizes="(max-width: 680px) 100vw, (max-width: 1000px) 50vw, 33vw" />
                  ) : <span className="library-card__image-placeholder" aria-hidden="true" />}
                  <span className="library-card__category">{categoryLabels[resource.category]}</span>
                </span>
                <span className="library-card__content">
                  <time dateTime={resource.publishedAt}>{formatDate(resource.publishedAt)}</time>
                  <span className="library-card__title">{resource.title}</span>
                  <span className="library-card__summary">{resource.summary}</span>
                  <span className="library-card__more">Explore resource <span aria-hidden="true">↗</span></span>
                </span>
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <p className="library-empty" role="status">
          {resources.length ? "No resources match your search. Try another term or category." : "The library is being prepared. Please check back soon."}
        </p>
      )}
    </section>
  );
}