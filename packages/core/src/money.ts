/** ISO 4217 currency code, e.g. "EUR", "USD". */
export type CurrencyCode = string;

/**
 * amountMinor is an integer in the currency's minor unit (cents) to avoid
 * floating-point rounding errors. Formatting for display is a UI concern.
 */
export interface Money {
  amountMinor: number;
  currency: CurrencyCode;
}

export function money(amountMinor: number, currency: CurrencyCode): Money {
  if (!Number.isInteger(amountMinor)) {
    throw new Error("Money.amountMinor must be an integer (minor units, e.g. cents)");
  }
  return { amountMinor, currency };
}

export function addMoney(a: Money, b: Money): Money {
  if (a.currency !== b.currency) {
    throw new Error(`Cannot add Money of different currencies: ${a.currency} vs ${b.currency}`);
  }
  return { amountMinor: a.amountMinor + b.amountMinor, currency: a.currency };
}

export function isZero(m: Money): boolean {
  return m.amountMinor === 0;
}
