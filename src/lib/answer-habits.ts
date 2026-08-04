export type VocalHabits = {
  wordCount: number;
  fillers: { word: string; count: number }[];
  totalFillers: number;
  fillerRate: number;
  spokenSeconds: number;
  tip: string;
};

const FILLER_PATTERNS: { word: string; pattern: RegExp }[] = [
  { word: "um", pattern: /\b(?:um+|umm+|uhm+)\b/gi },
  { word: "uh", pattern: /\b(?:uh+|er+|erm+)\b/gi },
  { word: "like", pattern: /\b(?:like)\b(?=,|\s+(?:i|we|you|it|he|she|they|a|the|really|just|kind|sort))/gi },
  { word: "you know", pattern: /\byou know\b/gi },
  { word: "sort of", pattern: /\bsort of\b/gi },
  { word: "kind of", pattern: /\bkind of\b/gi },
  { word: "basically", pattern: /\bbasically\b/gi },
  { word: "actually", pattern: /\bactually\b/gi },
  { word: "I mean", pattern: /\bi mean\b/gi },
  { word: "literally", pattern: /\bliterally\b/gi },
];

const WORDS_PER_MINUTE = 150;

export function analyzeVocalHabits(answer: string): VocalHabits | null {
  const text = answer.trim();
  const wordCount = text ? text.split(/\s+/).length : 0;
  if (wordCount < 25) return null;

  const fillers = FILLER_PATTERNS.map(({ word, pattern }) => ({
    word,
    count: (text.match(pattern) ?? []).length,
  }))
    .filter((entry) => entry.count > 0)
    .sort((a, b) => b.count - a.count);

  const totalFillers = fillers.reduce((sum, entry) => sum + entry.count, 0);
  const fillerRate = (totalFillers / wordCount) * 100;
  const spokenSeconds = Math.round((wordCount / WORDS_PER_MINUTE) * 60);

  const topCount = fillers[0]?.count ?? 0;
  let tip: string;
  if (totalFillers === 0) {
    tip = "Clean delivery — no filler words at all. Keep leaning on short pauses instead of sound.";
  } else if (fillerRate < 2) {
    tip = `A few "${fillers[0]!.word}"s slipped in, which is completely normal. A short silent beat where they land will make you sound even more certain.`;
  } else if (topCount <= 2) {
    tip = `A handful of small fillers crept in — "${fillers.map((f) => f.word).join('", "')}". Try one silent beat instead of each of them; silence reads as confidence.`;
  } else if (fillerRate < 4) {
    tip = `You lean on "${fillers[0]!.word}" while you think. Try pausing silently for one second instead — silence reads as confidence.`;
  } else {
    tip = `"${fillers[0]!.word}" is showing up a lot. Slow down slightly and finish one thought before starting the next; the fillers usually disappear on their own.`;
  }


  if (wordCount > 320) {
    tip += " This answer also runs long — aim for about 90 seconds out loud.";
  } else if (wordCount < 60) {
    tip += " It's also on the short side — one more concrete detail would give it weight.";
  }

  return { wordCount, fillers, totalFillers, fillerRate, spokenSeconds, tip };
}

export function formatSpokenLength(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  if (minutes === 0) return `${rest}s`;
  return `${minutes}m ${String(rest).padStart(2, "0")}s`;
}
