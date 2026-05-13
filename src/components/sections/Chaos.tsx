"use client";
import * as React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Eyebrow, Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

const FRAGMENTS = [
  { label: "Bank statements", x: -260, y: -80 },
  { label: "Super dashboard", x: 240, y: -100 },
  { label: "Mortgage calculator", x: -300, y: 30 },
  { label: "Property tracker", x: 280, y: 60 },
  { label: "Tax spreadsheet", x: -200, y: 130 },
  { label: "Share register", x: 220, y: 160 },
];

export function Chaos() {
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  // Subtle convergence — much smaller travel than v1.
  const k = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.3, 0]);

  return (
    <Section spacing="xl">
      <Reveal className="max-w-2xl mx-auto text-center">
        <Eyebrow>The problem</Eyebrow>
        <h2 className="mt-5 text-display text-ink-primary text-balance">
          Wealth lives in six different tabs.
        </h2>
        <p className="mt-5 text-lead text-ink-tertiary text-pretty">
          Every household manages spreadsheets, bank apps, super portals, and
          mortgage tools that never speak to each other. Family Wealth Lab is the
          single coherent model underneath all of it.
        </p>
      </Reveal>

      <div ref={ref} className="relative mt-24 mx-auto max-w-3xl h-[420px] sm:h-[460px]">
        {/* Fragments converging toward center */}
        {FRAGMENTS.map((f, i) => (
          <motion.div
            key={f.label}
            style={{
              x: useTransform(k, (v) => f.x * v),
              y: useTransform(k, (v) => f.y * v),
              opacity: useTransform(k, [0, 0.4, 1], [0.1, 0.6, 1]),
            }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-3.5 py-2 rounded-md border border-line bg-bg-surface backdrop-blur-sm text-body-sm text-ink-tertiary whitespace-nowrap"
          >
            {f.label}
          </motion.div>
        ))}

        {/* Central unified card — reveals as fragments collapse */}
        <motion.div
          style={{
            opacity: useTransform(k, [0, 0.6, 1], [1, 0.85, 0.6]),
            scale: useTransform(k, [0, 1], [1.02, 1]),
          }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(440px,90%)]"
        >
          <div className="card-surface p-6 shadow-elevated">
            <div className="flex items-center justify-between">
              <span className="text-eyebrow uppercase text-ink-quaternary">Household model</span>
              <span className="text-caption text-positive flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-positive" />
                Unified
              </span>
            </div>
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-display text-ink-primary num">$2.41M</span>
              <span className="text-body-sm text-positive num">+$184K YoY</span>
            </div>
            <p className="mt-1.5 text-caption text-ink-quaternary">Household net worth · live</p>

            <div className="mt-5 grid grid-cols-3 gap-3 text-caption">
              <Tile label="Cash" value="$58K" />
              <Tile label="Property" value="$1.42M" />
              <Tile label="Invested" value="$932K" />
            </div>
          </div>
        </motion.div>
      </div>
    </Section>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-line bg-bg-inset p-3">
      <p className="text-eyebrow uppercase text-ink-quaternary">{label}</p>
      <p className="mt-1.5 text-body-sm text-ink-primary num">{value}</p>
    </div>
  );
}
