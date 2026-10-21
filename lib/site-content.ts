import type { StaticImageData } from "next/image";
import DSC00324 from "@/img/DSC00324.jpg";
import DSC00380 from "@/img/DSC00380.jpg";
import DSC03298 from "@/img/DSC03298.jpg";
import DSC03304 from "@/img/DSC03304.jpg";
import DSC03825 from "@/img/DSC03825.jpg";
import DSC04221 from "@/img/DSC04221.jpg";
import DSC05087 from "@/img/DSC05087.jpg";
import DSC05295 from "@/img/DSC05295.jpg";
import DSC05721 from "@/img/DSC05721.jpg";
import IMG0005 from "@/img/IMG_0005.jpg";
import IMG2263 from "@/img/IMG_2263.jpg";
import paintTomorrow from "@/img/Screenshot 2025-06-12 at 7.27.47 PM.png";
import ruralChallenge from "@/img/Website card.jpg";
import runForChange from "@/img/Web.jpg";

export type FocusArea = {
  title: string;
  description: string;
  image: StaticImageData;
  href: string;
};

export const heroSlides = [
  {
    title: "Hope For The Vulnerable",
    description:
      "Spursbase Foundation works to bridge the gap in education, health, and well-being for children and families facing hardship.",
    cta: "Learn More",
    href: "/about",
    image: DSC03825,
  },
  {
    title: "Empowering Through Education",
    description: "We provide educational opportunities for children in underserved communities.",
    cta: "Our Programs",
    href: "#focus",
    image: DSC05087,
  },
  {
    title: "Join Us In Making An Impact",
    description: "Your support can help transform lives and build stronger communities.",
    cta: "Get Involved",
    href: "#give",
    image: IMG0005,
  },
];

export const focusAreas: FocusArea[] = [
  {
    title: "Education Support",
    description: "Providing school fees, supplies, and scholarships to vulnerable children.",
    image: DSC03298,
    href: "/education",
  },
  {
    title: "Healthcare Access",
    description: "Offering health education, medical supplies, and access to care.",
    image: DSC00380,
    href: "/health",
  },
  {
    title: "Child Protection",
    description: "Protecting the future of our beneficiaries.",
    image: DSC05295,
    href: "/programs",
  },
  {
    title: "Community Empowerment",
    description: "Engaging with families and communities to foster supportive environments.",
    image: DSC04221,
    href: "/community",
  },
];

export const impactMetrics = [
  { value: 110406, label: "Children supported" },
  { value: 100, label: "Volunteer base" },
  { value: 10, label: "Projects completed" },
  { value: 35, label: "Communities reached" },
];

export const newsItems = [
  {
    title: "Run For Change",
    date: "2026-09-26",
    href: "/run4change",
    image: runForChange,
  },
  {
    title: "Paint Tomorrow",
    date: "2025-09-20",
    href: "/paintmorrow",
    image: paintTomorrow,
  },
  {
    title: "Rural Community Innovation Challenge (RCIC26)",
    date: "2026-06-26",
    href: "/innovation",
    image: ruralChallenge,
  },
];

export const introPhotos = [
  { image: IMG2263, alt: "Empowered child" },
  { image: DSC03304, alt: "Education" },
  { image: DSC00324, alt: "Support" },
];

export const impactBackdrop = DSC05721;