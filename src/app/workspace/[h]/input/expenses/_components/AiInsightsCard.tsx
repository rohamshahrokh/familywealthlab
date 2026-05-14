"use client";

/**
 * AiInsightsCard — calls the stub `generateAiInsights` server action.
 * Phase 2: replace stub with real LLM spending analysis.
 */

import * as React from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Sparkles } from "lucide-react";
import { generateAiInsights } from "../ai-insights-action";
import { Button } from "@/components/ui/Button";
import { SurfaceCard } from "@/components/workspace/cards";

type State = { ok: boolean; error?: string; result?: string } | null;

export function AiInsightsCard({ householdId }: { householdId: string }) {
  const [state, formAction] = useFormState(generateAiInsights, null as State);

  return (
    <SurfaceCard tone="paper" padding="md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <p className="text-body-sm font-semibold text-ink-primary">AI Insights</p>
            <p className="text-caption text-ink-tertiary">Spending Analysis</p>
          </div>
        </div>

        <form action={formAction}>
          <input type="hidden" name="household_id" value={householdId} />
          <GenerateBtn />
        </form>
      </div>

      {/* Result / error banner */}
      {state && (
        <div
          className={`mt-4 rounded-xl border px-4 py-3 text-body-sm ${
            state.ok
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-amber-200 bg-amber-50 text-amber-800"
          }`}
          role={state.ok ? "status" : "alert"}
        >
          {state.ok ? state.result : state.error}
        </div>
      )}
    </SurfaceCard>
  );
}

function GenerateBtn() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="secondary"
      size="sm"
      disabled={pending}
      aria-label="Generate AI spending insights"
    >
      <Sparkles className="h-3.5 w-3.5" />
      {pending ? "Analysing…" : "Generate Insights"}
    </Button>
  );
}
