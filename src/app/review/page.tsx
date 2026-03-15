"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useDecks } from "@/hooks/useDecks";
import { useReviewPlan } from "@/hooks/useReviewPlan";
import { getSRSData, setSRSCardData } from "@/lib/storage";
import { getInitialSRSData, isDue, computeNextSRS, todayStr } from "@/lib/srs";
import { isFullCard, type Card, type Deck, type SRSCardData, type SRSRating } from "@/lib/types";
import { hasCloze, blankAllCloze, getClozeAnswers } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { BookOpen, RotateCcw } from "lucide-react";

interface ReviewItem {
  card: Card;
  deck: Deck;
  data: SRSCardData;
}

// ─── Rating button config ──────────────────────────────────────────────────────

const RATINGS: { rating: SRSRating; label: string; key: string; color: string; bg: string }[] = [
  { rating: "again", label: "Again", key: "1", color: "var(--color-primary)",   bg: "rgba(232,114,26,0.07)" },
  { rating: "good",  label: "Good",  key: "2", color: "var(--color-secondary)", bg: "rgba(47,125,200,0.07)" },
  { rating: "easy",  label: "Easy",  key: "3", color: "var(--color-green)",     bg: "rgba(42,157,92,0.07)" },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Flip card ────────────────────────────────────────────────────────────────

function ReviewCard({
  item,
  onRate,
  sessionIdx,
  sessionTotal,
}: {
  item: ReviewItem;
  onRate: (rating: SRSRating) => void;
  sessionIdx: number;
  sessionTotal: number;
}) {
  const [flipped, setFlipped] = useState(false);

  useEffect(() => { setFlipped(false); }, [item.card.id, sessionIdx]);

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.code === "Space") { e.preventDefault(); setFlipped((f) => !f); return; }
      if (!flipped) return;
      if (e.key === "1") onRate("again");
      if (e.key === "2") onRate("good");
      if (e.key === "3") onRate("easy");
    },
    [flipped, onRate]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  const { card, deck } = item;
  const rawFront = card.front;
  const isClozeCard = !isFullCard(card) && hasCloze(rawFront);
  const frontContent = isClozeCard ? blankAllCloze(rawFront) : rawFront;
  const clozeAnswers = isClozeCard ? getClozeAnswers(rawFront) : [];
  const backContent = isClozeCard
    ? clozeAnswers.length === 1
      ? clozeAnswers[0]
      : clozeAnswers.map((a, i) => `${i + 1}. ${a}`).join("\n")
    : isFullCard(card) ? card.explanation : card.back;
  const isHtml = isFullCard(card) || (!isFullCard(card) && (card as import("@/lib/types").SimpleCard).isHtml) ? true : false;

  return (
    <div className="flex flex-col items-center">
      {/* Counter + deck badge */}
      <div className="w-full flex justify-between items-center mb-4">
        <div className="font-mono text-[0.7rem] font-semibold uppercase tracking-widest text-muted">
          {sessionIdx + 1} / {sessionTotal}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[0.7rem] font-semibold text-muted">{deck.name}</span>
          <Badge category={card.category} size="sm" />
        </div>
      </div>

      {/* Flip card */}
      <div
        className="w-full cursor-pointer select-none"
        style={{ perspective: "1200px" }}
        onClick={() => setFlipped((f) => !f)}
        role="button"
        tabIndex={0}
        aria-label={flipped ? "Show front" : "Show back"}
        onKeyDown={(e) => e.key === "Enter" && setFlipped((f) => !f)}
      >
        <div
          className="relative w-full"
          style={{
            transformStyle: "preserve-3d",
            transition: "transform 0.5s cubic-bezier(0.4,0,0.2,1)",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            minHeight: "240px",
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 rounded-2xl border-[1.5px] border-border bg-card p-7 flex flex-col justify-center overflow-hidden"
            style={{ backfaceVisibility: "hidden" }}
          >
            <div className="text-[0.65rem] font-mono font-semibold uppercase tracking-widest text-muted mb-4">
              Question
            </div>
            {isHtml ? (
              <div
                className="text-base font-semibold leading-relaxed text-text-primary"
                dangerouslySetInnerHTML={{ __html: frontContent }}
              />
            ) : (
              <div className="text-base font-semibold leading-relaxed text-text-primary whitespace-pre-wrap">
                {frontContent}
              </div>
            )}
            <div className="mt-6 text-[0.72rem] text-muted font-medium">
              Click or press{" "}
              <kbd className="font-mono bg-surface px-1.5 py-0.5 rounded text-xs">Space</kbd>{" "}
              to flip
            </div>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 rounded-2xl border-[1.5px] border-border bg-surface p-7 flex flex-col justify-center"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <div className="text-[0.65rem] font-mono font-semibold uppercase tracking-widest text-muted mb-4">
              Answer
            </div>
            {isHtml ? (
              <div
                className="text-sm font-medium leading-relaxed text-text-primary"
                dangerouslySetInnerHTML={{ __html: backContent }}
              />
            ) : (
              <div className="text-sm font-medium leading-relaxed text-text-primary whitespace-pre-wrap">
                {backContent}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rating buttons */}
      <div
        className={`w-full mt-5 transition-all duration-300 ${
          flipped ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
        }`}
      >
        <p className="text-center text-[0.75rem] text-muted font-medium mb-3">
          How well did you remember this?
        </p>
        <div className="flex gap-3 justify-center">
          {RATINGS.map(({ rating, label, key, color, bg }) => (
            <button
              key={rating}
              onClick={() => onRate(rating)}
              className="flex-1 max-w-[130px] py-2.5 rounded-xl border-[1.5px] font-semibold text-sm transition-all duration-150 cursor-pointer hover:opacity-80 flex items-center justify-center gap-2"
              style={{ borderColor: color, background: bg, color }}
            >
              {label}
              <kbd className="font-mono text-[0.6rem] px-1 py-0.5 rounded opacity-60" style={{ background: bg }}>
                {key}
              </kbd>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Inner page (needs useSearchParams) ───────────────────────────────────────

function ReviewPageInner() {
  const searchParams = useSearchParams();
  const isMistakesMode = searchParams.get("mistakes") === "1";

  const { allDecks, hydrated } = useDecks();
  const { reviewDeckIds } = useReviewPlan();

  const initialized = useRef(false);
  const [sessionQueue, setSessionQueue] = useState<ReviewItem[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [sessionReady, setSessionReady] = useState(false);
  const [mistakesBackHref, setMistakesBackHref] = useState<string | null>(null);

  useEffect(() => {
    document.title = isMistakesMode ? "Quiz Review · kwek" : "Review · kwek";
  }, [isMistakesMode]);

  // Build the session queue once after hydration
  useEffect(() => {
    if (!hydrated || initialized.current) return;
    initialized.current = true;

    const srsAll = getSRSData();

    if (isMistakesMode) {
      const raw = typeof window !== "undefined"
        ? sessionStorage.getItem("kwek:quiz-mistakes")
        : null;

      if (raw) {
        sessionStorage.removeItem("kwek:quiz-mistakes");
        const { entries, backHref } = JSON.parse(raw) as {
          entries: { deckId: string; cardId: string }[];
          backHref: string;
        };
        const queue: ReviewItem[] = [];
        for (const { deckId, cardId } of entries) {
          const deck = allDecks.find((d) => d.id === deckId);
          const card = deck?.cards.find((c) => c.id === cardId);
          if (deck && card) {
            const data = srsAll[deck.id]?.[card.id] ?? getInitialSRSData();
            queue.push({ card, deck, data });
          }
        }
        setMistakesBackHref(backHref);
        setSessionQueue(queue);
      }

      setSessionReady(true);
      return;
    }

    // Normal SRS mode — only due cards from enrolled decks
    const today = todayStr();
    const queue: ReviewItem[] = [];
    for (const deck of allDecks) {
      if (!reviewDeckIds.includes(deck.id)) continue;
      for (const card of deck.cards) {
        const data = srsAll[deck.id]?.[card.id] ?? getInitialSRSData();
        if (isDue(data)) {
          queue.push({ card, deck, data });
        }
      }
    }
    setSessionQueue(shuffle(queue));
    setSessionReady(true);
  }, [hydrated, allDecks, reviewDeckIds, isMistakesMode]);

  const handleRate = useCallback(
    (rating: SRSRating) => {
      const item = sessionQueue[currentIdx];
      if (!item) return;
      const next = computeNextSRS(item.data, rating);
      setSRSCardData(item.deck.id, item.card.id, next);
      if (rating === "again") {
        setSessionQueue((q) => [...q, { ...item, data: next }]);
      }
      setCurrentIdx((i) => i + 1);
      setReviewedCount((n) => n + 1);
    },
    [sessionQueue, currentIdx]
  );

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (!hydrated || !sessionReady) {
    return (
      <div className="max-w-2xl mx-auto px-5 py-10">
        <div className="text-muted text-sm font-medium">Loading…</div>
      </div>
    );
  }

  // ── No enrolled decks (SRS mode only) ────────────────────────────────────────
  if (!isMistakesMode && reviewDeckIds.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-5 py-10">
        <Link href="/" className="inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-text-primary transition-colors mb-8">
          ← Home
        </Link>
        <div className="text-center py-16">
          <BookOpen size={40} strokeWidth={1.5} className="mx-auto mb-4 text-muted" />
          <h2 className="text-xl font-bold text-text-primary mb-2">No decks in your review plan</h2>
          <p className="text-sm text-muted font-medium mb-6 max-w-xs mx-auto">
            Tap the <BookOpen size={13} strokeWidth={2} className="inline -mt-0.5" /> icon on any deck card to add it to your daily review.
          </p>
          <Link href="/" className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-sm border-[1.5px] border-border hover:border-primary transition-all">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // ── Empty queue ──────────────────────────────────────────────────────────────
  if (sessionQueue.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-5 py-10">
        <Link
          href={isMistakesMode ? (mistakesBackHref ?? "/") : "/"}
          className="inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-text-primary transition-colors mb-8"
        >
          {isMistakesMode ? "← Back to Quiz" : "← Home"}
        </Link>
        <div className="text-center py-16">
          <div className="text-4xl mb-4">{isMistakesMode ? "🎉" : "✓"}</div>
          <h2 className="text-xl font-bold text-text-primary mb-2">
            {isMistakesMode ? "No mistakes to review!" : "All caught up!"}
          </h2>
          <p className="text-sm text-muted font-medium mb-6">
            {isMistakesMode ? "You got every question right." : "No cards due today. Come back tomorrow."}
          </p>
          <Link
            href={isMistakesMode ? (mistakesBackHref ?? "/") : "/"}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-sm border-[1.5px] border-border hover:border-primary transition-all"
          >
            {isMistakesMode ? "← Back to Quiz" : "← Back to Home"}
          </Link>
        </div>
      </div>
    );
  }

  // ── Session done ─────────────────────────────────────────────────────────────
  if (currentIdx >= sessionQueue.length) {
    return (
      <div className="max-w-2xl mx-auto px-5 py-10">
        <Link
          href={isMistakesMode ? (mistakesBackHref ?? "/") : "/"}
          className="inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-text-primary transition-colors mb-8"
        >
          {isMistakesMode ? "← Back to Quiz" : "← Home"}
        </Link>
        <div className="text-center py-16">
          <div className="text-4xl mb-4">🎉</div>
          <h2 className="text-xl font-bold text-text-primary mb-2">
            {isMistakesMode ? "Review complete!" : "Session complete!"}
          </h2>
          <p className="text-sm text-muted font-medium mb-6">
            You reviewed {reviewedCount} card{reviewedCount !== 1 ? "s" : ""}
            {isMistakesMode ? " from your quiz mistakes." : " today."}
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {isMistakesMode ? (
              <Link
                href={mistakesBackHref ?? "/"}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-sm border-[1.5px] border-border hover:border-primary transition-all"
              >
                ← Back to Quiz
              </Link>
            ) : (
              <>
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-sm border-[1.5px] border-border hover:border-primary transition-all"
                >
                  ← Back to Home
                </Link>
                <button
                  onClick={() => {
                    initialized.current = false;
                    setCurrentIdx(0);
                    setReviewedCount(0);
                    setSessionReady(false);
                    setSessionQueue([]);
                  }}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-sm border-[1.5px] border-border hover:border-secondary transition-all"
                >
                  <RotateCcw size={14} strokeWidth={2.5} />
                  Review again
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Active review ────────────────────────────────────────────────────────────
  const currentItem = sessionQueue[currentIdx];
  const remaining = sessionQueue.length - currentIdx;

  return (
    <div className="max-w-2xl mx-auto px-5 py-10 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Link
          href={isMistakesMode ? (mistakesBackHref ?? "/") : "/"}
          className="text-sm font-semibold text-muted hover:text-text-primary transition-colors"
        >
          {isMistakesMode ? "← Back to Quiz" : "← Home"}
        </Link>
        <h1 className="font-bold text-base text-text-primary">
          {isMistakesMode ? "Quiz Review" : "Review"}
        </h1>
        <span className="font-mono text-[0.7rem] font-semibold uppercase tracking-widest text-muted">
          {remaining} left
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 rounded-full bg-border mb-8 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${(currentIdx / sessionQueue.length) * 100}%`,
            background: isMistakesMode ? "var(--color-primary)" : "var(--color-secondary)",
          }}
        />
      </div>

      <ReviewCard
        key={`${currentItem.card.id}-${currentIdx}`}
        item={currentItem}
        onRate={handleRate}
        sessionIdx={currentIdx}
        sessionTotal={sessionQueue.length}
      />

      {/* Keyboard hint */}
      <p className="text-center text-[0.7rem] text-muted font-medium mt-6">
        After flipping —{" "}
        <kbd className="font-mono bg-surface px-1 py-0.5 rounded">1</kbd> Again{" "}
        <kbd className="font-mono bg-surface px-1 py-0.5 rounded">2</kbd> Good{" "}
        <kbd className="font-mono bg-surface px-1 py-0.5 rounded">3</kbd> Easy
      </p>
    </div>
  );
}

// ─── Page wrapper (Suspense required for useSearchParams) ─────────────────────

export default function ReviewPage() {
  return (
    <Suspense fallback={
      <div className="max-w-2xl mx-auto px-5 py-10">
        <div className="text-muted text-sm font-medium">Loading…</div>
      </div>
    }>
      <ReviewPageInner />
    </Suspense>
  );
}
