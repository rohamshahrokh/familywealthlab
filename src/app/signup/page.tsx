import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignupForm } from "./signup-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Request access — Family Wealth Lab",
  description:
    "Create your Family Wealth Lab account and join the closed beta for the wealth operating system built for serious households.",
};

export default function SignupPage() {
  return (
    <AuthShell
      eyebrow="Request access"
      title="Create your workspace."
      subtitle={
        <>
          The wealth operating system for serious households. Verify your email
          and we&rsquo;ll set up your household workspace.
        </>
      }
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-ink-primary hover:text-ember-500 underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      <SignupForm />
    </AuthShell>
  );
}
