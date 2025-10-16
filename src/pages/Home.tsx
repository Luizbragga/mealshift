// src/pages/Home.tsx
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { db, type Plan, type Entry, type Meal } from "@/data/db";
import { BottomNav } from "@/components/BottomNav";
import { AdicionarAlimento } from "@/components/AdicionarAlimento";
import { ComiForaReajuste } from "@/components/ComiForaReajuste";
import { Plus, AlertCircle } from "lucide-react";
import { hapticMedium } from "@/lib/haptics";
import { getMealSlots, type MealSlot } from "@/data/db";

export default function Home() {
  // data
  const [plan, setPlan] = useState<Plan | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [slots, setSlots] = useState<MealSlot[]>([]); // dynamic UI source

  // UI state
  const [showAddFood, setShowAddFood] = useState(false);
  const [showAteOut, setShowAteOut] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<Meal>("Breakfast");

  // cache today's ISO once (avoid re-renders during the day)
  const todayISO = useMemo(() => new Date().toISOString().split("T")[0], []);

  /** Map Meal -> corresponding Plan kcal field */
  const mealToPlanField: Record<Meal, keyof Plan> = {
    Breakfast: "breakfastKcal",
    Lunch: "lunchKcal",
    Snack: "snackKcal",
    Dinner: "dinnerKcal",
  };

  /** Load plan, entries, and configured slots */
  const loadData = useCallback(async () => {
    const todayPlan = await db.plans.where("dayIso").equals(todayISO).first();
    setPlan(todayPlan ?? null);

    const todayEntries = await db.entries
      .where("dayIso")
      .equals(todayISO)
      .toArray();
    setEntries(todayEntries);

    // Keep only meals we actually support in Plan for now
    const s = await getMealSlots();
    const supported: Meal[] = ["Breakfast", "Lunch", "Snack", "Dinner"];
    setSlots(s.filter((sl) => supported.includes(sl.key)));
  }, [todayISO]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  /** Sum kcals for a given meal (bridge against Entry.meal) */
  const getConsumedByMeal = useCallback(
    (meal: Meal) =>
      entries
        .filter((e) => e.meal === meal)
        .reduce((sum, e) => sum + e.kcal, 0),
    [entries]
  );

  /** Header totals */
  const { totalGoal, totalConsumed, remaining } = useMemo(() => {
    const goal = plan
      ? plan.breakfastKcal + plan.lunchKcal + plan.snackKcal + plan.dinnerKcal
      : 0;
    const consumed = entries.reduce((sum, e) => sum + e.kcal, 0);
    return {
      totalGoal: goal,
      totalConsumed: consumed,
      remaining: goal - consumed,
    };
  }, [plan, entries]);

  /** Handlers */
  const openAddFood = async (meal: Meal) => {
    await hapticMedium();
    setSelectedMeal(meal);
    setShowAddFood(true);
  };

  const openAteOut = async () => {
    await hapticMedium();
    setShowAteOut(true);
  };

  /** Empty state when no plan exists yet */
  if (!plan) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center safe-top pb-24">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        </div>
        <div className="text-center">
          <p className="text-muted-foreground">
            No plan for today. Create your goal first.
          </p>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background safe-top pb-24">
      <div className="p-6">
        {/* Day summary */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-4">Today</h1>
          <div
            className={`rounded-lg p-4 ${
              remaining >= 0 ? "bg-primary/10" : "bg-destructive/10"
            }`}
          >
            <div className="text-sm text-muted-foreground mb-1">
              {remaining >= 0 ? "Remaining" : "Exceeded by"}
            </div>
            <div
              className={`text-3xl font-bold ${
                remaining >= 0 ? "text-primary" : "text-destructive"
              }`}
            >
              {Math.abs(remaining)} kcal
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {totalConsumed} / {totalGoal} kcal
            </div>
          </div>
        </div>

        {/* Primary actions */}
        <div className="flex gap-3 mb-6">
          <Button
            onClick={() => openAddFood("Breakfast")}
            variant="outline"
            className="flex-1 min-touch"
          >
            Add food
          </Button>
          <Button
            onClick={openAteOut}
            className="flex-1 min-touch gradient-primary"
          >
            Ate out
          </Button>
        </div>

        {/* Dynamic meal cards (slot.key → Plan field) */}
        <div className="space-y-3">
          {slots.map((slot) => {
            const meal = slot.key as Meal; // keep the union type
            const planKey = mealToPlanField[meal];
            const meta = plan[planKey] as number;
            const consumed = getConsumedByMeal(meal);
            const percentage =
              meta > 0 ? Math.min((consumed / meta) * 100, 100) : 0;

            return (
              <button
                key={slot.key}
                onClick={() => openAddFood(meal)}
                className="w-full bg-card rounded-lg p-4 text-left border border-border hover:border-primary transition-colors"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">{slot.key}</span>
                  <span className="text-sm text-muted-foreground">
                    {consumed} / {meta} kcal
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      consumed > meta ? "bg-destructive" : "bg-primary"
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* FAB (quick add; defaults to Breakfast for now) */}
      <button
        onClick={() => openAddFood("Breakfast")}
        className="fixed bottom-20 right-6 w-14 h-14 rounded-full gradient-primary flex items-center justify-center shadow-lg z-40"
        aria-label="Add food"
      >
        <Plus size={24} className="text-white" />
      </button>

      {/* Modals */}
      <AdicionarAlimento
        open={showAddFood}
        onClose={() => setShowAddFood(false)}
        onSuccess={loadData}
        defaultMeal={selectedMeal}
      />

      <ComiForaReajuste
        open={showAteOut}
        onClose={() => setShowAteOut(false)}
        onSuccess={loadData}
        currentPlan={plan}
        totalConsumed={totalConsumed}
      />

      <BottomNav />
    </div>
  );
}
