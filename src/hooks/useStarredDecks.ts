"use client";

import { useState, useEffect, useCallback } from "react";
import { getStarredDeckIds, toggleStarredDeck } from "@/lib/storage";

export function useStarredDecks() {
  const [starredIds, setStarredIds] = useState<string[]>([]);
  const [starError, setStarError] = useState<string | null>(null);

  useEffect(() => {
    setStarredIds(getStarredDeckIds());

    const onChange = () => setStarredIds(getStarredDeckIds());
    const onError = (e: Event) => {
      const reason = (e as CustomEvent<{ reason: string }>).detail.reason;
      setStarError(reason);
      setTimeout(() => setStarError(null), 3000);
    };

    window.addEventListener("kwek:starred-changed", onChange);
    window.addEventListener("kwek:starred-error", onError);
    return () => {
      window.removeEventListener("kwek:starred-changed", onChange);
      window.removeEventListener("kwek:starred-error", onError);
    };
  }, []);

  const toggleStar = useCallback((deckId: string) => {
    toggleStarredDeck(deckId);
  }, []);

  const isStarred = useCallback(
    (deckId: string) => starredIds.includes(deckId),
    [starredIds]
  );

  return { starredIds, toggleStar, isStarred, starError };
}
