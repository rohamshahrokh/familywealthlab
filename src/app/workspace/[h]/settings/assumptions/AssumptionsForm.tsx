"use client";

import { useState, useTransition } from "react";
import { SurfaceCard, CardHeader } from "@/components/workspace/cards";
import { Field, inputCls } from "@/components/workspace/forms/Field";
import { saveAssumptions } from "./actions";

export interface AssumptionsDefaults {
  fireTargetAmount: number | null;
  fireTargetAge: number | null;
  retirementAge: number | null;
  emergencyBufferMonths: number | null;
  returnAssumption: number | null;
  inflationAssumption: number | null;
}

interface Props {
  householdId: string;
  defaults: AssumptionsDefaults;
}

/**
 * Assumptions form — controls every input the Snapshot + forecast engine
 * uses as its assumption surface. All saves go through the server action so
 * RLS enforces household ownership.
 */
export function AssumptionsForm({ householdId, defaults }: Props) {
  const [fireTargetAmount, setFireTargetAmount] = useState(numToStr(defaults.fireTargetAmount));
  const [fireTargetAge, setFireTargetAge] = useState(numToStr(defaults.fireTargetAge));
  const [retirementAge, setRetirementAge] = useState(numToStr(defaults.retirementAge));
  const [emergencyBufferMonths, setEmergencyBufferMonths] = useState(numToStr(defaults.emergencyBufferMonths));
  const [returnPct, setReturnPct] = useState(decimalToPct(defaults.returnAssumption));
  const [inflationPct, setInflationPct] = useState(decimalToPct(defaults.inflationAssumption));
  const [status, setStatus] = useState<null | "saved" | "error">(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setError(null);

    start(async () => {
      const r = await saveAssumptions({
        householdId,
        fireTargetAmount: strToNum(fireTargetAmount),
        fireTargetAge: strToInt(fireTargetAge),
        retirementAge: strToInt(retirementAge),
        emergencyBufferMonths: strToInt(emergencyBufferMonths),
        returnAssumption: pctToDecimal(returnPct),
        inflationAssumption: pctToDecimal(inflationPct),
      });
      if (r.ok) setStatus("saved");
      else {
        setStatus("error");
        setError(r.error);
      }
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <SurfaceCard>
        <CardHeader index="[A·1]" eyebrow="FIRE" title="Financial independence target" />
        <p className="text-caption text-ink-tertiary -mt-2 mb-4">
          Defines your FIRE target on every page — Snapshot, Strategy → Plan, Forecast → FIRE.
        </p>
        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="FIRE target amount" hint="Liquid net worth, AUD">
            <input
              type="number" inputMode="decimal" className={inputCls}
              value={fireTargetAmount} onChange={(e) => setFireTargetAmount(e.target.value)}
              min={0} step={10000} placeholder="e.g. 2,500,000"
            />
          </Field>
          <Field label="FIRE target age" hint="Years">
            <input
              type="number" inputMode="numeric" className={inputCls}
              value={fireTargetAge} onChange={(e) => setFireTargetAge(e.target.value)}
              min={18} max={100} step={1} placeholder="e.g. 55"
            />
          </Field>
          <Field label="Retirement age" hint="Super preservation aware">
            <input
              type="number" inputMode="numeric" className={inputCls}
              value={retirementAge} onChange={(e) => setRetirementAge(e.target.value)}
              min={18} max={100} step={1} placeholder="e.g. 65"
            />
          </Field>
        </div>
      </SurfaceCard>

      <SurfaceCard>
        <CardHeader index="[A·2]" eyebrow="Resilience" title="Emergency buffer target" />
        <p className="text-caption text-ink-tertiary -mt-2 mb-4">
          Target months of expenses to hold as cash. Drives the buffer health tile across the workspace.
        </p>
        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="Buffer months" hint="3–12 typical">
            <input
              type="number" inputMode="numeric" className={inputCls}
              value={emergencyBufferMonths} onChange={(e) => setEmergencyBufferMonths(e.target.value)}
              min={1} max={36} step={1} placeholder="6"
            />
          </Field>
        </div>
      </SurfaceCard>

      <SurfaceCard>
        <CardHeader index="[A·3]" eyebrow="Engine" title="Forecast engine assumptions" />
        <p className="text-caption text-ink-tertiary -mt-2 mb-4">
          The Forecast and Decision engines read these for both deterministic and Monte-Carlo paths. Enter as annual percentages.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Expected return" hint="Annual %, blended across investments">
            <input
              type="number" inputMode="decimal" className={inputCls}
              value={returnPct} onChange={(e) => setReturnPct(e.target.value)}
              min={-10} max={30} step={0.1} placeholder="7.0"
            />
          </Field>
          <Field label="Inflation assumption" hint="Annual %">
            <input
              type="number" inputMode="decimal" className={inputCls}
              value={inflationPct} onChange={(e) => setInflationPct(e.target.value)}
              min={-5} max={20} step={0.1} placeholder="2.5"
            />
          </Field>
        </div>
      </SurfaceCard>

      <div className="flex items-center gap-4">
        <button
          type="submit" disabled={pending}
          className="inline-flex items-center gap-2 rounded-full bg-ink-primary text-white px-5 h-10 text-body-sm font-medium hover:bg-graphite-800 transition-colors focus-ring disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save assumptions"}
        </button>
        {status === "saved" && <span className="text-body-sm text-emerald-700">Saved.</span>}
        {status === "error" && <span className="text-body-sm text-rose-600">{error}</span>}
      </div>
    </form>
  );
}

function numToStr(n: number | null): string { return n == null ? "" : String(n); }
function strToNum(s: string): number | null {
  if (s.trim() === "") return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}
function strToInt(s: string): number | null {
  if (s.trim() === "") return null;
  const n = parseInt(s, 10);
  return Number.isFinite(n) ? n : null;
}
function decimalToPct(d: number | null): string {
  if (d == null) return "";
  return String(Math.round(d * 1000) / 10);
}
function pctToDecimal(s: string): number | null {
  if (s.trim() === "") return null;
  const n = Number(s);
  return Number.isFinite(n) ? n / 100 : null;
}
