"use client";

import { animate, motion, useInView, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";

type MetricCounterProps = {
  value: number;
  label: string;
};

export function MetricCounter({ value, label }: MetricCounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.6 });
  const count = useMotionValue(0);
  const springCount = useSpring(count, { stiffness: 100, damping: 18 });
  const formatted = useTransform(springCount, (current) => Math.round(current).toLocaleString("en"));

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(count, value, { duration: 1.8, ease: "easeOut" });
    return () => controls.stop();
  }, [count, isInView, value]);

  return (
    <div className="metric" ref={ref}>
      <span className="sr-only">{value.toLocaleString("en")} {label}</span>
      <motion.span className="metric__value" aria-hidden="true">{formatted}</motion.span>
      <span className="metric__label" aria-hidden="true">{label}</span>
    </div>
  );
}