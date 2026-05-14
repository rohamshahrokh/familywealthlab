"use client";
import * as React from "react";
import { motion } from "framer-motion";
import { Section, SystemLabel } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { AmbientMesh, ScanLines } from "@/components/ui/AmbientMesh";
import { Sparkline } from "@/components/ui/Sparkline";
import { Counter } from "@/components/ui/Counter";
import { Droplets, Receipt, Flame, Scale, ArrowRight } from "lucide-react";

type Status = "NEW" | "WATCH" | "READY";

const INSIGHTS: Array<{
  idx: string;
  icon: React.ComponentType<{ className?: string }>;
  tag: string;
  title: string;
  body: string;
  risk: "LOW" | "MEDIUM" | "HIGH";
  metric: string;
  status: Status;
  spark: number[];
}> = [
  {
    idx: "AI.01",
    icon: Droplets,
    tag: "LIQUIDITY",
    title: "Buffer dips below 3 months at month 14",
    body: "Defer discretionary spend by $640/mo, or stage the EV purchase to Q4 FY26 to restore buffer.",
    risk: "MEDIUM",
    metric: "−$640/mo",
    status: "NEW",
    spark: [100, 96, 92, 85, 78, 72, 64, 55, 48, 42, 38, 36],
  },
  {
    idx: "AI.02",
    icon: Receipt,
    tag: "TAX",
    title: "Salary sacrifice headroom: $11,200",
    body: "Concessional cap utilisation at 68%. Filling the gap by FY-end saves est. $5,040 tax.",
    risk: "LOW",
    metric: "−$5,040 tax",
    status: "READY",
    spark: [22, 30, 38, 44, 52, 56, 60, 64, 66, 68, 68, 68],
  },
  {
    idx: "AI.03",
    icon: Flame,
    tag: "FIRE",
    title: "Refinance window opens in 47 days",
    body: "Locking 5.84% IO and redirecting $1,840/mo to VGS pulls FIRE forward by 4 years.",
    risk: "HIGH",
    metric: "FIRE −4y",
    status: "NEW",
    spark: [40, 42, 46, 50, 56, 60, 66, 72, 76, 80, 82, 84],
  },
  {
    idx: "AI.04",
    icon: Scale,
    tag: "REBALANCE",
    title: "Allocation drifted 7pp from target",
    body: "Crypto exposure now 14% vs 7% target. One-click rebalance keeps tax drag under $400.",
    risk: "LOW",
    metric: "Drift +7pp",
    status: "WATCH",
    spark: [60, 64, 66, 68, 72, 76, 80, 82, 84, 86, 88, 90],
  },
];

export function AIInsights() {
  return (
    <section id="ai" className="relative isolate overflow-hidden bg-bg-deep text-ink-ondark py-24 sm:py-28">
      <AmbientMesh tone="dark" />
      <ScanLines />
      <div className="absolute inset-0 grid-fine-ondark mask-fade-y opacity-30 pointer-events-none -z-10" aria-hidden />

      <div className="container mx-auto relative">
        <div className="grid lg:grid-cols-12 gap-10 items-start">
          <Reveal className="lg:col-span-5">
            <SystemLabel index="08" label="INTELLIGENCE LAYER" />
            <h2 className="mt-4 text-display text-ink-ondark text-balance tracking-tighter">
              A quiet layer that <span className="text-ember-500">watches your money.</span>
            </h2>
            <p className="mt-5 text-lead text-ink-ondarkSecondary text-pretty max-w-md">
              Not a chatbot. A continuous intelligence layer that reads your model and
              surfaces only the single decision worth your attention this month.
            </p>
            <div className="mt-7 inline-flex items-center gap-2 chip-ondark">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-ember-500 animate-pulse-soft" />
              <span className="mono text-[0.7rem] tracking-wider">SIGNAL · LIVE</span>
            </div>

            {/* Mini summary tile — "insights this week" */}
            <div className="mt-8 grid grid-cols-2 gap-2.5 max-w-sm">
              {[
                { k: "SURFACED", v: 4, suffix: "" },
                { k: "DOLLARS", v: 8.4, prefix: "$", suffix: "K", decimals: 1 },
                { k: "FIRE", v: 4, prefix: "−", suffix: "Y" },
                { k: "RISK", v: 2, suffix: " HIGH" },
              ].map((x) => (
                <div
                  key={x.k}
                  className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-2.5"
                >
                  <p className="text-[0.6rem] uppercase mono tracking-wider text-ink-ondarkTertiary">
                    {x.k}
                  </p>
                  <p className="mt-0.5 text-h4 text-ink-ondark mono">
                    <Counter
                      to={x.v}
                      prefix={x.prefix ?? ""}
                      suffix={x.suffix ?? ""}
                      decimals={(x as { decimals?: number }).decimals ?? 0}
                      duration={1.4}
                    />
                  </p>
                </div>
              ))}
            </div>
          </Reveal>

          <div className="lg:col-span-7 flex flex-col gap-2.5">
            {INSIGHTS.map((x, i) => {
              const Icon = x.icon;
              const riskTone =
                x.risk === "HIGH" ? "text-ember-500" :
                x.risk === "MEDIUM" ? "text-warning" :
                "text-ink-ondarkSecondary";
              const statusTone =
                x.status === "NEW" ? "text-ember-500 bg-ember-500/15" :
                x.status === "WATCH" ? "text-warning bg-warning/15" :
                "text-positive bg-positive/15";
              const isFresh = x.status === "NEW";
              return (
                <motion.article
                  key={x.idx}
                  initial={{ opacity: 0, x: 14 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="relative card-dark p-5 group hover:border-ember-500/30 transition-colors duration-300"
                >
                  {/* Side accent rail — pulses if NEW */}
                  <div
                    aria-hidden
                    className={`absolute left-0 top-5 bottom-5 w-[2px] rounded-r-full transition-colors ${
                      isFresh
                        ? "bg-ember-500 animate-pulse-soft"
                        : "bg-ember-500/40 group-hover:bg-ember-500"
                    }`}
                  />

                  <div className="flex items-start gap-4 pl-3">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-ember-500 shrink-0">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <span className="syslabel text-[0.65rem] text-ink-ondarkSecondary inline-flex items-center gap-1.5">
                          <span className="mono text-ember-500">[{x.idx}]</span>
                          <span>{x.tag}</span>
                          <span className={`text-[0.55rem] mono uppercase tracking-wider rounded-sm px-1 py-px ${statusTone}`}>
                            {x.status}
                          </span>
                        </span>
                        <span className="text-caption text-ink-ondarkTertiary mono">
                          RISK <span className={riskTone}>{x.risk}</span>
                        </span>
                      </div>
                      <h3 className="mt-1.5 text-h4 text-ink-ondark tracking-tight">{x.title}</h3>
                      <p className="mt-2 text-body-sm text-ink-ondarkSecondary leading-snug">{x.body}</p>
                      <div className="mt-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <span className="text-body-sm text-ember-500 mono shrink-0">{x.metric}</span>
                          <Sparkline
                            data={x.spark}
                            width={120}
                            height={22}
                            stroke="#C97030"
                            fill={null}
                            endDot={false}
                            duration={0.9}
                            delay={i * 0.1 + 0.3}
                            className="w-[120px] h-[22px] opacity-90"
                          />
                        </div>
                        <span className="inline-flex items-center gap-1.5 text-body-sm text-ink-ondark group-hover:text-ember-500 transition-colors shrink-0">
                          <span className="mono text-[0.7rem]">[{x.idx}.OPEN]</span>
                          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
