"use client";

import * as React from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createIncomeSource } from "./actions";
import { Button } from "@/components/ui/Button";
import { Field, ErrorBanner, inputCls, textareaCls } from "@/components/workspace/forms/Field";

type ActionState = { ok: boolean; error?: string } | null;

export function IncomeForm({ householdId }: { householdId: string }) {
  const [state, formAction] = useFormState(createIncomeSource, null as ActionState);
  const formRef = React.useRef<HTMLFormElement>(null);

  React.useEffect(() => { if (state?.ok) formRef.current?.reset(); }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-5">
      <input type="hidden" name="household_id" value={householdId} />
      <ErrorBanner message={state?.ok === false ? state.error : undefined} />

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Source" required>
          <select name="source" required defaultValue="salary" className={inputCls}>
            <option value="salary">Salary</option>
            <option value="rental">Rental income</option>
            <option value="dividend">Dividend / interest</option>
            <option value="business">Business / self-employment</option>
            <option value="other">Other</option>
          </select>
        </Field>
        <Field label="Label" hint="Optional — e.g. employer name.">
          <input name="label" maxLength={120} placeholder="e.g. Acme Pty Ltd" className={inputCls} />
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

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Starts on" hint="Optional — defaults to today.">
          <input name="starts_on" type="date" className={inputCls} />
        </Field>
        <Field label="Ends on" hint="Optional — leave blank if ongoing.">
          <input name="ends_on" type="date" className={inputCls} />
        </Field>
      </div>

      <Field label="Notes" hint="Optional — gross/net, tax classification, etc.">
        <textarea name="notes" maxLength={2000} className={textareaCls} />
      </Field>

      <Submit />
    </form>
  );
}

function Submit() {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Add income source"}</Button>;
}
