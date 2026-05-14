import "server-only";
import {
  selectCanonicalNetWorth,
  selectTotalInvestments,
  selectPropertyEquity,
  selectMonthlySurplus,
  selectMonthlyIncome,
  selectMonthlyExpensesLedger,
  selectMonthlyDebtService,
  selectCashToday,
  selectDebtBalance,
  selectSuperCombined,
  evaluateDataAvailability,
  type DashboardInputs,
  type CanonicalNetWorth,
} from "@fwl/engine";
import { buildDashboardInputs } from "./buildDashboardInputs";

/** Friendlier per-surface flags than DataAvailability's snapshot-only view. */
export type WorkspaceAvailability = {
  hasIncome: boolean;
  hasExpenses: boolean;
  hasProperties: boolean;
  hasInvestments: boolean;
  hasCash: boolean;
  allEmpty: boolean;
  /** Plain-English list of empty surfaces — useful in banners. */
  emptySections: string[];
};

export type CommandCentre = {
  inputs: DashboardInputs;
  netWorth: CanonicalNetWorth;
  superCombined: number;
  totalInvestments: number;
  propertyEquity: number;
  monthlySurplus: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyDebtService: number;
  cashToday: number;
  debtBalance: number;
  availability: WorkspaceAvailability;
};

/**
 * Read-once snapshot of every figure the Command Centre + KPI bar render.
 * Pure derivation — no engine simulation, no Monte Carlo. The Decision Engine
 * surface (which IS expensive) is computed in a separate adapter so we never
 * pay that cost on the overview page.
 */
export async function getCommandCentre(householdId: string): Promise<CommandCentre> {
  const inputs = await buildDashboardInputs(householdId);
  const engineAvail = evaluateDataAvailability(inputs);

  const monthlyIncome = selectMonthlyIncome(inputs);
  const monthlyExpenses = selectMonthlyExpensesLedger(inputs);
  const cashToday = selectCashToday(inputs);
  const totalInvestments = selectTotalInvestments(inputs);

  const properties = inputs.properties ?? [];
  const hasProperties = properties.length > 0 || engineAvail.hasPpor;

  const availability: WorkspaceAvailability = {
    hasIncome:     monthlyIncome > 0,
    hasExpenses:   monthlyExpenses > 0,
    hasProperties: hasProperties,
    hasInvestments: totalInvestments > 0,
    hasCash:       cashToday > 0,
    allEmpty:      monthlyIncome === 0 && monthlyExpenses === 0 &&
                   !hasProperties && totalInvestments === 0 && cashToday === 0,
    emptySections: [
      ...(monthlyIncome === 0   ? ["Income"] : []),
      ...(monthlyExpenses === 0 ? ["Expenses"] : []),
      ...(!hasProperties        ? ["Properties"] : []),
      ...(totalInvestments === 0 ? ["Investments"] : []),
    ],
  };

  return {
    inputs,
    netWorth: selectCanonicalNetWorth(inputs),
    superCombined: selectSuperCombined(inputs),
    totalInvestments,
    propertyEquity: selectPropertyEquity(inputs),
    monthlySurplus: selectMonthlySurplus(inputs),
    monthlyIncome,
    monthlyExpenses,
    monthlyDebtService: selectMonthlyDebtService(inputs),
    cashToday,
    debtBalance: selectDebtBalance(inputs),
    availability,
  };
}
