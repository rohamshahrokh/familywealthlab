"use client";

import { motion } from "framer-motion";
import { Sparkles, Droplets, Receipt, Flame, Scale } from "lucide-react";
import { Section, Eyebrow } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

interface InsightCard {
  id: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
  metric: { label: string; value: string };
  tone: "warning" | "opportunity" | "tax" | "rebalance";
}

const CARDS: InsightCard[] = [
  {
    id: "liq",
    category: "Liquidity warning",
    icon: Droplets,
    title: "Buffer dips below 3 months at month 14",
    body: "Recommend deferring discretionary spend by $640/mo or staging the EV purchase to Q4 FY26.",
    metric: { label: "Risk", value: "Medium" },
    tone: "warning",
  },
  {
    id: "tax",
    category: "Tax optimisation",
    icon: Receipt,
    title: "Salary sacrifice headroom: $11,200",
    body: "Concessional cap utilisation at 68%. Filling the gap by FY-end saves est. $5,040 tax.",
    metric: { label: "Tax saved", value: "$5,040" },
    tone: "tax",
  },
  {
    id: "fire",
    category: "FIRE acceleration",
    icon: Flame,
    title: "Refinance window opens in 47 days",
    body: "Locking 5.84% IO and redirecting $1,840/mo to VGS pulls FIRE forward by 4 years.",
    metric: { label: "Years saved", value: "−4y" },
    tone: "opportunity",
  },
  {
    id: "rebal",
    category: "Rebalance",
    icon: Scale,
    title: "Allocation drifted 7pp from target",
    body: "Crypto exposure now 14% vs 7% target. One-click rebalance keeps tax drag under $400.",
    metric: { label: "Drift", value: "7pp" },
    tone: "rebalance",
  },
];

const TONE: Record<InsightCard["tone"], { ring: string; chip: string; iconBg: string; iconColor: string }> = {
  warning: {
    ring: "ring-negative/30",
    chip: "bg-negative/10 text-negative",
    iconBg: "bg-negative/15",
    iconColor: "text-negative",
  },
  opportunity: {
    ring: "ring-accent/30",
    chip: "bg-accent/10 text-accent",
    iconBg: "bg-accent/15",
    iconColor: "text-accent",
  },
  tax: {
    ring: "ring-gold/30",
    chip: "bg-gold/10 text-gold",
    iconBg: "bg-gold/15",
    iconColor: "text-gold",
  },
  rebalance: {
    ring: "ring-info/30",
    chip: "bg-info/10 text-info",
    iconBg: "bg-info/15",
    iconColor: "text-info",
  },
};

export function AIInsights() {
  return (
    <Section id="ai-insights" className="relative overflow-hidden">
      {/* Neural ambient backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <NeuralBackdrop />
      </div>

      <div className="container-narrow">
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>Apple-intelligence-inspired</Eyebrow>
          <Reveal preset="fadeUpSlow">
            <h2 className="mt-4 text-balance font-display text-display-md text-ink-50">
              AI that understands your{" "}
              <span className="gradient-text-accent">financial life.</span>
            </h2>
          </Reveal>
          <Reveal preset="fadeUp" delay={0.1}>
            <p className="mt-5 text-balance text-[16px] leading-relaxed text-ink-300 sm:text-[17px]">
              Continuous, calm intelligence. Not a chatbot — a layer that watches every
              dollar and surfaces the single decision worth making today.
            </p>
          </Reveal>
        </div>

        {/* Cards */}
        <div className="relative mx-auto mt-16 grid max-w-4xl gap-4 sm:grid-cols-2">
          {CARDS.map((c, i) => (
            <InsightCardView key={c.id} card={c} index={i} />
          ))}
        </div>

        {/* Bottom narrative */}
        <Reveal preset="fadeUp">
          <div className="mx-auto mt-16 max-w-2xl rounded-2xl bg-bg-surface/60 p-6 ring-hairline backdrop-blur">
            <div className="flex items-center gap-2 text-eyebrow text-gold">
              <Sparkles className="h-3 w-3" />
              How it works
            </div>
            <p className="mt-3 text-[14.5px] leading-relaxed text-ink-200">
              Every change to your finances re-runs 5,000 simulations against Australian tax
              rules and your real household constraints. The model only surfaces an insight when
              the expected impact crosses a personalised threshold — so the surface stays calm.
            </p>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

function InsightCardView({ card, index }: { card: InsightCard; index: number }) {
  const tone = TONE[card.tone];
  const Icon = card.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className={cn(
        "group relative overflow-hidden rounded-2xl bg-bg-surface/60 p-6 transition-all duration-500",
        "ring-1 ring-inset ring-white/[0.06]",
        "hover:ring-white/[0.12] hover:bg-bg-elevated/70"
      )}
    >
      <div
        aria-hidden
        className="absolute -right-12 -top-12 h-40 w-40 rounded-full opacity-30 transition-opacity duration-700 group-hover:opacity-60"
        style={{
          background:
            card.tone === "warning"
              ? "radial-gradient(circle, rgba(255,84,112,0.25), transparent 70%)"
              : card.tone === "tax"
              ? "radial-gradient(circle, rgba(255,200,87,0.22), transparent 70%)"
              : card.tone === "rebalance"
              ? "radial-gradient(circle, rgba(90,200,250,0.2), transparent 70%)"
              : "radial-gradient(circle, rgba(255,107,0,0.25), transparent 70%)",
        }}
      />

      <div className="relative flex items-center gap-2.5">
        <div className={cn("flex h-7 w-7 items-center justify-center rounded-md", tone.iconBg, tone.iconColor)}>
          <Icon className="h-3.5 w-3.5" />
        </div>
        <div className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em]", tone.chip)}>
          {card.category}
        </div>
      </div>

      <h3 className="relative mt-5 font-display text-[18px] font-semibold leading-snug text-ink-50 sm:text-[20px]">
        {card.title}
      </h3>
      <p className="relative mt-3 text-[14px] leading-relaxed text-ink-300">{card.body}</p>

      <div className="relative mt-6 flex items-center justify-between border-t border-white/[0.05] pt-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.14em] text-ink-400">{card.metric.label}</div>
          <div className="num mt-0.5 text-[15px] font-semibold text-ink-50">{card.metric.value}</div>
        </div>
        <div className="text-[12px] font-medium text-ink-200 transition-colors group-hover:text-accent">
          Open scenario →
        </div>
      </div>
    </motion.div>
  );
}

function NeuralBackdrop() {
  return (
    <svg className="absolute inset-0 h-full w-full opacity-[0.18]" viewBox="0 0 1200 800" fill="none">
      <defs>
        <radialGradient id="n-grad" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#FF6B00" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#FF6B00" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="600" cy="320" r="320" fill="url(#n-grad)" />
      {/* Concentric rings */}
      {[140, 220, 300, 380, 460].map((r, i) => (
        <motion.circle
          key={r}
          cx="600"
          cy="320"
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="1"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: [0, 0.4, 0], scale: [0.9, 1.05, 1.1] }}
          transition={{
            duration: 6,
            delay: i * 0.6,
            repeat: Infinity,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{ transformOrigin: "600px 320px" }}
        />
      ))}
    </svg>
  );
}
