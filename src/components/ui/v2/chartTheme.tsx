"use client";

import * as React from "react";

/**
 * FWL Hybrid V2 — Recharts theme adapter.
 *
 * Centralises the v2 colour + axis + grid + tooltip styling so Recharts
 * surfaces can read from CSS variables instead of inlining hex values.
 * That means dark/light theme switches Just Work without re-running the
 * chart, and the palette stays consistent across the 25 chart surfaces.
 *
 * Usage:
 *   <CartesianGrid {...v2GridProps()} />
 *   <XAxis {...v2AxisProps()} />
 *   <YAxis {...v2AxisProps()} />
 *   <Line stroke={v2ChartColors.slate} />
 *   <Tooltip contentStyle={v2TooltipContentStyle()} cursor={v2TooltipCursorProps()} />
 */

// Hex values are mirrored from canonical _tokens.css so we don't rely on
// runtime CSSOM reads (which would force a paint pass on every render).
// These are the *dark* values — light-mode rendering is handled by the
// `useV2ChartColors` hook which reads the active theme.
export const v2ChartColors = {
  slate: "var(--v2-chart-1-resolved, #86A6CD)",   // chart-1
  sage: "var(--v2-chart-2-resolved, #A6C2A8)",    // chart-2
  tan: "var(--v2-chart-3-resolved, #B8A06E)",     // chart-3
  clay: "var(--v2-chart-4-resolved, #B07A75)",    // chart-4
  // Discrete hex (light + dark) for places where var() isn't accepted
  // (e.g., react-flow handle styles or canvas fallbacks).
  slateDark: "#86A6CD",
  slateLight: "#3F5C84",
  sageDark: "#A6C2A8",
  sageLight: "#557158",
  tanDark: "#B8A06E",
  tanLight: "#8C7536",
  clayDark: "#B07A75",
  clayLight: "#8A4F49",
} as const;

/**
 * Resolve a v2 colour against the currently active theme. Returns the
 * value at render time so theme switches re-render correctly. Falls back
 * to the dark palette on SSR.
 */
export function useV2ChartColors() {
  const [isDark, setIsDark] = React.useState(true);

  React.useEffect(() => {
    if (typeof document === "undefined") return;
    const html = document.documentElement;
    const update = () => setIsDark(html.classList.contains("dark"));
    update();
    const observer = new MutationObserver(update);
    observer.observe(html, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return {
    isDark,
    slate: isDark ? v2ChartColors.slateDark : v2ChartColors.slateLight,
    sage: isDark ? v2ChartColors.sageDark : v2ChartColors.sageLight,
    tan: isDark ? v2ChartColors.tanDark : v2ChartColors.tanLight,
    clay: isDark ? v2ChartColors.clayDark : v2ChartColors.clayLight,
    grid: isDark ? "rgba(255,255,255,0.035)" : "rgba(15,20,25,0.05)",
    axis: isDark ? "#6E7785" : "#6F7682",
    text: isDark ? "#8B95A2" : "#5D6571",
    tooltipBg: isDark ? "#1A2129" : "#FFFFFF",
    tooltipBorder: isDark ? "#232A33" : "#DDD9CC",
  };
}

/** CartesianGrid props — softer 0.035 alpha, no vertical lines by default. */
export function v2GridProps(opts?: { vertical?: boolean }) {
  return {
    stroke: "currentColor",
    strokeOpacity: 0.18,
    strokeDasharray: "0",
    vertical: opts?.vertical ?? false,
  } as const;
}

/** XAxis / YAxis props — minimal tick line, subtle axis colour. */
export function v2AxisProps() {
  return {
    stroke: "currentColor",
    tick: { fill: "currentColor", fontSize: 11, opacity: 0.65 },
    tickLine: false,
    axisLine: { stroke: "currentColor", strokeOpacity: 0.18 },
  } as const;
}

/** Recharts tooltip container — calm card, soft border, single layer. */
export function v2TooltipContentStyle(isDark = true): React.CSSProperties {
  return {
    background: isDark ? "#1A2129" : "#FFFFFF",
    border: `1px solid ${isDark ? "#232A33" : "#DDD9CC"}`,
    borderRadius: 10,
    boxShadow: isDark
      ? "0 4px 14px rgba(0,0,0,0.35)"
      : "0 6px 18px rgba(15,20,25,0.06)",
    color: isDark ? "#E8EBF0" : "#1A1F26",
    fontSize: 12,
    padding: "8px 10px",
  };
}

/** Recharts tooltip cursor — faint vertical guide, no fill. */
export function v2TooltipCursorProps() {
  return {
    stroke: "currentColor",
    strokeOpacity: 0.18,
    strokeWidth: 1,
    strokeDasharray: "2 4",
  } as const;
}
