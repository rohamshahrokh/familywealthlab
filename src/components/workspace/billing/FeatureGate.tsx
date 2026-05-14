import Link from "next/link";
import { Sparkles, Lock } from "lucide-react";
import {
  SurfaceCard,
} from "@/components/workspace/cards";
import {
  type FeatureKey,
  type SubscriptionTier,
  FEATURE_LABELS,
  FEATURE_MINIMUM_TIER,
  tierLabel,
} from "@/lib/billing/tiers";

interface Props {
  feature: FeatureKey;
  currentTier: SubscriptionTier;
  /** Optional short copy for context. */
  pitch?: string;
  /** Optional list of bullet points showing what unlocks. */
  bullets?: string[];
}

/**
 * Tier-aware upsell card. Pages that surface gated features render this
 * instead of the feature body when entitlements are insufficient. The CTA
 * routes to /settings/billing (Phase 2F+ adds the real checkout — until then
 * the page renders a "coming soon" notice, kept honest).
 */
export function FeatureGate({ feature, currentTier, pitch, bullets }: Props) {
  const required = FEATURE_MINIMUM_TIER[feature];
  const label = FEATURE_LABELS[feature];
  return (
    <SurfaceCard tone="paper" padding="lg" className="text-center">
      <div className="mx-auto h-12 w-12 rounded-full bg-ember-50 text-ember-700 inline-flex items-center justify-center mb-4">
        <Sparkles className="h-6 w-6" />
      </div>
      <div className="syslabel justify-center mb-2">
        <span className="syslabel-bracket">·</span>
        <span>{tierLabel(required)} feature</span>
      </div>
      <h3 className="text-h6 font-semibold text-ink-primary tracking-tight">
        {label}
      </h3>
      <p className="text-body-sm text-ink-tertiary max-w-prose mx-auto mt-2">
        {pitch ??
          `Upgrade from ${tierLabel(currentTier)} to ${tierLabel(required)} to unlock ${label.toLowerCase()}. Everything you've already entered in the ledger keeps working — this tier just adds the deeper engine surfaces.`}
      </p>
      {bullets && bullets.length > 0 && (
        <ul className="mt-4 space-y-1 text-body-sm text-ink-secondary max-w-prose mx-auto text-left list-disc list-inside">
          {bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      )}
      <div className="mt-6">
        <Link
          href="/settings/billing"
          className="inline-flex items-center gap-2 rounded-full bg-ink-primary text-white px-5 h-10 text-body-sm font-medium hover:bg-graphite-800 transition-colors focus-ring"
        >
          See {tierLabel(required)} <span aria-hidden>→</span>
        </Link>
      </div>
      <p className="mt-4 text-caption text-ink-quaternary inline-flex items-center gap-1.5">
        <Lock className="h-3 w-3" /> No data is gated — only the deeper engine surfaces.
      </p>
    </SurfaceCard>
  );
}
