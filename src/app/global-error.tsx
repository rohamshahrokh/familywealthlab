"use client";

// Root error boundary — fires when the root layout itself crashes.
// Required by Next.js App Router to keep us off the dreaded white screen.

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body
        style={{
          margin: 0,
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          background: "#0b0d10",
          color: "#e6e8eb",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <div
          style={{
            maxWidth: 480,
            border: "1px solid #2a2f36",
            borderRadius: 8,
            padding: 24,
            background: "#13161b",
          }}
        >
          <h1 style={{ margin: "0 0 12px", fontSize: 18 }}>App crashed</h1>
          <p style={{ margin: "0 0 16px", color: "#aab0b8", fontSize: 13 }}>
            A fatal error occurred while loading Family Wealth Lab. Reload to
            try again.
          </p>
          {error?.message ? (
            <pre
              style={{
                background: "#0b0d10",
                border: "1px solid #2a2f36",
                padding: 8,
                fontSize: 11,
                overflow: "auto",
                maxHeight: 160,
                color: "#9aa0a6",
              }}
            >
              {error.message}
            </pre>
          ) : null}
          <button
            type="button"
            onClick={() => reset()}
            style={{
              marginTop: 12,
              background: "#1f2329",
              border: "1px solid #2a2f36",
              color: "#e6e8eb",
              padding: "6px 12px",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 12,
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
