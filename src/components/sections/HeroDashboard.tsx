"use client";
import * as React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Building2, Banknote, PiggyBank } from "lucide-react";

/**
 * HeroDashboard — Apple Wallet × Mac System Settings feel.
 * Matte white card, layered shadow, hairline borders, single steel-blue accent.
 */
export function HeroDashboard() {
  return (
    <div className="relative">
      <div className="card-surface shadow-wallet overflow-hidden">
        {/* Header bar — quiet OS chrome */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-line bg-bg-inset">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
            </div>
            <span className="text-caption text-ink-quaternary uppercase tracking-wider">
              Household · FY26
            </span>
          </div>
          <div className="flex items-center gap-2 text-caption text-ink-tertiary">
            <span className="live-dot" />
            <span className="num">Synced 12:42</span>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="flex items-baseline justify-between gap-6">
            <div>
              <p className="text-caption text-ink-quaternary uppercase tracking-widest">
                Projected net worth
              </p>
              <div className="mt-2 flex items-baseline gap-3">
                <span className="text-display text-ink-primary num">$4.82M</span>
                <span className="inline-flex items-center gap-1 text-body-sm text-positive num">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  +18.4%
                </span>
              </div>
              <p className="mt-1.5 text-caption text-ink-quaternary num">
                P50 · 20-year horizon · 5,000 simulated paths
              </p>
            </div>
            <div className="hidden sm:flex flex-col items-end text-right">
              <span className="text-caption uppercase tracking-widest text-ink-quaternary">FIRE year</span>
              <span className="mt-1 text-h3 text-ink-primary num">2039</span>
              <span className="text-caption text-positive num">−4y vs baseline</span>
            </div>
          </div>

          {/* Chart */}
          <div className="mt-6 card-inset p-4">
            <FanChart />
          </div>

          {/* KPI row */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            <Kpi label="Survival" value="94%" delta="+6pp" tone="positive" icon={<Banknote className="h-3.5 w-3.5" />} />
            <Kpi label="Max DD" value="−21%" delta="−3pp" tone="positive" icon={<PiggyBank className="h-3.5 w-3.5" />} />
            <Kpi label="Liquidity P10" value="$58K" delta="−$32K" tone="warning" icon={<Building2 className="h-3.5 w-3.5" />} />
          </div>

          {/* Footer ledger row */}
          <div className="mt-5 pt-5 hairline grid grid-cols-3 gap-3 text-caption">
            <Ledger label="Cash" value="$58K" />
            <Ledger label="Property" value="$1.42M" />
            <Ledger label="Invested" value="$932K" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Kpi({
  label,
  value,
  delta,
  tone,
  icon,
}: {
  label: string;
  value: string;
  delta: string;
  tone: "positive" | "warning" | "negative";
  icon: React.ReactNode;
}) {
  const toneClass =
    tone === "positive" ? "text-positive" : tone === "warning" ? "text-warning" : "text-negative";
  return (
    <div className="card-inset p-3.5">
      <div className="flex items-center justify-between">
        <span className="text-caption uppercase tracking-wider text-ink-quaternary">
          {label}
        </span>
        <span className="text-ink-quinary">{icon}</span>
      </div>
      <div className="mt-2 text-h4 text-ink-primary num">{value}</div>
      <div className={`text-caption num ${toneClass}`}>{delta}</div>
    </div>
  );
}

function Ledger({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-caption uppercase tracking-wider text-ink-quaternary">{label}</p>
      <p className="mt-1 text-body-sm text-ink-primary num">{value}</p>
    </div>
  );
}

/** Fan chart — minimal, monochrome with single steel-blue accent line */
function FanChart() {
  return (
    <svg viewBox="0 0 600 180" className="w-full h-32">
      <g stroke="rgba(60,60,67,0.10)" strokeWidth="1">
        <line x1="0" y1="30" x2="600" y2="30" />
        <line x1="0" y1="75" x2="600" y2="75" />
        <line x1="0" y1="120" x2="600" y2="120" />
        <line x1="0" y1="165" x2="600" y2="165" />
      </g>

      {/* P10–P90 band */}
      <motion.path
        d="M0,135 C100,120 200,100 300,80 C400,62 500,46 600,32 L600,80 C500,80 400,90 300,100 C200,110 100,125 0,140 Z"
        fill="rgba(62,106,149,0.10)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
      />

      {/* P50 line */}
      <motion.path
        d="M0,138 C100,124 200,108 300,90 C400,72 500,56 600,42"
        fill="none"
        stroke="#3E6A95"
        strokeWidth="1.75"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1], delay: 0.35 }}
      />

      <motion.circle
        cx="600"
        cy="42"
        r="3"
        fill="#3E6A95"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 1.6 }}
      />

      <g fill="rgba(110,110,115,0.85)" fontSize="9" fontFamily="ui-sans-serif">
        <text x="0" y="178">2026</text>
        <text x="142" y="178">2031</text>
        <text x="290" y="178">2036</text>
        <text x="438" y="178">2041</text>
        <text x="572" y="178">2045</text>
      </g>
    </svg>
  );
}
