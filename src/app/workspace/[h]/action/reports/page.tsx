import Link from "next/link";
import { requireOnboarded } from "@/lib/auth";
import { SurfaceCard, CardHeader } from "@/components/workspace/cards";

export const dynamic = "force-dynamic";
export const metadata = { title: "Reports — Family Wealth Lab" };

const REPORTS = [
  {
    code: "R01",
    title: "Annual wealth statement",
    body: "A one-page summary of net worth, debt, super, and accessible vs locked wealth as at 30 June.",
    cadence: "Annual",
  },
  {
    code: "R02",
    title: "Tax-time pack",
    body: "Capital gains, deductible interest, negative gearing summary and PAYG reconciliation — ready for your accountant.",
    cadence: "Annual",
  },
  {
    code: "R03",
    title: "Quarterly cashflow review",
    body: "12-week look-back of income, expenses, and event impact vs forecast. Highlights drift.",
    cadence: "Quarterly",
  },
  {
    code: "R04",
    title: "Property performance",
    body: "Yield, capital growth, equity unlocked, and any rule changes that altered your numbers.",
    cadence: "Annual",
  },
  {
    code: "R05",
    title: "Portfolio statement (stocks + crypto)",
    body: "Holdings, allocations, DCA activity, planned orders and an unrealised G/L heat-map.",
    cadence: "Monthly",
  },
  {
    code: "R06",
    title: "Insurance & risk audit",
    body: "Income protection, life, TPD and trauma cover mapped to your household exposure.",
    cadence: "Annual",
  },
];

export default async function ReportsPage({ params }: { params: { h: string } }) {
  await requireOnboarded(`/workspace/${params.h}/action/reports`);

  return (
    <div className="space-y-8 sm:space-y-10">
      <header>
        <div className="syslabel mb-3">
          <span className="syslabel-bracket">[05·05]</span>
          <span>Action · Reports</span>
        </div>
        <h1 className="text-h3 sm:text-h2 text-ink-primary tracking-tight">Reports</h1>
        <p className="mt-3 text-body text-ink-tertiary max-w-2xl text-pretty">
          Auto-generated statements pulled from your ledger and the modelling engines.
          Each report is a snapshot, not financial advice.
        </p>
      </header>

      <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {REPORTS.map((r) => (
          <SurfaceCard key={r.code}>
            <div className="flex items-start justify-between gap-3 mb-2">
              <CardHeader index={`[${r.code}]`} eyebrow={r.cadence} title={r.title} />
            </div>
            <p className="text-body-sm text-ink-tertiary mt-1">{r.body}</p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full bg-ink-primary text-white px-4 h-9 text-body-sm font-medium hover:bg-graphite-800 focus-ring"
              >
                Generate
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-line bg-bg-inset px-4 h-9 text-body-sm text-ink-secondary hover:text-ink-primary hover:bg-bg-base focus-ring"
              >
                Schedule
              </button>
            </div>
          </SurfaceCard>
        ))}
      </section>

      <SurfaceCard>
        <CardHeader index="[i]" eyebrow="Coming soon" title="Custom report builder" />
        <p className="text-body-sm text-ink-tertiary mt-1">
          Mix any ledger slice with any model output — bills, properties, gearing,
          super, capital gains — into a single PDF. Send to yourself or your accountant on a schedule.
        </p>
        <Link
          href={`/workspace/${params.h}/action/help`}
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-line bg-bg-inset px-4 h-9 text-body-sm text-ink-secondary hover:text-ink-primary hover:bg-bg-base focus-ring w-fit"
        >
          Request early access
        </Link>
      </SurfaceCard>
    </div>
  );
}
