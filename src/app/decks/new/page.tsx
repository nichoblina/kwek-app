"use client";

import { useRouter } from "next/navigation";
import { useDecks } from "@/hooks/useDecks";
import { DeckEditor } from "@/components/deck/DeckEditor";
import type { Deck } from "@/lib/types";
import Link from "next/link";

export default function NewDeckPage() {
  const router = useRouter();
  const { createDeck } = useDecks();

  function handleSave(deck: Deck) {
    const created = createDeck({
      name: deck.name,
      description: deck.description,
      cards: deck.cards,
    });
    router.push(`/decks/${created.id}`);
  }

  return (
    <div className="max-w-3xl mx-auto px-5 py-10 pb-16">
      <div className="mb-8">
        <Link
          href="/"
          className="font-mono text-[0.7rem] font-semibold uppercase tracking-widest text-muted hover:text-text-primary transition-colors"
        >
          ← Home
        </Link>
      </div>
      <DeckEditor deck={null} onSave={handleSave} onCancel={() => router.push("/")} />
    </div>
  );
}
