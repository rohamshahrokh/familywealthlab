"use client";
import * as React from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { Eyebrow, Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { Wallet, LineChart, GitBranch, Sparkles } from "lucide-react";

const MODULES = [
  {
    eyebrow: "Module 01",
    title: "Net Worth Engine",
    body: "Every asset and liability — cash, property, super, equities — collapsed into one continuously reconciled household model.",
    bullets: ["Live asset & liability roll-up", "Daily reconciliation", "Per-member views"],
    icon: Wallet,
  },
  {
    eyebrow: "Module 02",
    title: "Forecast Engine",
    body: "Monte Carlo projections across 5,000 paths model your true range of outcomes — not a single fragile straight line.",
    bullets: ["P10 / P50 / P90 bands", "20-year horizon", "Stress-tested to rate shocks"],
    icon: LineChart,
  },
  {
    eyebrow: "Module 03",
    title: "Decision Engine",
    body: "Run any household decision — buy, refinance, retire, restructure — against your own real numbers in seconds.",
    bullets: ["Scenario comparison", "Tax-aware modelling", "Decision audit trail"],
    icon: GitBranch,
  },
  {
    eyebrow: "Module 04",
    title: "AI Insights",
    body: "A quiet intelligence layer reads your model continuously and surfaces only the decisions worth your attention this month.",
    bullets: ["Continuous opportunity scan", "Plain-English explanations", "Tax & cashflow flags"],
    icon: Sparkles,
  },
];

export function CommandCenter() {
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const segment = 1 / MODULES.length;
  const activeIndex = useTransform(scrollYProgress, (v) => Math.min(MODULES.length - 1, Math.floor(v / segment)));

  return (
    <section id="command" ref={ref} className="relative">
      <div className="container mx-auto pt-28 sm:pt-36 pb-10">
        <Reveal className="max-w-2xl">
          <Eyebrow>The platform</Eyebrow>
          <h2 className="mt-5 text-display text-ink-primary text-balance">
            Four engines. One coherent surface.
          </h2>
          <p className="mt-5 text-lead text-ink-tertiary text-pretty max-w-xl">
            Family Wealth Lab is built from four tightly-integrated modules — each
            doing one thing exceptionally well, then composing into a single
            decision surface.
          </p>
        </Reveal>
      </div>

      {/* Sticky-scroll stage */}
      <div className="relative" style={{ height: `${MODULES.length * 110}vh` }}>
        <div className="sticky top-0 h-screen flex items-center">
          <div className="container mx-auto w-full">
            <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              {/* Left rail — progress + copy */}
              <div className="lg:col-span-5">
                <ProgressRail activeIndex={activeIndex} />
                <div className="relative mt-8 min-h-[280px]">
                  {MODULES.map((m, i) => (
                    <ModuleCopy key={i} m={m} i={i} activeIndex={activeIndex} />
                  ))}
                </div>
              </div>

              {/* Right — visualization */}
              <div className="lg:col-span-7">
                <div className="relative aspect-[4/3] sm:aspect-[5/3.5]">
                  {MODULES.map((m, i) => (
                    <ModuleVisual key={i} index={i} activeIndex={activeIndex} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProgressRail({ activeIndex }: { activeIndex: MotionValue<number> }) {
  const [idx, setIdx] = React.useState(0);
  React.useEffect(() => activeIndex.on("change", (v) => setIdx(Math.round(v))), [activeIndex]);
  return (
    <div className="flex items-center gap-2">
      {MODULES.map((_, i) => (
        <span
          key={i}
          className={`h-[2px] rounded-full transition-all duration-500 ease-calm ${
            i <= idx ? "bg-accent-500 w-10" : "bg-line w-5"
          }`}
        />
      ))}
    </div>
  );
}

function ModuleCopy({
  m,
  i,
  activeIndex,
}: {
  m: (typeof MODULES)[number];
  i: number;
  activeIndex: MotionValue<number>;
}) {
  const opacity = useTransform(activeIndex, (v) => {
    const dist = Math.abs(v - i);
    return dist < 0.5 ? 1 : Math.max(0, 1 - (dist - 0.5) * 2);
  });
  const y = useTransform(activeIndex, (v) => (v - i) * -10);
  const Icon = m.icon;
  return (
    <motion.div style={{ opacity, y }} className="absolute inset-0">
      <div className="inline-flex items-center gap-2.5">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-bg-inset text-accent-500">
          <Icon className="h-4 w-4" />
        </span>
        <span className="text-eyebrow uppercase text-ink-quaternary">{m.eyebrow}</span>
      </div>
      <h3 className="mt-5 text-h2 text-ink-primary">{m.title}</h3>
      <p className="mt-4 text-body-lg text-ink-tertiary max-w-md text-pretty">{m.body}</p>
      <ul className="mt-6 flex flex-col gap-2.5">
        {m.bullets.map((b) => (
          <li key={b} className="flex items-start gap-2.5 text-body-sm text-ink-secondary">
            <span className="mt-[7px] h-[5px] w-[5px] rounded-full bg-accent-500 shrink-0" />
            {b}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

function ModuleVisual({ index, activeIndex }: { index: number; activeIndex: MotionValue<number> }) {
  const opacity = useTransform(activeIndex, (v) => {
    const dist = Math.abs(v - index);
    return dist < 0.5 ? 1 : Math.max(0, 1 - (dist - 0.5) * 2.5);
  });
  const scale = useTransform(activeIndex, (v) => 1 - Math.abs(v - index) * 0.02);
  return (
    <motion.div style={{ opacity, scale }} className="absolute inset-0">
      {index === 0 && <VisualNetWorth />}
      {index === 1 && <VisualForecast />}
      {index === 2 && <VisualDecision />}
      {index === 3 && <VisualAI />}
    </motion.div>
  );
}

/* ── Visualizations ──────────────────────────────────────────── */

function VisualNetWorth() {
  return (
    <div className="card-surface p-6 h-full shadow-elevated flex flex-col">
      <div className="flex items-center justify-between">
        <span className="text-eyebrow uppercase text-ink-quaternary">Household</span>
        <span className="text-caption text-positive flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-positive" /> Live
        </span>
      </div>
      <div className="mt-4 flex items-baseline gap-3">
        <span className="text-display text-ink-primary num">$2.41M</span>
        <span className="text-body-sm text-positive num">+$184K YoY</span>
      </div>
      <div className="mt-6 grid grid-cols-4 gap-2.5 text-caption">
        {[
          ["Cash", "$58K"],
          ["Property", "$1.42M"],
          ["Super", "$420K"],
          ["Invested", "$512K"],
        ].map(([k, v]) => (
          <div key={k} className="rounded-md border border-line bg-bg-inset p-3">
            <p className="text-eyebrow uppercase text-ink-quaternary">{k}</p>
            <p className="mt-1 text-body-sm text-ink-primary num">{v}</p>
          </div>
        ))}
      </div>
      <div className="mt-auto pt-6 hairline">
        <p className="text-caption text-ink-quaternary">Sources reconciled: 14 · Last sync 12:42</p>
      </div>
    </div>
  );
}

function VisualForecast() {
  return (
    <div className="card-surface p-6 h-full shadow-elevated flex flex-col">
      <div className="flex items-center justify-between">
        <span className="text-eyebrow uppercase text-ink-quaternary">Forecast · 20y</span>
        <span className="text-caption text-ink-tertiary num">5,000 paths</span>
      </div>
      <div className="mt-3 flex items-baseline gap-3">
        <span className="text-h2 text-ink-primary num">$4.82M</span>
        <span className="text-caption text-ink-quaternary num">P50 by 2045</span>
      </div>
      <div className="mt-5 flex-1 rounded-md border border-line bg-bg-inset p-4">
        <svg viewBox="0 0 600 220" className="w-full h-full">
          <g stroke="rgba(60,60,67,0.10)" strokeWidth="1">
            {[40, 90, 140, 190].map((y) => (
              <line key={y} x1="0" y1={y} x2="600" y2={y} />
            ))}
          </g>
          <path
            d="M0,170 C100,150 200,128 300,100 C400,72 500,52 600,36 L600,90 C500,90 400,104 300,118 C200,132 100,158 0,178 Z"
            fill="rgba(62,106,149,0.10)"
          />
          <path
            d="M0,174 C100,156 200,134 300,108 C400,82 500,62 600,46"
            fill="none"
            stroke="#3E6A95"
            strokeWidth="1.75"
          />
        </svg>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2.5 text-caption">
        {[["P10", "$3.1M"], ["P50", "$4.82M"], ["P90", "$7.4M"]].map(([k, v]) => (
          <div key={k} className="rounded-md border border-line bg-bg-inset p-3">
            <p className="text-eyebrow uppercase text-ink-quaternary">{k}</p>
            <p className="mt-1 text-body-sm text-ink-primary num">{v}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function VisualDecision() {
  return (
    <div className="card-surface p-6 h-full shadow-elevated flex flex-col">
      <div className="flex items-center justify-between">
        <span className="text-eyebrow uppercase text-ink-quaternary">Scenario · Refinance to IO</span>
        <span className="text-caption text-positive num">+$418K NW</span>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-md border border-line bg-bg-inset p-4">
          <p className="text-eyebrow uppercase text-ink-quaternary">Baseline</p>
          <p className="mt-2 text-h3 text-ink-primary num">$4.82M</p>
          <p className="text-caption text-ink-quaternary num">FIRE 2043</p>
        </div>
        <div className="rounded-md border border-accent-500/40 bg-accent-50 p-4">
          <p className="text-eyebrow uppercase text-accent-500">Scenario</p>
          <p className="mt-2 text-h3 text-ink-primary num">$5.24M</p>
          <p className="text-caption text-positive num">FIRE 2039 · −4y</p>
        </div>
      </div>
      <div className="mt-5 flex flex-col gap-2 text-body-sm text-ink-secondary">
        <Row k="Cashflow Δ" v="+$1,840 / mo" tone="positive" />
        <Row k="Tax Δ FY26" v="−$2,140" tone="positive" />
        <Row k="Liquidity P10" v="$58K" tone="warning" />
      </div>
    </div>
  );
}

function Row({ k, v, tone }: { k: string; v: string; tone: "positive" | "warning" | "negative" }) {
  const c = tone === "positive" ? "text-positive" : tone === "warning" ? "text-warning" : "text-negative";
  return (
    <div className="flex items-center justify-between border-b border-line/60 py-1.5 last:border-b-0">
      <span className="text-ink-tertiary">{k}</span>
      <span className={`${c} num`}>{v}</span>
    </div>
  );
}

function VisualAI() {
  const insights = [
    { tag: "Refinance window", text: "Lock 5.84% IO · saves $1,840/mo cashflow." },
    { tag: "Div 293 risk", text: "Projected sacrifice triggers Div 293 at FY27." },
    { tag: "Offset rebalance", text: "Move $40K idle cash to offset · save $208/mo." },
  ];
  return (
    <div className="card-surface p-6 h-full shadow-elevated flex flex-col">
      <div className="flex items-center justify-between">
        <span className="text-eyebrow uppercase text-ink-quaternary">AI insights · today</span>
        <span className="text-caption text-ink-tertiary">3 surfaced</span>
      </div>
      <div className="mt-4 flex flex-col gap-3">
        {insights.map((x) => (
          <div key={x.tag} className="rounded-md border border-line bg-bg-inset p-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-accent-500" />
              <span className="text-eyebrow uppercase text-accent-500">{x.tag}</span>
            </div>
            <p className="mt-2 text-body-sm text-ink-secondary">{x.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
