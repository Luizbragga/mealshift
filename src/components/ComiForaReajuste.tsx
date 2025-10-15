import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { db, Plan } from "@/data/db";
import { checkAndResetDailyCounter } from "@/data/db";
import { hapticSuccess, hapticError } from "@/lib/haptics";
import { AlertCircle } from "lucide-react";
import { Paywall } from "./Paywall";
import { useAppStore } from "@/store/useAppStore";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentPlan: Plan;
  totalConsumed: number;
}

type meal = "Breakfast" | "Lunch" | "Snack" | "Dinner";

export function ComiForaReajuste({
  open,
  onClose,
  onSuccess,
  currentPlan,
  totalConsumed,
}: Props) {
  const [kcalFora, setKcalFora] = useState("");
  const [preview, setPreview] = useState<{ meal: meal; nova_meta: number }[]>(
    []
  );
  const [showPaywall, setShowPaywall] = useState(false);
  const { isPro } = useAppStore();

  useEffect(() => {
    if (open) void checkLimit();
  }, [open]);

  const checkLimit = async () => {
    await checkAndResetDailyCounter();
    const settings = await db.settings.toCollection().first();

    if (!isPro && settings && settings.adjustmentsToday >= 1) {
      await hapticError();
      setShowPaywall(true);
    }
  };

  const calculatePreview = () => {
    if (!kcalFora) return;

    const withOutside = totalConsumed + parseInt(kcalFora);
    const dailyGoal =
      currentPlan.breakfastKcal +
      currentPlan.lunchKcal +
      currentPlan.snackKcal +
      currentPlan.dinnerKcal;
    const remaining = Math.max(0, dailyGoal - withOutside);

    // Determine remaining meals (simple heuristic with default times)
    const settings = {
      breakfastTime: "08:00",
      lunchTime: "12:30",
      snackTime: "16:00",
      dinnerTime: "19:30",
    };
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    const meals = [
      { name: "Breakfast" as meal, hora: settings.breakfastTime, percent: 0.2 },
      { name: "Lunch" as meal, hora: settings.lunchTime, percent: 0.35 },
      { name: "Snack" as meal, hora: settings.snackTime, percent: 0.15 },
      { name: "Dinner" as meal, hora: settings.dinnerTime, percent: 0.3 },
    ];

    const remainingMeals = meals.filter((m) => m.hora >= currentTime);

    if (remainingMeals.length === 0) {
      setPreview([]);
      return;
    }

    const totalPercent = remainingMeals.reduce((sum, m) => sum + m.percent, 0);

    const nextTargets = remainingMeals.map((meal) => ({
      meal: meal.name,
      nova_meta: Math.round(remaining * (meal.percent / totalPercent)),
    }));

    setPreview(nextTargets);
  };

  useEffect(() => {
    if (kcalFora) calculatePreview();
    else setPreview([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kcalFora]);

  const handleApply = async () => {
    if (showPaywall) return;

    const today = new Date().toISOString().split("T")[0];
    const planToUpdate = await db.plans.where("dayIso").equals(today).first();

    if (!planToUpdate || !planToUpdate.id) return;

    const updates: Partial<Plan> = {};
    preview.forEach((p) => {
      const key = `${p.meal.toLowerCase()}_kcal` as keyof Plan;
      (updates as any)[key] = p.nova_meta;
    });

    await db.plans.update(planToUpdate.id, updates);

    // Increment counter
    const settings = await db.settings.toCollection().first();
    if (settings && settings.id) {
      await db.settings.update(settings.id, {
        adjustmentsToday: settings.adjustmentsToday + 1,
      });
    }

    await hapticSuccess();
    onSuccess();
    onClose();
    setKcalFora("");
    setPreview([]);
  };

  if (showPaywall) {
    return (
      <Paywall
        open={showPaywall}
        onClose={() => {
          setShowPaywall(false);
          onClose();
        }}
      />
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Ate out</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>How many extra calories did you eat?</Label>
            <Input
              type="number"
              placeholder="e.g., 500"
              value={kcalFora}
              onChange={(e) => setKcalFora(e.target.value)}
            />
          </div>

          {preview.length > 0 && (
            <div className="bg-muted rounded-lg p-4 space-y-2">
              <p className="font-semibold text-sm mb-2">New targets:</p>
              {preview.map((p) => {
                const label = (
                  {
                    Breakfast: "Breakfast",
                    Lunch: "Lunch",
                    Snack: "Snack",
                    Dinner: "Dinner",
                  } as const
                )[p.meal];
                return (
                  <div key={p.meal} className="flex justify-between text-sm">
                    <span>{label}</span>
                    <span className="font-medium">{p.nova_meta} kcal</span>
                  </div>
                );
              })}
            </div>
          )}

          {totalConsumed + parseInt(kcalFora || "0") >
            currentPlan.breakfastKcal +
              currentPlan.lunchKcal +
              currentPlan.snackKcal +
              currentPlan.dinnerKcal +
              100 && (
            <div className="flex gap-2 p-3 bg-destructive/10 rounded-lg">
              <AlertCircle
                className="text-destructive flex-shrink-0"
                size={20}
              />
              <p className="text-sm text-destructive">
                You exceeded today’s goal. You can still apply the adjustment.
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleApply}
              disabled={!kcalFora || preview.length === 0}
              className="flex-1 gradient-primary"
            >
              Apply adjustment
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
