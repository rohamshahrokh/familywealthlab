import { Logo } from "@/components/brand/Logo";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Engine", href: "#command-center" },
      { label: "What-If", href: "#what-if" },
      { label: "AI Insights", href: "#ai-insights" },
      { label: "Mobile", href: "#mobile" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Methodology", href: "#" },
      { label: "Security", href: "#trust" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
      { label: "Disclosure", href: "#" },
      { label: "Cookies", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative hairline-top bg-bg-base pb-16 pt-20">
      <div className="container-narrow">
        <div className="grid gap-14 lg:grid-cols-[1.4fr_3fr]">
          <div>
            <Logo />
            <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-ink-300">
              The operating system for family wealth. AI-powered forecasting,
              property strategy, FIRE planning, and decision intelligence —
              engineered for Australian families.
            </p>
            <p className="mt-6 text-xs text-ink-400">
              Modelling only — not personal tax or financial advice.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <div className="text-eyebrow text-ink-300">{col.title}</div>
                <ul className="mt-5 space-y-3">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        className="text-[14px] text-ink-200 transition-colors duration-200 hover:text-ink-50"
                      >
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-white/[0.06] pt-8 text-xs text-ink-400 sm:flex-row sm:items-center">
          <div>© {new Date().getFullYear()} Family Wealth Lab. Brisbane, Australia.</div>
          <div className="flex items-center gap-4">
            <span>Private</span>
            <span className="h-1 w-1 rounded-full bg-ink-500" />
            <span>Encrypted</span>
            <span className="h-1 w-1 rounded-full bg-ink-500" />
            <span>Australian-focused</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
