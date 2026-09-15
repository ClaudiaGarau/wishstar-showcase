import {
  extractBrandFromText,
  extractColorFromText,
  extractImageUrlFromText,
  extractSizeFromText,
} from "../domain/attribute-extraction";
import { extractPriceFromText } from "../domain/price-extraction";
import { normalizeTitle } from "../domain/title";
import { safeHostname } from "../domain/url";
import type { ImportedProductDraft, SharedPayload } from "../domain/draft";
import type { ProductImporter } from "../ports";

export interface HostnameImporterConfig {
  providerId: string;
  displayName: string;
  /** Bare hostnames, no "www." — matches the exact host or any subdomain of it. */
  hostnames: string[];
  /** Trailing patterns to strip off a shared title, e.g. " - Amazon.it". */
  titleSuffixes?: string[];
}

/**
 * One factory covers every store: they all reduce to "match the hostname,
 * clean up the shared title, try to spot a price in the shared text." A
 * site with real quirks (e.g. a stable product-id pattern worth keeping)
 * can still get its own bespoke ProductImporter later without touching
 * this one.
 */
export function createHostnameImporter(config: HostnameImporterConfig): ProductImporter {
  return {
    providerId: config.providerId,
    displayName: config.displayName,

    supports(url: string): boolean {
      const hostname = safeHostname(url);
      if (!hostname) {
        return false;
      }
      return config.hostnames.some((host) => hostname === host || hostname.endsWith(`.${host}`));
    },

    extract(shared: SharedPayload): ImportedProductDraft {
      const rawTitle = shared.title || shared.text || null;
      const combinedText = [shared.title, shared.text].filter(Boolean).join(" ");
      const imageUrl = extractImageUrlFromText(combinedText);
      return {
        providerId: config.providerId,
        store: config.displayName,
        originalUrl: shared.url,
        title: rawTitle ? cleanTitle(rawTitle, config.titleSuffixes ?? []) : null,
        price: extractPriceFromText(combinedText),
        photos: imageUrl ? [imageUrl] : [],
        category: null,
        brand: extractBrandFromText(combinedText),
        color: extractColorFromText(combinedText),
        size: extractSizeFromText(combinedText),
      };
    },
  };
}

function cleanTitle(raw: string, suffixes: string[]): string {
  let cleaned = normalizeTitle(raw);
  for (const suffix of suffixes) {
    if (cleaned.endsWith(suffix)) {
      cleaned = cleaned.slice(0, -suffix.length).trim();
    }
  }
  return cleaned;
}
