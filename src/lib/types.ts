export type Category = string;

export type ConfidenceRating = "easy" | "hard";
export type AnswerResult = "correct" | "incorrect";

// ─── Cards ───────────────────────────────────────────────────────────────────

/** Built-in cards: support full MC quiz + flashcard modes. Content is HTML. */
export interface FullCard {
  id: string;
  type: "full";
  category: Category;
  front: string;       // HTML (same as question)
  back: string;        // HTML (same as explanation)
  question: string;    // HTML
  options: [string, string, string, string];
  answerIndex: 0 | 1 | 2 | 3;
  explanation: string; // HTML
}

/** Custom user-created cards: plain text, optional MC upgrade. */
export interface SimpleCard {
  id: string;
  type: "simple";
  category: Category;
  front: string;       // plain text
  back: string;        // plain text
  options?: [string, string, string, string];
  answerIndex?: 0 | 1 | 2 | 3;
  explanation?: string;
}

export type Card = FullCard | SimpleCard;

export function isFullCard(card: Card): card is FullCard {
  return card.type === "full";
}

export function hasQuizData(card: Card): boolean {
  if (card.type === "full") return true;
  return !!(
    card.options &&
    card.options.length === 4 &&
    card.answerIndex !== undefined
  );
}

// ─── Deck ────────────────────────────────────────────────────────────────────

export interface Deck {
  id: string;
  name: string;
  description: string;
  createdAt: string; // ISO 8601
  isBuiltIn: boolean;
  categories: Category[]; // derived from cards
  cards: Card[];
}

// ─── Progress ────────────────────────────────────────────────────────────────

export interface QuizProgress {
  deckId: string;
  startedAt: string;
  completedAt: string | null;
  answers: Record<string, number>;       // cardId → chosen option index
  results: Record<string, AnswerResult>; // cardId → correct/incorrect
  score: number;
  total: number;
  activeCategory: Category | null;
}

export interface FlashcardProgress {
  deckId: string;
  lastStudiedAt: string;
  confidence: Record<string, ConfidenceRating>; // cardId → rating
  seen: string[];        // cardIds seen this session
  currentIndex: number;
}

// ─── localStorage root ───────────────────────────────────────────────────────

export interface KwekStorage {
  schemaVersion: number;
  customDecks: Deck[];
  quizProgress: Record<string, QuizProgress>;
  flashcardProgress: Record<string, FlashcardProgress>;
}
