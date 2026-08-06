import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { AlertCircle, Award, CheckCircle2, Loader2, RefreshCw, Sparkles, TriangleAlert } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { briefingSignature, useBriefing } from "@/lib/briefing-context";
import { getPreInterviewBriefing } from "@/lib/briefing.functions";
import { useJobBrief } from "@/lib/job-brief-context";
import { usePromotion } from "@/lib/promotion-context";
import { useResume } from "@/lib/resume-context";

export function PreInterviewBriefing({
  practiceSearch,
}: {
  practiceSearch: { mode: "random"; count: number; cats: string; tone: "warm" | "tough" };
}) {
  const { brief } = useJobBrief();
  const { resume } = useResume();
  const { briefing, signature, setBriefing, setQueuedQuestions, hydrated } = useBriefing();
  const request = useServerFn(getPreInterviewBriefing);

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentSignature = useMemo(
    () => (brief && resume ? briefingSignature(brief, resume) : null),
    [brief, resume],
  );

  const run = useCallback(async () => {
    if (!brief || !resume) return;
    setPending(true);
    setError(null);
    try {
      const result = await request({ data: { jobBrief: brief, resume } });
      setBriefing(result, currentSignature ?? "");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Couldn't build your briefing.");
    } finally {
      setPending(false);
    }
  }, [brief, resume, request, setBriefing, currentSignature]);

  if (!hydrated) return null;

  const ready = Boolean(brief && resume);
  const stale = Boolean(briefing && currentSignature && signature !== currentSignature);

  if (!ready) {
    return (
      <div className="mt-6 rounded-3xl border border-dashed border-border bg-muted/40 p-6 text-left">
        <h2 className="text-base font-semibold text-foreground">Your fit for this role</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Add {!brief && !resume ? "the job posting and your resume" : !brief ? "the job posting" : "your resume"} above
          and we'll write you a short pre-interview briefing — how you fit, what to lean on, and where a panel will
          press.
        </p>
      </div>
    );
  }

  if (!briefing || stale) {
    return (
      <div className="animate-rise mt-6 rounded-3xl border border-border bg-card p-6 text-left shadow-sm">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 size-5 text-primary" aria-hidden />
          <div className="flex-1">
            <h2 className="text-base font-semibold text-foreground">Your fit for this role</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {stale
                ? "Your posting or resume changed — refresh the briefing so it matches."
                : "Before you start, get a quick read on how your background lines up with this job and what you should watch out for."}
            </p>
          </div>
        </div>
        {error ? (
          <p className="mt-4 flex items-start gap-2 text-sm text-warm-foreground">
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
            {error}
          </p>
        ) : null}
        <div className="mt-4">
          <Button className="rounded-full" disabled={pending} onClick={() => void run()}>
            {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            {pending ? "Reading your background…" : stale ? "Refresh my briefing" : "Get my pre-interview briefing"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-rise mt-6 space-y-6 rounded-3xl border border-border bg-card p-6 text-left shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">Your fit for this role</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {brief!.title} at {brief!.company}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-warm px-3 py-1 text-sm font-semibold text-warm-foreground">
            Fit {briefing.fitScore}/10
          </span>
          <button
            type="button"
            onClick={() => void run()}
            disabled={pending}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            <RefreshCw className={`size-3.5 ${pending ? "animate-spin" : ""}`} aria-hidden />
            Regenerate
          </button>
        </div>
      </div>

      <p className="text-sm leading-relaxed text-foreground">{briefing.fitSummary}</p>

      <div>
        <h3 className="text-sm font-semibold text-foreground">Your strongest cards</h3>
        <ul className="mt-2 space-y-2">
          {briefing.strengths.map((item) => (
            <li key={item.point} className="flex items-start gap-2 text-sm leading-relaxed">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              <span className="text-muted-foreground">
                <span className="font-medium text-foreground">{item.point}.</span> {item.evidence}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-foreground">Watch out for</h3>
        <ul className="mt-2 space-y-2">
          {briefing.watchOuts.map((item) => (
            <li key={item.gap} className="flex items-start gap-2 text-sm leading-relaxed">
              <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warm-foreground" aria-hidden />
              <span className="text-muted-foreground">
                <span className="font-medium text-foreground">{item.gap}.</span> {item.howToHandle}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-foreground">Questions to expect</h3>
        <ul className="mt-2 space-y-2">
          {briefing.likelyQuestions.map((item) => (
            <li key={item.question} className="rounded-2xl bg-muted/60 px-4 py-3 text-sm leading-relaxed">
              <p className="font-medium text-foreground">{item.question}</p>
              <p className="mt-1 text-muted-foreground">{item.whatItTests}</p>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-sm leading-relaxed text-muted-foreground">{briefing.toneAdvice}</p>

      <div className="flex flex-wrap gap-2">
        <Button asChild className="rounded-full">
          <Link
            to="/practice"
            search={practiceSearch}
            onClick={() => setQueuedQuestions(briefing.likelyQuestions.map((item) => item.question))}
          >
            Practice these questions
          </Link>
        </Button>
        <Button asChild variant="ghost" className="rounded-full text-muted-foreground">
          <Link to="/practice" search={practiceSearch} onClick={() => setQueuedQuestions([])}>
            Start regular practice
          </Link>
        </Button>
      </div>
    </div>
  );
}
