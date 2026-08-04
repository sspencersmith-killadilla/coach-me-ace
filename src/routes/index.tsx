import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, MessageCircleQuestion, Mic, Target, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JobPostingUpload } from "@/components/interview/JobPostingUpload";
import { ResumeUpload } from "@/components/interview/ResumeUpload";
import { CATEGORIES, QUESTIONS, QUESTION_COUNT } from "@/data/questions";
import { useMemo, useState } from "react";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mock Interview Coach — Practice with a Supportive AI Coach" },
      {
        name: "description",
        content:
          "Practice 136 real interview questions by typing or speaking, and get warm, specific AI coaching with a STAR-method model answer.",
      },
      { property: "og:title", content: "Mock Interview Coach — Practice with a Supportive AI Coach" },
      {
        property: "og:description",
        content:
          "Practice 136 real interview questions by typing or speaking, and get warm, specific AI coaching with a STAR-method model answer.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Welcome,
});

const SESSION_OPTIONS = [
  { label: "5 questions", value: 5 },
  { label: "10 questions", value: 10 },
  { label: "20 questions", value: 20 },
  { label: "All 136", value: QUESTION_COUNT },
];

const highlights = [
  {
    icon: MessageCircleQuestion,
    title: `${QUESTION_COUNT} real questions`,
    body: "From motivation and leadership to setbacks and life outside work — the questions interviewers actually ask.",
  },
  {
    icon: Mic,
    title: "Speak your answers",
    body: "Answer out loud like you would in the room — your words are transcribed accurately and dropped straight into the box.",
  },
  {
    icon: Heart,
    title: "Coaching that's kind",
    body: "A score, genuine praise, one thing to sharpen, and a rewritten STAR-method answer you can learn from.",
  },
];

function Welcome() {
  const [count, setCount] = useState(QUESTION_COUNT);
  const [selected, setSelected] = useState<string[]>([]);

  const cats = selected.join(",");
  const available = useMemo(
    () =>
      selected.length
        ? QUESTIONS.filter((question) => selected.includes(question.category)).length
        : QUESTION_COUNT,
    [selected],
  );
  const sessionSize = Math.min(count, available);

  const toggle = (category: string) =>
    setSelected((previous) =>
      previous.includes(category)
        ? previous.filter((value) => value !== category)
        : [...previous, category],
    );

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-20 sm:py-28">
        <div className="animate-rise text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-warm px-4 py-1.5 text-sm font-medium text-warm-foreground">
            <img src="/logo-mark.png" alt="" className="size-5" width={20} height={20} />
            Take a breath. You've got this.
          </span>
          <h1 className="mt-6 text-balance font-display text-4xl leading-tight font-semibold text-foreground sm:text-5xl">
            Practice your interview with a coach in your corner
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Answer one question at a time and get warm, specific feedback — what worked, one thing
            to sharpen, and a model answer written the way you'd say it.
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="rounded-full px-7">
              <Link to="/practice" search={{ mode: "random", count, cats }}>
                Start interview
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg" className="rounded-full px-7">
              <Link to="/practice" search={{ mode: "sequential", count, cats }}>
                Go in order instead
              </Link>
            </Button>
          </div>

          <div className="mt-3 flex flex-wrap justify-center gap-3">
            <Button asChild variant="outline" size="lg" className="rounded-full px-7">
              <Link to="/practice" search={{ mode: "weakest", count, cats }}>
                <Target className="size-4" aria-hidden />
                Focus my weak spots
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full px-7">
              <Link to="/practice" search={{ mode: "mock", count, cats }}>
                <Timer className="size-4" aria-hidden />
                Run a full mock interview
              </Link>
            </Button>
          </div>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
            A mock interview runs {sessionSize} question{sessionSize === 1 ? "" : "s"} back-to-back
            on a timer, with all the feedback saved for the end — just like the real thing.
          </p>

          <div className="mx-auto mt-6 flex w-fit flex-col items-center gap-2 rounded-3xl border border-border bg-card p-4 shadow-sm sm:flex-row">
            <span className="text-sm font-medium text-foreground">Session length:</span>
            <div className="flex rounded-full bg-muted p-1">
              {SESSION_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setCount(option.value)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    count === option.value
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-border bg-card p-5 text-left shadow-sm">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-sm font-semibold text-foreground">
                Focus on certain kinds of questions
              </h2>
              <span className="text-sm text-muted-foreground">
                {selected.length ? `${available} questions selected` : "All categories"}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {CATEGORIES.map((category) => {
                const active = selected.includes(category);
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => toggle(category)}
                    aria-pressed={active}
                    className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
              {selected.length ? (
                <button
                  type="button"
                  onClick={() => setSelected([])}
                  className="rounded-full px-3.5 py-1.5 text-sm font-medium text-muted-foreground underline-offset-4 hover:underline"
                >
                  Clear
                </button>
              ) : null}
            </div>
          </div>
        </div>



        <JobPostingUpload />
        <ResumeUpload />

        <div className="mt-16 grid gap-4 sm:grid-cols-3">
          {highlights.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <Icon className="size-6 text-primary" aria-hidden />
              <h2 className="mt-4 text-base font-semibold text-foreground">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>

        <p className="mt-12 text-center text-sm text-muted-foreground">
          Nothing you write is saved — it's just you, practicing.
        </p>
      </div>
    </main>
  );
}
