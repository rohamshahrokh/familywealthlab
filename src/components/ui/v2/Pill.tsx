"use client";

import * as React from "react";

/**
 * FWL Hybrid V2 — Pill
 * Small metadata chip. Variants map to v2 semantic colours.
 */
export interface V2PillProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: "neutral" | "pos" | "neg" | "accent";
}

const toneClasses: Record<NonNullable<V2PillProps["tone"]>, string> = {
  neutral: "v2-pill",
  pos: "v2-pill v2-pill-pos",
  neg: "v2-pill v2-pill-neg",
  accent: "v2-pill v2-pill-accent",
};

export function V2Pill({
  tone = "neutral",
  className,
  children,
  ...rest
}: V2PillProps) {
  return (
    <span className={`${toneClasses[tone]} ${className ?? ""}`} {...rest}>
      {children}
    </span>
  );
}
