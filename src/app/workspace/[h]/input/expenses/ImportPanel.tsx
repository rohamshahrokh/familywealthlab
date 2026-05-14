"use client";

import * as React from "react";
import { useFormState, useFormStatus } from "react-dom";
import { importExpensesCsv } from "./actions";
import { Button } from "@/components/ui/Button";
import { Field, ErrorBanner, SuccessBanner, textareaCls } from "@/components/workspace/forms/Field";

type ActionState =
  | { ok: boolean; error?: string; created?: number; skipped?: number }
  | null;

const EXAMPLE = `date,amount,category,label,source_code,member,payment_method,cadence
2025-11-03,82.40,food,Coles weekly shop,D,Family,Credit Card,monthly
2025-11-04,3400,housing,PPOR mortgage,R,Family,Bank Transfer,monthly
2025-11-04,-25,refund,Returned headphones,RE,Alex,Credit Card,one_off
`;

export function ImportPanel({ householdId }: { householdId: string }) {
  const [state, formAction] = useFormState(importExpensesCsv, null as ActionState);
  const [open, setOpen] = React.useState(false);

  if (!open) {
    return (
      <div className="flex items-center justify-between gap-3">
        <p className="text-body-sm text-ink-tertiary">
          Import a CSV exported from your bank or budgeting tool. Refunds (negative amounts or category "refund") net against expenses.
        </p>
        <Button type="button" onClick={() => setOpen(true)}>Import CSV</Button>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="household_id" value={householdId} />
      <ErrorBanner message={state?.ok === false ? state.error : undefined} />
      {state?.ok && (
        <SuccessBanner message={`Imported ${state.created} rows${state.skipped ? ` · skipped ${state.skipped}` : ""}.`} />
      )}
      <Field
        label="CSV"
        hint="Header row required. Recognised columns: date, amount, category, label, source_code, member, payment_method, cadence, notes."
      >
        <textarea
          name="csv"
          className={`${textareaCls} font-mono text-caption`}
          rows={10}
          placeholder={EXAMPLE}
        />
      </Field>
      <div className="flex items-center gap-3 justify-end">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-body-sm text-ink-tertiary hover:text-ink-primary px-3 h-10 rounded-full"
        >
          Cancel
        </button>
        <Submit />
      </div>
    </form>
  );
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Importing…" : "Import"}
    </Button>
  );
}
