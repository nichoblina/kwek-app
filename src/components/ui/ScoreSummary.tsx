"use client";

import { getScoreTier } from "@/lib/utils";
import Link from "next/link";
import { RotateCcw, ChevronLeft, BookOpen } from "lucide-react";

interface ScoreSummaryProps {
  score: number;
  total: number;
  deckId: string;
  deckName: string;
  onRestart: () => void;
  backHref?: string;
  backLabel?: string;
  wrongCount?: number;
  onReviewMistakes?: () => void;
}

export function ScoreSummary({
  score,
  total,
  deckId,
  deckName,
  onRestart,
  backHref,
  backLabel,
  wrongCount,
  onReviewMistakes,
}: ScoreSummaryProps) {
  const pct = total === 0 ? 0 : Math.round((score / total) * 100);
  const tier = getScoreTier(score, total);
  const incorrect = total - score;

  return (
    <div className="rounded-2xl p-8 mb-6 animate-[fadeInUp_0.3s_ease]" style={{ background: "var(--color-score-card)", color: "var(--color-score-card-text)" }}>
      <div
        className="text-[3.5rem] font-extrabold leading-none tracking-tight"
        style={{ color: tier.color }}
      >
        {score}/{total}
      </div>
      <div className="text-sm mt-1 font-semibold opacity-70">
        {pct}% · {tier.label}
      </div>

      <div className="flex gap-6 mt-5 flex-wrap">
        <div className="text-sm font-semibold">
          Correct: <strong className="text-green">{score}</strong>
        </div>
        <div className="text-sm font-semibold">
          Incorrect: <strong className="text-primary">{incorrect}</strong>
        </div>
        <div className="text-sm font-semibold">
          Total: <strong>{total}</strong>
        </div>
      </div>

      <div className="flex gap-3 mt-6 flex-wrap">
        <button
          onClick={onRestart}
          className="flex items-center gap-2 px-5 py-2 rounded-lg font-bold text-sm cursor-pointer transition-opacity hover:opacity-80"
          style={{ background: "var(--color-score-card-text)", color: "var(--color-score-card)" }}
        >
          <RotateCcw size={14} strokeWidth={2.5} />
          Retake Quiz
        </button>
        {wrongCount != null && wrongCount > 0 && onReviewMistakes && (
          <button
            onClick={onReviewMistakes}
            className="flex items-center gap-2 px-5 py-2 rounded-lg font-bold text-sm cursor-pointer transition-opacity hover:opacity-80"
            style={{ background: "rgba(255,255,255,0.12)" }}
          >
            <BookOpen size={14} strokeWidth={2.5} />
            Review {wrongCount} Mistake{wrongCount !== 1 ? "s" : ""}
          </button>
        )}
        <Link
          href={backHref ?? `/decks/${deckId}`}
          className="flex items-center gap-1.5 px-5 py-2 rounded-lg font-bold text-sm transition-opacity hover:opacity-80 text-bg"
          style={{ background: "rgba(255,255,255,0.12)" }}
        >
          <ChevronLeft size={14} strokeWidth={2.5} />
          {backLabel ?? `Back to ${deckName}`}
        </Link>
      </div>
    </div>
  );
}
