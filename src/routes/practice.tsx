import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useMemo, useState } from "react";
import { AlertCircle, Loader2, RotateCcw } from "lucide-react";
import { AnswerComposer } from "@/components/interview/AnswerComposer";
import { FeedbackCard } from "@/components/interview/FeedbackCard";
import { QuestionCard } from "@/components/interview/QuestionCard";
import { SessionProgress } from "@/components/interview/SessionProgress";
import { Button } from "@/components/ui/button";
import { QUESTIONS, QUESTION_COUNT } from "@/data/questions";
import { useJobBrief } from "@/lib/job-brief-context";
import { useResume } from "@/lib/resume-context";
import { getInterviewFeedback, type InterviewFeedback } from "@/lib/feedback.functions";

type Mode = "random" | "sequential";

const SESSION_OPTIONS = [5, 10, 20, QUESTION_COUNT];

export const Route = createFileRoute("/practice")({
  validateSearch: (search: Record<string, unknown>): { mode: Mode; count: number } => {
    const mode = search["mode"] === "sequential" ? "sequential" : "random";
    const rawCount = Number(search["count"]);
    const count = SESSION_OPTIONS.includes(rawCount) ? rawCount : QUESTION_COUNT;
    return { mode, count };
  },
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
  const { mode, count } = Route.useSearch();
  const requestFeedback = useServerFn(getInterviewFeedback);
  const { brief } = useJobBrief();
  const { resume } = useResume();

  const [index, setIndex] = useState(() => (mode === "random" ? pickRandomIndex(null) : 0));
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scores, setScores] = useState<number[]>([]);
  const [followUpQuestion, setFollowUpQuestion] = useState<string | null>(null);

  const question = QUESTIONS[index]!;
  const activeQuestion = followUpQuestion ?? question.text;
  const isFollowUp = followUpQuestion != null;
  const averageScore = useMemo(
    () => (scores.length ? scores.reduce((sum, value) => sum + value, 0) / scores.length : null),
    [scores],
  );
  const finished = scores.length >= count;

  const submit = useCallback(async () => {
    setPending(true);
    setError(null);
    try {
      const result = await requestFeedback({
        data: {
          question: question.text,
          answer: answer.trim(),
          ...(brief ? { jobBrief: brief } : {}),
          ...(resume ? { resume } : {}),
        },
      });
      setFeedback(result);
      setScores((previous) => [...previous, result.score]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  }, [answer, brief, resume, question.text, requestFeedback]);

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

  if (finished) {
    return (
      <div className="min-h-screen bg-background">
        <SessionProgress answered={scores.length} total={count} averageScore={averageScore} />
        <main className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
          <div className="animate-rise rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
            <h1 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
              Session complete
            </h1>
            <p className="mx-auto mt-3 max-w-md text-muted-foreground">
              You answered {scores.length} question{scores.length === 1 ? "" : "s"} with an average
              score of {averageScore?.toFixed(1)}/10.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" className="rounded-full px-7">
                <Link to="/">Back to start</Link>
              </Button>
              <Button asChild variant="secondary" size="lg" className="rounded-full px-7">
                <Link to="/practice" search={{ mode, count }}>
                  <RotateCcw className="size-4" aria-hidden />
                  Start another round
                </Link>
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SessionProgress answered={scores.length} total={count} averageScore={averageScore} />

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
