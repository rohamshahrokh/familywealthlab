"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { HeroDashboard } from "./HeroDashboard";

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  return (
    <section id="top" className="relative isolate overflow-hidden pt-32 sm:pt-36 lg:pt-40">
      {/* Ambient backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-[720px] bg-radial-fade" />
        <div className="absolute inset-0 grid-bg" />
        <div className="absolute left-1/2 top-[420px] h-[600px] w-[1200px] -translate-x-1/2 rounded-full bg-accent/10 blur-[140px]" />
      </div>

      <div className="container-narrow">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          {/* LEFT */}
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease, delay: 0.05 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 backdrop-blur-sm"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse-soft" />
              <span className="text-[11.5px] font-medium tracking-tight text-ink-200">
                Now in private preview · Australia
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease, delay: 0.15 }}
              className="mt-7 text-balance font-display text-display-lg text-ink-50"
            >
              Engineer your family's{" "}
              <span className="gradient-text-accent">financial future.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease, delay: 0.3 }}
              className="mt-6 max-w-xl text-balance text-[17px] leading-relaxed text-ink-300 sm:text-lg"
            >
              AI-powered forecasting, property strategy, FIRE planning, and decision
              intelligence — built for Australian families who want to compound clarity,
              not noise.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease, delay: 0.45 }}
              className="mt-9 flex flex-wrap items-center gap-3"
            >
              <Button variant="primary" size="lg" asChild>
                <a href="#cta">
                  Start building wealth
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="secondary" size="lg" asChild>
                <a href="#what-if">
                  <Play className="h-3.5 w-3.5 fill-current" />
                  Watch demo
                </a>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, ease, delay: 0.7 }}
              className="mt-8 flex items-center gap-2 text-[12.5px] text-ink-400"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-ink-300" />
              <span>Private</span>
              <span className="h-1 w-1 rounded-full bg-ink-500" />
              <span>Encrypted</span>
              <span className="h-1 w-1 rounded-full bg-ink-500" />
              <span>Australian-focused</span>
            </motion.div>
          </div>

          {/* RIGHT */}
          <div className="relative">
            <HeroDashboard />
          </div>
        </div>

        {/* Hairline + trust strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 1.2 }}
          className="mt-24 flex flex-col items-center gap-4 border-t border-white/[0.06] pt-10 text-center sm:mt-32"
        >
          <div className="text-eyebrow text-ink-400">Designed around real Australian household decisions</div>
          <div className="grid w-full grid-cols-2 gap-x-8 gap-y-4 text-[12.5px] text-ink-300 sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-10">
            <span>Negative gearing · FY26 rules</span>
            <span className="hidden sm:block h-1 w-1 rounded-full bg-ink-600" />
            <span>Div 293 modelling</span>
            <span className="hidden sm:block h-1 w-1 rounded-full bg-ink-600" />
            <span>APRA serviceability buffer</span>
            <span className="hidden sm:block h-1 w-1 rounded-full bg-ink-600" />
            <span>Super preservation age logic</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
