/**
 * FWL Hybrid V2 — primitives barrel export.
 *
 * Import from "@/components/ui/v2" anywhere you need v2 surfaces. Keep
 * v1 (shadcn-styled) primitives in src/components/ui — they continue to
 * work because the underlying shadcn CSS variables in globals.css have
 * been remapped to the v2 palette.
 */
export { V2Card, V2CardHeader, V2CardBody, V2CardFooter } from "./Card";
export type { V2CardProps, V2CardHeaderProps } from "./Card";
export { V2Metric } from "./Metric";
export type { V2MetricProps } from "./Metric";
export { V2Sparkline } from "./Sparkline";
export type { V2SparklineProps } from "./Sparkline";
export { V2PageHeader } from "./PageHeader";
export type { V2PageHeaderProps } from "./PageHeader";
export { V2Pill } from "./Pill";
export type { V2PillProps } from "./Pill";
export { V2Section } from "./Section";
export type { V2SectionProps } from "./Section";
export { V2Button } from "./Button";
export type { V2ButtonProps, V2ButtonVariant, V2ButtonSize } from "./Button";

// v2 chart theme helpers (Recharts adapters live alongside)
export {
  v2ChartColors,
  v2GridProps,
  v2AxisProps,
  v2TooltipContentStyle,
  v2TooltipCursorProps,
} from "./chartTheme";
