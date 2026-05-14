import { CashflowForecastPanel } from "./CashflowForecastPanel";
import { DEMO_CASHFLOW, DEMO_COMMAND_KPIS } from "@/lib/finance/demoData";
import { requireOnboarded } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Cashflow forecast — Family Wealth Lab" };

export default async function CashflowForecastPage({ params }: { params: { h: string } }) {
  await requireOnboarded(`/workspace/${params.h}/forecast/cashflow`);
  return (
    <div className="space-y-8 sm:space-y-10">
      <header>
        <div className="syslabel mb-3">
          <span className="syslabel-bracket">[04·02]</span>
          <span>Forecast · Cashflow</span>
        </div>
        <h1 className="text-h3 sm:text-h2 text-ink-primary tracking-tight">Cashflow forecast</h1>
        <p className="mt-3 text-body text-ink-tertiary max-w-2xl text-pretty">
          Ten-year cashflow projection across cash, events, wealth and risk modes.
          Switch period and tax treatment to see how each lever moves the curve.
          Every figure is a modelling estimate.
        </p>
      </header>

      <CashflowForecastPanel
        initialInput={DEMO_CASHFLOW}
        propertyContext={{
          ppValue: 940_000, ppLoan: 560_000,
          ipValue: 615_000, ipLoan: 408_000,
          emergencyBufferMonths: 3,
          monthlyExpense: 11_250,
        }}
        accessibleWealth={DEMO_COMMAND_KPIS.accessibleWealth}
      />
    </div>
  );
}
