import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx,js,jsx,mdx}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1.25rem",
        sm: "1.5rem",
        lg: "2rem",
        xl: "3rem",
        "2xl": "4rem",
      },
      screens: {
        "2xl": "1320px",
      },
    },
    extend: {
      colors: {
        bg: {
          base: "#070B14",
          surface: "#0F1728",
          elevated: "#172033",
        },
        accent: {
          DEFAULT: "#FF6B00",
          50: "#FFF1E5",
          100: "#FFE0C2",
          200: "#FFC085",
          300: "#FFA047",
          400: "#FF8014",
          500: "#FF6B00",
          600: "#CC5500",
          700: "#993F00",
        },
        gold: {
          DEFAULT: "#FFC857",
          50: "#FFF8E5",
          100: "#FFEFBF",
          200: "#FFE08A",
          300: "#FFD46E",
          400: "#FFC857",
          500: "#E6A93D",
        },
        ink: {
          0: "#FFFFFF",
          50: "rgba(255,255,255,0.96)",
          100: "rgba(255,255,255,0.84)",
          200: "rgba(255,255,255,0.72)",
          300: "rgba(255,255,255,0.56)",
          400: "rgba(255,255,255,0.40)",
          500: "rgba(255,255,255,0.28)",
          600: "rgba(255,255,255,0.16)",
          700: "rgba(255,255,255,0.08)",
          800: "rgba(255,255,255,0.04)",
        },
        positive: "#3ED598",
        negative: "#FF5470",
        info: "#5AC8FA",
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        display: [
          "var(--font-inter)",
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "sans-serif",
        ],
        mono: [
          "var(--font-mono)",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "monospace",
        ],
      },
      fontSize: {
        "display-xl": ["clamp(3rem, 7vw, 6rem)", { lineHeight: "1.02", letterSpacing: "-0.04em", fontWeight: "600" }],
        "display-lg": ["clamp(2.5rem, 5.5vw, 4.5rem)", { lineHeight: "1.04", letterSpacing: "-0.035em", fontWeight: "600" }],
        "display-md": ["clamp(2rem, 4vw, 3.25rem)", { lineHeight: "1.08", letterSpacing: "-0.03em", fontWeight: "600" }],
        eyebrow: ["0.75rem", { lineHeight: "1.2", letterSpacing: "0.18em", fontWeight: "500" }],
      },
      borderRadius: {
        xs: "4px",
        sm: "6px",
        md: "10px",
        lg: "14px",
        xl: "20px",
        "2xl": "28px",
        "3xl": "36px",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(255,255,255,0.05), 0 10px 40px -10px rgba(255,107,0,0.25)",
        elevated: "0 20px 60px -20px rgba(0,0,0,0.6), 0 1px 0 0 rgba(255,255,255,0.04) inset",
        soft: "0 8px 24px -12px rgba(0,0,0,0.4)",
      },
      backgroundImage: {
        "radial-fade": "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,107,0,0.12) 0%, transparent 60%)",
        "noise": "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.35'/%3E%3C/svg%3E\")",
        "grid": "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.9" },
        },
        "shimmer": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.8s cubic-bezier(0.22, 1, 0.36, 1) both",
        "float-slow": "float-slow 6s ease-in-out infinite",
        "pulse-soft": "pulse-soft 3s ease-in-out infinite",
        "shimmer": "shimmer 2.5s ease-in-out infinite",
      },
      transitionTimingFunction: {
        cinematic: "cubic-bezier(0.22, 1, 0.36, 1)",
        decisive: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
