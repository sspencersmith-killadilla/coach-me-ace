import {
  loadAskQuestions,
  loadStories,
  mergeStories,
  saveAskQuestions,
  saveStories,
} from "./prep-store";

export type AnswerRecord = {
  at: string;
  question: string;
  category: string;
  mode: string;
  score: number;
  words: number;
  fillers: number;
  confidence: number | null;
};

export type Progress = {
  version: 1;
  records: AnswerRecord[];
};

const KEY = "coach-progress-v1";

export const EMPTY_PROGRESS: Progress = { version: 1, records: [] };

function isRecord(value: unknown): value is AnswerRecord {
  if (!value || typeof value !== "object") return false;
  const entry = value as Partial<AnswerRecord>;
  return (
    typeof entry.at === "string" &&
    typeof entry.question === "string" &&
    typeof entry.category === "string" &&
    typeof entry.score === "number"
  );
}

function normalize(value: unknown): Progress {
  if (!value || typeof value !== "object") return EMPTY_PROGRESS;
  const raw = (value as { records?: unknown }).records;
  const records = Array.isArray(raw) ? raw.filter(isRecord) : [];
  return {
    version: 1,
    records: records.map((entry) => ({
      at: entry.at,
      question: entry.question,
      category: entry.category,
      mode: typeof entry.mode === "string" ? entry.mode : "random",
      score: entry.score,
      words: typeof entry.words === "number" ? entry.words : 0,
      fillers: typeof entry.fillers === "number" ? entry.fillers : 0,
      confidence: typeof entry.confidence === "number" ? entry.confidence : null,
    })),
  };
}

export function loadProgress(): Progress {
  if (typeof window === "undefined") return EMPTY_PROGRESS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY_PROGRESS;
    return normalize(JSON.parse(raw));
  } catch {
    return EMPTY_PROGRESS;
  }
}

export function saveProgress(progress: Progress) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(progress));
  } catch {
    /* storage full or blocked — progress stays in memory for this session */
  }
}

export function appendRecords(records: AnswerRecord[]): Progress {
  const current = loadProgress();
  const next: Progress = { version: 1, records: [...current.records, ...records] };
  saveProgress(next);
  return next;
}

export function clearProgress() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

/** Scores grouped by category, used to seed "focus my weak spots". */
export function categoryScores(progress: Progress): Record<string, number[]> {
  const grouped: Record<string, number[]> = {};
  for (const record of progress.records) {
    (grouped[record.category] ??= []).push(record.score);
  }
  return grouped;
}

export type ProgressSummary = {
  answered: number;
  days: number;
  average: number | null;
  recentAverage: number | null;
  earlierAverage: number | null;
  fillerRate: number | null;
  earlierFillerRate: number | null;
  weakest: { category: string; average: number } | null;
  strongest: { category: string; average: number } | null;
  lastPracticed: string | null;
};

function mean(values: number[]): number | null {
  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function fillerRateOf(records: AnswerRecord[]): number | null {
  const words = records.reduce((sum, record) => sum + record.words, 0);
  if (!words) return null;
  const fillers = records.reduce((sum, record) => sum + record.fillers, 0);
  return (fillers / words) * 100;
}

export function summarize(progress: Progress): ProgressSummary {
  const records = progress.records;
  const scores = records.map((record) => record.score);
  const half = Math.floor(records.length / 2);
  const earlier = records.slice(0, half);
  const recent = records.slice(half);

  const averages = Object.entries(categoryScores(progress))
    .map(([category, values]) => ({ category, average: mean(values) ?? 0, count: values.length }))
    .filter((entry) => entry.count >= 1)
    .sort((a, b) => a.average - b.average);

  return {
    answered: records.length,
    days: new Set(records.map((record) => record.at.slice(0, 10))).size,
    average: mean(scores),
    recentAverage: records.length >= 4 ? mean(recent.map((r) => r.score)) : null,
    earlierAverage: records.length >= 4 ? mean(earlier.map((r) => r.score)) : null,
    fillerRate: fillerRateOf(records),
    earlierFillerRate: records.length >= 4 ? fillerRateOf(earlier) : null,
    weakest: averages.length > 1 ? (averages[0] ?? null) : null,
    strongest: averages.length > 1 ? (averages[averages.length - 1] ?? null) : null,
    lastPracticed: records.length ? (records[records.length - 1]?.at ?? null) : null,
  };
}

export function exportProgress(progress: Progress) {
  const bundle = { ...progress, stories: loadStories(), askQuestions: loadAskQuestions() };
  const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `coach-progress-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/** Merges an imported file with what's already stored, dropping exact duplicates. */
export function mergeProgress(a: Progress, b: Progress): Progress {
  const seen = new Set<string>();
  const records: AnswerRecord[] = [];
  for (const record of [...a.records, ...b.records]) {
    const fingerprint = `${record.at}|${record.question}|${record.score}`;
    if (seen.has(fingerprint)) continue;
    seen.add(fingerprint);
    records.push(record);
  }
  records.sort((x, y) => x.at.localeCompare(y.at));
  return { version: 1, records };
}

export async function readProgressFile(file: File): Promise<Progress> {
  const text = await file.text();
  const json = JSON.parse(text) as { stories?: unknown; askQuestions?: unknown };
  const parsed = normalize(json);
  const stories = Array.isArray(json.stories) ? mergeStories(loadStories(), json.stories) : null;
  if (stories) saveStories(stories);
  if (Array.isArray(json.askQuestions)) {
    const merged = new Set([
      ...loadAskQuestions(),
      ...json.askQuestions.filter((q) => typeof q === "string"),
    ]);
    saveAskQuestions([...merged]);
  }
  if (!parsed.records.length && !stories?.length) {
    throw new Error("That file doesn't contain any practice history.");
  }
  return parsed;
}
