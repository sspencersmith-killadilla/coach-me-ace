import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, Loader2, RotateCcw, Timer } from "lucide-react";
import { AnswerComposer } from "@/components/interview/AnswerComposer";
import { AttemptComparison } from "@/components/interview/AttemptComparison";
import { FeedbackCard } from "@/components/interview/FeedbackCard";
import { SaveStory } from "@/components/interview/SaveStory";
import { MockRecap, type MockResult } from "@/components/interview/MockRecap";
import { QuestionCard } from "@/components/interview/QuestionCard";
import { SessionProgress } from "@/components/interview/SessionProgress";
import { Button } from "@/components/ui/button";
import { QUESTION_COUNT } from "@/data/questions";
import { useQuestionVoice } from "@/hooks/use-question-voice";
import { analyzeVocalHabits } from "@/lib/answer-habits";
import { useBriefing } from "@/lib/briefing-context";
import { useJobBrief } from "@/lib/job-brief-context";
import { usePromotion } from "@/lib/promotion-context";
import {
  appendRecords,
  categoryScores as historyCategoryScores,
  loadProgress,
  saveProgress,
  summarize,
  type AnswerRecord,
} from "@/lib/progress";
import { useResume } from "@/lib/resume-context";
import {
  buildPool,
  parseCategories,
  pickNext,
  PROMOTION_CATEGORIES,
  type Mode,
} from "@/lib/session";
import { getInterviewFeedback, type InterviewFeedback } from "@/lib/feedback.functions";
import { getFollowUps } from "@/lib/follow-ups.functions";

const SESSION_OPTIONS = [5, 10, 20, QUESTION_COUNT];
const TIME_LIMITS = [60, 90, 120];
const MODES: Mode[] = ["random", "sequential", "weakest", "mock", "promotion"];
type Tone = "warm" | "tough";

