"use client";

import { useState, useEffect, useCallback } from "react";
import type { Deck, Card, Category } from "@/lib/types";
import {
  getCustomDecks,
  upsertCustomDeck,
  deleteCustomDeck as storageDeleteDeck,
} from "@/lib/storage";
import { builtinDeck } from "@/lib/builtinDeck";
import { builtinAlgorithmsDeck } from "@/lib/builtinAlgorithmsDeck";
import { builtinCsFundamentalsDeck } from "@/lib/builtinCsFundamentalsDeck";
import { generateId, deriveCategoriesFromCards } from "@/lib/utils";

const BUILTIN_DECKS = [builtinDeck, builtinAlgorithmsDeck, builtinCsFundamentalsDeck];

export function useDecks() {
  const [customDecks, setCustomDecks] = useState<Deck[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCustomDecks(getCustomDecks());
    setHydrated(true);
  }, []);

  const allDecks: Deck[] = [...BUILTIN_DECKS, ...customDecks];

  const getDeckById = useCallback(
    (id: string): Deck | undefined => {
      return allDecks.find((d) => d.id === id);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [customDecks]
  );

  const createDeck = useCallback(
    (partial: Omit<Deck, "id" | "createdAt" | "isBuiltIn" | "categories">): Deck => {
      const deck: Deck = {
        ...partial,
        id: generateId(),
        createdAt: new Date().toISOString(),
        isBuiltIn: false,
        categories: deriveCategoriesFromCards(partial.cards),
      };
      upsertCustomDeck(deck);
      setCustomDecks(getCustomDecks());
      return deck;
    },
    []
  );

  const updateDeck = useCallback((deck: Deck): void => {
    const updated: Deck = {
      ...deck,
      categories: deriveCategoriesFromCards(deck.cards),
    };
    upsertCustomDeck(updated);
    setCustomDecks(getCustomDecks());
  }, []);

  const deleteDeck = useCallback((deckId: string): void => {
    storageDeleteDeck(deckId);
    setCustomDecks(getCustomDecks());
  }, []);

  const addCardToDeck = useCallback(
    (deckId: string, card: Omit<Card, "id">): void => {
      const deck = getCustomDecks().find((d) => d.id === deckId);
      if (!deck) return;
      const newCard: Card = { ...card, id: generateId() } as Card;
      const updated: Deck = {
        ...deck,
        cards: [...deck.cards, newCard],
        categories: deriveCategoriesFromCards([...deck.cards, newCard]),
      };
      upsertCustomDeck(updated);
      setCustomDecks(getCustomDecks());
    },
    []
  );

  const updateCardInDeck = useCallback(
    (deckId: string, updatedCard: Card): void => {
      const deck = getCustomDecks().find((d) => d.id === deckId);
      if (!deck) return;
      const cards = deck.cards.map((c) =>
        c.id === updatedCard.id ? updatedCard : c
      );
      const updated: Deck = {
        ...deck,
        cards,
        categories: deriveCategoriesFromCards(cards),
      };
      upsertCustomDeck(updated);
      setCustomDecks(getCustomDecks());
    },
    []
  );

  const deleteCardFromDeck = useCallback(
    (deckId: string, cardId: string): void => {
      const deck = getCustomDecks().find((d) => d.id === deckId);
      if (!deck) return;
      const cards = deck.cards.filter((c) => c.id !== cardId);
      const updated: Deck = {
        ...deck,
        cards,
        categories: deriveCategoriesFromCards(cards),
      };
      upsertCustomDeck(updated);
      setCustomDecks(getCustomDecks());
    },
    []
  );

  const duplicateDeck = useCallback(
    (deckId: string): Deck | null => {
      const original = getDeckById(deckId);
      if (!original) return null;
      const deck: Deck = {
        ...original,
        id: generateId(),
        name: `${original.name} (copy)`,
        createdAt: new Date().toISOString(),
        isBuiltIn: false,
        cards: original.cards.map((c) => ({ ...c, id: generateId() })),
      };
      upsertCustomDeck(deck);
      setCustomDecks(getCustomDecks());
      return deck;
    },
    [getDeckById]
  );

  return {
    allDecks,
    customDecks,
    hydrated,
    getDeckById,
    createDeck,
    updateDeck,
    deleteDeck,
    duplicateDeck,
    addCardToDeck,
    updateCardInDeck,
    deleteCardFromDeck,
  };
}

export function useDeck(id: string) {
  const { getDeckById, hydrated } = useDecks();
  const [deck, setDeck] = useState<Deck | undefined>(undefined);

  useEffect(() => {
    if (hydrated) {
      setDeck(getDeckById(id));
    }
  }, [id, hydrated, getDeckById]);

  return { deck, hydrated };
}
