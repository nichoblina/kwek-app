"use client";

import { useState, useCallback } from "react";
import type { QuizProgress, Category } from "@/lib/types";
import {
  getQuizProgress,
  saveQuizProgress,
  clearQuizProgress,
} from "@/lib/storage";

export function useQuizProgress(deckId: string, total: number, activeCategory: Category | null) {
  const [progress, setProgress] = useState<QuizProgress>(() => {
    const saved = typeof window !== "undefined" ? getQuizProgress(deckId) : null;
    if (saved && saved.activeCategory === activeCategory && saved.total === total) {
      return saved;
    }
    return {
      deckId,
      startedAt: new Date().toISOString(),
      completedAt: null,
      answers: {},
      results: {},
      score: 0,
      total,
      activeCategory,
    };
  });

  const recordAnswer = useCallback(
    (cardId: string, chosenIndex: number, isCorrect: boolean) => {
      setProgress((prev) => {
        const result = isCorrect ? "correct" : "incorrect";
        const updated: QuizProgress = {
          ...prev,
          answers: { ...prev.answers, [cardId]: chosenIndex },
          results: { ...prev.results, [cardId]: result },
          score: prev.score + (isCorrect ? 1 : 0),
        };
        saveQuizProgress(updated);
        return updated;
      });
    },
    []
  );

  const completeQuiz = useCallback(() => {
    setProgress((prev) => {
      const updated: QuizProgress = {
        ...prev,
        completedAt: new Date().toISOString(),
      };
      saveQuizProgress(updated);
      return updated;
    });
  }, []);

  const resetProgress = useCallback(() => {
    clearQuizProgress(deckId);
    const fresh: QuizProgress = {
      deckId,
      startedAt: new Date().toISOString(),
      completedAt: null,
      answers: {},
      results: {},
      score: 0,
      total,
      activeCategory,
    };
    setProgress(fresh);
  }, [deckId, total, activeCategory]);

  return { progress, recordAnswer, completeQuiz, resetProgress };
}
