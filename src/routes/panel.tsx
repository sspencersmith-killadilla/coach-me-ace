import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Loader2, RotateCcw, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { AnswerComposer } from "@/components/interview/AnswerComposer";
import { QuestionCard } from "@/components/interview/QuestionCard";
import { ToolPage } from "@/components/interview/ToolPage";
import { Button } from "@/components/ui/button";
import { QUESTIONS } from "@/data/questions";
import { useQuestionVoice } from "@/hooks/use-question-voice";
import { getPanelReview } from "@/lib/prep.functions";
import { PANELISTS, type PanelistId, type PanelReview } from "@/lib/prep-schema";
import { usePrepContext } from "@/lib/use-prep-context";

const TITLE = "Panel interview — Mock Interview Coach";
const DESC =
  "Face a three-person panel — hiring manager, HR, and a future peer — each with their own voice and priorities, then see who you won over.";

export const Route = createFileRoute("/panel")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Panel,
});

const PANEL_CATEGORIES: Record<PanelistId, string[]> = {
  manager: ["Accomplishments", "Problem Solving"],
  hr: ["Motivation & Fit", "Setbacks & Criticism", "Career Goals"],
  peer: ["Teamwork & Leadership", "Skills & Work Style"],
};

function pick<T>(items: T[], n: number): T[] {
  return [...items].sort(() => Math.random() - 0.5).slice(0, n);
}

function buildPanel() {
  const rounds: { panelist: PanelistId; question: string }[][] = PANELISTS.map((p) =>
    pick(
      QUESTIONS.filter((q) => PANEL_CATEGORIES[p.id].includes(q.category)),
      2,
    ).map((q) => ({ panelist: p.id, question: q.text })),
  );
  // Interleave so panelists take turns.
  const order: { panelist: PanelistId; question: string }[] = [];
  for (let i = 0; i < 2; i += 1) for (const round of rounds) if (round[i]) order.push(round[i]!);
  return order;
}

function Panel() {
  const request = useServerFn(getPanelReview);
  const context = usePrepContext();
  const [plan, setPlan] = useState<{ panelist: PanelistId; question: string }[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [answer, setAnswer] = useState("");
  const [review, setReview] = useState<PanelReview | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setPlan(buildPanel()), []);

  const index = answers.length;
  const current = plan[index];
  const finished = plan.length > 0 && index >= plan.length;
  const voice = useQuestionVoice(current?.panelist ?? "manager");

  useEffect(() => {
    if (!current || voice.muted || !voice.ready) return;
    void voice.speak(current.question);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.question, voice.muted, voice.ready]);

  const grade = async (all: string[]) => {
    setPending(true);
    setError(null);
    try {
      setReview(
        await request({
          data: {
            ...context,
            exchanges: plan.map((item, i) => ({ ...item, answer: all[i] ?? "" })),
          },
        }),
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Couldn't get the panel's debrief.");
    } finally {
      setPending(false);
    }
  };

  const panelistName = (id: PanelistId) => PANELISTS.find((p) => p.id === id)?.name ?? id;

  if (finished) {
    return (
      <ToolPage
        title="Panel debrief"
        intro="Here's how each panelist likely walked out of the room."
      >
        {pending ? (
          <p className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden /> The panel is comparing notes…
          </p>
        ) : review ? (
          <div className="space-y-4">
            <p className="rounded-3xl border border-border bg-card p-6 leading-relaxed text-foreground shadow-sm">
              {review.overall}
            </p>
            {review.panelists.map((p) => (
              <div
                key={p.panelist}
                className="rounded-3xl border border-border bg-card p-6 shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <h2 className="flex items-center gap-2 font-semibold text-foreground">
                    {p.concernAddressed ? (
                      <CheckCircle2 className="size-5 text-primary" aria-hidden />
                    ) : (
                      <XCircle className="size-5 text-destructive" aria-hidden />
                    )}
                    {panelistName(p.panelist)}
                  </h2>
                  <span className="font-display text-lg font-semibold">
                    {Math.round(p.score)}/10
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {p.concernAddressed ? "Concern addressed" : "Concern not yet addressed"}:{" "}
                  {PANELISTS.find((x) => x.id === p.panelist)?.priority}
                </p>
                <p className="mt-3 italic text-foreground">“{p.verdict}”</p>
                <p className="mt-2 text-sm text-foreground">
                  <span className="font-semibold">Fix: </span>
                  {p.fix}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center">
            {error ? <p className="mb-3 text-sm text-destructive">{error}</p> : null}
            <Button className="rounded-full" onClick={() => void grade(answers)}>
              Get the panel's debrief
            </Button>
          </div>
        )}
        <div className="mt-8 flex justify-center gap-3">
          <Button
            variant="secondary"
            className="rounded-full"
            onClick={() => {
              setPlan(buildPanel());
              setAnswers([]);
              setReview(null);
            }}
          >
            <RotateCcw className="size-4" aria-hidden /> New panel
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/">Back to start</Link>
          </Button>
        </div>
      </ToolPage>
    );
  }

  return (
    <ToolPage
      title="Panel interview"
      intro="Three interviewers take turns, each listening for something different. Feedback comes at the end."
    >
      <div className="mb-6 flex flex-wrap justify-center gap-2">
        {PANELISTS.map((p) => (
          <span
            key={p.id}
            className={`rounded-full px-3 py-1 text-sm ${
              current?.panelist === p.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {p.name}
          </span>
        ))}
      </div>
      {current ? (
        <>
          <QuestionCard
            question={current.question}
            category={`${panelistName(current.panelist)} asks`}
            index={index + 1}
            total={plan.length}
            {...(voice.ready
              ? {
                  voice: {
                    muted: voice.muted,
                    speaking: voice.speaking,
                    loading: voice.loading,
                    onReplay: () => void voice.speak(current.question),
                    onToggleMute: voice.toggleMute,
                  },
                }
              : {})}
          />
          <div className="mt-8">
            <AnswerComposer
              key={index}
              value={answer}
              onChange={setAnswer}
              pending={pending}
              onSkip={() => {
                const next = [...answers, ""];
                setAnswers(next);
                setAnswer("");
                if (next.length >= plan.length) void grade(next);
              }}
              onSubmit={() => {
                const next = [...answers, answer.trim()];
                setAnswers(next);
                setAnswer("");
                if (next.length >= plan.length) void grade(next);
              }}
            />
          </div>
        </>
      ) : null}
    </ToolPage>
  );
}
