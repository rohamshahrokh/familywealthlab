"use client";
import * as React from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  stroke?: string;
  /** Soft fill below the line (rgba). Pass null to disable. */
  fill?: string | null;
  /** Show animated end-of-line dot. */
  endDot?: boolean;
  /** Sweep duration in seconds. */
  duration?: number;
  /** Delay before the draw starts. */
  delay?: number;
  /** Aria-hidden — sparklines are decorative; meaning belongs to adjacent value. */
  className?: string;
}

/**
 * Sparkline — single-line inline SVG trend curve that draws on view-enter.
 *
 * Premium minimal: 1.5px stroke, soft underline fill, faint baseline,
 * optional ember end dot. preserveAspectRatio="none" so width is fluid and
 * height stays consistent. Respects prefers-reduced-motion.
 */
export function Sparkline({
  data,
  width = 200,
  height = 56,
  stroke = "currentColor",
  fill = "rgba(20, 28, 46, 0.06)",
  endDot = true,
  duration = 1.1,
  delay = 0,
  className,
}: SparklineProps) {
  const ref = React.useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reduce = useReducedMotion();

  const padX = 2;
  const padY = 4;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const xAt = (i: number) =>
    padX + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
  const yAt = (v: number) => padY + innerH - ((v - min) / range) * innerH;

  const linePath = data
    .map((v, i) => `${i === 0 ? "M" : "L"} ${xAt(i).toFixed(2)} ${yAt(v).toFixed(2)}`)
    .join(" ");

  const fillPath =
    fill !== null
      ? `${linePath} L ${xAt(data.length - 1).toFixed(2)} ${(padY + innerH).toFixed(2)} L ${xAt(0).toFixed(2)} ${(padY + innerH).toFixed(2)} Z`
      : null;

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={cn("overflow-visible", className)}
      aria-hidden
    >
      {/* Baseline */}
      <line
        x1={padX}
        x2={width - padX}
        y1={padY + innerH}
        y2={padY + innerH}
        stroke="rgba(20,28,46,0.08)"
        strokeWidth={1}
      />

      {/* Soft fill under the line */}
      {fillPath && (
        <motion.path
          d={fillPath}
          fill={fill ?? undefined}
          initial={{ opacity: 0 }}
          animate={inView || reduce ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5, delay: reduce ? 0 : delay + duration * 0.45 }}
        />
      )}

      {/* Main line */}
      <motion.path
        d={linePath}
        fill="none"
        stroke={stroke}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        initial={{ pathLength: reduce ? 1 : 0, opacity: reduce ? 1 : 0 }}
        animate={
          inView || reduce
            ? { pathLength: 1, opacity: 1 }
            : { pathLength: 0, opacity: 0 }
        }
        transition={{
          pathLength: { duration: reduce ? 0 : duration, delay, ease: [0.22, 1, 0.36, 1] },
          opacity: { duration: 0.25, delay },
        }}
      />

      {/* End dot */}
      {endDot && (
        <motion.circle
          cx={xAt(data.length - 1)}
          cy={yAt(data[data.length - 1])}
          r={2.5}
          fill={stroke}
          initial={{ opacity: 0, scale: 0 }}
          animate={inView || reduce ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
          transition={{
            duration: 0.35,
            delay: reduce ? 0 : delay + duration * 0.9,
            ease: [0.34, 1.56, 0.64, 1],
          }}
        />
      )}
    </svg>
  );
}
