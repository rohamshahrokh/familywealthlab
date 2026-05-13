import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { RequestForm } from "./request-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Reset password — Family Wealth Lab",
};

export default function ResetPasswordPage() {
  return (
    <AuthShell
      eyebrow="Reset password"
      title="Forgot your password?"
      subtitle="Enter your email and we'll send a reset link if an account exists."
      footer={
        <>
          Remembered it?{" "}
          <Link
            href="/login"
            className="text-ink-primary hover:text-ember-500 underline-offset-4 hover:underline"
          >
            Back to sign in
          </Link>
        </>
      }
    >
      <RequestForm />
    </AuthShell>
  );
}
