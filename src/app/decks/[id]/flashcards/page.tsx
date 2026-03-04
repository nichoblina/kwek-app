"use client";

import { use, useState, useMemo } from "react";
import Link from "next/link";
import { useDecks } from "@/hooks/useDecks";
import { useFlashcardProgress } from "@/hooks/useFlashcardProgress";
import { FlashCardView } from "@/components/flashcard/FlashCardView";
import { CategoryFilter } from "@/components/ui/CategoryFilter";
import { shuffleArray } from "@/lib/utils";
import type { Category, ConfidenceRating } from "@/lib/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function FlashcardsPage({ params }: PageProps) {
  const { id } = use(params);
  const { getDeckById, hydrated } = useDecks();
  const deck = getDeckById(id);

  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [shuffled, setShuffled] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const { progress, rateConfidence, resetProgress } = useFlashcardProgress(id);

  const filteredCards = useMemo(() => {
    if (!deck) return [];
    const cards = activeCategory
      ? deck.cards.filter((c) => c.category === activeCategory)
      : deck.cards;
    return shuffled ? shuffleArray(cards) : cards;
  }, [deck, activeCategory, shuffled]);

  if (!hydrated) {
    return (
      <div className="max-w-3xl mx-auto px-5 py-10">
        <div className="text-muted text-sm">Loading…</div>
      </div>
    );
  }

  if (!deck) {
    return (
      <div className="max-w-3xl mx-auto px-5 py-10">
        <Link href="/" className="font-mono text-[0.7rem] font-semibold uppercase tracking-widest text-muted hover:text-text-primary">
          ← Home
        </Link>
        <p className="mt-8 text-muted">Deck not found.</p>
      </div>
    );
  }

  const card = filteredCards[currentIndex];

  const easyCount = Object.values(progress.confidence).filter((v) => v === "easy").length;
  const hardCount = Object.values(progress.confidence).filter((v) => v === "hard").length;
  const seenCount = progress.seen.length;

  function handleCategoryChange(cat: Category | null) {
    setActiveCategory(cat);
    setCurrentIndex(0);
  }

  function handleConfidence(rating: ConfidenceRating) {
    if (!card) return;
    rateConfidence(card.id, rating);
  }

  return (
    <div className="max-w-3xl mx-auto px-5 py-10 pb-16">
      {/* Nav */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href={`/decks/${id}`}
          className="font-mono text-[0.7rem] font-semibold uppercase tracking-widest text-muted hover:text-text-primary transition-colors"
        >
          ← {deck.name}
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setShuffled((s) => !s);
              setCurrentIndex(0);
            }}
            className="font-mono text-[0.65rem] font-semibold uppercase tracking-wide px-3 py-1.5 rounded-full border-[1.5px] transition-all cursor-pointer"
            style={{
              borderColor: shuffled ? "var(--color-text-primary)" : "var(--color-border)",
              background: shuffled ? "var(--color-text-primary)" : "transparent",
              color: shuffled ? "var(--color-bg)" : "var(--color-muted)",
            }}
          >
            {shuffled ? "✓ Shuffled" : "Shuffle"}
          </button>
          <button
            onClick={() => { resetProgress(); setCurrentIndex(0); }}
            className="font-mono text-[0.65rem] font-semibold uppercase tracking-wide px-3 py-1.5 rounded-full border-[1.5px] border-border text-muted hover:border-text-primary hover:text-text-primary transition-all cursor-pointer"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="mb-6 pb-4 border-b border-border">
        <h1 className="text-xl font-extrabold tracking-tight text-text-primary">
          Flashcard Mode
          <span className="ml-2 text-base font-normal text-muted">— {deck.name}</span>
        </h1>

        {/* Session stats */}
        <div className="flex gap-4 mt-3 flex-wrap">
          <span className="text-[0.8rem] font-semibold text-muted">
            Seen: <strong className="text-text-primary">{seenCount}</strong>/{filteredCards.length}
          </span>
          <span className="text-[0.8rem] font-semibold text-green">
            Easy: {easyCount}
          </span>
          <span className="text-[0.8rem] font-semibold text-primary">
            Hard: {hardCount}
          </span>
        </div>
      </div>

      {/* Category filter */}
      <CategoryFilter
        categories={deck.categories}
        active={activeCategory}
        onChange={handleCategoryChange}
      />

      {/* Card */}
      {filteredCards.length === 0 ? (
        <div className="text-center py-16 text-muted text-sm">No cards in this category.</div>
      ) : (
        <FlashCardView
          card={card}
          cardIndex={currentIndex}
          total={filteredCards.length}
          onNext={() => {
            if (currentIndex < filteredCards.length - 1) {
              setCurrentIndex((i) => i + 1);
            }
          }}
          onPrev={() => {
            if (currentIndex > 0) setCurrentIndex((i) => i - 1);
          }}
          onConfidence={handleConfidence}
          existingConfidence={progress.confidence[card.id]}
        />
      )}

      {/* Completion message */}
      {currentIndex === filteredCards.length - 1 && filteredCards.length > 0 && (
        <div
          className="mt-6 rounded-2xl p-5 text-center fade-in-up"
          style={{ background: "rgba(42,157,92,0.07)", border: "1px solid rgba(42,157,92,0.2)" }}
        >
          <p className="font-bold text-sm text-green">
            You&apos;ve reached the end of this deck!
          </p>
          <div className="flex gap-3 justify-center mt-3">
            <button
              onClick={() => setCurrentIndex(0)}
              className="px-4 py-2 rounded-xl font-bold text-sm cursor-pointer hover:opacity-80 transition-opacity bg-green text-white"
            >
              Start Over
            </button>
            <Link
              href={`/decks/${id}`}
              className="px-4 py-2 rounded-xl font-bold text-sm border-[1.5px] border-border hover:bg-surface transition-colors text-text-primary"
            >
              Back to Deck
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
