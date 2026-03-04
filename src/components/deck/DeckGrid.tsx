import type { Deck } from "@/lib/types";
import { DeckCard } from "./DeckCard";
import Link from "next/link";

interface DeckGridProps {
  decks: Deck[];
  showEmptyState?: boolean;
}

export function DeckGrid({ decks, showEmptyState = true }: DeckGridProps) {
  if (decks.length === 0 && showEmptyState) {
    return (
      <div className="border-[1.5px] border-dashed border-border rounded-2xl p-10 text-center">
        <p className="text-muted text-sm font-medium mb-3">No custom decks yet.</p>
        <Link
          href="/decks/new"
          className="inline-block px-5 py-2 rounded-xl font-bold text-sm transition-all duration-150 hover:opacity-80 bg-text-primary text-bg"
        >
          + Create your first deck
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {decks.map((deck) => (
        <DeckCard key={deck.id} deck={deck} />
      ))}
    </div>
  );
}
