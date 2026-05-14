import * as React from "react";
import { cn } from "@/lib/utils";

type Tone = "paper" | "inset" | "cinematic" | "dark";

const TONE: Record<Tone, string> = {
  paper: "card-surface",
  inset: "card-inset",
  cinematic: "card-cinematic",
  dark: "card-dark text-ink-ondark",
};

export interface SurfaceCardProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: Tone;
  padding?: "sm" | "md" | "lg";
  as?: React.ElementType;
}

/**
 * SurfaceCard — base container for every workspace card. Inherits the same
 * paper/ember system the landing + auth pages use, so the visual identity is
 * unbroken from public marketing into the authenticated workspace.
 */
export function SurfaceCard({
  tone = "paper",
  padding = "md",
  className,
  as,
  ...rest
}: SurfaceCardProps) {
  const Tag = (as ?? "div") as React.ElementType;
  const pad = padding === "sm" ? "p-4 sm:p-5" : padding === "lg" ? "p-6 sm:p-8" : "p-5 sm:p-6";
  return <Tag className={cn(TONE[tone], pad, className)} {...rest} />;
}

/** Eyebrow + title pair used in card headers. */
export function CardHeader({
  index,
  eyebrow,
  title,
  trailing,
  className,
}: {
  index?: string;
  eyebrow?: string;
  title?: React.ReactNode;
  trailing?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-4 mb-4", className)}>
      <div className="min-w-0">
        {(index || eyebrow) && (
          <div className="syslabel mb-2">
            {index && <span className="syslabel-bracket">{index}</span>}
            {eyebrow && <span>{eyebrow}</span>}
          </div>
        )}
        {title && <h3 className="text-body-lg sm:text-h6 font-semibold text-ink-primary tracking-tight">{title}</h3>}
      </div>
      {trailing && <div className="flex-shrink-0">{trailing}</div>}
    </div>
  );
}
