import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { db, getMealSlots, saveMealSlots, type MealSlot } from "@/data/db";
import { distributeBySlots } from "@/lib/tdee";
import { hapticSuccess } from "@/lib/haptics";
import { ArrowRight } from "lucide-react";

/** Label map for readability in UI */
const LABEL: Record<MealSlot["key"], string> = {
  Breakfast: "Breakfast",
  Lunch: "Lunch",
  Snack: "Snack",
  Dinner: "Dinner",
};

/** Allowed sequences by count (2 → Breakfast+Dinner, 3 → B/L/D, 4 → all) */
const ORDER: MealSlot["key"][] = ["Breakfast", "Lunch", "Snack", "Dinner"];

export default function MetaDoDia() {
  const navigate = useNavigate();

  // user target kcal
  const [targetKcal, setTargetKcal] = useState(0);
  // meal slots as fractions (0..1)
  const [slots, setSlots] = useState<MealSlot[]>([]);
  // desired count between 2 and 4
  const [count, setCount] = useState(4);

  useEffect(() => {
    void bootstrap();
  }, []);

  async function bootstrap() {
    // load kcal target
    const user = await db.users.toCollection().first();
    setTargetKcal(user?.kcalTarget ?? 0);

    // load slots from settings
    const initial = await getMealSlots();
    setSlots(initial);
    setCount(Math.min(4, Math.max(2, initial.length || 4)));
  }

  // UI: percentage integers
  const percents = useMemo(
    () => slots.map((s) => Math.round(s.percent * 100)),
    [slots]
  );
  const totalPercent = percents.reduce((a, b) => a + b, 0);
  const isValid = totalPercent === 100 && targetKcal > 0;

  /** Change total count, keeping order and rebalancing evenly */
  function changeCount(nextCount: number) {
    const safe = Math.min(4, Math.max(2, nextCount));
    setCount(safe);

    const nextKeys = ORDER.slice(0, safe);
    // keep existing percents when possible
    const currentMap = new Map(slots.map((s) => [s.key, s.percent]));
    let nextSlots = nextKeys.map<MealSlot>((k) => ({
      key: k,
      percent: currentMap.get(k) ?? 1 / safe,
    }));

    // normalize to 1
    const sum = nextSlots.reduce((a, b) => a + b.percent, 0);
    nextSlots = nextSlots.map((s) => ({ ...s, percent: s.percent / sum }));

    setSlots(nextSlots);
  }

  /** Update a single slot (percent as integer 0..100 from slider) */
  function updateSlot(idx: number, percentInt: number) {
    const next = [...slots];
    next[idx] = { ...next[idx], percent: percentInt / 100 };

    // normalize total to 1 (keeps last edited value, rescales the others)
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

  /** Persist slots and create today's plan */
  async function handleStart() {
    // persist user preference (slots) for future days
    await saveMealSlots(slots);

    // compute today's distribution and save plan
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

        {/* Meal count selector */}
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

        {/* Dynamic sliders */}
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

        {/* Static macro tip (MVP) */}
        <div className="bg-muted rounded-lg p-4 mb-6">
          <p className="text-sm text-muted-foreground mb-2">
            Suggested macros:
          </p>
          <div className="flex gap-4 text-sm">
            <div>
              <span className="font-medium">Protein:</span> 30%
            </div>
            <div>
              <span className="font-medium">Carbs:</span> 35%
            </div>
            <div>
              <span className="font-medium">Fat:</span> 35%
            </div>
          </div>
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
