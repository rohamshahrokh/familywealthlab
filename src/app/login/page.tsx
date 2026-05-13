import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sign in — Family Wealth Lab",
  description:
    "Sign in to Family Wealth Lab — the wealth operating system for serious households.",
};

interface Props {
  searchParams?: { next?: string; reset?: string; error?: string };
}

export default function LoginPage({ searchParams }: Props) {
  const reset = searchParams?.reset === "1";
  const error = searchParams?.error;

  return (
    <AuthShell
      eyebrow="Sign in"
      title="Welcome back."
      subtitle={
        <>
          Continue to your household workspace. We&rsquo;ll prompt for
          two-factor authentication if it&rsquo;s enabled.
        </>
      }
      footer={
        <>
          New to Family Wealth Lab?{" "}
          <Link
            href="/signup"
            className="text-ink-primary hover:text-ember-500 underline-offset-4 hover:underline"
          >
            Request access
          </Link>
        </>
      }
    >
      <LoginForm
        next={searchParams?.next}
        flash={
          reset
            ? "Password updated — sign in with your new password."
            : error === "oauth_failed"
            ? "Sign-in with Google failed. Please try again."
            : null
        }
      />
    </AuthShell>
  );
}
