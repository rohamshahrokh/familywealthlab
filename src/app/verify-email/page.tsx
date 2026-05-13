import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { ResendForm } from "./resend-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Verify your email — Family Wealth Lab",
};

interface Props {
  searchParams?: { email?: string };
}

export default function VerifyEmailPage({ searchParams }: Props) {
  const email = searchParams?.email;

  return (
    <AuthShell
      eyebrow="Check your inbox"
      title="Verify your email."
      subtitle={
        email ? (
          <>
            We sent a confirmation link to{" "}
            <span className="text-ink-primary font-medium">{email}</span>. Click
            the link to activate your account.
          </>
        ) : (
          <>We sent you a confirmation link. Click it to activate your account.</>
        )
      }
      footer={
        <>
          Wrong address?{" "}
          <Link
            href="/signup"
            className="text-ink-primary hover:text-ember-500 underline-offset-4 hover:underline"
          >
            Start over
          </Link>
        </>
      }
    >
      <ResendForm defaultEmail={email} />
    </AuthShell>
  );
}
