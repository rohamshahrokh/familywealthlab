import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireOnboarded } from "@/lib/auth";
import { SurfaceCard, EmptyState, MetricRow } from "@/components/workspace/cards";
import { fmtMoney } from "@/components/workspace/format";
import { ExpenseForm } from "./ExpenseForm";
import { DeleteExpenseButton } from "./DeleteExpenseButton";
import { Receipt } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Expenses — Family Wealth Lab" };

type Row = {
  id: string;
  category: string;
  label: string | null;
  amount: number;
  cadence: "monthly" | "annual" | "one_off";
  is_debt_service: boolean;
  notes: string | null;
};

const CATEGORY_LABELS: Record<string, string> = {
  housing: "Housing", transport: "Transport", food: "Food",
  utilities: "Utilities", health: "Health", childcare: "Childcare",
  leisure: "Leisure", insurance: "Insurance", other: "Other",
};

export default async function ExpensesPage({ params }: { params: { h: string } }) {
  await requireOnboarded(`/workspace/${params.h}/input/expenses`);
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.schema("ledger").from("expenses")
    .select("*").eq("household_id", params.h).order("created_at", { ascending: true });
  const rows = (data ?? []) as Row[];

  const monthlyOf = (r: Row): number => {
    const a = Number(r.amount) || 0;
    if (r.cadence === "monthly") return a;
    if (r.cadence === "annual") return a / 12;
    return 0;
  };
  const totalMonthly = rows.reduce((s, r) => s + monthlyOf(r), 0);
  const debtServiceMonthly = rows.filter((r) => r.is_debt_service).reduce((s, r) => s + monthlyOf(r), 0);

  return (
    <div className="space-y-8 sm:space-y-10">
      <header>
        <div className="syslabel mb-3">
          <span className="syslabel-bracket">[02·EXP]</span>
          <span>Input · Expenses</span>
        </div>
        <h1 className="text-h3 sm:text-h2 text-ink-primary tracking-tight">Expenses ledger</h1>
        <p className="mt-3 text-body text-ink-tertiary max-w-2xl text-pretty">
          Every recurring and one-off expense. The Snapshot reads this ledger
          to derive Monthly Expenses, Saving Rate, and Emergency Buffer months
          covered.
        </p>
      </header>

      <section>
        <div className="syslabel mb-4">
          <span className="syslabel-bracket">[A]</span><span>Add expense</span>
        </div>
        <SurfaceCard><ExpenseForm householdId={params.h} /></SurfaceCard>
      </section>

      <section className="space-y-4">
        <div className="syslabel">
          <span className="syslabel-bracket">[B]</span>
          <span>Expenses · {rows.length} {rows.length === 1 ? "row" : "rows"}</span>
        </div>
        {rows.length === 0 ? (
          <EmptyState
            index="·"
            eyebrow="Empty ledger"
            title="No expenses recorded yet"
            body="Add your first recurring expense above. The Snapshot needs this to compute saving rate and emergency buffer."
          />
        ) : (
          <div className="space-y-3">
            {rows.map((r) => (
              <SurfaceCard key={r.id}>
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-bg-inset inline-flex items-center justify-center text-ink-secondary shrink-0">
                    <Receipt className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-body font-medium text-ink-primary">{r.label ?? CATEGORY_LABELS[r.category] ?? r.category}</span>
                      <span className="text-caption text-ember-500 mono uppercase">{CATEGORY_LABELS[r.category] ?? r.category}</span>
                      {r.is_debt_service && (
                        <span className="text-caption mono uppercase bg-bg-inset text-ink-tertiary px-2 py-0.5 rounded-full">debt service</span>
                      )}
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1">
                      <MetricRow label={`Amount (${r.cadence})`} value={fmtMoney(r.amount)} />
                      <MetricRow label="Monthly equiv." value={fmtMoney(monthlyOf(r))} />
                    </div>
                    {r.notes && (
                      <p className="mt-3 text-caption text-ink-tertiary text-pretty">{r.notes}</p>
                    )}
                  </div>
                  <DeleteExpenseButton householdId={params.h} id={r.id} />
                </div>
              </SurfaceCard>
            ))}
            <div className="text-right text-caption text-ink-tertiary pr-2 pt-1 space-x-3">
              <span>Debt service: <span className="text-ink-primary font-medium">{fmtMoney(debtServiceMonthly)}/mo</span></span>
              <span>Total: <span className="text-ink-primary font-medium">{fmtMoney(totalMonthly)}/mo</span></span>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
