import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

interface SectionProps extends HTMLAttributes<HTMLElement> {
  as?: "section" | "div" | "article";
  bleed?: boolean;
}

/** Shared section wrapper that enforces consistent vertical rhythm. */
export function Section({
  className,
  as: Tag = "section",
  bleed = false,
  children,
  ...props
}: SectionProps) {
  return (
    <Tag
      className={cn(
        "relative w-full",
        bleed ? "" : "py-24 sm:py-32 lg:py-40",
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

export function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 text-eyebrow uppercase text-ink-300",
        className
      )}
    >
      <span className="block h-px w-6 bg-gradient-to-r from-transparent via-accent to-transparent" />
      <span>{children}</span>
    </div>
  );
}
