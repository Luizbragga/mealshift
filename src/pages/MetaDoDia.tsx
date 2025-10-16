import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  db,
  getMealSlots,
  saveMealSlots,
  type MealSlot,
  type Meal,
} from "@/data/db";
import { distributeBySlots } from "@/lib/tdee";
import { hapticSuccess } from "@/lib/haptics";
import { ArrowRight } from "lucide-react";

/** Labels para UI */
const LABEL: Record<Meal, string> = {
  Breakfast: "Breakfast",
  Lunch: "Lunch",
  Snack: "Snack",
  Dinner: "Dinner",
};

/** Ordem base de refeições */
const ORDER: Meal[] = ["Breakfast", "Lunch", "Snack", "Dinner"];

export default function MetaDoDia() {
  const navigate = useNavigate();

  const [targetKcal, setTargetKcal] = useState(0);
  const [slots, setSlots] = useState<MealSlot[]>([]);
  const [count, setCount] = useState(4);

  useEffect(() => {
    void bootstrap();
  }, []);

  async function bootstrap() {
    const user = await db.users.toCollection().first();
    setTargetKcal(user?.kcalTarget ?? 0);

    const initial = await getMealSlots();
    setSlots(initial);
    setCount(Math.min(4, Math.max(2, initial.length || 4)));
  }

  const percents = useMemo(
    () => slots.map((s) => Math.round(s.percent * 100)),
    [slots]
  );
  const totalPercent = percents.reduce((a, b) => a + b, 0);
  const isValid = totalPercent === 100 && targetKcal > 0;

  function changeCount(nextCount: number) {
    const safe = Math.min(4, Math.max(2, nextCount));
    setCount(safe);

    const nextKeys = ORDER.slice(0, safe);
    const currentMap = new Map(slots.map((s) => [s.key, s.percent]));
    let nextSlots = nextKeys.map<MealSlot>((k) => ({
      key: k,
      percent: currentMap.get(k) ?? 1 / safe,
    }));

    const sum = nextSlots.reduce((a, b) => a + b.percent, 0);
    nextSlots = nextSlots.map((s) => ({ ...s, percent: s.percent / sum }));

    setSlots(nextSlots);
  }

  function updateSlot(idx: number, percentInt: number) {
    const next = [...slots];
    next[idx] = { ...next[idx], percent: percentInt / 100 };

    const sum = next.reduce((a, b) => a + b.percent, 0);
    if (sum > 0) {
      const edited = next[idx].percent;
      const rest = sum - edited;
      const targetRest = 1 - edited;
      next.forEach((s, i) => {
        if (i === idx) return;
        const ratio = rest > 0 ? s.percent / rest : 1 / (next.length - 1);
        s.percent = Math.max(0, ratio * targetRest);
      });
    }
    setSlots(next);
  }

  async function handleStart() {
    await saveMealSlots(slots);

    const today = new Date().toISOString().split("T")[0];
    const dist = distributeBySlots(targetKcal, slots);

    await db.plans.add({
      dayIso: today,
      breakfastKcal: dist.breakfastKcal,
      lunchKcal: dist.lunchKcal,
      snackKcal: dist.snackKcal,
      dinnerKcal: dist.dinnerKcal,
    });

    await hapticSuccess();
    navigate("/home");
  }

  return (
    <div className="min-h-screen bg-background p-6 flex flex-col safe-top pb-24">
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Your daily goal
          </h1>
          <div className="text-4xl font-bold text-primary">
            {targetKcal} kcal
          </div>
        </div>

        <div className="bg-card rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">Number of meals</span>
            <div className="flex items-center gap-2">
              {[2, 3, 4].map((n) => (
                <button
                  key={n}
                  onClick={() => changeCount(n)}
                  className={`h-9 px-3 rounded-md border text-sm ${
                    count === n
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 mb-6 space-y-6">
          {slots.map((s, i) => (
            <div key={s.key}>
              <div className="flex justify-between mb-2">
                <span className="font-medium">{LABEL[s.key]}</span>
                <span className="text-muted-foreground">
                  {Math.round(s.percent * 100)}% •{" "}
                  {Math.round(targetKcal * s.percent)} kcal
                </span>
              </div>
              <Slider
                value={[Math.round(s.percent * 100)]}
                onValueChange={([v]) => updateSlot(i, v)}
                min={0}
                max={100}
                step={5}
              />
            </div>
          ))}

          {totalPercent !== 100 && (
            <div className="text-sm text-destructive">
              Total must be 100% (current: {totalPercent}%)
            </div>
          )}
        </div>

        <Button
          onClick={handleStart}
          disabled={!isValid}
          className="w-full min-touch gradient-primary"
          size="lg"
        >
          Start my day
          <ArrowRight className="ml-2" size={20} />
        </Button>
      </div>
    </div>
  );
}
