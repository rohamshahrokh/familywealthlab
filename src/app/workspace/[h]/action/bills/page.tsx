import { requireOnboarded } from "@/lib/auth";
import { BillsPanel } from "./BillsPanel";
import { DEMO_BILLS } from "@/lib/finance/demoData";

export const dynamic = "force-dynamic";
export const metadata = { title: "Recurring bills — Family Wealth Lab" };

export default async function RecurringBillsPage({ params }: { params: { h: string } }) {
  await requireOnboarded(`/workspace/${params.h}/action/bills`);

  return (
    <div className="space-y-8 sm:space-y-10">
      <header>
        <div className="syslabel mb-3">
          <span className="syslabel-bracket">[05·04]</span>
          <span>Action · Recurring bills</span>
        </div>
        <h1 className="text-h3 sm:text-h2 text-ink-primary tracking-tight">Recurring bills</h1>
        <p className="mt-3 text-body text-ink-tertiary max-w-2xl text-pretty">
          Every bill that hits your household — by frequency, member, and priority.
          Notifications, auto-match and payment cycles all live in one surface.
        </p>
      </header>

      <BillsPanel initial={DEMO_BILLS} />
    </div>
  );
}
