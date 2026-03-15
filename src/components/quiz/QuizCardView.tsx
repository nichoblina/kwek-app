"use client";

import { useState } from "react";
import type { GeneratedQuestion } from "@/lib/types";
import type { AnswerRecord } from "@/app/decks/[id]/quiz/page";
import { Check, X } from "lucide-react";

const LETTERS = ["A", "B", "C", "D"] as const;

interface QuizCardViewProps {
  question: GeneratedQuestion;
  questionNumber: number;
  total: number;
  answered: AnswerRecord | null;
  onAnswer: (value: number | string, isCorrect: boolean) => void;
}

export function QuizCardView({
  question,
  questionNumber,
  total,
  answered,
  onAnswer,
}: QuizCardViewProps) {
  const [typedText, setTypedText] = useState("");
  const isAnswered = answered !== null;
  const isCorrect = answered?.isCorrect ?? false;

  // ── Shared styles ──────────────────────────────────────────────────────────

  function getOptionStyle(i: number): React.CSSProperties {
    if (!isAnswered) return {};
    if (i === question.answerIndex)
      return { borderColor: "var(--color-green)", background: "rgba(42,157,92,0.07)" };
    if (answered?.value === i && i !== question.answerIndex)
      return { borderColor: "var(--color-primary)", background: "rgba(232,114,26,0.07)" };
    return {};
  }

  function getLetterStyle(i: number): React.CSSProperties {
    if (!isAnswered) return { background: "var(--color-border)" };
    if (i === question.answerIndex) return { background: "var(--color-green)", color: "white" };
    if (answered?.value === i && i !== question.answerIndex)
      return { background: "var(--color-primary)", color: "white" };
    return { background: "var(--color-border)" };
  }

  // ── Renders ────────────────────────────────────────────────────────────────

  function renderQuestion() {
    if (question.isHtml) {
      return (
        <div
          className="text-base font-semibold leading-relaxed mb-5 text-text-primary"
          dangerouslySetInnerHTML={{ __html: question.question }}
        />
      );
    }
    return (
      <div className="text-base font-semibold leading-relaxed mb-5 text-text-primary whitespace-pre-wrap">
        {question.question}
      </div>
    );
  }

  function renderMC() {
    return (
      <div className="flex flex-col gap-2">
        {(question.options ?? []).map((opt, i) => (
          <button
            key={i}
            disabled={isAnswered}
            onClick={() => onAnswer(i, i === question.answerIndex)}
            className="flex items-start gap-3 px-4 py-3 rounded-xl border-[1.5px] border-border bg-bg text-left w-full font-sans transition-all duration-150 cursor-pointer disabled:cursor-default hover:enabled:border-text-primary hover:enabled:bg-surface"
            style={getOptionStyle(i)}
          >
            <span
              className="font-mono text-[0.68rem] font-bold w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-all duration-150"
              style={getLetterStyle(i)}
            >
              {LETTERS[i]}
            </span>
            {question.isHtml ? (
              <span
                className="text-sm font-medium leading-snug text-text-primary"
                dangerouslySetInnerHTML={{ __html: opt }}
              />
            ) : (
              <span className="text-sm font-medium leading-snug text-text-primary">{opt}</span>
            )}
          </button>
        ))}
      </div>
    );
  }

  function renderTF() {
    return (
      <div>
        {/* Displayed answer to evaluate */}
        <div className="mb-4 px-4 py-3 rounded-xl bg-surface border border-border text-sm font-medium text-text-primary whitespace-pre-wrap">
          <span className="font-mono text-[0.65rem] uppercase tracking-widest text-muted block mb-1">Answer to evaluate</span>
          {question.displayedAnswer ?? ""}
        </div>
        <div className="flex gap-3">
          {["True", "False"].map((label, i) => {
            const chosen = answered?.value === i;
            const isThisCorrect = i === question.answerIndex;
            let style: React.CSSProperties = {};
            if (isAnswered) {
              if (isThisCorrect) style = { borderColor: "var(--color-green)", background: "rgba(42,157,92,0.07)" };
              else if (chosen && !isThisCorrect) style = { borderColor: "var(--color-primary)", background: "rgba(232,114,26,0.07)" };
            }
            return (
              <button
                key={label}
                disabled={isAnswered}
                onClick={() => onAnswer(i, i === question.answerIndex)}
                className="flex-1 py-3 rounded-xl border-[1.5px] border-border bg-bg font-bold text-sm transition-all duration-150 disabled:cursor-default hover:enabled:border-text-primary hover:enabled:bg-surface"
                style={style}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  function renderCloze() {
    const handleSubmit = () => {
      const trimmed = typedText.trim();
      if (!trimmed) return;
      const correct = trimmed.toLowerCase() === question.correctAnswer.trim().toLowerCase();
      onAnswer(trimmed, correct);
    };

    return (
      <div>
        {isAnswered ? (
          <div className="px-4 py-3 rounded-xl border-[1.5px] border-border bg-bg text-sm font-medium text-text-primary">
            {answered?.value as string}
          </div>
        ) : (
          <>
            <div className="flex gap-2">
              <input
                type="text"
                value={typedText}
                onChange={(e) => setTypedText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="Fill in the blank…"
                autoFocus
                className="flex-1 px-4 py-3 rounded-xl border-[1.5px] border-border bg-bg text-sm font-medium focus:outline-none focus:border-primary transition-colors"
              />
              <button
                onClick={handleSubmit}
                disabled={!typedText.trim()}
                className="px-5 py-3 rounded-xl bg-cta text-cta-text font-bold text-sm hover:opacity-80 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Submit
              </button>
            </div>
            <p className="text-[0.7rem] text-muted mt-2 font-mono">
              Case-insensitive · Press Enter to submit
            </p>
          </>
        )}
      </div>
    );
  }

  function renderIdentification() {
    const handleSubmit = () => {
      const trimmed = typedText.trim();
      if (!trimmed) return;
      const correct = trimmed.toLowerCase() === question.correctAnswer.trim().toLowerCase();
      onAnswer(trimmed, correct);
    };

    return (
      <div>
        {isAnswered ? (
          <div className="px-4 py-3 rounded-xl border-[1.5px] border-border bg-bg text-sm font-medium text-text-primary">
            {answered?.value as string}
          </div>
        ) : (
          <>
            <div className="flex gap-2">
              <input
                type="text"
                value={typedText}
                onChange={(e) => setTypedText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="Type your answer…"
                className="flex-1 px-4 py-3 rounded-xl border-[1.5px] border-border bg-bg text-sm font-medium focus:outline-none focus:border-primary transition-colors"
              />
              <button
                onClick={handleSubmit}
                disabled={!typedText.trim()}
                className="px-5 py-3 rounded-xl bg-cta text-cta-text font-bold text-sm hover:opacity-80 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Submit
              </button>
            </div>
            <p className="text-[0.7rem] text-muted mt-2 font-mono">
              Case-insensitive · Press Enter to submit
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <div
      className="bg-card border-[1.5px] border-border rounded-2xl p-7 mb-5 relative overflow-hidden"
      style={{
        borderLeft: isAnswered
          ? `4px solid ${isCorrect ? "var(--color-green)" : "var(--color-primary)"}`
          : "4px solid var(--color-border)",
      }}
    >
      {/* Meta row */}
      <div className="flex items-center gap-2.5 mb-4">
        <span className="font-mono text-[0.65rem] font-semibold text-muted uppercase tracking-widest">
          Q{questionNumber}
        </span>
        <span className="font-mono text-[0.6rem] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-surface text-muted">
          {question.type === "mc" ? "Multiple Choice" : question.type === "tf" ? "True / False" : question.type === "cloze" ? "Fill in the Blank" : "Identification"}
        </span>
        <span className="font-mono text-[0.6rem] text-muted ml-auto">
          {questionNumber} / {total}
        </span>
      </div>

      {/* Question */}
      {renderQuestion()}

      {/* Answer input based on type */}
      {question.type === "mc" && renderMC()}
      {question.type === "tf" && renderTF()}
      {question.type === "identification" && renderIdentification()}
      {question.type === "cloze" && renderCloze()}

      {/* Explanation */}
      {isAnswered && (
        <div
          className="mt-4 px-4 py-3.5 rounded-xl text-sm leading-relaxed fade-in-up"
          style={{
            background: isCorrect ? "rgba(42,157,92,0.07)" : "rgba(232,114,26,0.06)",
            border: `1px solid ${isCorrect ? "rgba(42,157,92,0.2)" : "rgba(232,114,26,0.2)"}`,
            color: isCorrect ? "var(--color-green)" : "var(--color-primary)",
          }}
        >
          <div className="flex items-center gap-1.5 font-mono font-bold text-[0.7rem] uppercase tracking-wider mb-1.5">
            {isCorrect ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}
            {isCorrect ? "Correct" : "Incorrect"}
          </div>
          {!isCorrect && (
            <div className="text-[0.8rem] mb-1 font-semibold opacity-80">
              Correct answer: {question.correctAnswer}
            </div>
          )}
          {question.explanation && question.isHtml ? (
            <div dangerouslySetInnerHTML={{ __html: question.explanation }} />
          ) : (
            question.explanation !== question.correctAnswer && (
              <div>{question.explanation}</div>
            )
          )}
        </div>
      )}
    </div>
  );
}
