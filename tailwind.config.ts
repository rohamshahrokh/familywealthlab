import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1.25rem", sm: "1.75rem", lg: "2.5rem", xl: "3rem" },
      screens: { "2xl": "1280px" },
    },
    extend: {
      colors: {
        // Light-first OS palette — Apple, matte, silver.
        bg: {
          base: "#F5F5F7",       // page background (Apple system gray)
          surface: "#FFFFFF",    // primary cards
          elevated: "#FFFFFF",   // raised cards (same — depth from shadow, not color)
          inset: "#ECECEC",      // recessed wells / quiet zones
          soft: "#EAEAEA",       // tinted strips
        },
        // Hairlines — black with very low alpha so they read as 1px silver lines.
        line: {
          DEFAULT: "rgba(60, 60, 67, 0.10)",   // ~ Apple separator
          strong: "rgba(60, 60, 67, 0.18)",
          subtle: "rgba(60, 60, 67, 0.06)",
        },
        // Steel-blue accent — restrained, software-precise (between Apple blue & macOS Big Sur slate).
        accent: {
          50: "#F0F4F9",
          100: "#DCE5EE",
          200: "#B9CADC",
          300: "#8FAAC8",
          400: "#5F84AC",
          500: "#3E6A95",        // primary accent
          600: "#2F5278",
          700: "#264563",
          800: "#1F394F",
          900: "#172B3C",
        },
        // Ink — deep neutrals, NOT warm white. Designed for white backgrounds.
        ink: {
          primary: "#111111",    // headlines
          secondary: "#1C1C1E",  // body
          tertiary: "#3A3A3C",   // strong meta
          quaternary: "#6E6E73", // captions / eyebrows
          quinary: "#8E8E93",    // disabled / dividers
        },
        // Semantic — muted, restrained (Apple Wallet style).
        positive: "#1E8E5A",
        negative: "#C0392B",
        warning: "#B7791F",
        info: "#3E6A95",
      },
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Text",
          "SF Pro Display",
          "ui-sans-serif",
          "system-ui",
          "Inter",
          "sans-serif",
        ],
        display: [
          "var(--font-sans)",
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "Inter",
          "sans-serif",
        ],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      fontSize: {
        // Editorial / Apple-grade scale. Bigger display, tighter tracking at large sizes.
        "eyebrow": ["0.6875rem", { lineHeight: "1", letterSpacing: "0.16em", fontWeight: "500" }],
        "caption": ["0.75rem", { lineHeight: "1.4", letterSpacing: "0.005em" }],
        "body-sm": ["0.875rem", { lineHeight: "1.55" }],
        "body": ["0.9375rem", { lineHeight: "1.6" }],
        "body-lg": ["1.0625rem", { lineHeight: "1.55" }],
        "lead": ["1.1875rem", { lineHeight: "1.5", letterSpacing: "-0.005em" }],
        "h4": ["1.25rem", { lineHeight: "1.35", letterSpacing: "-0.015em", fontWeight: "600" }],
        "h3": ["1.625rem", { lineHeight: "1.25", letterSpacing: "-0.02em", fontWeight: "600" }],
        "h2": ["clamp(1.875rem, 2.6vw + 0.5rem, 2.75rem)", { lineHeight: "1.1", letterSpacing: "-0.025em", fontWeight: "600" }],
        "display": ["clamp(2.5rem, 4.2vw + 0.5rem, 4rem)", { lineHeight: "1.04", letterSpacing: "-0.035em", fontWeight: "600" }],
        "display-lg": ["clamp(3rem, 5.8vw + 0.5rem, 5.5rem)", { lineHeight: "1.0", letterSpacing: "-0.04em", fontWeight: "600" }],
      },
      letterSpacing: {
        tightest: "-0.04em",
        tighter: "-0.025em",
        tight: "-0.015em",
        normal: "0",
        wide: "0.02em",
        wider: "0.08em",
        widest: "0.16em",
      },
      borderRadius: {
        xs: "6px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "20px",
        "2xl": "24px",
        "3xl": "32px",
      },
      boxShadow: {
        // Apple-grade layered shadows. Soft, almost printerly.
        soft: "0 1px 1px rgba(16, 24, 40, 0.04), 0 1px 2px rgba(16, 24, 40, 0.05)",
        card: "0 1px 0 rgba(60, 60, 67, 0.04), 0 1px 3px rgba(16, 24, 40, 0.04), 0 8px 24px -10px rgba(16, 24, 40, 0.08)",
        elevated: "0 1px 0 rgba(255, 255, 255, 0.9) inset, 0 1px 3px rgba(16, 24, 40, 0.04), 0 12px 32px -10px rgba(16, 24, 40, 0.10), 0 24px 56px -20px rgba(16, 24, 40, 0.10)",
        wallet: "0 1px 0 rgba(255, 255, 255, 1) inset, 0 1px 2px rgba(16, 24, 40, 0.06), 0 20px 48px -16px rgba(16, 24, 40, 0.14), 0 40px 80px -24px rgba(16, 24, 40, 0.12)",
        ring: "0 0 0 1px rgba(60, 60, 67, 0.10)",
        "accent-ring": "0 0 0 1px rgba(62, 106, 149, 0.30)",
        inset: "inset 0 1px 0 rgba(255, 255, 255, 0.8), inset 0 -1px 0 rgba(60, 60, 67, 0.04)",
      },
      backgroundImage: {
        // Faint silver dot pattern instead of grid.
        "grid-faint":
          "radial-gradient(circle at 1px 1px, rgba(60,60,67,0.07) 1px, transparent 0)",
        // Soft top spotlight — very faint.
        "vignette":
          "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(62,106,149,0.04), transparent 60%)",
        // Card surface gradient — top-light, like brushed silver.
        "surface-gradient":
          "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(252,252,253,1) 100%)",
        // Brushed silver for the page background variant.
        "silver":
          "linear-gradient(180deg, #FAFAFB 0%, #F2F2F4 100%)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fade-up 600ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fade-in 500ms cubic-bezier(0.22, 1, 0.36, 1) both",
      },
      transitionTimingFunction: {
        calm: "cubic-bezier(0.22, 1, 0.36, 1)",
        precise: "cubic-bezier(0.4, 0, 0.2, 1)",
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
