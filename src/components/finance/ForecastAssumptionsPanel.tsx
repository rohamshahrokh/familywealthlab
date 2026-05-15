"use client";

/**
 * ForecastAssumptionsPanel — collapsible Apple-style panel showing every
 * assumption that drives the forecast. Read-only in v1; editable in a future
 * iteration. Designed to NOT clutter the main chart.
 */

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { ForecastAssumptions, ForecastEvent, ForecastScenario } from "@/lib/finance/propertyForecastEngine";
import { eventLabel } from "@/lib/finance/propertyForecastEngine";
import { fmtPercent } from "@/components/workspace/format";

interface Props {
  scenario: ForecastScenario;
  baseRate: number;
  baseGrowth: number;
  baseRentGrowth: number;
  baseVacancy: number;
  assumptions: ForecastAssumptions;
  defaultOpen?: boolean;
}

const SCENARIO_DESCRIPTIONS: Record<ForecastScenario, string> = {
  base: "Central estimates · matches today's market data with neutral assumptions.",
  optimistic: "−50bps rates · +1.5% growth · +1% rent · Olympic infrastructure boost in Y6.",
  conservative: "+50bps rates · −1% growth · higher vacancy · 10% maintenance overhead.",
  stress: "+250bps shock · recession in Y4 · capex shock · −2.5% growth.",
};

export function ForecastAssumptionsPanel({
  scenario,
  baseRate,
  baseGrowth,
  baseRentGrowth,
  baseVacancy,
  assumptions,
  defaultOpen = false,
}: Props) {
  const [open, setOpen] = React.useState(defaultOpen);
  const reduceMotion = useReducedMotion();

  return (
    <div className="rounded-2xl border border-line bg-bg-inset/60 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-bg-base/40 transition-colors duration-tactile"
        aria-expanded={open}
      >
        <div>
          <div className="syslabel">
            <span className="syslabel-bracket">[i]</span>
            <span>Forecast assumptions</span>
          </div>
          <p className="mt-1 text-caption text-ink-tertiary">
            {SCENARIO_DESCRIPTIONS[scenario]}
          </p>
        </div>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="text-ink-tertiary"
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={reduceMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <AssumptionRow
                label="Interest rate"
                value={fmtPercent(baseRate)}
                hint="Base loan rate at start of forecast. Time-varying when refinance, rate spike, or rate cut events fire."
              />
              <AssumptionRow
                label="Capital growth"
                value={fmtPercent(baseGrowth)}
                hint="Assumed annual property value appreciation. Modulated by recession / Olympic boost events and the scenario shift."
              />
              <AssumptionRow
                label="Rent growth"
                value={fmtPercent(baseRentGrowth)}
                hint="Assumed annual rent increase. Vacancy reduces realised rent."
              />
              <AssumptionRow
                label="Vacancy"
                value={fmtPercent(baseVacancy)}
                hint="Assumed share of the year the property sits unrented. Recession events nudge this higher."
              />
              <AssumptionRow
                label="Volatility (rate · growth · rent · vacancy)"
                value={
                  assumptions.volatility
                    ? `±${(assumptions.volatility.rate ?? 0) * 100}bps · ±${((assumptions.volatility.growth ?? 0) * 100).toFixed(1)}% · ±${((assumptions.volatility.rentGrowth ?? 0) * 100).toFixed(1)}% · ±${((assumptions.volatility.vacancy ?? 0) * 100).toFixed(1)}%`
                    : "Off"
                }
                hint="Standard deviation around path means used to draw the p10–p90 confidence band."
              />
              <AssumptionRow
                label="Monte Carlo paths"
                value={String(assumptions.mcPaths ?? 0)}
                hint="Deterministic seeded paths. The chart band is the 10th–90th percentile of these paths' net cashflow per year."
              />
            </div>

            {(assumptions.events ?? []).length > 0 && (
              <div className="px-5 pb-5">
                <div className="text-caption mono uppercase tracking-wider text-ink-quaternary mb-2">
                  Events on timeline
                </div>
                <div className="flex flex-wrap gap-2">
                  {(assumptions.events ?? []).map((ev, i) => (
                    <EventChip key={i} ev={ev} />
                  ))}
                </div>
              </div>
            )}

            <div className="px-5 pb-5">
              <p className="text-caption text-ink-quaternary leading-relaxed">
                Modelling estimate. The forecast layers a deterministic path with seeded
                Monte Carlo noise; events apply at the start of their year and persist
                through the projection.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AssumptionRow({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-line bg-bg-base/40 px-4 py-3">
      <div className="text-caption mono uppercase tracking-wider text-ink-quaternary">
        {label}
      </div>
      <div className="mt-1 text-ink-primary tabular-nums text-sm font-medium">{value}</div>
      {hint && <div className="mt-1 text-caption text-ink-tertiary leading-snug">{hint}</div>}
    </div>
  );
}

function EventChip({ ev }: { ev: ForecastEvent }) {
  return (
    <div
      className="inline-flex items-center gap-2 rounded-full border border-line bg-bg-base/40 px-3 py-1 text-caption text-ink-secondary"
      title={`${eventLabel(ev.kind)} at year ${ev.year}`}
    >
      <span className="text-ink-quaternary mono uppercase tracking-wider text-[0.625rem]">
        Y{ev.year}
      </span>
      <span className="text-ink-primary">{ev.label ?? eventLabel(ev.kind)}</span>
      {ev.magnitude != null && (
        <span className="text-ink-tertiary tabular-nums">
          {Math.abs(ev.magnitude) < 1
            ? `${(ev.magnitude * 100).toFixed(1)}%`
            : `$${Math.round(ev.magnitude).toLocaleString()}`}
        </span>
      )}
    </div>
  );
}
