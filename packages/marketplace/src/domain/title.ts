const MAX_TITLE_LENGTH = 150;

/**
 * A pasted product title often comes from a loose mobile long-press
 * selection that grabs neighboring page chrome (quantity pickers, badges)
 * along with the real name, sometimes across several lines. This doesn't
 * try to guess which part is "the real title" — it just collapses that
 * into a single readable line and caps its length, so a big accidental
 * selection doesn't dump an unreadable wall of text into the title field.
 */
export function normalizeTitle(raw: string): string {
  const collapsed = raw.replace(/\s+/gu, " ").trim();
  return collapsed.length > MAX_TITLE_LENGTH ? `${collapsed.slice(0, MAX_TITLE_LENGTH).trim()}…` : collapsed;
}
