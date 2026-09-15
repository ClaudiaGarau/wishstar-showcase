import { describe, expect, it } from "vitest";
import { createHostnameImporter } from "../../src/infrastructure/hostname-importer";

const importer = createHostnameImporter({
  providerId: "example",
  displayName: "Example Store",
  hostnames: ["example.com"],
  titleSuffixes: [" - Example.com"],
});

describe("createHostnameImporter", () => {
  it("matches the exact hostname", () => {
    expect(importer.supports("https://example.com/product/123")).toBe(true);
  });

  it("matches subdomains", () => {
    expect(importer.supports("https://www.example.com/product/123")).toBe(true);
    expect(importer.supports("https://m.example.com/product/123")).toBe(true);
  });

  it("does not match unrelated hosts", () => {
    expect(importer.supports("https://not-example.com/product/123")).toBe(false);
    expect(importer.supports("https://example.com.evil.net/product/123")).toBe(false);
  });

  it("does not throw on malformed urls", () => {
    expect(importer.supports("not a url")).toBe(false);
  });

  it("strips the configured suffix from the shared title", () => {
    const draft = importer.extract({
      url: "https://example.com/product/123",
      title: "Cuffie Bluetooth - Example.com",
    });
    expect(draft.title).toBe("Cuffie Bluetooth");
  });

  it("falls back to the shared text when there is no title", () => {
    const draft = importer.extract({ url: "https://example.com/product/123", text: "Zaino da viaggio" });
    expect(draft.title).toBe("Zaino da viaggio");
  });

  it("extracts a price from the shared text when present", () => {
    const draft = importer.extract({
      url: "https://example.com/product/123",
      title: "Zaino da viaggio",
      text: "In offerta a €39,90",
    });
    expect(draft.price).toEqual({ amountMinor: 3990, currency: "EUR" });
  });

  it("leaves price null and photos empty when nothing can be inferred", () => {
    const draft = importer.extract({ url: "https://example.com/product/123" });
    expect(draft.price).toBeNull();
    expect(draft.photos).toEqual([]);
    expect(draft.title).toBeNull();
    expect(draft.brand).toBeNull();
    expect(draft.color).toBeNull();
    expect(draft.size).toBeNull();
  });

  it("extracts brand, color, size and a direct image URL from the shared text", () => {
    const draft = importer.extract({
      url: "https://example.com/product/123",
      title: "Felpa oversize",
      text: "Marca: Nike, Colore: Rosso, Taglia: M — https://example.com/img/felpa.jpg",
    });
    expect(draft.brand).toBe("Nike");
    expect(draft.color).toBe("Rosso");
    expect(draft.size).toBe("M");
    expect(draft.photos).toEqual(["https://example.com/img/felpa.jpg"]);
  });

  it("tags the draft with the configured provider and store name", () => {
    const draft = importer.extract({ url: "https://example.com/product/123" });
    expect(draft.providerId).toBe("example");
    expect(draft.store).toBe("Example Store");
    expect(draft.originalUrl).toBe("https://example.com/product/123");
  });
});
