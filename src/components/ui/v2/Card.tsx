"use client";

import * as React from "react";

/**
 * FWL Hybrid V2 — Card
 * Surface 1 (white in light / graphite #1A2129 in dark) with a 1px border
 * and a near-invisible inset highlight that gives the paper-on-table
 * feeling. Border-color animates on hover with the 120ms v2 curve.
 *
 * Variants:
 *   - default  : standard card, 14px radius
 *   - flat     : no inset highlight, used for nested cards inside another card
 *   - elevated : on the surface-2 hover wash, used for the top decision card
 *                that also hosts the italic sage .why one-liner.
 */
export interface V2CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "flat" | "elevated";
  asChild?: boolean;
}

const variants: Record<NonNullable<V2CardProps["variant"]>, string> = {
  default: "v2-card",
  flat: "bg-card border border-border rounded-v2-5",
  elevated:
    "bg-v2-surface-2 border border-border rounded-v2-5 shadow-[0_6px_18px_rgba(15,20,25,0.06)]",
};

export const V2Card = React.forwardRef<HTMLDivElement, V2CardProps>(
  ({ variant = "default", className, children, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        className={`${variants[variant]} ${className ?? ""}`}
        {...rest}
      >
        {children}
      </div>
    );
  },
);
V2Card.displayName = "V2Card";

export interface V2CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  eyebrow?: string;
}
export const V2CardHeader = React.forwardRef<HTMLDivElement, V2CardHeaderProps>(
  ({ eyebrow, className, children, ...rest }, ref) => (
    <div
      ref={ref}
      className={`flex items-start justify-between gap-3 px-4 pt-3.5 pb-2 ${className ?? ""}`}
      {...rest}
    >
      <div className="min-w-0 flex flex-col gap-0.5">
        {eyebrow ? <div className="v2-eyebrow">{eyebrow}</div> : null}
        {children}
      </div>
    </div>
  ),
);
V2CardHeader.displayName = "V2CardHeader";

export const V2CardBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...rest }, ref) => (
  <div ref={ref} className={`px-4 pb-4 ${className ?? ""}`} {...rest} />
));
V2CardBody.displayName = "V2CardBody";

export const V2CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...rest }, ref) => (
  <div
    ref={ref}
    className={`flex items-center justify-between gap-3 px-4 py-3 border-t border-border text-[12px] text-v2-text-muted ${className ?? ""}`}
    {...rest}
  />
));
V2CardFooter.displayName = "V2CardFooter";
