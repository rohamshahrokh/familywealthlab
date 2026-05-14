import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireOnboarded } from "@/lib/auth";
import { SurfaceCard, EmptyState, MetricRow } from "@/components/workspace/cards";
import { fmtMoney } from "@/components/workspace/format";
import { CryptoForm } from "./CryptoForm";
import { DeleteCryptoButton } from "./DeleteCryptoButton";
import { Bitcoin } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Crypto — Family Wealth Lab" };

type Row = {
  id: string;
  symbol: string;
  current_holding: number;
  current_price: number | null;
  average_cost: number | null;
  currency: string | null;
  notes: string | null;
};

export default async function CryptoPage({ params }: { params: { h: string } }) {
  await requireOnboarded(`/workspace/${params.h}/input/crypto`);
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.schema("ledger").from("crypto")
    .select("*").eq("household_id", params.h).order("created_at", { ascending: true });
  const rows = (data ?? []) as Row[];

  const marketValueOf = (r: Row) => (Number(r.current_holding) || 0) * (Number(r.current_price) || 0);
  const costBasisOf  = (r: Row) => (Number(r.current_holding) || 0) * (Number(r.average_cost) || 0);
  const totalMarket = rows.reduce((s, r) => s + marketValueOf(r), 0);
  const totalCost   = rows.reduce((s, r) => s + costBasisOf(r), 0);
  const unrealised  = totalMarket - totalCost;

  return (
    <div className="space-y-8 sm:space-y-10">
      <header>
        <div className="syslabel mb-3">
          <span className="syslabel-bracket">[02·CRY]</span>
          <span>Input · Crypto</span>
        </div>
        <h1 className="text-h3 sm:text-h2 text-ink-primary tracking-tight">Crypto ledger</h1>
        <p className="mt-3 text-body text-ink-tertiary max-w-2xl text-pretty">
          Every crypto holding. Snapshot reads market value into accessible
          wealth. The CGT simulator reads cost basis for unrealised gains.
        </p>
      </header>

      <section>
        <div className="syslabel mb-4">
          <span className="syslabel-bracket">[A]</span><span>Add holding</span>
        </div>
        <SurfaceCard><CryptoForm householdId={params.h} /></SurfaceCard>
      </section>

      <section className="space-y-4">
        <div className="syslabel">
          <span className="syslabel-bracket">[B]</span>
          <span>Holdings · {rows.length} {rows.length === 1 ? "row" : "rows"}</span>
        </div>
        {rows.length === 0 ? (
          <EmptyState
            index="·"
            eyebrow="Empty ledger"
            title="No crypto holdings yet"
            body="Add your first symbol above. The Snapshot will include market value in accessible wealth and the CGT simulator can use cost basis."
          />
        ) : (
          <div className="space-y-3">
            {rows.map((r) => (
              <SurfaceCard key={r.id}>
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-bg-inset inline-flex items-center justify-center text-ink-secondary shrink-0">
                    <Bitcoin className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-body font-medium text-ink-primary mono">{r.symbol}</span>
                      <span className="text-caption mono uppercase text-ink-quaternary">{r.currency ?? "AUD"}</span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1">
                      <MetricRow label="Units" value={String(r.current_holding)} />
                      <MetricRow label="Price" value={r.current_price != null ? fmtMoney(r.current_price) : "—"} />
                      <MetricRow label="Market value" value={fmtMoney(marketValueOf(r))} />
                      <MetricRow label="Avg cost" value={r.average_cost != null ? fmtMoney(r.average_cost) : "—"} />
                    </div>
                    {r.notes && (
                      <p className="mt-3 text-caption text-ink-tertiary text-pretty">{r.notes}</p>
                    )}
                  </div>
                  <DeleteCryptoButton householdId={params.h} id={r.id} />
                </div>
              </SurfaceCard>
            ))}
            <div className="text-right text-caption text-ink-tertiary pr-2 pt-1 space-x-3">
              <span>Cost basis: <span className="text-ink-primary font-medium">{fmtMoney(totalCost)}</span></span>
              <span>Market: <span className="text-ink-primary font-medium">{fmtMoney(totalMarket)}</span></span>
              <span>Unrealised: <span className={unrealised >= 0 ? "text-emerald-700 font-medium" : "text-rose-700 font-medium"}>{fmtMoney(unrealised)}</span></span>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
