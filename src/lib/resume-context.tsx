import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Resume } from "@/lib/resume";

const STORAGE_KEY = "mock-interview-resume";

type ResumeContextValue = {
  resume: Resume | null;
  setResume: (resume: Resume | null) => void;
  hydrated: boolean;
};

const ResumeContext = createContext<ResumeContextValue>({
  resume: null,
  setResume: () => {},
  hydrated: false,
});

export function ResumeProvider({ children }: { children: ReactNode }) {
  const [resume, setResumeState] = useState<Resume | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) setResumeState(JSON.parse(stored) as Resume);
    } catch {
      /* ignore unreadable session storage */
    }
    setHydrated(true);
  }, []);

  const setResume = useCallback((next: Resume | null) => {
    setResumeState(next);
    try {
      if (next) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      else sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore unwritable session storage */
    }
  }, []);

  const value = useMemo(() => ({ resume, setResume, hydrated }), [resume, setResume, hydrated]);

  return <ResumeContext.Provider value={value}>{children}</ResumeContext.Provider>;
}

export function useResume() {
  return useContext(ResumeContext);
}
