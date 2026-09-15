/**
 * Same constraint as extractPriceFromText: no CORS-free way to fetch a
 * product page, so this only ever reads what's already in the pasted
 * text (title + a snippet the user copied off the page) — never the URL
 * itself. Best-effort, always overridable by hand afterwards.
 */
function extractLabeledValue(text: string, labels: string[]): string | null {
  // \b word boundaries matter here: without them "size" matches inside
  // "oversize", "color" inside "multicolor", etc. — a real bug caught by
  // testing against "Felpa oversize ... Taglia: M" (see attribute-extraction.test.ts).
  const pattern = new RegExp(`\\b(?:${labels.join("|")})\\b\\s*[:\\-]\\s*([^\\n,;|—]{1,40})`, "iu");
  const match = text.match(pattern);
  let value = match?.[1]?.trim();
  if (!value) {
    return null;
  }
  // The next field is often glued on with no delimiter (a URL, or a price
  // — e.g. "Marca: Nike €39,90") — don't let it get swallowed into the value.
  const cutIndex = value.search(/https?:\/\/|[€$£]/iu);
  if (cutIndex >= 0) {
    value = value.slice(0, cutIndex).trim();
  }
  return value || null;
}

export function extractColorFromText(text: string): string | null {
  return extractLabeledValue(text, ["colore", "colour", "color"]);
}

export function extractSizeFromText(text: string): string | null {
  return extractLabeledValue(text, ["taglia", "misura", "size"]);
}

export function extractBrandFromText(text: string): string | null {
  return extractLabeledValue(text, ["marca", "brand"]);
}

/**
 * A direct image URL only ever shows up in pasted text if the user
 * specifically copied an image address rather than page text — rare, but
 * free to pick up when it happens. There is no way to derive a photo
 * from a bare product link alone without fetching the page.
 */
export function extractImageUrlFromText(text: string): string | null {
  const match = text.match(/https?:\/\/\S+\.(?:jpg|jpeg|png|webp|gif)(?:\?\S*)?/iu);
  return match?.[0] ?? null;
}
