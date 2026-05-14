import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  FOUNDER_MODE,
  type SubscriptionTier,
  type TierEntitlements,
  entitlementsFor,
} from "./tiers";

/**
 * Resolve the entitlements for a household.
 *
 * ── Founder/Internal Mode ───────────────────────────────────────────────
 * When `FOUNDER_MODE` is true (the default during the current build phase)
 * this function returns the `founder` tier unconditionally — every feature
 * is unlocked, no DB read is required, no row is needed in
 * `billing.subscriptions`. This lets the founder test the full commercial
 * product end-to-end without fake paywalls.
 *
 * When `FOUNDER_MODE` flips to false we fall back to the real lookup:
 *   1. Read the household's subscription row from `billing.subscriptions`.
 *   2. Map the stored `tier` enum to our `SubscriptionTier`.
 *   3. Fall back to `free` on any error / missing row.
 *
 * The consumer surface (`getEntitlements(householdId)`) does not change
 * between modes — only the data source does.
 */
export async function getEntitlements(
  householdId: string,
): Promise<TierEntitlements> {
  if (FOUNDER_MODE) {
    return entitlementsFor("founder");
  }

  // Commercial mode — read the real subscription tier.
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
    return entitlementsFor("free");
  }
}

function normaliseTier(raw: unknown): SubscriptionTier {
  if (raw === "founder" || raw === "plus" || raw === "pro") return raw;
  return "free";
}
