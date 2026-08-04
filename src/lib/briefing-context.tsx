import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { PreInterviewBriefing } from "@/lib/briefing";

const STORAGE_KEY = "mock-interview-briefing";
const QUEUE_KEY = "mock-interview-briefing-queue";

type Stored = { briefing: PreInterviewBriefing; signature: string };

type BriefingContextValue = {
  briefing: PreInterviewBriefing | null;
  signature: string | null;
  setBriefing: (briefing: PreInterviewBriefing | null, signature?: string) => void;
  queuedQuestions: string[];
  setQueuedQuestions: (questions: string[]) => void;
  hydrated: boolean;
};

const BriefingContext = createContext<BriefingContextValue>({
  briefing: null,
  signature: null,
  setBriefing: () => {},
  queuedQuestions: [],
  setQueuedQuestions: () => {},
  hydrated: false,
});

export function BriefingProvider({ children }: { children: ReactNode }) {
  const [stored, setStored] = useState<Stored | null>(null);
  const [queuedQuestions, setQueuedState] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) setStored(JSON.parse(raw) as Stored);
      const queue = sessionStorage.getItem(QUEUE_KEY);
      if (queue) setQueuedState(JSON.parse(queue) as string[]);
    } catch {
      /* ignore unreadable session storage */
    }
    setHydrated(true);
  }, []);

  const setBriefing = useCallback((next: PreInterviewBriefing | null, signature = "") => {
    const value = next ? { briefing: next, signature } : null;
    setStored(value);
    try {
      if (value) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
      else sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore unwritable session storage */
    }
  }, []);

  const setQueuedQuestions = useCallback((questions: string[]) => {
    setQueuedState(questions);
    try {
      if (questions.length) sessionStorage.setItem(QUEUE_KEY, JSON.stringify(questions));
      else sessionStorage.removeItem(QUEUE_KEY);
    } catch {
      /* ignore unwritable session storage */
    }
  }, []);

  const value = useMemo(
    () => ({
      briefing: stored?.briefing ?? null,
      signature: stored?.signature ?? null,
      setBriefing,
      queuedQuestions,
      setQueuedQuestions,
      hydrated,
    }),
    [stored, setBriefing, queuedQuestions, setQueuedQuestions, hydrated],
  );

  return <BriefingContext.Provider value={value}>{children}</BriefingContext.Provider>;
}

export function useBriefing() {
  return useContext(BriefingContext);
}

/** Cheap stable signature so a changed resume or posting invalidates a cached briefing. */
export function briefingSignature(a: unknown, b: unknown) {
  const raw = JSON.stringify([a, b]);
  let hash = 0;
  for (let index = 0; index < raw.length; index += 1) {
    hash = (hash * 31 + raw.charCodeAt(index)) | 0;
  }
  return String(hash);
}
