import { ArrowRight, Heart, Lightbulb, RotateCcw, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { InterviewFeedback } from "@/lib/feedback.functions";

type Props = {
  feedback: InterviewFeedback;
  onRetry: () => void;
  onNext: () => void;
};

function encouragement(score: number) {
  if (score >= 9) return "Outstanding — this one is interview-ready.";
  if (score >= 7) return "Strong answer. A small polish and it shines.";
  if (score >= 5) return "Good bones here. Let's sharpen the details together.";
  return "Great first pass — every rep makes this easier.";
}

export function FeedbackCard({ feedback, onRetry, onNext }: Props) {
  return (
    <div className="animate-rise space-y-4">
      <div className="flex flex-col items-center gap-3 rounded-3xl border border-border bg-warm p-6 text-center">
        <div className="flex size-20 items-center justify-center rounded-full bg-card text-warm-foreground shadow-sm">
          <span className="font-display text-3xl font-semibold">{feedback.score}</span>
          <span className="mt-2 text-sm text-muted-foreground">/10</span>
        </div>
        <p className="max-w-md text-sm font-medium text-warm-foreground">
          {encouragement(feedback.score)}
        </p>
      </div>

      <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <Heart className="size-5 text-accent" aria-hidden />
          What you did really well
        </h3>
        <p className="mt-2 leading-relaxed text-muted-foreground">{feedback.praise}</p>
      </section>

      <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <Lightbulb className="size-5 text-primary" aria-hidden />
          One thing to sharpen
        </h3>
        <p className="mt-2 leading-relaxed text-muted-foreground">{feedback.improvement}</p>
      </section>

      <section className="rounded-3xl border border-border bg-secondary p-6">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-secondary-foreground">
          <Star className="size-5 text-accent" aria-hidden />
          An ideal STAR version
        </h3>
        <p className="mt-2 leading-relaxed whitespace-pre-line text-secondary-foreground/90">
          {feedback.starAnswer}
        </p>
      </section>

      <div className="flex flex-wrap gap-3 pt-1">
        <Button onClick={onNext} size="lg" className="rounded-full">
          Next question
          <ArrowRight className="size-4" aria-hidden />
        </Button>
        <Button onClick={onRetry} variant="secondary" size="lg" className="rounded-full">
          <RotateCcw className="size-4" aria-hidden />
          Try this one again
        </Button>
      </div>
    </div>
  );
}
