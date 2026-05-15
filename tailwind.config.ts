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
        // Design-polish-v1 — Apple-grade family-office. Calmer, warmer paper.
        // Surfaces are deliberately closer in value so the page feels stable,
        // not stripey. Cards sit a notch above the page, not screaming above it.
        bg: {
          base: "#F5F6F8",       // page — slightly warmer than v3 to feel less clinical
          surface: "#FFFFFF",    // primary cards
          elevated: "#FFFFFF",   // raised cards
          inset: "#EFF0F3",      // recessed wells — closer to base for less contrast noise
          soft: "#EAECEF",       // tinted strips
          deep: "#0B0F1A",       // deep navy — dark contrast strips
          deeper: "#070A12",     // deepest navy — hero bottom band
        },
        // Hairlines — slightly softer than v3 so card edges whisper, not shout.
        line: {
          DEFAULT: "rgba(20, 28, 46, 0.08)",
          strong: "rgba(20, 28, 46, 0.14)",
          subtle: "rgba(20, 28, 46, 0.04)",
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
        // BRAND AMBER — the gold accent in the Family Wealth Lab logo mark.
        // Distinct from ember (UI accent) so the brand wordmark/logo keeps its
        // true gold tone in every context.
        brand: {
          amber:      "#F5A623",  // canonical brand gold (on dark)
          "amber-dk": "#C5841A",  // deepened gold for light backgrounds (WCAG AA)
          ink:        "#0B0F1A",  // logo structural lines on light bg
          paper:      "#FFFFFF",  // logo structural lines on dark bg
        },
        // EMBER — the single point of warmth. Slightly desaturated for a calmer,
        // more premium-banking feel (less crypto-orange, more autumn-bronze).
        ember: {
          50: "#FBF2EA",
          100: "#F6E2D0",
          200: "#EFC299",
          300: "#E6A165",
          400: "#DA8642",
          500: "#C97030",         // primary ember — desaturated from E26F2D
          600: "#A85A24",
          700: "#88491F",
          800: "#6A391B",
          900: "#4F2B17",
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

        // APP_SHELL_UI_UX_FIX_PASS_01 — Issue 5 & 6
        // Semantic tokens consumed by the migrated /app/* dashboard.
        // Source variables live in src/app/globals.css under :root and .dark
        // so the light/dark toggle in AppTopBar actually changes surfaces.
        background:  "hsl(var(--background) / <alpha-value>)",
        foreground:  "hsl(var(--foreground) / <alpha-value>)",
        card: {
          DEFAULT:    "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT:    "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
        },
        primary: {
          DEFAULT:    "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
        },
        border:      "hsl(var(--border) / <alpha-value>)",
        input:       "hsl(var(--input) / <alpha-value>)",
        ring:        "hsl(var(--ring) / <alpha-value>)",
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
        // Brand serif — ONLY for the Family Wealth Lab wordmark in <Logo>.
        // Do NOT use elsewhere in the UI; the product stays sans-serif.
        serif: [
          "var(--font-serif)",
          "ui-serif",
          "Iowan Old Style",
          "Apple Garamond",
          "Palatino Linotype",
          "Palatino",
          "Times New Roman",
          "Georgia",
          "serif",
        ],
      },
      fontSize: {
        // Type scale — calmer hierarchy. Heading weights dropped from 600 to 580–600,
        // line-heights opened slightly so app surfaces feel more breathable.
        // Eyebrow tracking eased from 0.18em → 0.14em (less Bloomberg-y).
        "eyebrow":    ["0.6875rem", { lineHeight: "1.1", letterSpacing: "0.14em", fontWeight: "500" }],
        "caption":    ["0.75rem",   { lineHeight: "1.45", letterSpacing: "0.003em" }],
        "body-sm":    ["0.875rem",  { lineHeight: "1.6" }],
        "body":       ["0.9375rem", { lineHeight: "1.62" }],
        "body-lg":    ["1.0625rem", { lineHeight: "1.58" }],
        "lead":       ["1.1875rem", { lineHeight: "1.5", letterSpacing: "-0.005em", fontWeight: "500" }],
        "h6":         ["1.0625rem", { lineHeight: "1.4",  letterSpacing: "-0.012em", fontWeight: "600" }],
        "h5":         ["1.125rem",  { lineHeight: "1.35", letterSpacing: "-0.014em", fontWeight: "600" }],
        "h4":         ["1.25rem",   { lineHeight: "1.32", letterSpacing: "-0.018em", fontWeight: "600" }],
        "h3":         ["1.5625rem", { lineHeight: "1.22", letterSpacing: "-0.022em", fontWeight: "600" }],
        "h2":         ["clamp(1.75rem, 2.2vw + 0.5rem, 2.375rem)", { lineHeight: "1.14", letterSpacing: "-0.024em", fontWeight: "600" }],
        // Display sizes retained for the marketing landing only.
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
        // Softened to feel Apple/iOS-native. Cards now use 20px not 24px;
        // input wells 14px not 12px (more tactile on touch).
        xs: "6px",
        sm: "10px",
        md: "14px",
        lg: "18px",
        xl: "20px",
        "2xl": "22px",
        "3xl": "28px",
      },
      boxShadow: {
        // Shadow scale — Apple-grade calm. Two layers max for every card.
        // The previous 4-layer 'cinematic' (64px + 120px halo) was the single
        // biggest contributor to the 'too-much' feel. It's gone.
        soft:     "0 1px 2px rgba(11, 15, 26, 0.04)",
        card:     "0 1px 2px rgba(11, 15, 26, 0.04), 0 4px 12px -4px rgba(11, 15, 26, 0.06)",
        elevated: "0 1px 2px rgba(11, 15, 26, 0.04), 0 8px 24px -8px rgba(11, 15, 26, 0.08)",
        wallet:   "0 1px 2px rgba(11, 15, 26, 0.05), 0 12px 32px -12px rgba(11, 15, 26, 0.10)",
        // Cinematic — much calmer than v3. Single soft halo, no neon glow.
        cinematic:"0 1px 2px rgba(11, 15, 26, 0.04), 0 12px 32px -12px rgba(11, 15, 26, 0.08)",
        ring:     "0 0 0 1px rgba(20, 28, 46, 0.08)",
        "accent-ring":"0 0 0 1px rgba(52, 70, 106, 0.20)",
        // ember-glow is retained as a token but its opacity is dialed back ~70%.
        "ember-glow":"0 0 0 1px rgba(201, 112, 48, 0.14), 0 2px 8px -2px rgba(201, 112, 48, 0.12)",
        inset:    "inset 0 1px 0 rgba(255, 255, 255, 0.7), inset 0 -1px 0 rgba(20, 28, 46, 0.03)",
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
        // Standardised motion language. Default to 'calm' for everything
        // except critical state changes which use 'precise'.
        calm: "cubic-bezier(0.22, 1, 0.36, 1)",      // Apple-style ease-out
        precise: "cubic-bezier(0.4, 0, 0.2, 1)",      // iOS Material precise
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",  // playful — used rarely
        bloom: "cubic-bezier(0.16, 1, 0.3, 1)",        // hero reveals only
      },
      transitionDuration: {
        // Single source of truth for durations. 180ms is the new default;
        // everything tactile (button press, hover lift) snaps under 200ms.
        snap: "120ms",
        tactile: "180ms",
        calm: "260ms",
        cinematic: "480ms",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
