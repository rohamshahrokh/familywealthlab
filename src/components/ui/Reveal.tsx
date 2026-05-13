"use client";
import * as React from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { fadeUp, stagger as makeStagger, t } from "@/lib/motion";

interface RevealProps extends React.HTMLAttributes<HTMLDivElement> {
  delay?: number;
  as?: "div" | "section" | "header" | "article" | "aside";
  amount?: number;
  variants?: Variants;
}

export function Reveal({
  children,
  delay = 0,
  className,
  amount = 0.25,
  variants,
  ...props
}: RevealProps) {
  const reduce = useReducedMotion();
  if (reduce) {
    return (
      <div className={className} {...(props as React.HTMLAttributes<HTMLDivElement>)}>
        {children}
      </div>
    );
  }
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
      variants={variants ?? fadeUp}
      transition={{ ...t.base, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggerProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  amount?: number;
}

export function Stagger({
  children,
  className,
  delay = 0.06,
  amount = 0.25,
}: StaggerProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
      variants={makeStagger(delay)}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={fadeUp} className={className}>
      {children}
    </motion.div>
  );
}
