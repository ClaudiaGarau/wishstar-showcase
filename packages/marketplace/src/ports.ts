import type { ImportedProductDraft, RemoteProductPreview, SharedPayload } from "./domain/draft";

/** One implementation per store. Adding a new site later means writing one of these, nothing else changes. */
export interface ProductImporter {
  readonly providerId: string;
  readonly displayName: string;
  supports(url: string): boolean;
  extract(shared: SharedPayload): ImportedProductDraft;
}

/**
 * Fetches a product page server-side, bypassing the CORS block that stops
 * the browser from reading most retail sites directly — see
 * supabase/functions/fetch-product-preview. Optional: MarketplaceService
 * works fine (falls back to text-paste-only extraction) without one.
 */
export interface RemoteProductFetcher {
  fetchPreview(url: string): Promise<RemoteProductPreview | null>;
}
