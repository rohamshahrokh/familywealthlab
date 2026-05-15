"use client";

import * as React from "react";
import { PLANS, type PlanTier } from "@/lib/commercial/plans";

interface Props {
  plan: PlanTier;
  size?: "sm" | "md";
}

const STYLES: Record<PlanTier, string> = {
  free:           "bg-bg-inset text-ink-tertiary border-line",
  starter:        "bg-emerald-600/10 text-emerald-700 border-emerald-600/30",
  pro:            "bg-ember-500/10 text-ember-600 border-ember-500/30",
  family_office:  "bg-purple-600/10 text-purple-700 border-purple-600/30",
};

/**
 * Pill that surfaces the user's current plan in the app shell and on
 * upgrade-gated surfaces.
 */
export function PlanBadge({ plan, size = "md" }: Props) {
  const meta = PLANS[plan];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border mono uppercase tracking-wider ${
        STYLES[plan]
      } ${size === "sm" ? "px-2 h-5 text-[10px]" : "px-2.5 h-6 text-caption"}`}
    >
      {meta.name}
    </span>
  );
}
