import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, MessageCircleQuestion, Mic, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QUESTION_COUNT } from "@/data/questions";

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

const highlights = [
  {
    icon: MessageCircleQuestion,
    title: `${QUESTION_COUNT} real questions`,
    body: "From motivation and leadership to setbacks and life outside work — the questions interviewers actually ask.",
  },
  {
    icon: Mic,
    title: "Type it or say it",
    body: "Practice out loud with speech-to-text, just like you would in the room, or write your answer at your own pace.",
  },
  {
    icon: Heart,
    title: "Coaching that's kind",
    body: "A score, genuine praise, one thing to sharpen, and a rewritten STAR-method answer you can learn from.",
  },
];

function Welcome() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-20 sm:py-28">
        <div className="animate-rise text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-warm px-4 py-1.5 text-sm font-medium text-warm-foreground">
            <Sparkles className="size-4" aria-hidden />
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
              <Link to="/practice" search={{ mode: "random" }}>
                Start interview
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg" className="rounded-full px-7">
              <Link to="/practice" search={{ mode: "sequential" }}>
                Go in order instead
              </Link>
            </Button>
          </div>
        </div>

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
