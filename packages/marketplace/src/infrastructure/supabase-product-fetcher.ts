import type { SupabaseClient } from "@wishstar/cloud";
import type { RemoteProductPreview } from "../domain/draft";
import type { RemoteProductFetcher } from "../ports";

interface EdgeFunctionResponse {
  title: string | null;
  image: string | null;
  price: { amountMinor: number; currency: string } | null;
  brand: string | null;
}

/**
 * Calls the fetch-product-preview Edge Function — never throws on a
 * fetch/parse failure (the target site blocking scrapers, a timeout, a
 * page with no structured data at all) since a bare link failing to
 * auto-fill is an expected, non-fatal outcome, not an app error.
 */
export class SupabaseProductFetcher implements RemoteProductFetcher {
  constructor(private readonly client: SupabaseClient) {}

  async fetchPreview(url: string): Promise<RemoteProductPreview | null> {
    try {
      const { data, error } = await this.client.functions.invoke<EdgeFunctionResponse>(
        "fetch-product-preview",
        { body: { url } },
      );
      if (error || !data) {
        return null;
      }
      return {
        title: data.title,
        image: data.image,
        price: data.price ? { amountMinor: data.price.amountMinor, currency: data.price.currency } : null,
        brand: data.brand,
      };
    } catch {
      return null;
    }
  }
}
