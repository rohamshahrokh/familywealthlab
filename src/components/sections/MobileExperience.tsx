"use client";
import * as React from "react";
import { motion } from "framer-motion";
import { Section, SystemLabel } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { Sparkline } from "@/components/ui/Sparkline";
import { Counter } from "@/components/ui/Counter";
import { LiveValue } from "@/components/ui/LiveValue";
import { Bell, Sparkles } from "lucide-react";

// 12-mo trailing net-worth curve for mobile dashboard sparkline
const NW_TRAIL = [2.18, 2.21, 2.19, 2.24, 2.26, 2.29, 2.31, 2.33, 2.36, 2.38, 2.40, 2.41];
// Cashflow projection — 24 months ahead, generally upward with slight oscillation
const CASHFLOW_PATH = [4.2, 4.4, 4.3, 4.6, 4.8, 4.7, 5.0, 5.3, 5.2, 5.5, 5.8, 5.9, 6.1, 6.4, 6.3, 6.6, 6.9, 7.0, 7.3, 7.6, 7.5, 7.9, 8.2, 8.4];

export function MobileExperience() {
  return (
    <Section spacing="lg" id="mobile">
      <div className="grid lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-5">
          <Reveal>
            <SystemLabel index="09" label="MOBILE" />
            <h2 className="mt-4 text-display text-ink-primary text-balance tracking-tighter">
              Your household, <span className="text-ember-500">in your pocket.</span>
            </h2>
            <p className="mt-5 text-lead text-ink-tertiary text-pretty max-w-md">
              A native-grade mobile experience. Glanceable dashboards, swipeable
              scenarios, and notifications that only arrive when something
              genuinely changed.
            </p>
            <ul className="mt-7 grid grid-cols-2 gap-x-6 gap-y-2.5 text-body-sm text-ink-secondary">
              {[
                ["DASHBOARD", "Glance"],
                ["AI CO-PILOT", "Always-on"],
                ["SMART ALERTS", "Signal only"],
                ["SCENARIOS", "Live"],
                ["CASHFLOW", "Pulse"],
                ["PROPERTY", "Tracked"],
              ].map(([k, v]) => (
                <li key={k} className="flex flex-col py-1.5 border-b border-line/60">
                  <span className="text-[0.6rem] mono uppercase tracking-wider text-ember-500">{k}</span>
                  <span className="text-body-sm text-ink-primary">{v}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <div className="lg:col-span-7">
          <Reveal>
            <div className="relative flex items-end justify-center h-[520px] sm:h-[600px]">
              <Phone className="absolute left-0 sm:left-8 bottom-6 rotate-[-6deg] z-10 hidden sm:block" variant="alerts" delay={0.15} />
              <Phone className="relative z-20" variant="dashboard" delay={0} />
              <Phone className="absolute right-0 sm:right-8 bottom-6 rotate-[6deg] z-10 hidden sm:block" variant="ai" delay={0.3} />
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}

function Phone({
  className,
  variant,
  delay = 0,
}: {
  className?: string;
  variant: "dashboard" | "alerts" | "ai";
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ delay, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`w-[240px] sm:w-[260px] rounded-[2.5rem] p-1.5 bg-gradient-to-b from-[#11162A] to-[#070A12] shadow-wallet ${className ?? ""}`}
    >
      <div className="rounded-[2.1rem] overflow-hidden bg-bg-surface p-4 aspect-[9/19] relative">
        <div className="absolute left-1/2 -translate-x-1/2 top-2 h-5 w-20 rounded-full bg-[#0A0A0C]" />
        <div className="flex items-center justify-between mb-3 px-1 pt-0.5">
          <span className="text-caption text-ink-secondary mono font-semibold">9:41</span>
          <span className="opacity-0">●</span>
          <span className="text-caption text-ink-secondary">●●●</span>
        </div>

        {variant === "dashboard" && <ScreenDashboard />}
        {variant === "alerts" && <ScreenAlerts />}
        {variant === "ai" && <ScreenAI />}
      </div>
    </motion.div>
  );
}

function ScreenDashboard() {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[0.6rem] mono uppercase tracking-wider text-ember-500">[GM] GOOD MORNING</p>
      <div>
        <LiveValue
          to={2.41}
          prefix="$"
          suffix="M"
          decimals={2}
          jitter={0.004}
          tickMs={3800}
          duration={1.4}
          className="text-h3 text-ink-primary mono"
        />
        <p className="text-caption text-positive mono">
          +$<Counter to={184} suffix="K YoY" duration={1.2} className="inline" /> · P50 $4.82M
        </p>
      </div>
      <div className="rounded-md border border-line bg-bg-inset p-3 h-20 flex items-end overflow-hidden">
        <Sparkline
          data={NW_TRAIL}
          width={200}
          height={50}
          stroke="#0B0F1A"
          fill="rgba(11,15,26,0.06)"
          endDot
          duration={1.4}
          className="w-full h-full"
        />
      </div>
      <div className="grid grid-cols-2 gap-2 text-caption">
        {[["FIRE", "2039"], ["SURV", "94%"], ["LVR", "58%"], ["DD", "−21%"]].map(([k, v]) => (
          <div key={k} className="rounded-md border border-line bg-bg-inset p-2.5">
            <p className="text-[0.6rem] mono uppercase tracking-wider text-ink-quaternary">{k}</p>
            <p className="mt-0.5 text-body-sm text-ink-primary mono">{v}</p>
          </div>
        ))}
      </div>
      <div className="rounded-md border-l-2 border-l-ember-500 border border-line bg-bg-inset/70 p-3 text-caption text-ink-secondary">
        <div className="flex items-center gap-1.5 mb-1">
          <Sparkles className="h-3 w-3 text-ember-500" />
          <span className="text-[0.6rem] mono uppercase tracking-wider text-ember-500">[AI.03]</span>
        </div>
        Refinance window opens in 47 days. Save $1,840/mo.
      </div>
    </div>
  );
}

function ScreenAlerts() {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[0.6rem] mono uppercase tracking-wider text-ember-500">[TODAY] · 3 SIGNALS</p>
      {[
        { tag: "REFINANCE", body: "Lock 5.84% IO · saves $1,840/mo." },
        { tag: "BUFFER",    body: "Below 3-month target by month 14." },
        { tag: "TAX",       body: "$11,200 in concessional cap unused." },
      ].map((a, i) => (
        <div key={i} className="rounded-md border-l-2 border-l-ember-500 border border-line bg-bg-inset/70 p-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <Bell className="h-3 w-3 text-ember-500" />
            <span className="text-[0.6rem] mono uppercase tracking-wider text-ember-500">{a.tag}</span>
          </div>
          <p className="text-caption text-ink-secondary leading-snug">{a.body}</p>
        </div>
      ))}
    </div>
  );
}

function ScreenAI() {
  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-[0.6rem] mono uppercase tracking-wider text-ember-500">[CO-PILOT]</p>
      <div className="rounded-md border border-line bg-bg-inset p-2.5 text-caption text-ink-secondary">
        Should we add a $980K IP in Brisbane?
      </div>
      <div className="rounded-md border-l-2 border-l-ember-500 border border-line bg-bg-inset/70 p-2.5">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Sparkles className="h-3 w-3 text-ember-500" />
          <span className="text-[0.6rem] mono uppercase tracking-wider text-ember-500">MODELLED</span>
        </div>
        <p className="text-caption text-ink-secondary leading-snug">
          P50 NW +$418K by 2045. FIRE −2.4y. Liquidity P10 drops to $58K at month 14.
        </p>
      </div>
      <div className="rounded-md border border-line bg-bg-inset p-2.5 text-caption">
        <div className="flex items-center justify-between mb-1">
          <p className="text-[0.6rem] mono uppercase tracking-wider text-ink-quaternary">CASHFLOW PATH</p>
          <span className="text-[0.6rem] mono text-ember-500">+$<Counter to={4.2} decimals={1} suffix="K/mo" duration={1.4} className="inline" /></span>
        </div>
        <Sparkline
          data={CASHFLOW_PATH}
          width={200}
          height={32}
          stroke="#C97030"
          fill="rgba(201,112,48,0.08)"
          endDot
          duration={1.6}
          delay={0.1}
          className="w-full h-8"
        />
      </div>
    </div>
  );
}
