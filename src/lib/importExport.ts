import type { Card, Deck, FullCard, SimpleCard } from "./types";
import { generateId } from "./utils";

export const KWEK_VERSION = 1;

export interface KwekExportFile {
  kwekVersion: number;
  exportedAt: string;
  deck: {
    name: string;
    description: string;
    cards: Card[];
  };
}

// ─── Export ───────────────────────────────────────────────────────────────────

export function exportDeck(deck: Deck): void {
  const payload: KwekExportFile = {
    kwekVersion: KWEK_VERSION,
    exportedAt: new Date().toISOString(),
    deck: {
      name: deck.name,
      description: deck.description,
      cards: deck.cards,
    },
  };

  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${deck.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.kwek.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Import ───────────────────────────────────────────────────────────────────

function coerceCard(raw: unknown, index: number): Card {
  if (!raw || typeof raw !== "object") {
    throw new Error(`Card at index ${index} is not a valid object`);
  }
  const c = raw as Record<string, unknown>;

  if (typeof c.front !== "string" || !c.front.trim()) {
    throw new Error(`Card at index ${index} is missing a "front" field`);
  }

  const id = generateId();
  const category =
    typeof c.category === "string" && c.category.trim()
      ? c.category.trim()
      : "general";
  const front = c.front.trim();
  const back = typeof c.back === "string" ? c.back.trim() : "";

  // Preserve FullCard structure when exporting built-in decks
  if (
    c.type === "full" &&
    Array.isArray(c.options) &&
    c.options.length === 4 &&
    typeof c.answerIndex === "number" &&
    typeof c.question === "string" &&
    typeof c.explanation === "string"
  ) {
    const fullCard: FullCard = {
      id,
      type: "full",
      category,
      front,
      back,
      question: c.question,
      options: c.options.map(String) as [string, string, string, string],
      answerIndex: ([0, 1, 2, 3].includes(c.answerIndex as number)
        ? c.answerIndex
        : 0) as 0 | 1 | 2 | 3,
      explanation: c.explanation,
    };
    return fullCard;
  }

  // Default: SimpleCard (covers AI-generated content too)
  const card: SimpleCard = { id, type: "simple", category, front, back };
  if (Array.isArray(c.options) && c.options.length >= 1) {
    card.options = c.options.map((o) => String(o));
    card.answerIndex =
      typeof c.answerIndex === "number" ? c.answerIndex : 0;
  }
  if (typeof c.explanation === "string" && c.explanation.trim()) {
    card.explanation = c.explanation.trim();
  }

  return card;
}

export type ParsedDeckFile = {
  deck: Omit<Deck, "id" | "createdAt" | "isBuiltIn" | "categories">;
  /** True when the file's kwekVersion is ahead of this build. */
  versionMismatch: boolean;
};

/** Parses and validates a .kwek.json file.
 *  Returns the deck data plus a `versionMismatch` flag (never throws for version issues).
 *  Throws a human-readable Error on any other validation failure.
 */
export function parseDeckFile(json: string): ParsedDeckFile {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error("File is not valid JSON");
  }

  if (!parsed || typeof parsed !== "object") {
    throw new Error("Invalid file format");
  }

  const file = parsed as Record<string, unknown>;

  if (!file.kwekVersion || !file.deck) {
    throw new Error("Not a valid kwek export file — missing version or deck data");
  }

  const versionMismatch =
    typeof file.kwekVersion === "number" && file.kwekVersion > KWEK_VERSION;

  const deck = file.deck as Record<string, unknown>;

  if (typeof deck.name !== "string" || !deck.name.trim()) {
    throw new Error('Deck is missing a "name" field');
  }
  if (!Array.isArray(deck.cards)) {
    throw new Error('Deck is missing a "cards" array');
  }
  if (deck.cards.length === 0) {
    throw new Error("Deck has no cards");
  }

  const cards = deck.cards.map((card, i) => coerceCard(card, i));

  return {
    deck: {
      name: deck.name.trim(),
      description:
        typeof deck.description === "string" ? deck.description.trim() : "",
      cards,
    },
    versionMismatch,
  };
}
