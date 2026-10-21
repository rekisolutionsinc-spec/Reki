import Link from "next/link";
import { LegacyPage } from "@/components/legacy-page";
import { ImpactMap } from "@/components/home/impact-map";
import { getLegacyHomepage } from "@/lib/legacy-pages";

export default async function HomePage() {
  const homepage = await getLegacyHomepage();

  return (
    <main id="main-content" className="legacy-route legacy-route--home">
      <LegacyPage html={homepage.html} stylesheets={homepage.stylesheets} />
      <section className="section map-section home-map">
        <div className="map-copy">
          <span className="home-section-label">Where we work</span>
          <h2>Rooted in Ghana, growing through community</h2>
          <p>Our work begins with local relationships. Explore our Accra office and the communities where our programmes are active.</p>
          <Link className="text-link" href="/impact">Explore our impact <span aria-hidden="true">→</span></Link>
        </div>
        <ImpactMap />
      </section>
      <section className="section section--paper home-partners">
        <div className="section-heading">
          <span className="home-section-label">Our partners</span>
          <h2>Shared work, lasting change</h2>
          <p>We work alongside organisations that share our commitment to education equity and child wellbeing.</p>
        </div>
        <div className="partner-row" aria-label="Spursbase Foundation partners">
          <span>Aaenics Engineering</span>
          <span>Turf Device</span>
          <span>C3 Ignite Church</span>
          <span>Love Land Foundation</span>
          <span>Benchmark Marketing</span>
          <span>Ezer International</span>
        </div>
      </section>
    </main>
  );
}
