import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { db, type Plan, type Entry, type Meal } from "@/data/db";
import { hapticSuccess } from "@/lib/haptics";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentPlan: Plan;
  totalConsumed: number;
};

const SUGGESTIONS: { max: number; items: { name: string; kcal: number }[] }[] =
  [
    {
      max: 150,
      items: [
        { name: "Greek yogurt (plain, 100g)", kcal: 60 },
        { name: "Apple (medium)", kcal: 95 },
        { name: "Carrot sticks (150g)", kcal: 60 },
      ],
    },
    {
      max: 250,
      items: [
        { name: "Whole-wheat toast + peanut butter (thin)", kcal: 200 },
        { name: "Protein shake (water-based)", kcal: 180 },
        { name: "Cottage cheese (150g)", kcal: 190 },
      ],
    },
    {
      max: 400,
      items: [
        { name: "Chicken wrap (small)", kcal: 350 },
        { name: "Tuna salad (light dressing)", kcal: 300 },
        { name: "Omelette (2 eggs + veggies)", kcal: 280 },
      ],
    },
    {
      max: Number.POSITIVE_INFINITY,
      items: [
        { name: "Rice + beans + chicken (small plate)", kcal: 450 },
        { name: "Pasta + tomato sauce (small bowl)", kcal: 500 },
        { name: "Grilled steak + salad", kcal: 520 },
      ],
    },
  ];

const MEAL_LABEL: Record<Meal, string> = {
  Breakfast: "Breakfast",
  Lunch: "Lunch",
  Snack: "Snack",
  Dinner: "Dinner",
};

export function ComiForaReajuste({
  open,
  onClose,
  onSuccess,
  currentPlan,
  totalConsumed,
}: Props) {
  const [meal, setMeal] = useState<Meal>("Dinner");

  const [freeName, setFreeName] = useState("");
  const [freeKcal, setFreeKcal] = useState("");

  const { dailyGoal, remaining } = useMemo(() => {
    const g =
      currentPlan.breakfastKcal +
      currentPlan.lunchKcal +
      currentPlan.snackKcal +
      currentPlan.dinnerKcal;
    return { dailyGoal: g, remaining: g - totalConsumed };
  }, [currentPlan, totalConsumed]);

  const suggestedList = useMemo(() => {
    const band = SUGGESTIONS.find((b) => remaining <= b.max) ?? SUGGESTIONS[0];
    return band.items;
  }, [remaining]);

  async function addEntry(name: string, kcal: number) {
    const today = new Date().toISOString().split("T")[0];
    const entry: Entry = { dayIso: today, meal, name, kcal, origin: "text" };
    await db.entries.add(entry);
    await hapticSuccess();
    onSuccess();
    onClose();
  }

  function handleQuickPick(k: { name: string; kcal: number }) {
    void addEntry(k.name, k.kcal);
  }

  function handleAddManual() {
    if (!freeName || !freeKcal) return;
    const kcalInt = parseInt(freeKcal, 10);
    if (isNaN(kcalInt) || kcalInt <= 0) return;
    void addEntry(freeName, kcalInt);
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ate out</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div
            className={`rounded-lg p-3 ${
              remaining >= 0 ? "bg-primary/10" : "bg-destructive/10"
            }`}
          >
            <div className="text-sm text-muted-foreground">
              {remaining >= 0 ? "Remaining today" : "Exceeded by"}
            </div>
            <div
              className={`text-2xl font-bold ${
                remaining >= 0 ? "text-primary" : "text-destructive"
              }`}
            >
              {Math.abs(remaining)} kcal
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {totalConsumed} / {dailyGoal} kcal
            </div>
          </div>

          <div className="space-y-2">
            <Label>Meal to adjust</Label>
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(MEAL_LABEL) as Meal[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMeal(m)}
                  className={`h-10 rounded-md border text-sm ${
                    meal === m
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  {MEAL_LABEL[m]}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Quick options</Label>
            <div className="grid gap-2">
              {suggestedList.map((s, i) => (
                <button
                  key={`${s.name}-${i}`}
                  onClick={() => handleQuickPick(s)}
                  className="w-full text-left p-3 rounded-lg border border-border hover:border-primary transition-colors"
                >
                  <div className="font-medium">{s.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {s.kcal} kcal
                  </div>
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              These are generic ideas based on your remaining calories. You can
              add anything you actually had below.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Or log what you had</Label>
            <Input
              placeholder="e.g., Cheeseburger"
              value={freeName}
              onChange={(e) => setFreeName(e.target.value)}
            />
            <Input
              type="number"
              placeholder="kcal (e.g., 520)"
              value={freeKcal}
              onChange={(e) => setFreeKcal(e.target.value)}
            />
            <Button onClick={handleAddManual} className="w-full">
              Add entry
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
