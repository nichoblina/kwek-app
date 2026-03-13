"use client";

import { use, useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useDecks } from "@/hooks/useDecks";
import { useFlashcardProgress } from "@/hooks/useFlashcardProgress";
import { FlashCardView } from "@/components/flashcard/FlashCardView";
import { CategoryFilter } from "@/components/ui/CategoryFilter";
import { shuffleArray } from "@/lib/utils";
import type { Category, ConfidenceRating } from "@/lib/types";
import { Timer, Star, Shuffle, Check } from "lucide-react";

const AUTO_FLIP_OPTIONS: (number | null)[] = [null, 3, 5, 10];

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
  const [autoFlipSeconds, setAutoFlipSeconds] = useState<number | null>(null);
  const [hardOnly, setHardOnly] = useState(false);

  const { progress, markSeen, rateConfidence, resetProgress } = useFlashcardProgress(id);

  function cycleAutoFlip() {
    setAutoFlipSeconds((prev) => {
      const idx = AUTO_FLIP_OPTIONS.indexOf(prev);
      return AUTO_FLIP_OPTIONS[(idx + 1) % AUTO_FLIP_OPTIONS.length];
    });
  }

  // Count hard-rated cards in the current category filter
  const hardCardCount = useMemo(() => {
    if (!deck) return 0;
    const cards = activeCategory
      ? deck.cards.filter((c) => c.category === activeCategory)
      : deck.cards;
    return cards.filter((c) => progress.confidence[c.id] === "hard").length;
  }, [deck, activeCategory, progress.confidence]);

  const filteredCards = useMemo(() => {
    if (!deck) return [];
    let cards = activeCategory
      ? deck.cards.filter((c) => c.category === activeCategory)
      : deck.cards;
    if (hardOnly) {
      cards = cards.filter((c) => progress.confidence[c.id] === "hard");
    }
    return shuffled ? shuffleArray(cards) : cards;
  }, [deck, activeCategory, shuffled, hardOnly, progress.confidence]);

  // Keep currentIndex in bounds when filteredCards shrinks (e.g. hard card rated easy)
  useEffect(() => {
    if (filteredCards.length > 0 && currentIndex >= filteredCards.length) {
      setCurrentIndex(filteredCards.length - 1);
    }
  }, [filteredCards.length, currentIndex]);

  useEffect(() => {
    if (deck) document.title = `${deck.name} — Flashcards · kwek`;
  }, [deck?.name]);

  // Mark card as seen when navigating to it
  useEffect(() => {
    const current = filteredCards[currentIndex];
    if (current) markSeen(current.id);
  }, [currentIndex, filteredCards]); // eslint-disable-line react-hooks/exhaustive-deps

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
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <Link
          href={`/decks/${id}`}
          className="font-mono text-[0.7rem] font-semibold uppercase tracking-widest text-muted hover:text-text-primary transition-colors shrink-0"
        >
          ← {deck.name}
        </Link>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {/* Auto-flip: cycles through off → 3s → 5s → 10s */}
          <button
            onClick={cycleAutoFlip}
            className="flex items-center gap-1.5 font-mono text-[0.65rem] font-semibold uppercase tracking-wide px-3 py-1.5 rounded-full border-[1.5px] transition-all cursor-pointer"
            style={{
              borderColor: autoFlipSeconds ? "var(--color-secondary)" : "var(--color-border)",
              background: autoFlipSeconds ? "var(--color-secondary)" : "transparent",
              color: autoFlipSeconds ? "white" : "var(--color-muted)",
            }}
          >
            <Timer size={12} strokeWidth={2.5} />
            {autoFlipSeconds ? `${autoFlipSeconds}s` : "Auto"}
          </button>

          {/* Hard Only — visible when hard cards exist or already active */}
          {(hardCardCount > 0 || hardOnly) && (
            <button
              onClick={() => { setHardOnly((h) => !h); setCurrentIndex(0); }}
              className="flex items-center gap-1.5 font-mono text-[0.65rem] font-semibold uppercase tracking-wide px-3 py-1.5 rounded-full border-[1.5px] transition-all cursor-pointer"
              style={{
                borderColor: hardOnly ? "var(--color-primary)" : "var(--color-border)",
                background: hardOnly ? "rgba(232,114,26,0.1)" : "transparent",
                color: hardOnly ? "var(--color-primary)" : "var(--color-muted)",
              }}
            >
              <Star size={12} strokeWidth={2.5} style={{ fill: hardOnly ? "currentColor" : "none" }} />
              {hardOnly ? `Hard (${filteredCards.length})` : `Hard (${hardCardCount})`}
            </button>
          )}

          <button
            onClick={() => { setShuffled((s) => !s); setCurrentIndex(0); }}
            className="flex items-center gap-1.5 font-mono text-[0.65rem] font-semibold uppercase tracking-wide px-3 py-1.5 rounded-full border-[1.5px] transition-all cursor-pointer"
            style={{
              borderColor: shuffled ? "var(--color-text-primary)" : "var(--color-border)",
              background: shuffled ? "var(--color-text-primary)" : "transparent",
              color: shuffled ? "var(--color-bg)" : "var(--color-muted)",
            }}
          >
            {shuffled ? <Check size={12} strokeWidth={3} /> : <Shuffle size={12} strokeWidth={2.5} />}
            {shuffled ? "Shuffled" : "Shuffle"}
          </button>
          <button
            onClick={() => { resetProgress(); setCurrentIndex(0); setHardOnly(false); }}
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
        <div className="text-center py-16 text-muted text-sm">
          {hardOnly ? (
            <>
              <p className="font-semibold text-text-primary mb-1">No hard cards yet</p>
              <p>Rate some cards as Hard while studying, then come back here.</p>
            </>
          ) : (
            "No cards in this category."
          )}
        </div>
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
          autoFlipSeconds={autoFlipSeconds}
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
