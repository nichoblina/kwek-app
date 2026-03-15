"use client";

import { useState, useMemo, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useDecks } from "@/hooks/useDecks";
import { FlashCardView } from "@/components/flashcard/FlashCardView";
import { CategoryFilter } from "@/components/ui/CategoryFilter";
import { shuffleArray, getCategoryLabel } from "@/lib/utils";
import type { Card, ConfidenceRating } from "@/lib/types";
import { Timer, Star, Shuffle, Check } from "lucide-react";

const AUTO_FLIP_OPTIONS: (number | null)[] = [null, 3, 5, 10];

function CrossDeckFlashcardsInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { allDecks, hydrated } = useDecks();

  const selectedCats = useMemo(
    () => (searchParams.get("cats") ?? "").split(",").filter(Boolean),
    [searchParams]
  );

  // Redirect if no categories selected
  useEffect(() => {
    if (hydrated && selectedCats.length === 0) {
      router.replace("/study");
    }
  }, [hydrated, selectedCats.length, router]);

  // Aggregate cards + build deck name lookup
  const { sessionCards, cardDeckMap } = useMemo(() => {
    const map: Record<string, string> = {};
    const cards: Card[] = allDecks.flatMap((d) =>
      d.cards
        .filter((c) => selectedCats.includes(c.category))
        .map((c) => {
          map[c.id] = d.name;
          return c;
        })
    );
    return { sessionCards: cards, cardDeckMap: map };
  }, [allDecks, selectedCats]);

  // Session state (in-memory only)
  const [confidence, setConfidence] = useState<Record<string, ConfidenceRating>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffled, setShuffled] = useState(false);
  const [hardOnly, setHardOnly] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [autoFlipSeconds, setAutoFlipSeconds] = useState<number | null>(null);

  const hardCardCount = useMemo(() => {
    let cards = activeCategory
      ? sessionCards.filter((c) => c.category === activeCategory)
      : sessionCards;
    return cards.filter((c) => confidence[c.id] === "hard").length;
  }, [sessionCards, activeCategory, confidence]);

  const filteredCards = useMemo(() => {
    let cards = activeCategory
      ? sessionCards.filter((c) => c.category === activeCategory)
      : sessionCards;
    if (hardOnly) {
      cards = cards.filter((c) => confidence[c.id] === "hard");
    }
    return shuffled ? shuffleArray(cards) : cards;
  }, [sessionCards, activeCategory, shuffled, hardOnly, confidence]);

  // Keep currentIndex in bounds
  useEffect(() => {
    if (filteredCards.length > 0 && currentIndex >= filteredCards.length) {
      setCurrentIndex(filteredCards.length - 1);
    }
  }, [filteredCards.length, currentIndex]);

  // All unique categories across session cards (for CategoryFilter)
  const sessionCats = useMemo(
    () => [...new Set(sessionCards.map((c) => c.category))],
    [sessionCards]
  );

  useEffect(() => {
    const label = selectedCats.map(getCategoryLabel).join(", ");
    document.title = `Study: ${label} — Flashcards · kwek`;
  }, [selectedCats]);

  function cycleAutoFlip() {
    setAutoFlipSeconds((prev) => {
      const idx = AUTO_FLIP_OPTIONS.indexOf(prev);
      return AUTO_FLIP_OPTIONS[(idx + 1) % AUTO_FLIP_OPTIONS.length];
    });
  }

  function handleCategoryChange(cat: string | null) {
    setActiveCategory(cat);
    setCurrentIndex(0);
  }

  function handleConfidence(rating: ConfidenceRating) {
    const card = filteredCards[currentIndex];
    if (!card) return;
    setConfidence((prev) => ({ ...prev, [card.id]: rating }));
  }

  function handleReset() {
    setConfidence({});
    setCurrentIndex(0);
    setHardOnly(false);
  }

  const backHref = `/study?cats=${selectedCats.join(",")}`;

  if (!hydrated) {
    return (
      <div className="max-w-3xl mx-auto px-5 py-10">
        <div className="text-muted text-sm">Loading…</div>
      </div>
    );
  }

  const card = filteredCards[currentIndex];
  const easyCount = Object.values(confidence).filter((v) => v === "easy").length;
  const hardCount = Object.values(confidence).filter((v) => v === "hard").length;

  return (
    <div className="max-w-3xl mx-auto px-5 py-10 pb-16">
      {/* Nav */}
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <Link
          href={backHref}
          className="font-mono text-[0.7rem] font-semibold uppercase tracking-widest text-muted hover:text-text-primary transition-colors shrink-0"
        >
          ← Study
        </Link>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {/* Auto-flip */}
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

          {/* Hard only */}
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

          {/* Shuffle */}
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

          {/* Reset */}
          <button
            onClick={handleReset}
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
          <span className="ml-2 text-base font-normal text-muted">
            — {selectedCats.map(getCategoryLabel).join(", ")}
          </span>
        </h1>
        <div className="flex gap-4 mt-3 flex-wrap">
          <span className="text-[0.8rem] font-semibold text-green">Easy: {easyCount}</span>
          <span className="text-[0.8rem] font-semibold text-primary">Hard: {hardCount}</span>
        </div>
      </div>

      {/* Category filter (within-session) */}
      <CategoryFilter
        categories={sessionCats}
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
            "No cards match the current selection."
          )}
        </div>
      ) : (
        <>
          {/* Deck name badge */}
          {card && cardDeckMap[card.id] && (
            <p className="text-[0.7rem] font-mono font-semibold text-muted mb-3">
              {cardDeckMap[card.id]}
            </p>
          )}

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
            existingConfidence={card ? confidence[card.id] : undefined}
            autoFlipSeconds={autoFlipSeconds}
          />
        </>
      )}

      {/* Completion message */}
      {currentIndex === filteredCards.length - 1 && filteredCards.length > 0 && (
        <div
          className="mt-6 rounded-2xl p-5 text-center fade-in-up"
          style={{ background: "rgba(42,157,92,0.07)", border: "1px solid rgba(42,157,92,0.2)" }}
        >
          <p className="font-bold text-sm text-green">
            You&apos;ve reached the end of this session!
          </p>
          <div className="flex gap-3 justify-center mt-3">
            <button
              onClick={() => setCurrentIndex(0)}
              className="px-4 py-2 rounded-xl font-bold text-sm cursor-pointer hover:opacity-80 transition-opacity bg-green text-white"
            >
              Start Over
            </button>
            <Link
              href={backHref}
              className="px-4 py-2 rounded-xl font-bold text-sm border-[1.5px] border-border hover:bg-surface transition-colors text-text-primary"
            >
              Back to Study
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CrossDeckFlashcardsPage() {
  return (
    <Suspense fallback={<div className="max-w-3xl mx-auto px-5 py-10 text-muted text-sm">Loading…</div>}>
      <CrossDeckFlashcardsInner />
    </Suspense>
  );
}
