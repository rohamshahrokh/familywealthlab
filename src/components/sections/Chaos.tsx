"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { FileSpreadsheet, Calculator, Landmark, LineChart, PiggyBank, Wallet } from "lucide-react";
import { Section, Eyebrow } from "@/components/ui/Section";
import { cn } from "@/lib/utils";

/**
 * Scroll-driven convergence: fragmented "windows" scattered around the canvas
 * collapse toward a single unified card as you scroll through the section.
 */
export function Chaos() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // 0 → 1 progress mapped to "fragments → converge"
  const convergence = useTransform(scrollYProgress, [0.1, 0.55], [0, 1]);

  return (
    <Section id="chaos" className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 h-[700px] w-[1100px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/[0.05] blur-[120px]" />
      </div>

      <div ref={ref} className="container-narrow">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>The chaos before</Eyebrow>
          <h2 className="mt-4 text-balance font-display text-display-md text-ink-50">
            One system.{" "}
            <span className="gradient-text-accent">Complete clarity.</span>
          </h2>
          <p className="mt-5 text-balance text-[16px] leading-relaxed text-ink-300 sm:text-[17px]">
            Six spreadsheets, four bank apps, a mortgage calculator, a super dashboard.
            Family Wealth Lab collapses every signal into a single coherent model.
          </p>
        </div>

        {/* Convergence canvas */}
        <div className="relative mx-auto mt-20 h-[460px] w-full max-w-4xl sm:h-[520px]">
          {/* Center unified card emerges */}
          <UnifiedCore progress={convergence} />

          {/* Fragments */}
          <Fragment
            progress={convergence}
            from={{ x: "-46%", y: "-32%", rotate: -8 }}
            icon={<FileSpreadsheet className="h-3.5 w-3.5" />}
            label="2024 budget.xlsx"
            sub="Sheet 3 · 1,284 rows"
          />
          <Fragment
            progress={convergence}
            from={{ x: "42%", y: "-38%", rotate: 7 }}
            icon={<Landmark className="h-3.5 w-3.5" />}
            label="CommBank · Savings"
            sub="$42,180"
          />
          <Fragment
            progress={convergence}
            from={{ x: "-50%", y: "8%", rotate: 6 }}
            icon={<Calculator className="h-3.5 w-3.5" />}
            label="Mortgage calculator"
            sub="6.24% · 28y left"
          />
          <Fragment
            progress={convergence}
            from={{ x: "48%", y: "12%", rotate: -10 }}
            icon={<LineChart className="h-3.5 w-3.5" />}
            label="Stake portfolio"
            sub="VAS · VGS · NDQ"
          />
          <Fragment
            progress={convergence}
            from={{ x: "-32%", y: "38%", rotate: 12 }}
            icon={<PiggyBank className="h-3.5 w-3.5" />}
            label="AusSuper"
            sub="$284,600"
          />
          <Fragment
            progress={convergence}
            from={{ x: "32%", y: "36%", rotate: -6 }}
            icon={<Wallet className="h-3.5 w-3.5" />}
            label="Offset · IP"
            sub="$118,420"
          />
        </div>

        {/* Legend */}
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          <Stat label="Six tools" value="One model" />
          <Stat label="Disconnected numbers" value="Coherent forecast" />
          <Stat label="Spreadsheet stress" value="Calm clarity" />
        </div>
      </div>
    </Section>
  );
}

/* ─────────────── Sub-components ─────────────── */

function Fragment({
  progress,
  from,
  icon,
  label,
  sub,
}: {
  progress: ReturnType<typeof useTransform<number, number>>;
  from: { x: string; y: string; rotate: number };
  icon: React.ReactNode;
  label: string;
  sub: string;
}) {
  // At progress 0: scattered & rotated. At progress 1: collapsed to centre, faded.
  const x = useTransform(progress, [0, 1], [from.x, "0%"]);
  const y = useTransform(progress, [0, 1], [from.y, "0%"]);
  const rotate = useTransform(progress, [0, 1], [from.rotate, 0]);
  const scale = useTransform(progress, [0, 1], [1, 0.4]);
  const opacity = useTransform(progress, [0, 0.55, 0.9], [1, 0.6, 0]);
  const blur = useTransform(progress, [0, 1], [0, 6]);
  const filter = useTransform(blur, (v) => `blur(${v}px)`);

  return (
    <motion.div
      className="glass-panel absolute left-1/2 top-1/2 flex w-[200px] -translate-x-1/2 -translate-y-1/2 items-center gap-2.5 rounded-xl px-3 py-2.5 shadow-soft"
      style={{ x, y, rotate, scale, opacity, filter }}
    >
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/[0.05] text-ink-200">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="truncate text-[12px] font-medium text-ink-100">{label}</div>
        <div className="num truncate text-[10.5px] text-ink-400">{sub}</div>
      </div>
    </motion.div>
  );
}

function UnifiedCore({
  progress,
}: {
  progress: ReturnType<typeof useTransform<number, number>>;
}) {
  const scale = useTransform(progress, [0, 0.4, 1], [0.6, 0.85, 1]);
  const opacity = useTransform(progress, [0.25, 0.7], [0, 1]);
  const glow = useTransform(progress, [0, 1], [0.15, 0.6]);

  return (
    <motion.div
      className="absolute left-1/2 top-1/2 w-[280px] -translate-x-1/2 -translate-y-1/2 sm:w-[340px]"
      style={{ scale, opacity }}
    >
      <motion.div
        className="absolute -inset-20 rounded-[60px]"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(255,107,0,0.35) 0%, transparent 60%)",
          opacity: glow,
        }}
      />
      <div className="glass-panel relative overflow-hidden rounded-2xl p-5 shadow-elevated">
        <div className="flex items-center justify-between">
          <div className="text-eyebrow text-ink-400">Unified model</div>
          <div className="flex items-center gap-1 text-[10px] text-positive">
            <span className="h-1.5 w-1.5 rounded-full bg-positive animate-pulse-soft" />
            Synced
          </div>
        </div>
        <div className="num mt-3 font-display text-3xl font-semibold text-ink-50">$2.41M</div>
        <div className="text-[12px] text-ink-400">Household net worth · live</div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <CoreStat label="Cash" value="$58K" />
          <CoreStat label="Property" value="$1.42M" />
          <CoreStat label="Invested" value="$932K" />
        </div>

        <div className="mt-4 h-10 w-full overflow-hidden rounded-md bg-bg-base/40 ring-hairline">
          <svg viewBox="0 0 280 40" className="h-full w-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="core-line" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="#FFC857" />
                <stop offset="100%" stopColor="#FF6B00" />
              </linearGradient>
            </defs>
            <path
              d="M 0 32 C 30 26, 60 28, 90 22 S 150 12, 180 14 220 8, 280 4"
              fill="none"
              stroke="url(#core-line)"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    </motion.div>
  );
}

function CoreStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-bg-base/30 px-2 py-1.5 ring-hairline">
      <div className="text-[9.5px] uppercase tracking-[0.12em] text-ink-400">{label}</div>
      <div className="num mt-0.5 text-[12px] font-semibold text-ink-100">{value}</div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className={cn("rounded-xl p-5 ring-hairline bg-bg-surface/40")}>
      <div className="text-[11.5px] uppercase tracking-[0.14em] text-ink-400">From</div>
      <div className="mt-1 font-display text-[15px] text-ink-200">{label}</div>
      <div className="mt-3 text-[11.5px] uppercase tracking-[0.14em] text-accent">To</div>
      <div className="mt-1 font-display text-[15px] font-semibold gradient-text">{value}</div>
    </div>
  );
}
