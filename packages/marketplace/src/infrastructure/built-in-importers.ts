import { createHostnameImporter } from "./hostname-importer";
import type { ProductImporter } from "../ports";

export const AMAZON_IMPORTER = createHostnameImporter({
  providerId: "amazon",
  displayName: "Amazon",
  hostnames: ["amazon.it", "amazon.com", "amazon.de", "amazon.fr", "amazon.es", "amazon.co.uk"],
  titleSuffixes: [" - Amazon.it", " : Amazon.it", " - Amazon.com", " : Amazon.com"],
});

export const EBAY_IMPORTER = createHostnameImporter({
  providerId: "ebay",
  displayName: "eBay",
  hostnames: ["ebay.it", "ebay.com", "ebay.de", "ebay.co.uk"],
  titleSuffixes: [" | eBay"],
});

export const ETSY_IMPORTER = createHostnameImporter({
  providerId: "etsy",
  displayName: "Etsy",
  hostnames: ["etsy.com"],
  titleSuffixes: [" - Etsy", " | Etsy"],
});

export const ALIEXPRESS_IMPORTER = createHostnameImporter({
  providerId: "aliexpress",
  displayName: "AliExpress",
  hostnames: ["aliexpress.com"],
  titleSuffixes: [" - AliExpress", " | AliExpress"],
});

export const TEMU_IMPORTER = createHostnameImporter({
  providerId: "temu",
  displayName: "Temu",
  hostnames: ["temu.com"],
  titleSuffixes: [" - Temu"],
});

export const SHEIN_IMPORTER = createHostnameImporter({
  providerId: "shein",
  displayName: "Shein",
  hostnames: ["shein.com", "shein.it"],
  titleSuffixes: [" - SHEIN", " | SHEIN"],
});

/** Registered by default; anything not matching one of these falls back to a generic unknown-provider draft. */
export const BUILT_IN_IMPORTERS: ProductImporter[] = [
  AMAZON_IMPORTER,
  EBAY_IMPORTER,
  ETSY_IMPORTER,
  ALIEXPRESS_IMPORTER,
  TEMU_IMPORTER,
  SHEIN_IMPORTER,
];
