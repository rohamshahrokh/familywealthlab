"use client";

import * as React from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Field, FormError, Helper, Label, Input } from "@/components/auth/Field";
import { completeOnboarding } from "@/app/auth/actions";

type ActionResult =
  | { ok: true; message?: string }
  | { ok: false; error: string };

const initialState: ActionResult | null = null;

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="primary" size="lg" className="w-full" disabled={pending}>
      {pending ? "Finishing…" : "Enter the workspace"}
    </Button>
  );
}

interface Props {
  defaultDisplayName: string;
  defaultHouseholdName: string;
}

export function OnboardingForm({ defaultDisplayName, defaultHouseholdName }: Props) {
  const [state, formAction] = useFormState(completeOnboarding, initialState);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <Field>
        <Label htmlFor="displayName">Your name</Label>
        <Input
          id="displayName"
          name="displayName"
          type="text"
          autoComplete="name"
          required
          maxLength={80}
          defaultValue={defaultDisplayName}
          placeholder="Alex Morgan"
        />
        <Helper>Shown on shared decisions and audit entries.</Helper>
      </Field>
      <Field>
        <Label htmlFor="householdName">Household name</Label>
        <Input
          id="householdName"
          name="householdName"
          type="text"
          required
          maxLength={80}
          defaultValue={defaultHouseholdName}
          placeholder="The Morgan Household"
        />
        <Helper>A friendly label for the workspace. You can rename it later.</Helper>
      </Field>
      {state && !state.ok && <FormError>{state.error}</FormError>}
      <Submit />
    </form>
  );
}
