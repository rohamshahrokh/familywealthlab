"use client";

/**
 * AppTopBar.tsx
 * --------------------------------------------------------------------------
 * APP_SHELL_UI_UX_FIX_PASS_01 — Issues 2 & 6
 *
 * Restores the top control bar from the original personal-app dashboard:
 *   - Live date/time (Australia/Brisbane)
 *   - Monthly / Annual toggle (drives useAppStore.chartView)
 *   - Show / Hide values toggle (drives useAppStore.privacyMode)
 *   - Light / Dark theme toggle (drives useAppStore.theme, persisted)
 *   - User badge / profile pill (Demo Household)
 *
 * All state is in the existing Zustand `useAppStore`, which persists to
 * localStorage under "shahrokh-app-state". No backend, no Supabase, no
 * route changes. Mounted exclusively on the client to avoid hydration
 * mismatches from Date.now().
 */

import * as React from "react";
import { Eye, EyeOff, Sun, Moon, UserCircle2 } from "lucide-react";
import { useAppStore, applyTheme, type ThemeMode } from "@/lib/finance-port/store";

function formatBrisbaneTime(now: Date): string {
  // e.g. "Fri 15 May · 1:12 PM"
  const date = new Intl.DateTimeFormat("en-AU", {
    timeZone: "Australia/Brisbane",
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).format(now);
  const time = new Intl.DateTimeFormat("en-AU", {
    timeZone: "Australia/Brisbane",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(now);
  return `${date} · ${time}`;
}

export function AppTopBar() {
  // Avoid SSR/hydration mismatch — only render dynamic text after mount.
  const [mounted, setMounted] = React.useState(false);
  const [now, setNow] = React.useState<Date>(() => new Date());

  // Typed selectors against the AppStore so this strict-TS component
  // compiles cleanly under tsc --noEmit (Next.js itself runs with
  // ignoreBuildErrors=true for the ported legacy code).
  const theme         = useAppStore((s): ThemeMode    => s.theme);
  const toggleTheme   = useAppStore((s): () => void   => s.toggleTheme);
  const privacyMode   = useAppStore((s): boolean      => s.privacyMode);
  const togglePrivacy = useAppStore((s): () => void   => s.togglePrivacy);
  const chartView     = useAppStore((s): "monthly" | "annual" => s.chartView);
  const setChartView  = useAppStore((s): (v: "monthly" | "annual") => void => s.setChartView);

  // Apply the persisted theme class to <html> on mount (Zustand `persist`
  // rehydrates after the first render, so we re-apply here).
  React.useEffect(() => {
    setMounted(true);
    applyTheme(theme);
  }, [theme]);

  // Tick the clock every 30s while mounted.
  React.useEffect(() => {
    if (!mounted) return;
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, [mounted]);

  return (
    <div
      role="toolbar"
      aria-label="Workspace controls"
      className="sticky top-0 z-20 flex items-center gap-2 border-b border-line bg-bg-base/85 backdrop-blur px-4 py-2 lg:px-6"
    >
      {/* Time (hidden on very small screens to save space) */}
      <div
        className="hidden sm:flex items-center text-caption mono uppercase tracking-wider text-ink-quaternary"
        suppressHydrationWarning
      >
        {mounted ? formatBrisbaneTime(now) : "\u00a0"}
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        {/* Monthly / Annual toggle */}
        <div
          className="flex items-center rounded-lg border border-line bg-bg-inset p-0.5"
          role="group"
          aria-label="Period"
        >
          {(["monthly", "annual"] as const).map((view) => {
            const active = chartView === view;
            return (
              <button
                key={view}
                type="button"
                onClick={() => setChartView(view)}
                aria-pressed={active}
                className={`px-2.5 h-7 rounded-md text-caption mono uppercase tracking-wider transition-colors focus-ring ${
                  active
                    ? "bg-ink-primary text-white"
                    : "text-ink-secondary hover:text-ink-primary"
                }`}
              >
                {view === "monthly" ? "Monthly" : "Annual"}
              </button>
            );
          })}
        </div>

        {/* Show / Hide values toggle */}
        <button
          type="button"
          onClick={togglePrivacy}
          aria-pressed={privacyMode}
          title={privacyMode ? "Show values" : "Hide values"}
          className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md border border-line bg-bg-inset text-caption mono uppercase tracking-wider text-ink-secondary hover:text-ink-primary transition-colors focus-ring"
        >
          {privacyMode ? (
            <Eye className="h-3.5 w-3.5" aria-hidden />
          ) : (
            <EyeOff className="h-3.5 w-3.5" aria-hidden />
          )}
          <span className="hidden sm:inline">
            {privacyMode ? "Show" : "Hide"}
          </span>
        </button>

        {/* Light / Dark theme toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={
            theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
          }
          title={
            theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
          }
          className="inline-flex items-center justify-center h-7 w-7 rounded-md border border-line bg-bg-inset text-ink-secondary hover:text-ink-primary transition-colors focus-ring"
        >
          {/* Render the icon for the destination theme so the affordance is
              consistent across re-hydration. */}
          {mounted && theme === "dark" ? (
            <Sun className="h-3.5 w-3.5" aria-hidden />
          ) : (
            <Moon className="h-3.5 w-3.5" aria-hidden />
          )}
        </button>

        {/* User badge / profile pill — commercial demo identity */}
        <div
          className="inline-flex items-center gap-1.5 h-7 pl-1.5 pr-2.5 rounded-md border border-line bg-bg-inset text-caption mono uppercase tracking-wider text-ink-secondary"
          aria-label="Signed-in profile"
        >
          <UserCircle2 className="h-4 w-4 text-ember-500" aria-hidden />
          <span className="hidden sm:inline">Demo</span>
        </div>
      </div>
    </div>
  );
}

export default AppTopBar;
