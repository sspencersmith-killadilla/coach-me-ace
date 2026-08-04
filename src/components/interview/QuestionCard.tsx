import { Loader2, MessageSquareQuote, Sparkles, Volume2, VolumeX } from "lucide-react";

type Props = {
  question: string;
  category?: string;
  index?: number;
  total?: number;
  isFollowUp?: boolean;
  voice?: {
    muted: boolean;
    speaking: boolean;
    loading: boolean;
    onReplay: () => void;
    onToggleMute: () => void;
  };
};

export function QuestionCard({ question, category, index, total, isFollowUp, voice }: Props) {
  return (
    <div className="animate-rise text-center">
      <div className="mb-4 flex items-center justify-center gap-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {isFollowUp ? (
          <>
            <MessageSquareQuote className="size-3.5 text-accent" aria-hidden />
            <span>Follow-up</span>
          </>
        ) : (
          <>
            <Sparkles className="size-3.5 text-accent" aria-hidden />
            <span>{category}</span>
            {index != null && total != null ? (
              <>
                <span aria-hidden>·</span>
                <span>
                  Question {index} of {total}
                </span>
              </>
            ) : null}
          </>
        )}
      </div>
      <h2 className="mx-auto max-w-2xl text-balance text-2xl leading-snug font-semibold text-foreground sm:text-3xl">
        {question}
      </h2>

      {voice ? (
        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={voice.onToggleMute}
            aria-pressed={!voice.muted}
            className="inline-flex items-center gap-2 rounded-full border border-border px-3.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            {voice.muted ? (
              <VolumeX className="size-4" aria-hidden />
            ) : (
              <Volume2 className="size-4 text-primary" aria-hidden />
            )}
            {voice.muted ? "Read questions aloud" : "Interviewer voice on"}
          </button>
          {!voice.muted ? (
            <button
              type="button"
              onClick={voice.onReplay}
              className="inline-flex items-center gap-2 rounded-full border border-border px-3.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              {voice.loading ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <Volume2 className="size-4" aria-hidden />
              )}
              {voice.speaking ? "Speaking…" : "Hear it again"}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
