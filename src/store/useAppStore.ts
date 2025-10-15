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
// antes: name: "reajusta-app"
const STORAGE_KEY_NEW = "mealshift-app";
const STORAGE_KEY_OLD = "reajusta-app";

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      hasCompletedOnboarding: false,
      currentUserId: null,
      isPro: false,
      setHasCompletedOnboarding: (value) =>
        set({ hasCompletedOnboarding: value }),
      setCurrentUserId: (id) => set({ currentUserId: id }),
      setIsPro: (value) => set({ isPro: value }),
    }),
    {
      name: STORAGE_KEY_NEW,
      // migra do storage antigo se existir
      migrate: async (persistedState: any, _version: number) => {
        try {
          const raw = localStorage.getItem(STORAGE_KEY_OLD);
          if (raw && !persistedState) {
            const old = JSON.parse(raw);
            // copie só os campos que realmente usamos
            return {
              hasCompletedOnboarding:
                old?.state?.hasCompletedOnboarding ?? false,
              currentUserId: old?.state?.currentUserId ?? null,
              isPro: old?.state?.isPro ?? false,
            };
          }
        } catch {}
        return persistedState;
      },
      partialize: (state) => ({
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        currentUserId: state.currentUserId,
        isPro: state.isPro,
      }),
      version: 1,
    }
  )
);
