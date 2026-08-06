import { Loader2, Mic, Send, Square, SkipForward } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onSkip: () => void;
  pending: boolean;
};

function formatSeconds(total: number) {
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

async function transcribeSegment(blob: Blob, onDelta: (text: string) => void) {
  const body = new FormData();
  body.append("file", blob, "recording.wav");

  const response = await fetch("/api/transcribe", { method: "POST", body });
  if (!response.ok || !response.body) {
    const detail = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(detail?.error ?? "We couldn't transcribe that recording. Please try again.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let full = "";

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const event = JSON.parse(payload) as { type?: string; delta?: string; text?: string };
        if (event.type === "transcript.text.delta" && event.delta) {
          full += event.delta;
          onDelta(full);
        } else if (event.type === "transcript.text.done" && event.text) {
          full = event.text;
          onDelta(full);
        }
      } catch {
        /* ignore malformed SSE frame */
      }
    }
  }

  return full.trim();
}

export function AnswerComposer({ value, onChange, onSubmit, onSkip, pending }: Props) {
  const valueRef = useRef(value);
  valueRef.current = value;

  const [interim, setInterim] = useState("");
  const [transcribing, setTranscribing] = useState(false);
  const [transcriptError, setTranscriptError] = useState<string | null>(null);
  const queueRef = useRef<Promise<void>>(Promise.resolve());

  const appendText = useCallback(
    (text: string) => {
      const previous = valueRef.current.trimEnd();
      const next = previous ? `${previous} ${text}` : text;
      valueRef.current = next;
      onChange(next);
    },
    [onChange],
  );

  const handleSegment = useCallback(
    (blob: Blob) => {
      setTranscribing(true);
      setTranscriptError(null);
      queueRef.current = queueRef.current
        .then(async () => {
          try {
            const text = await transcribeSegment(blob, setInterim);
            if (text) appendText(text);
          } catch (caught) {
            setTranscriptError(
              caught instanceof Error ? caught.message : "We couldn't transcribe that recording.",
            );
          } finally {
            setInterim("");
            setTranscribing(false);
          }
        })
        .catch(() => setTranscribing(false));
    },
    [appendText],
  );

  const { recording, seconds, level, error, start, stop } = useAudioRecorder({
    onSegment: handleSegment,
  });

  useEffect(() => {
    if (pending && recording) stop();
  }, [pending, recording, stop]);

  const meterWidth = Math.min(100, Math.round(level * 260));

  const liveWords = value.trim() ? value.trim().split(/\s+/).length : 0;
  const spokenSeconds = Math.round((liveWords / 150) * 60);
  const pace = recording && seconds > 5 ? Math.round((liveWords / seconds) * 60) : null;
  const pacing =
    liveWords === 0
      ? null
      : liveWords > 320
        ? { label: "Running long — start landing the result", tone: "text-warm-foreground" }
        : liveWords > 240
          ? { label: "Good length — begin wrapping up", tone: "text-muted-foreground" }
          : liveWords < 60
            ? { label: "Room for one more concrete detail", tone: "text-muted-foreground" }
            : { label: "Nice length for an interview answer", tone: "text-primary" };

  return (
    <div className="animate-rise rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <label htmlFor="answer" className="text-sm font-medium text-muted-foreground">
        Your answer — speak it out loud or type it. There's no timer here.
      </label>
      <Textarea
        id="answer"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Start with the situation you were in, what you needed to do, the action you took, and how it turned out…"
        rows={9}
        disabled={pending}
        className="mt-3 resize-y border-input bg-background text-base leading-relaxed"
      />

      {pacing ? (
        <div className="mt-3 flex flex-wrap items-center text-sm" aria-live="polite">
          <span className="mr-3 font-mono text-foreground">{liveWords} words</span>
          <span className="mr-3 text-muted-foreground">
            ≈ {formatSeconds(spokenSeconds)} spoken{pace ? ` · ${pace} wpm` : ""}
          </span>
          <span className={pacing.tone}>{pacing.label}</span>
        </div>
      ) : null}

      {recording ? (
        <div className="mt-3 flex items-center gap-3" aria-live="polite">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-destructive opacity-60" />
            <span className="relative inline-flex size-2.5 rounded-full bg-destructive" />
          </span>
          <span className="font-mono text-sm text-foreground">{formatSeconds(seconds)}</span>
          <span className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
            <span
              className="block h-full rounded-full bg-primary transition-[width] duration-100"
              style={{ width: `${meterWidth}%` }}
            />
          </span>
          <span className="text-sm text-muted-foreground">Listening…</span>
        </div>
      ) : null}

      {transcribing ? (
        <p
          className="mt-3 flex items-center gap-2 text-sm text-muted-foreground"
          aria-live="polite"
        >
          <Loader2 className="size-4 animate-spin" aria-hidden />
          {interim ? interim : "Writing down what you said…"}
        </p>
      ) : null}

      {error || transcriptError ? (
        <p className="mt-3 text-sm text-warm-foreground">{error ?? transcriptError}</p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button
          onClick={onSubmit}
          disabled={pending || recording || !value.trim()}
          size="lg"
          className="rounded-full"
        >
          <Send className="size-4" aria-hidden />
          {pending ? "Coaching in progress…" : "Submit answer"}
        </Button>

        <Button
          type="button"
          variant={recording ? "destructive" : "secondary"}
          size="lg"
          onClick={() => (recording ? stop() : void start())}
          disabled={pending}
          className="rounded-full"
        >
          {recording ? (
            <Square className="size-4" aria-hidden />
          ) : (
            <Mic className="size-4" aria-hidden />
          )}
          {recording ? "Stop and transcribe" : "Answer out loud"}
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="lg"
          onClick={onSkip}
          disabled={pending || recording}
          className="ml-auto rounded-full text-muted-foreground"
        >
          <SkipForward className="size-4" aria-hidden />
          Skip this one
        </Button>
      </div>
    </div>
  );
}
