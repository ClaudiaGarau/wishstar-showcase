import { describe, expect, it } from "vitest";
import { err, ok } from "../src/result";

describe("Result", () => {
  it("wraps a success value", () => {
    expect(ok(42)).toEqual({ ok: true, value: 42 });
  });

  it("wraps a failure value", () => {
    expect(err("boom")).toEqual({ ok: false, error: "boom" });
  });
});
