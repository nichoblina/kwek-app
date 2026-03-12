"use client";

import { useState, useEffect, useCallback } from "react";
import type { Card, ConfidenceRating } from "@/lib/types";
import { isFullCard } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";

interface FlashCardViewProps {
  card: Card;
  cardIndex: number;
  total: number;
  onNext: () => void;
  onPrev: () => void;
  onConfidence: (rating: ConfidenceRating) => void;
  existingConfidence?: ConfidenceRating;
  autoFlipSeconds?: number | null;
}

export function FlashCardView({
  card,
  cardIndex,
  total,
  onNext,
  onPrev,
  onConfidence,
  existingConfidence,
  autoFlipSeconds,
}: FlashCardViewProps) {
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    setFlipped(false);
  }, [card.id]);

  // Auto-flip: start a timer when a new (unflipped) card appears
  useEffect(() => {
    if (!autoFlipSeconds || flipped) return;
    const timer = setTimeout(() => setFlipped(true), autoFlipSeconds * 1000);
    return () => clearTimeout(timer);
  }, [card.id, flipped, autoFlipSeconds]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (e.code === "ArrowRight") {
        onNext();
      } else if (e.code === "ArrowLeft") {
        onPrev();
      }
    },
    [onNext, onPrev]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const frontContent = card.front;
  const backContent = isFullCard(card) ? card.explanation : card.back;
  const isHtml = card.type === "full";
  const confidence = existingConfidence;

  return (
    <div className="flex flex-col items-center">
      {/* Card counter */}
      <div className="w-full flex justify-between items-center mb-4">
        <div className="font-mono text-[0.7rem] font-semibold uppercase tracking-widest text-muted">
          {cardIndex + 1} / {total}
        </div>
        <Badge category={card.category} size="sm" />
      </div>

      {/* Flip card */}
      <div
        className="w-full cursor-pointer select-none"
        style={{ perspective: "1200px" }}
        onClick={() => setFlipped((f) => !f)}
        role="button"
        tabIndex={0}
        aria-label={flipped ? "Show front" : "Show back (click to flip)"}
        onKeyDown={(e) => e.key === "Enter" && setFlipped((f) => !f)}
      >
        <div
          className="flip-card-inner relative w-full"
          style={{
            transformStyle: "preserve-3d",
            transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            minHeight: "240px",
          }}
        >
          {/* Front face */}
          <div
            className="flip-card-face absolute inset-0 rounded-2xl border-[1.5px] border-border bg-card p-7 flex flex-col justify-center overflow-hidden"
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
              {autoFlipSeconds
                ? <span className="text-secondary font-semibold">Auto-flipping…</span>
                : <>Click or press <kbd className="font-mono bg-surface px-1.5 py-0.5 rounded text-xs">Space</kbd> to flip</>
              }
            </div>

            {/* Auto-flip countdown bar */}
            {autoFlipSeconds && !flipped && (
              <div
                key={`timer-${card.id}-${autoFlipSeconds}`}
                className="absolute bottom-0 left-0 h-[3px] bg-secondary"
                style={{ animation: `timerShrink ${autoFlipSeconds}s linear forwards` }}
              />
            )}
          </div>

          {/* Back face */}
          <div
            className="flip-card-face flip-card-back absolute inset-0 rounded-2xl border-[1.5px] border-border bg-surface p-7 flex flex-col justify-center"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
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

      {/* Confidence buttons — dynamic states require inline style */}
      <div
        className={`w-full mt-5 transition-all duration-300 ${
          flipped ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
        }`}
      >
        <p className="text-center text-[0.75rem] text-muted font-medium mb-3">
          How well did you know this?
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => { onConfidence("hard"); onNext(); }}
            className="flex-1 max-w-[160px] py-2.5 rounded-xl border-[1.5px] font-semibold text-sm transition-all duration-150 cursor-pointer hover:opacity-80"
            style={{
              borderColor: "var(--color-primary)",
              background: confidence === "hard" ? "var(--color-primary)" : "rgba(232,114,26,0.07)",
              color: confidence === "hard" ? "white" : "var(--color-primary)",
            }}
          >
            Hard
          </button>
          <button
            onClick={() => { onConfidence("easy"); onNext(); }}
            className="flex-1 max-w-[160px] py-2.5 rounded-xl border-[1.5px] font-semibold text-sm transition-all duration-150 cursor-pointer hover:opacity-80"
            style={{
              borderColor: "var(--color-green)",
              background: confidence === "easy" ? "var(--color-green)" : "rgba(42,157,92,0.07)",
              color: confidence === "easy" ? "white" : "var(--color-green)",
            }}
          >
            Easy
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between w-full mt-5">
        <button
          onClick={onPrev}
          disabled={cardIndex === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm text-text-primary transition-all duration-150 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface"
        >
          ← Prev
        </button>

        {/* Dot indicators — driven by index comparison, must stay inline */}
        <div className="flex gap-1.5 flex-wrap justify-center max-w-[200px]">
          {Array.from({ length: Math.min(total, 15) }).map((_, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full transition-all duration-200"
              style={{
                background:
                  i === cardIndex
                    ? "var(--color-text-primary)"
                    : i < cardIndex
                    ? "var(--color-muted)"
                    : "var(--color-border)",
              }}
            />
          ))}
          {total > 15 && (
            <span className="text-[0.65rem] text-muted font-mono">+{total - 15}</span>
          )}
        </div>

        <button
          onClick={onNext}
          disabled={cardIndex === total - 1}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm text-text-primary transition-all duration-150 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
