"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export function FinalCTA() {
  return (
    <Section id="cta" className="relative overflow-hidden pb-32 pt-20 sm:pt-28">
      {/* Backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 h-[900px] w-[1500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/[0.12] blur-[160px]" />
        <div className="absolute inset-0 grid-bg opacity-50" />
      </div>

      <div className="container-narrow">
        <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl bg-gradient-to-b from-bg-elevated/80 to-bg-surface/80 px-8 py-20 text-center ring-1 ring-inset ring-white/[0.06] backdrop-blur-xl sm:px-16 sm:py-28">
          {/* Top spark */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 backdrop-blur"
          >
            <Sparkles className="h-3 w-3 text-gold" />
            <span className="text-[11.5px] font-medium text-ink-200">
              Private preview · invite-only
            </span>
          </motion.div>

          <Reveal preset="fadeUpSlow" amount={0.2}>
            <h2 className="mt-7 text-balance font-display text-display-lg text-ink-50">
              Stop guessing.{" "}
              <span className="gradient-text-accent">Start engineering wealth.</span>
            </h2>
          </Reveal>

          <Reveal preset="fadeUp" delay={0.1} amount={0.2}>
            <p className="mx-auto mt-6 max-w-xl text-balance text-[16px] leading-relaxed text-ink-300 sm:text-[17px]">
              Join the families building the next decade of their financial life with the
              operating system designed for clarity, decisions, and compounding.
            </p>
          </Reveal>

          <Reveal preset="fadeUp" delay={0.2} amount={0.2}>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button variant="primary" size="xl" asChild>
                <a href="#top">
                  Start free
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="secondary" size="xl" asChild>
                <a href="#command-center">Explore the engine</a>
              </Button>
            </div>
          </Reveal>

          <Reveal preset="fadeIn" delay={0.35}>
            <div className="mt-10 text-[12.5px] text-ink-400">
              Brisbane, Australia · Modelling only — not personal financial advice.
            </div>
          </Reveal>

          {/* Decorative aperture rings */}
          <svg
            aria-hidden
            className="pointer-events-none absolute -bottom-40 left-1/2 -translate-x-1/2 opacity-60"
            width="600"
            height="200"
            viewBox="0 0 600 200"
            fill="none"
          >
            <defs>
              <linearGradient id="cta-grad" x1="0" y1="0" x2="600" y2="0">
                <stop offset="0%" stopColor="#FFC857" stopOpacity="0" />
                <stop offset="50%" stopColor="#FF6B00" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#FFC857" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[80, 130, 180, 240].map((r, i) => (
              <ellipse
                key={r}
                cx="300"
                cy={200 + i * 8}
                rx={r * 2}
                ry={r * 0.7}
                stroke="url(#cta-grad)"
                strokeWidth="1"
                fill="none"
                opacity={1 - i * 0.2}
              />
            ))}
          </svg>
        </div>
      </div>
    </Section>
  );
}
