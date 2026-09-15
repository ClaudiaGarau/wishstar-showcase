import { money, type Money } from "@wishstar/core";

// Some sites (G2A in particular) print the ISO currency code as a word
// ("19.60 EUR") instead of a symbol — the \b after the code stops it from
// matching inside a longer word like "EURO".
//
// Split into two tiers because a whole-number amount next to a currency
// marker is ambiguous — e.g. a "Steam Gift Card 20 EUR" title looks
// identical to a price. A real transaction price is shown with cents,
// so patterns that require them are tried across the whole text first;
// whole-number patterns are a fallback only used when nothing decimal
// is found anywhere.
const DECIMAL_PATTERNS: { regex: RegExp; currency: string }[] = [
  { regex: /€\s?(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/u, currency: "EUR" },
  { regex: /(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})\s?€/u, currency: "EUR" },
  { regex: /\$\s?(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/u, currency: "USD" },
  { regex: /£\s?(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/u, currency: "GBP" },
  { regex: /(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})\s?EUR\b/iu, currency: "EUR" },
  { regex: /\bEUR\s?(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/iu, currency: "EUR" },
  { regex: /(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})\s?USD\b/iu, currency: "USD" },
  { regex: /\bUSD\s?(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/iu, currency: "USD" },
  { regex: /(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})\s?GBP\b/iu, currency: "GBP" },
  { regex: /\bGBP\s?(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/iu, currency: "GBP" },
];

const WHOLE_NUMBER_PATTERNS: { regex: RegExp; currency: string }[] = [
  { regex: /€\s?(\d{1,3}(?:[.,]\d{3})*)/u, currency: "EUR" },
  { regex: /(\d{1,3}(?:[.,]\d{3})*)\s?€/u, currency: "EUR" },
  { regex: /\$\s?(\d{1,3}(?:[.,]\d{3})*)/u, currency: "USD" },
  { regex: /£\s?(\d{1,3}(?:[.,]\d{3})*)/u, currency: "GBP" },
  { regex: /(\d{1,3}(?:[.,]\d{3})*)\s?EUR\b/iu, currency: "EUR" },
  { regex: /\bEUR\s?(\d{1,3}(?:[.,]\d{3})*)/iu, currency: "EUR" },
  { regex: /(\d{1,3}(?:[.,]\d{3})*)\s?USD\b/iu, currency: "USD" },
  { regex: /\bUSD\s?(\d{1,3}(?:[.,]\d{3})*)/iu, currency: "USD" },
  { regex: /(\d{1,3}(?:[.,]\d{3})*)\s?GBP\b/iu, currency: "GBP" },
  { regex: /\bGBP\s?(\d{1,3}(?:[.,]\d{3})*)/iu, currency: "GBP" },
];

/**
 * Parses a price out of free text (a shared title/snippet), not a page —
 * this is the only price signal available without a CORS-blocked fetch.
 * Returns null when no recognizable amount is found.
 */
export function extractPriceFromText(text: string): Money | null {
  return matchAny(DECIMAL_PATTERNS, text) ?? matchAny(WHOLE_NUMBER_PATTERNS, text);
}

function matchAny(patterns: { regex: RegExp; currency: string }[], text: string): Money | null {
  for (const { regex, currency } of patterns) {
    const match = text.match(regex);
    const rawAmount = match?.[1];
    if (rawAmount) {
      const amountMinor = parseAmountToMinorUnits(rawAmount);
      if (amountMinor !== null) {
        return money(amountMinor, currency);
      }
    }
  }
  return null;
}

/** Handles both "1.234,56" (EU) and "1,234.56" (US) formats. */
function parseAmountToMinorUnits(raw: string): number | null {
  const lastComma = raw.lastIndexOf(",");
  const lastDot = raw.lastIndexOf(".");
  const normalized =
    lastComma > lastDot ? raw.replace(/\./g, "").replace(",", ".") : raw.replace(/,/g, "");
  const value = Number.parseFloat(normalized);
  if (Number.isNaN(value)) {
    return null;
  }
  return Math.round(value * 100);
}
