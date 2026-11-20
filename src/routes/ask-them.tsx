import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { ToolPage } from "@/components/interview/ToolPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAskQuestions } from "@/lib/prep.functions";
import type { AskQuestions } from "@/lib/prep-schema";
import {
  ASK_QUESTION_LIMIT,
  ASK_QUESTION_MAX_LENGTH,
  loadAskQuestions,
  normalizeAskQuestions,
  saveAskQuestions,
} from "@/lib/prep-store";
import { usePrepContext } from "@/lib/use-prep-context";

const TITLE = "Questions to ask them — Mock Interview Coach";
const DESC =
  "Get sharp, role-specific questions to ask at the end of your interview, and have your own questions graded and rewritten.";

export const Route = createFileRoute("/ask-them")({
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
  component: AskThem,
});

function AskThem() {
  const request = useServerFn(getAskQuestions);
  const context = usePrepContext();
  const [drafts, setDrafts] = useState<string[]>([""]);
  const [result, setResult] = useState<AskQuestions | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = loadAskQuestions();
    if (saved.length) {
      setDrafts(saved);
      saveAskQuestions(saved);
    }
  }, []);

  const updateDrafts = (next: string[]) => {
    const normalized = normalizeAskQuestions(next);
    setDrafts(normalized);
    saveAskQuestions(normalized.filter((d) => d.trim()));
  };

  const run = async () => {
    setPending(true);
    setError(null);
    try {
      const draftsToCoach = normalizeAskQuestions(drafts.filter((d) => d.trim()));
      setResult(await request({ data: { ...context, drafts: draftsToCoach } }));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  };

  return (
    <ToolPage
      title="“Any questions for us?”"
      intro="Every interview ends with this. A sharp question here leaves a strong last impression. Write your own to get them graded, or just ask for ideas. Uploading a job posting or resume first makes these specific."
    >
      <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <h2 className="font-semibold text-foreground">Your questions</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Up to {ASK_QUESTION_LIMIT} questions, {ASK_QUESTION_MAX_LENGTH} characters each.
        </p>
        <div className="mt-3 space-y-2">
          {drafts.map((draft, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={draft}
                aria-label={`Your question ${index + 1}`}
                maxLength={ASK_QUESTION_MAX_LENGTH}
                placeholder="e.g. What would make someone a standout in this role after six months?"
                onChange={(event) =>
                  updateDrafts(drafts.map((d, i) => (i === index ? event.target.value : d)))
                }
              />
              <Button
                variant="ghost"
                size="icon"
                aria-label="Remove question"
                onClick={() => updateDrafts(drafts.filter((_, i) => i !== index))}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="rounded-full"
            disabled={drafts.length >= ASK_QUESTION_LIMIT}
            onClick={() => updateDrafts([...drafts, ""])}
          >
            <Plus className="size-4" aria-hidden /> Add a question
          </Button>
          <Button className="rounded-full" onClick={run} disabled={pending}>
            {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            Coach my questions
          </Button>
        </div>
        {drafts.filter((draft) => draft.trim()).length >= ASK_QUESTION_LIMIT ? (
          <p className="mt-3 text-sm text-muted-foreground">
            You’ve reached the 10-question limit. Remove a question to add another.
          </p>
        ) : null}
        {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
      </section>

      {result?.graded.length ? (
        <section className="mt-6 space-y-3">
          <h2 className="font-display text-xl font-semibold text-foreground">How yours land</h2>
          {result.graded.map((item) => (
            <div
              key={item.question}
              className="rounded-3xl border border-border bg-card p-5 shadow-sm"
            >
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-medium text-foreground">{item.question}</p>
                <span className="font-display text-lg font-semibold text-primary">
                  {Math.round(item.score)}/10
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{item.verdict}</p>
              <p className="mt-2 text-sm text-foreground">
                <span className="font-semibold">Sharper: </span>
                {item.sharperVersion}
              </p>
            </div>
          ))}
        </section>
      ) : null}

      {result?.suggestions.length ? (
        <section className="mt-6 space-y-3">
          <h2 className="font-display text-xl font-semibold text-foreground">
            Questions worth asking
          </h2>
          {result.suggestions.map((item) => (
            <div
              key={item.question}
              className="rounded-3xl border border-border bg-card p-5 shadow-sm"
            >
              <p className="font-medium text-foreground">{item.question}</p>
              <p className="mt-1 text-sm text-muted-foreground">{item.whyItLands}</p>
              <Button
                variant="link"
                className="h-auto p-0 text-sm"
                disabled={drafts.filter((d) => d.trim()).length >= ASK_QUESTION_LIMIT}
                onClick={() => updateDrafts([...drafts.filter((d) => d.trim()), item.question])}
              >
                Add to my list
              </Button>
            </div>
          ))}
        </section>
      ) : null}
    </ToolPage>
  );
}
