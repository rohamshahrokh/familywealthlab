"use client";

import { motion } from "framer-motion";
import { useId } from "react";
import { ArrowUpRight, Sparkles, TrendingUp, Home, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Floating dashboard mockup — bespoke SVG/HTML composition.
 * No screenshots, no stock — every pixel is engineered.
 */
export function HeroDashboard({ className }: { className?: string }) {
  const gradId = useId();

  return (
    <motion.div
      initial={{ opacity: 0, y: 32, rotateX: 8 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
      className={cn("relative w-full perspective-1000", className)}
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* Ambient orange glow behind the dashboard */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-20 -z-10 opacity-70"
        style={{
          background:
            "radial-gradient(ellipse 60% 60% at 50% 40%, rgba(255,107,0,0.22) 0%, transparent 60%)",
        }}
      />

      {/* Main dashboard frame */}
      <div className="glass-panel relative overflow-hidden rounded-2xl shadow-elevated">
        {/* Top chrome */}
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3.5">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-400">
            Net Worth · FY26
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-positive/10 px-2.5 py-1 text-[10.5px] font-medium text-positive">
            <span className="h-1.5 w-1.5 rounded-full bg-positive animate-pulse-soft" />
            Live
          </div>
        </div>

        {/* Body */}
        <div className="grid gap-4 p-5 sm:grid-cols-[1.6fr_1fr]">
          {/* Left — main chart */}
          <div className="space-y-4">
            <div>
              <div className="text-eyebrow text-ink-400">Projected net worth</div>
              <div className="mt-2 flex items-baseline gap-3">
                <div className="num font-display text-3xl font-semibold tracking-tight text-ink-50 sm:text-4xl">
                  $4.82M
                </div>
                <div className="flex items-center gap-1 text-[12px] font-medium text-positive">
                  <TrendingUp className="h-3 w-3" />
                  <span className="num">+18.4%</span>
                </div>
              </div>
              <div className="mt-0.5 text-[12px] text-ink-400">P50 by 2045 · 5,000 simulations</div>
            </div>

            {/* SVG fan chart */}
            <div className="relative h-44 w-full overflow-hidden rounded-lg bg-bg-base/40 ring-hairline">
              <FanChart gradId={gradId} />
            </div>

            {/* Mini stats row */}
            <div className="grid grid-cols-3 gap-2">
              <MiniStat label="FIRE year" value="2039" delta="−4y" positive />
              <MiniStat label="Survival" value="94%" delta="+6pp" positive />
              <MiniStat label="Max DD" value="−21%" delta="−3pp" positive />
            </div>
          </div>

          {/* Right column — AI insight + property card */}
          <div className="space-y-3">
            <AIInsightCard />
            <PropertyEquityCard />
          </div>
        </div>
      </div>

      {/* Floating chips — only on very wide screens, well outside the panel */}
      <FloatingChip
        className="-left-32 top-24 hidden 2xl:flex"
        delay={0.6}
        icon={<Sparkles className="h-3.5 w-3.5 text-gold" />}
        title="AI Insight"
        body="Refinance to IO saves $1,840/mo cashflow."
      />
      <FloatingChip
        className="-right-32 bottom-24 hidden 2xl:flex"
        delay={0.9}
        icon={<Home className="h-3.5 w-3.5 text-accent" />}
        title="Property"
        body="Equity +$142K YTD · LVR 58%"
      />
    </motion.div>
  );
}

/* ─────────────────────────── Sub-components ─────────────────────────── */

function FanChart({ gradId }: { gradId: string }) {
  // Path data hand-tuned for a believable wealth growth fan.
  // Width 600, height 176.
  const p50 = "M 0 130 C 60 122, 110 108, 170 96 S 290 70, 350 56 460 30, 540 14 600 8 600 8";
  const p90 = "M 0 130 C 60 116, 110 96, 170 78 S 290 46, 350 30 460 8, 540 -8 600 -14 600 -14";
  const p10 = "M 0 130 C 60 128, 110 122, 170 116 S 290 104, 350 96 460 86, 540 78 600 76 600 76";

  // Build the band area
  const band = `${p90} L 600 76 L 540 78 L 460 86 L 350 96 L 290 104 L 170 116 L 110 122 L 60 128 L 0 130 Z`;

  return (
    <svg viewBox="0 0 600 160" className="h-full w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`${gradId}-fill`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FF6B00" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#FF6B00" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${gradId}-line`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FFC857" />
          <stop offset="100%" stopColor="#FF6B00" />
        </linearGradient>
      </defs>

      {/* horizontal grid */}
      {[40, 80, 120].map((y) => (
        <line key={y} x1="0" x2="600" y1={y} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
      ))}

      {/* P10–P90 band */}
      <motion.path
        d={band}
        fill={`url(#${gradId}-fill)`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.7 }}
      />

      {/* P50 line, animated draw */}
      <motion.path
        d={p50}
        fill="none"
        stroke={`url(#${gradId}-line)`}
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* terminal dot */}
      <motion.circle
        cx="600"
        cy="8"
        r="4"
        fill="#FFC857"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 2 }}
      />
      <motion.circle
        cx="600"
        cy="8"
        r="9"
        fill="none"
        stroke="#FFC857"
        strokeWidth="1"
        initial={{ opacity: 0, scale: 0.4 }}
        animate={{ opacity: [0, 0.5, 0], scale: [0.4, 1.8, 2.4] }}
        transition={{ duration: 2.4, delay: 2.2, repeat: Infinity, repeatDelay: 0.6 }}
      />
    </svg>
  );
}

