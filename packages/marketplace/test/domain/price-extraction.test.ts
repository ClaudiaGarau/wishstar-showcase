import { describe, expect, it } from "vitest";
import { extractPriceFromText } from "../../src/domain/price-extraction";

describe("extractPriceFromText", () => {
  it("parses a euro amount with the symbol before the number", () => {
    expect(extractPriceFromText("Cuffie Bluetooth - €19,99 su Amazon.it")).toEqual({
      amountMinor: 1999,
      currency: "EUR",
    });
  });

  it("parses a euro amount with the symbol after the number", () => {
    expect(extractPriceFromText("Zaino da viaggio 45,50€")).toEqual({
      amountMinor: 4550,
      currency: "EUR",
    });
  });

  it("parses a dollar amount", () => {
    expect(extractPriceFromText("Wireless Headphones $29.99")).toEqual({
      amountMinor: 2999,
      currency: "USD",
    });
  });

  it("parses a pound amount", () => {
    expect(extractPriceFromText("Travel Backpack £39.99")).toEqual({
      amountMinor: 3999,
      currency: "GBP",
    });
  });

  it("handles thousand separators in European format", () => {
    expect(extractPriceFromText("Bici elettrica €1.299,00")).toEqual({
      amountMinor: 129900,
      currency: "EUR",
    });
  });

  it("handles thousand separators in US format", () => {
    expect(extractPriceFromText("Electric bike $1,299.00")).toEqual({
      amountMinor: 129900,
      currency: "USD",
    });
  });

  it("returns null when no price is present", () => {
    expect(extractPriceFromText("Cuffie Bluetooth wireless")).toBeNull();
  });

  it("parses a price written with the ISO currency code instead of a symbol", () => {
    expect(extractPriceFromText("Steam Gift Card 19.60 EUR Aggiungi al carrello")).toEqual({
      amountMinor: 1960,
      currency: "EUR",
    });
  });

  it("prefers a decimal price over a whole-number amount that's really part of the title", () => {
    // "Steam Gift Card 20 EUR" is the card's face value baked into the product
    // name, not the actual selling price — the real price ("19.60 EUR") is
    // what should win even though the face value appears earlier in the text.
    expect(
      extractPriceFromText("Steam Gift Card 20 EUR - Steam Chiave - EUROPA ... 19.60 EUR Aggiungi al carrello"),
    ).toEqual({ amountMinor: 1960, currency: "EUR" });
  });

  it("falls back to a whole-number amount when no decimal price is present anywhere", () => {
    expect(extractPriceFromText("Buono regalo da 50 EUR")).toEqual({ amountMinor: 5000, currency: "EUR" });
  });
});
