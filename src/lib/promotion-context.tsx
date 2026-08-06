import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Promotion } from "@/lib/promotion";

const STORAGE_KEY = "mock-interview-promotion";

const defaultPromotion: Promotion = {
  isActive: false,
  currentRole: "",
  targetRole: "",
  companyContext: "",
  packetText: "",
};

type PromotionContextValue = {
  promotion: Promotion;
  setPromotion: (promotion: Promotion) => void;
  hydrated: boolean;
};

const PromotionContext = createContext<PromotionContextValue>({
  promotion: defaultPromotion,
  setPromotion: () => {},
  hydrated: false,
});

export function PromotionProvider({ children }: { children: ReactNode }) {
  const [promotion, setPromotionState] = useState<Promotion>(defaultPromotion);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) setPromotionState(JSON.parse(stored) as Promotion);
    } catch {
      /* ignore unreadable session storage */
    }
    setHydrated(true);
  }, []);

  const setPromotion = useCallback((next: Promotion) => {
    setPromotionState(next);
    try {
      if (next.isActive) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      else sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore unwritable session storage */
    }
  }, []);

  const value = useMemo(
    () => ({ promotion, setPromotion, hydrated }),
    [promotion, setPromotion, hydrated],
  );

  return <PromotionContext.Provider value={value}>{children}</PromotionContext.Provider>;
}

export function usePromotion() {
  return useContext(PromotionContext);
}
