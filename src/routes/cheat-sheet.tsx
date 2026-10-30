import { createFileRoute } from "@tanstack/react-router";
import { Printer } from "lucide-react";
import { useEffect, useState } from "react";
import { ToolPage } from "@/components/interview/ToolPage";
import { Button } from "@/components/ui/button";
import { useBriefing } from "@/lib/briefing-context";
import { useJobBrief } from "@/lib/job-brief-context";
import { loadAskQuestions, loadStories, topStories, type Story } from "@/lib/prep-store";
import { loadProgress, summarize, type ProgressSummary } from "@/lib/progress";

const TITLE = "Day-before cheat sheet — Mock Interview Coach";
const DESC =
  "A printable one-page summary of your fit, best stories, weak spots to watch, and the questions you'll ask — built from your practice.";

export const Route = createFileRoute("/cheat-sheet")({
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
  component: CheatSheet,
});

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="break-inside-avoid rounded-3xl border border-border bg-card p-5 shadow-sm print:rounded-none print:border-0 print:border-b print:p-3 print:shadow-none">
      <h2 className="font-display text-lg font-semibold text-foreground">{title}</h2>
      <div className="mt-2 text-sm leading-relaxed text-foreground">{children}</div>
    </section>
  );
}

const muted = <span className="text-muted-foreground">Nothing here yet.</span>;

function CheatSheet() {
  const { briefing } = useBriefing();
  const { brief } = useJobBrief();
  const [stories, setStories] = useState<Story[]>([]);
  const [ask, setAsk] = useState<string[]>([]);
  const [summary, setSummary] = useState<ProgressSummary | null>(null);

  useEffect(() => {
    setStories(topStories(loadStories(), 5));
    setAsk(loadAskQuestions());
    setSummary(summarize(loadProgress()));
  }, []);

  return (
    <ToolPage
      title={
        brief ? `Cheat sheet: ${brief.title} at ${brief.company}` : "Your interview cheat sheet"
      }
      intro="Everything you've prepared, on one page. Print it or save it as a PDF and read it the night before."
    >
      <Button className="mb-6 rounded-full print:hidden" onClick={() => window.print()}>
        <Printer className="size-4" aria-hidden /> Print or save as PDF
      </Button>
      <div className="space-y-4">
        <Block title="How you fit">
          {briefing ? (
            <>
              <p>{briefing.fitSummary}</p>
              <ul className="mt-2 list-disc pl-5">
                {briefing.strengths.map((s) => (
                  <li key={s.point}>
                    <strong>{s.point}</strong>: cite {s.evidence}
                  </li>
                ))}
              </ul>
              <p className="mt-2 italic">{briefing.toneAdvice}</p>
            </>
          ) : (
            <span className="text-muted-foreground">
              Upload a resume and job posting on the start page to generate your fit briefing.
            </span>
          )}
        </Block>

        <Block title="Your go-to stories">
          {stories.length ? (
            <ul className="space-y-1.5">
              {stories.map((s) => (
                <li key={s.id}>
                  <strong>{s.title}</strong> — {s.tags.join(", ")}
                </li>
              ))}
            </ul>
          ) : (
            muted
          )}
        </Block>

        <Block title="Watch out for">
          {briefing?.watchOuts.length || summary?.weakest ? (
            <ul className="list-disc space-y-1 pl-5">
              {summary?.weakest ? (
                <li>
                  Your weakest practice area is <strong>{summary.weakest.category}</strong> (avg{" "}
                  {summary.weakest.average.toFixed(1)}/10).
                </li>
              ) : null}
              {briefing?.watchOuts.map((w) => (
                <li key={w.gap}>
                  <strong>{w.gap}</strong>: {w.howToHandle}
                </li>
              ))}
            </ul>
          ) : (
            muted
          )}
        </Block>

        <Block title="Questions you'll ask">
          {ask.length ? (
            <ol className="list-decimal space-y-1 pl-5">
              {ask.map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ol>
          ) : (
            muted
          )}
        </Block>

        {summary?.answered ? (
          <p className="text-center text-sm text-muted-foreground">
            {summary.answered} practice answers across {summary.days} day
            {summary.days === 1 ? "" : "s"}, average {summary.average?.toFixed(1)}/10. You're ready.
          </p>
        ) : null}
      </div>
    </ToolPage>
  );
}
