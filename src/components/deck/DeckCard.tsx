"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Deck } from "@/lib/types";
import { getCategoryColor, getCategoryLabel, timeAgo } from "@/lib/utils";
import { getLastStudied } from "@/lib/storage";
import { useStarredDecks } from "@/hooks/useStarredDecks";
import { Star, Clock } from "lucide-react";

interface DeckCardProps {
  deck: Deck;
}

export function DeckCard({ deck }: DeckCardProps) {
  const { isStarred, toggleStar } = useStarredDecks();
  const starred = isStarred(deck.id);
  const [lastStudied, setLastStudied] = useState<string | null>(null);

  useEffect(() => {
    setLastStudied(getLastStudied(deck.id));
  }, [deck.id]);

  const quizCount = deck.cards.filter((c) =>
    c.type === "full" || (c.options && c.options.length === 4 && c.answerIndex !== undefined)
  ).length;

  return (
    <div className="relative group/card h-full">
      <Link
        href={`/decks/${deck.id}`}
        className="flex flex-col h-full bg-card border-[1.5px] border-border rounded-2xl p-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 group pr-12"
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
        <div className="flex items-center gap-2 flex-wrap mt-auto">
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

        {/* Last studied */}
        {lastStudied && (
          <div className="flex items-center justify-end gap-1 mt-2">
            <Clock size={10} strokeWidth={2} className="text-muted" />
            <p className="text-[0.68rem] text-muted font-medium">
              {timeAgo(lastStudied)}
            </p>
          </div>
        )}
      </Link>

      {/* Star button — outside the Link to avoid nesting issues */}
      <button
        onClick={() => toggleStar(deck.id)}
        className="absolute top-4 right-4 p-1.5 rounded-lg transition-all cursor-pointer hover:bg-surface"
        aria-label={starred ? "Unpin deck" : "Pin deck"}
      >
        <Star
          size={16}
          strokeWidth={2}
          className="transition-colors"
          style={{
            fill: starred ? "var(--color-primary)" : "none",
            color: starred ? "var(--color-primary)" : "var(--color-muted)",
          }}
        />
      </button>
    </div>
  );
}
