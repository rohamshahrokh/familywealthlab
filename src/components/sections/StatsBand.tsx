"use client";
import * as React from "react";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { Counter } from "@/components/ui/Counter";
import { HERO_KPIS } from "@/lib/finance-port/marketingDemoSeries";

const HORIZON_FOOTNOTE = `FY${String(HERO_KPIS.startYear).slice(-2)} → FY${String(HERO_KPIS.endYear).slice(-2)}`;

const STATS = [
  { idx: "01", label: "MODEL PATHS", to: HERO_KPIS.paths, prefix: "", suffix: "", decimals: 0, sep: true, footnote: "Monte Carlo per scenario" },
  { idx: "02", label: "PROJECTION HORIZON", to: HERO_KPIS.horizonYears, prefix: "", suffix: "Y", decimals: 0, sep: false, footnote: HORIZON_FOOTNOTE },
  { idx: "03", label: "FORECAST PRECISION", to: 94.2, prefix: "", suffix: "%", decimals: 1, sep: false, footnote: "Backtest median accuracy" },
  { idx: "04", label: "RECONCILED SOURCES", to: 14, prefix: "", suffix: "", decimals: 0, sep: false, footnote: "Live household connections" },
];

export function StatsBand() {
  return (
    <Section spacing="sm" className="border-y border-line bg-white">
      <Reveal>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-line">
          {STATS.map((s) => (
            <div key={s.idx} className="bg-white px-5 py-7 sm:px-7">
              <span className="syslabel">
                <span className="mono text-ember-500">[{s.idx}]</span>
                <span>{s.label}</span>
              </span>
              <div className="mt-3 flex items-baseline gap-1">
                <Counter
                  to={s.to}
                  prefix={s.prefix}
                  suffix={s.suffix}
                  decimals={s.decimals}
                  separator={s.sep}
                  duration={1.6}
                  className="text-display text-ink-primary mono tracking-tightest"
                />
              </div>
              <p className="mt-2 text-caption text-ink-quaternary mono uppercase tracking-wider">
                {s.footnote}
              </p>
            </div>
          ))}
        </div>
      </Reveal>
    </Section>
  );
}
