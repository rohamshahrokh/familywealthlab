"use client";

// Top-level error boundary. Next.js renders this whenever a route segment
// throws a runtime exception during render. Provides a non-white-screen
// fallback so the user always sees something actionable.

import { useEffect } from "react";

export default function GlobalRouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      // eslint-disable-next-line no-console
      console.error("[route-error]", error);
    }
  }, [error]);

  return (
    <div className="flex min-h-[50vh] w-full items-center justify-center px-6 py-10">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 text-sm">
        <h2 className="mb-2 text-base font-semibold">Something went wrong</h2>
        <p className="mb-4 text-muted-foreground">
          We couldn&apos;t render this page. Try again, or head back to the
          dashboard.
        </p>
        {error?.message ? (
          <pre className="mb-4 max-h-40 overflow-auto rounded bg-muted p-2 text-[11px] leading-snug text-muted-foreground">
            {error.message}
          </pre>
        ) : null}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded border border-border bg-background px-3 py-1.5 text-xs hover:bg-muted"
          >
            Try again
          </button>
          <a
            href="/app/snapshot"
            className="rounded border border-border bg-background px-3 py-1.5 text-xs hover:bg-muted"
          >
            Go to dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
