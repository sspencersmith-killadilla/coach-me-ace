import { Briefcase, Loader2, Pencil, Trash2, Upload } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useJobBrief } from "@/lib/job-brief-context";
import { buildJobBrief } from "@/lib/job-brief.functions";
import type { JobBrief } from "@/lib/job-brief";

const MAX_FILE_BYTES = 10 * 1024 * 1024;

function readAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Couldn't read that file."));
    reader.readAsDataURL(file);
  });
}

export function JobPostingUpload() {
  const { brief, setBrief, hydrated } = useJobBrief();
  const parse = useServerFn(buildJobBrief);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<JobBrief | null>(null);

  const runParse = useCallback(
    async (payload: { text?: string; fileDataUrl?: string; fileName?: string; mimeType?: string }) => {
      setPending(true);
      setError(null);
      try {
        const result = await parse({ data: payload });
        setDraft(result);
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "We couldn't read that posting.");
      } finally {
        setPending(false);
      }
    },
    [parse],
  );

  const onFile = useCallback(
    async (file: File | undefined) => {
      if (!file) return;
      if (file.size > MAX_FILE_BYTES) {
        setError("That file is a bit large — try one under 10 MB.");
        return;
      }
      setFileName(file.name);
      try {
        const dataUrl = await readAsDataUrl(file);
        await runParse({ fileDataUrl: dataUrl, fileName: file.name, mimeType: file.type });
      } catch {
        setError("Couldn't read that file. Try pasting the text instead.");
      }
    },
    [runParse],
  );

  if (!hydrated) return null;

  if (brief && !draft) {
    return (
      <div className="animate-rise mt-10 rounded-3xl border border-border bg-card p-6 text-left shadow-sm">
        <div className="flex items-start gap-3">
          <Briefcase className="mt-0.5 size-5 text-primary" aria-hidden />
          <div className="flex-1">
            <h2 className="text-base font-semibold text-foreground">
              Coaching for {brief.title} at {brief.company}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Your feedback will be measured against this role: {brief.skills.slice(0, 5).join(", ")}.
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" className="rounded-full" onClick={() => setDraft(brief)}>
            <Pencil className="size-4" aria-hidden />
            Edit brief
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full text-muted-foreground"
            onClick={() => setBrief(null)}
          >
            <Trash2 className="size-4" aria-hidden />
            Remove
          </Button>
        </div>
      </div>
    );
  }

  if (draft) {
    return (
      <div className="animate-rise mt-10 space-y-4 rounded-3xl border border-border bg-card p-6 text-left shadow-sm">
        <div>
          <h2 className="text-base font-semibold text-foreground">Does this look right?</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Tweak anything that's off — the coach uses this to tailor your feedback.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-medium text-muted-foreground">
            Role
            <Input
              className="mt-1"
              value={draft.title}
              onChange={(event) => setDraft({ ...draft, title: event.target.value })}
            />
          </label>
          <label className="text-sm font-medium text-muted-foreground">
            Company
            <Input
              className="mt-1"
              value={draft.company}
              onChange={(event) => setDraft({ ...draft, company: event.target.value })}
            />
          </label>
        </div>

        <label className="block text-sm font-medium text-muted-foreground">
          Key responsibilities (one per line)
          <Textarea
            className="mt-1"
            rows={4}
            value={draft.responsibilities.join("\n")}
            onChange={(event) =>
              setDraft({ ...draft, responsibilities: event.target.value.split("\n").filter(Boolean) })
            }
          />
        </label>

        <label className="block text-sm font-medium text-muted-foreground">
          Must-have skills (one per line)
          <Textarea
            className="mt-1"
            rows={4}
            value={draft.skills.join("\n")}
            onChange={(event) => setDraft({ ...draft, skills: event.target.value.split("\n").filter(Boolean) })}
          />
        </label>

        <div className="flex flex-wrap gap-2">
          <Button
            className="rounded-full"
            onClick={() => {
              setBrief(draft);
              setDraft(null);
              setOpen(false);
            }}
          >
            Use this brief
          </Button>
          <Button
            variant="ghost"
            className="rounded-full text-muted-foreground"
            onClick={() => setDraft(null)}
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  if (!open) {
    return (
      <div className="mt-10 text-center">
        <Button
          variant="ghost"
          className="rounded-full text-muted-foreground"
          onClick={() => setOpen(true)}
        >
          <Briefcase className="size-4" aria-hidden />
          Upload the recruitment brochure for more customized feedback (optional)
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-rise mt-10 space-y-4 rounded-3xl border border-border bg-card p-6 text-left shadow-sm">
      <div>
        <h2 className="text-base font-semibold text-foreground">Add the job you're going for</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload the posting or brochure (PDF or image), or paste the text. Your feedback will then be
          measured against that specific role.
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,image/*,text/plain"
        className="hidden"
        onChange={(event) => void onFile(event.target.files?.[0])}
      />

      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="secondary"
          className="rounded-full"
          disabled={pending}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="size-4" aria-hidden />
          Upload a file
        </Button>
        {fileName ? <span className="text-sm text-muted-foreground">{fileName}</span> : null}
      </div>

      <Textarea
        rows={6}
        value={text}
        disabled={pending}
        placeholder="…or paste the job description here"
        onChange={(event) => setText(event.target.value)}
      />

      {error ? <p className="text-sm text-warm-foreground">{error}</p> : null}

      <div className="flex flex-wrap gap-2">
        <Button
          className="rounded-full"
          disabled={pending || !text.trim()}
          onClick={() => void runParse({ text })}
        >
          {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
          {pending ? "Reading the posting…" : "Use this posting"}
        </Button>
        <Button
          variant="ghost"
          className="rounded-full text-muted-foreground"
          disabled={pending}
          onClick={() => setOpen(false)}
        >
          Not now
        </Button>
      </div>
    </div>
  );
}
