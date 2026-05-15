"use client";

import * as React from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/cta-button";
import { Field, FormError, Helper, Label, Input } from "@/components/auth/Field";
import { confirmPasswordReset } from "@/app/auth/actions";

type ActionResult =
  | { ok: true; message?: string }
  | { ok: false; error: string };

const initialState: ActionResult | null = null;

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="primary" size="lg" className="w-full" disabled={pending}>
      {pending ? "Updating…" : "Update password"}
    </Button>
  );
}

export function ConfirmForm() {
  const [state, formAction] = useFormState(confirmPasswordReset, initialState);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <Field>
        <Label htmlFor="password">New password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
        <Helper>At least 8 characters.</Helper>
      </Field>
      <Field>
        <Label htmlFor="confirm">Confirm new password</Label>
        <Input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </Field>
      {state && !state.ok && <FormError>{state.error}</FormError>}
      <Submit />
    </form>
  );
}
