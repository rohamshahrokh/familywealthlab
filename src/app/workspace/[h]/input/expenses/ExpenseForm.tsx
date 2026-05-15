"use client";

import * as React from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createExpense } from "./actions";
import {
  EXPENSE_CATEGORIES,
  EXPENSE_CATEGORY_LABELS,
  SOURCE_CODES,
  SOURCE_CODE_LABELS,
  FAMILY_MEMBERS,
  PAYMENT_METHODS,
} from "./expense-constants";
import { Button } from "@/components/ui/cta-button";
import { Field, ErrorBanner, inputCls, textareaCls } from "@/components/workspace/forms/Field";

type ActionState = { ok: boolean; error?: string } | null;

export function ExpenseForm({ householdId }: { householdId: string }) {
  const [state, formAction] = useFormState(createExpense, null as ActionState);
  const formRef = React.useRef<HTMLFormElement>(null);
  React.useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-5">
      <input type="hidden" name="household_id" value={householdId} />
      <ErrorBanner message={state?.ok === false ? state.error : undefined} />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Field label="Source code" hint="Optional shorthand that maps to a category.">
          <select name="source_code" defaultValue="" className={inputCls}>
            <option value="">—</option>
            {SOURCE_CODES.map((c) => (
              <option key={c} value={c}>{SOURCE_CODE_LABELS[c]}</option>
            ))}
          </select>
        </Field>
        <Field label="Category" required>
          <select name="category" required defaultValue="food" className={inputCls}>
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c} value={c}>{EXPENSE_CATEGORY_LABELS[c]}</option>
            ))}
          </select>
        </Field>
        <Field label="Label" hint="Line-item description.">
          <input name="label" maxLength={120} placeholder="e.g. Coles" className={inputCls} />
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
        <Field label="Date">
          <input name="expense_date" type="date" className={inputCls} />
        </Field>
        <Field label="Subcategory">
          <input name="subcategory" maxLength={80} className={inputCls} placeholder="optional" />
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Field label="Member">
          <select name="member" defaultValue="" className={inputCls}>
            <option value="">—</option>
            {FAMILY_MEMBERS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </Field>
        <Field label="Payment method">
          <select name="payment_method" defaultValue="" className={inputCls}>
            <option value="">—</option>
            {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </Field>
        <Field label="Flags">
          <div className="h-11 inline-flex items-center gap-5">
            <label className="inline-flex items-center gap-2">
              <input name="is_debt_service" type="checkbox" className="h-4 w-4 accent-ember-500" />
              <span className="text-body-sm text-ink-secondary">Debt service</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <input name="is_refund" type="checkbox" className="h-4 w-4 accent-ember-500" />
              <span className="text-body-sm text-ink-secondary">Refund (credit)</span>
            </label>
          </div>
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
  return <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Add expense"}</Button>;
}
