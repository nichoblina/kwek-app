import type {
  KwekStorage,
  Deck,
  QuizProgress,
  FlashcardProgress,
  SRSCardData,
} from "./types";

const STORAGE_KEY = "kwek_data";
const SCHEMA_VERSION = 1;

const defaultStorage: KwekStorage = {
  schemaVersion: SCHEMA_VERSION,
  customDecks: [],
  quizProgress: {},
  flashcardProgress: {},
  starredDeckIds: [],
  reviewDeckIds: [],
  srsData: {},
};

function isClient(): boolean {
  return typeof window !== "undefined";
}

export function loadStorage(): KwekStorage {
  if (!isClient()) return { ...defaultStorage };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultStorage };
    const parsed = JSON.parse(raw) as KwekStorage;
    // Basic schema migration hook
    if (parsed.schemaVersion !== SCHEMA_VERSION) {
      return { ...defaultStorage };
    }
    // Backfill fields added after initial schema
    if (!parsed.starredDeckIds) parsed.starredDeckIds = [];
    if (!parsed.reviewDeckIds) parsed.reviewDeckIds = [];
    if (!parsed.srsData) parsed.srsData = {};
    return parsed;
  } catch {
    return { ...defaultStorage };
  }
}

function saveStorage(data: KwekStorage): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage might be full or unavailable
  }
}

// ─── Custom Decks ────────────────────────────────────────────────────────────

export function getCustomDecks(): Deck[] {
  return loadStorage().customDecks;
}

export function upsertCustomDeck(deck: Deck): void {
  const storage = loadStorage();
  const idx = storage.customDecks.findIndex((d) => d.id === deck.id);
  if (idx === -1) {
    storage.customDecks.push(deck);
  } else {
    storage.customDecks[idx] = deck;
  }
  saveStorage(storage);
}

export function deleteCustomDeck(deckId: string): void {
  const storage = loadStorage();
  storage.customDecks = storage.customDecks.filter((d) => d.id !== deckId);
  // Also clean up associated progress
  delete storage.quizProgress[deckId];
  delete storage.flashcardProgress[deckId];
  saveStorage(storage);
}

// ─── Starred Decks ────────────────────────────────────────────────────────────

export function getStarredDeckIds(): string[] {
  return loadStorage().starredDeckIds;
}

export const MAX_STARRED_DECKS = 3;

export function toggleStarredDeck(deckId: string): { ok: boolean; reason?: string } {
  const storage = loadStorage();
  const idx = storage.starredDeckIds.indexOf(deckId);
  if (idx === -1) {
    if (storage.starredDeckIds.length >= MAX_STARRED_DECKS) {
      const reason = `You can only pin up to ${MAX_STARRED_DECKS} decks`;
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("kwek:starred-error", { detail: { reason } }));
      }
      return { ok: false, reason };
    }
    storage.starredDeckIds.push(deckId);
  } else {
    storage.starredDeckIds.splice(idx, 1);
  }
  saveStorage(storage);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("kwek:starred-changed"));
  }
  return { ok: true };
}

// ─── Quiz Progress ────────────────────────────────────────────────────────────

export function getQuizProgress(deckId: string): QuizProgress | null {
  return loadStorage().quizProgress[deckId] ?? null;
}

export function saveQuizProgress(progress: QuizProgress): void {
  const storage = loadStorage();
  storage.quizProgress[progress.deckId] = progress;
  saveStorage(storage);
}

export function clearQuizProgress(deckId: string): void {
  const storage = loadStorage();
  delete storage.quizProgress[deckId];
  saveStorage(storage);
}

// ─── Flashcard Progress ───────────────────────────────────────────────────────

export function getFlashcardProgress(deckId: string): FlashcardProgress | null {
  return loadStorage().flashcardProgress[deckId] ?? null;
}

export function saveFlashcardProgress(progress: FlashcardProgress): void {
  const storage = loadStorage();
  storage.flashcardProgress[progress.deckId] = progress;
  saveStorage(storage);
}

export function clearFlashcardProgress(deckId: string): void {
  const storage = loadStorage();
  delete storage.flashcardProgress[deckId];
  saveStorage(storage);
}

// ─── Review Plan ─────────────────────────────────────────────────────────────

export function getReviewDeckIds(): string[] {
  return loadStorage().reviewDeckIds ?? [];
}

export function toggleReviewDeck(deckId: string): void {
  const storage = loadStorage();
  if (!storage.reviewDeckIds) storage.reviewDeckIds = [];
  const idx = storage.reviewDeckIds.indexOf(deckId);
  if (idx === -1) {
    storage.reviewDeckIds.push(deckId);
  } else {
    storage.reviewDeckIds.splice(idx, 1);
  }
  saveStorage(storage);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("kwek:review-changed"));
  }
}

// ─── SRS Data ─────────────────────────────────────────────────────────────────

export function getSRSData(): Record<string, Record<string, SRSCardData>> {
  return loadStorage().srsData ?? {};
}

export function setSRSCardData(deckId: string, cardId: string, data: SRSCardData): void {
  const storage = loadStorage();
  if (!storage.srsData) storage.srsData = {};
  if (!storage.srsData[deckId]) storage.srsData[deckId] = {};
  storage.srsData[deckId][cardId] = data;
  saveStorage(storage);
}

// ─── Last Studied ─────────────────────────────────────────────────────────────

export function getLastStudied(deckId: string): string | null {
  const storage = loadStorage();
  const quiz = storage.quizProgress[deckId];
  const flash = storage.flashcardProgress[deckId];

  const quizTs = quiz ? (quiz.completedAt ?? quiz.startedAt) : null;
  const flashTs = flash ? flash.lastStudiedAt : null;

  if (!quizTs && !flashTs) return null;
  if (!quizTs) return flashTs;
  if (!flashTs) return quizTs;
  return new Date(quizTs) > new Date(flashTs) ? quizTs : flashTs;
}
