"use client";
import * as React from "react";
import { motion, useInView, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LiveValueProps {
  /** Anchor / starting target. */
  to: number;
  /** Format options. */
  prefix?: string;
  suffix?: string;
  decimals?: number;
  separator?: boolean;
  /** Initial reveal duration. */
  duration?: number;
  /** Delay before initial reveal. */
  delay?: number;
  /**
   * If set, after the initial reveal the value drifts inside ±jitter every
   * `tickMs`. Used for the LIVE feel on counters that should not feel frozen.
   */
  jitter?: number;
  tickMs?: number;
  /** Visual pulse on update. */
  pulseColor?: string;
  className?: string;
}

function formatNumber(n: number, decimals: number, separator: boolean) {
  const fixed = n.toFixed(decimals);
  if (!separator) return fixed;
  const [int, dec] = fixed.split(".");
  const withSep = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return dec ? `${withSep}.${dec}` : withSep;
}

/**
 * LiveValue — counter that animates to `to` on scroll-in, then optionally
 * drifts inside ±`jitter` every `tickMs` to simulate live data.
 *
 * The drift is small (e.g. ±0.5K on a $2.41M number), preserves digit count,
 * and respects prefers-reduced-motion (in which case the value stays static).
 */
export function LiveValue({
  to,
  prefix = "",
  suffix = "",
  decimals = 0,
  separator = true,
  duration = 1.4,
  delay = 0,
  jitter,
  tickMs = 3200,
  pulseColor = "rgba(201, 112, 48, 0.45)",
  className,
}: LiveValueProps) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reduce = useReducedMotion();

  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 70, damping: 22, duration: duration * 1000 });
  const display = useTransform(spring, (v) =>
    `${prefix}${formatNumber(v, decimals, separator)}${suffix}`
  );
  const [text, setText] = React.useState(
    `${prefix}${formatNumber(0, decimals, separator)}${suffix}`
  );
  const [pulse, setPulse] = React.useState(0);

  React.useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setText(`${prefix}${formatNumber(to, decimals, separator)}${suffix}`);
      return;
    }
    const id = setTimeout(() => mv.set(to), delay * 1000);
    return () => clearTimeout(id);
  }, [inView, to, mv, prefix, suffix, decimals, separator, delay, reduce]);

  React.useEffect(() => {
    if (reduce) return;
    const unsub = display.on("change", (v) => setText(v));
    return () => unsub();
  }, [display, reduce]);

  // Drift after initial reveal (only if jitter provided and motion allowed)
  React.useEffect(() => {
    if (!inView || reduce || jitter == null) return;
    const settleMs = (delay + duration) * 1000 + 200;
    let cancelled = false;
    let timerId: ReturnType<typeof setInterval> | null = null;
    const start = setTimeout(() => {
      if (cancelled) return;
      timerId = setInterval(() => {
        const drift = (Math.random() - 0.5) * 2 * jitter;
        mv.set(to + drift);
        setPulse((p) => p + 1);
      }, tickMs);
    }, settleMs);
    return () => {
      cancelled = true;
      clearTimeout(start);
      if (timerId) clearInterval(timerId);
    };
  }, [inView, reduce, jitter, tickMs, to, mv, delay, duration]);

  return (
    <span ref={ref} className={cn("relative inline-block", className)}>
      <motion.span
        key={pulse}
        initial={{ color: pulseColor }}
        animate={{ color: "currentColor" }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      >
        {text}
      </motion.span>
    </span>
  );
}
