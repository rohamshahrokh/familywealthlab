import * as React from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";

interface AuthShellProps {
  eyebrow?: string;
  title: string;
  subtitle?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  /** Mono index marker displayed before the title (e.g. "[02]") */
  index?: string;
}

/**
 * Auth page shell — matches the commercial landing aesthetic:
 *   - paper bg (#F4F5F7) with subtle ember accent
 *   - brand wordmark (rendered inside <Logo withWordmark>)
 *   - hairline ring container
 *   - pill buttons via the existing <Button> component
 */
export function AuthShell({
  eyebrow,
  title,
  subtitle,
  footer,
  children,
  className,
  index,
}: AuthShellProps) {
  return (
    <main className="min-h-screen bg-bg-base flex flex-col">
      {/* Top brand bar — mirrors Nav.tsx visual, no nav links to keep auth focused */}
      <header className="container mx-auto py-5 flex items-center justify-between">
        <Link
          href="/"
          aria-label="Family Wealth Lab home"
          className="focus-ring rounded-md"
        >
          <Logo withWordmark size={22} />
        </Link>
        <Link
          href="/"
          className="text-[0.8125rem] text-ink-tertiary hover:text-ink-primary transition-colors focus-ring rounded-md px-2 py-1"
        >
          Back to site
        </Link>
      </header>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-5 sm:px-0 pb-16">
        <div className={cn("w-full max-w-md", className)}>
          {eyebrow && (
            <div className="mono text-eyebrow text-ember-500 mb-3">{eyebrow}</div>
          )}
          <h1 className="text-h2 text-ink-primary tracking-tight">
            {index && (
              <span className="mono text-ember-500/80 text-[0.65em] mr-2 align-middle">
                {index}
              </span>
            )}
            {title}
          </h1>
          {subtitle && (
            <p className="mt-3 text-body text-ink-tertiary leading-relaxed">{subtitle}</p>
          )}

          <div className="mt-7 rounded-2xl bg-white shadow-card ring-1 ring-line p-6 sm:p-7">
            {children}
          </div>

          {footer && (
            <div className="mt-5 text-center text-body-sm text-ink-tertiary">{footer}</div>
          )}
        </div>
      </div>

      {/* Footnote */}
      <div className="container mx-auto py-4 border-t border-line">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-caption text-ink-quaternary">
          <span>© {new Date().getFullYear()} Family Wealth Lab</span>
          <span>General information only. Not personal financial advice.</span>
        </div>
      </div>
    </main>
  );
}
