import { describe, expect, it } from "vitest";
import { ImporterRegistry } from "../../src/application/importer-registry";
import { createHostnameImporter } from "../../src/infrastructure/hostname-importer";

function fakeImporter(providerId: string, hostname: string) {
  return createHostnameImporter({ providerId, displayName: providerId, hostnames: [hostname] });
}

describe("ImporterRegistry", () => {
  it("finds the first registered importer that supports a url", () => {
    const registry = new ImporterRegistry();
    const a = fakeImporter("a", "a.com");
    const b = fakeImporter("b", "b.com");
    registry.register(a);
    registry.register(b);

    expect(registry.findFor("https://b.com/product/1")).toBe(b);
  });

  it("returns null when no importer supports the url", () => {
    const registry = new ImporterRegistry();
    registry.register(fakeImporter("a", "a.com"));

    expect(registry.findFor("https://unknown.com/product/1")).toBeNull();
  });

  it("lists all registered importers", () => {
    const registry = new ImporterRegistry();
    registry.register(fakeImporter("a", "a.com"));
    registry.register(fakeImporter("b", "b.com"));

    expect(registry.list().map((importer) => importer.providerId)).toEqual(["a", "b"]);
  });
});
