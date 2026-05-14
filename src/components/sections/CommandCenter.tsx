"use client";
import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Section, SystemLabel } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { ChartLine } from "@/components/ui/ChartLine";
import { Sparkline } from "@/components/ui/Sparkline";
import { LiveValue } from "@/components/ui/LiveValue";
import { MatrixGrid } from "@/components/ui/MatrixGrid";
import { Counter } from "@/components/ui/Counter";
import { Wallet, LineChart, GitBranch, Sparkles, ArrowRight } from "lucide-react";

type Module = {
  idx: string;
  title: string;
  short: string;
  body: string;
  bullets: string[];
  icon: React.ComponentType<{ className?: string }>;
};

const MODULES: Module[] = [
  {
    idx: "01",
    title: "Net Worth Engine",
    short: "Net Worth",
    body: "Every asset and liability — cash, property, super, equities — collapsed into one continuously reconciled household model.",
    bullets: ["Live asset & liability roll-up", "Daily reconciliation", "Per-member views"],
    icon: Wallet,
  },
  {
    idx: "02",
    title: "Forecast Engine",
    short: "Forecast",
    body: "Monte Carlo projections across 5,000 paths model your true range of outcomes — not a single fragile straight line.",
    bullets: ["P10 / P50 / P90 bands", "20-year horizon", "Stress-tested to rate shocks"],
    icon: LineChart,
  },
  {
    idx: "03",
    title: "Decision Engine",
    short: "Decisions",
    body: "Run any household decision — buy, refinance, retire, restructure — against your own real numbers in seconds.",
    bullets: ["Scenario comparison", "Tax-aware modelling", "Decision audit trail"],
    icon: GitBranch,
  },
  {
    idx: "04",
    title: "AI Insights",
    short: "Intelligence",
    body: "A quiet intelligence layer reads your model continuously and surfaces only the decisions worth your attention this month.",
    bullets: ["Continuous opportunity scan", "Plain-English explanations", "Tax & cashflow flags"],
    icon: Sparkles,
  },
];

