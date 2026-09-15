import type { Money } from "@wishstar/core";

const CURRENCY_SYMBOLS: Record<string, string> = { EUR: "€", USD: "$", GBP: "£" };

export function formatMoney(amount: Money): string {
  const value = (amount.amountMinor / 100).toLocaleString("it-IT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const symbol = CURRENCY_SYMBOLS[amount.currency] ?? `${amount.currency} `;
  return `${symbol}${value}`;
}
