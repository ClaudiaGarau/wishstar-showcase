const CATEGORY_EMOJI: Record<string, string> = {
  Compleanno: "🎂",
  Natale: "🎄",
  Matrimonio: "💍",
  Casa: "🏠",
  Bambini: "🧸",
  Viaggi: "✈️",
  Desideri: "🌟",
};

export function getCategoryEmoji(category: string): string {
  return CATEGORY_EMOJI[category] ?? "🎁";
}
