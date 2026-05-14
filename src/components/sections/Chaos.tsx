"use client";
import * as React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Section, SystemLabel } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { Counter } from "@/components/ui/Counter";
import { LiveValue } from "@/components/ui/LiveValue";

type Fragment = {
  label: string;
  meta: string;
  value: string;
  x: number;
  y: number;
  rot: number;
};

const FRAGMENTS: Fragment[] = [
  { label: "BANK STATEMENTS",  meta: "CBA · NAB",         value: "$58K",    x: -300, y: -120, rot: -3 },
  { label: "SUPER DASHBOARD",  meta: "AustralianSuper",   value: "$420K",   x:  260, y: -130, rot:  4 },
  { label: "MORTGAGE TRACKER", meta: "Westpac IO",        value: "$680K",   x: -320, y:   20, rot:  2 },
  { label: "PROPERTY",         meta: "Bris · Brisbane",   value: "$1.42M",  x:  300, y:    40, rot: -2 },
  { label: "TAX SPREADSHEET",  meta: "FY26 draft",        value: "$184K",   x: -240, y:  160, rot:  4 },
  { label: "SHARE REGISTER",   meta: "VAS · VGS · BTC",   value: "$512K",   x:  240, y:  180, rot: -3 },
];

export function Chaos() {
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  // 1 = scattered, 0 = converged
  const k = useTransform(scrollYProgress, [0, 0.55, 1], [1, 0.18, 0]);

  return (
    <Section spacing="lg">
      <Reveal className="max-w-2xl mx-auto text-center">
        <SystemLabel index="04" label="THE PROBLEM" />
        <h2 className="mt-4 text-display text-ink-primary text-balance tracking-tighter">
          Wealth lives in <span className="text-ember-500">six different tabs.</span>
        </h2>
        <p className="mt-5 text-lead text-ink-tertiary text-pretty">
          Every household manages spreadsheets, bank apps, super portals, and
          mortgage tools that never speak to each other. Family Wealth Lab is the
          single coherent model underneath all of it.
        </p>
      </Reveal>

      <div ref={ref} className="relative mt-20 mx-auto max-w-4xl h-[460px] sm:h-[520px] grid-fine rounded-2xl">
        {/* Fragments converging */}
        {FRAGMENTS.map((f) => (
          <motion.div
            key={f.label}
            style={{
              x: useTransform(k, (v) => f.x * v),
              y: useTransform(k, (v) => f.y * v),
              rotate: useTransform(k, (v) => f.rot * v),
              opacity: useTransform(k, [0, 0.45, 1], [0.18, 0.75, 1]),
            }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px]"
          >
            <div className="card-surface px-3.5 py-2.5">
              <div className="flex items-center justify-between">
                <span className="syslabel text-[0.6rem]">
                  <span className="mono text-ember-500">·</span>
                  <span>{f.label}</span>
                </span>
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-caption text-ink-quinary mono">{f.meta}</span>
                <span className="text-body-sm text-ink-primary mono">{f.value}</span>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Central unified card */}
        <motion.div
          style={{
            opacity: useTransform(k, [0, 0.55, 1], [1, 0.92, 0.55]),
            scale: useTransform(k, [0, 1], [1.02, 1]),
          }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(460px,92%)]"
        >
          <div className="card-cinematic p-6">
            <div className="flex items-center justify-between">
              <span className="syslabel">
                <span className="mono text-ember-500">[05]</span>
                <span>UNIFIED HOUSEHOLD</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-caption text-positive mono">
                <span className="h-1.5 w-1.5 rounded-full bg-positive animate-pulse-soft" />
                LIVE
              </span>
            </div>
            <div className="mt-4 flex items-baseline gap-3">
              <LiveValue
                to={2.41}
                prefix="$"
                suffix="M"
                decimals={2}
                jitter={0.004}
                tickMs={4200}
                duration={1.6}
                className="text-display text-ink-primary mono tracking-tightest"
              />
              <span className="text-body-sm text-positive mono">
                +$<Counter to={184} suffix="K YoY" duration={1.4} className="inline" />
              </span>
            </div>
            <p className="mt-1.5 text-caption text-ink-quaternary mono uppercase tracking-wider">
              Net worth · reconciled across 14 sources
            </p>

            <div className="mt-5 grid grid-cols-4 gap-2 text-caption">
              {[
                ["CASH", "$58K"],
                ["PROP", "$1.42M"],
                ["SUPER", "$420K"],
                ["INV", "$512K"],
              ].map(([k, v]) => (
                <div key={k} className="rounded-md border border-line bg-bg-inset px-2.5 py-2">
                  <p className="text-[0.6rem] uppercase text-ink-quaternary mono tracking-wider">{k}</p>
                  <p className="mt-0.5 text-body-sm text-ink-primary mono">{v}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </Section>
  );
}
