// @fwl/engine — public surface for the commercial app.
//
// Re-export only what the commercial adapter needs. Treat this file as the
// allow-list: any new engine consumer must import through here, never from
// deep paths.

export type {
  DashboardInputs,
  CardContract,
  BindingSource,
  ContractTier,
  DataAvailability,
  CanonicalNetWorth,
  NwReconciliation,
  CanonicalIncome,
  HoldingsReconciliation,
} from "./dashboardDataContract";

export {
  KPI_DATA_CONTRACT,
  SOURCE_OF_TRUTH,
  ALL_CONTRACT_KEYS,
  bindingsFor,
  // Selectors (the workflow surfaces hit these directly)
  selectSettledIPs,
  selectPlannedIPs,
  selectIpCurrentValueSettled,
  selectIpLoanBalanceSettled,
  selectIpCurrentValuePlanned,
  selectIpLoanBalancePlanned,
  selectStocksTotal,
  selectCryptoTotal,
  selectTotalInvestments,
  selectPropertyEquity,
  selectDebtBalance,
  selectPassiveIncome,
  selectSuperCombined,
  selectMonthlyIncome,
  selectMonthlyExpensesLedger,
  selectMortgageRepayment,
  selectOtherDebtRepayment,
  selectSettledIpDebtService,
  selectMonthlyDebtService,
  selectExpensesIncludesDebt,
  selectMonthlySurplus,
  selectCashToday,
  selectCanonicalNetWorth,
  selectCanonicalIncome,
  reconcileNetWorth,
  reconcileHoldings,
  evaluateDataAvailability,
} from "./dashboardDataContract";

// Scenario / Decision Engine
export {
  runScenarioV2,
  deriveBasePlan,
  buildEventStore,
  computeRiskMetrics,
  computeServiceability,
  type RunScenarioInput,
  type ExtendedScenarioResult,
  type ScenarioDelta,
  type DeltaType,
  type MonthKey,
} from "./scenarioV2";

// AU Tax helpers (used by Strategy module pages)
export {
  computeWageTax,
  computeCgt,
  propertyAnnualTax,
  type WageTaxInput,
  type WageTaxOutput,
  type CgtInput,
  type CgtOutput,
  type AuState,
} from "./scenarioV2/auTax";
