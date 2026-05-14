"use client";

import * as React from "react";
import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Field, FormError, FormSuccess, Label, Input } from "@/components/auth/Field";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { Divider } from "@/components/auth/Divider";
import { signIn } from "@/app/auth/actions";

type ActionResult =
  | { ok: true; message?: string }
  | { ok: false; error: string };

const initialState: ActionResult | null = null;

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="primary" size="lg" className="w-full" disabled={pending}>
      {pending ? "Signing in…" : "Sign in"}
    </Button>
  );
}

interface Props {
  next?: string;
  flash?: string | null;
}

export function LoginForm({ next, flash }: Props) {
  const [state, formAction] = useFormState(signIn, initialState);

  return (
    <div className="space-y-4">
      <GoogleButton redirectTo={next || "/workspace"} label="Continue with Google" />
      <Divider />
      <form action={formAction} className="space-y-4" noValidate>
        <input type="hidden" name="next" value={next || "/workspace"} />
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
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/reset-password"
              className="text-caption text-ink-tertiary hover:text-ember-500 underline-offset-4 hover:underline"
            >
              Forgot?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </Field>

        {flash && <FormSuccess>{flash}</FormSuccess>}
        {state && !state.ok && <FormError>{state.error}</FormError>}

        <Submit />
      </form>
    </div>
  );
}
