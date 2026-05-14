import * as React from "react";

/**
 * Shared form primitives for ledger forms. Visual style intentionally matches
 * PropertyForm so every ledger surface feels identical.
 */

export const inputCls =
  "w-full h-11 rounded-xl border border-line bg-bg-base px-3.5 text-body-sm text-ink-primary " +
  "placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-ember-500/40 " +
  "focus:border-ember-500 transition-colors disabled:opacity-50";

export const textareaCls =
  "w-full rounded-xl border border-line bg-bg-base px-3.5 py-2.5 text-body-sm text-ink-primary " +
  "placeholder:text-ink-quaternary focus:outline-none focus:ring-2 focus:ring-ember-500/40 " +
  "focus:border-ember-500 transition-colors min-h-[5rem] resize-y";

export function Field({
  label, required, hint, children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-caption text-ink-secondary font-medium">
        {label}
        {required && <span className="text-ember-500 ml-0.5">*</span>}
      </span>
      {children}
      {hint && <span className="block text-caption text-ink-quaternary">{hint}</span>}
    </label>
  );
}

export function ErrorBanner({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-body-sm text-rose-800"
    >
      {message}
    </div>
  );
}

export function SuccessBanner({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div
      role="status"
      className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-body-sm text-emerald-800"
    >
      {message}
    </div>
  );
}
