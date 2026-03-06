export type Category = string;
export type Theme = 'default' | 'dark' | 'pink';
export type QuestionType = "mc" | "tf" | "identification";

export interface GeneratedQuestion {
  cardId: string;
  type: QuestionType;
  question: string;          // card.front (or card.question for FullCard)
  correctAnswer: string;     // card.back (or correct option for FullCard)
  options?: string[];        // MC: 4 items, TF: ["True", "False"]
  answerIndex?: number;      // correct option index for MC and TF
  displayedAnswer?: string;  // TF only: the answer being evaluated
  explanation?: string;      // shown after answering
  isHtml?: boolean;          // true for FullCard content
  isGenerated: boolean;      // true if auto-generated
}
export type ConfidenceRating = "easy" | "hard";
export type AnswerResult = "correct" | "incorrect";

// ─── Themes ──────────────────────────────────────────────────────────────────
export interface Settings {
  theme: Theme;
  showConfidence: boolean;
  autoFlipSeconds: number | null; // null = off
}

export const DEFAULT_SETTINGS: Settings = {
  theme: 'default',
  showConfidence: true,
  autoFlipSeconds: null,
}

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

/** Custom user-created cards: plain text, optional quiz upgrade.
 *  options.length === 1  → identification (single correct answer to type)
 *  options.length >= 2   → multiple choice
 */
export interface SimpleCard {
  id: string;
  type: "simple";
  category: Category;
  front: string;       // plain text
  back: string;        // plain text
  options?: string[];  // 1 = identification, 2–4 = multiple choice
  answerIndex?: number;
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
    card.options.length >= 1 &&
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