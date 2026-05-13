import * as React from "react";
import { cn } from "@/lib/utils";

/* Wrapper for a label + input pair */
export function Field({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("space-y-0", className)}>{children}</div>;
}

/* Mono uppercase label — mirrors the landing's eyebrow style */
export function Label({
  htmlFor,
  children,
  className,
}: {
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        "mono block text-eyebrow uppercase text-ink-quaternary",
        className
      )}
    >
      {children}
    </label>
  );
}

/* Text input — hairline border, ember focus ring (matches Button focus) */
export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        "mt-2 w-full h-11 rounded-full bg-white text-ink-primary",
        "px-4 text-body border border-line",
        "placeholder:text-ink-quinary",
        "focus:outline-none focus:border-line-strong",
        "focus-visible:ring-2 focus-visible:ring-ember-500/35 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
        "transition-[border-color,box-shadow] duration-200",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        className
      )}
      {...props}
    />
  );
});

/* Inline form error — muted red, hairline */
export function FormError({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return (
    <div className="mt-3 rounded-md bg-[rgba(192,57,43,0.06)] ring-1 ring-[rgba(192,57,43,0.18)] px-3 py-2 text-body-sm text-negative">
      {children}
    </div>
  );
}

/* Inline form success */
export function FormSuccess({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return (
    <div className="mt-3 rounded-md bg-[rgba(30,142,90,0.06)] ring-1 ring-[rgba(30,142,90,0.18)] px-3 py-2 text-body-sm text-positive">
      {children}
    </div>
  );
}

export function FieldError({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return <p className="mt-1.5 text-caption text-negative">{children}</p>;
}

/* Helper text below an input */
export function Helper({ children }: { children: React.ReactNode }) {
  return <p className="mt-1.5 text-caption text-ink-quaternary">{children}</p>;
}
