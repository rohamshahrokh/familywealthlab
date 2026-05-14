import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireOnboarded } from "@/lib/auth";
import { SurfaceCard, EmptyState, MetricRow } from "@/components/workspace/cards";
import { fmtMoney, fmtPercent } from "@/components/workspace/format";
import { SuperForm } from "./SuperForm";
import { DeleteSuperButton } from "./DeleteSuperButton";
import { ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Superannuation — Family Wealth Lab" };

type SuperRow = {
  id: string;
  owner_label: string | null;
  provider: string | null;
  balance: number | null;
  contribution_rate: number | null;
  preservation_age: number | null;
  notes: string | null;
};

export default async function SuperPage({ params }: { params: { h: string } }) {
  await requireOnboarded(`/workspace/${params.h}/wealth/super`);
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.schema("ledger").from("super_accounts")
    .select("*").eq("household_id", params.h).order("created_at", { ascending: true });
  const rows = (data ?? []) as SuperRow[];
  const total = rows.reduce((s, r) => s + (Number(r.balance) || 0), 0);

  return (
    <div className="space-y-8 sm:space-y-10">
      <header>
        <div className="syslabel mb-3">
          <span className="syslabel-bracket">[02·SUPER]</span>
          <span>Input · Superannuation</span>
        </div>
        <h1 className="text-h3 sm:text-h2 text-ink-primary tracking-tight">Super ledger</h1>
        <p className="mt-3 text-body text-ink-tertiary max-w-2xl text-pretty">
          Locked retirement wealth — preserved until preservation age. The
          Snapshot separates this from Accessible Wealth so FIRE projections
          stay honest.
        </p>
      </header>

      <section>
        <div className="syslabel mb-4"><span className="syslabel-bracket">[A]</span><span>Add super account</span></div>
        <SurfaceCard><SuperForm householdId={params.h} /></SurfaceCard>
      </section>

      <section className="space-y-4">
        <div className="syslabel">
          <span className="syslabel-bracket">[B]</span>
          <span>Accounts · {rows.length} {rows.length === 1 ? "row" : "rows"}</span>
        </div>
        {rows.length === 0 ? (
          <EmptyState index="·" eyebrow="Empty ledger" title="No super accounts yet"
            body="Add each household member's super balance — locked retirement wealth shows on the Command Centre." />
        ) : (
          <div className="space-y-3">
            {rows.map((r) => (
              <SurfaceCard key={r.id}>
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-bg-inset inline-flex items-center justify-center text-ink-secondary shrink-0">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-body font-medium text-ink-primary">{r.owner_label || "Super"}</span>
                      {r.provider && <span className="text-caption text-ember-500 mono uppercase">{r.provider}</span>}
                    </div>
                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1">
                      <MetricRow label="Balance" value={fmtMoney(r.balance ?? 0)} />
                      <MetricRow label="Contribution" value={r.contribution_rate != null ? fmtPercent(r.contribution_rate) : "—"} />
                      <MetricRow label="Preservation" value={r.preservation_age != null ? `${r.preservation_age} yrs` : "—"} />
                    </div>
                    {r.notes && <p className="mt-3 text-caption text-ink-tertiary text-pretty">{r.notes}</p>}
                  </div>
                  <DeleteSuperButton householdId={params.h} id={r.id} />
                </div>
              </SurfaceCard>
            ))}
            <div className="text-right text-caption text-ink-tertiary pr-2 pt-1">
              Total super: <span className="text-ink-primary font-medium">{fmtMoney(total)}</span>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
