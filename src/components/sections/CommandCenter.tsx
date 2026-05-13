"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { Activity, Brain, Layers, LineChart, TrendingUp, Wallet, Compass, Sparkles } from "lucide-react";
import { Section, Eyebrow } from "@/components/ui/Section";
import { cn } from "@/lib/utils";

interface Step {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  bullets: { icon: React.ReactNode; label: string }[];
  metric: { label: string; value: string; sub: string };
}

const STEPS: Step[] = [
  {
    id: "net-worth",
    eyebrow: "Module 01",
    title: "Net Worth Engine",
    body:
      "Every dollar in your household — cash, property, super, ETFs, crypto, debt — collapsed into one live picture. No reconciliation, no spreadsheets, no drift.",
    bullets: [
      { icon: <Wallet className="h-3 w-3" />, label: "Live asset & liability roll-up" },
      { icon: <LineChart className="h-3 w-3" />, label: "Trended over 5 / 10 / 20 years" },
      { icon: <Compass className="h-3 w-3" />, label: "Allocation drift detection" },
    ],
    metric: { label: "Household NW", value: "$2.41M", sub: "+$184K YoY" },
  },
  {
    id: "forecast",
    eyebrow: "Module 02",
    title: "Forecast Engine",
    body:
      "5,000-path Monte Carlo with sequence-of-returns risk, APRA serviceability buffers, and Australian tax rules built in. Not optimism — probability.",
    bullets: [
      { icon: <Activity className="h-3 w-3" />, label: "5,000 simulations · Monte Carlo" },
      { icon: <TrendingUp className="h-3 w-3" />, label: "P10 / P50 / P90 fan charts" },
      { icon: <Layers className="h-3 w-3" />, label: "Stress: rates +2% / -30% equity" },
    ],
    metric: { label: "Survival to 2055", value: "94%", sub: "P50 NW $4.82M" },
  },
  {
    id: "decision",
    eyebrow: "Module 03",
    title: "Decision Engine",
    body:
      "Compare scenarios head-to-head: pay debt vs invest, IO vs P&I, salary sacrifice vs DCA. Conditional recommendations with invalidation triggers.",
    bullets: [
      { icon: <Layers className="h-3 w-3" />, label: "Up to 6 scenarios in parallel" },
      { icon: <Sparkles className="h-3 w-3" />, label: "Conditional recommendations" },
      { icon: <Compass className="h-3 w-3" />, label: "Invalidation triggers wired in" },
    ],
    metric: { label: "FIRE delta", value: "−4y", sub: "vs. baseline" },
  },
  {
    id: "ai",
    eyebrow: "Module 04",
    title: "AI Insights",
    body:
      "An on-device intelligence layer that watches every line item and surfaces the one decision that actually moves the needle this month.",
    bullets: [
      { icon: <Brain className="h-3 w-3" />, label: "Continuous opportunity scan" },
      { icon: <Sparkles className="h-3 w-3" />, label: "Plain-English explanations" },
      { icon: <Activity className="h-3 w-3" />, label: "Cashflow & tax flags in real time" },
    ],
    metric: { label: "Insight value", value: "$1,840/mo", sub: "Refinance to IO" },
  },
];

