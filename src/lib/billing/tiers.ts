/**
 * Subscription tiers + feature flags for Family Wealth Lab.
 *
 * ── Founder/Internal Mode ───────────────────────────────────────────────
 * The app is currently in founder/internal build mode. The tier system
 * exists so we don't have to retrofit gating later, but during this phase
 * everything is unlocked for the founder/admin/internal tier and that is
 * the default tier returned by `getEntitlements` (see `FOUNDER_MODE`).
 *
 * Commercial gating policy (future — wired but not enforced yet):
 *   • founder/admin/internal — Unlocks every feature. Default during build.
 *   • free  — Snapshot Command Centre, single household, basic input pages.
 *   • plus  — Adds Strategy modules, Baseline forecast, FIRE projection.
 *   • pro   — Adds Monte Carlo, Decision Engine, What-If, Compare, AI insights.
 *
 * Pages that surface a gated feature should call `canAccessFeature` —
 * because founder is at the top of TIER_RANK, founder mode bypasses every
 * gate. When commercial mode flips on, the same call enforces real tiers.
 */

export type SubscriptionTier = "founder" | "free" | "plus" | "pro";

/**
 * Founder/internal mode toggle.
 *
 * While `FOUNDER_MODE` is true:
 *   • `getEntitlements()` returns the `founder` tier regardless of DB state.
 *   • Every feature gate passes.
 *   • `/settings/billing` renders as an informational pricing page only.
 *
 * Flip to `false` (or set env `NEXT_PUBLIC_FWL_FOUNDER_MODE=0`) to enable
 * real commercial gating. The actual subscription tier is then read from
 * `billing.subscriptions` (with `free` as the safe default).
 */
export const FOUNDER_MODE: boolean =
  process.env.NEXT_PUBLIC_FWL_FOUNDER_MODE !== "0";

export const TIER_RANK: Record<SubscriptionTier, number> = {
  free: 0,
  plus: 1,
  pro: 2,
  founder: 99, // Always above every commercial tier.
};

export type FeatureKey =
  // Phase 2A — Snapshot Command Centre + ledger inputs
  | "snapshot.commandCentre"
  | "ledger.cash"
  | "ledger.properties"
  | "ledger.liabilities"
  | "ledger.super"
  | "ledger.income"
  | "ledger.expenses"
  | "ledger.stocks"
  | "ledger.crypto"
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

/**
 * The minimum tier required to access each feature when commercial mode
 * is enabled. Founder always passes (rank 99). These values are the
 * *future* commercial gating policy — not the current behaviour.
 */
export const FEATURE_MINIMUM_TIER: Record<FeatureKey, SubscriptionTier> = {
  // Free tier — ledger + Snapshot are always free.
  "snapshot.commandCentre": "free",
  "ledger.cash": "free",
  "ledger.properties": "free",
  "ledger.liabilities": "free",
  "ledger.super": "free",
  "ledger.income": "free",
  "ledger.expenses": "free",
  "ledger.stocks": "free",
  "ledger.crypto": "free",
  "settings.assumptions": "free",
  // Plus tier (future)
  "strategy.plan": "plus",
  "strategy.property": "plus",
  "strategy.debt": "plus",
  "strategy.tax": "plus",
  "strategy.cgt": "plus",
  "forecast.baseline": "plus",
  "forecast.fire": "plus",
  // Pro tier (future)
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
  /** ISO-8601 expiry of the current subscription period, or null for free/founder. */
  currentPeriodEndIso: string | null;
  /** True when the household is in a trial. */
  inTrial: boolean;
  /** True when running in founder/internal mode (no commercial gating). */
  founderMode: boolean;
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
    founderMode: tier === "founder",
  };
}

/** Pretty label for the tier (UI). */
export function tierLabel(tier: SubscriptionTier): string {
  switch (tier) {
    case "founder": return "Founder";
    case "plus":    return "Plus";
    case "pro":     return "Pro";
    default:        return "Free";
  }
}

/** Pretty label for the feature (UI / upsell card). */
export const FEATURE_LABELS: Record<FeatureKey, string> = {
  "snapshot.commandCentre": "Snapshot Command Centre",
  "ledger.cash": "Cash accounts",
  "ledger.properties": "Property ledger",
  "ledger.liabilities": "Liabilities ledger",
  "ledger.super": "Superannuation ledger",
  "ledger.income": "Income ledger",
  "ledger.expenses": "Expenses ledger",
  "ledger.stocks": "Stocks ledger",
  "ledger.crypto": "Crypto ledger",
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
