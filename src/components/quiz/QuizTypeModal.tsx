"use client";

import type { QuestionType } from "@/lib/types";

interface QuizTypeModalProps {
  onStart: (types: QuestionType[], randomize: boolean, customOnly?: boolean) => void;
  cardCount: number;
  customQuizCount: number;
}

const TYPES: { value: QuestionType; label: string; description: string; minCards: number }[] = [
  { value: "mc", label: "Multiple Choice", description: "Pick the correct answer from available options", minCards: 2 },
  { value: "tf", label: "True / False", description: "Evaluate whether an answer is correct", minCards: 2 },
  { value: "identification", label: "Identification", description: "Type the answer from memory", minCards: 1 },
];

export function QuizTypeModal({ onStart, cardCount, customQuizCount }: QuizTypeModalProps) {
  const availableTypes = TYPES.filter((t) => cardCount >= t.minCards).map((t) => t.value);

  return (
    <div className="bg-card border-[1.5px] border-border rounded-2xl p-8 mb-8">
      <h2 className="font-bold text-lg text-text-primary mb-1">Choose question types</h2>
      <p className="text-sm text-muted mb-6">Select one, mix, or go fully randomized.</p>

      {/* Your Quiz — only shown when the deck has manually authored questions */}
      {customQuizCount > 0 && (
        <>
          <button
            onClick={() => onStart(["mc"], false, true)}
            className="w-full flex items-center justify-between px-4 py-4 rounded-xl border-[1.5px] border-primary bg-bg hover:bg-surface transition-all group mb-3 text-left"
          >
            <div>
              <p className="font-semibold text-sm text-primary">Your Quiz</p>
              <p className="text-xs text-muted mt-0.5">
                {customQuizCount} custom question{customQuizCount !== 1 ? "s" : ""} you created
              </p>
            </div>
            <span className="font-mono text-xs text-primary">→</span>
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs font-mono text-muted uppercase tracking-widest">or generate</span>
            <div className="flex-1 h-px bg-border" />
          </div>
        </>
      )}

      <div className="flex flex-col gap-3 mb-8">
        {TYPES.map((t) => {
          const disabled = cardCount < t.minCards;
          return (
            <button
              key={t.value}
              disabled={disabled}
              onClick={() => onStart([t.value], false)}
              className={`flex items-center justify-between px-4 py-4 rounded-xl border-[1.5px] text-left transition-all group ${
                disabled
                  ? "border-border bg-bg opacity-40 cursor-not-allowed"
                  : "border-border bg-bg hover:border-primary hover:bg-surface cursor-pointer"
              }`}
            >
              <div>
                <p className={`font-semibold text-sm transition-colors ${disabled ? "text-muted" : "text-text-primary group-hover:text-primary"}`}>
                  {t.label}
                  {disabled && <span className="ml-2 font-mono text-[0.65rem] uppercase tracking-wide">— needs {t.minCards}+ cards</span>}
                </p>
                <p className="text-xs text-muted mt-0.5">{t.description}</p>
              </div>
              {!disabled && (
                <span className="font-mono text-xs text-muted group-hover:text-primary transition-colors">→</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs font-mono text-muted uppercase tracking-widest">or</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Mixed and randomized */}
      <div className="flex gap-3">
        <button
          onClick={() => onStart(availableTypes, false)}
          className="flex-1 py-3 rounded-xl border-[1.5px] border-border bg-bg font-bold text-sm hover:border-primary hover:bg-surface transition-all"
        >
          Mixed
        </button>
        <button
          onClick={() => onStart(availableTypes, true)}
          className="flex-1 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:opacity-80 transition-opacity border-[1.5px] border-transparent"
        >
          ✦ Randomized
        </button>
      </div>
    </div>
  );
}
