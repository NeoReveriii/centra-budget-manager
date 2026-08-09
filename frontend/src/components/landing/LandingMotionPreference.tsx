import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useReducedMotion } from "framer-motion";

const STORAGE_KEY = "centra-landing-motion";

interface LandingMotionPreferenceValue {
  reducedMotion: boolean;
  toggleReducedMotion: () => void;
}

const LandingMotionPreferenceContext = createContext<LandingMotionPreferenceValue | null>(null);

export function LandingMotionPreferenceProvider({ children }: { children: ReactNode }) {
  const systemReducedMotion = useReducedMotion();
  const [motionPreference, setMotionPreference] = useState<"system" | "reduced" | "full">(() => {
    if (typeof window === "undefined") {
      return "system";
    }

    const storedPreference = window.localStorage.getItem(STORAGE_KEY);
    return storedPreference === "reduced" || storedPreference === "full"
      ? storedPreference
      : "system";
  });

  const reducedMotion =
    motionPreference === "reduced" ||
    (motionPreference === "system" && Boolean(systemReducedMotion));

  const toggleReducedMotion = useCallback(() => {
    setMotionPreference(() => {
      const next = reducedMotion ? "full" : "reduced";
      window.localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, [reducedMotion]);

  const value = useMemo(
    () => ({ reducedMotion, toggleReducedMotion }),
    [reducedMotion, toggleReducedMotion],
  );

  return (
    <LandingMotionPreferenceContext.Provider value={value}>
      {children}
    </LandingMotionPreferenceContext.Provider>
  );
}

export function useLandingMotionPreference() {
  const context = useContext(LandingMotionPreferenceContext);

  if (!context) {
    throw new Error("useLandingMotionPreference must be used inside LandingMotionPreferenceProvider");
  }

  return context;
}

export function useLandingReducedMotion() {
  return useLandingMotionPreference().reducedMotion;
}