function MiniStat({
  label,
  value,
  delta,
  positive,
}: {
  label: string;
  value: string;
  delta: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-lg bg-bg-base/40 p-3 ring-hairline">
      <div className="text-[10px] uppercase tracking-[0.12em] text-ink-400">{label}</div>
      <div className="num mt-1 font-display text-[15px] font-semibold text-ink-50">{value}</div>
      <div
        className={cn(
          "num mt-0.5 text-[10.5px] font-medium",
          positive ? "text-positive" : "text-negative"
        )}
      >
        {delta}
      </div>
    </div>
  );
}

function AIInsightCard() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-lg bg-bg-base/40 p-3.5 ring-hairline"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,200,87,0.12),transparent_60%)]" />
      <div className="relative flex items-center gap-1.5">
        <div className="flex h-5 w-5 items-center justify-center rounded-md bg-gold/15">
          <Sparkles className="h-3 w-3 text-gold" />
        </div>
        <div className="text-[10px] uppercase tracking-[0.14em] text-gold">AI · Today</div>
      </div>
      <div className="relative mt-2.5 text-[12.5px] leading-relaxed text-ink-100">
        You can hit <span className="font-semibold text-ink-50">FIRE 4 years earlier</span> by
        redirecting $850/mo from offset into ETF.
      </div>
      <div className="relative mt-2 flex items-center gap-1 text-[11px] font-medium text-gold">
        <span>Run scenario</span>
        <ArrowUpRight className="h-3 w-3" />
      </div>
    </motion.div>
  );
}

function PropertyEquityCard() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 1.05, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-lg bg-bg-base/40 p-3.5 ring-hairline"
    >
      <div className="flex items-center justify-between">
        <div className="text-[10px] uppercase tracking-[0.14em] text-ink-400">Property equity</div>
        <Wallet className="h-3 w-3 text-ink-400" />
      </div>
      <div className="num mt-2 font-display text-lg font-semibold text-ink-50">$1.42M</div>
      <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.05]">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-accent to-gold"
          initial={{ width: 0 }}
          animate={{ width: "58%" }}
          transition={{ duration: 1.4, delay: 1.2, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <div className="mt-1.5 flex items-center justify-between text-[10.5px] text-ink-400">
        <span>LVR 58%</span>
        <span className="num text-positive">+$142K YTD</span>
      </div>
    </motion.div>
  );
}

function FloatingChip({
  className,
  delay,
  icon,
  title,
  body,
}: {
  className?: string;
  delay: number;
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "glass-panel absolute z-10 max-w-[200px] gap-2 rounded-xl px-3 py-2.5 shadow-soft animate-float-slow",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <div className="flex h-5 w-5 items-center justify-center rounded-md bg-white/[0.06]">
          {icon}
        </div>
        <div className="text-[10px] uppercase tracking-[0.14em] text-ink-300">{title}</div>
      </div>
      <div className="mt-1 text-[12px] leading-snug text-ink-100">{body}</div>
    </motion.div>
  );
}
