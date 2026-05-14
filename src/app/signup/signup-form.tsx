"use client";

import * as React from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Field, Helper, FormError, Label, Input } from "@/components/auth/Field";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { Divider } from "@/components/auth/Divider";
import { signUp } from "@/app/auth/actions";

type ActionResult =
  | { ok: true; message?: string }
  | { ok: false; error: string };

const initialState: ActionResult | null = null;

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="primary" size="lg" className="w-full" disabled={pending}>
      {pending ? "Creating account…" : "Create account"}
    </Button>
  );
}

export function SignupForm() {
  const [state, formAction] = useFormState(signUp, initialState);

  return (
    <div className="space-y-4">
      <GoogleButton redirectTo="/workspace" label="Continue with Google" />
      <Divider />
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
        <Field>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            placeholder="At least 8 characters"
          />
          <Helper>Use a strong, unique password. 8+ characters.</Helper>
        </Field>

        {state && !state.ok && <FormError>{state.error}</FormError>}

        <Submit />
      </form>

      <p className="text-caption text-ink-quaternary text-center pt-2">
        By creating an account you agree to our terms and privacy policy.
      </p>
    </div>
  );
}
