"use client";

import * as React from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createProperty } from "./actions";
import { Button } from "@/components/ui/Button";

type ActionState = { ok: boolean; error?: string } | null;
const initial: ActionState = null;

export function PropertyForm({ householdId }: { householdId: string }) {
  const [state, formAction] = useFormState(createProperty, initial);
  const formRef = React.useRef<HTMLFormElement>(null);

  React.useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-5">
      <input type="hidden" name="household_id" value={householdId} />

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Property name" required>
          <input
            name="name"
            required
            maxLength={120}
            placeholder="e.g. 12 Acacia St, Brisbane"
            className={inputCls}
          />
        </Field>
        <Field label="Type" required>
          <select name="type" required defaultValue="investment" className={inputCls}>
            <option value="ppor">PPOR (primary residence)</option>
            <option value="owner_occupied">Owner-occupied (other)</option>
            <option value="investment">Investment</option>
          </select>
        </Field>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Field label="Purchase price (AUD)">
          <input type="number" name="purchase_price" min="0" step="1" placeholder="850000" className={inputCls} />
        </Field>
        <Field label="Current value (AUD)">
          <input type="number" name="current_value" min="0" step="1" placeholder="950000" className={inputCls} />
        </Field>
        <Field label="Settlement date">
          <input type="date" name="settlement_date" className={inputCls} />
        </Field>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Field label="Loan balance (AUD)">
          <input type="number" name="loan_amount" min="0" step="1" placeholder="620000" className={inputCls} />
        </Field>
        <Field label="Interest rate" hint="Decimal — e.g. 0.0625 = 6.25%">
          <input type="number" name="interest_rate" min="0" max="1" step="0.0001" placeholder="0.0625" className={inputCls} />
        </Field>
        <Field label="Loan term (years)">
          <input type="number" name="loan_term_years" min="0" max="40" step="0.5" placeholder="30" className={inputCls} />
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Rental income (monthly)" hint="Investment properties only">
          <input type="number" name="rental_income" min="0" step="1" placeholder="2800" className={inputCls} />
        </Field>
        <Field label="Property expenses (monthly)" hint="Rates, strata, mgmt — excludes loan">
          <input type="number" name="expenses" min="0" step="1" placeholder="650" className={inputCls} />
        </Field>
      </div>

      <Field label="Notes">
        <textarea name="notes" rows={2} maxLength={2000} className={inputCls + " resize-none"} />
      </Field>

      {state?.error && (
        <div className="text-body-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-2xl px-4 py-3">
          {state.error}
        </div>
      )}

      <div className="flex items-center gap-3 pt-1">
        <Submit />
        <span className="text-caption text-ink-quaternary">
          Saved entries are read by the Decision Engine immediately.
        </span>
      </div>
    </form>
  );
}

const inputCls = [
  "w-full rounded-2xl border border-line bg-white px-4 h-11 text-body-sm text-ink-primary",
  "placeholder:text-ink-quinary",
  "focus:outline-none focus:ring-2 focus:ring-ember-500/40 focus:border-ember-500/40",
].join(" ");

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-caption uppercase tracking-wider text-ink-quaternary mb-1.5 inline-flex items-center gap-1.5">
        {label}
        {required && <span className="text-ember-500">*</span>}
      </span>
      {children}
      {hint && <span className="block mt-1 text-caption text-ink-quaternary">{hint}</span>}
    </label>
  );
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="primary" size="md" disabled={pending}>
      {pending ? "Saving…" : "Add to ledger"}
    </Button>
  );
}
