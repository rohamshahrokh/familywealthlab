"use client";
import * as React from "react";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Lock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/cta-button";
import { HeroDashboard } from "./HeroDashboard";
import { AmbientMesh, Spotlight } from "@/components/ui/AmbientMesh";
import { Magnetic } from "@/components/ui/MagneticButton";
import { heroIn, fadeUp, t } from "@/lib/motion";
import { HERO_KPIS } from "@/lib/finance-port/marketingDemoSeries";

const SIDE_RAIL = [
  { label: "PATHS", value: HERO_KPIS.paths.toLocaleString(), delta: "MONTE CARLO" },
  { label: "HORIZON", value: `${HERO_KPIS.horizonYears}Y`, delta: `FY${String(HERO_KPIS.startYear).slice(-2)} → FY${String(HERO_KPIS.endYear).slice(-2)}` },
  { label: "P10",   value: `$${HERO_KPIS.p10M.toFixed(2)}M`, delta: "10TH PCT" },
  { label: "P50",   value: `$${HERO_KPIS.projectedNetWorthM.toFixed(2)}M`, delta: "MEDIAN" },
  { label: "P90",   value: `$${HERO_KPIS.p90M.toFixed(2)}M`, delta: "90TH PCT" },
  { label: "TAX",   value: `FY${String(HERO_KPIS.startYear).slice(-2)}`,   delta: "AU RULES" },
];

export function Hero() {
  return (
    <section
      id="top"
      className="relative isolate pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden"
    >
      {/* Layered atmosphere — mesh + grid + spotlight */}
      <AmbientMesh />
      <div className="absolute inset-0 grid-fine mask-fade-y opacity-[0.35] pointer-events-none -z-10" aria-hidden />
      <Spotlight />

      <div className="container mx-auto relative">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Copy — 6 cols */}
          <div className="lg:col-span-6 max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={t.short}
              className="chip text-ink-tertiary"
            >
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-ember-500 animate-pulse-soft" />
              <span className="mono text-[0.7rem] tracking-wider">PRIVATE PREVIEW · AU · FY26</span>
            </motion.div>

            <motion.h1
              variants={heroIn}
              initial="hidden"
              animate="visible"
              className="mt-7 text-display-lg text-ink-primary text-balance tracking-tightest"
            >
              The wealth <span className="relative inline-block">
                operating system
                <span aria-hidden className="absolute left-0 -bottom-1 w-full h-[2px] bg-gradient-to-r from-ember-500/0 via-ember-500 to-ember-500/0" />
              </span> for serious households.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ ...t.long, delay: 0.18 }}
              className="mt-6 text-lead text-ink-tertiary max-w-xl text-pretty"
            >
              Forecast outcomes, model decisions, and act on intelligent signals —
              built for Australian families managing property, super, and long-horizon capital.
            </motion.p>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ ...t.long, delay: 0.28 }}
              className="mt-9 flex flex-wrap items-center gap-3"
            >
              <Magnetic strength={0.28}>
                <Button size="lg" variant="primary">
                  Request access
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Magnetic>
              <Button size="lg" variant="secondary">
                See the platform
              </Button>
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ ...t.long, delay: 0.36 }}
              className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-caption text-ink-quaternary"
            >
              <span className="inline-flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5" /> End-to-end encrypted
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" /> You own your data
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" /> Australian tax &amp; super
              </span>
            </motion.div>
          </div>

          {/* Dashboard — 5 cols */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="lg:col-span-5"
          >
            <HeroDashboard />
          </motion.div>

          {/* Side rail — monospace data column, 1 col on xl */}
          <motion.aside
            initial={{ opacity: 0, x: 14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
            className="hidden xl:flex lg:col-span-1 flex-col gap-3 self-start mt-2"
            aria-label="Model parameters"
          >
            <span className="syslabel">
              <span className="mono text-ember-500">[02]</span>
              <span>MODEL</span>
            </span>
            <div className="flex flex-col gap-1 text-[0.7rem] mono">
              {SIDE_RAIL.map((r) => (
                <div key={r.label} className="flex flex-col py-1.5 border-b border-line/60">
                  <span className="text-ink-quaternary">{r.label}</span>
                  <span className="text-ink-primary text-[0.8rem]">{r.value}</span>
                  <span className="text-[0.65rem] text-ink-quinary">{r.delta}</span>
                </div>
              ))}
            </div>
          </motion.aside>
        </div>

        {/* Logo strip — denser, monospace, ember dot */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-20 lg:mt-24 pt-8 border-t border-line"
        >
          <p className="syslabel justify-center text-center">
            <span className="mono text-ember-500">[03]</span>
            <span>DESIGNED AROUND AUSTRALIAN HOUSEHOLD FINANCE</span>
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[0.75rem] text-ink-tertiary mono uppercase tracking-wider">
            <span>Negative gearing</span>
            <span className="h-1 w-1 rounded-full bg-ember-500/60" />
            <span>Div 293</span>
            <span className="h-1 w-1 rounded-full bg-ember-500/60" />
            <span>APRA 3% buffer</span>
            <span className="h-1 w-1 rounded-full bg-ember-500/60" />
            <span>Super preservation</span>
            <span className="h-1 w-1 rounded-full bg-ember-500/60" />
            <span>FY26 rules</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
