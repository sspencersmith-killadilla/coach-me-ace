import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import type { InterviewFeedback } from "@/lib/feedback.functions";

type Attempt = { answer: string; feedback: InterviewFeedback };

export function AttemptComparison({ first, second }: { first: Attempt; second: Attempt }) {
  const delta = second.feedback.score - first.feedback.score;
  const Icon = delta > 0 ? ArrowUpRight : delta < 0 ? ArrowDownRight : ArrowRight;
  const headline =
    delta > 0
      ? `Up ${delta} point${delta === 1 ? "" : "s"} — the retry worked.`
      : delta < 0
        ? `Down ${Math.abs(delta)} — the first take was stronger. Compare what changed.`
        : "Same score — look at what shifted and what didn't.";

  return (
    <section className="animate-rise mb-6 rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <Icon className="size-5 text-primary" aria-hidden />
        <h2 className="font-display text-lg font-semibold text-foreground">{headline}</h2>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {[
          { label: "First attempt", attempt: first },
          { label: "This attempt", attempt: second },
        ].map(({ label, attempt }) => (
          <div key={label} className="rounded-2xl bg-muted p-4">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-semibold text-foreground">{label}</span>
              <span className="font-display text-xl font-semibold text-foreground">
                {attempt.feedback.score}/10
              </span>
            </div>
            <p className="mt-2 line-clamp-6 text-sm leading-relaxed text-muted-foreground">
              {attempt.answer}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">What improved: </span>
        {second.feedback.praise}
      </p>
    </section>
  );
}
