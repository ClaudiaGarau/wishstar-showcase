import { describe, expect, it } from "vitest";
import { normalizeTitle } from "../../src/domain/title";

describe("normalizeTitle", () => {
  it("collapses newlines and repeated whitespace into single spaces", () => {
    expect(normalizeTitle("1 pezzo 1 pz\nTrasparente Addensata\n\nCultura Carina")).toBe(
      "1 pezzo 1 pz Trasparente Addensata Cultura Carina",
    );
  });

  it("leaves a short single-line title unchanged", () => {
    expect(normalizeTitle("Felpa oversize, Marca: Nike €39,90")).toBe("Felpa oversize, Marca: Nike €39,90");
  });

  it("caps very long pasted blobs instead of dumping them whole into the title", () => {
    const huge = "parola ".repeat(50).trim();
    const result = normalizeTitle(huge);
    expect(result.length).toBeLessThanOrEqual(151);
    expect(result.endsWith("…")).toBe(true);
  });
});
