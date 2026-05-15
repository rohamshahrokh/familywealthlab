import { requireOnboarded } from "@/lib/auth";
import { PortfolioPanel } from "../_components/PortfolioPanel";
import { DEMO_STOCK_HOLDINGS } from "@/lib/finance/demoData";

export const dynamic = "force-dynamic";
export const metadata = { title: "Stock portfolio — Family Wealth Lab" };

export default async function StockPortfolioPage({ params }: { params: { h: string } }) {
  await requireOnboarded(`/workspace/${params.h}/portfolio/stocks`);

  return (
    <div className="space-y-8 sm:space-y-10">
      <header>
        <div className="syslabel mb-3">
          <span className="syslabel-bracket">[02·09]</span>
          <span>Portfolio · Stocks</span>
        </div>
        <h1 className="text-h3 sm:text-h2 text-ink-primary tracking-tight">Stock portfolio</h1>
        <p className="mt-3 text-body text-ink-tertiary max-w-2xl text-pretty">
          Live snapshot of your stock holdings — value, cost basis, unrealised gains,
          DCA schedules, and planned orders. Modelling estimates only — not financial advice.
        </p>
      </header>

      <PortfolioPanel
        assetClass="stock"
        holdings={DEMO_STOCK_HOLDINGS}
        title="Stocks"
      />
    </div>
  );
}
