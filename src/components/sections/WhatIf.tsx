"use client";
import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Eyebrow, Section } from "@/components/ui/Section";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { Home, Flame, TrendingDown, Scale, ChevronRight } from "lucide-react";

interface Scenario {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  outcomes: { label: string; value: string; delta: string; tone: "positive" | "warning" | "negative" }[];
  summary: { label: string; value: string };
}

const SCENARIOS: Scenario[] = [
  {
    icon: Home,
    title: "Buy an investment property",
    desc: "Add a $980K Brisbane IP at 80% LVR, IO 5 years, 6.24% fixed.",
    outcomes: [
      { label: "P50 NW · 2045", value: "$5.24M", delta: "+$418K", tone: "positive" },
      { label: "FIRE year", value: "2037", delta: "−2.4y", tone: "positive" },
      { label: "Liquidity P10", value: "$58K", delta: "−$32K", tone: "warning" },
      { label: "Max drawdown", value: "−27%", delta: "+4pp", tone: "negative" },
    ],
    summary: { label: "Median uplift", value: "+$418K terminal NW" },
  },
  {
    icon: Flame,
    title: "Retire at 45",
    desc: "Stop earning at 45, live off invested capital and super at 60.",
    outcomes: [
      { label: "Survival rate", value: "82%", delta: "−12pp", tone: "warning" },
      { label: "Required capital", value: "$3.1M", delta: "by age 45", tone: "positive" },
      { label: "Bridge years", value: "15y", delta: "Cash + ETF", tone: "positive" },
      { label: "Super at 60", value: "$1.4M", delta: "preservation", tone: "positive" },
    ],
    summary: { label: "Survival probability", value: "82% across 5,000 paths" },
  },
  {
    icon: TrendingDown,
    title: "Rates hit 8%",
    desc: "Cash rate +200bps for 18 months · IO refinance blocked under APRA 3% buffer.",
    outcomes: [
      { label: "Repayments Δ", value: "+$2,140/mo", delta: "vs baseline", tone: "negative" },
      { label: "Buffer drawdown", value: "−$38K", delta: "13mo to OK", tone: "warning" },
      { label: "Forecast NW", value: "$4.41M", delta: "−$410K", tone: "negative" },
      { label: "Recovery", value: "2031", delta: "to baseline", tone: "positive" },
    ],
    summary: { label: "Stress test", value: "Survives 18 months · tight" },
  },
  {
    icon: Scale,
    title: "Invest vs pay down debt",
    desc: "Compare $48K/yr surplus into VGS DCA vs PPOR mortgage offset over 15 years.",
    outcomes: [
      { label: "Invest path NW", value: "$5.61M", delta: "+$280K", tone: "positive" },
      { label: "Offset path NW", value: "$5.33M", delta: "baseline", tone: "positive" },
      { label: "Tax efficiency", value: "Invest +$24K", delta: "CGT 50% disc.", tone: "positive" },
      { label: "Risk-adjusted", value: "Offset −2σ", delta: "less volatile", tone: "warning" },
    ],
    summary: { label: "Tilt", value: "Invest +$280K, with volatility" },
  },
];

export function WhatIf() {
  const [open, setOpen] = React.useState<number | null>(0);

  return (
    <Section spacing="xl" id="whatif">
      <Reveal className="max-w-2xl">
        <Eyebrow>What-if Engine</Eyebrow>
        <h2 className="mt-5 text-display text-ink-primary text-balance">
          Model any household decision.
        </h2>
        <p className="mt-5 text-lead text-ink-tertiary text-pretty max-w-xl">
          Every "what if" your household has ever asked — simulated against your
          own real numbers, in seconds.
        </p>
      </Reveal>

      <Stagger className="mt-14 grid md:grid-cols-2 gap-4" delay={0.05}>
        {SCENARIOS.map((s, i) => {
          const isOpen = open === i;
          return (
            <StaggerItem key={s.title}>
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className={`group w-full text-left card-surface p-6 transition-all duration-300 ease-calm focus-ring ${
                  isOpen ? "border-accent-500/40" : "hover:border-line-strong"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-bg-inset text-accent-500 shrink-0">
                      <s.icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-eyebrow uppercase text-ink-quaternary">Scenario</p>
                      <h3 className="mt-1.5 text-h3 text-ink-primary">{s.title}</h3>
                    </div>
                  </div>
                  <ChevronRight
                    className={`h-4 w-4 text-ink-quaternary shrink-0 mt-1 transition-transform duration-300 ${
                      isOpen ? "rotate-90 text-accent-500" : "group-hover:translate-x-0.5"
                    }`}
                  />
                </div>

                <p className="mt-4 text-body-sm text-ink-tertiary">{s.desc}</p>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="open"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="mt-5 pt-5 hairline">
                        <div className="flex items-baseline justify-between gap-3">
                          <p className="text-eyebrow uppercase text-ink-quaternary">{s.summary.label}</p>
                          <p className="text-body-sm text-ink-primary num">{s.summary.value}</p>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-2.5">
                          {s.outcomes.map((o) => (
                            <div key={o.label} className="rounded-md border border-line bg-bg-inset p-3.5">
                              <p className="text-eyebrow uppercase text-ink-quaternary">{o.label}</p>
                              <p className="mt-1.5 text-h4 text-ink-primary num">{o.value}</p>
                              <p
                                className={`text-caption num ${
                                  o.tone === "positive"
                                    ? "text-positive"
                                    : o.tone === "warning"
                                    ? "text-warning"
                                    : "text-negative"
                                }`}
                              >
                                {o.delta}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </StaggerItem>
          );
        })}
      </Stagger>
    </Section>
  );
}
