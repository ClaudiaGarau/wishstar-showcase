import { describe, expect, it, vi } from "vitest";
import { ImporterRegistry } from "../../src/application/importer-registry";
import { MarketplaceService } from "../../src/application/marketplace-service";
import type { RemoteProductPreview } from "../../src/domain/draft";
import { AMAZON_IMPORTER, EBAY_IMPORTER } from "../../src/infrastructure/built-in-importers";
import type { RemoteProductFetcher } from "../../src/ports";

function setup(remoteFetcher?: RemoteProductFetcher) {
  const registry = new ImporterRegistry();
  registry.register(AMAZON_IMPORTER);
  registry.register(EBAY_IMPORTER);
  return new MarketplaceService(registry, remoteFetcher);
}

describe("MarketplaceService", () => {
  it("delegates to the matching importer", () => {
    const service = setup();

    const draft = service.importFromShare({
      url: "https://www.amazon.it/dp/B0EXAMPLE",
      title: "Cuffie Bluetooth - Amazon.it",
    });

    expect(draft.providerId).toBe("amazon");
    expect(draft.title).toBe("Cuffie Bluetooth");
  });

  it("falls back to a generic draft when no importer matches", () => {
    const service = setup();

    const draft = service.importFromShare({
      url: "https://www.unknown-shop.com/product/1",
      title: "Qualcosa di carino",
      text: "Solo €12,50",
    });

    expect(draft.providerId).toBe("unknown");
    expect(draft.store).toBe("unknown-shop.com");
    expect(draft.title).toBe("Qualcosa di carino");
    expect(draft.price).toEqual({ amountMinor: 1250, currency: "EUR" });
  });

  it("lists the registered providers", () => {
    const service = setup();
    expect(service.listProviders()).toEqual([
      { providerId: "amazon", displayName: "Amazon" },
      { providerId: "ebay", displayName: "eBay" },
    ]);
  });
});

describe("MarketplaceService.importFromUrl", () => {
  it("returns the local draft unchanged when no remote fetcher is configured", async () => {
    const service = setup();
    const draft = await service.importFromUrl("https://www.amazon.it/dp/B0EXAMPLE");
    expect(draft.providerId).toBe("amazon");
    expect(draft.photos).toEqual([]);
  });

  it("fills gaps from the remote fetcher when the local draft has nothing", async () => {
    const remotePreview: RemoteProductPreview = {
      title: "Felpa oversize",
      image: "https://example.com/felpa.jpg",
      price: { amountMinor: 3990, currency: "EUR" },
      brand: "Nike",
    };
    const remoteFetcher: RemoteProductFetcher = { fetchPreview: vi.fn(async () => remotePreview) };
    const service = setup(remoteFetcher);

    const draft = await service.importFromUrl("https://www.unknown-shop.com/product/1");

    expect(draft.title).toBe("Felpa oversize");
    expect(draft.price).toEqual({ amountMinor: 3990, currency: "EUR" });
    expect(draft.brand).toBe("Nike");
    expect(draft.photos).toEqual(["https://example.com/felpa.jpg"]);
  });

  it("prefers locally-extracted fields over the remote fetch", async () => {
    const remotePreview: RemoteProductPreview = {
      title: "Titolo generico dalla pagina",
      image: "https://example.com/generic.jpg",
      price: { amountMinor: 999, currency: "EUR" },
      brand: "MarcaGenerica",
    };
    const remoteFetcher: RemoteProductFetcher = { fetchPreview: vi.fn(async () => remotePreview) };
    const service = setup(remoteFetcher);

    const draft = await service.importFromUrl(
      "https://www.unknown-shop.com/product/1",
      "Felpa oversize, Marca: Nike €39,90",
    );

    expect(draft.price).toEqual({ amountMinor: 3990, currency: "EUR" });
    expect(draft.brand).toBe("Nike");
    // The pasted text itself becomes the title (existing fallback-to-shared-text
    // behavior), so the remote generic title never gets a chance to apply here.
    expect(draft.title).toBe("Felpa oversize, Marca: Nike €39,90");
  });

  it("falls back to the remote title only when no text was pasted at all", async () => {
    const remotePreview: RemoteProductPreview = {
      title: "Titolo dalla pagina",
      image: null,
      price: null,
      brand: null,
    };
    const remoteFetcher: RemoteProductFetcher = { fetchPreview: vi.fn(async () => remotePreview) };
    const service = setup(remoteFetcher);

    const draft = await service.importFromUrl("https://www.unknown-shop.com/product/1");

    expect(draft.title).toBe("Titolo dalla pagina");
  });

  it("falls back to the local draft when the remote fetch finds nothing", async () => {
    const remoteFetcher: RemoteProductFetcher = { fetchPreview: vi.fn(async () => null) };
    const service = setup(remoteFetcher);

    const draft = await service.importFromUrl("https://www.unknown-shop.com/product/1", "Solo €12,50");

    expect(draft.price).toEqual({ amountMinor: 1250, currency: "EUR" });
    expect(draft.photos).toEqual([]);
  });

  it("keeps an explicit title separate from text, instead of flattening both into the title", async () => {
    const service = setup();

    const draft = await service.importFromUrl(
      "https://www.unknown-shop.com/product/1",
      "Prezzo: €21,66\nhttps://example.com/photo.jpg",
      "Disney: Funko Pop! Deluxe - Ursula sul Trono",
    );

    expect(draft.title).toBe("Disney: Funko Pop! Deluxe - Ursula sul Trono");
    expect(draft.price).toEqual({ amountMinor: 2166, currency: "EUR" });
    expect(draft.photos).toEqual(["https://example.com/photo.jpg"]);
  });
});
