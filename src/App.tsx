import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAppStore } from "@/store/useAppStore";
import {
  db,
  seedFoods,
  initSettings,
  migrateFromReajustaIfNeeded,
} from "@/data/db";

// Pages
import Onboarding from "./pages/Onboarding";
import MetaDoDia from "./pages/MetaDoDia";
import Home from "./pages/Home";
import Historico from "./pages/Historico";
import Lembretes from "./pages/Lembretes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

export default function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const {
    hasCompletedOnboarding,
    setHasCompletedOnboarding,
    setCurrentUserId,
  } = useAppStore();

  useEffect(() => {
    (async () => {
      try {
        await migrateFromReajustaIfNeeded();
        await seedFoods();
        await initSettings();
        await seedFoods();
        await initSettings();

        const user = await db.users.toCollection().first();
        if (user?.id) {
          setHasCompletedOnboarding(true);
          setCurrentUserId(user.id);
        }
      } catch (e) {
        console.error("Initialization error:", e);
      } finally {
        setIsInitialized(true);
      }
    })();
  }, [setHasCompletedOnboarding, setCurrentUserId]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                hasCompletedOnboarding ? (
                  <Navigate to="/home" replace />
                ) : (
                  <Navigate to="/onboarding" replace />
                )
              }
            />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/meta" element={<MetaDoDia />} />
            <Route path="/home" element={<Home />} />
            <Route path="/historico" element={<Historico />} />
            <Route path="/lembretes" element={<Lembretes />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
