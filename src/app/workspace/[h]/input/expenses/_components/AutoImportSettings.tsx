"use client";

/**
 * AutoImportSettings — collapsible card for future bank-feed automation.
 * Currently a "Coming soon" placeholder with mock fields.
 */

import * as React from "react";
import { ChevronDown, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { SurfaceCard, CardHeader } from "@/components/workspace/cards";

export function AutoImportSettings() {
  const [open, setOpen] = React.useState(false);

  return (
    <SurfaceCard tone="inset" padding="sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-3 text-left"
        aria-expanded={open}
        aria-controls="auto-import-panel"
      >
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
            <Zap className="h-4 w-4" />
          </span>
          <div>
            <p className="text-body-sm font-semibold text-ink-primary">Auto Import Settings</p>
            <p className="text-caption text-ink-tertiary">Bank feed connection</p>
          </div>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-ink-quaternary transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div id="auto-import-panel" className="mt-4 space-y-4">
          <div className="rounded-xl border border-dashed border-line p-6 text-center space-y-2">
            <p className="text-body-sm font-medium text-ink-secondary">
              Bank feed auto-import coming soon
            </p>
            <p className="text-caption text-ink-quaternary max-w-sm mx-auto">
              Connect your bank account to automatically import transactions.
              We support ANZ, CBA, Westpac, NAB and more via open banking.
            </p>
          </div>

          {/* Mock fields */}
          <div className="grid sm:grid-cols-2 gap-3 opacity-40 pointer-events-none select-none">
            <label className="block space-y-1.5">
              <span className="text-caption text-ink-secondary font-medium">Bank</span>
              <select
                disabled
                className="h-9 w-full rounded-lg border border-line bg-bg-base px-2.5 text-body-sm text-ink-quaternary"
              >
                <option>Select bank…</option>
              </select>
            </label>
            <label className="block space-y-1.5">
              <span className="text-caption text-ink-secondary font-medium">Account</span>
              <input
                disabled
                placeholder="BSB + Account Number"
                className="h-9 w-full rounded-lg border border-line bg-bg-base px-3 text-body-sm text-ink-quaternary"
              />
            </label>
          </div>
        </div>
      )}
    </SurfaceCard>
  );
}
