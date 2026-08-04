import { Mic, MicOff, Send, SkipForward } from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSpeechInput } from "@/hooks/use-speech-input";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onSkip: () => void;
  pending: boolean;
};

export function AnswerComposer({ value, onChange, onSubmit, onSkip, pending }: Props) {
  const valueRef = useRef(value);
  valueRef.current = value;

  const { supported, listening, toggle, stop } = useSpeechInput((text) => {
    const previous = valueRef.current.trimEnd();
    onChange(previous ? `${previous} ${text}` : text);
  });

  useEffect(() => {
    if (pending) stop();
  }, [pending, stop]);

  return (
    <div className="animate-rise rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <label htmlFor="answer" className="text-sm font-medium text-muted-foreground">
        Your answer — take your time, there's no timer here.
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

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button onClick={onSubmit} disabled={pending || !value.trim()} size="lg" className="rounded-full">
          <Send className="size-4" aria-hidden />
          {pending ? "Coaching in progress…" : "Submit answer"}
        </Button>

        {supported ? (
          <Button
            type="button"
            variant={listening ? "destructive" : "secondary"}
            size="lg"
            onClick={toggle}
            disabled={pending}
            className="rounded-full"
          >
            {listening ? <MicOff className="size-4" aria-hidden /> : <Mic className="size-4" aria-hidden />}
            {listening ? "Stop recording" : "Answer out loud"}
          </Button>
        ) : null}

        <Button
          type="button"
          variant="ghost"
          size="lg"
          onClick={onSkip}
          disabled={pending}
          className="ml-auto rounded-full text-muted-foreground"
        >
          <SkipForward className="size-4" aria-hidden />
          Skip this one
        </Button>
      </div>

      {listening ? (
        <p className="mt-3 text-sm text-muted-foreground" aria-live="polite">
          Listening… your words will appear above as you speak.
        </p>
      ) : null}
    </div>
  );
}
