import { describe, expect, it } from "vitest";
import { addMoney, isZero, money } from "../src/money";

describe("money", () => {
  it("rejects non-integer minor units", () => {
    expect(() => money(10.5, "EUR")).toThrow();
  });

  it("adds amounts with the same currency", () => {
    expect(addMoney(money(500, "EUR"), money(250, "EUR"))).toEqual({
      amountMinor: 750,
      currency: "EUR",
    });
  });

  it("refuses to add different currencies", () => {
    expect(() => addMoney(money(500, "EUR"), money(500, "USD"))).toThrow();
  });

  it("detects zero amounts", () => {
    expect(isZero(money(0, "EUR"))).toBe(true);
    expect(isZero(money(1, "EUR"))).toBe(false);
  });
});
