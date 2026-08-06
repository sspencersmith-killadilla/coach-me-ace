import { Link } from "@tanstack/react-router";
import { Loader2, RotateCcw, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

export type MockResult = {
  question: string;
  answer: string;
  score: number;
  praise: string;
  improvement: string;
};

type Props = {
  results: MockResult[];
  grading: boolean;
  gradedCount: number;
  total: number;
  error: string | null;
  onRestart: () => void;
};

export function MockRecap({ results, grading, gradedCount, total, error, onRestart }: Props) {
  const average = results.length
    ? results.reduce((sum, result) => sum + result.score, 0) / results.length
    : null;
  const priorities = [...results].sort((a, b) => a.score - b.score).slice(0, 3);

  return (
    <div className="animate-rise space-y-4">
      <div className="rounded-3xl border border-border bg-warm p-8 text-center">
        <h1 className="font-display text-2xl font-semibold text-warm-foreground sm:text-3xl">
          Mock interview complete
        </h1>
        <p className="mx-auto mt-3 max-w-md text-warm-foreground/90">
          {grading
            ? `Reviewing your answers — ${gradedCount} of ${total} scored…`
            : average !== null
              ? `You answered ${results.length} question${results.length === 1 ? "" : "s"} back-to-back with an average score of ${average.toFixed(1)}/10.`
              : "Here's how it went."}
        </p>
        {grading ? (
          <Loader2 className="mx-auto mt-4 size-6 animate-spin text-warm-foreground" aria-hidden />
        ) : null}
      </div>

      {error ? (
        <p className="rounded-2xl border border-border bg-card p-4 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {!grading && priorities.length ? (
        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <Target className="size-5 text-primary" aria-hidden />
            Work on these first
          </h2>
          <ol className="mt-4 space-y-3">
            {priorities.map((result, index) => (
              <li key={index} className="rounded-2xl bg-secondary/60 p-4">
                <p className="text-sm font-medium text-foreground">{result.question}</p>
                <p className="mt-1 text-sm text-muted-foreground">{result.improvement}</p>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {results.map((result, index) => (
        <section key={index} className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <h3 className="font-medium text-foreground">{result.question}</h3>
            <span className="shrink-0 rounded-full bg-secondary px-3 py-1 text-sm font-semibold text-secondary-foreground">
              {result.score}/10
            </span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{result.praise}</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{result.improvement}</p>
        </section>
      ))}

      {!grading ? (
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Button asChild size="lg" className="rounded-full px-7">
            <Link to="/">Back to start</Link>
          </Button>
          <Button onClick={onRestart} variant="secondary" size="lg" className="rounded-full px-7">
            <RotateCcw className="size-4" aria-hidden />
            Run another mock
          </Button>
        </div>
      ) : null}
    </div>
  );
}
