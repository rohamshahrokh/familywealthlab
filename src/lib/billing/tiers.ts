/**
 * Subscription tiers + feature flags for Family Wealth Lab.
 *
 * Phase 2F+ scaffolding. The actual Stripe wiring lives in a later phase, but
 * the entire UI must be tier-aware *now* so we don't have to retrofit gating
 * onto every page after the fact.
 *
 * Tier policy (locked):
 *   • free  — Snapshot Command Centre, single household, basic input pages.
 *   • plus  — Adds Strategy modules, Baseline forecast, FIRE projection.
 *   • pro   — Adds Monte Carlo, Decision Engine, What-If, Compare, AI insights.
 *
 * Anything beyond `free` is gated through `canAccessFeature(tier, feature)`.
 * Pages that surface a gated feature must render the `<FeatureGate>` upsell
 * card instead of the feature when the household tier is too low.
 */

export type SubscriptionTier = "free" | "plus" | "pro";

export const TIER_RANK: Record<SubscriptionTier, number> = {
  free: 0,
  plus: 1,
  pro: 2,
};

export type FeatureKey =
  // Phase 2A — Snapshot Command Centre + ledger inputs (free)
  | "snapshot.commandCentre"
  | "ledger.cash"
  | "ledger.properties"
  | "ledger.liabilities"
  | "ledger.super"
  // Phase 2B — Strategy
  | "strategy.plan"
  | "strategy.property"
  | "strategy.debt"
  | "strategy.tax"
  | "strategy.cgt"
  // Phase 2C — Forecast
  | "forecast.baseline"
  | "forecast.fire"
  | "forecast.monteCarlo"
  // Phase 2D — Decision Engine v2
  | "decision.engine"
  | "decision.whatIf"
  | "decision.compare"
  // Phase 2E — Advanced controls
  | "settings.assumptions"
  | "settings.engineControls"
  // Phase 2F+ — Pro polish
  | "ai.insights"
  | "export.pdf";

/** The minimum tier required to access each feature. */
export const FEATURE_MINIMUM_TIER: Record<FeatureKey, SubscriptionTier> = {
  // Free tier
  "snapshot.commandCentre": "free",
  "ledger.cash": "free",
  "ledger.properties": "free",
  "ledger.liabilities": "free",
  "ledger.super": "free",
  "settings.assumptions": "free",
  // Plus tier
  "strategy.plan": "plus",
  "strategy.property": "plus",
  "strategy.debt": "plus",
  "strategy.tax": "plus",
  "strategy.cgt": "plus",
  "forecast.baseline": "plus",
  "forecast.fire": "plus",
  // Pro tier
  "forecast.monteCarlo": "pro",
  "decision.engine": "pro",
  "decision.whatIf": "pro",
  "decision.compare": "pro",
  "settings.engineControls": "pro",
  "ai.insights": "pro",
  "export.pdf": "pro",
};

export interface TierEntitlements {
  tier: SubscriptionTier;
  /** Set of feature keys this household can use. */
  features: ReadonlySet<FeatureKey>;
  /** ISO-8601 expiry of the current subscription period, or null for free. */
  currentPeriodEndIso: string | null;
  /** True when the household is in a trial. */
  inTrial: boolean;
}

/** Decide whether a tier can access a given feature. */
export function canAccessFeature(
  tier: SubscriptionTier,
  feature: FeatureKey,
): boolean {
  const required = FEATURE_MINIMUM_TIER[feature];
  return TIER_RANK[tier] >= TIER_RANK[required];
}

/** Build a fully-populated entitlements struct from a tier. */
export function entitlementsFor(tier: SubscriptionTier): TierEntitlements {
  const features = new Set<FeatureKey>();
  (Object.keys(FEATURE_MINIMUM_TIER) as FeatureKey[]).forEach((f) => {
    if (canAccessFeature(tier, f)) features.add(f);
  });
  return {
    tier,
    features,
    currentPeriodEndIso: null,
    inTrial: false,
  };
}

/** Pretty label for the tier (UI). */
export function tierLabel(tier: SubscriptionTier): string {
  return tier === "free" ? "Free" : tier === "plus" ? "Plus" : "Pro";
}

/** Pretty label for the feature (UI / upsell card). */
export const FEATURE_LABELS: Record<FeatureKey, string> = {
  "snapshot.commandCentre": "Snapshot Command Centre",
  "ledger.cash": "Cash accounts",
  "ledger.properties": "Property ledger",
  "ledger.liabilities": "Liabilities ledger",
  "ledger.super": "Superannuation ledger",
  "strategy.plan": "Financial plan",
  "strategy.property": "Property strategy",
  "strategy.debt": "Debt strategy",
  "strategy.tax": "Tax strategy",
  "strategy.cgt": "CGT simulator",
  "forecast.baseline": "Baseline forecast",
  "forecast.fire": "FIRE projection",
  "forecast.monteCarlo": "Monte Carlo simulation",
  "decision.engine": "Decision Engine",
  "decision.whatIf": "What-If scenarios",
  "decision.compare": "Scenario comparison",
  "settings.assumptions": "Assumptions centre",
  "settings.engineControls": "Engine controls",
  "ai.insights": "AI insights",
  "export.pdf": "PDF export",
};
