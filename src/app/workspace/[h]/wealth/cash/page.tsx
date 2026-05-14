import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireOnboarded } from "@/lib/auth";
import { SurfaceCard, EmptyState, MetricRow } from "@/components/workspace/cards";
import { fmtMoney } from "@/components/workspace/format";
import { CashForm } from "./CashForm";
import { DeleteCashButton } from "./DeleteCashButton";
import { Wallet } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Cash accounts — Family Wealth Lab" };

type CashRow = {
  id: string;
  name: string;
  type: "checking" | "savings" | "offset" | "emergency" | "other";
  institution: string | null;
  balance: number | null;
  currency: string;
  notes: string | null;
};

const TYPE_LABELS: Record<CashRow["type"], string> = {
  checking: "Checking", savings: "Savings", offset: "Offset",
  emergency: "Emergency", other: "Other",
};

export default async function CashPage({ params }: { params: { h: string } }) {
  await requireOnboarded(`/workspace/${params.h}/wealth/cash`);
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.schema("ledger").from("cash_accounts")
    .select("*").eq("household_id", params.h).order("created_at", { ascending: true });
  const rows = (data ?? []) as CashRow[];
  const total = rows.reduce((s, r) => s + (Number(r.balance) || 0), 0);

  return (
    <div className="space-y-8 sm:space-y-10">
      <header>
        <div className="syslabel mb-3">
          <span className="syslabel-bracket">[02·CASH]</span>
          <span>Input · Cash accounts</span>
        </div>
        <h1 className="text-h3 sm:text-h2 text-ink-primary tracking-tight">Cash ledger</h1>
        <p className="mt-3 text-body text-ink-tertiary max-w-2xl text-pretty">
          Every cash, savings, offset and emergency-fund account the household holds.
          The Snapshot reads this ledger to derive Cash Today and Emergency Buffer.
        </p>
      </header>

      <section>
        <div className="syslabel mb-4">
          <span className="syslabel-bracket">[A]</span><span>Add cash account</span>
        </div>
        <SurfaceCard><CashForm householdId={params.h} /></SurfaceCard>
      </section>

      <section className="space-y-4">
        <div className="syslabel">
          <span className="syslabel-bracket">[B]</span>
          <span>Accounts · {rows.length} {rows.length === 1 ? "row" : "rows"}</span>
        </div>
        {rows.length === 0 ? (
          <EmptyState
            index="·"
            eyebrow="Empty ledger"
            title="No cash accounts yet"
            body="Add your first account above to see Cash Today on the Command Centre."
          />
        ) : (
          <div className="space-y-3">
            {rows.map((r) => (
              <SurfaceCard key={r.id}>
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-bg-inset inline-flex items-center justify-center text-ink-secondary shrink-0">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-body font-medium text-ink-primary">{r.name}</span>
                      <span className="text-caption text-ember-500 mono uppercase">{TYPE_LABELS[r.type]}</span>
                    </div>
                    {r.institution && (
                      <div className="text-caption text-ink-quaternary mt-0.5">{r.institution}</div>
                    )}
                    <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1">
                      <MetricRow label="Balance" value={fmtMoney(r.balance ?? 0)} />
                      <MetricRow label="Currency" value={r.currency} />
                    </div>
                    {r.notes && (
                      <p className="mt-3 text-caption text-ink-tertiary text-pretty">{r.notes}</p>
                    )}
                  </div>
                  <DeleteCashButton householdId={params.h} id={r.id} />
                </div>
              </SurfaceCard>
            ))}
            <div className="text-right text-caption text-ink-tertiary pr-2 pt-1">
              Total: <span className="text-ink-primary font-medium">{fmtMoney(total)}</span>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
