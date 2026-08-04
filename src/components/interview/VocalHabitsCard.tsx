import { AudioLines } from "lucide-react";
import { analyzeVocalHabits, formatSpokenLength } from "@/lib/answer-habits";

type Props = { answer: string };

export function VocalHabitsCard({ answer }: Props) {
  const habits = analyzeVocalHabits(answer);
  if (!habits) return null;

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

      <p className="mt-4 leading-relaxed text-muted-foreground">{habits.tip}</p>
    </section>
  );
}
