"use client";
import * as React from "react";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Lock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { HeroDashboard } from "./HeroDashboard";
import { fadeUp, t } from "@/lib/motion";

export function Hero() {
  return (
    <section
      id="top"
      className="relative isolate pt-36 pb-24 md:pt-44 md:pb-32 overflow-hidden bg-silver"
    >
      {/* Very faint dot grid + soft top spotlight */}
      <div className="absolute inset-0 grid-faint mask-fade-y opacity-50 pointer-events-none" aria-hidden />
      <div className="absolute inset-0 spotlight pointer-events-none" aria-hidden />

      <div className="container mx-auto relative">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          {/* Copy */}
          <div className="lg:col-span-7 max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={t.short}
              className="chip text-ink-tertiary"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-accent-500" />
              Private preview · Australia
            </motion.div>

            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ ...t.long, delay: 0.05 }}
              className="mt-7 text-display-lg text-ink-primary text-balance"
            >
              The wealth operating system for serious households.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ ...t.long, delay: 0.12 }}
              className="mt-6 text-lead text-ink-tertiary max-w-xl text-pretty"
            >
              Forecast outcomes, model decisions, and act on intelligent signals —
              built for Australian families managing property, super, and long-horizon capital.
            </motion.p>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ ...t.long, delay: 0.2 }}
              className="mt-9 flex flex-wrap items-center gap-3"
            >
              <Button size="lg" variant="primary">
                Request access
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="secondary">
                See the platform
              </Button>
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ ...t.long, delay: 0.28 }}
              className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-caption text-ink-quaternary"
            >
              <span className="inline-flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5" /> End-to-end encrypted
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" /> You own your data
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" /> Built for Australian tax & super
              </span>
            </motion.div>
          </div>

          {/* Dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
            className="lg:col-span-5"
          >
            <HeroDashboard />
          </motion.div>
        </div>

        {/* Logo strip */}
        <div className="mt-24 lg:mt-32 hairline pt-10">
          <p className="text-eyebrow uppercase text-ink-quaternary text-center">
            Designed around the realities of Australian household finance
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-body-sm text-ink-tertiary">
            <span>Negative gearing</span>
            <span className="h-1 w-1 rounded-full bg-ink-quinary" />
            <span>Div 293 modelling</span>
            <span className="h-1 w-1 rounded-full bg-ink-quinary" />
            <span>APRA serviceability buffer</span>
            <span className="h-1 w-1 rounded-full bg-ink-quinary" />
            <span>Super preservation age</span>
            <span className="h-1 w-1 rounded-full bg-ink-quinary" />
            <span>FY26 tax rules</span>
          </div>
        </div>
      </div>
    </section>
  );
}
