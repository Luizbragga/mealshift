import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppState {
  hasCompletedOnboarding: boolean;
  currentUserId: number | null;
  isPro: boolean;
  setHasCompletedOnboarding: (value: boolean) => void;
  setCurrentUserId: (id: number | null) => void;
  setIsPro: (value: boolean) => void;
}

/**
 * Persist critical flags so the app feels "native" between sessions.
 * Only small, non-sensitive values are stored.
 */
export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      hasCompletedOnboarding: false,
      currentUserId: null,
      isPro: false,
      setHasCompletedOnboarding: (value) =>
        set({ hasCompletedOnboarding: value }),
      setCurrentUserId: (id) => set({ currentUserId: id }),
      setIsPro: (value) => set({ isPro: value }),
    }),
    {
      name: "reajusta-app", // localStorage key
      partialize: (state) => ({
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        currentUserId: state.currentUserId,
        isPro: state.isPro,
      }),
      version: 1,
    }
  )
);
