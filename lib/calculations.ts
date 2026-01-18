import type { Asset, AssetType, Hypothesis, ProjectionYear } from "./types";

export function calculateProjections(
  assets: Asset[],
  hypotheses: Hypothesis[],
  years: number
): ProjectionYear[] {
  const results: ProjectionYear[] = [];

  // Group current values by asset type
  const currentByType: Record<string, number> = {};
  for (const asset of assets) {
    const type = asset.asset_type;
    currentByType[type] = (currentByType[type] || 0) + asset.current_amount;
  }

  // Get hypotheses by type
  const hypothesisByType: Record<string, Hypothesis> = {};
  for (const h of hypotheses) {
    hypothesisByType[h.asset_type] = h;
  }

  // Initialize running totals for each scenario by type
  const runningByType: Record<
    string,
    { pessimistic: number; average: number; optimistic: number }
  > = {};

  for (const type of Object.keys(currentByType)) {
    runningByType[type] = {
      pessimistic: currentByType[type],
      average: currentByType[type],
      optimistic: currentByType[type],
    };
  }

  // Year 0 = current state
  results.push({
    year: 0,
    pessimistic: Object.values(currentByType).reduce((a, b) => a + b, 0),
    average: Object.values(currentByType).reduce((a, b) => a + b, 0),
    optimistic: Object.values(currentByType).reduce((a, b) => a + b, 0),
    breakdown: Object.fromEntries(
      Object.entries(runningByType).map(([type, vals]) => [type, { ...vals }])
    ) as Record<AssetType, { pessimistic: number; average: number; optimistic: number }>,
  });

  // Calculate for each year
  for (let year = 1; year <= years; year++) {
    for (const type of Object.keys(runningByType)) {
      const hypothesis = hypothesisByType[type];
      if (!hypothesis) continue;

      const annualContribution =
        (hypothesis.monthly_contribution_leo + hypothesis.monthly_contribution_julie) * 12 * 1.01^year;

      // Apply growth rate and add contributions
      runningByType[type].pessimistic =
        runningByType[type].pessimistic * (1 + hypothesis.pessimistic_rate / 100) +
        annualContribution;

      runningByType[type].average =
        runningByType[type].average * (1 + hypothesis.avg_rate / 100) + annualContribution;

      runningByType[type].optimistic =
        runningByType[type].optimistic * (1 + hypothesis.optimistic_rate / 100) +
        annualContribution;
    }

    const totals = {
      pessimistic: 0,
      average: 0,
      optimistic: 0,
    };

    for (const vals of Object.values(runningByType)) {
      totals.pessimistic += vals.pessimistic;
      totals.average += vals.average;
      totals.optimistic += vals.optimistic;
    }

    results.push({
      year,
      pessimistic: Math.round(totals.pessimistic * 100) / 100,
      average: Math.round(totals.average * 100) / 100,
      optimistic: Math.round(totals.optimistic * 100) / 100,
      breakdown: Object.fromEntries(
        Object.entries(runningByType).map(([type, vals]) => [
          type,
          {
            pessimistic: Math.round(vals.pessimistic * 100) / 100,
            average: Math.round(vals.average * 100) / 100,
            optimistic: Math.round(vals.optimistic * 100) / 100,
          },
        ])
      ) as Record<AssetType, { pessimistic: number; average: number; optimistic: number }>,
    });
  }

  return results;
}

export function calculatePerformance(buyingAmount: number, currentAmount: number): number {
  if (buyingAmount === 0) return 0;
  return ((currentAmount - buyingAmount) / buyingAmount) * 100;
}

export function calculateDividendYield(
  dividendPerShare: number,
  currentValue: number
): number {
  if (currentValue === 0) return 0;
  return (dividendPerShare / currentValue) * 100;
}

export function calculateAnnualDividend(
  quantity: number,
  dividendPerShare: number
): number {
  return quantity * dividendPerShare;
}

export function formatCurrency(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatPercent(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100);
}

export function formatNumber(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}
