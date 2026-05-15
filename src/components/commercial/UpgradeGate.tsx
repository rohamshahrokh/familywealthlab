"use client";

import * as React from "react";
import Link from "next/link";
import { Lock, Sparkles } from "lucide-react";
import {
  canUse,
  type AccessContext,
} from "@/lib/commercial/accessControl";
import { PLANS } from "@/lib/commercial/plans";
import { FEATURE_LABEL, type Feature } from "@/lib/commercial/featureFlags";

interface Props {
  feature: Feature;
  ctx: AccessContext;
  /** What to render when access is granted. */
  children: React.ReactNode;
  /** Optional: render an inline soft-gate instead of replacing children. */
  mode?: "block" | "overlay";
}

/**
 * Wraps a feature surface and replaces / overlays it with an upgrade prompt
 * when the current plan doesn't include the required feature.
 *
 * Usage:
 *   <UpgradeGate feature="cgt_simulator" ctx={ctx}>
 *     <CGTSimulator />
 *   </UpgradeGate>
 */
export function UpgradeGate({ feature, ctx, children, mode = "block" }: Props) {
  const decision = canUse(ctx, feature);
  if (decision.ok) return <>{children}</>;

  const requiredPlan = decision.requiredPlan ? PLANS[decision.requiredPlan] : null;

  const Card = (
    <div className="card-cinematic rounded-2xl border border-line bg-bg-inset p-6 text-center max-w-md mx-auto">
      <div className="flex justify-center mb-3">
        <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-ember-500/15 text-ember-600">
          <Lock className="h-5 w-5" />
        </span>
      </div>
      <h3 className="text-h5 text-ink-primary mb-2">
        {FEATURE_LABEL[feature]}
      </h3>
      <p className="text-body-sm text-ink-tertiary mb-5">
        {decision.message}
      </p>
      {requiredPlan && (
        <Link
          href="/pricing"
          className="inline-flex items-center gap-2 rounded-full bg-ink-primary text-white px-5 h-10 text-body-sm font-medium hover:bg-graphite-800 focus-ring"
        >
          <Sparkles className="h-4 w-4" />
          Upgrade to {requiredPlan.name}
        </Link>
      )}
    </div>
  );

  if (mode === "block") {
    return <div className="py-12">{Card}</div>;
  }

  // Overlay mode — show the locked content blurred behind the card
  return (
    <div className="relative">
      <div aria-hidden className="pointer-events-none select-none blur-sm opacity-40">
        {children}
      </div>
      <div className="absolute inset-0 grid place-items-center">{Card}</div>
    </div>
  );
}
