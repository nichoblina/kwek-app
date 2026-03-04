"use client";

import type { Card } from "@/lib/types";
import { isFullCard } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";

const LETTERS = ["A", "B", "C", "D"] as const;

interface QuizCardViewProps {
  card: Card;
  questionNumber: number;
  total: number;
  answered: number | null;
  onAnswer: (index: number) => void;
}

export function QuizCardView({
  card,
  questionNumber,
  total,
  answered,
  onAnswer,
}: QuizCardViewProps) {
  const isAnswered = answered !== null;

  const question = isFullCard(card) ? card.question : card.front;
  const options = (isFullCard(card) ? card.options : card.options) ?? [];
  const answerIndex = isFullCard(card) ? card.answerIndex : card.answerIndex ?? 0;
  const explanation = isFullCard(card) ? card.explanation : card.explanation ?? card.back;
  const isHtml = card.type === "full";
  const correctAnswer = isAnswered && answered === answerIndex;

  // Dynamic per-option state — inline styles required
  function getOptionStyle(i: number): React.CSSProperties {
    if (!isAnswered) return {};
    if (i === answerIndex)
      return { borderColor: "var(--color-green)", background: "rgba(42,157,92,0.07)" };
    if (i === answered && answered !== answerIndex)
      return { borderColor: "var(--color-primary)", background: "rgba(232,114,26,0.07)" };
    return {};
  }

  function getLetterStyle(i: number): React.CSSProperties {
    if (!isAnswered) return { background: "var(--color-border)" };
    if (i === answerIndex) return { background: "var(--color-green)", color: "white" };
    if (i === answered && answered !== answerIndex)
      return { background: "var(--color-primary)", color: "white" };
    return { background: "var(--color-border)" };
  }

  return (
    <div
      className="bg-card border-[1.5px] border-border rounded-2xl p-7 mb-5 relative overflow-hidden"
      style={{
        borderLeft: isAnswered
          ? `4px solid ${correctAnswer ? "var(--color-green)" : "var(--color-primary)"}`
          : "4px solid var(--color-border)",
      }}
    >
      {/* Meta row */}
      <div className="flex items-center gap-2.5 mb-4">
        <span className="font-mono text-[0.65rem] font-semibold text-muted uppercase tracking-widest">
          Q{questionNumber}
        </span>
        <Badge category={card.category} size="sm" />
        <span className="font-mono text-[0.6rem] text-muted ml-auto">
          {questionNumber} / {total}
        </span>
      </div>

      {/* Question */}
      {isHtml ? (
        <div
          className="text-base font-semibold leading-relaxed mb-5 text-text-primary"
          dangerouslySetInnerHTML={{ __html: question }}
        />
      ) : (
        <div className="text-base font-semibold leading-relaxed mb-5 text-text-primary">
          {question}
        </div>
      )}

      {/* Options */}
      <div className="flex flex-col gap-2">
        {options.map((opt, i) => (
          <button
            key={i}
            disabled={isAnswered}
            onClick={() => onAnswer(i)}
            className="flex items-start gap-3 px-4 py-3 rounded-xl border-[1.5px] border-border bg-bg text-left w-full font-sans transition-all duration-150 cursor-pointer disabled:cursor-default hover:enabled:border-text-primary hover:enabled:bg-surface"
            style={getOptionStyle(i)}
          >
            <span
              className="font-mono text-[0.68rem] font-bold w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-all duration-150"
              style={getLetterStyle(i)}
            >
              {LETTERS[i]}
            </span>
            {isHtml ? (
              <span
                className="text-sm font-medium leading-snug text-text-primary"
                dangerouslySetInnerHTML={{ __html: opt }}
              />
            ) : (
              <span className="text-sm font-medium leading-snug text-text-primary">
                {opt}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Explanation */}
      {isAnswered && (
        <div
          className="mt-4 px-4 py-3.5 rounded-xl text-sm leading-relaxed fade-in-up"
          style={{
            background: correctAnswer ? "rgba(42,157,92,0.07)" : "rgba(232,114,26,0.06)",
            border: `1px solid ${correctAnswer ? "rgba(42,157,92,0.2)" : "rgba(232,114,26,0.2)"}`,
            color: correctAnswer ? "#1a5c38" : "#7a3a08",
          }}
        >
          <div className="font-mono font-bold text-[0.7rem] uppercase tracking-wider mb-1.5">
            {correctAnswer ? "✓ Correct" : "✗ Incorrect"}
          </div>
          {isHtml ? (
            <div dangerouslySetInnerHTML={{ __html: explanation }} />
          ) : (
            <div>{explanation}</div>
          )}
        </div>
      )}
    </div>
  );
}
