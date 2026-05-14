"use client";

import * as React from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createCrypto } from "./actions";
import { Button } from "@/components/ui/Button";
import { Field, ErrorBanner, inputCls, textareaCls } from "@/components/workspace/forms/Field";

type ActionState = { ok: boolean; error?: string } | null;

export function CryptoForm({ householdId }: { householdId: string }) {
  const [state, formAction] = useFormState(createCrypto, null as ActionState);
  const formRef = React.useRef<HTMLFormElement>(null);
  React.useEffect(() => { if (state?.ok) formRef.current?.reset(); }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-5">
      <input type="hidden" name="household_id" value={householdId} />
      <ErrorBanner message={state?.ok === false ? state.error : undefined} />

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Symbol" required>
          <input name="symbol" required maxLength={20} placeholder="e.g. BTC" className={`${inputCls} uppercase`} />
        </Field>
        <Field label="Currency">
          <input name="currency" defaultValue="AUD" maxLength={3} className={`${inputCls} uppercase`} />
        </Field>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Field label="Units held" required>
          <input name="current_holding" type="number" step="0.00000001" min="0" inputMode="decimal" required placeholder="0" className={inputCls} />
        </Field>
        <Field label="Current price" hint="Per unit.">
          <input name="current_price" type="number" step="0.0001" min="0" inputMode="decimal" placeholder="0.00" className={inputCls} />
        </Field>
        <Field label="Average cost" hint="Per unit, for CGT.">
          <input name="average_cost" type="number" step="0.0001" min="0" inputMode="decimal" placeholder="0.00" className={inputCls} />
        </Field>
      </div>

      <Field label="Notes" hint="Optional — wallet, exchange, staking, etc.">
        <textarea name="notes" maxLength={2000} className={textareaCls} />
      </Field>

      <Submit />
    </form>
  );
}

function Submit() {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Add holding"}</Button>;
}
