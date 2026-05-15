"use client";

import * as React from "react";
import { useFormState, useFormStatus } from "react-dom";
import { ShieldCheck, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/cta-button";
import { Field, FormError, FormSuccess, Helper, Label, Input } from "@/components/auth/Field";
import { mfaEnrollStart, mfaEnrollVerify, mfaUnenroll } from "@/app/auth/actions";

type ActionResult =
  | { ok: true; message?: string }
  | { ok: false; error: string };

interface Factor {
  id: string;
  friendlyName: string;
  status: string;
  createdAt: string;
}

interface AuthEventRow {
  id: string;
  event: string;
  createdAt: string;
  ip: string | null;
  userAgent: string | null;
}

interface Props {
  factors: Factor[];
  autoEnroll: boolean;
  events: AuthEventRow[];
}

export function SecurityClient({ factors, autoEnroll, events }: Props) {
  const verified = factors.find((f) => f.status === "verified");

  return (
    <div className="space-y-6">
      {verified ? (
        <UnenrollPanel factor={verified} />
      ) : (
        <EnrollPanel autoStart={autoEnroll} />
      )}

      <ActivityPanel events={events} />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────── */

function EnrollPanel({ autoStart }: { autoStart: boolean }) {
  const [enrollment, setEnrollment] = React.useState<{
    factorId: string;
    qrCode: string;
    secret: string;
  } | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [starting, setStarting] = React.useState(false);

  const start = React.useCallback(async () => {
    setStarting(true);
    setError(null);
    const result = await mfaEnrollStart();
    setStarting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setEnrollment({
      factorId: result.factorId,
      qrCode: result.qrCode,
      secret: result.secret,
    });
  }, []);

  React.useEffect(() => {
    if (autoStart && !enrollment) start();
  }, [autoStart, enrollment, start]);

  if (!enrollment) {
    return (
      <Panel
        icon={<ShieldAlert className="h-4 w-4 text-ember-500" />}
        eyebrow="Two-factor authentication"
        title="Not enabled"
        body="Protect your account with a 6-digit code from an authenticator app."
      >
        <Button type="button" onClick={start} disabled={starting} variant="primary" size="md">
          {starting ? "Preparing…" : "Set up two-factor"}
        </Button>
        {error && <FormError>{error}</FormError>}
      </Panel>
    );
  }

  return <VerifyEnrollment enrollment={enrollment} />;
}

function VerifyEnrollment({
  enrollment,
}: {
  enrollment: { factorId: string; qrCode: string; secret: string };
}) {
  const [state, formAction] = useFormState<ActionResult | null, FormData>(
    mfaEnrollVerify,
    null
  );

  return (
    <Panel
      icon={<ShieldCheck className="h-4 w-4 text-ember-500" />}
      eyebrow="Set up two-factor"
      title="Scan and verify"
      body="Scan the QR code with your authenticator app, then enter the 6-digit code."
    >
      <div className="grid sm:grid-cols-[auto_1fr] gap-6 items-start">
        <div className="rounded-xl bg-white ring-1 ring-line p-3 self-start">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={enrollment.qrCode}
            alt="MFA QR code"
            className="h-40 w-40 block"
          />
        </div>
        <div className="space-y-3">
          <div className="text-caption text-ink-quaternary">
            Can&rsquo;t scan? Enter this secret manually:
          </div>
          <code className="mono block break-all rounded-md bg-bg-inset px-3 py-2 text-body-sm text-ink-primary">
            {enrollment.secret}
          </code>
        </div>
      </div>

      <form action={formAction} className="mt-5 space-y-4" noValidate>
        <input type="hidden" name="factorId" value={enrollment.factorId} />
        <Field>
          <Label htmlFor="code">6-digit code</Label>
          <Input
            id="code"
            name="code"
            inputMode="numeric"
            pattern="\d{6}"
            maxLength={6}
            required
            placeholder="123456"
            className="tracking-[0.4em] text-center font-mono"
          />
          <Helper>Codes refresh every 30 seconds.</Helper>
        </Field>
        {state && state.ok && <FormSuccess>{state.message}</FormSuccess>}
        {state && !state.ok && <FormError>{state.error}</FormError>}
        <SubmitVerify />
      </form>
    </Panel>
  );
}

function SubmitVerify() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="primary" size="md" disabled={pending}>
      {pending ? "Verifying…" : "Verify and enable"}
    </Button>
  );
}

function UnenrollPanel({ factor }: { factor: Factor }) {
  const [state, formAction] = useFormState<ActionResult | null, FormData>(
    mfaUnenroll,
    null
  );

  return (
    <Panel
      icon={<ShieldCheck className="h-4 w-4 text-positive" />}
      eyebrow="Two-factor authentication"
      title="Enabled"
      body={`Authenticator app added ${new Date(factor.createdAt).toLocaleDateString()}.`}
    >
      <form action={formAction} className="space-y-3">
        <input type="hidden" name="factorId" value={factor.id} />
        <Button type="submit" variant="secondary" size="md">
          Remove two-factor
        </Button>
        {state && state.ok && <FormSuccess>{state.message}</FormSuccess>}
        {state && !state.ok && <FormError>{state.error}</FormError>}
      </form>
    </Panel>
  );
}

function ActivityPanel({ events }: { events: AuthEventRow[] }) {
  return (
    <div className="rounded-2xl bg-white shadow-card ring-1 ring-line p-6 sm:p-7">
      <div className="mono text-eyebrow text-ember-500 mb-3">[02] Recent activity</div>
      <h2 className="text-body font-semibold text-ink-primary">Sign-in and security events</h2>
      <p className="mt-2 text-body-sm text-ink-tertiary">
        The last 10 events on your account.
      </p>
      <div className="mt-5 divide-y divide-line">
        {events.length === 0 && (
          <div className="py-6 text-body-sm text-ink-tertiary">No activity yet.</div>
        )}
        {events.map((e) => (
          <div key={e.id} className="py-3 flex items-start justify-between gap-4">
            <div>
              <div className="text-body-sm text-ink-primary">{formatEvent(e.event)}</div>
              <div className="text-caption text-ink-quaternary mt-0.5">
                {e.ip ?? "ip n/a"} · {shortUA(e.userAgent)}
              </div>
            </div>
            <time className="mono text-caption text-ink-quaternary whitespace-nowrap">
              {new Date(e.createdAt).toLocaleString()}
            </time>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatEvent(event: string) {
  return event.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function shortUA(ua: string | null) {
  if (!ua) return "browser n/a";
  if (/Chrome\//.test(ua)) return "Chrome";
  if (/Firefox\//.test(ua)) return "Firefox";
  if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) return "Safari";
  if (/Edg\//.test(ua)) return "Edge";
  return ua.slice(0, 40);
}

function Panel({
  icon,
  eyebrow,
  title,
  body,
  children,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  body: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white shadow-card ring-1 ring-line p-6 sm:p-7">
      <div className="flex items-center gap-2 mono text-eyebrow text-ember-500 mb-3">
        {icon}
        {eyebrow}
      </div>
      <h2 className="text-body font-semibold text-ink-primary">{title}</h2>
      <p className="mt-2 text-body-sm text-ink-tertiary">{body}</p>
      <div className="mt-5 space-y-3">{children}</div>
    </div>
  );
}
