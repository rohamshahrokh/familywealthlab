"use client";

import * as React from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/cta-button";
import { Field, FormError, FormSuccess, Helper, Label, Input } from "@/components/auth/Field";
import { resendVerification } from "@/app/auth/actions";

type ActionResult =
  | { ok: true; message?: string }
  | { ok: false; error: string };

const initialState: ActionResult | null = null;

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="secondary" size="lg" className="w-full" disabled={pending}>
      {pending ? "Resending…" : "Resend verification email"}
    </Button>
  );
}

export function ResendForm({ defaultEmail }: { defaultEmail?: string }) {
  const [state, formAction] = useFormState(resendVerification, initialState);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <Field>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={defaultEmail}
          placeholder="you@example.com"
        />
        <Helper>Didn&rsquo;t get it? Check spam or resend below.</Helper>
      </Field>
      {state && state.ok && <FormSuccess>{state.message}</FormSuccess>}
      {state && !state.ok && <FormError>{state.error}</FormError>}
      <Submit />
    </form>
  );
}
