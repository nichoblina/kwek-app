"use client";

import { useState, useEffect, useCallback } from "react";
import { getReviewDeckIds, toggleReviewDeck } from "@/lib/storage";

export function useReviewPlan() {
  const [reviewDeckIds, setReviewDeckIds] = useState<string[]>([]);

  useEffect(() => {
    setReviewDeckIds(getReviewDeckIds());

    const onChange = () => setReviewDeckIds(getReviewDeckIds());
    window.addEventListener("kwek:review-changed", onChange);
    return () => window.removeEventListener("kwek:review-changed", onChange);
  }, []);

  const toggleEnroll = useCallback((deckId: string) => {
    toggleReviewDeck(deckId);
  }, []);

  const isEnrolled = useCallback(
    (deckId: string) => reviewDeckIds.includes(deckId),
    [reviewDeckIds]
  );

  return { reviewDeckIds, toggleEnroll, isEnrolled };
}
