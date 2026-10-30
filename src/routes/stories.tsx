import { createFileRoute, Link } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ToolPage } from "@/components/interview/ToolPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { loadStories, saveStories, STORY_TAGS, tagCoverage, type Story } from "@/lib/prep-store";

const TITLE = "Story bank — Mock Interview Coach";
const DESC =
  "Keep your best interview stories in one place, tag what each proves, and see which kinds of questions you still have no story for.";

export const Route = createFileRoute("/stories")({
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
  component: Stories,
});

function Stories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => setStories(loadStories()), []);
  const coverage = useMemo(() => tagCoverage(stories), [stories]);
  const gaps = STORY_TAGS.filter((tag) => !coverage[tag]);

  const update = (next: Story[]) => {
    setStories(next);
    saveStories(next);
  };

  return (
    <ToolPage
      title="Your story bank"
      intro="Most interviews come down to six to eight good stories told well. Save your best answers here, tag what each one proves, and fill the gaps before the big day."
    >
      <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <h2 className="font-semibold text-foreground">Coverage</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {STORY_TAGS.map((tag) => (
            <span
              key={tag}
              className={`rounded-full px-3 py-1 text-sm ${
                coverage[tag]
                  ? "bg-primary text-primary-foreground"
                  : "bg-warm text-warm-foreground"
              }`}
            >
              {tag} · {coverage[tag] ?? 0}
            </span>
          ))}
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          {gaps.length
            ? `No story yet for: ${gaps.join(", ")}. Practice a question in those areas and save your best take.`
            : "Every area has at least one story. Nice work."}
        </p>
      </section>

      <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm">
        <h2 className="font-semibold text-foreground">Add a story by hand</h2>
        <Input
          className="mt-3"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Story name"
          aria-label="Story name"
        />
        <Textarea
          className="mt-3"
          rows={5}
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="What happened, what you did, and how it turned out"
          aria-label="Story"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {STORY_TAGS.map((tag) => {
            const active = tags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                aria-pressed={active}
                onClick={() => setTags((p) => (active ? p.filter((v) => v !== tag) : [...p, tag]))}
                className={`rounded-full border px-3 py-1 text-sm ${
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground"
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
        <Button
          className="mt-4 rounded-full"
          disabled={!title.trim() || !text.trim() || !tags.length}
          onClick={() => {
            update([
              ...stories,
              {
                id: `${Date.now()}`,
                title: title.trim(),
                text: text.trim(),
                tags,
                sourceQuestion: "",
                score: null,
                savedAt: new Date().toISOString(),
              },
            ]);
            setTitle("");
            setText("");
            setTags([]);
          }}
        >
          Add story
        </Button>
      </section>

      <section className="mt-6 space-y-4">
        {stories.length === 0 ? (
          <p className="text-center text-muted-foreground">
            No stories yet. After any answer in{" "}
            <Link
              to="/practice"
              search={{ mode: "random", count: 5, cats: "", tone: "warm" }}
              className="underline"
            >
              practice
            </Link>
            , tap "Save this answer as a story".
          </p>
        ) : (
          stories.map((story) => (
            <article
              key={story.id}
              className="rounded-3xl border border-border bg-card p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-lg font-semibold text-foreground">
                    {story.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {story.tags.join(" · ")}
                    {story.score != null ? ` · scored ${story.score}/10` : ""}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Delete ${story.title}`}
                  onClick={() => update(stories.filter((s) => s.id !== story.id))}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
              {story.sourceQuestion ? (
                <p className="mt-3 text-sm italic text-muted-foreground">
                  “{story.sourceQuestion}”
                </p>
              ) : null}
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-foreground">
                {story.text}
              </p>
            </article>
          ))
        )}
      </section>
    </ToolPage>
  );
}
