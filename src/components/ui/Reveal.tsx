"use client";

import { motion, type Variants } from "framer-motion";
import { fadeUp, fadeUpSlow, fadeIn, scaleIn, staggerChildren } from "@/lib/motion";
import type { ReactNode } from "react";

type Preset = "fadeUp" | "fadeUpSlow" | "fadeIn" | "scaleIn";

const presets: Record<Preset, Variants> = {
  fadeUp,
  fadeUpSlow,
  fadeIn,
  scaleIn,
};

interface RevealProps {
  children: ReactNode;
  preset?: Preset;
  delay?: number;
  className?: string;
  amount?: number;
  once?: boolean;
  as?: "div" | "section" | "header" | "footer" | "li";
}

export function Reveal({
  children,
  preset = "fadeUp",
  delay = 0,
  className,
  amount = 0.3,
  once = true,
  as = "div",
}: RevealProps) {
  const variants = presets[preset];
  const MotionTag = motion[as] as typeof motion.div;
  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={variants}
      transition={{ delay }}
    >
      {children}
    </MotionTag>
  );
}

interface StaggerProps {
  children: ReactNode;
  stagger?: number;
  delay?: number;
  className?: string;
  once?: boolean;
  amount?: number;
}

export function Stagger({
  children,
  stagger = 0.1,
  delay = 0,
  className,
  once = true,
  amount = 0.25,
}: StaggerProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={staggerChildren(stagger, delay)}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  preset = "fadeUp",
  className,
}: {
  children: ReactNode;
  preset?: Preset;
  className?: string;
}) {
  return (
    <motion.div variants={presets[preset]} className={className}>
      {children}
    </motion.div>
  );
}
