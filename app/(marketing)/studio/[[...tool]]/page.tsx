import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Content Studio",
  robots: { index: false, follow: false },
};

export default function StudioPage() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const studioUrl = process.env.NEXT_PUBLIC_SANITY_STUDIO_URL ?? (projectId ? `https://${projectId}.sanity.studio` : null);

  return (
    <main id="main-content" className="studio-setup">
      <div className="studio-setup__intro">
        <span className="eyebrow">Spursbase Foundation</span>
        <h1>Stories, managed with care.</h1>
        <p>Create and publish field stories in Sanity Studio. The blog listing and each full article update from published CMS content.</p>
      </div>
      <section className="studio-guide" aria-labelledby="studio-guide-title">
        <h2 id="studio-guide-title">Publishing a story</h2>
        <ol>
          <li><strong>Create an Article.</strong> Add a clear title, excerpt, publication date, author or team, and a URL slug.</li>
          <li><strong>Choose its programme and focus area.</strong> These fields power the blog filters. There is no country filter.</li>
          <li><strong>Add a cover image and descriptive alt text.</strong> Use a strong landscape image and write what it shows.</li>
          <li><strong>Write the story.</strong> Use short paragraphs and subheadings. Add inline images or links where they help readers.</li>
          <li><strong>Preview, then publish.</strong> Mark a story as featured only when it should lead the listing.</li>
        </ol>
        <p>Drafts stay in the Studio. Published articles appear in News &amp; Stories and open on their own page.</p>
      </section>
      {studioUrl ? (
        <a className="button button--dark studio-setup__action" href={studioUrl} target="_blank" rel="noreferrer">Open Content Studio <span aria-hidden="true">↗</span></a>
      ) : (
        <p className="studio-setup__notice">To enable publishing, set <code>NEXT_PUBLIC_SANITY_PROJECT_ID</code> and <code>NEXT_PUBLIC_SANITY_DATASET</code>, then deploy the Sanity Studio. Set <code>NEXT_PUBLIC_SANITY_STUDIO_URL</code> to its address.</p>
      )}
    </main>
  );
}