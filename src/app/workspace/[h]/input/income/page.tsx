import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireOnboarded } from "@/lib/auth";
import { SurfaceCard, EmptyState, MetricRow } from "@/components/workspace/cards";
import { fmtMoney } from "@/components/workspace/format";
import { IncomeForm } from "./IncomeForm";
import { DeleteIncomeButton } from "./DeleteIncomeButton";
import { Briefcase } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Income — Family Wealth Lab" };

type Row = {
  id: string;
  source: "salary" | "rental" | "dividend" | "business" | "other";
  label: string | null;
  amount: number;
  cadence: "monthly" | "annual" | "one_off";
  starts_on: string | null;
  ends_on: string | null;
  notes: string | null;
};

const SOURCE_LABELS: Record<Row["source"], string> = {
  salary: "Salary",
  rental: "Rental",
  dividend: "Dividend",
  business: "Business",
  other: "Other",
};

/**
 * Income ledger — household-scoped writes against `ledger.income_sources`.
 * Snapshot reads this table to derive cashflow KPIs.
 */
export default async function IncomePage({ params }: { params: { h: string } }) {
  await requireOnboarded(`/workspace/${params.h}/input/income`);
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.schema("ledger").from("income_sources")
    .select("*").eq("household_id", params.h).order("created_at", { ascending: true });
  const rows = (data ?? []) as Row[];

  // Normalise everything to a monthly figure for the running total.
  const monthlyOf = (r: Row): number => {
    const a = Number(r.amount) || 0;
    if (r.cadence === "monthly") return a;
    if (r.cadence === "annual") return a / 12;
    return 0; // one_off doesn't contribute to the recurring monthly total.
  };
  const totalMonthly = rows.reduce((s, r) => s + monthlyOf(r), 0);

  return (
    <div className="space-y-8 sm:space-y-10">
      <header>
        <div className="syslabel mb-3">
          <span className="syslabel-bracket">[02·INC]</span>
          <span>Input · Income</span>
        </div>
        <h1 className="text-h3 sm:text-h2 text-ink-primary tracking-tight">Income ledger</h1>
        <p className="mt-3 text-body text-ink-tertiary max-w-2xl text-pretty">
          Every recurring and one-off income stream the household receives. The
          Snapshot reads this ledger to derive Monthly Income, Saving Rate and
          Cashflow KPIs.
        </p>
      </header>

      <section>
        <div className="syslabel mb-4">
          <span className="syslabel-bracket">[A]</span><span>Add income source</span>
        </div>
        <SurfaceCard><IncomeForm householdId={params.h} /></SurfaceCard>
      </section>

      <section className="space-y-4">
        <div className="syslabel">
          <span className="syslabel-bracket">[B]</span>
          <span>Sources · {rows.length} {rows.length === 1 ? "row" : "rows"}</span>
        </div>
        {rows.length === 0 ? (
          <EmptyState
            index="·"
            eyebrow="Empty ledger"
            title="No income sources yet"
            body="Add your first income stream above. Salary, rental, dividends — all flow into the same monthly cashflow figure."
          />
        ) : (
          <div className="space-y-3">
            {rows.map((r) => (
              <SurfaceCard key={r.id}>
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-bg-inset inline-flex items-center justify-center text-ink-secondary shrink-0">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-body font-medium text-ink-primary">{r.label ?? SOURCE_LABELS[r.source]}</span>
                      <span className="text-caption text-ember-500 mono uppercase">{SOURCE_LABELS[r.source]}</span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1">
                      <MetricRow label={`Amount (${r.cadence})`} value={fmtMoney(r.amount)} />
                      <MetricRow label="Monthly equiv." value={fmtMoney(monthlyOf(r))} />
                      {r.starts_on && <MetricRow label="Starts" value={r.starts_on} />}
                      {r.ends_on && <MetricRow label="Ends" value={r.ends_on} />}
                    </div>
                    {r.notes && (
                      <p className="mt-3 text-caption text-ink-tertiary text-pretty">{r.notes}</p>
                    )}
                  </div>
                  <DeleteIncomeButton householdId={params.h} id={r.id} />
                </div>
              </SurfaceCard>
            ))}
            <div className="text-right text-caption text-ink-tertiary pr-2 pt-1">
              Monthly total: <span className="text-ink-primary font-medium">{fmtMoney(totalMonthly)}</span>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
