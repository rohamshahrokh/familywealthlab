import * as React from "react";
import { cn } from "@/lib/utils";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  /** vertical padding rhythm — generous by default */
  spacing?: "sm" | "md" | "lg" | "xl";
}

export function Section({
  className,
  spacing = "lg",
  children,
  ...props
}: SectionProps) {
  const pad =
    spacing === "sm" ? "py-16 sm:py-20"
    : spacing === "md" ? "py-20 sm:py-28"
    : spacing === "lg" ? "py-28 sm:py-36"
    : "py-32 sm:py-44";
  return (
    <section className={cn("relative", pad, className)} {...props}>
      <div className="container mx-auto">{children}</div>
    </section>
  );
}

interface EyebrowProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}

export function Eyebrow({ className, children, ...props }: EyebrowProps) {
  return (
    <span className={cn("section-eyebrow", className)} {...props}>
      {children}
    </span>
  );
}
