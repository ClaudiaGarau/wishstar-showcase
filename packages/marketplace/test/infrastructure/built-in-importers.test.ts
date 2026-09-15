import { describe, expect, it } from "vitest";
import {
  ALIEXPRESS_IMPORTER,
  AMAZON_IMPORTER,
  BUILT_IN_IMPORTERS,
  EBAY_IMPORTER,
  ETSY_IMPORTER,
  SHEIN_IMPORTER,
  TEMU_IMPORTER,
} from "../../src/infrastructure/built-in-importers";

describe("built-in importers", () => {
  it.each([
    [AMAZON_IMPORTER, "https://www.amazon.it/dp/B0EXAMPLE"],
    [EBAY_IMPORTER, "https://www.ebay.it/itm/123456"],
    [ETSY_IMPORTER, "https://www.etsy.com/listing/123456"],
    [ALIEXPRESS_IMPORTER, "https://www.aliexpress.com/item/123456.html"],
    [TEMU_IMPORTER, "https://www.temu.com/product-123456.html"],
    [SHEIN_IMPORTER, "https://www.shein.com/product-p-123456.html"],
  ])("%# recognizes its own store URL", (importer, url) => {
    expect(importer.supports(url)).toBe(true);
  });

  it("does not cross-match another store's URL", () => {
    expect(AMAZON_IMPORTER.supports("https://www.ebay.it/itm/123456")).toBe(false);
    expect(EBAY_IMPORTER.supports("https://www.amazon.it/dp/B0EXAMPLE")).toBe(false);
  });

  it("registers exactly the six named stores by default", () => {
    expect(BUILT_IN_IMPORTERS.map((importer) => importer.providerId)).toEqual([
      "amazon",
      "ebay",
      "etsy",
      "aliexpress",
      "temu",
      "shein",
    ]);
  });

  it("strips the Amazon title suffix", () => {
    const draft = AMAZON_IMPORTER.extract({
      url: "https://www.amazon.it/dp/B0EXAMPLE",
      title: "Cuffie Bluetooth Wireless - Amazon.it",
    });
    expect(draft.title).toBe("Cuffie Bluetooth Wireless");
    expect(draft.store).toBe("Amazon");
  });
});
