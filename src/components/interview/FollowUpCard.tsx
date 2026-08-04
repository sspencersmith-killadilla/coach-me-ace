import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Loader2, MessageSquareQuote, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getFollowUps, type FollowUps } from "@/lib/follow-ups.functions";
import type { JobBrief } from "@/lib/job-brief";
import type { Resume } from "@/lib/resume";

type Props = {
  question: string;
  answer: string;
  jobBrief: JobBrief | null;
  resume: Resume | null;
  onPracticeFollowUp: (followUpQuestion: string) => void;
};

export function FollowUpCard({ question, answer, jobBrief, resume, onPracticeFollowUp }: Props) {
  const generate = useServerFn(getFollowUps);
  const [followUps, setFollowUps] = useState<FollowUps["followUps"] | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setPending(true);
    setError(null);
    try {
      const result = await generate({
        data: {
          question,
          answer,
          ...(jobBrief ? { jobBrief } : {}),
          ...(resume ? { resume } : {}),
        },
      });
      setFollowUps(result.followUps);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Couldn't generate follow-ups.");
    } finally {
      setPending(false);
    }
  };

  if (followUps?.length) {
    return (
      <section className="animate-rise rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <MessageSquareQuote className="size-5 text-primary" aria-hidden />
            Follow-ups the interviewer might ask
          </h3>
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0 rounded-full text-muted-foreground"
            onClick={handleGenerate}
            disabled={pending}
          >
            <RefreshCcw className="size-4" aria-hidden />
            Regenerate
          </Button>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick one to practice the live back-and-forth.
        </p>

        <div className="mt-4 space-y-3">
          {followUps.map((followUp, index) => (
            <button
              key={index}
              type="button"
              onClick={() => onPracticeFollowUp(followUp.question)}
              className="group w-full rounded-2xl border border-border bg-background p-4 text-left transition-colors hover:border-primary/40 hover:bg-primary/[0.03]"
            >
              <p className="font-medium text-foreground">{followUp.question}</p>
              <p className="mt-1 text-sm text-muted-foreground">{followUp.intent}</p>
              <div className="mt-3 flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                Practice this one
                <ArrowRight className="size-4" aria-hidden />
              </div>
            </button>
          ))}
        </div>

        {pending ? (
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Generating fresh follow-ups…
          </div>
        ) : null}
        {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}
      </section>
    );
  }

  return (
    <section className="animate-rise rounded-3xl border border-border bg-card p-6 text-center shadow-sm">
      <h3 className="flex items-center justify-center gap-2 text-lg font-semibold text-foreground">
        <MessageSquareQuote className="size-5 text-primary" aria-hidden />
        Practice the live back-and-forth
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        Generate 2–3 natural follow-up questions an interviewer might ask based on your answer and
        the role.
      </p>
      <Button
        variant="secondary"
        size="lg"
        className="mt-4 rounded-full"
        onClick={handleGenerate}
        disabled={pending}
      >
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Thinking…
          </>
        ) : (
          "Generate follow-up questions"
        )}
      </Button>
      {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}
    </section>
  );
}
