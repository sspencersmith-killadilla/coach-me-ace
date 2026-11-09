import { useServerFn } from "@tanstack/react-start";
import { AlertCircle, Check, Copy, FilePenLine, Loader2, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { briefingSignature } from "@/lib/briefing-context";
import { useJobBrief } from "@/lib/job-brief-context";
import type { ResumeTailoring as Tailoring } from "@/lib/prep-schema";
import { getResumeTailoring } from "@/lib/prep.functions";
import { usePromotion } from "@/lib/promotion-context";
import { useResume } from "@/lib/resume-context";

const STORAGE_KEY = "mock-interview-resume-tailoring";

function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <Button
      type="button"
      size="sm"
      variant="ghost"
      className="h-7 rounded-full px-2 text-xs text-muted-foreground"
      onClick={() => {
        void navigator.clipboard.writeText(text).then(() => {
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        });
      }}
    >
      {done ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {done ? "Copied" : label}
    </Button>
  );
}

function allText(t: Tailoring) {
  return [
    "SUMMARY",
    t.summaryRewrite,
    "",
    "BULLET REWRITES",
    ...t.bulletRewrites.map((b) => `- ${b.after}`),
    "",
    "REORDER",
    ...t.reorder.map((r) => `- ${r}`),
    "",
    "KEYWORDS",
    ...t.keywords.map(
      (k) => `- ${k.term} (${k.status === "gap" ? "gap" : "add wording"}): ${k.advice}`,
    ),
    ...(t.cutOrShrink.length
      ? ["", "CUT OR SHRINK", ...t.cutOrShrink.map((c) => `- ${c.item}: ${c.why}`)]
      : []),
  ].join("\n");
}

export function ResumeTailoring() {
  const { brief } = useJobBrief();
  const { resume } = useResume();
  const { promotion } = usePromotion();
  const request = useServerFn(getResumeTailoring);
  const [result, setResult] = useState<{ sig: string; data: Tailoring } | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) setResult(JSON.parse(stored));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  const sig = useMemo(
    () => (brief && resume ? briefingSignature({ brief, resume, promotion }) : null),
    [brief, resume, promotion],
  );

  const run = useCallback(async () => {
    if (!brief || !resume || !sig) return;
    setPending(true);
    setError(null);
    try {
      const data = await request({
        data: { jobBrief: brief, resume, ...(promotion.isActive ? { promotion } : {}) },
      });
      const next = {
        sig,
        data: { ...data, matchScore: Math.max(1, Math.min(10, Math.round(data.matchScore))) },
      };
      setResult(next);
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Couldn't build resume suggestions.");
    } finally {
      setPending(false);
    }
  }, [brief, resume, sig, promotion, request]);

  if (!hydrated || !brief || !resume) return null;
  const current = result && result.sig === sig ? result.data : null;
  const stale = Boolean(result && result.sig !== sig);

  return (
    <section className="animate-rise mt-6 rounded-3xl border border-border bg-card p-6 text-left shadow-sm">
      <div className="flex items-start gap-3">
        <FilePenLine className="mt-0.5 size-5 text-primary" aria-hidden />
        <div className="flex-1">
          <h2 className="text-base font-semibold text-foreground">Tailor my resume</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Suggested edits so your resume speaks to this {promotion.isActive ? "promotion" : "job"}
            . We only reword what's already there — never invent experience.
          </p>
        </div>
      </div>

      {!current && (
        <div className="mt-4">
          {stale && (
            <p className="mb-2 text-xs text-muted-foreground">
              Your resume or posting changed — refresh the suggestions.
            </p>
          )}
          <Button className="rounded-full" onClick={() => void run()} disabled={pending}>
            {pending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <FilePenLine className="size-4" />
            )}
            {pending ? "Reviewing your resume…" : "Suggest resume edits"}
          </Button>
        </div>
      )}

      {error && (
        <p className="mt-3 flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="size-4" /> {error}
        </p>
      )}

      {current && (
        <div className="mt-5 space-y-6 text-sm">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-primary/10 px-4 py-3 text-center">
              <div className="text-2xl font-semibold text-primary">{current.matchScore}/10</div>
              <div className="text-xs text-muted-foreground">Match</div>
            </div>
            <p className="leading-relaxed text-foreground">{current.verdict}</p>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">New summary</h3>
              <CopyButton text={current.summaryRewrite} />
            </div>
            <p className="mt-2 rounded-2xl bg-muted/50 p-3 leading-relaxed">
              {current.summaryRewrite}
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground">Bullet rewrites</h3>
            <ul className="mt-2 space-y-3">
              {current.bulletRewrites.map((b, i) => (
                <li key={i} className="rounded-2xl border border-border p-3">
                  <p className="text-muted-foreground line-through decoration-muted-foreground/40">
                    {b.before}
                  </p>
                  <div className="mt-2 flex items-start justify-between gap-2">
                    <p className="font-medium text-foreground">{b.after}</p>
                    <CopyButton text={b.after} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{b.why}</p>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground">Keywords from the posting</h3>
            <ul className="mt-2 space-y-2">
              {current.keywords.map((k, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                      k.status === "gap"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    {k.status === "gap" ? "Gap" : "You have this — say it"}
                  </span>
                  <span>
                    <strong className="text-foreground">{k.term}</strong>{" "}
                    <span className="text-muted-foreground">— {k.advice}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground">Reorder</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
              {current.reorder.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>

          {current.cutOrShrink.length > 0 && (
            <div>
              <h3 className="font-semibold text-foreground">Cut or shrink</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
                {current.cutOrShrink.map((c, i) => (
                  <li key={i}>
                    <span className="text-foreground">{c.item}</span> — {c.why}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <CopyButton text={allText(current)} label="Copy all suggestions" />
            <Button
              size="sm"
              variant="ghost"
              className="h-7 rounded-full px-2 text-xs text-muted-foreground"
              onClick={() => void run()}
              disabled={pending}
            >
              {pending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <RefreshCw className="size-3.5" />
              )}
              Regenerate
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
