import { BookmarkPlus, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addStory, STORY_TAGS } from "@/lib/prep-store";

type Props = { question: string; answer: string; score: number | null };

export function SaveStory({ question, answer, score }: Props) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  if (saved) {
    return (
      <p className="flex items-center justify-center gap-2 text-sm font-medium text-primary">
        <Check className="size-4" aria-hidden /> Saved to your story bank
      </p>
    );
  }

  if (!open) {
    return (
      <div className="flex justify-center">
        <Button variant="outline" className="rounded-full" onClick={() => setOpen(true)}>
          <BookmarkPlus className="size-4" aria-hidden />
          Save this answer as a story
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-rise rounded-3xl border border-border bg-card p-5 shadow-sm">
      <label htmlFor="story-title" className="text-sm font-semibold text-foreground">
        Give this story a short name
      </label>
      <Input
        id="story-title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="e.g. The vendor turnaround"
        className="mt-2"
      />
      <p className="mt-4 text-sm font-semibold text-foreground">What does it prove?</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {STORY_TAGS.map((tag) => {
          const active = tags.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              aria-pressed={active}
              onClick={() =>
                setTags((previous) =>
                  active ? previous.filter((value) => value !== tag) : [...previous, tag],
                )
              }
              className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {tag}
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex gap-2">
        <Button
          className="rounded-full"
          disabled={!title.trim() || !tags.length}
          onClick={() => {
            addStory({ title: title.trim(), tags, text: answer, sourceQuestion: question, score });
            setSaved(true);
          }}
        >
          Save story
        </Button>
        <Button variant="ghost" className="rounded-full" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
