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
  const map: Record<string, string> = {
    java: "var(--color-primary)",
    spring: "var(--color-green)",
    jpa: "var(--color-secondary)",
    devsecops: "var(--color-yellow)",
    cs: "var(--color-muted)",
    general: "var(--color-muted)",
  };
  return map[cat] ?? "var(--color-muted)";
}

export function getCategoryLabel(cat: Category): string {
  const map: Record<string, string> = {
    java: "Java",
    spring: "Spring",
    jpa: "JPA/JDBC",
    devsecops: "DevSecOps",
    cs: "CS Fundamentals",
    general: "General",
  };
  return map[cat] ?? cat;
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
