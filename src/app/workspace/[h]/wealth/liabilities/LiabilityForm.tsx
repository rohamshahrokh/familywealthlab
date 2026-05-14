"use client";

import * as React from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createLiability } from "./actions";
import { Button } from "@/components/ui/Button";
import { Field, ErrorBanner, inputCls, textareaCls } from "@/components/workspace/forms/Field";

type ActionState = { ok: boolean; error?: string } | null;

export function LiabilityForm({ householdId }: { householdId: string }) {
  const [state, formAction] = useFormState(createLiability, null as ActionState);
  const formRef = React.useRef<HTMLFormElement>(null);
  React.useEffect(() => { if (state?.ok) formRef.current?.reset(); }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-5">
      <input type="hidden" name="household_id" value={householdId} />
      <ErrorBanner message={state?.ok === false ? state.error : undefined} />

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Liability name" required>
          <input name="name" required maxLength={120} placeholder="e.g. Amex Platinum" className={inputCls} />
        </Field>
        <Field label="Type" required>
          <select name="type" required defaultValue="credit_card" className={inputCls}>
            <option value="credit_card">Credit card</option>
            <option value="personal_loan">Personal loan</option>
            <option value="heloc">HELOC</option>
            <option value="student_loan">Student loan</option>
            <option value="other">Other</option>
          </select>
        </Field>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Field label="Balance (AUD)">
          <input name="balance" type="number" step="0.01" min="0" inputMode="decimal" placeholder="0.00" className={inputCls} />
        </Field>
        <Field label="Interest rate" hint="Decimal, e.g. 0.1999 = 19.99%.">
          <input name="interest_rate" type="number" step="0.0001" min="0" max="1" inputMode="decimal" placeholder="0.0000" className={inputCls} />
        </Field>
        <Field label="Min monthly payment">
          <input name="min_payment" type="number" step="0.01" min="0" inputMode="decimal" placeholder="0.00" className={inputCls} />
        </Field>
      </div>

      <Field label="Notes">
        <textarea name="notes" maxLength={2000} className={textareaCls} />
      </Field>

      <Submit />
    </form>
  );
}

function Submit() {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Add liability"}</Button>;
}
