"use client";

import * as React from "react";

const TOGGLE_GROUP =
  "inline-flex flex-wrap rounded-xl border border-line bg-bg-inset p-1 text-caption mono uppercase tracking-wider";
const TOGGLE = (active: boolean) =>
  `px-3 h-8 inline-flex items-center rounded-lg transition-colors duration-tactile ${
    active ? "bg-ink-primary text-white" : "text-ink-tertiary hover:text-ink-primary hover:bg-bg-base/60"
  }`;

interface Props {
  forecastLabel?: string;
}

/**
 * Command Centre toolbar — view-mode toggles for the dashboard.
 * Toggles are local UI state only (the server-rendered numbers don't
 * change yet); a future iteration will hoist these into a context.
 */
export function CommandCentreToolbar({ forecastLabel = "Baseline · 2026–35" }: Props) {
  const [period, setPeriod] = React.useState<"monthly" | "annual">("monthly");
  const [hideValues, setHideValues] = React.useState(false);
  const [forecast, setForecast] = React.useState(forecastLabel);

  // Toggle a class on the document so any client component can react
  // to "hide sensitive values" without prop drilling.
  React.useEffect(() => {
    document.documentElement.classList.toggle("fwl-blur-values", hideValues);
    return () => document.documentElement.classList.remove("fwl-blur-values");
  }, [hideValues]);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className={TOGGLE_GROUP}>
        <button type="button" onClick={() => setPeriod("monthly")} className={TOGGLE(period === "monthly")}>
          Monthly
        </button>
        <button type="button" onClick={() => setPeriod("annual")} className={TOGGLE(period === "annual")}>
          Annual
        </button>
      </div>

      <label className="inline-flex items-center gap-2 text-body-sm text-ink-secondary cursor-pointer">
        <input
          type="checkbox"
          checked={hideValues}
          onChange={(e) => setHideValues(e.target.checked)}
          className="rounded border-line"
        />
        {hideValues ? "Values hidden" : "Hide values"}
      </label>

      <div className="flex items-center gap-2 ml-auto">
        <span className="text-caption mono uppercase tracking-wider text-ink-quaternary">Forecast</span>
        <select
          value={forecast}
          onChange={(e) => setForecast(e.target.value)}
          className="text-body-sm bg-bg-inset border border-line rounded-lg px-3 h-9 text-ink-primary focus-ring"
        >
          <option>Baseline · 2026–35</option>
          <option>Conservative · 2026–35</option>
          <option>Aggressive · 2026–35</option>
          <option>FIRE target · 2026–40</option>
        </select>
      </div>
    </div>
  );
}
