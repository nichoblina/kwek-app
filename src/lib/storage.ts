import type {
  KwekStorage,
  Deck,
  QuizProgress,
  FlashcardProgress,
} from "./types";

const STORAGE_KEY = "kwek_data";
const SCHEMA_VERSION = 1;

const defaultStorage: KwekStorage = {
  schemaVersion: SCHEMA_VERSION,
  customDecks: [],
  quizProgress: {},
  flashcardProgress: {},
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
