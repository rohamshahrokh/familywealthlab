"use client";

import * as React from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/cta-button";
import { Field, FormError, FormSuccess, Label, Input } from "@/components/auth/Field";
import { requestPasswordReset } from "@/app/auth/actions";

type ActionResult =
  | { ok: true; message?: string }
  | { ok: false; error: string };

const initialState: ActionResult | null = null;

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="primary" size="lg" className="w-full" disabled={pending}>
      {pending ? "Sending…" : "Send reset link"}
    </Button>
  );
}

export function RequestForm() {
  const [state, formAction] = useFormState(requestPasswordReset, initialState);

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
          placeholder="you@example.com"
        />
      </Field>
      {state && state.ok && <FormSuccess>{state.message}</FormSuccess>}
      {state && !state.ok && <FormError>{state.error}</FormError>}
      <Submit />
    </form>
  );
}
