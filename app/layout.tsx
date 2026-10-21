import type { Metadata, Viewport } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.spursbasefoundation.org";
const legacyShellStylesheets = [
  "/legacy-assets/css/base.css?v=20261019-6",
  "/legacy-assets/css/header.css?v=20261019-6",
  "/legacy-assets/css/footer.css?v=20261019-6",
];

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Spursbase Foundation | Hope For The Vulnerable",
    template: "%s | Spursbase Foundation",
  },
  description:
    "Spursbase Foundation works to bridge the gap in education, health, and well-being for children and families facing hardship.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Spursbase Foundation",
    title: "Spursbase Foundation | Hope For The Vulnerable",
    description:
      "Education + Support = Empowered Life. Together, we can empower the next generation.",
    images: [{ url: "/img/DSC03825.jpg", width: 1600, height: 1067, alt: "Spursbase Foundation community work" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Spursbase Foundation | Hope For The Vulnerable",
    description:
      "Education + Support = Empowered Life. Together, we can empower the next generation.",
    images: ["/img/DSC03825.jpg"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2b2b88",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": ["NGO", "NonprofitOrganization"],
    name: "Spursbase Foundation",
    url: siteUrl,
    description:
      "Empowering vulnerable children and families through education, healthcare, and community development.",
    email: "info@spursbasefoundation.org",
    telephone: "+233203769832",
    address: {
      "@type": "PostalAddress",
      streetAddress: "GA-414-3438, La Bawaleshie, East Legon",
      addressLocality: "Accra",
      addressCountry: "GH",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 5.6037,
      longitude: -0.187,
    },
    sameAs: [
      "https://x.com/Spursbase_F",
      "https://www.facebook.com/spursbasefoundation",
      "https://www.instagram.com/spursbasefoundation/",
      "https://www.youtube.com/@SpursbaseFoundation",
      "https://www.linkedin.com/in/spursbase-foundationi-8560b8287/",
    ],
  };

  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">Skip to content</a>
        {legacyShellStylesheets.map((href) => <link key={href} rel="stylesheet" href={href} />)}
        <SiteHeader />
        {children}
        <SiteFooter />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </body>
    </html>
  );
}