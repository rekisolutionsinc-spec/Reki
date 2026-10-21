"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

type Slide = {
  title: string;
  description: string;
  cta: string;
  href: string;
  image: StaticImageData;
};

type HeroCarouselProps = { slides: Slide[] };
const springProfile = { type: "spring", stiffness: 100, damping: 15 } as const;

export function HeroCarousel({ slides }: HeroCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const reduceMotion = useReducedMotion();
  const activeSlide = slides[activeIndex];

  function moveBy(offset: number) {
    setActiveIndex((index) => (index + offset + slides.length) % slides.length);
  }

  return (
    <section className="hero" aria-roledescription="carousel" aria-label="Featured messages">
      <AnimatePresence mode="wait">
        <motion.div
          className="hero__image"
          key={`image-${activeIndex}`}
          initial={{ opacity: 0, scale: reduceMotion ? 1 : 1.025 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={springProfile}
        >
          <Image src={activeSlide.image} alt="" fill priority={activeIndex === 0} quality={80} placeholder="blur" sizes="100vw" />
        </motion.div>
      </AnimatePresence>
      <div className="hero__shade" />
      <div className="hero__content">
        <AnimatePresence mode="wait">
          <motion.div
            key={`copy-${activeIndex}`}
            aria-live="polite"
            initial={{ opacity: 0, y: reduceMotion ? 0 : 22 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduceMotion ? 0 : -10 }}
            transition={{ ...springProfile, delay: reduceMotion ? 0 : 0.08 }}
          >
            <span className="eyebrow">Spursbase Foundation</span>
            <h1>{activeSlide.title}</h1>
            <p>{activeSlide.description}</p>
            <div className="hero__actions">
              <Link className="button" href={activeSlide.href}>{activeSlide.cta}<span aria-hidden="true">↗</span></Link>
              <Link className="button button--light" href="#focus">Our Programs<span aria-hidden="true">↗</span></Link>
            </div>
          </motion.div>
        </AnimatePresence>
        <div className="hero__index">Education · Health · Well-being</div>
      </div>
      <div className="hero__controls" aria-label="Featured message controls">
        <button className="hero__arrow" type="button" aria-label="Previous featured message" onClick={() => moveBy(-1)}>←</button>
        <div className="hero__dots" role="group" aria-label="Choose featured message">
          {slides.map((slide, index) => (
            <button
              key={slide.title}
              className="hero__dot"
              type="button"
              aria-label={`Show ${slide.title}`}
              aria-current={activeIndex === index ? "true" : undefined}
              onClick={() => setActiveIndex(index)}
            />
          ))}
        </div>
        <button className="hero__arrow" type="button" aria-label="Next featured message" onClick={() => moveBy(1)}>→</button>
      </div>
      <div className="hero__accent" aria-hidden="true">{activeIndex === 0 ? "Empowering Through Education" : "Hope For The Vulnerable"}</div>
    </section>
  );
}