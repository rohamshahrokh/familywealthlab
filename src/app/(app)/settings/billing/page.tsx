import { requireOnboarded } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getEntitlements } from "@/lib/billing";
import { type SubscriptionTier, FOUNDER_MODE, tierLabel } from "@/lib/billing/tiers";
import { SurfaceCard, CardHeader } from "@/components/workspace/cards";
import { Check, Sparkles, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = { title: "Pricing — Family Wealth Lab" };

/**
 * Pricing / billing — informational only during founder/internal mode.
 *
 * Founder mode policy (locked):
 *   • No "Upgrade to Pro" CTAs anywhere.
 *   • Page shows the future commercial pricing tiers as reference.
 *   • All Stripe checkout / portal wiring is deferred until the product is
 *     ready to commercialise.
 *
 * When `FOUNDER_MODE` flips to false this page will be expanded to include
 * the live checkout buttons and the subscription portal link. The tier
 * comparison cards below already reflect the planned commercial policy.
 */
export default async function BillingPage() {
  const session = await requireOnboarded();
  const supabase = createSupabaseServerClient();

  const { data: memberships } = await supabase
    .schema("app")
    .from("household_members")
    .select("household_id, role")
    .eq("user_id", session.user.id)
    .limit(1);

  const householdId = memberships?.[0]?.household_id ?? null;
  const ents = householdId
    ? await getEntitlements(householdId)
    : { tier: "free" as SubscriptionTier, features: new Set<string>(), currentPeriodEndIso: null, inTrial: false, founderMode: FOUNDER_MODE };

  return (
    <div className="space-y-10 max-w-4xl">
      <header>
        <div className="mono text-eyebrow text-ember-500 mb-3">[03] Pricing</div>
        <h1 className="text-h2 text-ink-primary tracking-tight">Pricing & subscription.</h1>
        <p className="mt-3 text-body text-ink-tertiary max-w-2xl">
          Family Wealth Lab is currently in founder/internal build mode. The
          tiers below are the planned commercial structure for reference only —
          no checkout is wired up yet, and every feature is unlocked end-to-end
          so the product can be validated before pricing is finalised.
        </p>
      </header>

      {FOUNDER_MODE && (
        <SurfaceCard tone="cinematic" padding="lg">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-full bg-ember-50 text-ember-700 inline-flex items-center justify-center shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="syslabel mb-1.5">
                <span className="syslabel-bracket">·</span>
                <span>Founder mode</span>
              </div>
              <div className="text-body font-medium text-ink-primary">
                Every module is unlocked for the {tierLabel(ents.tier)} account.
              </div>
              <p className="text-body-sm text-ink-tertiary mt-2 max-w-prose">
                You're testing the full commercial product end-to-end. Ledger,
                Strategy, Forecast, Decision Engine, What-If, Compare and the
                Assumptions Centre are all live. Commercial gating will only
                be enforced when we flip <span className="mono">FOUNDER_MODE</span> off.
              </p>
            </div>
          </div>
        </SurfaceCard>
      )}

      <section>
        <CardHeader index="[A]" eyebrow="Reference" title="Planned commercial tiers" />
        <p className="text-body-sm text-ink-tertiary -mt-2 mb-4 max-w-prose">
          These are the tier boundaries we'll enforce when commercial mode
          launches. Today they're informational only.
        </p>
        <div className="grid lg:grid-cols-3 gap-4">
          <TierCard tier="free" features={FREE_FEATURES} />
          <TierCard tier="plus" features={PLUS_FEATURES} />
          <TierCard tier="pro" features={PRO_FEATURES} />
        </div>
      </section>

      <SurfaceCard tone="inset">
        <CardHeader index="[C·1]" eyebrow="Roadmap" title="Checkout & subscription portal" />
        <p className="text-body-sm text-ink-secondary mt-2 max-w-prose">
          Stripe-powered checkout, invoices and the subscription portal will
          launch alongside the public release. Your household data lives in the
          same ledger regardless of tier — switching tier only changes which
          pages are gated. No data migration is required.
        </p>
      </SurfaceCard>
    </div>
  );
}

const FREE_FEATURES = [
  "Snapshot Command Centre",
  "Cash, properties, super, liabilities ledger",
  "Income, expenses, stocks, crypto ledger",
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
  "AI insight polish",
  "PDF export",
];

function TierCard({ tier, features }: { tier: SubscriptionTier; features: string[] }) {
  return (
    <SurfaceCard tone="paper" padding="lg">
      <div className="flex items-center justify-between mb-3">
        <div className="syslabel">
          <span className="syslabel-bracket">·</span>
          <span>{tierLabel(tier)}</span>
        </div>
        <span className="text-caption text-ink-quaternary inline-flex items-center gap-1">
          <Sparkles className="h-3 w-3" /> Planned
        </span>
      </div>
      <ul className="space-y-2 text-body-sm text-ink-secondary">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <Check className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" /> <span>{f}</span>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-caption text-ink-quaternary">
        No checkout — informational only during founder mode.
      </p>
    </SurfaceCard>
  );
}
