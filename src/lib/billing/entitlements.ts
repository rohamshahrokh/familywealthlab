import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  type SubscriptionTier,
  type TierEntitlements,
  entitlementsFor,
} from "./tiers";

/**
 * Resolve the entitlements for a household.
 *
 * Phase 2F+ scaffolding. We read from `billing.subscriptions` if the row
 * exists, otherwise default to `free`. The actual Stripe webhook + checkout
 * lands in a follow-up PR — this function is structured so that adding the
 * webhook later only changes the data source, not the consumer surface.
 *
 * Why: every gated page calls `getEntitlements(householdId)` once and renders
 * either the live feature or a `<FeatureGate>` upsell. By centralising the
 * lookup here, we have a single place to add caching, Stripe sync, and
 * trial-period logic.
 */
export async function getEntitlements(
  householdId: string,
): Promise<TierEntitlements> {
  // The billing schema is provisioned lazily — Phase 2F+ migration adds it.
  // Until that lands we always return the `free` tier so the UI is correct
  // and we don't blow up on a missing relation.
  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .schema("billing")
      .from("subscriptions")
      .select("tier, current_period_end, status")
      .eq("household_id", householdId)
      .maybeSingle();

    if (error || !data) {
      return entitlementsFor("free");
    }

    const tier = normaliseTier(data.tier);
    const ents = entitlementsFor(tier);
    return {
      ...ents,
      currentPeriodEndIso: data.current_period_end ?? null,
      inTrial: data.status === "trialing",
    };
  } catch {
    // Schema not yet provisioned — default to free.
    return entitlementsFor("free");
  }
}

function normaliseTier(raw: unknown): SubscriptionTier {
  if (raw === "plus" || raw === "pro") return raw;
  return "free";
}
