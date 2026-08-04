import { FileUser, Loader2, Pencil, Trash2, Upload } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useResume } from "@/lib/resume-context";
import { buildResume } from "@/lib/resume.functions";
import type { Resume } from "@/lib/resume";

const MAX_FILE_BYTES = 10 * 1024 * 1024;

function readAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Couldn't read that file."));
    reader.readAsDataURL(file);
  });
}

export function ResumeUpload() {
  const { resume, setResume, hydrated } = useResume();
  const parse = useServerFn(buildResume);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"file" | "text">("file");
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<Resume | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const runParse = useCallback(
    async (payload: { text?: string; fileDataUrl?: string; fileName?: string; mimeType?: string }) => {
      setPending(true);
      setError(null);
      try {
        const result = await parse({ data: payload });
        setDraft(result);
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "We couldn't read that resume.");
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

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(true);
  }, []);

  const onDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setDragActive(false);
      const file = event.dataTransfer.files?.[0];
      void onFile(file);
    },
    [onFile],
  );

  if (hydrated && resume && !draft) {
    return (
      <div className="animate-rise mt-6 rounded-3xl border border-border bg-card p-6 text-left shadow-sm">
        <div className="flex items-start gap-3">
          <FileUser className="mt-0.5 size-5 text-primary" aria-hidden />
          <div className="flex-1">
            <h2 className="text-base font-semibold text-foreground">Resume added</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Your feedback will draw from your real experience and skills.
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" className="rounded-full" onClick={() => setDraft(resume)}>
            <Pencil className="size-4" aria-hidden />
            Edit resume
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full text-muted-foreground"
            onClick={() => setResume(null)}
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
      <div className="animate-rise mt-6 space-y-4 rounded-3xl border border-border bg-card p-6 text-left shadow-sm">
        <div>
          <h2 className="text-base font-semibold text-foreground">Does this look right?</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            The coach uses this to tailor your model answers.
          </p>
        </div>

        <label className="block text-sm font-medium text-muted-foreground">
          Summary
          <Textarea
            className="mt-1"
            rows={3}
            value={draft.summary}
            onChange={(event) => setDraft({ ...draft, summary: event.target.value })}
          />
        </label>

        <label className="block text-sm font-medium text-muted-foreground">
          Skills (one per line)
          <Textarea
            className="mt-1"
            rows={4}
            value={draft.skills.join("\n")}
            onChange={(event) =>
              setDraft({ ...draft, skills: event.target.value.split("\n").filter(Boolean) })
            }
          />
        </label>

        <div className="grid gap-4">
          {draft.experience.map((role, index) => (
            <div key={index} className="space-y-2 rounded-2xl border border-border bg-muted/50 p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Role
                  <Input
                    className="mt-1"
                    value={role.title}
                    onChange={(event) => {
                      const next = [...draft.experience];
                      next[index] = { ...role, title: event.target.value };
                      setDraft({ ...draft, experience: next });
                    }}
                  />
                </label>
                <label className="text-sm font-medium text-muted-foreground">
                  Company
                  <Input
                    className="mt-1"
                    value={role.company}
                    onChange={(event) => {
                      const next = [...draft.experience];
                      next[index] = { ...role, company: event.target.value };
                      setDraft({ ...draft, experience: next });
                    }}
                  />
                </label>
              </div>
              <label className="block text-sm font-medium text-muted-foreground">
                Highlights (one per line)
                <Textarea
                  className="mt-1"
                  rows={3}
                  value={role.highlights.join("\n")}
                  onChange={(event) => {
                    const next = [...draft.experience];
                    next[index] = {
                      ...role,
                      highlights: event.target.value.split("\n").filter(Boolean),
                    };
                    setDraft({ ...draft, experience: next });
                  }}
                />
              </label>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            className="rounded-full"
            onClick={() => {
              setResume(draft);
              setDraft(null);
              setOpen(false);
            }}
          >
            Use this resume
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
      <div className="mt-6 text-center">
        <Button
          variant="outline"
          size="lg"
          className="rounded-full border-primary/30 bg-card px-6 text-foreground shadow-sm hover:bg-primary/5 hover:text-primary"
          onClick={() => setOpen(true)}
        >
          <FileUser className="size-5" aria-hidden />
          Add your resume for personalized answers (optional)
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-rise mt-6 space-y-5 rounded-3xl border border-border bg-card p-6 text-left shadow-sm">
      <div>
        <h2 className="text-base font-semibold text-foreground">Add your resume</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload your CV or paste the text, so the coach can shape model answers around your real
          experience.
        </p>
      </div>

      <div className="flex rounded-full bg-muted p-1">
        <button
          type="button"
          onClick={() => setMode("file")}
          className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            mode === "file" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Upload file
        </button>
        <button
          type="button"
          onClick={() => setMode("text")}
          className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            mode === "text" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Paste text
        </button>
      </div>

      {mode === "file" ? (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,image/*,text/plain"
            className="hidden"
            onChange={(event) => void onFile(event.target.files?.[0])}
          />

          <div
            role="button"
            tabIndex={0}
            aria-label="Upload resume"
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                fileInputRef.current?.click();
              }
            }}
            className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
              dragActive
                ? "border-primary bg-primary/5"
                : "border-border bg-muted/50 hover:bg-muted"
            }`}
          >
            <div
              className={`mx-auto flex size-12 items-center justify-center rounded-full ${
                dragActive ? "bg-primary/10 text-primary" : "bg-background text-muted-foreground"
              }`}
            >
              <Upload className="size-6" aria-hidden />
            </div>
            <p className="mt-4 text-sm font-medium text-foreground">
              {fileName ? fileName : "Drag and drop your resume here"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {fileName
                ? "We'll use this to personalize your coaching."
                : "or click to browse — PDF, image, or plain text up to 10 MB"}
            </p>
          </div>
        </>
      ) : (
        <Textarea
          rows={8}
          value={text}
          disabled={pending}
          placeholder="Paste your resume or CV text here"
          onChange={(event) => setText(event.target.value)}
        />
      )}

      {error ? <p className="text-sm text-warm-foreground">{error}</p> : null}

      <div className="flex flex-wrap gap-2">
        <Button
          className="rounded-full"
          disabled={pending || (mode === "text" ? !text.trim() : !fileName)}
          onClick={() => void runParse({ text })}
        >
          {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
          {pending ? "Reading the resume…" : "Use this resume"}
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
