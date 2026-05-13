"use client";

import { motion } from "framer-motion";
import { Bell, ChevronRight, Sparkles } from "lucide-react";
import { Section, Eyebrow } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

export function MobileExperience() {
  return (
    <Section id="mobile" className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute right-0 top-1/3 h-[500px] w-[600px] rounded-full bg-gold/[0.05] blur-[120px]" />
      </div>

      <div className="container-narrow">
        <div className="grid items-center gap-16 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <Eyebrow>On every device</Eyebrow>
            <Reveal preset="fadeUpSlow">
              <h2 className="mt-4 text-balance font-display text-display-md text-ink-50">
                Your wealth, in your{" "}
                <span className="gradient-text-accent">pocket.</span>
              </h2>
            </Reveal>
            <Reveal preset="fadeUp" delay={0.1}>
              <p className="mt-5 max-w-lg text-balance text-[16px] leading-relaxed text-ink-300 sm:text-[17px]">
                A native-grade mobile experience. Glanceable cards, swipeable scenarios,
                and intelligent notifications that arrive only when something actually changed.
              </p>
            </Reveal>

            <Reveal preset="fadeUp" delay={0.2}>
              <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 text-[14px]">
                {[
                  "Dashboard glance",
                  "AI co-pilot",
                  "Smart alerts",
                  "Live scenarios",
                  "Cashflow pulse",
                  "Property tracker",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-ink-200">
                    <span className="h-1 w-1 rounded-full bg-accent" />
                    {f}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          {/* Phone cluster */}
          <div className="relative flex h-[600px] items-center justify-center sm:h-[680px]">
            <PhoneStack />
          </div>
        </div>
      </div>
    </Section>
  );
}

function PhoneStack() {
  return (
    <>
      {/* Back phone */}
      <motion.div
        initial={{ opacity: 0, x: -32, rotate: -12 }}
        whileInView={{ opacity: 1, x: 0, rotate: -8 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="absolute left-[6%] top-[8%] hidden sm:block"
      >
        <Phone variant="alerts" />
      </motion.div>

      {/* Front phone */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10"
      >
        <Phone variant="dashboard" />
      </motion.div>

      {/* Right phone */}
      <motion.div
        initial={{ opacity: 0, x: 32, rotate: 12 }}
        whileInView={{ opacity: 1, x: 0, rotate: 8 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="absolute right-[6%] top-[10%] hidden sm:block"
      >
        <Phone variant="ai" />
      </motion.div>
    </>
  );
}

function Phone({ variant }: { variant: "dashboard" | "alerts" | "ai" }) {
  return (
    <div className="relative h-[560px] w-[280px] rounded-[44px] bg-gradient-to-b from-[#1a2234] to-[#0c1322] p-2 shadow-elevated ring-1 ring-white/10">
      {/* Bezel */}
      <div className="absolute inset-0 rounded-[44px] ring-1 ring-inset ring-black/40" />
      {/* Screen */}
      <div className="relative h-full w-full overflow-hidden rounded-[36px] bg-bg-base">
        {/* Notch */}
        <div className="absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-black" />
        {/* Status bar */}
        <div className="relative flex h-10 items-center justify-between px-6 pt-3 text-[10px] font-medium text-ink-100">
          <span>9:41</span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-ink-100" />
            <span className="h-1.5 w-1.5 rounded-full bg-ink-100" />
            <span className="h-1.5 w-1.5 rounded-full bg-ink-100" />
          </span>
        </div>
        {variant === "dashboard" && <PhoneDashboard />}
        {variant === "alerts" && <PhoneAlerts />}
        {variant === "ai" && <PhoneAI />}
      </div>
    </div>
  );
}

function PhoneDashboard() {
  return (
    <div className="px-5 pb-6 pt-3">
      <div className="text-[10px] uppercase tracking-[0.16em] text-ink-400">Good morning, Roham</div>
      <div className="num mt-1 font-display text-[28px] font-semibold text-ink-50">$2.41M</div>
      <div className="num text-[11px] text-positive">+$184K YoY · P50 $4.82M</div>

      <div className="mt-5 h-28 rounded-xl bg-bg-surface/70 p-3 ring-hairline">
        <svg viewBox="0 0 240 80" className="h-full w-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="p-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#FF6B00" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#FF6B00" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="p-line" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#FFC857" />
              <stop offset="100%" stopColor="#FF6B00" />
            </linearGradient>
          </defs>
          <path d="M 0 70 C 30 60, 60 50, 90 42 S 150 24, 180 18 220 8, 240 4 L 240 80 L 0 80 Z" fill="url(#p-fill)" />
          <path d="M 0 70 C 30 60, 60 50, 90 42 S 150 24, 180 18 220 8, 240 4" fill="none" stroke="url(#p-line)" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <PhoneStat label="FIRE" value="2039" sub="−4y" positive />
        <PhoneStat label="Surv." value="94%" sub="+6pp" positive />
        <PhoneStat label="LVR" value="58%" sub="−3pp" positive />
        <PhoneStat label="DD" value="−21%" sub="−3pp" positive />
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-xl bg-accent/[0.08] p-3 ring-1 ring-inset ring-accent/20">
        <Sparkles className="h-3.5 w-3.5 text-gold" />
        <div className="flex-1 text-[11px] leading-snug text-ink-100">
          Refinance window opens in 47 days. Save $1,840/mo.
        </div>
        <ChevronRight className="h-3 w-3 text-ink-300" />
      </div>
    </div>
  );
}

function PhoneStat({
  label,
  value,
  sub,
  positive,
}: {
  label: string;
  value: string;
  sub: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-md bg-bg-surface/60 p-2 ring-hairline">
      <div className="text-[9px] uppercase tracking-[0.12em] text-ink-400">{label}</div>
      <div className="num mt-0.5 text-[14px] font-semibold text-ink-50">{value}</div>
      <div className={cn("num text-[9.5px] font-medium", positive ? "text-positive" : "text-negative")}>
        {sub}
      </div>
    </div>
  );
}

function PhoneAlerts() {
  const alerts = [
    { time: "now", title: "Refinance window opens", body: "Lock 5.84% IO · save $1,840/mo" },
    { time: "1h ago", title: "Cashflow buffer dipped", body: "Below 3-month buffer at month 14" },
    { time: "Yesterday", title: "Salary sacrifice headroom", body: "$11,200 left · save $5,040 tax" },
  ];
  return (
    <div className="px-4 pb-6 pt-3">
      <div className="text-[10px] uppercase tracking-[0.16em] text-ink-400">Today</div>
      <div className="mt-2 space-y-2">
        {alerts.map((a, i) => (
          <motion.div
            key={a.title}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.4 + i * 0.12 }}
            className="rounded-2xl bg-bg-surface/80 p-3 ring-hairline backdrop-blur"
          >
            <div className="flex items-center gap-2">
              <Bell className="h-3 w-3 text-gold" />
              <span className="text-[10px] uppercase tracking-[0.14em] text-gold">FWL · {a.time}</span>
            </div>
            <div className="mt-1.5 text-[12px] font-semibold text-ink-50">{a.title}</div>
            <div className="mt-0.5 text-[11px] text-ink-300">{a.body}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function PhoneAI() {
  return (
    <div className="px-4 pb-6 pt-3">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-gold">
        <Sparkles className="h-3 w-3" />
        FWL Intelligence
      </div>
      <div className="mt-4 space-y-2.5">
        <ChatBubble side="user">If I buy a $980K IP in Brisbane, what changes?</ChatBubble>
        <ChatBubble side="ai">
          Median NW +$418K by 2045. FIRE −2.4y. Liquidity P10 drops to $58K — watch month 14.
        </ChatBubble>
        <ChatBubble side="user">Show the cashflow path.</ChatBubble>
        <ChatBubble side="ai">
          Opening the projection now. Stress: rates +200bps narrows the gap to $24K.
        </ChatBubble>
      </div>
    </div>
  );
}

function ChatBubble({ side, children }: { side: "user" | "ai"; children: React.ReactNode }) {
  return (
    <div className={cn("flex", side === "user" ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[88%] rounded-2xl px-3 py-2 text-[11.5px] leading-snug",
          side === "user"
            ? "bg-accent text-white"
            : "bg-bg-surface/80 text-ink-100 ring-hairline"
        )}
      >
        {children}
      </div>
    </div>
  );
}
