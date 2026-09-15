import type { Money } from "@wishstar/core";

/**
 * What the OS share sheet hands us when the user shares a product page
 * into WishStar (Web Share Target). Wired up in apps/web later — this
 * module only defines the shape and the transformation logic.
 */
export interface SharedPayload {
  url: string;
  title?: string;
  text?: string;
}

/**
 * Best-effort draft, never a finished Product: there is no network fetch
 * behind this (most retail sites block cross-origin reads), so price and
 * photos usually stay null/empty and the user completes them by hand.
 * Fields line up 1:1 with @wishstar/wishlist's CreateProductInput so the
 * UI can pass one straight into the other.
 */
/** What supabase/functions/fetch-product-preview returns after reading a page server-side. */
export interface RemoteProductPreview {
  title: string | null;
  image: string | null;
  price: Money | null;
  brand: string | null;
}

export interface ImportedProductDraft {
  providerId: string;
  store: string;
  originalUrl: string;
  title: string | null;
  price: Money | null;
  photos: string[];
  category: string | null;
  /** Only ever populated from a "Marca:"/"Brand:" hint in pasted text — never fetched. */
  brand: string | null;
  /** Only ever populated from "Colore:"/"Taglia:" hints in pasted text — never fetched. */
  color: string | null;
  size: string | null;
}
