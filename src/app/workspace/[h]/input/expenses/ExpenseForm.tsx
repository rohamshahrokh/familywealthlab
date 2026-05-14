"use client";

import * as React from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createExpense } from "./actions";
import { Button } from "@/components/ui/Button";
import { Field, ErrorBanner, inputCls, textareaCls } from "@/components/workspace/forms/Field";

type ActionState = { ok: boolean; error?: string } | null;

export function ExpenseForm({ householdId }: { householdId: string }) {
  const [state, formAction] = useFormState(createExpense, null as ActionState);
  const formRef = React.useRef<HTMLFormElement>(null);
  React.useEffect(() => { if (state?.ok) formRef.current?.reset(); }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-5">
      <input type="hidden" name="household_id" value={householdId} />
      <ErrorBanner message={state?.ok === false ? state.error : undefined} />

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Category" required>
          <select name="category" required defaultValue="housing" className={inputCls}>
            <option value="housing">Housing</option>
            <option value="transport">Transport</option>
            <option value="food">Food</option>
            <option value="utilities">Utilities</option>
            <option value="health">Health</option>
            <option value="childcare">Childcare / education</option>
            <option value="leisure">Leisure / discretionary</option>
            <option value="insurance">Insurance</option>
            <option value="other">Other</option>
          </select>
        </Field>
        <Field label="Label" hint="Optional — describes the line item.">
          <input name="label" maxLength={120} placeholder="e.g. Groceries" className={inputCls} />
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Amount (AUD)" required>
          <input name="amount" type="number" step="0.01" min="0" inputMode="decimal" required placeholder="0.00" className={inputCls} />
        </Field>
        <Field label="Cadence" required>
          <select name="cadence" required defaultValue="monthly" className={inputCls}>
            <option value="monthly">Monthly</option>
            <option value="annual">Annual</option>
            <option value="one_off">One-off</option>
          </select>
        </Field>
      </div>

      <Field label="Treat as debt service" hint="Tick if this expense services a loan (interest + principal) so the engine excludes it from discretionary cashflow.">
        <label className="inline-flex items-center gap-2">
          <input name="is_debt_service" type="checkbox" className="h-4 w-4 accent-ember-500" />
          <span className="text-body-sm text-ink-secondary">Yes — this is a debt-service line</span>
        </label>
      </Field>

      <Field label="Notes" hint="Optional.">
        <textarea name="notes" maxLength={2000} className={textareaCls} />
      </Field>

      <Submit />
    </form>
  );
}

function Submit() {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Add expense"}</Button>;
}
