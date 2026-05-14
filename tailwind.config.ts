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
        // Light-first OS palette — refined: paper, porcelain, graphite.
        bg: {
          base: "#F4F5F7",       // page background — slightly cooler than v3
          surface: "#FFFFFF",    // primary cards
          elevated: "#FFFFFF",   // raised cards
          inset: "#EDEEF1",      // recessed wells (slightly cooler)
          soft: "#E8EAEE",       // tinted strips
          deep: "#0B0F1A",       // deep navy — used for dark contrast strips
          deeper: "#070A12",     // deepest navy for hero bottom band
        },
        // Hairlines — black-blue with very low alpha.
        line: {
          DEFAULT: "rgba(20, 28, 46, 0.10)",
          strong: "rgba(20, 28, 46, 0.18)",
          subtle: "rgba(20, 28, 46, 0.06)",
          ondark: "rgba(255, 255, 255, 0.08)",
          ondarkStrong: "rgba(255, 255, 255, 0.14)",
        },
        // Graphite — the new neutral accent. Cooler, more intelligent than steel-blue.
        graphite: {
          50: "#F4F5F7",
          100: "#E8EAEE",
          200: "#CFD3DB",
          300: "#A8AEBC",
          400: "#7A8194",
          500: "#525A6E",
          600: "#3A4255",
          700: "#262D3F",
          800: "#161B2A",
          900: "#0B0F1A",
        },
        // Accent — restrained navy-blue. Used for chart fills, links, hairline highlights.
        accent: {
          50: "#EDF1F7",
          100: "#D7DFEC",
          200: "#A9B8D2",
          300: "#7A8FB5",
          400: "#52688F",
          500: "#34466A",         // primary accent — deeper, more serious than v3
          600: "#283755",
          700: "#1F2B43",
          800: "#161F31",
          900: "#0E1422",
        },
        // EMBER — the single point of warmth. Used sparingly: live signals, primary CTA hover, key deltas.
        ember: {
          50: "#FDF3EC",
          100: "#FBE2D2",
          200: "#F6BF99",
          300: "#F19E63",
          400: "#EC8540",
          500: "#E26F2D",         // primary ember
          600: "#C25920",
          700: "#9D481C",
          800: "#7A381A",
          900: "#5A2A16",
        },
        // Ink — deep neutrals, NOT warm white.
        ink: {
          primary: "#0B0F1A",     // headlines — deeper, more navy than pure black
          secondary: "#1A2030",   // body
          tertiary: "#3A4255",    // strong meta
          quaternary: "#6B7388",  // captions / eyebrows
          quinary: "#9097A8",     // disabled / dividers
          // On-dark variants (for the dark contrast strips)
          ondark: "#F4F5F7",
          ondarkSecondary: "rgba(244, 245, 247, 0.78)",
          ondarkTertiary: "rgba(244, 245, 247, 0.56)",
          ondarkQuaternary: "rgba(244, 245, 247, 0.40)",
        },
        // Semantic.
        positive: "#1E8E5A",
        negative: "#C0392B",
        warning: "#B7791F",
        info: "#34466A",
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
          "var(--font-display)",
          "var(--font-sans)",
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "Inter",
          "sans-serif",
        ],
        mono: [
          "var(--font-mono)",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Consolas",
          "monospace",
        ],
      },
      fontSize: {
        "eyebrow":    ["0.6875rem", { lineHeight: "1",   letterSpacing: "0.18em", fontWeight: "500" }],
        "caption":    ["0.75rem",   { lineHeight: "1.4", letterSpacing: "0.005em" }],
        "body-sm":    ["0.875rem",  { lineHeight: "1.55" }],
        "body":       ["0.9375rem", { lineHeight: "1.6" }],
        "body-lg":    ["1.0625rem", { lineHeight: "1.55" }],
        "lead":       ["1.1875rem", { lineHeight: "1.5", letterSpacing: "-0.005em" }],
        "h6":         ["1.0625rem", { lineHeight: "1.4",  letterSpacing: "-0.01em",  fontWeight: "600" }],
        "h5":         ["1.125rem",  { lineHeight: "1.35", letterSpacing: "-0.012em", fontWeight: "600" }],
        "h4":         ["1.25rem",   { lineHeight: "1.35", letterSpacing: "-0.015em", fontWeight: "600" }],
        "h3":         ["1.625rem",  { lineHeight: "1.25", letterSpacing: "-0.02em", fontWeight: "600" }],
        "h2":         ["clamp(1.875rem, 2.6vw + 0.5rem, 2.75rem)", { lineHeight: "1.1", letterSpacing: "-0.025em", fontWeight: "600" }],
        "display":    ["clamp(2.5rem, 4.2vw + 0.5rem, 4rem)",        { lineHeight: "1.04", letterSpacing: "-0.035em", fontWeight: "600" }],
        "display-lg": ["clamp(3rem, 5.6vw + 0.5rem, 5.25rem)",       { lineHeight: "1.0",  letterSpacing: "-0.042em", fontWeight: "600" }],
        "display-xl": ["clamp(3.5rem, 7.2vw + 0.5rem, 6.5rem)",      { lineHeight: "0.98", letterSpacing: "-0.05em",  fontWeight: "600" }],
      },
      letterSpacing: {
        tightest: "-0.05em",
        tighter: "-0.025em",
        tight: "-0.015em",
        normal: "0",
        wide: "0.02em",
        wider: "0.08em",
        widest: "0.18em",
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
        soft:     "0 1px 1px rgba(11, 15, 26, 0.04), 0 1px 2px rgba(11, 15, 26, 0.05)",
        card:     "0 1px 0 rgba(20, 28, 46, 0.04), 0 1px 3px rgba(11, 15, 26, 0.04), 0 8px 24px -10px rgba(11, 15, 26, 0.08)",
        elevated: "0 1px 0 rgba(255, 255, 255, 0.9) inset, 0 1px 3px rgba(11, 15, 26, 0.04), 0 12px 32px -10px rgba(11, 15, 26, 0.10), 0 24px 56px -20px rgba(11, 15, 26, 0.10)",
        wallet:   "0 1px 0 rgba(255, 255, 255, 1) inset, 0 1px 2px rgba(11, 15, 26, 0.06), 0 20px 48px -16px rgba(11, 15, 26, 0.14), 0 40px 80px -24px rgba(11, 15, 26, 0.12)",
        // NEW — cinematic depth for floating glass cards
        cinematic:"0 1px 0 rgba(255, 255, 255, 0.95) inset, 0 2px 4px rgba(11, 15, 26, 0.04), 0 16px 40px -12px rgba(11, 15, 26, 0.12), 0 32px 64px -20px rgba(11, 15, 26, 0.10), 0 64px 120px -32px rgba(52, 70, 106, 0.10)",
        ring:     "0 0 0 1px rgba(20, 28, 46, 0.10)",
        "accent-ring":"0 0 0 1px rgba(52, 70, 106, 0.28)",
        "ember-glow":"0 0 0 1px rgba(226, 111, 45, 0.22), 0 4px 18px -4px rgba(226, 111, 45, 0.32)",
        inset:    "inset 0 1px 0 rgba(255, 255, 255, 0.8), inset 0 -1px 0 rgba(20, 28, 46, 0.04)",
      },
      backgroundImage: {
        "grid-faint": "radial-gradient(circle at 1px 1px, rgba(20,28,46,0.07) 1px, transparent 0)",
        "grid-line": "linear-gradient(rgba(20,28,46,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(20,28,46,0.06) 1px, transparent 1px)",
        "vignette": "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(52,70,106,0.05), transparent 60%)",
        "surface-gradient": "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(252,252,253,1) 100%)",
        "silver": "linear-gradient(180deg, #FAFAFB 0%, #F2F2F4 100%)",
        // Cinematic mesh — soft, intelligent, ambient
        "mesh-ambient":
          "radial-gradient(at 12% 18%, rgba(52, 70, 106, 0.10) 0px, transparent 42%), radial-gradient(at 82% 8%, rgba(226, 111, 45, 0.06) 0px, transparent 38%), radial-gradient(at 88% 92%, rgba(52, 70, 106, 0.08) 0px, transparent 44%), radial-gradient(at 8% 88%, rgba(122, 129, 148, 0.10) 0px, transparent 42%)",
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
        "pulse-soft": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%":      { opacity: "0.65", transform: "scale(0.92)" },
        },
        "ticker": {
          "0%":   { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "mesh-drift": {
          "0%, 100%": { transform: "translate3d(0, 0, 0) scale(1)" },
          "50%":      { transform: "translate3d(-2%, 1%, 0) scale(1.04)" },
        },
        "scan": {
          "0%":   { transform: "translateY(-100%)", opacity: "0" },
          "10%":  { opacity: "0.5" },
          "90%":  { opacity: "0.5" },
          "100%": { transform: "translateY(100%)", opacity: "0" },
        },
      },
      animation: {
        "fade-up": "fade-up 600ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fade-in 500ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "pulse-soft": "pulse-soft 2.4s cubic-bezier(0.22, 1, 0.36, 1) infinite",
        "ticker": "ticker 60s linear infinite",
        "mesh-drift": "mesh-drift 18s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite",
        "scan": "scan 8s linear infinite",
      },
      transitionTimingFunction: {
        calm: "cubic-bezier(0.22, 1, 0.36, 1)",
        precise: "cubic-bezier(0.4, 0, 0.2, 1)",
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        bloom: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
