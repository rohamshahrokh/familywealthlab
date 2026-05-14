import type { MetadataRoute } from "next";

/**
 * PWA manifest — declares Family Wealth Lab as an installable web app.
 *
 * Icons:
 *   - icon.svg (default route, served as image/svg+xml) → favicon + small icons
 *   - apple-icon.svg → Apple touch icon (192×192 nominally)
 *
 * The maskable purpose lets Android use the icon inside its adaptive-icon
 * mask without clipping the artwork (we keep generous padding in the SVG).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Family Wealth Lab",
    short_name: "FWL",
    description:
      "The wealth operating system for serious Australian households — forecasting, scenarios, and decision intelligence in one calm interface.",
    start_url: "/",
    display: "standalone",
    background_color: "#F4F5F7",
    theme_color: "#0B0F1A",
    icons: [
      {
        src: "/icon.svg",
        type: "image/svg+xml",
        sizes: "any",
        purpose: "any",
      },
      {
        src: "/apple-touch-icon.svg",
        type: "image/svg+xml",
        sizes: "192x192",
        purpose: "maskable",
      },
    ],
    categories: ["finance", "productivity", "lifestyle"],
    lang: "en-AU",
  };
}
