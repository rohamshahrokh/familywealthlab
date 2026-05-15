"use client";

import * as React from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/cta-button";
import { Field, FormError, Helper, Label, Input } from "@/components/auth/Field";
import { mfaChallengeVerify } from "@/app/auth/actions";

type ActionResult =
  | { ok: true; message?: string }
  | { ok: false; error: string };

const initialState: ActionResult | null = null;

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="primary" size="lg" className="w-full" disabled={pending}>
      {pending ? "Verifying…" : "Verify and continue"}
    </Button>
  );
}

export function MfaChallengeForm({ factorId, next }: { factorId: string; next: string }) {
  const [state, formAction] = useFormState(mfaChallengeVerify, initialState);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <input type="hidden" name="factorId" value={factorId} />
      <input type="hidden" name="next" value={next} />
      <Field>
        <Label htmlFor="code">Authentication code</Label>
        <Input
          id="code"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="\d{6}"
          maxLength={6}
          required
          placeholder="123456"
          className="tracking-[0.4em] text-center font-mono"
        />
        <Helper>Open your authenticator app and enter the current 6-digit code.</Helper>
      </Field>
      {state && !state.ok && <FormError>{state.error}</FormError>}
      <Submit />
    </form>
  );
}
