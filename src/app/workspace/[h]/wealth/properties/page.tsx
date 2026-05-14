import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireOnboarded } from "@/lib/auth";
import { SurfaceCard, CardHeader, EmptyState, MetricRow } from "@/components/workspace/cards";
import { fmtMoney, fmtPercent } from "@/components/workspace/format";
import { PropertyForm } from "./PropertyForm";
import { DeletePropertyButton } from "./DeletePropertyButton";
import { Building2, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Properties — Family Wealth Lab",
};

type PropertyRow = {
  id: string;
  name: string;
  type: "ppor" | "owner_occupied" | "investment";
  purchase_price: number | null;
  current_value: number | null;
  loan_amount: number | null;
  interest_rate: number | null;
  loan_term_years: number | null;
  settlement_date: string | null;
  rental_income: number | null;
  expenses: number | null;
  notes: string | null;
};

interface Props {
  params: { h: string };
}

export default async function PropertiesPage({ params }: Props) {
  await requireOnboarded(`/workspace/${params.h}/wealth/properties`);
  const supabase = createSupabaseServerClient();
  const { data: rows } = await supabase
    .schema("ledger")
    .from("properties")
    .select("*")
    .eq("household_id", params.h)
    .order("created_at", { ascending: true });

  const properties = (rows ?? []) as PropertyRow[];
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-8 sm:space-y-10">
      <header>
        <div className="syslabel mb-3">
          <span className="syslabel-bracket">[02]</span>
          <span>Wealth · Properties</span>
        </div>
        <h1 className="text-h3 sm:text-h2 text-ink-primary tracking-tight">Property ledger</h1>
        <p className="mt-3 text-body text-ink-tertiary max-w-2xl text-pretty">
          Every property your engine considers — PPOR, investment, and planned
          purchases. The Decision Engine reads this ledger for equity,
          serviceability, and rental income.
        </p>
      </header>

      <section>
        <div className="syslabel mb-4">
          <span className="syslabel-bracket">[A]</span>
          <span>Add property</span>
        </div>
        <SurfaceCard>
          <PropertyForm householdId={params.h} />
        </SurfaceCard>
      </section>

      <section className="space-y-4">
        <div className="syslabel">
          <span className="syslabel-bracket">[B]</span>
          <span>Portfolio · {properties.length} {properties.length === 1 ? "row" : "rows"}</span>
        </div>

        {properties.length === 0 ? (
          <EmptyState
            index="·"
            eyebrow="No properties yet"
            title="Add your home or first investment property."
            body="Start with your PPOR (primary residence). You can add investment properties and planned purchases afterwards — the engine treats them differently based on settlement date."
          />
        ) : (
          <div className="grid gap-4">
            {properties.map((p) => {
              const settled = !p.settlement_date || p.settlement_date <= today;
              const equity =
                (p.current_value ?? 0) - (p.loan_amount ?? 0);
              return (
                <SurfaceCard key={p.id}>
                  <CardHeader
                    index={settled ? "[●]" : "[○]"}
                    eyebrow={`${p.type === "ppor" || p.type === "owner_occupied" ? "PPOR" : "Investment"} · ${settled ? "Settled" : "Planned"}`}
                    title={
                      <span className="inline-flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-ink-quaternary" />
                        {p.name}
                      </span>
                    }
                    trailing={<DeletePropertyButton householdId={params.h} propertyId={p.id} />}
                  />
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 -mx-1">
                    <MetricRow label="Current value" value={fmtMoney(p.current_value)} />
                    <MetricRow label="Loan balance" value={fmtMoney(p.loan_amount)} tone="negative" />
                    <MetricRow
                      label="Equity"
                      value={fmtMoney(equity)}
                      tone={equity >= 0 ? "positive" : "negative"}
                    />
                    <MetricRow label="Purchase price" value={fmtMoney(p.purchase_price)} />
                    <MetricRow label="Interest rate" value={p.interest_rate != null ? fmtPercent(Number(p.interest_rate)) : "—"} />
                    <MetricRow
                      label={
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-ink-quaternary" />
                          Settlement
                        </span>
                      }
                      value={p.settlement_date ?? "—"}
                    />
                    {p.type !== "ppor" && p.type !== "owner_occupied" && (
                      <>
                        <MetricRow label="Rental (mo)" value={fmtMoney(p.rental_income)} tone="positive" />
                        <MetricRow label="Expenses (mo)" value={fmtMoney(p.expenses)} />
                      </>
                    )}
                  </div>
                  {p.notes && (
                    <p className="mt-4 text-caption text-ink-quaternary border-l-2 border-line pl-3 italic">
                      {p.notes}
                    </p>
                  )}
                </SurfaceCard>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
