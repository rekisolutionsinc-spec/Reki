import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main-content" className="legacy-not-found">
      <p className="legacy-not-found__code">404 · Page not found</p>
      <h1>We couldn&apos;t find that page.</h1>
      <p>The address may have changed or the page may no longer be available.</p>
      <Link className="button" href="/">Return to homepage</Link>
    </main>
  );
}