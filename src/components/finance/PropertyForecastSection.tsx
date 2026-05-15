"use client";

/**
 * PropertyForecastSection — top-level wrapper for the Property Forecast
 * Intelligence Engine v1. Drops into any property page below the existing
 * cashflow chart. Composes:
 *   - Scenario toggle (Base / Optimistic / Conservative / Stress)
 *   - PropertyForecastChart (enhanced bars + band + events)
 *   - ForecastKPIStrip
 *   - ForecastAssumptionsPanel (collapsible)
 */

import * as React from "react";
import { SurfaceCard } from "@/components/workspace/cards";
import {
  projectAllScenarios,
  defaultAssumptions,
  type ForecastScenario,
  type ForecastAssumptions,
} from "@/lib/finance/propertyForecastEngine";
import type { PropertyEngineInput } from "@/lib/finance/propertyEngine";
import { PropertyForecastChart } from "./PropertyForecastChart";
import { ForecastKPIStrip } from "./ForecastKPIStrip";
import { ForecastAssumptionsPanel } from "./ForecastAssumptionsPanel";

interface Props {
  input: PropertyEngineInput;
  period?: "monthly" | "annual";
  horizonYears?: number;
  /** Caller-supplied assumptions (e.g. from a Forecast Engine store). */
  assumptions?: ForecastAssumptions;
}

const SCENARIOS: Array<{ key: ForecastScenario; label: string; tone: string }> = [
  { key: "base",         label: "Base",         tone: "text-ink-primary" },
  { key: "optimistic",   label: "Optimistic",   tone: "text-emerald-400" },
  { key: "conservative", label: "Conservative", tone: "text-amber-300" },
  { key: "stress",       label: "Stress",       tone: "text-rose-400" },
];

export function PropertyForecastSection({
  input,
  period = "annual",
  horizonYears = 30,
  assumptions,
}: Props) {
  const [scenario, setScenario] = React.useState<ForecastScenario>("base");
  const [showBand, setShowBand] = React.useState(true);
  const [showEvents, setShowEvents] = React.useState(true);

  const effectiveAssumptions = React.useMemo<ForecastAssumptions>(
    () => assumptions ?? defaultAssumptions(horizonYears),
    [assumptions, horizonYears],
  );

  const all = React.useMemo(
    () =>
      projectAllScenarios({
        ...input,
        horizonYears,
        assumptions: effectiveAssumptions,
      }),
    [input, horizonYears, effectiveAssumptions],
  );

  const result = all[scenario];

  return (
    <div className="space-y-4">
      <SurfaceCard>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="syslabel">
            <span className="syslabel-bracket">[Δ]</span>
            <span>Forecast intelligence · cashflow with uncertainty</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ToggleSwitch
              label="Confidence band"
              active={showBand}
              onClick={() => setShowBand((s) => !s)}
            />
            <ToggleSwitch
              label="Events"
              active={showEvents}
              onClick={() => setShowEvents((s) => !s)}
            />
          </div>
        </div>

        {/* Scenario toggle */}
        <div className="inline-flex rounded-xl border border-line bg-bg-inset p-1 text-caption mono uppercase tracking-wider mb-4">
          {SCENARIOS.map(({ key, label, tone }) => (
            <button
              key={key}
              type="button"
              onClick={() => setScenario(key)}
              aria-pressed={scenario === key}
              className={`px-3 h-8 inline-flex items-center rounded-lg transition-colors duration-tactile ${
                scenario === key
                  ? `bg-ink-primary text-white`
                  : `${tone} hover:bg-bg-base/60`
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <PropertyForecastChart
          result={result}
          period={period}
          showBand={showBand}
          showEvents={showEvents}
        />
      </SurfaceCard>

      <SurfaceCard>
        <div className="syslabel mb-3">
          <span className="syslabel-bracket">[K]</span>
          <span>Intelligent KPIs · {SCENARIOS.find((s) => s.key === scenario)?.label}</span>
        </div>
        <ForecastKPIStrip result={result} />
      </SurfaceCard>

      <ForecastAssumptionsPanel
        scenario={scenario}
        baseRate={input.interestRate}
        baseGrowth={input.growthRate}
        baseRentGrowth={input.rentGrowthRate}
        baseVacancy={0.02}
        assumptions={effectiveAssumptions}
        defaultOpen={false}
      />
    </div>
  );
}

function ToggleSwitch({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-2 px-3 h-8 rounded-lg border text-caption mono uppercase tracking-wider transition-colors duration-tactile ${
        active
          ? "border-line bg-bg-base text-ink-primary"
          : "border-line bg-bg-inset text-ink-tertiary hover:text-ink-primary"
      }`}
    >
      <span
        className={`inline-block w-1.5 h-1.5 rounded-full ${
          active ? "bg-emerald-400" : "bg-ink-quaternary"
        }`}
      />
      {label}
    </button>
  );
}
