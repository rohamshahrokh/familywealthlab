import { getSessionUser } from "@/lib/auth";
import { getEntitlements } from "@/lib/billing";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/workspace/PageHeader";
import { FeatureGate } from "@/components/workspace/billing/FeatureGate";
import { AssumptionsForm, type AssumptionsDefaults } from "./AssumptionsForm";

export const dynamic = "force-dynamic";

export const metadata = { title: "Assumptions — Family Wealth Lab" };

interface Props { params: { h: string } }

/**
 * Assumptions Centre — the single place to set every household-level
 * assumption that flows into Snapshot + forecast engine. Free tier accessible
 * (it'd be hostile to gate the input page); deeper engine controls are gated.
 */
export default async function AssumptionsPage({ params }: Props) {
  await getSessionUser();
  const ents = await getEntitlements(params.h);
  if (!ents.features.has("settings.assumptions")) {
    // settings.assumptions is free; falling through is theoretical, but kept
    // for tier consistency.
    return (
      <div className="space-y-8">
        <PageHeader index="[06·01]" eyebrow="Settings" title="Assumptions centre" body="Define the inputs that drive every forecast and decision surface." />
        <FeatureGate feature="settings.assumptions" currentTier={ents.tier} />
      </div>
    );
  }

  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .schema("ledger")
    .from("assumptions")
    .select(
      "fire_target_amount, fire_target_age, retirement_age, emergency_buffer_months, return_assumption, inflation_assumption",
    )
    .eq("household_id", params.h)
    .maybeSingle();

  const defaults: AssumptionsDefaults = {
    fireTargetAmount: numOrNull(data?.fire_target_amount),
    fireTargetAge: numOrNull(data?.fire_target_age),
    retirementAge: numOrNull(data?.retirement_age),
    emergencyBufferMonths: numOrNull(data?.emergency_buffer_months),
    returnAssumption: numOrNull(data?.return_assumption),
    inflationAssumption: numOrNull(data?.inflation_assumption),
  };

  return (
    <div className="space-y-10">
      <PageHeader
        index="[06·01]" eyebrow="Settings" title="Assumptions centre"
        body="The inputs every engine reads. Changing a value here updates Snapshot, Strategy, Forecast, and Decision pages on the next reload."
      />
      <AssumptionsForm householdId={params.h} defaults={defaults} />
    </div>
  );
}

function numOrNull(v: unknown): number | null {
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
