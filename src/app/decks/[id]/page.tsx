"use client";

import { use } from "react";
import Link from "next/link";
import { useDecks } from "@/hooks/useDecks";
import { Badge, CategoryDot } from "@/components/ui/Badge";
import { hasQuizData } from "@/lib/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function DeckDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const { getDeckById, hydrated } = useDecks();
  const deck = getDeckById(id);

  if (!hydrated) {
    return (
      <div className="max-w-3xl mx-auto px-5 py-10">
        <div className="text-muted text-sm font-medium">Loading…</div>
      </div>
    );
  }

  if (!deck) {
    return (
      <div className="max-w-3xl mx-auto px-5 py-10">
        <Link href="/" className="font-mono text-[0.7rem] font-semibold uppercase tracking-widest text-muted hover:text-text-primary transition-colors">
          ← Home
        </Link>
        <div className="mt-10 text-center">
          <h1 className="text-2xl font-bold mb-2">Deck not found</h1>
          <p className="text-muted text-sm">This deck doesn&apos;t exist or was deleted.</p>
        </div>
      </div>
    );
  }

  const quizCards = deck.cards.filter(hasQuizData);
  const hasQuiz = quizCards.length > 0;

  return (
    <div className="max-w-3xl mx-auto px-5 py-10 pb-16">
      {/* Breadcrumb */}
      <div className="mb-8">
        <Link
          href="/"
          className="font-mono text-[0.7rem] font-semibold uppercase tracking-widest text-muted hover:text-text-primary transition-colors"
        >
          ← Home
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8 pb-6 border-b-2 border-text-primary">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {deck.isBuiltIn && (
                <span
                  className="font-mono text-[0.6rem] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(47,125,200,0.1)", color: "var(--color-secondary)" }}
                >
                  Built-in
                </span>
              )}
            </div>
            <h1 className="text-[2rem] font-extrabold leading-tight tracking-tight text-text-primary">
              {deck.name}
            </h1>
            {deck.description && (
              <p className="text-sm text-muted mt-1.5 font-medium max-w-lg leading-relaxed">
                {deck.description}
              </p>
            )}
          </div>
          {!deck.isBuiltIn && (
            <Link
              href={`/decks/${deck.id}/edit`}
              className="px-4 py-2 rounded-xl font-bold text-sm border-[1.5px] border-border hover:bg-surface transition-colors shrink-0"
            >
              Edit Deck
            </Link>
          )}
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-5 mt-5 flex-wrap">
          <span className="text-sm font-semibold text-muted">
            {deck.cards.length} cards
          </span>
          {deck.categories.map((cat) => (
            <div key={cat} className="flex items-center gap-1.5">
              <CategoryDot category={cat} />
              <span className="text-[0.8rem] font-semibold text-muted">
                {deck.cards.filter((c) => c.category === cat).length}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Category badges */}
      <div className="flex flex-wrap gap-2 mb-8">
        {deck.categories.map((cat) => (
          <Badge key={cat} category={cat} />
        ))}
      </div>

      {/* Mode CTAs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Flashcard mode */}
        <Link
          href={`/decks/${deck.id}/flashcards`}
          className="bg-card border-[1.5px] border-border rounded-2xl p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
        >
          <div className="text-2xl mb-3">🃏</div>
          <h2 className="font-bold text-lg text-text-primary group-hover:text-primary transition-colors">
            Flashcard Mode
          </h2>
          <p className="text-sm text-muted mt-1 leading-relaxed">
            Flip through cards at your own pace. Rate each card as Easy or Hard.
          </p>
          <div className="mt-4 font-mono text-[0.68rem] font-semibold text-muted uppercase tracking-wider">
            {deck.cards.length} cards →
          </div>
        </Link>

        {/* Quiz mode */}
        {hasQuiz ? (
          <Link
            href={`/decks/${deck.id}/quiz`}
            className="bg-card border-[1.5px] border-border rounded-2xl p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
          >
            <div className="text-2xl mb-3">✏️</div>
            <h2 className="font-bold text-lg text-text-primary group-hover:text-primary transition-colors">
              Quiz Mode
            </h2>
            <p className="text-sm text-muted mt-1 leading-relaxed">
              Multiple-choice questions with instant feedback and explanations.
            </p>
            <div className="mt-4 font-mono text-[0.68rem] font-semibold text-muted uppercase tracking-wider">
              {quizCards.length} questions →
            </div>
          </Link>
        ) : (
          <div className="bg-surface border-[1.5px] border-dashed border-border rounded-2xl p-6 opacity-60">
            <div className="text-2xl mb-3">✏️</div>
            <h2 className="font-bold text-lg text-text-primary">Quiz Mode</h2>
            <p className="text-sm text-muted mt-1 leading-relaxed">
              Add multiple-choice options to cards to enable quiz mode.
            </p>
            {!deck.isBuiltIn && (
              <Link
                href={`/decks/${deck.id}/edit`}
                className="mt-4 inline-block font-mono text-[0.68rem] font-semibold text-primary uppercase tracking-wider"
                onClick={(e) => e.stopPropagation()}
              >
                Add quiz options →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
