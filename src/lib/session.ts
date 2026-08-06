import { QUESTIONS, type Question } from "@/data/questions";

export type Mode = "random" | "sequential" | "weakest" | "mock" | "promotion";

export const PROMOTION_CATEGORIES = [
  "Teamwork & Leadership",
  "Accomplishments",
  "Problem Solving",
  "Career Goals",
  "Skills & Work Style",
];

export function parseCategories(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

export function buildPool(categories: string[], mode?: Mode): Question[] {
  const effectiveCategories =
    mode === "promotion" && !categories.length ? PROMOTION_CATEGORIES : categories;
  if (!effectiveCategories.length) return QUESTIONS;
  const filtered = QUESTIONS.filter((question) => effectiveCategories.includes(question.category));
  return filtered.length ? filtered : QUESTIONS;
}

function randomOf<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

/** Picks the next question id, avoiding ones already asked when possible. */
export function pickNext(
  pool: Question[],
  mode: Mode,
  askedIds: number[],
  currentId: number | null,
  categoryScores: Record<string, number[]>,
): number {
  const unasked = pool.filter((question) => !askedIds.includes(question.id));
  const available = unasked.length ? unasked : pool.filter((q) => q.id !== currentId);
  const candidates = available.length ? available : pool;

  if (mode === "sequential") {
    if (currentId === null) return candidates[0]!.id;
    const currentIndex = pool.findIndex((question) => question.id === currentId);
    return pool[(currentIndex + 1) % pool.length]!.id;
  }

  if (mode === "weakest") {
    const average = (category: string) => {
      const scores = categoryScores[category];
      if (!scores?.length) return 6.5; // neutral prior so unseen categories get a turn
      return scores.reduce((sum, value) => sum + value, 0) / scores.length;
    };
    const categories = Array.from(new Set(candidates.map((q) => q.category)));
    const weakest = categories.reduce((lowest, category) =>
      average(category) < average(lowest) ? category : lowest,
    );
    return randomOf(candidates.filter((q) => q.category === weakest)).id;
  }

  return randomOf(candidates).id;
}
