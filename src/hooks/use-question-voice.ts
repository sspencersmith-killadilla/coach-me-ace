import { useCallback, useEffect, useRef, useState } from "react";

const MUTE_KEY = "coach-voice-muted";

export type Tone = "warm" | "tough" | "manager" | "hr" | "peer";

/**
 * Plays interview questions aloud through the AI voice, with a persisted mute
 * toggle. Audio is cached per question+tone so replays are instant.
 */
export function useQuestionVoice(tone: Tone) {
  const [muted, setMuted] = useState(true);
  const [ready, setReady] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cacheRef = useRef(new Map<string, string>());
  const requestRef = useRef(0);

  useEffect(() => {
    const stored = window.localStorage.getItem(MUTE_KEY);
    if (stored === "false") setMuted(false);
    setReady(true);
  }, []);

  const stop = useCallback(() => {
    requestRef.current += 1;
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setSpeaking(false);
    setLoading(false);
  }, []);

  const speak = useCallback(
    async (text: string) => {
      if (!text.trim()) return;
      stop();
      const token = requestRef.current;
      setError(null);
      setLoading(true);

      const cacheKey = `${tone}::${text}`;
      try {
        let url = cacheRef.current.get(cacheKey);
        if (!url) {
          const response = await fetch("/api/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, tone }),
          });
          if (!response.ok) {
            const detail = (await response.json().catch(() => null)) as { error?: string } | null;
            throw new Error(detail?.error ?? "Couldn't read that question aloud.");
          }
          url = URL.createObjectURL(await response.blob());
          cacheRef.current.set(cacheKey, url);
        }
        if (token !== requestRef.current) return;

        const audio = audioRef.current ?? new Audio();
        audioRef.current = audio;
        audio.src = url;
        audio.onended = () => setSpeaking(false);
        audio.onerror = () => setSpeaking(false);
        setLoading(false);
        setSpeaking(true);
        await audio.play();
      } catch (caught) {
        if (token !== requestRef.current) return;
        setLoading(false);
        setSpeaking(false);
        setError(caught instanceof Error ? caught.message : "Couldn't read that question aloud.");
      }
    },
    [tone, stop],
  );

  const toggleMute = useCallback(() => {
    setMuted((previous) => {
      const next = !previous;
      window.localStorage.setItem(MUTE_KEY, String(next));
      if (next) stop();
      return next;
    });
  }, [stop]);

  useEffect(() => {
    const cache = cacheRef.current;
    return () => {
      for (const url of cache.values()) URL.revokeObjectURL(url);
      cache.clear();
    };
  }, []);

  return { muted, ready, speaking, loading, error, speak, stop, toggleMute };
}
