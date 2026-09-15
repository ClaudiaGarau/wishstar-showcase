import { describe, expect, it } from "vitest";
import {
  extractBrandFromText,
  extractColorFromText,
  extractImageUrlFromText,
  extractSizeFromText,
} from "../../src/domain/attribute-extraction";

describe("extractColorFromText", () => {
  it("reads an Italian 'Colore:' label", () => {
    expect(extractColorFromText("Felpa oversize Colore: Rosso, taglia M")).toBe("Rosso");
  });

  it("reads an English 'Color:' label", () => {
    expect(extractColorFromText("Hoodie Color: Navy Blue")).toBe("Navy Blue");
  });

  it("returns null when no color hint is present", () => {
    expect(extractColorFromText("Felpa oversize taglia M")).toBeNull();
  });

  it("does not match 'color' as a substring of an unrelated word like 'multicolor'", () => {
    expect(extractColorFromText("Stampa multicolor, Colore: Rosso")).toBe("Rosso");
  });
});

describe("extractSizeFromText", () => {
  it("reads an Italian 'Taglia:' label", () => {
    expect(extractSizeFromText("Felpa oversize Colore: Rosso, Taglia: M")).toBe("M");
  });

  it("reads an English 'Size:' label", () => {
    expect(extractSizeFromText("Hoodie Size: L")).toBe("L");
  });

  it("returns null when no size hint is present", () => {
    expect(extractSizeFromText("Felpa oversize rossa")).toBeNull();
  });

  it("does not match 'size' as a substring of an unrelated word like 'oversize'", () => {
    expect(
      extractSizeFromText("Felpa oversize - Amazon.it Marca: Nike, Colore: Rosso, Taglia: M — €39,90"),
    ).toBe("M");
  });
});

describe("extractBrandFromText", () => {
  it("reads a 'Marca:'/'Brand:' label", () => {
    expect(extractBrandFromText("Scarpe da corsa Marca: Nike")).toBe("Nike");
    expect(extractBrandFromText("Running shoes Brand: Nike")).toBe("Nike");
  });

  it("returns null when no brand hint is present", () => {
    expect(extractBrandFromText("Scarpe da corsa comode")).toBeNull();
  });

  it("does not swallow a price glued on with no delimiter", () => {
    expect(extractBrandFromText("Marca: Nike €39,90")).toBe("Nike");
  });
});

describe("extractImageUrlFromText", () => {
  it("finds a direct image URL in the pasted text", () => {
    expect(extractImageUrlFromText("Guarda qui https://example.com/img/product-123.jpg grazie")).toBe(
      "https://example.com/img/product-123.jpg",
    );
  });

  it("returns null when no image URL is present", () => {
    expect(extractImageUrlFromText("Felpa oversize colore rosso, taglia M")).toBeNull();
  });
});