export const Route = createFileRoute("/practice")({
  validateSearch: (
    search: Record<string, unknown>,
  ): { mode: Mode; count: number; cats: string; tone: Tone; limit?: number } => {
    const rawMode = String(search["mode"] ?? "");
    const mode = (MODES as string[]).includes(rawMode) ? (rawMode as Mode) : "random";
    const rawCount = Number(search["count"]);
    const count = SESSION_OPTIONS.includes(rawCount) ? rawCount : QUESTION_COUNT;
    const cats = typeof search["cats"] === "string" ? search["cats"] : "";
    const tone: Tone = search["tone"] === "tough" ? "tough" : "warm";
    const rawLimit = Number(search["limit"]);
    return TIME_LIMITS.includes(rawLimit)
      ? { mode, count, cats, tone, limit: rawLimit }
      : { mode, count, cats, tone };
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

function wordsIn(text: string) {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

type TranscriptEntry = {
  question: string;
  category: string;
  answer: string;
  isFollowUp: boolean;
};

function Practice() {
  const { mode, count, cats, tone, limit } = Route.useSearch();
  const requestFeedback = useServerFn(getInterviewFeedback);
  const requestFollowUps = useServerFn(getFollowUps);
  const { brief } = useJobBrief();
  const { resume } = useResume();
  const { promotion } = usePromotion();
  const { queuedQuestions, setQueuedQuestions, hydrated: briefingHydrated } = useBriefing();
  const voice = useQuestionVoice(tone);

  const isPromotionMode = mode === "promotion";
  const pool = useMemo(
    () => buildPool(isPromotionMode ? PROMOTION_CATEGORIES : parseCategories(cats)),
    [cats, isPromotionMode],
  );
  const sessionTotal = Math.min(count, pool.length);
  const isMock = mode === "mock";

  const [questionId, setQuestionId] = useState(() => pickNext(pool, mode, [], null, {})!);
  const [askedIds, setAskedIds] = useState<number[]>(() => []);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const [firstAttempt, setFirstAttempt] = useState<{
    answer: string;
    feedback: InterviewFeedback;
  } | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scores, setScores] = useState<number[]>([]);
  const [categoryScores, setCategoryScores] = useState<Record<string, number[]>>({});
  const [followUpQuestion, setFollowUpQuestion] = useState<string | null>(null);
  const [historyFillerRate, setHistoryFillerRate] = useState<number | null>(null);
  const [seededHistory, setSeededHistory] = useState(false);
  const [briefingQueue, setBriefingQueue] = useState<string[]>([]);
  const [seededQueue, setSeededQueue] = useState(false);

  // Mock-interview state
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [mockResults, setMockResults] = useState<MockResult[]>([]);
  const [grading, setGrading] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  // Weak-spot tracking and filler trends start from saved history, not zero.
  useEffect(() => {
    const progress = loadProgress();
    if (progress.records.length) {
      setCategoryScores(historyCategoryScores(progress));
      setHistoryFillerRate(summarize(progress).fillerRate);
    }
    setSeededHistory(true);
  }, []);

  // Questions the pre-interview briefing suggested come first, once per session.
  useEffect(() => {
    if (!briefingHydrated || seededQueue) return;
    if (queuedQuestions.length) {
      setBriefingQueue(queuedQuestions);
      setQueuedQuestions([]);
    }
    setSeededQueue(true);
  }, [briefingHydrated, seededQueue, queuedQuestions, setQueuedQuestions]);

  const question = pool.find((item) => item.id === questionId) ?? pool[0]!;
  const briefingQuestion = briefingQueue[0] ?? null;
  const activeQuestion = followUpQuestion ?? briefingQuestion ?? question.text;
  const isFollowUp = followUpQuestion != null;
  const answeredCount = isMock
    ? transcript.filter((entry) => !entry.isFollowUp).length
    : scores.length;
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

  // The interviewer reads each new question aloud.
  useEffect(() => {
    if (voice.muted || !voice.ready || finished) return;
    void voice.speak(activeQuestion);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeQuestion, voice.muted, voice.ready, finished]);

  const recordAnswer = useCallback(
    (entry: { question: string; category: string; answer: string; score: number }) => {
      const habits = analyzeVocalHabits(entry.answer);
      const record: AnswerRecord = {
        at: new Date().toISOString(),
        question: entry.question,
        category: entry.category,
        mode,
        score: entry.score,
        words: wordsIn(entry.answer),
        fillers: habits?.totalFillers ?? 0,
        confidence: null,
      };
      appendRecords([record]);
    },
    [mode],
  );

  const noteConfidence = useCallback((value: number) => {
    setConfidence(value);
    const progress = loadProgress();
    const last = progress.records[progress.records.length - 1];
    if (last) {
      last.confidence = value;
      saveProgress(progress);
    }
  }, []);

  const advance = useCallback(() => {
    setFeedback(null);
    setFirstAttempt(null);
    setConfidence(null);
    setError(null);
    setAnswer("");
    setFollowUpQuestion(null);
    if (briefingQueue.length) {
      setBriefingQueue((previous) => previous.slice(1));
      return;
    }
    setAskedIds((previous) => {
      const asked = previous.includes(question.id) ? previous : [...previous, question.id];
      setQuestionId(pickNext(pool, mode, asked, question.id, categoryScores));
      return asked;
    });
  }, [pool, mode, question.id, categoryScores, briefingQueue.length]);

  const submit = useCallback(async () => {
    const given = answer.trim();

    if (isMock) {
      const nextTranscript: TranscriptEntry[] = [
        ...transcript,
        { question: activeQuestion, category: question.category, answer: given, isFollowUp },
      ];
      setTranscript(nextTranscript);

      const baseAnswers = nextTranscript.filter((entry) => !entry.isFollowUp).length;
      const shouldPush = !isFollowUp && wordsIn(given) >= 30 && baseAnswers < sessionTotal;

      if (shouldPush) {
        // A real panel pushes back on the spot — pull one live follow-up.
        setPending(true);
        setError(null);
        try {
          const result = await requestFollowUps({
            data: {
              question: activeQuestion,
              answer: given,
              ...(brief ? { jobBrief: brief } : {}),
              ...(resume ? { resume } : {}),
              ...(promotion.isActive ? { promotion } : {}),
            },
          });
          const next = result.followUps[0]?.question;
          if (next) {
            setAnswer("");
            setFollowUpQuestion(next);
            setPending(false);
            return;
          }
        } catch {
          /* the mock keeps moving even if the follow-up can't be generated */
        }
        setPending(false);
      }

      advance();
      return;
    }

    setPending(true);
    setError(null);
    try {
      const result = await requestFeedback({
        data: {
          question: activeQuestion,
          answer: given,
          tone,
          ...(brief ? { jobBrief: brief } : {}),
          ...(resume ? { resume } : {}),
          ...(promotion.isActive ? { promotion } : {}),
        },
      });
      setFeedback(result);
      setScores((previous) => [...previous, result.score]);
      setCategoryScores((previous) => ({
        ...previous,
        [question.category]: [...(previous[question.category] ?? []), result.score],
      }));
      recordAnswer({
        question: activeQuestion,
        category: question.category,
        answer: given,
        score: result.score,
      });
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Something went wrong. Please try again.",
      );
    } finally {
      setPending(false);
    }
  }, [
    answer,
    brief,
    resume,
    promotion,
    activeQuestion,
    requestFeedback,
    requestFollowUps,
    isMock,
    isFollowUp,
    transcript,
    sessionTotal,
    advance,
    question.category,
    recordAnswer,
    tone,
  ]);

  const retry = useCallback(() => {
    if (feedback) setFirstAttempt((previous) => previous ?? { answer, feedback });
    setFeedback(null);
    setConfidence(null);
    setError(null);
  }, [feedback, answer]);

  const practiceFollowUp = useCallback((followUp: string) => {
    setFirstAttempt(null);
    setFollowUpQuestion(followUp);
    setFeedback(null);
    setConfidence(null);
    setError(null);
    setAnswer("");
  }, []);

  // Grade the whole mock interview once every question is answered.
  const gradedRef = useRef(false);
  const gradingContextRef = useRef({ transcript, brief, resume, promotion, requestFeedback, tone });
  gradingContextRef.current = { transcript, brief, resume, promotion, requestFeedback, tone };

  useEffect(() => {
    if (!isMock || !finished || gradedRef.current) return;
    gradedRef.current = true;
    setGrading(true);
    setError(null);
    void (async () => {
      const context = gradingContextRef.current;
      const collected: MockResult[] = [];
      const records: AnswerRecord[] = [];
      for (const entry of context.transcript) {
        try {
          const result = await context.requestFeedback({
            data: {
              question: entry.question,
              answer: entry.answer,
              tone: context.tone,
              ...(context.brief ? { jobBrief: context.brief } : {}),
              ...(context.resume ? { resume: context.resume } : {}),
              ...(context.promotion.isActive ? { promotion: context.promotion } : {}),
            },
          });
          collected.push({
            question: entry.question,
            answer: entry.answer,
            score: result.score,
            praise: result.praise,
            improvement: result.improvement,
          });
          records.push({
            at: new Date().toISOString(),
            question: entry.question,
            category: entry.isFollowUp ? "Follow-up" : entry.category,
            mode: "mock",
            score: result.score,
            words: wordsIn(entry.answer),
            fillers: analyzeVocalHabits(entry.answer)?.totalFillers ?? 0,
            confidence: null,
          });
        } catch (caught) {
          setError(caught instanceof Error ? caught.message : "Some answers couldn't be scored.");
        }
        setMockResults([...collected]);
      }
      if (records.length) appendRecords(records);
      setGrading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMock, finished]);

  const restartMock = useCallback(() => {
    gradedRef.current = false;
    setTranscript([]);
    setMockResults([]);
    setElapsed(0);
    setAskedIds([]);
    setAnswer("");
    setError(null);
    setFollowUpQuestion(null);
    setQuestionId(pickNext(pool, mode, [], null, {}));
  }, [pool, mode]);

  const voiceControls = {
    muted: voice.muted,
    speaking: voice.speaking,
    loading: voice.loading,
    onReplay: () => void voice.speak(activeQuestion),
    onToggleMute: voice.toggleMute,
  };

  if (isMock && finished) {
    return (
      <div className="min-h-screen bg-background">
        <SessionProgress answered={answeredCount} total={sessionTotal} averageScore={null} />
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
        <SessionProgress
          answered={scores.length}
          total={sessionTotal}
          averageScore={averageScore}
        />
        <main className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
          <div className="animate-rise rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
            <h1 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
              Session complete
            </h1>
            <p className="mx-auto mt-3 max-w-md text-muted-foreground">
              You answered {scores.length} question{scores.length === 1 ? "" : "s"} with an average
              score of {averageScore?.toFixed(1)}/10. It's saved to your progress on this device.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" className="rounded-full px-7">
                <Link to="/">Back to start</Link>
              </Button>
              <Button asChild variant="secondary" size="lg" className="rounded-full px-7">
                <Link to="/practice" search={{ mode, count, cats, tone, ...(limit ? { limit } : {}) }}>
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
              Mock interview — expect follow-ups, and no feedback until the end.
            </span>
          </div>
        ) : null}

        {tone === "tough" ? (
          <p className="mb-6 text-center text-sm text-muted-foreground">
            Tough panelist mode: strict scoring, blunt critique.
          </p>
        ) : null}

        <QuestionCard
          question={activeQuestion}
          category={question.category}
          index={answeredCount + 1}
          total={sessionTotal}
          isFollowUp={isFollowUp}
          {...(voice.ready ? { voice: voiceControls } : {})}
        />

        {voice.error ? (
          <p className="mt-3 text-center text-sm text-warm-foreground">{voice.error}</p>
        ) : null}

        <div className="mt-8">
          {pending ? (
            <div className="animate-rise flex flex-col items-center gap-3 rounded-3xl border border-border bg-card p-12 text-center shadow-sm">
              <Loader2 className="size-6 animate-spin text-primary" aria-hidden />
              <p className="font-medium text-foreground">
                {isMock ? "The panel is thinking…" : "Reading your answer closely…"}
              </p>
              <p className="text-sm text-muted-foreground">
                {isMock
                  ? "They may push back on what you just said."
                  : "Looking for what you did well before anything else."}
              </p>
            </div>
          ) : feedback ? (
            <>
            {firstAttempt ? (
              <AttemptComparison first={firstAttempt} second={{ answer, feedback }} />
            ) : null}
            <FeedbackCard
              feedback={feedback}
              question={activeQuestion}
              answer={answer}
              jobBrief={brief}
              resume={resume}
              confidence={confidence}
              tone={tone}
              {...(seededHistory && historyFillerRate != null
                ? { previousFillerRate: historyFillerRate, previousFillerLabel: "your history" }
                : {})}
              onConfidence={noteConfidence}
              onRetry={retry}
              onNext={advance}
              onPracticeFollowUp={practiceFollowUp}
            />
            <div className="mt-6">
              <SaveStory
                key={`${activeQuestion}-${feedback.score}`}
                question={activeQuestion}
                answer={answer}
                score={feedback.score}
              />
            </div>
            </>
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
                key={`${activeQuestion}-${scores.length}-${transcript.length}`}
                {...(limit ? { timeLimit: limit } : {})}
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
