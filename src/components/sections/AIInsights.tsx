"use client";
import * as React from "react";
import { Eyebrow, Section } from "@/components/ui/Section";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { Droplets, Receipt, Flame, Scale, ArrowRight } from "lucide-react";

const INSIGHTS = [
  {
    icon: Droplets,
    eyebrow: "Liquidity",
    title: "Buffer dips below 3 months at month 14",
    body: "Defer discretionary spend by $640/mo, or stage the EV purchase to Q4 FY26 to restore buffer.",
    metric: { k: "Risk", v: "Medium" },
  },
  {
    icon: Receipt,
    eyebrow: "Tax",
    title: "Salary sacrifice headroom: $11,200",
    body: "Concessional cap utilisation at 68%. Filling the gap by FY-end saves est. $5,040 tax.",
    metric: { k: "Tax saved", v: "$5,040" },
  },
  {
    icon: Flame,
    eyebrow: "FIRE",
    title: "Refinance window opens in 47 days",
    body: "Locking 5.84% IO and redirecting $1,840/mo to VGS pulls FIRE forward by 4 years.",
    metric: { k: "FIRE Δ", v: "−4y" },
  },
  {
    icon: Scale,
    eyebrow: "Rebalance",
    title: "Allocation drifted 7pp from target",
    body: "Crypto exposure now 14% vs 7% target. One-click rebalance keeps tax drag under $400.",
    metric: { k: "Drift", v: "+7pp" },
  },
];

export function AIInsights() {
  return (
    <Section spacing="xl" id="ai">
      <Reveal className="max-w-2xl">
        <Eyebrow>Intelligence</Eyebrow>
        <h2 className="mt-5 text-display text-ink-primary text-balance">
          A quiet layer that watches your money.
        </h2>
        <p className="mt-5 text-lead text-ink-tertiary text-pretty max-w-xl">
          Not a chatbot. A continuous intelligence layer that reads your model and
          surfaces only the single decision worth your attention this month.
        </p>
      </Reveal>

      <Stagger className="mt-14 grid md:grid-cols-2 gap-4" delay={0.05}>
        {INSIGHTS.map((x) => (
          <StaggerItem key={x.title}>
            <article className="card-surface p-6 group hover:border-line-strong transition-colors duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-line bg-bg-inset text-accent-500">
                    <x.icon className="h-4 w-4" />
                  </span>
                  <span className="text-eyebrow uppercase text-ink-quaternary">{x.eyebrow}</span>
                </div>
                <span className="text-caption text-ink-tertiary num">{x.metric.k} · {x.metric.v}</span>
              </div>
              <h3 className="mt-5 text-h3 text-ink-primary">{x.title}</h3>
              <p className="mt-3 text-body text-ink-tertiary">{x.body}</p>
              <div className="mt-5 pt-5 hairline flex items-center justify-between">
                <span className="text-caption uppercase text-ink-quaternary">Surfaced today</span>
                <span className="inline-flex items-center gap-1.5 text-body-sm text-accent-500 group-hover:text-accent-500 transition-colors">
                  Open scenario <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </article>
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  );
}
