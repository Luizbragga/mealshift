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

const STORAGE_KEY_OLD = "reajusta-app";
const STORAGE_KEY_NEW = "mealshift-app";

// migração de chave localStorage (one-shot)
(function migrateStoreKey() {
  try {
    if (localStorage.getItem(STORAGE_KEY_NEW)) return;
    const old = localStorage.getItem(STORAGE_KEY_OLD);
    if (old) {
      localStorage.setItem(STORAGE_KEY_NEW, old);
      localStorage.removeItem(STORAGE_KEY_OLD);
    }
  } catch {}
})();

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
      name: STORAGE_KEY_NEW,
      partialize: (state) => ({
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        currentUserId: state.currentUserId,
        isPro: state.isPro,
      }),
      version: 1,
    }
  )
);
