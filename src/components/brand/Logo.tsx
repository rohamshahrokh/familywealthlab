import * as React from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  /** Render the "Family Wealth Lab" wordmark next to the mark. */
  withWordmark?: boolean;
  /** Pixel size of the mark (height). Wordmark scales relative to this. */
  size?: number;
  /** Light surface → dark ink. Dark surface → paper ink. Default: light. */
  tone?: "light" | "dark";
  /**
   * "mark"     — tree-in-circle, calm & emblematic (works at any size)
   * "full"     — same mark with chart/arrow accent (≥48 px, brand surfaces)
   * default: mark
   */
  variant?: "mark" | "full";
}

/**
 * Family Wealth Lab — primary brand mark.
 *
 * A calm, family-office emblem: a stylised tree growing inside a complete
 * circle, with subtle amber leaves at the canopy. The "full" variant adds
 * a small ascending-line accent at the base for marketing/login moments.
 *
 * Theme-aware:
 *   - Structural strokes/fills use `currentColor`, driven by `tone`.
 *   - Amber accent is `#F5A623` on dark, `#C5841A` on light (WCAG AA).
 *
 * Background is always transparent — no baked rectangle.
 */
export function Logo({
  className,
  withWordmark = false,
  size = 22,
  tone = "light",
  variant = "mark",
}: LogoProps) {
  const onDark = tone === "dark";
  const inkColor = onDark ? "#FFFFFF" : "#0B0F1A";
  const amber = onDark ? "#F5A623" : "#C5841A";

  return (
    <span
      className={cn("inline-flex items-center gap-2.5", className)}
      style={{ color: inkColor }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Family Wealth Lab"
        className="shrink-0"
      >
        {variant === "full" ? (
          <FullMark amber={amber} />
        ) : (
          <CircleMark amber={amber} />
        )}
      </svg>

      {withWordmark && (
        <span
          className={cn(
            "inline-flex items-baseline gap-1.5 select-none",
            "font-serif tracking-tight",
          )}
        >
          <span
            className="text-body-sm font-semibold leading-none"
            style={{ color: inkColor, letterSpacing: "0.01em" }}
          >
            Family Wealth
          </span>
          <span
            className="text-[0.6875rem] font-semibold leading-none tracking-[0.22em] uppercase"
            style={{ color: amber }}
          >
            Lab
          </span>
        </span>
      )}
    </span>
  );
}

// ─── Sub-marks ─────────────────────────────────────────────────────────────

/**
 * Calm tree-in-circle mark.
 *
 * Geometry locked to a 64×64 canvas:
 *   • Circle frame, 24 r, 1.75 stroke, centred at (32,32)
 *   • Single trunk rectangle from y=34 → y=48, centred on x=32
 *   • Two root spreads at the base (subtle V)
 *   • Canopy = 5 ellipse leaves in an upward triangular cluster
 *   • Two of the canopy leaves render in amber for warmth
 *
 * Designed to read clearly at 16px (favicon) and stay calm at 96px (login).
 */
function CircleMark({ amber }: { amber: string }) {
  return (
    <>
      {/* Complete circle frame */}
      <circle
        cx="32"
        cy="32"
        r="24"
        stroke="currentColor"
        strokeWidth="1.75"
        fill="none"
      />

      {/* Roots — gentle V at the base of the trunk */}
      <path
        d="M 26 49 Q 30 48 31.5 46"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 38 49 Q 34 48 32.5 46"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Trunk */}
      <rect
        x="30.5"
        y="32"
        width="3"
        height="16"
        rx="0.6"
        fill="currentColor"
      />

      {/* Canopy — five rounded leaves, two amber.
          Sized to fit comfortably inside the upper half of the circle. */}
      {/* Top leaf */}
      <ellipse cx="32" cy="16" rx="4" ry="5.5" fill={amber} />
      {/* Upper-left */}
      <ellipse
        cx="25"
        cy="20"
        rx="4"
        ry="5"
        fill="currentColor"
        transform="rotate(-22 25 20)"
      />
      {/* Upper-right */}
      <ellipse
        cx="39"
        cy="20"
        rx="4"
        ry="5"
        fill={amber}
        transform="rotate(22 39 20)"
      />
      {/* Lower-left */}
      <ellipse
        cx="23"
        cy="27"
        rx="4.5"
        ry="5"
        fill="currentColor"
        transform="rotate(-30 23 27)"
      />
      {/* Lower-right */}
      <ellipse
        cx="41"
        cy="27"
        rx="4.5"
        ry="5"
        fill="currentColor"
        transform="rotate(30 41 27)"
      />
      {/* Centre-back leaf (anchors the canopy) */}
      <ellipse cx="32" cy="24" rx="5" ry="6" fill="currentColor" />
    </>
  );
}

/**
 * Full lockup — tree mark with a small ascending line at the base, for
 * marketing surfaces (login, splash, reports header). Calmer than a chart.
 */
function FullMark({ amber }: { amber: string }) {
  return (
    <>
      <CircleMark amber={amber} />
      {/* Subtle ascending growth line at the very bottom of the circle */}
      <path
        d="M 16 54 L 26 52 L 34 53 L 44 50 L 50 49"
        stroke={amber}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.85"
      />
    </>
  );
}
