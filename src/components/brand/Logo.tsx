import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showWordmark?: boolean;
}

/**
 * Family Wealth Lab mark.
 * Geometry: a stacked aperture / lens — three concentric arcs converging
 * into a single point. Reads as "focus, intelligence, alignment."
 */
export function Logo({ className, showWordmark = true }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)} aria-label="Family Wealth Lab">
      <svg
        viewBox="0 0 32 32"
        width="28"
        height="28"
        fill="none"
        aria-hidden="true"
        className="text-accent"
      >
        <defs>
          <linearGradient id="fwl-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FF6B00" />
            <stop offset="100%" stopColor="#FFC857" />
          </linearGradient>
        </defs>
        <circle cx="16" cy="16" r="14" stroke="url(#fwl-grad)" strokeWidth="1.5" opacity="0.35" />
        <circle cx="16" cy="16" r="9" stroke="url(#fwl-grad)" strokeWidth="1.5" opacity="0.7" />
        <circle cx="16" cy="16" r="3.5" fill="url(#fwl-grad)" />
      </svg>
      {showWordmark && (
        <span className="font-display text-[15px] font-semibold tracking-tight text-ink-50">
          Family Wealth Lab
        </span>
      )}
    </span>
  );
}
