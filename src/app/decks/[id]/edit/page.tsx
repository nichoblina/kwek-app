"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDecks } from "@/hooks/useDecks";
import { DeckEditor } from "@/components/deck/DeckEditor";
import type { Deck } from "@/lib/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditDeckPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { getDeckById, updateDeck, deleteDeck, hydrated } = useDecks();
  const deck = getDeckById(id);

  // Redirect if built-in
  useEffect(() => {
    if (hydrated && deck?.isBuiltIn) {
      router.replace(`/decks/${id}`);
    }
  }, [hydrated, deck, id, router]);

  if (!hydrated) {
    return (
      <div className="max-w-3xl mx-auto px-5 py-10">
        <div className="text-muted text-sm">Loading…</div>
      </div>
    );
  }

  if (!deck || deck.isBuiltIn) {
    return null; // Redirect in progress
  }

  function handleSave(updated: Deck) {
    updateDeck(updated);
    router.push(`/decks/${id}`);
  }

  function handleDelete() {
    if (!window.confirm(`Delete "${deck!.name}"? This cannot be undone.`)) return;
    deleteDeck(id);
    router.push("/");
  }

  return (
    <div className="max-w-3xl mx-auto px-5 py-10 pb-16">
      <div className="mb-8">
        <Link
          href={`/decks/${id}`}
          className="font-mono text-[0.7rem] font-semibold uppercase tracking-widest text-muted hover:text-text-primary transition-colors"
        >
          ← {deck.name}
        </Link>
      </div>

      <DeckEditor
        deck={deck}
        onSave={handleSave}
        onCancel={() => router.push(`/decks/${id}`)}
      />

      {/* Danger zone */}
      <div className="mt-10 pt-6 border-t border-border">
        <h3 className="font-mono text-[0.68rem] font-semibold uppercase tracking-widest text-muted mb-3">
          Danger Zone
        </h3>
        <button
          onClick={handleDelete}
          className="px-5 py-2.5 rounded-xl font-bold text-sm cursor-pointer transition-all border-[1.5px] border-primary text-primary hover:bg-primary hover:text-white"
        >
          Delete Deck
        </button>
      </div>
    </div>
  );
}
