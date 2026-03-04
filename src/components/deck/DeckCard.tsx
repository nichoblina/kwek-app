"use client";

import Link from "next/link";
import type { Deck } from "@/lib/types";
import { getCategoryColor, getCategoryLabel } from "@/lib/utils";

interface DeckCardProps {
  deck: Deck;
}

export function DeckCard({ deck }: DeckCardProps) {
  const quizCount = deck.cards.filter((c) =>
    c.type === "full" || (c.options && c.options.length === 4 && c.answerIndex !== undefined)
  ).length;

  return (
    <Link
      href={`/decks/${deck.id}`}
      className="block bg-card border-[1.5px] border-border rounded-2xl p-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg leading-tight text-text-primary group-hover:text-primary transition-colors duration-150 truncate">
            {deck.name}
          </h3>
          {deck.isBuiltIn && (
            <span
              className="inline-block font-mono text-[0.6rem] font-semibold uppercase tracking-wide mt-1 px-2 py-0.5 rounded-full"
              style={{ background: "rgba(47,125,200,0.1)", color: "var(--color-secondary)" }}
            >
              Built-in
            </span>
          )}
        </div>
      </div>

      {deck.description && (
        <p className="text-sm text-muted leading-relaxed mb-4 line-clamp-2">
          {deck.description}
        </p>
      )}

      {/* Stats */}
      <div className="flex items-center gap-4 mb-4 text-[0.8rem] text-muted font-medium">
        <span>{deck.cards.length} cards</span>
        {quizCount > 0 && quizCount < deck.cards.length && (
          <span>{quizCount} quiz-ready</span>
        )}
        {quizCount === deck.cards.length && deck.cards.length > 0 && (
          <span>Quiz + Flashcard</span>
        )}
        {quizCount === 0 && <span>Flashcard only</span>}
      </div>

      {/* Category dots */}
      <div className="flex items-center gap-2 flex-wrap">
        {deck.categories.map((cat) => (
          <div key={cat} className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: getCategoryColor(cat) }}
            />
            <span className="text-[0.72rem] font-semibold text-muted">
              {getCategoryLabel(cat)}
            </span>
          </div>
        ))}
      </div>
    </Link>
  );
}
