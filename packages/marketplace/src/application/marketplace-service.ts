import {
  extractBrandFromText,
  extractColorFromText,
  extractImageUrlFromText,
  extractSizeFromText,
} from "../domain/attribute-extraction";
import { extractPriceFromText } from "../domain/price-extraction";
import { normalizeTitle } from "../domain/title";
import { safeHostname } from "../domain/url";
import type { ImportedProductDraft, SharedPayload } from "../domain/draft";
import type { ImporterRegistry } from "./importer-registry";
import type { RemoteProductFetcher } from "../ports";

export interface ImporterInfo {
  providerId: string;
  displayName: string;
}

export class MarketplaceService {
  constructor(
    private readonly registry: ImporterRegistry,
    private readonly remoteFetcher?: RemoteProductFetcher,
  ) {}

  importFromShare(shared: SharedPayload): ImportedProductDraft {
    const importer = this.registry.findFor(shared.url);
    if (importer) {
      return importer.extract(shared);
    }
    return this.fallbackDraft(shared);
  }

  /**
   * Same as importFromShare, plus a best-effort server-side fetch of the
   * page to fill in whatever the pasted text alone couldn't provide
   * (this is what makes "just the link, no pasted text" work at all).
   * Locally-extracted fields always win — the user explicitly copied
   * them, so they're more trustworthy than a generic page scrape.
   *
   * `title` is optional and kept separate from `text`: callers that already
   * have a clean product name (e.g. the quick-add bookmarklet, which reads
   * the page's own <h1>) should pass it here rather than folding it into
   * `text`, or it ends up flattened into the title verbatim alongside
   * whatever else `text` carries (price, image URL...).
   */
  async importFromUrl(url: string, text?: string, title?: string): Promise<ImportedProductDraft> {
    const local = this.importFromShare({ url, ...(text ? { text } : {}), ...(title ? { title } : {}) });
    if (!this.remoteFetcher) {
      return local;
    }
    const remote = await this.remoteFetcher.fetchPreview(url);
    if (!remote) {
      return local;
    }
    return {
      ...local,
      title: local.title ?? remote.title,
      price: local.price ?? remote.price,
      brand: local.brand ?? remote.brand,
      photos: local.photos.length > 0 ? local.photos : remote.image ? [remote.image] : [],
    };
  }

  listProviders(): ImporterInfo[] {
    return this.registry.list().map(({ providerId, displayName }) => ({ providerId, displayName }));
  }

  /** No matching adapter: still worth handing back what we can read straight off the share payload. */
  private fallbackDraft(shared: SharedPayload): ImportedProductDraft {
    const rawTitle = shared.title || shared.text || null;
    const combinedText = [shared.title, shared.text].filter(Boolean).join(" ");
    const imageUrl = extractImageUrlFromText(combinedText);
    return {
      providerId: "unknown",
      store: safeHostname(shared.url) ?? "",
      originalUrl: shared.url,
      title: rawTitle ? normalizeTitle(rawTitle) : null,
      price: extractPriceFromText(combinedText),
      photos: imageUrl ? [imageUrl] : [],
      category: null,
      brand: extractBrandFromText(combinedText),
      color: extractColorFromText(combinedText),
      size: extractSizeFromText(combinedText),
    };
  }
}
