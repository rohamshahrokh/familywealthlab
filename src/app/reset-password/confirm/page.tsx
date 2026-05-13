import { AuthShell } from "@/components/auth/AuthShell";
import { ConfirmForm } from "./confirm-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Set a new password — Family Wealth Lab",
};

export default function ConfirmResetPage() {
  return (
    <AuthShell
      eyebrow="New password"
      title="Set a new password."
      subtitle="Choose a strong, unique password. You'll be signed back in after."
    >
      <ConfirmForm />
    </AuthShell>
  );
}
