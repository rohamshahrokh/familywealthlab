"use client";

import * as React from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createCashAccount } from "./actions";
import { Button } from "@/components/ui/Button";
import { Field, ErrorBanner, inputCls, textareaCls } from "@/components/workspace/forms/Field";

type ActionState = { ok: boolean; error?: string } | null;

export function CashForm({ householdId }: { householdId: string }) {
  const [state, formAction] = useFormState(createCashAccount, null as ActionState);
  const formRef = React.useRef<HTMLFormElement>(null);

  React.useEffect(() => { if (state?.ok) formRef.current?.reset(); }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-5">
      <input type="hidden" name="household_id" value={householdId} />
      <ErrorBanner message={state?.ok === false ? state.error : undefined} />

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Account name" required>
          <input name="name" required maxLength={120} placeholder="e.g. CBA Everyday" className={inputCls} />
        </Field>
        <Field label="Type" required>
          <select name="type" required defaultValue="savings" className={inputCls}>
            <option value="checking">Checking</option>
            <option value="savings">Savings</option>
            <option value="offset">Offset</option>
            <option value="emergency">Emergency fund</option>
            <option value="other">Other</option>
          </select>
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Institution">
          <input name="institution" maxLength={120} placeholder="e.g. CommBank" className={inputCls} />
        </Field>
        <Field label="Balance (AUD)" hint="Leave blank for 0.">
          <input name="balance" type="number" step="0.01" min="0" inputMode="decimal" placeholder="0.00" className={inputCls} />
        </Field>
      </div>

      <input type="hidden" name="currency" value="AUD" />

      <Field label="Notes" hint="Optional — purpose, owner, etc.">
        <textarea name="notes" maxLength={2000} className={textareaCls} />
      </Field>

      <Submit />
    </form>
  );
}

function Submit() {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Add cash account"}</Button>;
}