export function CommandCenter() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // 4 steps mapped over 100% progress: step index = floor(progress * 4)
  const stepIndex = useTransform(scrollYProgress, (p) => {
    if (p < 0.001) return 0;
    if (p >= 0.999) return STEPS.length - 1;
    return Math.min(STEPS.length - 1, Math.floor(p * STEPS.length));
  });

  return (
    <Section id="command-center" className="relative" bleed>
      {/* Anchor headline */}
      <div className="container-narrow pt-24 sm:pt-32 lg:pt-40">
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>The command center</Eyebrow>
          <h2 className="mt-4 text-balance font-display text-display-md text-ink-50">
            Four engines.{" "}
            <span className="gradient-text-accent">One terminal.</span>
          </h2>
          <p className="mt-5 text-balance text-[16px] leading-relaxed text-ink-300 sm:text-[17px]">
            Scroll through the modules that power every decision inside Family Wealth Lab.
          </p>
        </div>
      </div>

      {/* Pin container — tall scroll region, sticky inner */}
      <div
        ref={ref}
        className="relative mt-16 sm:mt-20"
        style={{ height: `${STEPS.length * 80}vh` }}
      >
        <div className="sticky top-0 flex h-screen items-center">
          <div className="container-narrow w-full">
            <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
              {/* Left — narrative */}
              <StepNarrative stepIndex={stepIndex} />

              {/* Right — visual */}
              <StepVisual stepIndex={stepIndex} />
            </div>

            {/* Progress rail */}
            <div className="mt-10 flex items-center gap-2">
              {STEPS.map((_, i) => (
                <ProgressDot key={i} index={i} stepIndex={stepIndex} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ─────────────── Sub-components ─────────────── */

function StepNarrative({ stepIndex }: { stepIndex: MotionValue<number> }) {
  return (
    <div className="relative min-h-[320px]">
      {STEPS.map((step, i) => (
        <StepText key={step.id} step={step} index={i} stepIndex={stepIndex} />
      ))}
    </div>
  );
}

function StepText({
  step,
  index,
  stepIndex,
}: {
  step: Step;
  index: number;
  stepIndex: MotionValue<number>;
}) {
  const opacity = useTransform(stepIndex, (v) => (Math.round(v) === index ? 1 : 0));
  const y = useTransform(stepIndex, (v) =>
    Math.round(v) === index ? 0 : v < index ? 24 : -24
  );

  return (
    <motion.div
      style={{ opacity, y }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="absolute inset-0"
    >
      <div className="text-eyebrow text-accent">{step.eyebrow}</div>
      <h3 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink-50 sm:text-5xl">
        {step.title}
      </h3>
      <p className="mt-5 max-w-lg text-[16px] leading-relaxed text-ink-300 sm:text-[17px]">
        {step.body}
      </p>
      <ul className="mt-7 space-y-3">
        {step.bullets.map((b, j) => (
          <li key={j} className="flex items-center gap-3 text-[14px] text-ink-200">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-accent/15 text-accent">
              {b.icon}
            </span>
            {b.label}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

function StepVisual({ stepIndex }: { stepIndex: MotionValue<number> }) {
  return (
    <div className="relative aspect-[5/4] w-full sm:aspect-[6/5]">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-12 -z-10 opacity-70"
        style={{
          background:
            "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(255,107,0,0.18) 0%, transparent 65%)",
        }}
      />
      <div className="glass-panel relative h-full w-full overflow-hidden rounded-2xl shadow-elevated">
        {/* Chrome */}
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3">
          <ChromeLabel stepIndex={stepIndex} />
          <div className="flex items-center gap-1 rounded-full bg-positive/10 px-2 py-0.5 text-[10px] font-medium text-positive">
            <span className="h-1 w-1 rounded-full bg-positive animate-pulse-soft" />
            Live
          </div>
        </div>

        {/* Slides */}
        {STEPS.map((step, i) => (
          <Slide key={step.id} step={step} index={i} stepIndex={stepIndex} />
        ))}
      </div>
    </div>
  );
}

function ChromeLabel({ stepIndex }: { stepIndex: MotionValue<number> }) {
  return (
    <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-400">
      <motion.span>
        {STEPS.map((s, i) => (
          <Crumb key={s.id} label={s.title} index={i} stepIndex={stepIndex} />
        ))}
      </motion.span>
    </div>
  );
}

function Crumb({
  label,
  index,
  stepIndex,
}: {
  label: string;
  index: number;
  stepIndex: MotionValue<number>;
}) {
  const opacity = useTransform(stepIndex, (v) => (Math.round(v) === index ? 1 : 0));
  return (
    <motion.span style={{ opacity }} className={index === 0 ? "" : "absolute left-5"}>
      {label.toUpperCase()}
    </motion.span>
  );
}

function Slide({
  step,
  index,
  stepIndex,
}: {
  step: Step;
  index: number;
  stepIndex: MotionValue<number>;
}) {
  const opacity = useTransform(stepIndex, (v) => (Math.round(v) === index ? 1 : 0));
  const y = useTransform(stepIndex, (v) =>
    Math.round(v) === index ? 0 : v < index ? 16 : -16
  );

  return (
    <motion.div
      style={{ opacity, y }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="absolute inset-x-0 bottom-0 top-[44px] p-5"
    >
      <SlideArt step={step} index={index} />
    </motion.div>
  );
}

function SlideArt({ step, index }: { step: Step; index: number }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-eyebrow text-ink-400">{step.metric.label}</div>
          <div className="num mt-1.5 font-display text-3xl font-semibold text-ink-50 sm:text-4xl">
            {step.metric.value}
          </div>
          <div className="num mt-0.5 text-[12px] text-positive">{step.metric.sub}</div>
        </div>
        <div className="text-eyebrow text-ink-500">FY26 · AUD</div>
      </div>

      <div className="mt-4 flex-1">
        {index === 0 && <NetWorthArt />}
        {index === 1 && <ForecastArt />}
        {index === 2 && <DecisionArt />}
        {index === 3 && <AIArt />}
      </div>
    </div>
  );
}

function NetWorthArt() {
  const segments = [
    { label: "Property", value: 58, color: "#FF6B00" },
    { label: "Invested", value: 28, color: "#FFC857" },
    { label: "Cash", value: 9, color: "#5AC8FA" },
    { label: "Super", value: 5, color: "#3ED598" },
  ];
  let cum = 0;
  return (
    <div className="flex h-full flex-col justify-end">
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-white/[0.05]">
        {segments.map((s, i) => {
          const left = cum;
          cum += s.value;
          return (
            <motion.div
              key={s.label}
              initial={{ width: 0 }}
              animate={{ width: `${s.value}%` }}
              transition={{ duration: 1, delay: 0.1 * i, ease: [0.22, 1, 0.36, 1] }}
              style={{ background: s.color }}
            />
          );
        })}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {segments.map((s) => (
          <div key={s.label} className="rounded-md bg-bg-base/40 p-2.5 ring-hairline">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
              <span className="text-[10px] uppercase tracking-[0.12em] text-ink-400">{s.label}</span>
            </div>
            <div className="num mt-1 text-[14px] font-semibold text-ink-100">{s.value}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ForecastArt() {
  return (
    <div className="h-full w-full">
      <svg viewBox="0 0 600 260" className="h-full w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="fc-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF6B00" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#FF6B00" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="fc-line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#FFC857" />
            <stop offset="100%" stopColor="#FF6B00" />
          </linearGradient>
        </defs>
        {[60, 130, 200].map((y) => (
          <line key={y} x1="0" x2="600" y1={y} y2={y} stroke="rgba(255,255,255,0.05)" />
        ))}
        {/* Band */}
        <path
          d="M 0 210 C 80 195, 150 175, 220 158 S 360 110, 440 78 540 36, 600 18 L 600 80 C 540 88, 440 104, 360 124 S 220 162, 150 188 80 206, 0 218 Z"
          fill="url(#fc-fill)"
        />
        {/* P50 */}
        <path
          d="M 0 214 C 80 200, 150 184, 220 168 S 360 130, 440 102 540 70, 600 50"
          fill="none"
          stroke="url(#fc-line)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Markers */}
        <circle cx="600" cy="50" r="4" fill="#FFC857" />
      </svg>
    </div>
  );
}

function DecisionArt() {
  const rows = [
    { label: "Invest 100%", score: 82, color: "#FF6B00" },
    { label: "Pay debt 100%", score: 64, color: "#FFC857" },
    { label: "Split 70/30", score: 88, color: "#3ED598" },
    { label: "Salary sacrifice", score: 71, color: "#5AC8FA" },
  ];
  return (
    <div className="flex h-full flex-col gap-2 justify-center">
      {rows.map((r, i) => (
        <div key={r.label} className="rounded-md bg-bg-base/40 p-2.5 ring-hairline">
          <div className="flex items-center justify-between text-[11.5px]">
            <span className="text-ink-200">{r.label}</span>
            <span className="num font-semibold text-ink-50">{r.score}</span>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.05]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${r.score}%` }}
              transition={{ duration: 1, delay: 0.08 * i, ease: [0.22, 1, 0.36, 1] }}
              className="h-full rounded-full"
              style={{ background: r.color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function AIArt() {
  const cards = [
    { title: "Refinance window", body: "Lock 5.84% IO · saves $1,840/mo cashflow." },
    { title: "Div 293 risk", body: "Projected sacrifice triggers Div 293 at FY27." },
    { title: "Offset rebalance", body: "Move $40K idle cash to offset · save $208/mo." },
  ];
  return (
    <div className="grid h-full grid-cols-1 gap-2">
      {cards.map((c, i) => (
        <motion.div
          key={c.title}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 + 0.12 * i, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-md bg-bg-base/40 p-3 ring-hairline"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,200,87,0.12),transparent_60%)]" />
          <div className="relative flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-gold" />
            <span className="text-[10px] uppercase tracking-[0.14em] text-gold">{c.title}</span>
          </div>
          <div className="relative mt-1 text-[12px] leading-snug text-ink-100">{c.body}</div>
        </motion.div>
      ))}
    </div>
  );
}

function ProgressDot({
  index,
  stepIndex,
}: {
  index: number;
  stepIndex: MotionValue<number>;
}) {
  const width = useTransform(stepIndex, (v) => (Math.round(v) === index ? 36 : 12));
  const opacity = useTransform(stepIndex, (v) => (Math.round(v) === index ? 1 : 0.35));
  return (
    <motion.div
      className={cn(
        "h-1 rounded-full bg-gradient-to-r from-accent to-gold"
      )}
      style={{ width, opacity }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    />
  );
}
