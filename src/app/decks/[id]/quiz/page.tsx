"use client";

import { use, useState, useMemo } from "react";
import Link from "next/link";
import { useDecks } from "@/hooks/useDecks";
import { QuizCardView } from "@/components/quiz/QuizCardView";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { CategoryFilter } from "@/components/ui/CategoryFilter";
import { ScoreSummary } from "@/components/ui/ScoreSummary";
import { hasQuizData } from "@/lib/types";
import type { Category } from "@/lib/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function QuizPage({ params }: PageProps) {
  const { id } = use(params);
  const { getDeckById, hydrated } = useDecks();
  const deck = getDeckById(id);

  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({}); // cardId → chosen index
  const [showSummary, setShowSummary] = useState(false);

  const quizCards = useMemo(() => {
    if (!deck) return [];
    const cards = deck.cards.filter(hasQuizData);
    return activeCategory ? cards.filter((c) => c.category === activeCategory) : cards;
  }, [deck, activeCategory]);

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

  const answeredCount = Object.keys(answers).length;
  const score = quizCards.filter(
    (c) => answers[c.id] !== undefined &&
      ((c.type === "full" ? c.answerIndex : c.answerIndex!) === answers[c.id])
  ).length;

  function handleAnswer(cardId: string, chosenIndex: number) {
    setAnswers((prev) => {
      if (prev[cardId] !== undefined) return prev;
      const next = { ...prev, [cardId]: chosenIndex };
      // Check if all answered
      if (Object.keys(next).length === quizCards.length) {
        setTimeout(() => setShowSummary(true), 800);
      }
      return next;
    });
  }

  function handleCategoryChange(cat: Category | null) {
    setActiveCategory(cat);
    setAnswers({});
    setShowSummary(false);
  }

  function handleRestart() {
    setAnswers({});
    setShowSummary(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="max-w-3xl mx-auto px-5 py-10 pb-16">
      {/* Nav */}
      <div className="mb-6">
        <Link
          href={`/decks/${id}`}
          className="font-mono text-[0.7rem] font-semibold uppercase tracking-widest text-muted hover:text-text-primary transition-colors"
        >
          ← {deck.name}
        </Link>
      </div>

      {/* Header */}
      <div className="mb-6 pb-4 border-b border-border">
        <h1 className="text-xl font-extrabold tracking-tight text-text-primary">
          Quiz Mode
          <span className="ml-2 text-base font-normal text-muted">— {deck.name}</span>
        </h1>
      </div>

      {/* Progress */}
      <ProgressBar
        current={answeredCount}
        total={quizCards.length}
        showScore
        score={score}
      />

      {/* Category filter */}
      <CategoryFilter
        categories={deck.categories}
        active={activeCategory}
        onChange={handleCategoryChange}
      />

      {/* Score summary */}
      {showSummary && (
        <ScoreSummary
          score={score}
          total={quizCards.length}
          deckId={id}
          deckName={deck.name}
          onRestart={handleRestart}
        />
      )}

      {/* Questions */}
      {quizCards.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted text-sm mb-3">No quiz-ready cards in this {activeCategory ? "category" : "deck"}.</p>
          {!deck.isBuiltIn && (
            <Link
              href={`/decks/${id}/edit`}
              className="inline-block font-mono text-[0.68rem] font-semibold text-primary uppercase tracking-wider"
            >
              Add quiz options to cards →
            </Link>
          )}
        </div>
      ) : (
        quizCards.map((card, idx) => (
          <QuizCardView
            key={card.id}
            card={card}
            questionNumber={idx + 1}
            total={quizCards.length}
            answered={answers[card.id] ?? null}
            onAnswer={(chosen) => handleAnswer(card.id, chosen)}
          />
        ))
      )}
    </div>
  );
}
