"use client";

import { motion, type MotionProps } from "framer-motion";
import type { ReactNode } from "react";

const springProfile = { type: "spring", stiffness: 100, damping: 15 } as const;

type RevealProps = Omit<MotionProps, "initial" | "whileInView" | "viewport" | "transition"> & {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export function Reveal({ children, className, delay = 0, ...props }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.16 }}
      transition={{ ...springProfile, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}