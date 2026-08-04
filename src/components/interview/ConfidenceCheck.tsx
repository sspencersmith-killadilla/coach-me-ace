import { Gauge } from "lucide-react";

type Props = {
  value: number | null;
  score: number;
  onChange: (value: number) => void;
};

const LEVELS = [
  { value: 1, label: "Shaky" },
  { value: 2, label: "Unsure" },
  { value: 3, label: "Okay" },
  { value: 4, label: "Solid" },
  { value: 5, label: "Ready" },
];

export function ConfidenceCheck({ value, score, onChange }: Props) {
  const flagged = value !== null && (value <= 2 || score <= 5);

  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
        <Gauge className="size-5 text-primary" aria-hidden />
        How confident did that feel?
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Your gut read matters as much as the score — it tells you what to rehearse again.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {LEVELS.map((level) => (
          <button
            key={level.value}
            type="button"
            onClick={() => onChange(level.value)}
            aria-pressed={value === level.value}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              value === level.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
            }`}
          >
            {level.value} · {level.label}
          </button>
        ))}
      </div>

      {value !== null ? (
        <p className="mt-4 text-sm text-muted-foreground">
          {flagged
            ? "Worth revisiting — put this one on your short list to run again before the interview."
            : "Nice — this one is landing. Keep it in your back pocket for the real thing."}
        </p>
      ) : null}
    </section>
  );
}
