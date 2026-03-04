"use client";

import { useState, useCallback } from "react";
import type { FlashcardProgress, ConfidenceRating } from "@/lib/types";
import {
  getFlashcardProgress,
  saveFlashcardProgress,
  clearFlashcardProgress,
} from "@/lib/storage";

export function useFlashcardProgress(deckId: string) {
  const [progress, setProgress] = useState<FlashcardProgress>(() => {
    const saved = typeof window !== "undefined" ? getFlashcardProgress(deckId) : null;
    if (saved) return saved;
    return {
      deckId,
      lastStudiedAt: new Date().toISOString(),
      confidence: {},
      seen: [],
      currentIndex: 0,
    };
  });

  const markSeen = useCallback((cardId: string) => {
    setProgress((prev) => {
      if (prev.seen.includes(cardId)) return prev;
      const updated: FlashcardProgress = {
        ...prev,
        seen: [...prev.seen, cardId],
        lastStudiedAt: new Date().toISOString(),
      };
      saveFlashcardProgress(updated);
      return updated;
    });
  }, []);

  const rateConfidence = useCallback((cardId: string, rating: ConfidenceRating) => {
    setProgress((prev) => {
      const updated: FlashcardProgress = {
        ...prev,
        confidence: { ...prev.confidence, [cardId]: rating },
        lastStudiedAt: new Date().toISOString(),
      };
      saveFlashcardProgress(updated);
      return updated;
    });
  }, []);

  const setCurrentIndex = useCallback((index: number) => {
    setProgress((prev) => {
      const updated: FlashcardProgress = { ...prev, currentIndex: index };
      saveFlashcardProgress(updated);
      return updated;
    });
  }, []);

  const resetProgress = useCallback(() => {
    clearFlashcardProgress(deckId);
    const fresh: FlashcardProgress = {
      deckId,
      lastStudiedAt: new Date().toISOString(),
      confidence: {},
      seen: [],
      currentIndex: 0,
    };
    setProgress(fresh);
  }, [deckId]);

  return { progress, markSeen, rateConfidence, setCurrentIndex, resetProgress };
}
