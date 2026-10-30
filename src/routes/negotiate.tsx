import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, RotateCcw } from "lucide-react";
import { useState } from "react";
import { AnswerComposer } from "@/components/interview/AnswerComposer";
import { ToolPage } from "@/components/interview/ToolPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useJobBrief } from "@/lib/job-brief-context";
import { getNegotiationTurn } from "@/lib/prep.functions";
import type { NegotiationTurn } from "@/lib/prep-schema";
import { usePrepContext } from "@/lib/use-prep-context";

const TITLE = "Salary negotiation practice — Mock Interview Coach";
const DESC =
  "Role-play the salary conversation with a realistic recruiter, from expectations to a lowball offer, and get coached on every reply.";

export const Route = createFileRoute("/negotiate")({
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
  component: Negotiate,
});

type Line = {
  speaker: "recruiter" | "candidate";
  text: string;
  coaching?: NegotiationTurn["coaching"];
};

function Negotiate() {
  const request = useServerFn(getNegotiationTurn);
  const context = usePrepContext();
  const { brief } = useJobBrief();
  const [role, setRole] = useState("");
  const [target, setTarget] = useState("");
  const [floor, setFloor] = useState("");
  const [lines, setLines] = useState<Line[]>([]);
  const [reply, setReply] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<string | null>(null);
  const started = lines.length > 0;

  const roleName = role.trim() || brief?.title || "the role";

  const turn = async (history: Line[]) => {
    setPending(true);
    setError(null);
    try {
      const result = await request({
        data: {
          ...context,
          setup: {
            role: roleName,
            target: target.trim(),
            ...(floor.trim() ? { floor: floor.trim() } : {}),
          },
          transcript: history.map(({ speaker, text }) => ({ speaker, text })),
        },
      });
      const withCoaching = [...history];
      const last = withCoaching[withCoaching.length - 1];
      if (last && last.speaker === "candidate") {
        withCoaching[withCoaching.length - 1] = { ...last, coaching: result.coaching };
      }
      setLines([...withCoaching, { speaker: "recruiter", text: result.recruiterLine }]);
      if (result.done) setOutcome(result.finalOutcome ?? "That's a wrap.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  };

  if (!started) {
    return (
      <ToolPage
        title="Practice the money conversation"
        intro="A recruiter will ask your expectations, make an offer under your target, and push back on your counter. You'll get coached on every reply. Your numbers stay private from the recruiter."
      >
        <div className="space-y-4 rounded-3xl border border-border bg-card p-6 shadow-sm">
          <label className="block text-sm font-medium text-foreground">
            Role
            <Input
              className="mt-1.5"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder={brief?.title ?? "e.g. Program Manager"}
            />
          </label>
          <label className="block text-sm font-medium text-foreground">
            Your target
            <Input
              className="mt-1.5"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="e.g. $95,000"
            />
          </label>
          <label className="block text-sm font-medium text-foreground">
            Your walk-away number (optional)
            <Input
              className="mt-1.5"
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
              placeholder="e.g. $85,000"
            />
          </label>
          <Button
            className="rounded-full"
            disabled={!target.trim() || pending}
            onClick={() => void turn([])}
          >
            {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            Start the conversation
          </Button>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
      </ToolPage>
    );
  }

  return (
    <ToolPage title="Salary conversation" intro={`Negotiating for ${roleName}. Target: ${target}.`}>
      <div className="space-y-4">
        {lines.map((line, index) => (
          <div key={index}>
            <div
              className={`rounded-3xl p-5 shadow-sm ${
                line.speaker === "recruiter"
                  ? "border border-border bg-card"
                  : "ml-8 bg-primary text-primary-foreground"
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-wide opacity-70">
                {line.speaker === "recruiter" ? "Recruiter" : "You"}
              </p>
              <p className="mt-1 leading-relaxed">{line.text}</p>
            </div>
            {line.coaching ? (
              <div className="ml-8 mt-2 rounded-2xl bg-warm p-4 text-sm text-warm-foreground">
                <p className="font-semibold">Coach: {Math.round(line.coaching.score)}/10</p>
                <p className="mt-1">{line.coaching.worked}</p>
                <p className="mt-1">{line.coaching.sharpen}</p>
                <p className="mt-1 italic">Try: “{line.coaching.betterLine}”</p>
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <div className="mt-6">
        {outcome ? (
          <div className="rounded-3xl border border-border bg-card p-6 text-center shadow-sm">
            <h2 className="font-display text-xl font-semibold text-foreground">Where you landed</h2>
            <p className="mt-2 text-muted-foreground">{outcome}</p>
            <Button
              className="mt-4 rounded-full"
              onClick={() => {
                setLines([]);
                setOutcome(null);
              }}
            >
              <RotateCcw className="size-4" aria-hidden /> Run it again
            </Button>
          </div>
        ) : pending ? (
          <p className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden /> The recruiter is responding…
          </p>
        ) : (
          <>
            {error ? <p className="mb-3 text-sm text-destructive">{error}</p> : null}
            <AnswerComposer
              key={lines.length}
              value={reply}
              onChange={setReply}
              pending={pending}
              onSkip={() => setOutcome("You ended the conversation early.")}
              onSubmit={() => {
                const text = reply.trim();
                if (!text) return;
                setReply("");
                void turn([...lines, { speaker: "candidate", text }]);
              }}
            />
          </>
        )}
      </div>
    </ToolPage>
  );
}
