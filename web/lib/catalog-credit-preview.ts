/** Упрощённый расчёт аннуитетного платежа (как в CarCreditPanel), без UI. */
export function estimateMonthlyPaymentRub(params: {
  priceRub: number;
  downPaymentRub: number;
  termMonths: number;
  annualRatePercent: number;
}): number {
  const { priceRub, downPaymentRub, termMonths, annualRatePercent } = params;
  const principal = Math.max(0, priceRub - Math.max(0, downPaymentRub));
  if (principal <= 0 || termMonths <= 0) return 0;
  const monthlyRate = annualRatePercent / 12 / 100;
  if (monthlyRate <= 0) {
    return Math.round(principal / termMonths);
  }
  const k = (monthlyRate * (1 + monthlyRate) ** termMonths) / ((1 + monthlyRate) ** termMonths - 1);
  return Math.round(principal * k);
}
