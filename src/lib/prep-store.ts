/** On-device storage for the story bank and the user's saved "questions to ask them". */

export const STORY_TAGS = [
  "Leadership",
  "Teamwork",
  "Conflict",
  "Failure & learning",
  "Problem solving",
  "Results & impact",
  "Initiative",
  "Pressure & deadlines",
  "Communication",
  "Customer focus",
] as const;

/** Which story tags naturally answer each question category. */
export const CATEGORY_TAGS: Record<string, string[]> = {
  "Teamwork & Leadership": ["Leadership", "Teamwork", "Conflict"],
  Accomplishments: ["Results & impact", "Initiative"],
  "Problem Solving": ["Problem solving", "Pressure & deadlines"],
  "Setbacks & Growth": ["Failure & learning"],
  "Skills & Work Style": ["Communication", "Pressure & deadlines"],
};

export type Story = {
  id: string;
  title: string;
  tags: string[];
  text: string;
  sourceQuestion: string;
  score: number | null;
  savedAt: string;
};

const STORY_KEY = "coach-stories-v1";
const ASK_KEY = "coach-ask-questions-v1";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage blocked */
  }
}

function isStory(value: unknown): value is Story {
  const s = value as Partial<Story> | null;
  return !!s && typeof s.id === "string" && typeof s.title === "string" && typeof s.text === "string";
}

export function loadStories(): Story[] {
  const raw = read<unknown>(STORY_KEY, []);
  return Array.isArray(raw)
    ? raw.filter(isStory).map((s) => ({ ...s, tags: Array.isArray(s.tags) ? s.tags : [] }))
    : [];
}

export function saveStories(stories: Story[]) {
  write(STORY_KEY, stories);
}

export function addStory(story: Omit<Story, "id" | "savedAt">): Story {
  const full: Story = {
    ...story,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    savedAt: new Date().toISOString(),
  };
  saveStories([...loadStories(), full]);
  return full;
}

export function mergeStories(a: Story[], b: Story[]): Story[] {
  const byId = new Map<string, Story>();
  for (const story of [...a, ...b]) if (isStory(story)) byId.set(story.id, story);
  return [...byId.values()];
}

/** Tag → number of stories covering it; tags with 0 are gaps. */
export function tagCoverage(stories: Story[]): Record<string, number> {
  const coverage: Record<string, number> = Object.fromEntries(STORY_TAGS.map((t) => [t, 0]));
  for (const story of stories) for (const tag of story.tags) coverage[tag] = (coverage[tag] ?? 0) + 1;
  return coverage;
}

/** Best-scoring stories first, ties broken by recency. */
export function topStories(stories: Story[], limit = 5): Story[] {
  return [...stories]
    .sort((x, y) => (y.score ?? 0) - (x.score ?? 0) || y.savedAt.localeCompare(x.savedAt))
    .slice(0, limit);
}

export function loadAskQuestions(): string[] {
  const raw = read<unknown>(ASK_KEY, []);
  return Array.isArray(raw) ? raw.filter((q): q is string => typeof q === "string") : [];
}

export function saveAskQuestions(questions: string[]) {
  write(ASK_KEY, questions);
}
