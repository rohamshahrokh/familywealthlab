/**
 * Barrel exports for the interactive chart primitives.
 *
 * Use these on every dashboard page in place of the SSR-only chart primitives
 * in `@/components/workspace/charts`.
 */

export { FinancialLineChart } from "./FinancialLineChart";
export type { ChartSeries, PeriodKey } from "./FinancialLineChart";
export { FinancialAreaChart } from "./FinancialAreaChart";
export { AllocationDonutChart } from "./AllocationDonutChart";
export type { DonutSlice } from "./AllocationDonutChart";
export { InteractiveBarRow } from "./InteractiveBarRow";
export { MonteCarloFanChart } from "./MonteCarloFanChart";
export { ScenarioMatrix } from "./ScenarioMatrix";
export type { ScenarioCandidate } from "./ScenarioMatrix";
export { DecisionMatrix } from "./DecisionMatrix";
export type { DecisionCandidate, DecisionRiskMetric } from "./DecisionMatrix";
export { MetricCard } from "./MetricCard";
export type { MetricFormat, MetricTone } from "./MetricCard";
export { InsightCard } from "./InsightCard";
export type { InsightSeverity } from "./InsightCard";
export { CashflowComboChart } from "./CashflowComboChart";
export type { ComboPoint, ComboChartType } from "./CashflowComboChart";
