import type { Card, Category, GeneratedQuestion, QuestionType, SimpleCard } from "./types";
import { isFullCard, hasQuizData } from "./types";

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

const CATEGORY_LABEL_OVERRIDES: Record<string, string> = {
  cs: "CS",
  jpa: "JPA",
  devsecops: "DevSecOps",
  sql: "SQL",
  os: "OS",
  api: "API",
};

export function getCategoryLabel(cat: Category): string {
  const lower = cat.toLowerCase();
  if (CATEGORY_LABEL_OVERRIDES[lower]) return CATEGORY_LABEL_OVERRIDES[lower];
  return cat
    .split(/[-_]/)
    .map((w) => CATEGORY_LABEL_OVERRIDES[w.toLowerCase()] ?? (w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");
}

export function deriveCategoriesFromCards(
  cards: Array<{ category: Category }>
): Category[] {
  return [...new Set(cards.map((c) => c.category))];
}

// ─── Cloze helpers ────────────────────────────────────────────────────────────

/** Returns true if the text contains at least one {{answer}} marker. */
export function hasCloze(text: string): boolean {
  return /\{\{.+?\}\}/.test(text);
}

/** Extracts all answers from {{answer}} markers in order. */
export function getClozeAnswers(text: string): string[] {
  return [...text.matchAll(/\{\{(.+?)\}\}/g)].map((m) => m[1]);
}

/** Replaces all {{answer}} markers with ____. */
export function blankAllCloze(text: string): string {
  return text.replace(/\{\{.+?\}\}/g, "____");
}

/**
 * Blanks only the targetIdx-th {{answer}} marker, revealing all others.
 * e.g. blankClozeAtIndex("{{A}} and {{B}}", 0) → "____ and B"
 */
export function blankClozeAtIndex(text: string, targetIdx: number): string {
  let count = 0;
  return text.replace(/\{\{(.+?)\}\}/g, (_, answer) =>
    count++ === targetIdx ? "____" : answer
  );
}

/** Removes all {{...}} wrappers, leaving just the answer text. */
export function revealCloze(text: string): string {
  return text.replace(/\{\{(.+?)\}\}/g, "$1");
}

// ─── Question generator ───────────────────────────────────────────────────────

export function generateQuestionsForDeck(
  cards: Card[],
  preferredTypes: QuestionType[] = ["mc", "tf", "identification"],
  randomize: boolean = false,
  overrideManual: boolean = false
): GeneratedQuestion[] {
  // Use the quiz-correct answer for cards that have manual quiz data,
  // so TF distractors pull from the right answer pool in all modes.
  const allAnswers = cards.map((c) => {
    if (isFullCard(c)) return c.options[c.answerIndex];
    if (hasQuizData(c)) return c.options![c.answerIndex!];
    return c.back;
  });

  return cards.flatMap((card, idx): GeneratedQuestion[] => {
    // ── Cloze cards: always generate one question per blank ─────────────────
    // Only applies to plain SimpleCards without manual quiz options.
    if (!isFullCard(card) && !hasQuizData(card) && hasCloze(card.front)) {
      const clozeAnswers = getClozeAnswers(card.front);
      const cardIsHtml = !!(card as SimpleCard).isHtml;
      return clozeAnswers.map((answer, clozeIdx) => ({
        cardId: `${card.id}:cloze:${clozeIdx}`,
        originalCardId: card.id,
        type: "cloze" as QuestionType,
        question: blankClozeAtIndex(card.front, clozeIdx),
        correctAnswer: answer,
        explanation: revealCloze(card.front),
        isHtml: cardIsHtml,
        isGenerated: true,
      }));
    }

    // ── Cards with manual quiz data ───────────────────────────────────────────
    // Lock to manual type only when a single type is selected (includes "Your Quiz" / MC-only).
    // Mixed / Randomized (preferredTypes.length > 1) lets all cards rotate freely.
    if (hasQuizData(card) && !overrideManual && preferredTypes.length === 1) {
      const options = isFullCard(card) ? card.options : card.options!;
      const answerIndex = isFullCard(card) ? card.answerIndex : card.answerIndex!;
      const question = isFullCard(card) ? card.question : card.front;
      const correctAnswer = options[answerIndex];
      const explanation = isFullCard(card) ? card.explanation : (card.explanation ?? card.back);
      const isHtml = card.type === "full";

      // 1 option → identification; 2+ options → multiple choice
      if (options.length === 1) {
        return [{
          cardId: card.id,
          type: "identification" as QuestionType,
          question,
          correctAnswer,
          explanation: explanation ?? correctAnswer,
          isHtml,
          isGenerated: false,
        }];
      }

      return [{
        cardId: card.id,
        type: "mc" as QuestionType,
        question,
        correctAnswer,
        options: [...options],
        answerIndex,
        explanation,
        isHtml,
        isGenerated: false,
      }];
    }

    // ── Auto-generate (plain cards, overridden full cards, or mixed-mode quiz-data cards) ──
    const correctAnswer = isFullCard(card)
      ? card.options[card.answerIndex]
      : hasQuizData(card)
        ? card.options![card.answerIndex!]
        : card.back;
    const question = isFullCard(card) ? card.question : card.front;
    const explanation = isFullCard(card)
      ? card.explanation
      : (card.explanation ?? card.back);
    const cardIsHtml = isFullCard(card) || !!(card as SimpleCard).isHtml;

    // Exclude the current card AND any empty-back cards (e.g. cloze cards with no back)
    const otherAnswers = allAnswers.filter((ans, i) => i !== idx && ans.trim() !== "");
    const canDoMC = otherAnswers.length >= 1;

    // Determine available types based on preference and deck size
    // (exclude "cloze" from auto-gen rotation — cloze is always explicit)
    const available = preferredTypes.filter((t) => {
      if (t === "cloze") return false;
      if (t === "mc") return canDoMC;
      if (t === "tf") return otherAnswers.length >= 1;
      return true; // identification always possible
    });
    const pool = available.length > 0 ? available : ["identification" as QuestionType];

    // Rotate or randomly pick from pool
    const type: QuestionType = randomize
      ? pool[Math.floor(Math.random() * pool.length)]
      : pool[idx % pool.length];

    if (type === "mc") {
      const distractors = shuffleArray(otherAnswers).slice(0, Math.min(3, otherAnswers.length));
      const allOptions = shuffleArray([correctAnswer, ...distractors]);
      const answerIndex = allOptions.indexOf(correctAnswer);
      return [{
        cardId: card.id,
        type: "mc",
        question,
        correctAnswer,
        options: allOptions,
        answerIndex,
        explanation: correctAnswer,
        isHtml: cardIsHtml, // question text may be HTML; options are plain text but render safely
        isGenerated: true,
      }];
    }

    if (type === "tf") {
      const showCorrect = idx % 3 !== 0; // ~66% true, ~33% false for variety
      const displayedAnswer = showCorrect
        ? correctAnswer
        : shuffleArray(otherAnswers)[0] ?? correctAnswer;
      const isActuallyTrue = displayedAnswer === correctAnswer;
      return [{
        cardId: card.id,
        type: "tf",
        question,
        correctAnswer,
        options: ["True", "False"],
        answerIndex: isActuallyTrue ? 0 : 1,
        displayedAnswer,
        explanation,
        isHtml: cardIsHtml,
        isGenerated: true,
      }];
    }

    // identification
    return [{
      cardId: card.id,
      type: "identification",
      question,
      correctAnswer,
      explanation,
      isHtml: cardIsHtml,
      isGenerated: true,
    }];
  });
}

export function timeAgo(ts: string | number): string {
  const now = Date.now();
  const then = typeof ts === "string" ? new Date(ts).getTime() : ts;
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
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
