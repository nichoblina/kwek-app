"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useDecks } from "@/hooks/useDecks";
import { getCategoryLabel, getCategoryColor } from "@/lib/utils";
import { BookOpen, Zap } from "lucide-react";

function StudyPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { allDecks, hydrated } = useDecks();

  // Cats from URL (set when returning from a session)
  const urlCats = useMemo(
    () => (searchParams.get("cats") ?? "").split(",").filter(Boolean),
    [searchParams]
  );

  useEffect(() => {
    document.title = "Study by Category · kwek";
  }, []);

  // Aggregate all categories with card counts
  const catCardCounts = useMemo(() => {
    const map: Record<string, number> = {};
    allDecks.flatMap((d) => d.cards).forEach((c) => {
      map[c.category] = (map[c.category] ?? 0) + 1;
    });
    return map;
  }, [allDecks]);

  const allCats = useMemo(
    () => Object.keys(catCardCounts).sort(),
    [catCardCounts]
  );

  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Initialise selection once hydrated: restore from URL cats, or default to all
  useEffect(() => {
    if (hydrated && allCats.length > 0) {
      const valid = urlCats.filter((c) => allCats.includes(c));
      setSelected(new Set(valid));
    }
  }, [hydrated, allCats.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  function toggleCat(cat: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  function selectAll() {
    setSelected(new Set(allCats));
  }

  function deselectAll() {
    setSelected(new Set());
  }

  // Preview: how many cards + decks match the selection
  const { totalCards, deckCount } = useMemo(() => {
    const matchingDecks = allDecks.filter((d) =>
      d.categories.some((c) => selected.has(c))
    );
    const cards = matchingDecks.flatMap((d) =>
      d.cards.filter((c) => selected.has(c.category))
    );
    return {
      totalCards: cards.length,
      deckCount: new Set(matchingDecks.map((d) => d.id)).size,
    };
  }, [allDecks, selected]);

  const catsParam = [...selected].join(",");
  const canStart = selected.size > 0;

  if (!hydrated) {
    return (
      <div className="max-w-3xl mx-auto px-5 py-10">
        <div className="text-muted text-sm">Loading…</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-5 py-10 pb-16">
      {/* Nav */}
      <div className="mb-6">
        <Link
          href="/"
          className="font-mono text-[0.7rem] font-semibold uppercase tracking-widest text-muted hover:text-text-primary transition-colors"
        >
          ← Home
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8 pb-5 border-b border-border">
        <h1 className="text-xl font-extrabold tracking-tight text-text-primary">
          Study by Category
        </h1>
        <p className="text-sm text-muted mt-1.5 font-medium">
          Mix cards from multiple decks into one session.
        </p>
      </div>

      {/* Category selection */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[0.8rem] font-bold uppercase tracking-widest text-muted font-mono">
            Categories
          </p>
          <div className="flex gap-3">
            <button
              onClick={selectAll}
              className="font-mono text-[0.65rem] font-semibold uppercase tracking-wide text-muted hover:text-text-primary transition-colors cursor-pointer"
            >
              Select all
            </button>
            <button
              onClick={deselectAll}
              className="font-mono text-[0.65rem] font-semibold uppercase tracking-wide text-muted hover:text-text-primary transition-colors cursor-pointer"
            >
              Deselect all
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {allCats.map((cat) => {
            const isSelected = selected.has(cat);
            const count = catCardCounts[cat] ?? 0;
            return (
              <button
                key={cat}
                onClick={() => toggleCat(cat)}
                className={`flex items-center gap-2 font-mono text-[0.65rem] font-semibold px-3 py-1.5 rounded-full border-[1.5px] uppercase tracking-wide transition-all duration-150 cursor-pointer${!isSelected ? " hover:bg-surface" : ""}`}
                style={{
                  borderColor: isSelected ? "var(--color-border)" : "var(--color-text-primary)",
                  color: isSelected ? "var(--color-muted)" : "var(--color-text-primary)",
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: getCategoryColor(cat) }}
                />
                {getCategoryLabel(cat)}
                <span
                  className="font-bold opacity-60 ml-0.5"
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Preview line */}
      <div
        className="rounded-xl px-4 py-3 mb-8 text-sm font-semibold"
        style={{ background: "var(--color-surface)" }}
      >
        {canStart ? (
          <span className="text-text-primary">
            {totalCards} card{totalCards !== 1 ? "s" : ""} from{" "}
            {deckCount} deck{deckCount !== 1 ? "s" : ""} selected
          </span>
        ) : (
          <span className="text-muted">
            Select at least one category to start
          </span>
        )}
      </div>

      {/* Mode buttons */}
      <div className="flex gap-3 flex-wrap">
        <button
          disabled={!canStart}
          onClick={() => router.push(`/study/flashcards?cats=${catsParam}`)}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: canStart ? "var(--color-text-primary)" : "var(--color-surface)",
            color: canStart ? "var(--color-bg)" : "var(--color-muted)",
          }}
        >
          <BookOpen size={16} strokeWidth={2.5} />
          Flashcards
        </button>
        <button
          disabled={!canStart}
          onClick={() => router.push(`/study/quiz?cats=${catsParam}`)}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm border-[1.5px] transition-all duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            borderColor: canStart ? "var(--color-primary)" : "var(--color-border)",
            color: canStart ? "var(--color-primary)" : "var(--color-muted)",
            background: "transparent",
          }}
        >
          <Zap size={16} strokeWidth={2.5} />
          Quiz
        </button>
      </div>
    </div>
  );
}

export default function StudyPage() {
  return (
    <Suspense fallback={<div className="max-w-3xl mx-auto px-5 py-10 text-muted text-sm">Loading…</div>}>
      <StudyPageInner />
    </Suspense>
  );
}
