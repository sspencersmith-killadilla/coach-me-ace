import { useCallback, useEffect, useRef, useState } from "react";
import {
  Download,
  Loader2,
  RotateCcw,
  TrendingDown,
  TrendingUp,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  clearProgress,
  exportProgress,
  loadProgress,
  mergeProgress,
  readProgressFile,
  saveProgress,
  summarize,
  type Progress,
} from "@/lib/progress";

export function ProgressCard() {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  const handleImport = useCallback(async (file: File) => {
    setBusy(true);
    setError(null);
    setStatus(null);
    try {
      const imported = await readProgressFile(file);
      const merged = mergeProgress(loadProgress(), imported);
      saveProgress(merged);
      setProgress(merged);
      setStatus(`Loaded ${imported.records.length} past answers — you're picking up where you left off.`);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "That doesn't look like a coach progress file.",
      );
    } finally {
      setBusy(false);
    }
  }, []);

  const summary = progress ? summarize(progress) : null;
  const hasHistory = !!summary && summary.answered > 0;

  const scoreTrend =
    summary?.recentAverage != null && summary.earlierAverage != null
      ? summary.recentAverage - summary.earlierAverage
      : null;
  const fillerTrend =
    summary?.fillerRate != null && summary.earlierFillerRate != null
      ? summary.fillerRate - summary.earlierFillerRate
      : null;

  return (
    <section className="mt-6 rounded-3xl border border-border bg-card p-5 text-left shadow-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold text-foreground">Your progress</h2>
        <span className="text-sm text-muted-foreground">
          {hasHistory
            ? `${summary.answered} answers over ${summary.days} day${summary.days === 1 ? "" : "s"}`
            : "Kept on this device — never on our servers"}
        </span>
      </div>

      {hasHistory ? (
        <>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-secondary/60 p-4">
              <p className="text-xs tracking-wide text-muted-foreground uppercase">Average score</p>
              <p className="mt-1 font-display text-2xl font-semibold text-foreground">
                {summary.average?.toFixed(1)}/10
              </p>
              {scoreTrend != null ? (
                <p
                  className={`mt-1 flex items-center gap-1 text-xs ${
                    scoreTrend >= 0 ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {scoreTrend >= 0 ? (
                    <TrendingUp className="size-3.5" aria-hidden />
                  ) : (
                    <TrendingDown className="size-3.5" aria-hidden />
                  )}
                  {scoreTrend >= 0 ? "+" : ""}
                  {scoreTrend.toFixed(1)} vs your earlier answers
                </p>
              ) : null}
            </div>

            <div className="rounded-2xl bg-secondary/60 p-4">
              <p className="text-xs tracking-wide text-muted-foreground uppercase">Filler words</p>
              <p className="mt-1 font-display text-2xl font-semibold text-foreground">
                {summary.fillerRate?.toFixed(1)}%
              </p>
              {fillerTrend != null ? (
                <p
                  className={`mt-1 flex items-center gap-1 text-xs ${
                    fillerTrend <= 0 ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {fillerTrend <= 0 ? (
                    <TrendingDown className="size-3.5" aria-hidden />
                  ) : (
                    <TrendingUp className="size-3.5" aria-hidden />
                  )}
                  {fillerTrend > 0 ? "+" : ""}
                  {fillerTrend.toFixed(1)} pts vs earlier
                </p>
              ) : null}
            </div>

            <div className="rounded-2xl bg-secondary/60 p-4">
              <p className="text-xs tracking-wide text-muted-foreground uppercase">Weakest area</p>
              <p className="mt-1 text-base font-semibold text-foreground">
                {summary.weakest ? summary.weakest.category : "Not enough data yet"}
              </p>
              {summary.weakest ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  averaging {summary.weakest.average.toFixed(1)}/10
                </p>
              ) : null}
            </div>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            "Focus my weak spots" now uses this history, so returning sessions start where you left
            off. Export the file before clearing your browser data.
          </p>
        </>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">
          Your scores, categories, and filler-word habits are saved on this device as you practice.
          Export them to a file and import it on your next machine — nothing ever leaves your
          browser.
        </p>
      )}

      {status ? <p className="mt-3 text-sm text-primary">{status}</p> : null}
      {error ? <p className="mt-3 text-sm text-warm-foreground">{error}</p> : null}

      <div className="mt-4 flex flex-wrap gap-3">
        <Button
          type="button"
          variant="outline"
          className="rounded-full"
          disabled={!hasHistory}
          onClick={() => progress && exportProgress(progress)}
        >
          <Download className="size-4" aria-hidden />
          Export progress
        </Button>
        <Button
          type="button"
          variant="outline"
          className="rounded-full"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          {busy ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <Upload className="size-4" aria-hidden />
          )}
          Import progress file
        </Button>
        {hasHistory ? (
          <Button
            type="button"
            variant="ghost"
            className="rounded-full text-muted-foreground"
            onClick={() => {
              clearProgress();
              setProgress(loadProgress());
              setStatus("History cleared from this device.");
              setError(null);
            }}
          >
            <RotateCcw className="size-4" aria-hidden />
            Clear
          </Button>
        ) : null}
        <input
          ref={inputRef}
          type="file"
          accept="application/json,.json"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) void handleImport(file);
          }}
        />
      </div>
    </section>
  );
}
