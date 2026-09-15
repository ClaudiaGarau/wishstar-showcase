import { describe, expect, it } from "vitest";
import { generateId, isId } from "../src/id";

describe("generateId", () => {
  it("produces a value recognized as a valid Id", () => {
    expect(isId(generateId())).toBe(true);
  });

  it("produces unique values across many calls", () => {
    const ids = new Set(Array.from({ length: 1000 }, () => generateId()));
    expect(ids.size).toBe(1000);
  });
});

describe("isId", () => {
  it("rejects non-UUID strings", () => {
    expect(isId("not-a-uuid")).toBe(false);
    expect(isId(42)).toBe(false);
  });
});