export function CommandCenter() {
  const [active, setActive] = React.useState(0);
  const M = MODULES[active];
  const Icon = M.icon;

  return (
    <Section spacing="lg" id="command">
      <Reveal className="max-w-3xl">
        <SystemLabel index="06" label="THE PLATFORM" />
        <h2 className="mt-4 text-display text-ink-primary text-balance tracking-tighter">
          Four engines. <span className="text-ember-500">One coherent surface.</span>
        </h2>
        <p className="mt-5 text-lead text-ink-tertiary text-pretty max-w-2xl">
          Family Wealth Lab is built from four tightly-integrated modules — each
          doing one thing exceptionally well, then composing into a single
          decision surface.
        </p>
      </Reveal>

      {/* Tab strip */}
      <div className="mt-12 flex flex-wrap items-stretch gap-1.5 border-b border-line pb-0">
        {MODULES.map((m, i) => {
          const isActive = i === active;
          const TabIcon = m.icon;
          return (
            <button
              key={m.idx}
              onClick={() => setActive(i)}
              className={`relative group inline-flex items-center gap-2.5 px-3.5 py-3 rounded-t-md text-left transition-colors duration-300 focus-ring ${
                isActive
                  ? "bg-white border border-line border-b-white text-ink-primary -mb-px"
                  : "text-ink-tertiary hover:text-ink-primary"
              }`}
            >
              <span className={`inline-flex h-7 w-7 items-center justify-center rounded-md border ${isActive ? "border-ember-500/40 text-ember-500" : "border-line text-ink-tertiary"} bg-bg-inset`}>
                <TabIcon className="h-3.5 w-3.5" />
              </span>
              <span className="flex flex-col leading-tight">
                <span className="text-[0.65rem] mono uppercase tracking-wider text-ink-quaternary">
                  [{m.idx}]
                </span>
                <span className="text-body-sm font-medium">{m.short}</span>
              </span>
              {isActive && (
                <motion.span
                  layoutId="module-tab-underline"
                  className="absolute left-3 right-3 -bottom-px h-[2px] bg-ember-500"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Module body — grid copy / visual */}
      <div className="relative mt-10 grid lg:grid-cols-12 gap-10 lg:gap-12 items-start min-h-[420px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={`copy-${active}`}
            initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5"
          >
            <div className="inline-flex items-center gap-2.5">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-bg-inset text-ember-500">
                <Icon className="h-4 w-4" />
              </span>
              <span className="syslabel">
                <span className="mono text-ember-500">[{M.idx}]</span>
                <span>MODULE</span>
              </span>
            </div>
            <h3 className="mt-5 text-h2 text-ink-primary tracking-tight">{M.title}</h3>
            <p className="mt-4 text-body-lg text-ink-tertiary max-w-md text-pretty">{M.body}</p>
            <ul className="mt-7 flex flex-col gap-2.5">
              {M.bullets.map((b) => (
                <li key={b} className="flex items-start gap-2.5 text-body-sm text-ink-secondary">
                  <span className="mt-[7px] h-[5px] w-[5px] rounded-full bg-ember-500 shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
            <a
              href="#"
              className="mt-7 inline-flex items-center gap-1.5 text-body-sm text-ink-primary hover:text-ember-500 transition-colors group"
            >
              <span className="mono text-[0.7rem] text-ember-500">[{M.idx}.OPEN]</span>
              <span>Explore module</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </a>
          </motion.div>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div
            key={`vis-${active}`}
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.99, y: -6 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7"
          >
            {active === 0 && <VisualNetWorth />}
            {active === 1 && <VisualForecast />}
            {active === 2 && <VisualDecision />}
            {active === 3 && <VisualAI />}
          </motion.div>
        </AnimatePresence>
      </div>
    </Section>
  );
}

/* ─── Visualizations ─────────────────────────────────────────── */

function VisualNetWorth() {
  // Trailing 12-month net worth trajectory (in $M)
  const trail = [2.18, 2.21, 2.24, 2.26, 2.30, 2.32, 2.33, 2.36, 2.37, 2.39, 2.40, 2.41];
  return (
    <div className="card-cinematic p-6">
      <div className="flex items-center justify-between">
        <span className="syslabel">
          <span className="mono text-ember-500">[01]</span>
          <span>HOUSEHOLD ROLL-UP</span>
        </span>
        <span className="inline-flex items-center gap-1.5 text-caption text-positive mono">
          <span className="h-1.5 w-1.5 rounded-full bg-positive animate-pulse-soft" /> LIVE
        </span>
      </div>
      <div className="mt-4 flex items-baseline gap-3 flex-wrap">
        <LiveValue
          to={2.41}
          prefix="$"
          suffix="M"
          decimals={2}
          separator={false}
          duration={1.4}
          jitter={0.004}
          tickMs={3600}
          className="text-display text-ink-primary mono tracking-tightest"
        />
        <span className="text-body-sm text-positive mono">
          +$<Counter to={184} decimals={0} duration={1.2} delay={0.4} />K YoY
        </span>
      </div>
      <p className="mt-1.5 text-caption text-ink-quaternary mono uppercase tracking-wider">
        14 SOURCES · LAST SYNC 12:42
      </p>

      {/* Trailing 12-month sparkline */}
      <div className="mt-5 rounded-lg border border-line bg-bg-inset/60 px-3 py-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[0.6rem] mono uppercase tracking-wider text-ink-quaternary">
            TRAILING 12M · NET WORTH
          </span>
          <span className="text-[0.6rem] mono uppercase tracking-wider text-positive">
            +9.6%
          </span>
        </div>
        <Sparkline
          data={trail}
          width={520}
          height={48}
          stroke="#0B0F1A"
          fill="rgba(20, 28, 46, 0.06)"
          duration={1.0}
          className="w-full h-10 text-ink-primary"
        />
      </div>

      {/* Composition bar */}
      <div className="mt-5">
        <div className="flex h-2 w-full rounded-full overflow-hidden border border-line">
          <motion.div
            className="bg-ink-primary"
            initial={{ width: 0 }}
            whileInView={{ width: "59%" }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.div
            className="bg-graphite-500"
            initial={{ width: 0 }}
            whileInView={{ width: "21%" }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.div
            className="bg-graphite-300"
            initial={{ width: 0 }}
            whileInView={{ width: "17%" }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.div
            className="bg-ember-500"
            initial={{ width: 0 }}
            whileInView={{ width: "3%" }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-caption">
          {[
            ["PROPERTY", "$1.42M", "59%", "bg-ink-primary"],
            ["INVESTED", "$512K", "21%", "bg-graphite-500"],
            ["SUPER", "$420K", "17%", "bg-graphite-300"],
            ["CASH", "$58K", "3%", "bg-ember-500"],
          ].map(([k, v, pct, dot]) => (
            <div key={k} className="rounded-md border border-line bg-bg-inset px-2.5 py-2">
              <div className="flex items-center gap-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
                <p className="text-[0.6rem] uppercase text-ink-quaternary mono tracking-wider">{k}</p>
              </div>
              <p className="mt-0.5 text-body-sm text-ink-primary mono">{v}</p>
              <p className="text-[0.6rem] text-ink-quinary mono">{pct}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 pt-5 hairline grid grid-cols-2 gap-3 text-caption">
        <Stat k="LIQUIDITY" v="$58K" tone="neutral" />
        <Stat k="DEBT/EQUITY" v="0.46" tone="positive" />
      </div>
    </div>
  );
}

function VisualForecast() {
  const p50 = [2.41, 2.6, 2.85, 3.15, 3.5, 3.9, 4.35, 4.82];
  const p10 = [2.41, 2.5, 2.6, 2.72, 2.8, 2.88, 2.94, 2.94];
  const p90 = [2.41, 2.75, 3.18, 3.7, 4.32, 5.05, 6.2, 7.4];
  // FIRE readiness % over 20Y — climbs from 12% → 100% around 2039
  const fireReadiness = [12, 18, 26, 34, 44, 56, 70, 82, 92, 100];
  return (
    <div className="card-cinematic p-6">
      <div className="flex items-center justify-between">
        <span className="syslabel">
          <span className="mono text-ember-500">[02]</span>
          <span>FORECAST · 20Y · 5,000 PATHS</span>
        </span>
        <span className="text-caption text-ink-tertiary mono">P50 2045</span>
      </div>
      <div className="mt-3 flex items-baseline gap-3 flex-wrap">
        <LiveValue
          to={4.82}
          prefix="$"
          suffix="M"
          decimals={2}
          separator={false}
          duration={1.4}
          jitter={0.008}
          tickMs={4200}
          className="text-h2 text-ink-primary mono"
        />
        <span className="text-caption text-ink-quaternary mono">P10 $2.94M · P90 $7.40M</span>
      </div>
      <div className="mt-5 rounded-lg border border-line bg-bg-inset/60 p-4">
        <ChartLine
          data={p50}
          bandLow={p10}
          bandHigh={p90}
          stroke="#0B0F1A"
          fill="rgba(52, 70, 106, 0.10)"
          height={200}
          width={560}
          showAxis
          axisLabels={["2026", "2031", "2036", "2041", "2045"]}
          className="w-full h-44"
        />
      </div>

      {/* FIRE readiness curve — a dedicated timeline of "% to FIRE" */}
      <div className="mt-3 rounded-lg border border-line bg-bg-inset/60 px-4 py-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[0.6rem] mono uppercase tracking-wider text-ember-500">
            FIRE TIMELINE · % TO TARGET
          </span>
          <span className="text-[0.6rem] mono uppercase tracking-wider text-positive">
            100% · 2039
          </span>
        </div>
        <Sparkline
          data={fireReadiness}
          width={520}
          height={40}
          stroke="#C97030"
          fill="rgba(201, 112, 48, 0.10)"
          duration={1.1}
          delay={0.2}
          className="w-full h-8"
        />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2.5 text-caption">
        {[
          ["P10", "$2.94M", "neg"],
          ["P50", "$4.82M", "neu"],
          ["P90", "$7.40M", "pos"],
        ].map(([k, v, t]) => (
          <div key={k} className="rounded-md border border-line bg-bg-inset px-3 py-2.5">
            <p className="text-[0.6rem] uppercase text-ink-quaternary mono tracking-wider">{k}</p>
            <p className="mt-0.5 text-h4 text-ink-primary mono">{v}</p>
            <p className={`text-[0.65rem] mono ${t === "pos" ? "text-positive" : t === "neg" ? "text-warning" : "text-ink-quinary"}`}>
              {t === "pos" ? "TAIL UP" : t === "neg" ? "TAIL DOWN" : "MEDIAN"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function VisualDecision() {
  return (
    <div className="card-cinematic p-6">
      <div className="flex items-center justify-between">
        <span className="syslabel">
          <span className="mono text-ember-500">[03]</span>
          <span>DECISION MATRIX · 4 PATHS</span>
        </span>
        <span className="text-caption text-positive mono">Δ +$418K NW</span>
      </div>
      <p className="mt-2 text-caption text-ink-quaternary">
        Four refinance · leverage paths, each scored against the same six household KPIs.
      </p>

      <div className="mt-5">
        <MatrixGrid
          cornerLabel="KPI × PATH"
          columns={[
            { label: "Baseline", caption: "P&I · 6.34%" },
            { label: "Refi · IO", caption: "5Y · 5.84%", recommended: true },
            { label: "+ IP $980K", caption: "BNE · 80% LVR" },
            { label: "Defer 12mo", caption: "Hold · buffer" },
          ]}
          rows={[
            {
              label: "Net worth",
              caption: "P50 · 2045",
              cells: [
                { value: "$4.82M", delta: "baseline", tone: "neutral" },
                { value: "$5.24M", delta: "+$418K", tone: "positive", highlight: true },
                { value: "$5.61M", delta: "+$790K", tone: "positive" },
                { value: "$4.73M", delta: "−$90K", tone: "negative" },
              ],
            },
            {
              label: "FIRE year",
              caption: "P50 MEDIAN",
              cells: [
                { value: "2043", delta: "±0y", tone: "neutral" },
                { value: "2039", delta: "−4y", tone: "positive", highlight: true },
                { value: "2037", delta: "−6y", tone: "positive" },
                { value: "2044", delta: "+1y", tone: "warning" },
              ],
            },
            {
              label: "Cashflow",
              caption: "Δ / MONTH",
              cells: [
                { value: "—", delta: "baseline", tone: "neutral" },
                { value: "+$1,840", delta: "saved", tone: "positive", highlight: true },
                { value: "−$420", delta: "holding cost", tone: "warning" },
                { value: "+$240", delta: "defer rates", tone: "positive" },
              ],
            },
            {
              label: "Liquidity",
              caption: "P10 · 12MO",
              cells: [
                { value: "$90K", delta: "safe", tone: "positive" },
                { value: "$58K", delta: "−$32K", tone: "warning", highlight: true },
                { value: "$28K", delta: "tight", tone: "negative" },
                { value: "$104K", delta: "+$14K", tone: "positive" },
              ],
            },
            {
              label: "Survival",
              caption: "% PATHS OK",
              cells: [
                { value: "94%", delta: "baseline", tone: "positive" },
                { value: "92%", delta: "−2pp", tone: "positive", highlight: true },
                { value: "84%", delta: "−10pp", tone: "warning" },
                { value: "96%", delta: "+2pp", tone: "positive" },
              ],
            },
            {
              label: "Max DD",
              caption: "WORST P10",
              cells: [
                { value: "−21%", delta: "baseline", tone: "neutral" },
                { value: "−24%", delta: "+3pp", tone: "warning", highlight: true },
                { value: "−31%", delta: "+10pp", tone: "negative" },
                { value: "−19%", delta: "−2pp", tone: "positive" },
              ],
            },
          ]}
        />
      </div>

      <div className="mt-5 flex items-center justify-between text-caption pt-4 hairline">
        <span className="text-ink-tertiary">
          Recommended: <span className="mono text-ember-500">REFI · IO</span> — best $/risk balance.
        </span>
        <span className="text-ink-quinary mono uppercase tracking-wider text-[0.6rem]">5,000 PATHS</span>
      </div>
    </div>
  );
}

function VisualAI() {
  const insights = [
    {
      tag: "REFINANCE",
      text: "Lock 5.84% IO · saves $1,840/mo cashflow.",
      value: "−$1,840/mo",
      spark: [80, 78, 74, 70, 65, 58, 50, 42, 38, 36],
      status: "NEW",
      ageMs: 0,
    },
    {
      tag: "DIV 293",
      text: "Projected sacrifice triggers Div 293 at FY27.",
      value: "+$2,140 tax",
      spark: [10, 18, 26, 34, 46, 58, 72, 84, 92, 100],
      status: "WATCH",
      ageMs: 6 * 60 * 60 * 1000,
    },
    {
      tag: "OFFSET",
      text: "Move $40K idle cash to offset · save $208/mo.",
      value: "−$208/mo",
      spark: [60, 58, 56, 54, 52, 50, 50, 50, 50, 50],
      status: "READY",
      ageMs: 24 * 60 * 60 * 1000,
    },
  ];
  return (
    <div className="card-cinematic p-6">
      <div className="flex items-center justify-between">
        <span className="syslabel">
          <span className="mono text-ember-500">[04]</span>
          <span>AI INSIGHTS · TODAY</span>
        </span>
        <span className="inline-flex items-center gap-1.5 text-caption text-ember-500 mono">
          <span className="h-1.5 w-1.5 rounded-full bg-ember-500 animate-pulse-soft" />
          <Counter to={3} duration={0.8} /> SURFACED
        </span>
      </div>
      <div className="mt-4 flex flex-col gap-2">
        {insights.map((x, i) => {
          const isFresh = x.status === "NEW";
          const statusTone =
            x.status === "NEW"
              ? "text-ember-500"
              : x.status === "WATCH"
              ? "text-warning"
              : "text-positive";
          return (
            <motion.div
              key={x.tag}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="relative rounded-md border border-line bg-bg-inset/60 p-3.5 group hover:border-ember-500/30 transition-colors"
            >
              <div
                aria-hidden
                className={`absolute left-0 top-3 bottom-3 w-[2px] rounded-r-full ${
                  isFresh ? "bg-ember-500 animate-pulse-soft" : "bg-ember-500/40"
                }`}
              />
              <div className="flex items-start justify-between gap-3 pl-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[0.6rem] mono uppercase tracking-wider text-ember-500">[{x.tag}]</span>
                    <span
                      className={`text-[0.55rem] mono uppercase tracking-wider rounded-sm px-1 py-px ${statusTone} bg-current/10`}
                    >
                      <span className={statusTone}>{x.status}</span>
                    </span>
                  </div>
                  <p className="mt-1 text-body-sm text-ink-secondary leading-snug">{x.text}</p>
                </div>
                <div className="shrink-0 flex flex-col items-end">
                  <span className="text-body-sm text-ink-primary mono">{x.value}</span>
                  <Sparkline
                    data={x.spark}
                    width={80}
                    height={20}
                    stroke="#0B0F1A"
                    fill={null}
                    endDot={false}
                    duration={0.8}
                    delay={i * 0.1 + 0.2}
                    className="w-[80px] h-[20px] mt-1 text-ink-tertiary"
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ k, v, tone }: { k: string; v: string; tone: "positive" | "warning" | "neutral" }) {
  const c = tone === "positive" ? "text-positive" : tone === "warning" ? "text-warning" : "text-ink-primary";
  return (
    <div>
      <p className="text-[0.6rem] uppercase text-ink-quaternary mono tracking-wider">{k}</p>
      <p className={`mt-0.5 text-body-sm mono ${c}`}>{v}</p>
    </div>
  );
}
