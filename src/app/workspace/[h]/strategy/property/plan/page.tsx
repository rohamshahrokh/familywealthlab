import Link from "next/link";
import { requireOnboarded } from "@/lib/auth";
import { PropertyPlanPanel } from "../PropertyPlanPanel";
import { DEMO_PROPERTY, DEMO_IP } from "@/lib/finance/demoData";

export const dynamic = "force-dynamic";
export const metadata = { title: "Property plan — Family Wealth Lab" };

interface Props { params: { h: string } }

/**
 * Property Plan — interactive 30-year property projection.
 * Editable inputs, tax rule toggles, KPIs, paired charts.
 * All numbers are modelling estimates.
 */
export default async function PropertyPlanPage({ params }: Props) {
  await requireOnboarded(`/workspace/${params.h}/strategy/property/plan`);

  return (
    <div className="space-y-8 sm:space-y-10">
      <header>
        <div className="syslabel mb-3">
          <span className="syslabel-bracket">[03·02·B]</span>
          <span>Strategy · Property plan</span>
        </div>
        <h1 className="text-h3 sm:text-h2 text-ink-primary tracking-tight">Property plan</h1>
        <p className="mt-3 text-body text-ink-tertiary max-w-2xl text-pretty">
          Editable 30-year projection of value, loan balance and equity for a single
          property. Toggle tax rules and gearing to see how each lever moves the curve.
          Every figure is a modelling estimate.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href={`/workspace/${params.h}/strategy/property`}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-bg-inset px-4 h-9 text-body-sm text-ink-secondary hover:text-ink-primary hover:bg-bg-base focus-ring"
          >
            ← Back to strategy overview
          </Link>
          <Link
            href={`/workspace/${params.h}/wealth/properties`}
            className="inline-flex items-center gap-2 rounded-full bg-ink-primary text-white px-4 h-9 text-body-sm font-medium hover:bg-graphite-800 focus-ring"
          >
            Manage your properties →
          </Link>
        </div>
      </header>

      <section className="space-y-4">
        <div className="syslabel">
          <span className="syslabel-bracket">[A]</span>
          <span>Owner-occupier (PPOR demo)</span>
        </div>
        <PropertyPlanPanel initial={DEMO_PROPERTY} />
      </section>

      <section className="space-y-4 pt-4">
        <div className="syslabel">
          <span className="syslabel-bracket">[B]</span>
          <span>Investment property (demo)</span>
        </div>
        <PropertyPlanPanel initial={DEMO_IP} />
      </section>
    </div>
  );
}
