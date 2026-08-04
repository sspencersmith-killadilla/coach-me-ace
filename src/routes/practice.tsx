import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, Loader2, RotateCcw, Timer } from "lucide-react";
import { AnswerComposer } from "@/components/interview/AnswerComposer";
import { FeedbackCard } from "@/components/interview/FeedbackCard";
import { MockRecap, type MockResult } from "@/components/interview/MockRecap";
import { QuestionCard } from "@/components/interview/QuestionCard";
import { SessionProgress } from "@/components/interview/SessionProgress";
import { Button } from "@/components/ui/button";
import { QUESTION_COUNT } from "@/data/questions";
import { useJobBrief } from "@/lib/job-brief-context";
import { useResume } from "@/lib/resume-context";
import { buildPool, parseCategories, pickNext, type Mode } from "@/lib/session";
import { getInterviewFeedback, type InterviewFeedback } from "@/lib/feedback.functions";

const SESSION_OPTIONS = [5, 10, 20, QUESTION_COUNT];
const MODES: Mode[] = ["random", "sequential", "weakest", "mock"];

export const Route = createFileRoute("/practice")({
  validateSearch: (
    search: Record<string, unknown>,
  ): { mode: Mode; count: number; cats: string } => {
    const rawMode = String(search["mode"] ?? "");
    const mode = (MODES as string[]).includes(rawMode) ? (rawMode as Mode) : "random";
    const rawCount = Number(search["count"]);
    const count = SESSION_OPTIONS.includes(rawCount) ? rawCount : QUESTION_COUNT;
    const cats = typeof search["cats"] === "string" ? search["cats"] : "";
    return { mode, count, cats };
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

function formatClock(total: number) {
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function Practice() {
  const { mode, count, cats } = Route.useSearch();
  const requestFeedback = useServerFn(getInterviewFeedback);
  const { brief } = useJobBrief();
  const { resume } = useResume();

  const pool = useMemo(() => buildPool(parseCategories(cats)), [cats]);
  const sessionTotal = Math.min(count, pool.length);
  const isMock = mode === "mock";

  const [questionId, setQuestionId] = useState(
    () => pickNext(pool, mode, [], null, {})!,
  );
  const [askedIds, setAskedIds] = useState<number[]>(() => []);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scores, setScores] = useState<number[]>([]);
  const [categoryScores, setCategoryScores] = useState<Record<string, number[]>>({});
  const [followUpQuestion, setFollowUpQuestion] = useState<string | null>(null);

  // Mock-interview state
  const [transcript, setTranscript] = useState<{ question: string; answer: string }[]>([]);
  const [mockResults, setMockResults] = useState<MockResult[]>([]);
  const [grading, setGrading] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const question = pool.find((item) => item.id === questionId) ?? pool[0]!;
  const activeQuestion = followUpQuestion ?? question.text;
  const isFollowUp = followUpQuestion != null;
  const answeredCount = isMock ? transcript.length : scores.length;
  const averageScore = useMemo(
    () => (scores.length ? scores.reduce((sum, value) => sum + value, 0) / scores.length : null),
    [scores],
  );
  const finished = answeredCount >= sessionTotal;

  useEffect(() => {
    if (!isMock || finished) return;
    const id = setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => clearInterval(id);
  }, [isMock, finished]);

  const advance = useCallback(() => {
    setFeedback(null);
    setConfidence(null);
    setError(null);
    setAnswer("");
    setFollowUpQuestion(null);
    setAskedIds((previous) => {
      const asked = previous.includes(question.id) ? previous : [...previous, question.id];
      setQuestionId(pickNext(pool, mode, asked, question.id, categoryScores));
      return asked;
    });
  }, [pool, mode, question.id, categoryScores]);

  const submit = useCallback(async () => {
    if (isMock) {
      setTranscript((previous) => [
        ...previous,
        { question: activeQuestion, answer: answer.trim() },
      ]);
      advance();
      return;
    }

    setPending(true);
    setError(null);
    try {
      const result = await requestFeedback({
        data: {
          question: activeQuestion,
          answer: answer.trim(),
          ...(brief ? { jobBrief: brief } : {}),
          ...(resume ? { resume } : {}),
        },
      });
      setFeedback(result);
      setScores((previous) => [...previous, result.score]);
      setCategoryScores((previous) => ({
        ...previous,
        [question.category]: [...(previous[question.category] ?? []), result.score],
      }));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  }, [answer, brief, resume, activeQuestion, requestFeedback, isMock, advance, question.category]);

  const retry = useCallback(() => {
    setFeedback(null);
    setConfidence(null);
    setError(null);
  }, []);

  const practiceFollowUp = useCallback((followUp: string) => {
    setFollowUpQuestion(followUp);
    setFeedback(null);
    setConfidence(null);
    setError(null);
    setAnswer("");
  }, []);

  // Grade the whole mock interview once every question is answered.
  const gradedRef = useRef(false);
  const gradingContextRef = useRef({ transcript, brief, resume, requestFeedback });
  gradingContextRef.current = { transcript, brief, resume, requestFeedback };

  useEffect(() => {
    if (!isMock || !finished || gradedRef.current) return;
    gradedRef.current = true;
    setGrading(true);
    setError(null);
    void (async () => {
      const context = gradingContextRef.current;
      const collected: MockResult[] = [];
      for (const entry of context.transcript) {
        try {
          const result = await context.requestFeedback({
            data: {
              question: entry.question,
              answer: entry.answer,
              ...(context.brief ? { jobBrief: context.brief } : {}),
              ...(context.resume ? { resume: context.resume } : {}),
            },
          });
          collected.push({
            question: entry.question,
            answer: entry.answer,
            score: result.score,
            praise: result.praise,
            improvement: result.improvement,
          });
        } catch (caught) {
          setError(caught instanceof Error ? caught.message : "Some answers couldn't be scored.");
        }
        setMockResults([...collected]);
      }
      setGrading(false);
    })();
  }, [isMock, finished]);


  const restartMock = useCallback(() => {
    gradedRef.current = false;
    setTranscript([]);
    setMockResults([]);
    setElapsed(0);
    setAskedIds([]);
    setAnswer("");
    setError(null);
    setQuestionId(pickNext(pool, mode, [], null, {}));
  }, [pool, mode]);

  if (isMock && finished) {
    return (
      <div className="min-h-screen bg-background">
        <SessionProgress answered={transcript.length} total={sessionTotal} averageScore={null} />
        <main className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
          <MockRecap
            results={mockResults}
            grading={grading}
            gradedCount={mockResults.length}
            total={transcript.length}
            error={error}
            onRestart={restartMock}
          />
        </main>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="min-h-screen bg-background">
        <SessionProgress answered={scores.length} total={sessionTotal} averageScore={averageScore} />
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
                <Link to="/practice" search={{ mode, count, cats }}>
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
      <SessionProgress
        answered={answeredCount}
        total={sessionTotal}
        averageScore={isMock ? null : averageScore}
      />

      <main className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
        {isMock ? (
          <div className="mb-6 flex flex-wrap items-center justify-center gap-3 rounded-full border border-border bg-card px-5 py-2.5 text-sm shadow-sm sm:w-fit sm:mx-auto">
            <span className="flex items-center gap-2 font-medium text-foreground">
              <Timer className="size-4 text-primary" aria-hidden />
              {formatClock(elapsed)}
            </span>
            <span className="text-muted-foreground">
              Mock interview — no feedback until the end. Answer and move on.
            </span>
          </div>
        ) : null}

        <QuestionCard
          question={activeQuestion}
          category={question.category}
          index={answeredCount + 1}
          total={sessionTotal}
          isFollowUp={isFollowUp}
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
            <FeedbackCard
              feedback={feedback}
              question={activeQuestion}
              answer={answer}
              jobBrief={brief}
              resume={resume}
              confidence={confidence}
              onConfidence={setConfidence}
              onRetry={retry}
              onNext={advance}
              onPracticeFollowUp={practiceFollowUp}
            />
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
                onSkip={advance}
                pending={pending}
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
}
