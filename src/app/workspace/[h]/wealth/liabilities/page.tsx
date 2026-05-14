import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireOnboarded } from "@/lib/auth";
import { SurfaceCard, EmptyState, MetricRow } from "@/components/workspace/cards";
import { fmtMoney, fmtPercent } from "@/components/workspace/format";
import { LiabilityForm } from "./LiabilityForm";
import { DeleteLiabilityButton } from "./DeleteLiabilityButton";
import { CreditCard } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Liabilities — Family Wealth Lab" };

type LiabilityRow = {
  id: string; name: string;
  type: "credit_card" | "personal_loan" | "heloc" | "student_loan" | "other";
  balance: number | null;
  interest_rate: number | null;
  min_payment: number | null;
  notes: string | null;
};

const TYPE_LABELS: Record<LiabilityRow["type"], string> = {
  credit_card: "Credit card", personal_loan: "Personal loan",
  heloc: "HELOC", student_loan: "Student loan", other: "Other",
};

export default async function LiabilitiesPage({ params }: { params: { h: string } }) {
  await requireOnboarded(`/workspace/${params.h}/wealth/liabilities`);
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.schema("ledger").from("liabilities")
    .select("*").eq("household_id", params.h).order("created_at", { ascending: true });
  const rows = (data ?? []) as LiabilityRow[];
  const total = rows.reduce((s, r) => s + (Number(r.balance) || 0), 0);

  return (
    <div className="space-y-8 sm:space-y-10">
      <header>
        <div className="syslabel mb-3">
          <span className="syslabel-bracket">[02·DEBT]</span>
          <span>Input · Liabilities</span>
        </div>
        <h1 className="text-h3 sm:text-h2 text-ink-primary tracking-tight">Liability ledger</h1>
        <p className="mt-3 text-body text-ink-tertiary max-w-2xl text-pretty">
          Non-property debt: credit cards, personal loans, HELOCs, student loans.
          Property mortgages live under <em>Properties</em>. The Debt Strategy engine
          reads from this ledger.
        </p>
      </header>

      <section>
        <div className="syslabel mb-4"><span className="syslabel-bracket">[A]</span><span>Add liability</span></div>
        <SurfaceCard><LiabilityForm householdId={params.h} /></SurfaceCard>
      </section>

      <section className="space-y-4">
        <div className="syslabel">
          <span className="syslabel-bracket">[B]</span>
          <span>Liabilities · {rows.length} {rows.length === 1 ? "row" : "rows"}</span>
        </div>
        {rows.length === 0 ? (
          <EmptyState index="·" eyebrow="Empty ledger" title="No liabilities recorded"
            body="If your household has zero non-property debt, leave this empty — the Snapshot will reflect that." />
        ) : (
          <div className="space-y-3">
            {rows.map((r) => (
              <SurfaceCard key={r.id}>
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-bg-inset inline-flex items-center justify-center text-ink-secondary shrink-0">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-body font-medium text-ink-primary">{r.name}</span>
                      <span className="text-caption text-ember-500 mono uppercase">{TYPE_LABELS[r.type]}</span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1">
                      <MetricRow label="Balance" value={fmtMoney(r.balance ?? 0)} />
                      <MetricRow label="Rate" value={r.interest_rate != null ? fmtPercent(r.interest_rate) : "—"} />
                      <MetricRow label="Min payment" value={r.min_payment != null ? fmtMoney(r.min_payment) : "—"} />
                    </div>
                    {r.notes && <p className="mt-3 text-caption text-ink-tertiary text-pretty">{r.notes}</p>}
                  </div>
                  <DeleteLiabilityButton householdId={params.h} id={r.id} />
                </div>
              </SurfaceCard>
            ))}
            <div className="text-right text-caption text-ink-tertiary pr-2 pt-1">
              Total debt: <span className="text-ink-primary font-medium">{fmtMoney(total)}</span>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
