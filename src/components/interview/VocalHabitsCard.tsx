import { AudioLines, TrendingDown, TrendingUp } from "lucide-react";
import { analyzeVocalHabits, formatSpokenLength } from "@/lib/answer-habits";

type Props = {
  answer: string;
  /** Filler-word rate (%) across earlier answers, so progress is visible. */
  previousFillerRate?: number | null;
  previousLabel?: string;
};

export function VocalHabitsCard({ answer, previousFillerRate, previousLabel }: Props) {
  const habits = analyzeVocalHabits(answer);
  if (!habits) return null;

  const delta =
    previousFillerRate != null ? habits.fillerRate - previousFillerRate : null;
  const improving = delta != null && delta < -0.2;
  const slipping = delta != null && delta > 0.2;

  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
        <AudioLines className="size-5 text-primary" aria-hidden />
        Vocal habits
      </h3>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full bg-secondary px-3 py-1 text-sm text-secondary-foreground">
          {habits.wordCount} words
        </span>
        <span className="rounded-full bg-secondary px-3 py-1 text-sm text-secondary-foreground">
          ~{formatSpokenLength(habits.spokenSeconds)} spoken
        </span>
        <span className="rounded-full bg-secondary px-3 py-1 text-sm text-secondary-foreground">
          {habits.totalFillers} filler word{habits.totalFillers === 1 ? "" : "s"}
        </span>
      </div>

      {habits.fillers.length ? (
        <ul className="mt-3 flex flex-wrap gap-2">
          {habits.fillers.map((filler) => (
            <li
              key={filler.word}
              className="rounded-full border border-border px-3 py-1 text-sm text-muted-foreground"
            >
              “{filler.word}” × {filler.count}
            </li>
          ))}
        </ul>
      ) : null}

      {delta != null ? (
        <p
          className={`mt-3 flex items-center gap-2 text-sm ${
            improving ? "text-primary" : "text-muted-foreground"
          }`}
        >
          {improving ? (
            <TrendingDown className="size-4" aria-hidden />
          ) : (
            <TrendingUp className="size-4" aria-hidden />
          )}
          {improving
            ? `Fewer fillers than ${previousLabel ?? "your earlier answers"} — ${habits.fillerRate.toFixed(1)}% now vs ${previousFillerRate?.toFixed(1)}% before.`
            : slipping
              ? `A few more fillers than ${previousLabel ?? "your earlier answers"} — ${habits.fillerRate.toFixed(1)}% vs ${previousFillerRate?.toFixed(1)}%. Worth a slower start on the next one.`
              : `Holding steady at about ${habits.fillerRate.toFixed(1)}% fillers, same as ${previousLabel ?? "before"}.`}
        </p>
      ) : null}

      <p className="mt-4 leading-relaxed text-muted-foreground">{habits.tip}</p>
    </section>
  );
}
