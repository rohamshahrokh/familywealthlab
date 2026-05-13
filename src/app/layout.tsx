import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://familywealthlab.com"),
  title: {
    default: "Family Wealth Lab — Engineer Your Family's Financial Future",
    template: "%s · Family Wealth Lab",
  },
  description:
    "An AI-powered family financial operating system. Forecasting, FIRE planning, property strategy, debt optimization, and decision intelligence for Australian families.",
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
    title: "Family Wealth Lab — Engineer Your Family's Financial Future",
    description:
      "AI-powered forecasting, property strategy, FIRE planning, and financial intelligence for Australian families.",
    type: "website",
    locale: "en_AU",
  },
  twitter: {
    card: "summary_large_image",
    title: "Family Wealth Lab",
    description: "The operating system for family wealth.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#070B14",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-AU" className={`${inter.variable} dark`}>
      <body className="bg-bg-base text-ink-100 font-sans">
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}
