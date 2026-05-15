/**
 * accessControl.ts — Plan + role based feature access
 * ─────────────────────────────────────────────────────────────────────────────
 * Single API consumed by UI gating components, sidebar items, and (in future)
 * server route guards. All decisions are made client-side for now; once a real
 * backend is wired, the same functions should be re-implemented on the server
 * with the same signatures.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { PLANS, type Limit, type PlanTier, meetsTier } from "./plans";
import { FEATURE_MINIMUM, FEATURE_LABEL, type Feature } from "./featureFlags";

export type HouseholdRole = "owner" | "partner" | "viewer" | "demo";

export interface AccessContext {
  /** The current household's plan tier. */
  plan: PlanTier;
  /** The viewing user's role within their household. */
  role: HouseholdRole;
  /** True when the user is browsing /demo or has signed up but not chosen a plan. */
  isDemo: boolean;
}

export interface AccessDenied {
  ok: false;
  reason: "plan" | "role" | "limit";
  message: string;
  /** Minimum tier the user needs to upgrade to. */
  requiredPlan?: PlanTier;
}

export interface AccessGranted {
  ok: true;
}

export type AccessResult = AccessGranted | AccessDenied;

const READ_ONLY_ROLES: HouseholdRole[] = ["viewer", "demo"];

/** Can the user use a given feature? */
export function canUse(ctx: AccessContext, feature: Feature): AccessResult {
  const required = FEATURE_MINIMUM[feature];
  if (!meetsTier(ctx.plan, required)) {
    return {
      ok: false,
      reason: "plan",
      requiredPlan: required,
      message: `${FEATURE_LABEL[feature]} requires the ${PLANS[required].name} plan or higher.`,
    };
  }
  return { ok: true };
}

/** Read-write actions require an editor role. */
export function canWrite(ctx: AccessContext, feature: Feature): AccessResult {
  const baseline = canUse(ctx, feature);
  if (!baseline.ok) return baseline;
  if (READ_ONLY_ROLES.includes(ctx.role)) {
    return {
      ok: false,
      reason: "role",
      message: "Read-only access — ask the household owner to upgrade your role.",
    };
  }
  return { ok: true };
}

/** Check that the user has not exceeded a hard limit on their plan. */
export function withinLimit(
  ctx: AccessContext,
  key: keyof (typeof PLANS)["free"]["limits"],
  currentCount: number,
): AccessResult {
  const limit: Limit = PLANS[ctx.plan].limits[key];
  if (limit === "unlimited") return { ok: true };
  if (currentCount < limit) return { ok: true };
  return {
    ok: false,
    reason: "limit",
    message: `Your ${PLANS[ctx.plan].name} plan is limited to ${limit} ${key}. Upgrade to add more.`,
  };
}

/** Default demo access context — used by /demo and by SSR before auth resolves. */
export const DEFAULT_DEMO_CONTEXT: AccessContext = {
  plan: "pro", // demo unlocks Pro-level features for evaluation
  role: "demo",
  isDemo: true,
};
