"use client";

import { use, useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDecks } from "@/hooks/useDecks";
import { Badge, CategoryDot } from "@/components/ui/Badge";
import { exportDeck } from "@/lib/importExport";
import { isFullCard } from "@/lib/types";
import { ArrowDownCircle, Layers, PenLine, ArrowRight, Copy, Search, X } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function DeckDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { getDeckById, hydrated, duplicateDeck } = useDecks();
  const deck = getDeckById(id);

  const [search, setSearch] = useState("");
  const [duplicating, setDuplicating] = useState(false);

  useEffect(() => {
    if (deck) document.title = `${deck.name} · kwek`;
  }, [deck?.name]);

  const filteredCards = useMemo(() => {
    if (!deck) return [];
    const q = search.trim().toLowerCase();
    if (!q) return deck.cards;
    const strip = (html: string) => html.replace(/<[^>]*>/g, "");
    return deck.cards.filter((c) => {
      const front = isFullCard(c) ? strip(c.front) : c.front;
      const back = isFullCard(c) ? strip(c.explanation) : c.back;
      return front.toLowerCase().includes(q) || back.toLowerCase().includes(q);
    });
  }, [deck, search]);

  function handleDuplicate() {
    if (!deck) return;
    setDuplicating(true);
    const copy = duplicateDeck(deck.id);
    if (copy) router.push(`/decks/${copy.id}`);
    else setDuplicating(false);
  }

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

  const hasQuiz = deck.cards.length > 0;

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
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {!deck.isBuiltIn && (
              <Link
                href={`/decks/${deck.id}/edit`}
                className="px-4 py-2 rounded-xl font-bold text-sm border-[1.5px] border-border hover:bg-surface transition-colors"
              >
                Edit Deck
              </Link>
            )}
            <button
              onClick={handleDuplicate}
              disabled={duplicating}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm border-[1.5px] border-border hover:bg-surface transition-colors cursor-pointer disabled:opacity-50"
            >
              <Copy size={16} strokeWidth={2.5} />
              {duplicating ? "Duplicating…" : "Duplicate"}
            </button>
            <button
              onClick={() => exportDeck(deck)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm border-[1.5px] border-border hover:bg-surface transition-colors cursor-pointer"
            >
              <ArrowDownCircle size={16} strokeWidth={2.5} />
              Export
            </button>
          </div>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        {/* Flashcard mode */}
        <Link
          href={`/decks/${deck.id}/flashcards`}
          className="bg-card border-[1.5px] border-border rounded-2xl p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
        >
          <Layers size={28} strokeWidth={1.75} className="mb-3 text-muted group-hover:text-primary transition-colors" />
          <h2 className="font-bold text-lg text-text-primary group-hover:text-primary transition-colors">
            Flashcard Mode
          </h2>
          <p className="text-sm text-muted mt-1 leading-relaxed">
            Flip through cards at your own pace. Rate each card as Easy or Hard.
          </p>
          <div className="flex items-center gap-1 mt-4 font-mono text-[0.68rem] font-semibold text-muted uppercase tracking-wider">
            {deck.cards.length} cards <ArrowRight size={12} strokeWidth={2.5} />
          </div>
        </Link>

        {/* Quiz mode */}
        {hasQuiz ? (
          <Link
            href={`/decks/${deck.id}/quiz`}
            className="bg-card border-[1.5px] border-border rounded-2xl p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
          >
            <PenLine size={28} strokeWidth={1.75} className="mb-3 text-muted group-hover:text-primary transition-colors" />
            <h2 className="font-bold text-lg text-text-primary group-hover:text-primary transition-colors">
              Quiz Mode
            </h2>
            <p className="text-sm text-muted mt-1 leading-relaxed">
              Multiple-choice, true/false, and identification questions with instant feedback.
            </p>
            <div className="flex items-center gap-1 mt-4 font-mono text-[0.68rem] font-semibold text-muted uppercase tracking-wider">
              {deck.cards.length} questions <ArrowRight size={12} strokeWidth={2.5} />
            </div>
          </Link>
        ) : (
          <div className="bg-surface border-[1.5px] border-dashed border-border rounded-2xl p-6 opacity-60">
            <PenLine size={28} strokeWidth={1.75} className="mb-3 text-muted" />
            <h2 className="font-bold text-lg text-text-primary">Quiz Mode</h2>
            <p className="text-sm text-muted mt-1 leading-relaxed">
              Add at least one card to enable quiz mode.
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

      {/* Card search */}
      {deck.cards.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4 gap-3">
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted font-mono">
              Cards
            </h2>
            <div className="relative flex-1 max-w-xs">
              <Search
                size={14}
                strokeWidth={2.5}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
              />
              <input
                type="text"
                placeholder="Search cards…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-8 py-2 rounded-xl border-[1.5px] border-border bg-card text-sm font-medium text-text-primary placeholder:text-muted focus:outline-none focus:border-primary transition-colors"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-text-primary transition-colors cursor-pointer"
                >
                  <X size={14} strokeWidth={2.5} />
                </button>
              )}
            </div>
          </div>

          {filteredCards.length === 0 ? (
            <p className="text-sm text-muted text-center py-8">No cards match &ldquo;{search}&rdquo;</p>
          ) : (
            <div className="flex flex-col gap-2">
              {search && (
                <p className="text-[0.75rem] text-muted font-medium mb-1">
                  {filteredCards.length} of {deck.cards.length} cards
                </p>
              )}
              {filteredCards.map((card) => {
                const back = isFullCard(card) ? card.explanation : card.back;
                return (
                  <div
                    key={card.id}
                    className="bg-card border-[1.5px] border-border rounded-xl px-4 py-3 flex gap-4 items-start"
                  >
                    <div className="flex-1 min-w-0">
                      {isFullCard(card) ? (
                        <p
                          className="text-sm font-semibold text-text-primary leading-snug line-clamp-2"
                          dangerouslySetInnerHTML={{ __html: card.front }}
                        />
                      ) : (
                        <p className="text-sm font-semibold text-text-primary leading-snug line-clamp-2">
                          {card.front}
                        </p>
                      )}
                      {back && (
                        <p className="text-xs text-muted mt-1 leading-relaxed line-clamp-2">
                          {isFullCard(card)
                            ? back.replace(/<[^>]*>/g, "")
                            : back}
                        </p>
                      )}
                    </div>
                    <Badge category={card.category} size="sm" />
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
