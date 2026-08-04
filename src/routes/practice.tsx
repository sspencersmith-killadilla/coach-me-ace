import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useMemo, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { AnswerComposer } from "@/components/interview/AnswerComposer";
import { FeedbackCard } from "@/components/interview/FeedbackCard";
import { QuestionCard } from "@/components/interview/QuestionCard";
import { SessionProgress } from "@/components/interview/SessionProgress";
import { Button } from "@/components/ui/button";
import { QUESTIONS, QUESTION_COUNT } from "@/data/questions";
import { useJobBrief } from "@/lib/job-brief-context";
import { getInterviewFeedback, type InterviewFeedback } from "@/lib/feedback.functions";

type Mode = "random" | "sequential";

export const Route = createFileRoute("/practice")({
  validateSearch: (search: Record<string, unknown>): { mode: Mode } => ({
    mode: search["mode"] === "sequential" ? "sequential" : "random",
  }),
  head: () => ({
    meta: [
      { title: "Practice Session — Mock Interview Coach" },
      {
        name: "description",
        content:
          "Answer an interview question by typing or speaking, then get an encouraging score, praise, one improvement, and a STAR-method model answer.",
      },
      { property: "og:title", content: "Practice Session — Mock Interview Coach" },
      {
        property: "og:description",
        content:
          "Answer an interview question by typing or speaking, then get an encouraging score, praise, one improvement, and a STAR-method model answer.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Practice,
});

function pickRandomIndex(exclude: number | null) {
  if (QUESTION_COUNT <= 1) return 0;
  let next = exclude ?? 0;
  while (next === exclude) {
    next = Math.floor(Math.random() * QUESTION_COUNT);
  }
  return next;
}

function Practice() {
  const { mode } = Route.useSearch();
  const requestFeedback = useServerFn(getInterviewFeedback);
  const { brief } = useJobBrief();


  const [index, setIndex] = useState(() => (mode === "random" ? pickRandomIndex(null) : 0));
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scores, setScores] = useState<number[]>([]);

  const question = QUESTIONS[index]!;
  const averageScore = useMemo(
    () => (scores.length ? scores.reduce((sum, value) => sum + value, 0) / scores.length : null),
    [scores],
  );

  const submit = useCallback(async () => {
    setPending(true);
    setError(null);
    try {
      const result = await requestFeedback({
        data: { question: question.text, answer: answer.trim(), ...(brief ? { jobBrief: brief } : {}) },
      });
      setFeedback(result);
      setScores((previous) => [...previous, result.score]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  }, [answer, brief, question.text, requestFeedback]);

  const nextQuestion = useCallback(() => {
    setFeedback(null);
    setError(null);
    setAnswer("");
    setIndex((current) =>
      mode === "random" ? pickRandomIndex(current) : (current + 1) % QUESTION_COUNT,
    );
  }, [mode]);

  const retry = useCallback(() => {
    setFeedback(null);
    setError(null);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SessionProgress answered={scores.length} averageScore={averageScore} />

      <main className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
        <QuestionCard
          question={question.text}
          category={question.category}
          index={question.id}
          total={QUESTION_COUNT}
        />

        <div className="mt-8">
          {pending ? (
            <div className="animate-rise flex flex-col items-center gap-3 rounded-3xl border border-border bg-card p-12 text-center shadow-sm">
              <Loader2 className="size-6 animate-spin text-primary" aria-hidden />
              <p className="font-medium text-foreground">Reading your answer closely…</p>
              <p className="text-sm text-muted-foreground">
                Looking for what you did well before anything else.
              </p>
            </div>
          ) : feedback ? (
            <FeedbackCard feedback={feedback} onRetry={retry} onNext={nextQuestion} />
          ) : (
            <>
              {error ? (
                <div className="animate-rise mb-4 flex items-start gap-3 rounded-2xl border border-border bg-warm p-4">
                  <AlertCircle className="mt-0.5 size-5 text-warm-foreground" aria-hidden />
                  <div className="flex-1">
                    <p className="text-sm text-warm-foreground">{error}</p>
                    <Button
                      variant="link"
                      className="h-auto p-0 text-sm text-warm-foreground"
                      onClick={submit}
                    >
                      Try again
                    </Button>
                  </div>
                </div>
              ) : null}
              <AnswerComposer
                value={answer}
                onChange={setAnswer}
                onSubmit={submit}
                onSkip={nextQuestion}
                pending={pending}
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
}
