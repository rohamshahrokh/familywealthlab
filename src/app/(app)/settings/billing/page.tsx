import { requireOnboarded } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getEntitlements } from "@/lib/billing";
import { type SubscriptionTier, TIER_RANK, tierLabel } from "@/lib/billing/tiers";
import { SurfaceCard, CardHeader, MetricRow } from "@/components/workspace/cards";
import { Check, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = { title: "Billing — Family Wealth Lab" };

/**
 * Billing settings — current tier, what's included, what's coming. The real
 * checkout integration (Stripe + webhook + portal link) lands in a follow-up
 * phase; for now this page is intentionally honest: it surfaces current tier,
 * what's in each tier, and a notice that checkout opens at GA.
 */
export default async function BillingPage() {
  const session = await requireOnboarded();
  const supabase = createSupabaseServerClient();

  // Pull the primary household for this user (the first one we can see).
  const { data: memberships } = await supabase
    .schema("app")
    .from("household_members")
    .select("household_id, role")
    .eq("user_id", session.user.id)
    .limit(1);

  const householdId = memberships?.[0]?.household_id ?? null;
  const ents = householdId
    ? await getEntitlements(householdId)
    : { tier: "free" as SubscriptionTier, features: new Set<string>(), currentPeriodEndIso: null, inTrial: false };

  return (
    <div className="space-y-10 max-w-4xl">
      <header>
        <div className="mono text-eyebrow text-ember-500 mb-3">[03] Billing</div>
        <h1 className="text-h2 text-ink-primary tracking-tight">Subscription & billing.</h1>
        <p className="mt-3 text-body text-ink-tertiary max-w-2xl">
          Family Wealth Lab is launching paid tiers shortly. Until then every account is on the {tierLabel("free")} tier.
          You'll see the upgrade flow here as soon as it ships.
        </p>
      </header>

      <SurfaceCard>
        <CardHeader index="[A·1]" eyebrow="Current" title={`You're on ${tierLabel(ents.tier)}`} />
        <div className="grid sm:grid-cols-3 gap-x-6 gap-y-1 mt-2">
          <MetricRow label="Tier" value={tierLabel(ents.tier)} />
          <MetricRow label="Status" value={ents.inTrial ? "Trialing" : "Active"} />
          <MetricRow label="Renews" value={ents.currentPeriodEndIso ?? "—"} />
        </div>
      </SurfaceCard>

      <section className="grid lg:grid-cols-3 gap-4">
        <TierCard tier="free" current={ents.tier} features={FREE_FEATURES} />
        <TierCard tier="plus" current={ents.tier} features={PLUS_FEATURES} />
        <TierCard tier="pro" current={ents.tier} features={PRO_FEATURES} />
      </section>

      <SurfaceCard tone="inset">
        <CardHeader index="[C·1]" eyebrow="Coming soon" title="Checkout & subscription portal" />
        <p className="text-body-sm text-ink-secondary mt-2 max-w-prose">
          The Stripe-powered checkout, invoices, and subscription management portal launch alongside the GA release.
          Your data stays in place — switching tier only changes which pages are gated. There is no data migration.
        </p>
      </SurfaceCard>
    </div>
  );
}

const FREE_FEATURES = [
  "Snapshot Command Centre",
  "Cash, properties, super & liability ledger",
  "Assumptions centre",
  "1 household",
];
const PLUS_FEATURES = [
  "Everything in Free",
  "Strategy modules (Plan, Property, Debt, Tax, CGT)",
  "Baseline forecast",
  "FIRE projection",
];
const PRO_FEATURES = [
  "Everything in Plus",
  "Monte Carlo dispersion",
  "Decision Engine v2",
  "What-If & Scenario Compare",
  "AI insight polish (when GA)",
  "PDF export",
];

function TierCard({ tier, current, features }: { tier: SubscriptionTier; current: SubscriptionTier; features: string[] }) {
  const isCurrent = tier === current;
  const isHigher = TIER_RANK[tier] > TIER_RANK[current];
  return (
    <SurfaceCard tone={isCurrent ? "cinematic" : "paper"} padding="lg">
      <div className="flex items-center justify-between mb-3">
        <div className="syslabel">
          <span className="syslabel-bracket">·</span>
          <span>{tierLabel(tier)}</span>
        </div>
        {isCurrent && (
          <span className="text-caption text-ember-700 font-medium inline-flex items-center gap-1">
            <Sparkles className="h-3 w-3" /> Current
          </span>
        )}
      </div>
      <ul className="space-y-2 text-body-sm text-ink-secondary">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <Check className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" /> <span>{f}</span>
          </li>
        ))}
      </ul>
      <div className="mt-6">
        {isCurrent ? (
          <button disabled className="w-full rounded-full bg-bg-inset text-ink-tertiary px-5 h-10 text-body-sm font-medium cursor-default">
            Current plan
          </button>
        ) : isHigher ? (
          <button disabled className="w-full rounded-full bg-ink-primary text-white px-5 h-10 text-body-sm font-medium opacity-60 cursor-not-allowed" title="Upgrade flow ships at GA">
            Upgrade · coming soon
          </button>
        ) : (
          <button disabled className="w-full rounded-full bg-bg-inset text-ink-tertiary px-5 h-10 text-body-sm font-medium opacity-60 cursor-not-allowed">
            Lower tier
          </button>
        )}
      </div>
    </SurfaceCard>
  );
}
