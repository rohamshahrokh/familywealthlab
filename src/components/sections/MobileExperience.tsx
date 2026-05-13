"use client";
import * as React from "react";
import { Eyebrow, Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { Bell, Sparkles } from "lucide-react";

export function MobileExperience() {
  return (
    <Section spacing="xl" id="mobile">
      <div className="grid lg:grid-cols-12 gap-12 lg:gap-10 items-center">
        <div className="lg:col-span-5">
          <Reveal>
            <Eyebrow>Mobile</Eyebrow>
            <h2 className="mt-5 text-display text-ink-primary text-balance">
              Your household, in your pocket.
            </h2>
            <p className="mt-5 text-lead text-ink-tertiary text-pretty max-w-md">
              A native-grade mobile experience. Glanceable dashboards, swipeable
              scenarios, and notifications that only arrive when something
              genuinely changed.
            </p>
            <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-3 text-body-sm text-ink-secondary">
              {[
                "Dashboard glance",
                "AI co-pilot",
                "Smart alerts",
                "Live scenarios",
                "Cashflow pulse",
                "Property tracker",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2.5">
                  <span className="h-1 w-1 rounded-full bg-accent-500" />
                  {f}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <div className="lg:col-span-7">
          <Reveal>
            <div className="relative flex items-end justify-center h-[520px] sm:h-[600px]">
              <Phone className="absolute left-0 sm:left-8 bottom-6 rotate-[-6deg] z-10 hidden sm:block" variant="alerts" />
              <Phone className="relative z-20" variant="dashboard" />
              <Phone className="absolute right-0 sm:right-8 bottom-6 rotate-[6deg] z-10 hidden sm:block" variant="ai" />
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
}: {
  className?: string;
  variant: "dashboard" | "alerts" | "ai";
}) {
  return (
    <div
      className={`w-[240px] sm:w-[260px] rounded-[2.5rem] p-1.5 bg-gradient-to-b from-[#2A2A2C] to-[#1A1A1C] shadow-wallet ${className ?? ""}`}
    >
      {/* Outer bezel + inner screen */}
      <div className="rounded-[2.1rem] overflow-hidden bg-bg-surface p-4 aspect-[9/19] relative">
        {/* Dynamic island */}
        <div className="absolute left-1/2 -translate-x-1/2 top-2 h-5 w-20 rounded-full bg-[#0A0A0C]" />
        {/* Status bar */}
        <div className="flex items-center justify-between mb-3 px-1 pt-0.5">
          <span className="text-caption text-ink-secondary num font-semibold">9:41</span>
          <span className="opacity-0">●</span>
          <span className="text-caption text-ink-secondary">●●●</span>
        </div>

        {variant === "dashboard" && <ScreenDashboard />}
        {variant === "alerts" && <ScreenAlerts />}
        {variant === "ai" && <ScreenAI />}
      </div>
    </div>
  );
}

function ScreenDashboard() {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-eyebrow uppercase text-ink-quaternary">Good morning, Roham</p>
      <div>
        <p className="text-h3 text-ink-primary num">$2.41M</p>
        <p className="text-caption text-positive num">+$184K YoY · P50 $4.82M</p>
      </div>
      <div className="rounded-md border border-line bg-bg-inset p-3 h-20 flex items-end">
        <svg viewBox="0 0 200 50" className="w-full h-full">
          <path d="M0,40 C40,32 80,26 120,18 C160,10 180,8 200,4" fill="none" stroke="#3E6A95" strokeWidth="1.5" />
        </svg>
      </div>
      <div className="grid grid-cols-2 gap-2 text-caption">
        {[["FIRE", "2039"], ["Surv.", "94%"], ["LVR", "58%"], ["DD", "−21%"]].map(([k, v]) => (
          <div key={k} className="rounded-md border border-line bg-bg-inset p-2.5">
            <p className="text-eyebrow uppercase text-ink-quaternary">{k}</p>
            <p className="mt-0.5 text-body-sm text-ink-primary num">{v}</p>
          </div>
        ))}
      </div>
      <div className="rounded-md border border-accent-500/40 bg-accent-50 p-3 text-caption text-ink-secondary">
        <div className="flex items-center gap-1.5 mb-1">
          <Sparkles className="h-3 w-3 text-accent-500" />
          <span className="text-eyebrow uppercase text-accent-500">AI</span>
        </div>
        Refinance window opens in 47 days. Save $1,840/mo.
      </div>
    </div>
  );
}

function ScreenAlerts() {
  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-eyebrow uppercase text-ink-quaternary">Today</p>
      {[
        { tag: "Refinance window", body: "Lock 5.84% IO · saves $1,840/mo." },
        { tag: "Cashflow buffer", body: "Below 3-month target by month 14." },
        { tag: "Tax headroom", body: "$11,200 in concessional cap unused." },
      ].map((a, i) => (
        <div key={i} className="rounded-md border border-line bg-bg-inset p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Bell className="h-3 w-3 text-accent-500" />
            <span className="text-eyebrow uppercase text-accent-500">{a.tag}</span>
          </div>
          <p className="text-caption text-ink-secondary">{a.body}</p>
        </div>
      ))}
    </div>
  );
}

function ScreenAI() {
  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-eyebrow uppercase text-ink-quaternary">AI Co-pilot</p>
      <div className="rounded-md border border-line bg-bg-inset p-3 text-caption text-ink-secondary">
        Should we add a $980K IP in Brisbane?
      </div>
      <div className="rounded-md border border-accent-500/40 bg-accent-50 p-3">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Sparkles className="h-3 w-3 text-accent-500" />
          <span className="text-eyebrow uppercase text-accent-500">Modelled</span>
        </div>
        <p className="text-caption text-ink-secondary leading-relaxed">
          P50 NW +$418K by 2045. FIRE −2.4y. Liquidity P10 drops to $58K at month 14.
        </p>
      </div>
      <div className="rounded-md border border-line bg-bg-inset p-3 text-caption">
        <p className="text-eyebrow uppercase text-ink-quaternary mb-1">Cashflow path</p>
        <svg viewBox="0 0 200 40" className="w-full h-8">
          <path d="M0,30 L40,28 L80,22 L120,26 L160,16 L200,12" fill="none" stroke="#3E6A95" strokeWidth="1.5" />
        </svg>
      </div>
    </div>
  );
}
