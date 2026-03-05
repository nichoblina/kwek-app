import type { Category } from "./types";

export function generateId(): string {
  return crypto.randomUUID();
}

export function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function getCategoryColor(cat: Category): string {
  const palette = [
    "var(--color-primary)",
    "var(--color-green)",
    "var(--color-secondary)",
    "var(--color-yellow)",
    "var(--color-muted)",
    "var(--color-muted)",
  ];
  const hash = [...cat].reduce((acc, char) => acc + char.charCodeAt(0), 0);

  return palette[hash % palette.length];
}

export function getCategoryLabel(cat: Category): string {
  return cat.charAt(0).toUpperCase() + cat.slice(1);
}

export function deriveCategoriesFromCards(
  cards: Array<{ category: Category }>
): Category[] {
  return [...new Set(cards.map((c) => c.category))];
}

export function getScoreTier(score: number, total: number): {
  label: string;
  color: string;
} {
  const pct = total === 0 ? 0 : (score / total) * 100;
  if (pct >= 80) return { label: "Excellent", color: "var(--color-green)" };
  if (pct >= 60) return { label: "Good", color: "var(--color-yellow)" };
  return { label: "Needs Practice", color: "var(--color-primary)" };
}
