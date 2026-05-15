"use client";

import * as React from "react";
import { Button } from "@/components/ui/cta-button";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

interface Props {
  /** Where to land after Google completes the OAuth round-trip */
  redirectTo?: string;
  label?: string;
  disabled?: boolean;
}

/** Google OAuth button — uses the existing <Button variant="secondary"> shell */
export function GoogleButton({
  redirectTo,
  label = "Continue with Google",
  disabled,
}: Props) {
  const [pending, setPending] = React.useState(false);

  async function onClick() {
    setPending(true);
    const supabase = createSupabaseBrowserClient();
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (typeof window !== "undefined" ? window.location.origin : "");
    const callback = `${siteUrl}/auth/callback${
      redirectTo ? `?next=${encodeURIComponent(redirectTo)}` : ""
    }`;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callback },
    });
    // Browser navigates away to Google — no further work here.
  }

  return (
    <Button
      type="button"
      variant="secondary"
      size="lg"
      className="w-full"
      onClick={onClick}
      disabled={pending || disabled}
      aria-label={label}
    >
      <GoogleGlyph />
      <span>{pending ? "Redirecting…" : label}</span>
    </Button>
  );
}

function GoogleGlyph() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 18 18" aria-hidden>
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.17-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.92v2.32A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72A5.4 5.4 0 0 1 3.7 9c0-.6.1-1.18.27-1.72V4.96H.92A9 9 0 0 0 0 9c0 1.45.35 2.83.92 4.04l3.05-2.32Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.51.46 3.44 1.34l2.58-2.58A9 9 0 0 0 .92 4.96l3.05 2.32C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  );
}
