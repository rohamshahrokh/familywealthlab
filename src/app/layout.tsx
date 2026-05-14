import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
// SmoothScrollProvider is intentionally NOT mounted globally. Lenis is heavy
// (RAF loop + wheel-event interception) and made the authenticated app feel
// sluggish vs. the original personal version. It is now opt-in per page via
// `<SmoothScrollProvider>` on the marketing landing only.

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://familywealthlab.com"),
  title: {
    default: "Family Wealth Lab — The wealth operating system",
    template: "%s · Family Wealth Lab",
  },
  description:
    "Forecast outcomes, model decisions, and act on intelligent signals — the wealth operating system for serious Australian households.",
  keywords: [
    "family wealth",
    "financial planning",
    "FIRE Australia",
    "property investment",
    "AI financial planning",
    "Monte Carlo retirement",
    "household finance",
  ],
  authors: [{ name: "Family Wealth Lab" }],
  openGraph: {
    title: "Family Wealth Lab — The wealth operating system",
    description:
      "AI-powered forecasting, property strategy, FIRE planning, and decision intelligence for Australian families.",
    type: "website",
    locale: "en_AU",
  },
  twitter: {
    card: "summary_large_image",
    title: "Family Wealth Lab",
    description: "The operating system for family wealth.",
  },
  robots: { index: true, follow: true },
  // Brand icons. Next 14 auto-emits /icon.svg from src/app/icon.svg (favicon),
  // and serves /manifest.webmanifest from src/app/manifest.ts. The apple-touch
  // icon must be linked explicitly because Next's apple-icon route convention
  // only auto-picks up .png/.jpg/.webp (not .svg) in this version.
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-touch-icon.svg", type: "image/svg+xml", sizes: "192x192" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#F4F5F7",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU" className={`${inter.variable} ${jetbrains.variable}`}>
      <body className="bg-bg-base text-ink-secondary font-sans">
        {children}
      </body>
    </html>
  );
}
