"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

export type BlogCardData = {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  programme: string;
  focusArea: string;
  categoryType: "blog" | "news";
  imageUrl: string;
  imageAlt: string;
  featured: boolean;
};

const programmes = [
  ["education", "Education"],
  ["health-wellbeing", "Health & Wellbeing"],
  ["community-development", "Community Development"],
  ["policy-advocacy", "Policy & Advocacy"],
] as const;

const focusAreas = [
  ["education-access", "Education access"],
  ["literacy", "Literacy"],
  ["girls-education", "Girls' education"],
  ["girls-in-stem", "Girls in STEM"],
  ["menstrual-health", "Menstrual health"],
  ["health-awareness", "Health awareness"],
  ["community-engagement", "Community engagement"],
  ["youth-skills", "Youth skills"],
  ["child-wellbeing", "Child wellbeing"],
] as const;

const labels = new Map<string, string>([...programmes, ...focusAreas]);

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function BlogBrowser({ posts }: { posts: BlogCardData[] }) {
  const [search, setSearch] = useState("");
  const [categoryType, setCategoryType] = useState("");
  const [programme, setProgramme] = useState("");
  const [focusArea, setFocusArea] = useState("");

  const filteredPosts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return posts.filter((post) => {
      const matchesQuery = !query || [post.title, post.excerpt, labels.get(post.programme), labels.get(post.focusArea)]
        .some((value) => value?.toLocaleLowerCase().includes(query));
      const matchesCategory = !categoryType || post.categoryType === categoryType;
      const matchesProgramme = !programme || post.programme === programme;
      const matchesFocus = !focusArea || post.focusArea === focusArea;
      return matchesQuery && matchesCategory && matchesProgramme && matchesFocus;
    });
  }, [categoryType, focusArea, posts, programme, search]);

  function clearFilters() {
    setSearch("");
    setCategoryType("");
    setProgramme("");
    setFocusArea("");
  }

  const hasFilters = Boolean(search || categoryType || programme || focusArea);

  return (
    <section className="blog-explorer" aria-label="Browse stories">
      <aside className="blog-filters" aria-label="Filter stories">
        <div className="blog-filters__heading">
          <div>
            <span className="blog-filters__eyebrow">Spursbase Foundation</span>
            <h2>Blog</h2>
          </div>
        </div>

        <label className="blog-filter-field">
          <span>Category type</span>
          <select value={categoryType} onChange={(event) => setCategoryType(event.target.value)}>
            <option value="">All categories</option>
            <option value="blog">Blog story</option>
            <option value="news">News flash</option>
          </select>
        </label>

        <label className="blog-filter-field">
          <span>Programme</span>
          <select value={programme} onChange={(event) => setProgramme(event.target.value)}>
            <option value="">All programmes</option>
            {programmes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>

        <label className="blog-filter-field">
          <span>Focus area</span>
          <select value={focusArea} onChange={(event) => setFocusArea(event.target.value)}>
            <option value="">All focus areas</option>
            {focusAreas.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>

        <label className="blog-filter-field">
          <span>Keyword</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search stories"
          />
        </label>

        {hasFilters && <button className="blog-filters__clear" type="button" onClick={clearFilters}>Clear filters</button>}
      </aside>

      <div className="blog-results">
        <div className="blog-results__heading">
          <div>
            <span className="blog-results__eyebrow">From our communities</span>
            <h2>Latest stories</h2>
          </div>
          <p aria-live="polite">{filteredPosts.length} {filteredPosts.length === 1 ? "story" : "stories"}</p>
        </div>

        {filteredPosts.length ? (
          <div className="blog-grid blog-card-grid">
            {filteredPosts.map((post) => (
              <article className="blog-card blog-story-card" key={post.slug}>
                <Link className="blog-story-card__image" href={`/blog/${post.slug}`} aria-label={`Read ${post.title}`}>
                  <Image src={post.imageUrl} alt={post.imageAlt} fill quality={80} sizes="(max-width: 740px) 100vw, (max-width: 1100px) 50vw, 40vw" />
                  {post.featured && <span className="blog-story-card__featured">Featured story</span>}
                </Link>
                <div className="blog-story-card__body">
                  <span className={`blog-story-card__tag${post.categoryType === "news" ? " is-news" : ""}`}>
                    {post.categoryType === "news" ? "News" : "Blog"}
                  </span>
                  <h3><Link href={`/blog/${post.slug}`}>{post.title}</Link></h3>
                  <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="blog-empty">
            <h3>No stories found</h3>
            <p>Try a different search or clear the filters to see all stories.</p>
            <button className="blog-filters__clear" type="button" onClick={clearFilters}>Show all stories</button>
          </div>
        )}
      </div>
    </section>
  );
}
