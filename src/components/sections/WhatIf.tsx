"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, TrendingDown, Flame, Scale, ArrowRight, type LucideIcon } from "lucide-react";
import { Section, Eyebrow } from "@/components/ui/Section";
import { cn } from "@/lib/utils";

interface Scenario {
  id: string;
  icon: LucideIcon;
  title: string;
  prompt: string;
  outcome: {
    headline: string;
    sub: string;
    metrics: { label: string; value: string; delta?: string; positive?: boolean }[];
  };
  accent: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: "ip",
    icon: Home,
    title: "Buy an investment property?",
    prompt:
      "Add a $980K Brisbane IP at 80% LVR, IO 5 years, 6.24% fixed. Re-run with current cashflow.",
    accent: "from-accent to-gold",
    outcome: {
      headline: "+$418K terminal NW · −2.4y FIRE",
      sub: "Median across 5,000 paths · 20-year horizon",
      metrics: [
        { label: "P50 NW · 2045", value: "$5.24M", delta: "+$418K", positive: true },
        { label: "FIRE year", value: "2037", delta: "−2.4y", positive: true },
        { label: "Liquidity P10", value: "$58K", delta: "−$32K", positive: false },
        { label: "Max DD", value: "−27%", delta: "+4pp", positive: false },
      ],
    },
  },
  {
    id: "fire45",
    icon: Flame,
    title: "Retire at 45?",
    prompt: "Stop working at age 45 and live off invested capital + super at 60.",
    accent: "from-gold to-accent",
    outcome: {
      headline: "Survival 72% · gap year 14",
      sub: "Pre-super bridge is the binding constraint",
      metrics: [
        { label: "Survival", value: "72%", delta: "−22pp", positive: false },
        { label: "Bridge cap", value: "$680K", delta: "needed", positive: false },
        { label: "Super at 60", value: "$1.84M", delta: "P50", positive: true },
        { label: "Median DD", value: "−31%", delta: "+8pp", positive: false },
      ],
    },
  },
  {
    id: "rates",
    icon: TrendingDown,
    title: "Rates hit 8%?",
    prompt: "Cash rate +200bps for 18 months · IO refinance blocked under APRA 3% buffer.",
    accent: "from-negative to-accent",
    outcome: {
      headline: "Cashflow gap $1,420/mo · survival 88%",
      sub: "Refinance window closes at month 14",
      metrics: [
        { label: "Monthly gap", value: "$1,420", delta: "−$1.4K", positive: false },
        { label: "Survival", value: "88%", delta: "−6pp", positive: false },
        { label: "Refi pressure", value: "High", delta: "trigger", positive: false },
        { label: "Buffer mo.", value: "9", delta: "from 18", positive: false },
      ],
    },
  },
  {
    id: "debt",
    icon: Scale,
    title: "Invest vs pay down debt?",
    prompt:
      "Compare $48K/yr surplus into VGS DCA vs PPOR mortgage offset over 15 years.",
    accent: "from-info to-gold",
    outcome: {
      headline: "Invest +$184K · risk-adj. tie",
      sub: "DCA wins on expected; offset wins on volatility",
      metrics: [
        { label: "NW delta", value: "+$184K", delta: "invest", positive: true },
        { label: "Vol delta", value: "+11pp", delta: "invest", positive: false },
        { label: "Risk-adj.", value: "Tie", delta: "0.03σ", positive: true },
        { label: "Tax drag", value: "$24K", delta: "invest", positive: false },
      ],
    },
  },
];

export function WhatIf() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <Section id="what-if" className="relative">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[500px] w-[1100px] -translate-x-1/2 rounded-full bg-accent/[0.06] blur-[120px]" />
      </div>

      <div className="container-narrow">
        <div className="grid items-end gap-6 sm:grid-cols-[1fr_auto]">
          <div className="max-w-2xl">
            <Eyebrow>The What-If engine</Eyebrow>
            <h2 className="mt-4 text-balance font-display text-display-md text-ink-50">
              Ask anything.{" "}
              <span className="gradient-text-accent">Model everything.</span>
            </h2>
            <p className="mt-5 max-w-xl text-balance text-[16px] leading-relaxed text-ink-300 sm:text-[17px]">
              Every "what if" your household has ever asked, simulated against your real
              numbers in seconds. Click a card to expand the outcome.
            </p>
          </div>
          <div className="text-eyebrow text-ink-400">Tap a card to expand</div>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2">
          {SCENARIOS.map((s) => (
            <ScenarioCard
              key={s.id}
              scenario={s}
              active={active === s.id}
              onToggle={() => setActive((v) => (v === s.id ? null : s.id))}
            />
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ─────────── Card ─────────── */

function ScenarioCard({
  scenario,
  active,
  onToggle,
}: {
  scenario: Scenario;
  active: boolean;
  onToggle: () => void;
}) {
  const Icon = scenario.icon;

  return (
    <motion.button
      type="button"
      onClick={onToggle}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "group relative w-full overflow-hidden rounded-2xl text-left transition-all duration-500 ease-cinematic",
        "ring-1 ring-inset ring-white/[0.06]",
        active ? "bg-bg-elevated/70" : "bg-bg-surface/70 hover:bg-bg-elevated/60"
      )}
    >
      {/* Edge glow */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500",
          active ? "opacity-100" : "group-hover:opacity-60"
        )}
        style={{
          background:
            "radial-gradient(circle at 0% 0%, rgba(255,107,0,0.12), transparent 50%)",
        }}
      />

      <div className="relative p-6 sm:p-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br text-white", scenario.accent)}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="text-eyebrow text-ink-400">Scenario</div>
          </div>
          <div className="flex h-7 w-7 items-center justify-center rounded-full ring-1 ring-inset ring-white/10">
            <motion.div animate={{ rotate: active ? 45 : 0 }} transition={{ duration: 0.4 }}>
              <ArrowRight className="h-3.5 w-3.5 text-ink-200" />
            </motion.div>
          </div>
        </div>

        <h3 className="mt-5 font-display text-[22px] font-semibold tracking-tight text-ink-50 sm:text-[26px]">
          {scenario.title}
        </h3>
        <p className="mt-3 max-w-md text-[14px] leading-relaxed text-ink-300">{scenario.prompt}</p>

        <AnimatePresence initial={false}>
          {active && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="mt-6 rounded-xl bg-bg-base/40 p-5 ring-hairline">
                <div className="text-eyebrow text-accent">Outcome</div>
                <div className="num mt-1.5 font-display text-xl font-semibold text-ink-50">
                  {scenario.outcome.headline}
                </div>
                <div className="mt-1 text-[12.5px] text-ink-400">{scenario.outcome.sub}</div>

                <div className="mt-5 grid grid-cols-2 gap-2">
                  {scenario.outcome.metrics.map((m) => (
                    <div key={m.label} className="rounded-md bg-bg-surface/60 p-2.5 ring-hairline">
                      <div className="text-[10px] uppercase tracking-[0.12em] text-ink-400">
                        {m.label}
                      </div>
                      <div className="num mt-1 text-[15px] font-semibold text-ink-50">
                        {m.value}
                      </div>
                      {m.delta && (
                        <div
                          className={cn(
                            "num mt-0.5 text-[11px] font-medium",
                            m.positive ? "text-positive" : "text-negative"
                          )}
                        >
                          {m.delta}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.button>
  );
}
