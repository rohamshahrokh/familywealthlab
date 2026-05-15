"use client";

import * as React from "react";

/**
 * FWL Hybrid V2 — Button
 * Four restrained variants, single canonical 120ms transition curve.
 *
 *   primary  : filled slate accent button, used for the one primary action
 *              on any screen.
 *   warmth   : filled sage button, used VERY sparingly for "Apply decision"
 *              moments on the decision engine.
 *   ghost    : transparent on hover-only surface, used for back / cancel.
 *   subtle   : on surface-2 wash, used for filter toggles and segmented
 *              control segments when not active.
 */
export type V2ButtonVariant = "primary" | "warmth" | "ghost" | "subtle";
export type V2ButtonSize = "sm" | "md";

const sizeClasses: Record<V2ButtonSize, string> = {
  sm: "h-7 px-2.5 text-[12px] rounded-v2-2",
  md: "h-8 px-3 text-[13px] rounded-v2-2",
};

const variantClasses: Record<V2ButtonVariant, string> = {
  primary:
    "bg-v2-accent text-white hover:bg-v2-accent-strong shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]",
  warmth:
    "bg-v2-warmth text-white hover:bg-v2-warmth-strong shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]",
  ghost:
    "bg-transparent text-v2-text-muted hover:text-v2-text-strong hover:bg-v2-surface-2",
  subtle:
    "bg-v2-surface-2 text-v2-text-strong border border-border hover:bg-v2-surface-3",
};

export interface V2ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: V2ButtonVariant;
  size?: V2ButtonSize;
}

export const V2Button = React.forwardRef<HTMLButtonElement, V2ButtonProps>(
  ({ variant = "primary", size = "md", className, ...rest }, ref) => (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center gap-1.5 font-medium tabular-nums transition-colors duration-v2 ease-v2 focus-ring disabled:opacity-50 disabled:pointer-events-none ${sizeClasses[size]} ${variantClasses[variant]} ${className ?? ""}`}
      {...rest}
    />
  ),
);
V2Button.displayName = "V2Button";
