import Link from "next/link";
import { PLAN_LIST } from "@/lib/commercial/plans";
import { Check, Sparkles } from "lucide-react";

export const dynamic = "force-static";
export const metadata = {
  title: "Pricing — Family Wealth Lab",
  description: "Choose the plan that matches your household.",
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-bg-base text-ink-primary">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-16 sm:py-20">
        <header className="text-center max-w-2xl mx-auto mb-12">
          <div className="syslabel mb-3 inline-flex">
            <span className="syslabel-bracket">[$]</span>
            <span>Pricing</span>
          </div>
          <h1 className="text-h2 sm:text-h1 tracking-tight">Simple plans. Real numbers.</h1>
          <p className="mt-4 text-body text-ink-tertiary text-pretty">
            Every plan ships with the same proven dashboard, charts, and engines —
            you only pay to lift limits and unlock advanced strategy modules.
          </p>
        </header>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PLAN_LIST.map((p) => (
            <article
              key={p.id}
              className={`rounded-2xl border p-6 flex flex-col ${
                p.id === "pro"
                  ? "border-ember-500/40 bg-ember-500/[0.04] relative"
                  : "border-line bg-bg-inset"
              }`}
            >
              {p.id === "pro" && (
                <span className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-ember-500 text-white px-3 py-0.5 text-caption mono uppercase tracking-wider">
                  <Sparkles className="h-3 w-3" /> Most popular
                </span>
              )}
              <h2 className="text-h5 text-ink-primary">{p.name}</h2>
              <p className="mt-1 text-body-sm text-ink-tertiary text-pretty">{p.tagline}</p>
              <div className="mt-5 flex items-baseline gap-1.5">
                <span className="text-h2 text-ink-primary tabular-nums">
                  ${p.priceAUDMonthly}
                </span>
                <span className="text-caption text-ink-quaternary mono uppercase tracking-wider">
                  / mo
                </span>
              </div>
              {p.priceAUDAnnual > 0 && (
                <p className="text-caption text-ink-tertiary">
                  or ${p.priceAUDAnnual}/year (~17% off)
                </p>
              )}
              <ul className="mt-5 space-y-2.5 text-body-sm text-ink-secondary flex-1">
                {p.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={p.id === "free" ? "/signup" : `/signup?plan=${p.id}`}
                className={`mt-6 inline-flex items-center justify-center gap-2 rounded-full h-10 text-body-sm font-medium focus-ring ${
                  p.id === "pro"
                    ? "bg-ember-500 text-white hover:bg-ember-600"
                    : "bg-ink-primary text-white hover:bg-graphite-800"
                }`}
              >
                {p.id === "free" ? "Get started" : `Choose ${p.name}`}
              </Link>
            </article>
          ))}
        </div>

        <p className="mt-10 text-center text-caption text-ink-quaternary">
          Billing is not enabled yet — these prices and tiers describe the architecture only.
        </p>

        <div className="mt-6 text-center">
          <Link
            href="/demo"
            className="inline-flex items-center gap-2 rounded-full border border-line bg-bg-inset px-5 h-10 text-body-sm text-ink-secondary hover:text-ink-primary focus-ring"
          >
            Try the demo first →
          </Link>
        </div>
      </section>
    </div>
  );
}
