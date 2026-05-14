"use client";

import * as React from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createSuperAccount } from "./actions";
import { Button } from "@/components/ui/Button";
import { Field, ErrorBanner, inputCls, textareaCls } from "@/components/workspace/forms/Field";

type ActionState = { ok: boolean; error?: string } | null;

export function SuperForm({ householdId }: { householdId: string }) {
  const [state, formAction] = useFormState(createSuperAccount, null as ActionState);
  const formRef = React.useRef<HTMLFormElement>(null);
  React.useEffect(() => { if (state?.ok) formRef.current?.reset(); }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-5">
      <input type="hidden" name="household_id" value={householdId} />
      <ErrorBanner message={state?.ok === false ? state.error : undefined} />

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Owner label" hint="e.g. partner's first name.">
          <input name="owner_label" maxLength={120} placeholder="e.g. Roham" className={inputCls} />
        </Field>
        <Field label="Provider">
          <input name="provider" maxLength={120} placeholder="e.g. AustralianSuper" className={inputCls} />
        </Field>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Field label="Balance (AUD)">
          <input name="balance" type="number" step="0.01" min="0" inputMode="decimal" placeholder="0.00" className={inputCls} />
        </Field>
        <Field label="Contribution rate" hint="Decimal, e.g. 0.115 = 11.5%.">
          <input name="contribution_rate" type="number" step="0.0001" min="0" max="1" inputMode="decimal" placeholder="0.115" className={inputCls} />
        </Field>
        <Field label="Preservation age" hint="Usually 60.">
          <input name="preservation_age" type="number" step="1" min="0" max="100" inputMode="numeric" placeholder="60" className={inputCls} />
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
  return <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Add super account"}</Button>;
}
