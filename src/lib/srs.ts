import type { SRSCardData, SRSRating } from "./types";

const INITIAL_EASE = 2.5;
const MIN_EASE = 1.3;
const MAX_EASE = 3.0;

// ─── Date helpers ─────────────────────────────────────────────────────────────

export function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function addDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

// ─── SRS data helpers ─────────────────────────────────────────────────────────

/** Fresh SRS state — card is due today so it enters the queue on first enroll. */
export function getInitialSRSData(): SRSCardData {
  return {
    interval: 1,
    easeFactor: INITIAL_EASE,
    dueDate: todayStr(),
    repetitions: 0,
  };
}

export function isDue(data: SRSCardData): boolean {
  return data.dueDate <= todayStr();
}

// ─── SM-2 algorithm ───────────────────────────────────────────────────────────

/**
 * Compute the next SRS state given the current state and a rating.
 *
 * Again — resets the card, due tomorrow, ease drops 0.2
 * Good  — standard SM-2 progression
 * Easy  — interval boosted ×1.3, ease bumps +0.15
 */
export function computeNextSRS(data: SRSCardData, rating: SRSRating): SRSCardData {
  const { interval, easeFactor, repetitions } = data;

  if (rating === "again") {
    return {
      interval: 1,
      easeFactor: Math.max(MIN_EASE, easeFactor - 0.2),
      dueDate: addDays(1),
      repetitions: 0,
    };
  }

  // Good or Easy — advance through the SM-2 schedule
  let newInterval: number;
  if (repetitions === 0) {
    newInterval = 1;
  } else if (repetitions === 1) {
    newInterval = 6;
  } else {
    newInterval = Math.round(interval * easeFactor);
  }

  let newEase = easeFactor;
  if (rating === "easy") {
    newInterval = Math.round(newInterval * 1.3);
    newEase = Math.min(MAX_EASE, easeFactor + 0.15);
  }

  newInterval = Math.max(1, newInterval);

  return {
    interval: newInterval,
    easeFactor: Math.max(MIN_EASE, newEase),
    dueDate: addDays(newInterval),
    repetitions: repetitions + 1,
  };
}
