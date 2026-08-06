import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { JobBrief } from "@/lib/job-brief";

const STORAGE_KEY = "mock-interview-job-brief";

type JobBriefContextValue = {
  brief: JobBrief | null;
  setBrief: (brief: JobBrief | null) => void;
  hydrated: boolean;
};

const JobBriefContext = createContext<JobBriefContextValue>({
  brief: null,
  setBrief: () => {},
  hydrated: false,
});

export function JobBriefProvider({ children }: { children: ReactNode }) {
  const [brief, setBriefState] = useState<JobBrief | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) setBriefState(JSON.parse(stored) as JobBrief);
    } catch {
      /* ignore unreadable session storage */
    }
    setHydrated(true);
  }, []);

  const setBrief = useCallback((next: JobBrief | null) => {
    setBriefState(next);
    try {
      if (next) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      else sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore unwritable session storage */
    }
  }, []);

  const value = useMemo(() => ({ brief, setBrief, hydrated }), [brief, setBrief, hydrated]);

  return <JobBriefContext.Provider value={value}>{children}</JobBriefContext.Provider>;
}

export function useJobBrief() {
  return useContext(JobBriefContext);
}
