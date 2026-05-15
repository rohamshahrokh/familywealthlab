"use client";

/**
 * IncomeForm — client form that calls the `createIncome` server action.
 * Used inside the Add Income modal on the Income tab.
 */

import * as React from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createIncome } from "../income-actions";
import { INCOME_SOURCES, INCOME_FREQUENCIES } from "../income-constants";
import { FAMILY_MEMBERS } from "../expense-constants";
import { Button } from "@/components/ui/cta-button";
import { Field, ErrorBanner, SuccessBanner, inputCls, textareaCls } from "@/components/workspace/forms/Field";

type State = { ok: boolean; error?: string } | null;

export function IncomeForm({ householdId }: { householdId: string }) {
  const [state, formAction] = useFormState(createIncome, null as State);
  const formRef = React.useRef<HTMLFormElement>(null);

  React.useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-5">
      <input type="hidden" name="household_id" value={householdId} />
      <ErrorBanner message={state?.ok === false ? state.error : undefined} />
      {state?.ok && <SuccessBanner message="Income record saved." />}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Field label="Source" required>
          <select name="source" required defaultValue="Salary" className={inputCls}>
            {INCOME_SOURCES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </Field>
        <Field label="Label" hint="e.g. July salary">
          <input name="label" maxLength={120} placeholder="Description" className={inputCls} />
        </Field>
        <Field label="Member">
          <select name="member" defaultValue="" className={inputCls}>
            <option value="">—</option>
            {(FAMILY_MEMBERS as readonly string[]).map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Field label="Amount (AUD)" required>
          <input
            name="amount"
            type="number"
            step="0.01"
            min="0"
            inputMode="decimal"
            required
            placeholder="0.00"
            className={inputCls}
          />
        </Field>
        <Field label="Frequency" required>
          <select name="frequency" required defaultValue="Monthly" className={inputCls}>
            {INCOME_FREQUENCIES.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </Field>
        <Field label="Date">
          <input name="recorded_on" type="date" className={inputCls} />
        </Field>
      </div>

      <Field label="Notes" hint="Optional.">
        <textarea name="notes" maxLength={2000} className={textareaCls} />
      </Field>

      <Submit />
    </form>
  );
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} aria-label="Save income record">
      {pending ? "Saving…" : "Add Income"}
    </Button>
  );
}
